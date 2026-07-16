# LoraHub

AI image-generation tool using curated **SDXL / Flux LoRAs**, with a Free tier and a **Pro** subscription via **Lemon Squeezy**.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma + Postgres**.

---

## Features

- Generate images from text prompts using LoRA adapters on top of Flux
- 6 curated LoRAs (3 free, 3 Pro-gated)
- Free vs Pro tiers enforced server-side
- Lemon Squeezy checkout + webhook-driven subscription status
- Per-user generation gallery
- Works with **no API keys** (returns styled placeholder images) — add keys for live generation & payments

---

## Local development

```bash
npm install
cp .env.example .env          # fill in values
npx prisma db push            # create tables (needs DATABASE_URL pointing to Postgres)
npm run dev                   # http://localhost:3000
```

> **Database:** uses **Postgres** via `DATABASE_URL` (universal — works on any host).
> For quick local dev you can run Postgres with Docker:
> `docker run --rm -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`
> then set `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lorahub"`.

Login is **dev-mode email login** (any email works). Add GitHub OAuth by setting
`GITHUB_ID` / `GITHUB_SECRET`.

---

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string |
| `SESSION_SECRET` | ✅ | JWT signing secret (use a long random string) |
| `REPLICATE_API_TOKEN` | optional | Real image generation via Flux. Without it, mock SVG images are returned |
| `LEMONSQUEEZY_API_KEY` | optional* | Create checkout + customer portal |
| `LEMONSQUEEZY_STORE_ID` | optional* | Your LS store id |
| `LEMONSQUEEZY_SIGNING_SECRET` | optional* | Webhook signature verification |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | optional* | Pro plan variant id |
| `LEMONSQUEEZY_PRO_PRICE_LABEL` | optional | Shown on pricing page (default `$12/mo`) |
| `APP_URL` | optional | Used in checkout redirect (default `http://localhost:3000`) |

\* Required only if you want real payments.

---

## Deploy anywhere (universal)

This app has **no platform lock-in**. It needs only: a Node host + a Postgres database.

### 1. Database (any provider)
Create a Postgres database and get its URL:
- **Vercel Postgres**, **Neon**, **Supabase**, **Railway**, **Render**, **Fly.io**, or self-hosted.
- Set `DATABASE_URL` in the platform's env vars.

### 2. Apply the schema
Run once after the DB is reachable:
```bash
npx prisma db push
```
Most platforms let you set this as a **release / post-deploy command**.

### 3. Build & run
```bash
npm install
npm run build
npm run start
```

### Platform-specific notes
- **Vercel:** import the repo → framework = Next.js (auto). Set env vars. Add `prisma db push` as a deploy hook or run it locally against the Vercel Postgres URL.
- **Railway / Render / Fly:** set `DATABASE_URL` + other env vars, set build = `npm run build`, start = `npm run start`, release = `npx prisma db push`.
- **Docker:** `node:20` base, copy files, `npm ci && npm run build`, expose `PORT` (Next reads it automatically).

---

## Lemon Squeezy webhook

Point a webhook at `/api/lemonsqueezy/webhook` with events:
`subscription_created`, `subscription_updated`, `subscription_cancelled`, `order_created`.
The handler verifies the `X-Signature` header (HMAC-SHA256) using `LEMONSQUEEZY_SIGNING_SECRET`
and updates the user's `subscriptionStatus`. Pass `user_id` via checkout `custom_data` so the
webhook can match the correct user.

---

## Project structure

```
src/
  app/
    page.tsx                 # landing
    pricing/                 # free vs pro + checkout
    generator/               # LoRA picker + prompt + gallery
    dashboard/               # subscription status + history
    login/                   # dev email login
    api/
      auth/{login,logout}    # session
      generate               # image generation (pro-gated)
      checkout               # LS checkout
      billing/portal         # LS customer portal
      lemonsqueezy/webhook   # subscription sync
  lib/
    db.ts                    # Prisma client
    session.ts               # JWT cookie auth
    loras.ts                 # LoRA catalog
    lemonsqueezy.ts          # LS REST helpers
    generation.ts            # Replicate Flux + mock fallback
  middleware.ts              # protect routes
prisma/schema.prisma         # Postgres schema
```
