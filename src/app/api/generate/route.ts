import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isPro } from "@/lib/session";
import { generateImage, ProRequiredError } from "@/lib/generation";
import { getLora } from "@/lib/loras";
import { prisma } from "@/lib/db";

const schema = z.object({
  prompt: z.string().min(1).max(2000),
  negativePrompt: z.string().max(1000).optional(),
  loraId: z.string().min(1).max(100),
  steps: z.number().int().min(1).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { prompt, negativePrompt, loraId, steps } = parsed.data;
    const userIsPro = isPro(user);

    const { imageUrl } = await generateImage({
      prompt,
      negativePrompt,
      loraId,
      steps,
      isPro: userIsPro,
    });

    // Save generation to DB
    const lora = getLora(loraId);

    const generation = await prisma.generation.create({
      data: {
        userId: user.id,
        prompt,
        negativePrompt: negativePrompt ?? null,
        loraId,
        loraName: lora?.name ?? null,
        steps: steps ?? null,
        imageUrl,
      },
    });

    return NextResponse.json({ imageUrl, generationId: generation.id });
  } catch (error) {
    if (error instanceof ProRequiredError) {
      return NextResponse.json(
        { error: "pro_required", message: "Pro subscription required for this LoRA" },
        { status: 402 }
      );
    }
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
