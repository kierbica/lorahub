import { getCurrentUser, isPro } from "@/lib/session";
import { prisma } from "@/lib/db";
import GeneratorClient from "./GeneratorClient";

export const dynamic = "force-dynamic";

export default async function GeneratorPage() {
  const user = await getCurrentUser();
  const userIsPro = isPro(user);

  // Fetch recent generations for this user
  const generations = user
    ? await prisma.generation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <GeneratorClient
      isPro={userIsPro}
      initialGenerations={generations.map((g) => ({
        id: g.id,
        prompt: g.prompt,
        loraId: g.loraId,
        loraName: g.loraName,
        imageUrl: g.imageUrl,
        createdAt: g.createdAt.toISOString(),
      }))}
    />
  );
}
