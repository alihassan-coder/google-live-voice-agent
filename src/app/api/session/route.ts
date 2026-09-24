import { GoogleGenAI } from "@google/genai";
import { buildLiveConfig, LIVE_API_VERSION, LIVE_MODEL, MAX_CALL_SECONDS } from "@/server/live-session";
import { personas, type NicheId } from "@/lib/demo/personas";
import { clientIp, createRateLimiter, sameOrigin } from "@/server/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Speed bump only: the real limits are the single-use, short-lived token and the hard call length.
const rateLimited = createRateLimiter(10 * 60 * 1000, 6);

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  if (!sameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  if (rateLimited(clientIp(request))) {
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
