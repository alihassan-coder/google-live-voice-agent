# Missed-call demo

A landing page with a **live voice demo** for roofing and water damage companies.
A prospect clicks **Call the demo**, talks to an after-hours receptionist out loud, and
watches the owner's side fill in as they talk: caller details, urgency, the booked
inspection, and the text message the owner would get.

If the mic is blocked, the free quota is used up or the network fails, the page
falls back to a **scripted sample call** that drives the exact same UI.

## Stack

| Part | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Motion |
| Voice | Gemini Live API (`gemini-3.8-live`) via `@google/genai` |
| Backend | One Next.js route handler on the Node.js runtime (`/api/session`) |
| Hosting | Vercel |

## Folder structure

```
src/
  app/
    api/session/route.ts   Issues a single-use, locked, short-lived Gemini token
    layout.tsx, page.tsx   Fonts, metadata, page composition
    globals.css            Design tokens (colors per trade, fonts)
  components/
    landing/               Hero, demo teaser, calculator, FAQ, header, footer
    leads/                 Leads table, dashboard, detail drawer
    demo/                  Live demo: call panel + owner panel
    ui/                    Small shared primitives
    niche-context.tsx      Roofing / Water damage switch (re-themes the page)
  hooks/
    use-live-call.ts       Real call: mic → Gemini Live → speaker, tool calls → panel
    use-sample-call.ts     Scripted fallback with the same interface
  lib/
    audio/pcm.ts           Mic capture (16 kHz PCM) and gapless 24 kHz playback
    demo/personas.ts       Business names, voices and agent prompts  ← edit these
    demo/tools.ts          Tools the agent can call
    demo/apply-tool.ts     What each tool does to the owner panel (shared by both hooks)
    demo/sample-calls.ts   Scripted calls for the fallback
    demo/lead.ts           Lead types, open inspection slots (Tampa time)
  server/live-session.ts   Model, prompt, voice and tools locked into each token
public/worklets/mic-capture.js   AudioWorklet: mic → 16 kHz PCM16 frames
```

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Get a free API key at https://aistudio.google.com/apikey and put it in `.env.local`:

```
GEMINI_API_KEY=your-key-here
```

Then:

```bash
pnpm dev
```

Open http://localhost:3000 in Chrome and allow the microphone. Headphones give the cleanest demo.

## How the live call works

1. The browser asks `POST /api/session` for a token (with the chosen trade).
2. The server uses `GEMINI_API_KEY` to create an **ephemeral token**: single use,
   must start within 60 seconds, expires shortly after the 4-minute call cap, and
   **locked** to the model, prompt, voice and tools for that trade.
3. The browser connects **directly** to Gemini Live with that token and streams mic
   audio (16 kHz PCM) up and plays the reply (24 kHz PCM) back.
4. When the agent learns something it calls a tool (`update_caller`, `set_urgency`,
   `get_open_slots`, `book_inspection`, `notify_owner`, `end_call`). The browser
   applies it to the owner panel and answers the tool call.

## Pages

| Page | What it's for |
|---|---|
| `/` | Landing page: hero, 3-step teaser with latest leads, loss calculator, FAQ |
| `/demo` | Live call + owner view + leads table that fills in during the call |
| `/leads` | Owner dashboard: stats, filters, all leads, detail drawer with transcript |
| `/contact` | "Get started" form. Emails you via Resend if `RESEND_API_KEY` is set, otherwise offers Gmail / email app / copy |

Example leads live in `src/lib/demo/call-records.ts` (`seedRows`). Calls made on `/demo`
are saved in the visitor's own browser only.

## Security notes

- `GEMINI_API_KEY` stays on the server. Never give it a `NEXT_PUBLIC_` prefix.
- Tokens are single-use, short-lived and locked, so a copied token can't be turned
  into a free general-purpose chatbot.
- The `/api/session` route only answers requests from the site's own origin
  (plus `ALLOWED_ORIGINS`) and has a per-IP rate limit. On serverless this limit is
  best-effort, since instances don't share memory.
- On the Gemini **free tier**, Google may use prompts and audio to improve its
  products. That's fine for role-play demos; don't use it for real customer calls.

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Project Settings → Environment Variables: add `GEMINI_API_KEY` (and optionally
   `GEMINI_LIVE_MODEL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_BOOKING_URL`).
3. Deploy. The mic only works over HTTPS, which Vercel provides.

Note: Vercel's free Hobby plan is meant for non-commercial use.

## Editing the agent

- Names, voices, owner names and prompts: `src/lib/demo/personas.ts`
- Tools the agent may call: `src/lib/demo/tools.ts`; what they do: `src/lib/demo/apply-tool.ts`
- Scripted fallback calls: `src/lib/demo/sample-calls.ts`
- Call length cap: `MAX_CALL_SECONDS` in `src/server/live-session.ts`

## Troubleshooting

| Problem | Fix |
|---|---|
| "Microphone blocked" | Click the lock icon in the address bar → allow Microphone, then reload |
| Demo says it isn't configured | `GEMINI_API_KEY` missing in `.env.local` (restart `pnpm dev`) or in Vercel env vars |
| "Demo is busy" / quota | Free-tier rate limit hit. Wait a bit, or use the sample call |
| Agent hears itself | Use headphones, or lower speaker volume |
| Model not found | Check the current Live model name and set `GEMINI_LIVE_MODEL` |
