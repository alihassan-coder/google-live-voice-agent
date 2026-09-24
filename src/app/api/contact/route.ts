import { clientIp, createRateLimiter, sameOrigin } from "@/server/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateLimited = createRateLimiter(10 * 60 * 1000, 5);

const TRADES = ["Roofing", "Water damage", "Both", "Other"] as const;

function field(body: Record<string, unknown>, key: string, max: number) {
  const v = body[key];
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Sends a "set it up for me" request to the owner's inbox via Resend.
 * Without RESEND_API_KEY it answers 503 and the page offers email/Gmail/copy instead.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  if (rateLimited(clientIp(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  // Honeypot: real people never fill the hidden "website" field.
  if (field(body, "website", 200)) return Response.json({ ok: true });

  const name = field(body, "name", 100);
  const business = field(body, "business", 120);
  const phone = field(body, "phone", 40);
  const email = field(body, "email", 200);
  const tradeRaw = field(body, "trade", 40);
  const trade = (TRADES as readonly string[]).includes(tradeRaw) ? tradeRaw : "Other";
  const message = field(body, "message", 2000);

  if (!name || phone.replace(/\D/g, "").length < 7) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (!apiKey || !to) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const text = [
    `New setup request from the demo site`,
    ``,
    `Name:      ${name}`,
    `Business:  ${business || "—"}`,
    `Trade:     ${trade}`,
    `Phone:     ${phone}`,
    `Email:     ${email || "—"}`,
    ``,
    message ? `Message:\n${message}` : `No message.`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Demo site <onboarding@resend.dev>",
        to: [to],
        reply_to: email || undefined,
        subject: `Setup request: ${business || name} (${trade})`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("[contact] resend failed", res.status, await res.text());
      return Response.json({ error: "upstream" }, { status: 502 });
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[contact] send failed", err);
    return Response.json({ error: "upstream" }, { status: 502 });
  }
}
