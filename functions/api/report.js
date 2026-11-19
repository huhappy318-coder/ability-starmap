import { checkRateLimit } from "../../lib/rate-limit.js";

// POST /api/report —— 用 DeepSeek 生成能力画像
// 需要在 Cloudflare Pages 的环境变量里配置：DEEPSEEK_API_KEY（必填，设为 Secret）、DEEPSEEK_MODEL（可选，默认 deepseek-flash）
const MAX_BODY = 60_000; // 字节，防止过大的请求

function buildPrompt(data) {
  return `你是一位温和、直接的个人发展顾问。下面是一个人用「能力星图」做的自我盘点：八个领域，每一项有他自选的清晰程度（还没想过 / 有点模糊 / 心里有数）、标记（长处 / 想补）和自己写的笔记。

要求：
- 只根据他写下的内容和标记来写，不编造经历；不打分、不排名。
- 不出现任何日期、期限、时间表或"每天/每周做什么"。方向是目标性的，不是任务清单。
- 语言自然、具体，用中文。称呼用"你"。
- 内容很少时，在 summary 里如实说明，并相应减少条目。

只回复一个 JSON 对象，格式：
{"title":"4到8个字的称号","summary":"2到3句整体画像","strengths":[{"name":"长处","why":"一句依据"}],"gaps":[{"name":"想补的","why":"一句依据"}],"directions":["一句话的目标方向"],"domains":[{"name":"领域名","line":"一句话"}]}
strengths、gaps 各最多 3 条，directions 3 条，domains 只包含他有内容的领域。

他的盘点：
${JSON.stringify(data)}`;
}

function json(body, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPost({ request, env }) {
  if (!env.DEEPSEEK_API_KEY) return json({ error: "ai_not_configured" }, 503);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: "too_large" }, 413);

  let data;
  try {
    data = JSON.parse(raw).data;
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  if (!Array.isArray(data) || data.length === 0 || data.length > 8) return json({ error: "bad_data" }, 400);

  const blocked = await checkRateLimit(request, env);
  if (blocked) return blocked;

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 80_000);
  let res;
  try {
    res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.DEEPSEEK_API_KEY}` },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL || "deepseek-flash",
        messages: [{ role: "user", content: buildPrompt(data) }],
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500,
      }),
      signal: ctl.signal,
    });
  } catch {
    return json({ error: "upstream_unreachable" }, 502);
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) return json({ error: "rate_limited" }, 429);
  if (!res.ok) return json({ error: "upstream_error", status: res.status }, 502);

  try {
    const out = await res.json();
    const text = out?.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{"), end = text.lastIndexOf("}");
    const report = JSON.parse(text.slice(start, end + 1));
    if (!report || typeof report !== "object" || !report.title) throw new Error("no title");
    return json(report);
  } catch {
    return json({ error: "invalid_ai_output" }, 502);
  }
}
