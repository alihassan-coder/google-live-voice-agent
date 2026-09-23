import { GoogleGenAI } from "@google/genai";
import { buildLiveConfig, LIVE_API_VERSION, LIVE_MODEL, MAX_CALL_SECONDS } from "@/server/live-session";
import { personas, type NicheId } from "@/lib/demo/personas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort abuse guard. Serverless instances don't share memory, so this is a
// speed bump, not a wall — the real limits are the single-use, short-lived token
// and the hard call length.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const allowed = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  try {
    const o = new URL(origin);
    return o.host === host || allowed.includes(o.origin);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  if (!sameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let niche: NicheId = "roofing";
  try {
    const body = (await request.json()) as { niche?: string };
    if (body.niche && body.niche in personas) niche = body.niche as NicheId;
  } catch {
    // default niche
  }

  const now = Date.now();
  const config = buildLiveConfig(niche, new Date(now));

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: LIVE_API_VERSION } });
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        // Session is cut shortly after the client-side cap, so a stuck tab can't burn quota.
        expireTime: new Date(now + (MAX_CALL_SECONDS + 60) * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        // No field mask = the server locks every setup field (model, prompt, voice, tools),
        // so the token can't be reused as a general-purpose chatbot.
        liveConnectConstraints: { model: LIVE_MODEL, config },
      },
    });

    return Response.json(
      { token: token.name, model: LIVE_MODEL, niche, maxSeconds: MAX_CALL_SECONDS },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[session] token create failed", err);
    const message = err instanceof Error ? err.message : String(err);
    const quota = /quota|RESOURCE_EXHAUSTED|429/i.test(message);
    return Response.json({ error: quota ? "quota" : "upstream" }, { status: quota ? 429 : 502 });
  }
}
