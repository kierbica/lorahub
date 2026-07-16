import Replicate from "replicate";
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

function generateMockSvg(prompt: string, lora: Lora): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1b4b"/>
      <stop offset="100%" style="stop-color:#312e81"/>
    </linearGradient>
  </defs>
  <rect width="768" height="768" fill="url(#bg)" rx="12"/>
  <text x="384" y="300" text-anchor="middle" fill="#a78bfa" font-family="monospace" font-size="24" font-weight="bold">[ MOCK GENERATION ]</text>
  <text x="384" y="380" text-anchor="middle" fill="#c4b5fd" font-family="monospace" font-size="14">LoRA: ${escapeXml(lora.name)} (${lora.baseModel})</text>
  <text x="384" y="420" text-anchor="middle" fill="#818cf8" font-family="monospace" font-size="11" opacity="0.8">${escapeXml(lora.triggerWord ?? "")}</text>
  <rect x="184" y="460" width="400" height="1" fill="#4f46e5" opacity="0.3"/>
  <text x="384" y="500" text-anchor="middle" fill="#a5b4fc" font-family="sans-serif" font-size="13" opacity="0.9">"${escapeXml(truncate(prompt, 80))}"</text>
  <text x="384" y="580" text-anchor="middle" fill="#6366f1" font-family="monospace" font-size="11" opacity="0.5">Set REPLICATE_API_TOKEN for real generation</text>
  <text x="384" y="620" text-anchor="middle" fill="#6366f1" font-family="monospace" font-size="11" opacity="0.5">Using Flux dev + LoRA adapter</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "..." : s;
}

export async function generateImage(
  input: GenerateInput
): Promise<{ imageUrl: string }> {
  const lora = getLora(input.loraId);
  if (!lora) throw new Error(`LoRA not found: ${input.loraId}`);

  if (lora.tier === "pro" && !input.isPro) {
    throw new ProRequiredError();
  }

  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return { imageUrl: generateMockSvg(input.prompt, lora) };
  }

  const replicate = new Replicate({ auth: token });

  const output = await replicate.run("black-forest-labs/flux-dev" as `${string}/${string}`, {
    input: {
      prompt: input.prompt,
      negative_prompt: input.negativePrompt ?? "",
      num_inference_steps: input.steps ?? 28,
      guidance: 3.5,
      lora_weights: lora.weightsUrl,
      lora_scale: 0.8,
      output_format: "png",
      width: 1024,
      height: 1024,
    },
  });

  // output is an array of URLs or a single URL
  const imageUrl = Array.isArray(output) ? String(output[0]) : String(output);
  return { imageUrl };
}
