import "server-only";

/**
 * Best-effort abuse guard. Serverless instances don't share memory, so this is a
 * speed bump, not a wall.
 */
export function createRateLimiter(windowMs: number, maxPerWindow: number) {
  const hits = new Map<string, number[]>();
  return function rateLimited(ip: string) {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= maxPerWindow) return true;
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear();
    return false;
  };
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Only the site's own pages (plus ALLOWED_ORIGINS) may call our API routes. */
export function sameOrigin(request: Request) {
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
