// 按官方人民币高峰、输入缓存未命中价格计费，单位为微元/token。
export const SITE_MODEL = "deepseek-flash";
const INPUT_PRICE = 2;
const OUTPUT_PRICE = 8;
const LIMIT = 5_000_000;
export const MAX_OUTPUT_TOKENS = 1500;

export async function budgetScope(ip, secret) {
  if (!secret || !ip) throw new Error("budget_identity_unavailable");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const canonicalIP = ip.includes(":") ? new URL("http://[" + ip + "]").hostname : ip;
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(canonicalIP));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function reserveBudget(db, scope, prompt) {
  // 纯文本单条消息。按 UTF-8 字节上界，额外留出消息格式与特殊 token 的空间。
  const inputBound = new TextEncoder().encode(prompt).length + 1024;
  const maximum = inputBound * INPUT_PRICE + MAX_OUTPUT_TOKENS * OUTPUT_PRICE;
  const id = crypto.randomUUID();
  const result = await db.prepare(`
    INSERT INTO ai_budget_charges (request_id, budget_scope, micro_yuan)
    SELECT ?, ?, ?
    WHERE (SELECT COALESCE(SUM(micro_yuan), 0) FROM ai_budget_charges WHERE budget_scope = ?) + ? <= ?
  `).bind(id, scope, maximum, scope, maximum, LIMIT).run();
  if (result.meta.changes !== 1) return null;
  return { id, inputBound };
}

export async function settleBudget(db, hold, usage) {
  const input = usage?.prompt_tokens, output = usage?.completion_tokens;
  if (!Number.isSafeInteger(input) || input < 1 || input > hold.inputBound ||
      !Number.isSafeInteger(output) || output < 0 || output > MAX_OUTPUT_TOKENS) return;
  const charge = input * INPUT_PRICE + output * OUTPUT_PRICE;
  await db.prepare(`
    UPDATE ai_budget_charges SET micro_yuan = ?, settled = 1
    WHERE request_id = ? AND settled = 0 AND micro_yuan >= ?
  `).bind(charge, hold.id, charge).run();
}
