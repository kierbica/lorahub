import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isPro, getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import LogoutButton from "./LogoutButton";
import PortalButton from "../pricing/PortalButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const userIsPro = isPro(user);

  const generations = await prisma.generation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusLabel: Record<string, string> = {
    active: "Active",
    on_trial: "On Trial",
    paused: "Paused",
    past_due: "Past Due",
    cancelled: "Cancelled",
    expired: "Expired",
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

      {/* Subscription Card */}
      <div className="mb-8 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Subscription</h2>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted">
              <span
                className={
                  userIsPro
                    ? "rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-accent-light"
                    : "rounded-full bg-surface-light px-2.5 py-0.5 text-xs font-bold text-muted"
                }
              >
                {userIsPro ? "PRO" : "FREE"}
              </span>
              {user.subscriptionStatus && (
                <span>{statusLabel[user.subscriptionStatus] ?? user.subscriptionStatus}</span>
              )}
              {user.subscriptionEndsAt && (
                <span>
                  {user.subscriptionStatus === "cancelled" || user.subscriptionStatus === "expired"
                    ? "Expired"
                    : "Renews"}{" "}
                  {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {userIsPro ? (
              <PortalButton />
            ) : (
              <Link
                href="/pricing"
                className="rounded-full bg-accent px-6 py-2 text-sm font-medium text-white transition hover:bg-accent/80"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Generations */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Generation History</h2>
        {generations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="mb-4 text-sm text-muted">No generations yet.</p>
            <Link
              href="/generator"
              className="inline-block rounded-full bg-accent px-6 py-2 text-sm font-medium text-white transition hover:bg-accent/80"
            >
              Start Generating
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {generations.map((g) => (
              <div
                key={g.id}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-accent/40"
              >
                <div className="aspect-square w-full overflow-hidden bg-surface-light">
                  <img
                    src={g.imageUrl}
                    alt={g.prompt}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-xs text-muted">{g.prompt}</p>
                  <p className="mt-1 text-[10px] text-muted">
                    {g.loraName} &middot; {new Date(g.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="mt-12 border-t border-border pt-6">
        <LogoutButton />
      </div>
    </div>
  );
}
