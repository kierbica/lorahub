import Link from "next/link";
import { LORAS } from "@/lib/loras";

const features = [
  {
    title: "Curated LoRAs",
    description: "Hand-picked SDXL & Flux LoRAs for every style — anime, cyberpunk, watercolor, and more.",
  },
  {
    title: "Free + Pro Tiers",
    description: "Start generating for free. Upgrade to Pro for premium styles and unlimited access.",
  },
  {
    title: "Instant Generation",
    description: "Powered by Flux — state-of-the-art text-to-image with LoRA adapter support.",
  },
  {
    title: "Your Gallery",
    description: "All your generations saved in one place. Browse, revisit, and share your creations.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="flex flex-col items-center py-24 text-center">
        <div className="mb-4 rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-medium text-accent-light">
          Powered by Flux + SDXL LoRAs
        </div>
        <h1 className="mb-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Create stunning images
          <br />
          <span className="text-accent">with curated LoRAs</span>
        </h1>
        <p className="mb-10 max-w-xl text-lg text-muted">
          Generate images in dozens of styles — from pixel art to Renaissance oil painting — using
          fine-tuned LoRA adapters on top of Flux.
        </p>
        <div className="flex gap-4">
          <Link
            href="/generator"
            className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition hover:bg-accent/80"
          >
            Start Creating
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-border px-8 py-3 text-sm font-medium text-foreground transition hover:bg-surface"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 gap-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border bg-surface p-6 transition hover:border-accent/40"
          >
            <h3 className="mb-2 text-sm font-semibold">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{f.description}</p>
          </div>
        ))}
      </section>

      {/* Featured LoRAs */}
      <section className="py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Featured LoRAs</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LORAS.map((lora) => (
            <div
              key={lora.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface transition hover:border-accent/40"
            >
              <div className="aspect-video w-full overflow-hidden bg-surface-light">
                <img
                  src={lora.previewUrl}
                  alt={lora.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{lora.name}</h3>
                  <span
                    className={
                      lora.tier === "pro"
                        ? "rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400"
                        : "rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-bold text-green-400"
                    }
                  >
                    {lora.tier === "pro" ? "PRO" : "FREE"}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted">{lora.description}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted">
                  <span className="rounded bg-surface-light px-1.5 py-0.5 font-mono uppercase">
                    {lora.baseModel}
                  </span>
                  {lora.triggerWord && (
                    <span className="font-mono text-accent-light">#{lora.triggerWord}</span>
                  )}
                </div>
              </div>
              {lora.tier === "pro" && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 transition group-hover:opacity-100" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">Ready to create?</h2>
        <p className="mb-8 text-muted">Start with free LoRAs. Upgrade anytime.</p>
        <Link
          href="/generator"
          className="inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition hover:bg-accent/80"
        >
          Open Generator
        </Link>
      </section>
    </div>
  );
}
