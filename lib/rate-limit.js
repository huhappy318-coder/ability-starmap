// 两个 AI 接口共用五个名额。每个名额在使用十分钟后重新开放。
const WINDOW_SECONDS = 600;
const LIMIT = 5;
const pending = new Set();

function limitedResponse(status, retryAfter) {
  const error = status === 429 ? "rate_limited" : "rate_limit_unavailable";
  return Response.json({ error }, {
    status, headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) },
  });
}

export async function checkRateLimit(request, env) {
  const ip = request.headers.get("CF-Connecting-IP");
  if (!env.AI_RATE_LIMIT || !ip) return limitedResponse(503, 60);
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const prefix = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
  if (pending.has(prefix)) return limitedResponse(429, 1);
  pending.add(prefix);
  try {
    const keys = Array.from({ length: LIMIT }, (_, index) => prefix + "/slot-" + index);
    const slots = await env.AI_RATE_LIMIT.get(keys);
    const now = Date.now();
    const free = keys.find(key => Number(slots.get(key)) <= now);
    if (!free) {
      const firstExpiry = Math.min(...keys.map(key => Number(slots.get(key))));
      return limitedResponse(429, Math.max(1, Math.ceil((firstExpiry - now) / 1000)));
    }
    await env.AI_RATE_LIMIT.put(free, String(now + WINDOW_SECONDS * 1000), { expirationTtl: WINDOW_SECONDS });
    return null;
  } catch (error) {
    if (/\b429\b/.test(String(error))) return limitedResponse(429, 1);
    return limitedResponse(503, 60);
  } finally {
    pending.delete(prefix);
  }
}
