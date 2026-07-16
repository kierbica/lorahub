export type Tier = "free" | "pro";

export interface Lora {
  id: string;
  name: string;
  description: string;
  baseModel: "flux" | "sdxl";
  tier: Tier;
  triggerWord?: string;
  weightsUrl: string;
  previewUrl: string;
}

export const LORAS: Lora[] = [
  {
    id: "pixel-art",
    name: "Pixel Art Style",
    description: "Retro pixel art aesthetic for any subject. Great for game assets and nostalgic scenes.",
    baseModel: "flux",
    tier: "free",
    triggerWord: "pxart",
    weightsUrl: "https://civitai.com/api/download/models/101055",
    previewUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
  },
  {
    id: "watercolor",
    name: "Watercolor Dreams",
    description: "Soft watercolor painting style with flowing colors and organic textures.",
    baseModel: "flux",
    tier: "free",
    triggerWord: "wcolor",
    weightsUrl: "https://civitai.com/api/download/models/120586",
    previewUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop",
  },
  {
    id: "flat-design",
    name: "Flat Design Icons",
    description: "Clean, modern flat design style perfect for UI icons and illustrations.",
    baseModel: "flux",
    tier: "free",
    triggerWord: "flatd",
    weightsUrl: "https://civitai.com/api/download/models/117579",
    previewUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop",
  },
  {
    id: "anime-diffusion",
    name: "Anime Pro",
    description: "High-quality anime style with vivid colors, clean lines, and expressive characters.",
    baseModel: "flux",
    tier: "pro",
    triggerWord: "animepro",
    weightsUrl: "https://civitai.com/api/download/models/100885",
    previewUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk 2077",
    description: "Neon-soaked cyberpunk aesthetic with dramatic lighting and futuristic elements.",
    baseModel: "flux",
    tier: "pro",
    triggerWord: "cyber2077",
    weightsUrl: "https://civitai.com/api/download/models/118112",
    previewUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&h=400&fit=crop",
  },
  {
    id: "oil-painting",
    name: "Renaissance Oil",
    description: "Classical oil painting style reminiscent of Renaissance masters. Rich textures and depth.",
    baseModel: "flux",
    tier: "pro",
    triggerWord: "renoil",
    weightsUrl: "https://civitai.com/api/download/models/108217",
    previewUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop",
  },
];

export function getLora(id: string): Lora | undefined {
  return LORAS.find((l) => l.id === id);
}
