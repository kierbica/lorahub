import Link from "next/link";
import { getCurrentUser, isPro } from "@/lib/session";
import CheckoutButton from "./CheckoutButton";
import PortalButton from "./PortalButton";

const freeFeatures = [
  "3 curated LoRAs",
  "Up to 20 generations/day",
  "1024x1024 resolution",
  "Community support",
];

const proFeatures = [
  "All 6+ LoRAs (and growing)",
  "Unlimited generations",
  "1024x1024+ resolution",
  "Priority generation queue",
  "New LoRAs added monthly",
  "Cancel anytime",
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  const userIsPro = isPro(user);

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="text-muted">Start free. Upgrade when you need more styles.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="mb-1 text-lg font-bold">Free</h2>
          <p className="mb-6 text-sm text-muted">Try LoRAs with no commitment</p>
          <div className="mb-6 text-4xl font-bold">$0</div>
          <ul className="mb-8 space-y-3 text-sm">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-muted">
                <span className="mt-0.5 text-green-400">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/generator"
            className="block rounded-full border border-border py-2.5 text-center text-sm font-medium transition hover:bg-surface-light"
          >
            Get Started
          </Link>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border-2 border-accent bg-surface p-8">
          <div className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-white">
            POPULAR
          </div>
          <h2 className="mb-1 text-lg font-bold">Pro</h2>
          <p className="mb-6 text-sm text-muted">Unlock every style</p>
          <div className="mb-6 text-4xl font-bold">
            {process.env.LEMONSQUEEZY_PRO_PRICE_LABEL ?? "$12"}
            <span className="text-sm font-normal text-muted">/month</span>
          </div>
          <ul className="mb-8 space-y-3 text-sm">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-muted">
                <span className="mt-0.5 text-accent-light">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>

          {userIsPro ? (
            <div className="space-y-2">
              <div className="rounded-full bg-accent/20 py-2.5 text-center text-sm font-medium text-accent-light">
                You&apos;re on Pro
              </div>
              <PortalButton />
            </div>
          ) : user ? (
            <CheckoutButton />
          ) : (
            <Link
              href="/login?next=/pricing"
              className="block rounded-full bg-accent py-2.5 text-center text-sm font-medium text-white transition hover:bg-accent/80"
            >
              Sign in to Upgrade
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
