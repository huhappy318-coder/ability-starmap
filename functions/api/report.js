import { SITE_MODEL, MAX_OUTPUT_TOKENS, budgetScope, reserveBudget, settleBudget } from "../../lib/budget.js";
import { checkRateLimit } from "../../lib/rate-limit.js";

// POST /api/report —— 用 DeepSeek 生成能力画像
// 站点凭据、模型与预算均由服务端控制。
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
  if (!env.SITE_DEEPSEEK_KEY || !env.AI_BUDGET_IP_SECRET || !env.AI_BUDGET) return json({ error: "ai_not_configured" }, 503);

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

  const prompt = buildPrompt(data);
  let hold;
  try {
    const scope = await budgetScope(request.headers.get("CF-Connecting-IP"), env.AI_BUDGET_IP_SECRET);
    hold = await reserveBudget(env.AI_BUDGET, scope, prompt);
  } catch {
    return json({ error: "budget_unavailable" }, 503);
  }
  if (!hold) return json({ error: "budget_exhausted" }, 402);

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 80_000);
  let res;
  try {
    res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.SITE_DEEPSEEK_KEY}` },
      body: JSON.stringify({
        model: SITE_MODEL,
        messages: [{ role: "user", content: prompt }],
        thinking: { type: "disabled" },
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
      redirect: "manual",
      signal: ctl.signal,
    });
  } catch {
    return json({ error: "upstream_unreachable" }, 502);
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) return json({ error: "rate_limited" }, 429);
  if (!res.ok) return json({ error: "upstream_error", status: res.status }, 502);

  let out;
  try {
    out = await res.json();
  } catch {
    return json({ error: "invalid_ai_output" }, 502);
  }
  try {
    await settleBudget(env.AI_BUDGET, hold, out?.usage);
  } catch {
    // 预留已经持久化。结算未确认时停止，不重试模型请求。
    return json({ error: "budget_unavailable" }, 503);
  }
  try {
    const text = out?.choices?.[0]?.message?.content || "";
    const start = text.indexOf("{"), end = text.lastIndexOf("}");
    const report = JSON.parse(text.slice(start, end + 1));
    if (!report || typeof report !== "object" || !report.title) throw new Error("no title");
    return json(report);
  } catch {
    return json({ error: "invalid_ai_output" }, 502);
  }
}
