import { checkRateLimit } from "../../lib/rate-limit.js";

// POST /api/proxy —— 用户自带 API Key 时的转发通道
// 只在浏览器直连被跨域（CORS）拦下时使用。只转发到下面白名单里的固定地址，不能当作任意代理。
// 不保存、不记录用户的 API Key 和内容。
const PROVIDERS = {
  deepseek:    { format: "openai", base: "https://api.deepseek.com" },
  qwen:        { format: "openai", base: "https://dashscope.aliyuncs.com/compatible-mode/v1" },
  kimi:        { format: "openai", base: "https://api.moonshot.cn/v1" },
  zhipu:       { format: "openai", base: "https://open.bigmodel.cn/api/paas/v4" },
  doubao:      { format: "openai", base: "https://ark.cn-beijing.volces.com/api/v3" },
  hunyuan:     { format: "openai", base: "https://api.hunyuan.cloud.tencent.com/v1" },
  qianfan:     { format: "openai", base: "https://qianfan.baidubce.com/v2" },
  minimax:     { format: "openai", base: "https://api.minimaxi.com/v1" },
  stepfun:     { format: "openai", base: "https://api.stepfun.com/v1" },
  yi:          { format: "openai", base: "https://api.lingyiwanwu.com/v1" },
  siliconflow: { format: "openai", base: "https://api.siliconflow.cn/v1" },
  openai:      { format: "openai", base: "https://api.openai.com/v1" },
  anthropic:   { format: "anthropic", base: "https://api.anthropic.com" },
  gemini:      { format: "gemini", base: "https://generativelanguage.googleapis.com" },
  xai:         { format: "openai", base: "https://api.x.ai/v1" },
  mistral:     { format: "openai", base: "https://api.mistral.ai/v1" },
  groq:        { format: "openai", base: "https://api.groq.com/openai/v1" },
  openrouter:  { format: "openai", base: "https://openrouter.ai/api/v1" },
};
const MAX_BODY = 80_000;

function json(body, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: "too_large" }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400); }
  const { provider, model, prompt } = body || {};
  const auth = request.headers.get("Authorization");
  const key = auth?.startsWith("Bearer ") ? auth.slice(7) : body?.key;
  const p = Object.hasOwn(PROVIDERS, provider) ? PROVIDERS[provider] : null;
  if (!p) return json({ error: "provider_not_allowed" }, 400);
  if (typeof model !== "string" || !model || model.length > 200) return json({ error: "bad_model" }, 400);
  if (typeof key !== "string" || !key || key.length > 500) return json({ error: "bad_key" }, 400);
  if (typeof prompt !== "string" || !prompt) return json({ error: "bad_prompt" }, 400);

  let url, init, read;
  if (p.format === "anthropic") {
    url = `${p.base}/v1/messages`;
    init = { headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: "user", content: prompt }] }) };
    read = j => (j.content || []).map(c => c.text || "").join("");
  } else if (p.format === "gemini") {
    url = `${p.base}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    init = { headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1500, responseMimeType: "application/json" } }) };
    read = j => (j.candidates?.[0]?.content?.parts || []).map(x => x.text || "").join("");
  } else {
    url = `${p.base}/chat/completions`;
    init = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, ...(provider === "deepseek" ? { thinking: { type: "disabled" } } : {}), messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 1500 }) };
    read = j => j.choices?.[0]?.message?.content || "";
  }

  const blocked = await checkRateLimit(request, env);
  if (blocked) return blocked;

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 80_000);
  try {
    const res = await fetch(url, { method: "POST", ...init, redirect: "manual", signal: ctl.signal });
    if (!res.ok) return json({ error: "upstream_error" }, res.status === 401 || res.status === 403 || res.status === 429 ? res.status : 502);
    return json({ text: read(await res.json()) });
  } catch {
    return json({ error: "upstream_unreachable" }, 502);
  } finally {
    clearTimeout(timer);
  }
}
