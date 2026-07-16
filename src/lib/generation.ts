import { getLora, type Lora } from "@/lib/loras";

export interface GenerateInput {
  prompt: string;
  negativePrompt?: string;
  loraId: string;
  steps?: number;
  isPro: boolean;
}

export class ProRequiredError extends Error {
  constructor() {
    super("Pro subscription required");
    this.name = "ProRequiredError";
  }
}

/* ------------------------------------------------------------------ */
/*  Pollinations.ai — free Flux API, no key required                   */
/*  image.pollinations.ai/prompt/{prompt}?model=flux&...                */
/*  Returns a JPEG image directly (no auth needed).                    */
/* ------------------------------------------------------------------ */

function pollinationsGenerate(
  prompt: string,
  lora: Lora,
  seed?: number
): string {
  // Free APIs can't inject LoRA weights, so we prepend the trigger word
  // to bias the Flux model toward the desired style.
  const styledPrompt = lora.triggerWord
    ? `${lora.triggerWord}, ${prompt}`
    : prompt;

  const params = new URLSearchParams({
    model: "flux",
    width: "1024",
    height: "1024",
    seed: String(seed ?? Math.floor(Math.random() * 999999)),
    nologo: "true",
  });

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(styledPrompt)}?${params}`;
}

/* ------------------------------------------------------------------ */
/*  Replicate — paid Flux + LoRA adapter (when token is provided)      */
/* ------------------------------------------------------------------ */

async function replicateGenerate(
  prompt: string,
  lora: Lora,
  negativePrompt?: string,
  steps?: number
): Promise<string> {
  // Dynamic import so the Replicate SDK is only loaded when actually needed
  const { default: Replicate } = await import("replicate");
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

  const output = await replicate.run(
    "black-forest-labs/flux-dev" as `${string}/${string}`,
    {
      input: {
        prompt,
        negative_prompt: negativePrompt ?? "",
        num_inference_steps: steps ?? 28,
        guidance: 3.5,
        lora_weights: lora.weightsUrl,
        lora_scale: 0.8,
        output_format: "png",
        width: 1024,
        height: 1024,
      },
    }
  );

  return Array.isArray(output) ? String(output[0]) : String(output);
}

/* ------------------------------------------------------------------ */
/*  Public entry point                                                 */
/* ------------------------------------------------------------------ */

export async function generateImage(
  input: GenerateInput
): Promise<{ imageUrl: string }> {
  const lora = getLora(input.loraId);
  if (!lora) throw new Error(`LoRA not found: ${input.loraId}`);

  if (lora.tier === "pro" && !input.isPro) {
    throw new ProRequiredError();
  }

  const token = process.env.REPLICATE_API_TOKEN;

  if (token) {
    // Replicate: real Flux + LoRA adapter
    const imageUrl = await replicateGenerate(
      input.prompt,
      lora,
      input.negativePrompt,
      input.steps
    );
    return { imageUrl };
  }

  // Pollinations.ai: free Flux, prompt-based style emulation
  const imageUrl = pollinationsGenerate(input.prompt, lora);
  return { imageUrl };
}
