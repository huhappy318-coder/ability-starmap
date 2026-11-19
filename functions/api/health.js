// GET /api/health —— 告诉前端：站点自带的 AI 是否已配置（不泄露密钥），以及转发通道是否可用
export async function onRequestGet({ env }) {
  return Response.json(
    { ok: true, ai: Boolean(env.SITE_DEEPSEEK_KEY && env.AI_RATE_LIMIT && env.AI_BUDGET && env.AI_BUDGET_IP_SECRET), proxy: Boolean(env.AI_RATE_LIMIT) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
