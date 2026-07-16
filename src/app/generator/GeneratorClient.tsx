"use client";

import { useState } from "react";
import Link from "next/link";
import { LORAS } from "@/lib/loras";

interface Generation {
  id: string;
  prompt: string;
  loraId: string;
  loraName: string | null;
  imageUrl: string;
  createdAt: string;
}

interface Props {
  isPro: boolean;
  initialGenerations: Generation[];
}

export default function GeneratorClient({ isPro, initialGenerations }: Props) {
  const [selectedLora, setSelectedLora] = useState<string>(LORAS[0].id);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [steps, setSteps] = useState(28);
  const [generating, setGenerating] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>(initialGenerations);
  const [error, setError] = useState<string | null>(null);

  const selected = LORAS.find((l) => l.id === selectedLora);

  async function handleGenerate() {
    if (!prompt.trim() || !selectedLora) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          loraId: selectedLora,
          steps,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "pro_required") {
          setError("This LoRA requires a Pro subscription. Upgrade to unlock premium styles.");
        } else {
          setError(data.error ?? "Generation failed");
        }
        return;
      }

      setGenerations((prev) => [
        {
          id: data.generationId,
          prompt: prompt.trim(),
          loraId: selectedLora,
          loraName: selected?.name ?? null,
          imageUrl: data.imageUrl,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Generator</h1>
          <p className="text-sm text-muted">
            {isPro ? (
              <span className="text-accent-light">Pro — full access</span>
            ) : (
              "Free tier — upgrade for premium LoRAs"
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        {/* LoRA Picker */}
        <div>
          <h2 className="mb-4 text-sm font-semibold text-muted">Choose a Style</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LORAS.map((lora) => {
              const locked = lora.tier === "pro" && !isPro;
              const active = lora.id === selectedLora;

              return (
                <button
                  key={lora.id}
                  onClick={() => setSelectedLora(lora.id)}
                  className={`group relative overflow-hidden rounded-xl border text-left transition ${
                    active
                      ? "border-accent ring-1 ring-accent"
                      : "border-border hover:border-accent/40"
                  }`}
                >
                  <div className="aspect-video w-full overflow-hidden bg-surface-light">
                    <img
                      src={lora.previewUrl}
                      alt={lora.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{lora.name}</span>
                      {locked && (
                        <span className="text-xs text-amber-400">&#128274;</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted">{lora.baseModel.toUpperCase()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt + Controls */}
        <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
          {selected && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="font-semibold text-foreground">{selected.name}</span>
              <span className="rounded bg-surface-light px-1.5 py-0.5 font-mono text-[10px] uppercase">
                {selected.baseModel}
              </span>
              {selected.triggerWord && (
                <span className="font-mono text-accent-light">#{selected.triggerWord}</span>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="A majestic dragon flying over a futuristic city at sunset..."
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder-muted outline-none transition focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Negative Prompt</label>
            <input
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="blurry, low quality, distorted..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none transition focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
              <span>Steps</span>
              <span className="font-mono text-foreground">{steps}</span>
            </label>
            <input
              type="range"
              min={10}
              max={40}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
              {error}
              {error.includes("Pro") && (
                <Link href="/pricing" className="ml-2 underline hover:text-amber-300">
                  View Pricing
                </Link>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="w-full rounded-full bg-accent py-3 text-sm font-medium text-white transition hover:bg-accent/80 disabled:opacity-50"
          >
            {generating ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating...
              </span>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>

      {/* Gallery */}
      {generations.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-lg font-semibold">Gallery</h2>
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
        </section>
      )}
    </div>
  );
}
