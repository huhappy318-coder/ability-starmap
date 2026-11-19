// 两个 AI 接口共用五次额度。每次占用独立的 KV 键，十分钟后自动过期。
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
  const prefix = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("") + "/";
  if (pending.has(prefix)) return limitedResponse(429, 1);
  pending.add(prefix);
  try {
    const recent = await env.AI_RATE_LIMIT.list({ prefix, limit: LIMIT });
    if (recent.keys.length >= LIMIT || !recent.list_complete) return limitedResponse(429, WINDOW_SECONDS);
    await env.AI_RATE_LIMIT.put(prefix + crypto.randomUUID(), "1", { expirationTtl: WINDOW_SECONDS });
    return null;
  } catch {
    return limitedResponse(503, 60);
  } finally {
    pending.delete(prefix);
  }
}
