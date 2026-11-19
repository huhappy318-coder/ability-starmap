# 能力星图

用 36 颗星盘点自己的能力：8 个领域（核心能力、个人硬件条件、资产与财务、职场潜力、创业潜力、内圈关系、外圈关系、资源准入权），每一项选出自己的了解程度、可选标记长处或想补、自由写笔记，最后生成能力画像。

- 纯静态前端：`index.html` + `assets/styles.css` + `assets/app.js`，无构建步骤、无依赖。
- 数据只保存在用户自己浏览器的 localStorage 里；右上角「⋯」可导出 / 导入 JSON 备份、清空。
- AI 画像有三种来源，按优先级：
  1. **用户自带 API**：右上角「⋯ → AI 设置」，预设 DeepSeek、通义千问、Kimi、智谱、豆包、混元、千帆、MiniMax、阶跃、零一万物、硅基流动、OpenAI、Claude、Gemini、xAI、Mistral、Groq、OpenRouter、Ollama 和自定义 OpenAI 兼容接口。Key 只存在用户浏览器（localStorage 或 sessionStorage），不进入备份文件。浏览器直连被跨域拦截时，自动改走 `/api/proxy` 转发（只转发到白名单里的固定地址）。
  2. **站点自带 AI**：`functions/api/report.js` 用服务器端保存的 DeepSeek Key 生成画像（可选）。
  3. **基础画像**：都没有时，前端根据用户的选择和标记生成，不使用 AI。

## 目录

```
index.html
assets/styles.css
assets/app.js
functions/api/health.js   # GET  /api/health  -> {"ok":true,"ai":true|false}
functions/api/report.js   # POST /api/report  -> 画像 JSON（站点自带的 DeepSeek）
functions/api/proxy.js    # POST /api/proxy   -> 用户自带 Key 的转发通道（白名单）
_headers                  # Cloudflare Pages 安全与缓存头
```

## 本地预览

```bash
# 仅将前端文件放入预览目录，避免通过 HTTP 访问项目里的本地配置。
preview_dir=$(mktemp -d)
cp -R index.html assets "$preview_dir/"
python3 -m http.server 8000 --bind 127.0.0.1 --directory "$preview_dir"
# 或者带上函数一起跑：
# 让 Wrangler 从项目根目录的 .dev.vars 读取 DEEPSEEK_API_KEY。
# 这个文件由 Git 忽略。静态目录仍用上面的预览目录，functions/ 从项目根目录加载。
npx wrangler pages dev "$preview_dir" --ip 127.0.0.1 --kv AI_RATE_LIMIT
```

## 部署到 Cloudflare Pages（推荐，支持 AI 画像）

1. 把仓库推到 GitHub。
2. Cloudflare 控制台 → Workers & Pages → Create → Pages → Connect to Git，选这个仓库。
3. Framework preset：None；Build command：留空；Build output directory：`/`。
4. Settings → Variables and Secrets：添加 `DEEPSEEK_API_KEY`（类型选 Secret）。可选 `DEEPSEEK_MODEL`，默认 `deepseek-flash`。
5. 在 Settings → Bindings 添加 KV namespace 绑定，变量名填 `AI_RATE_LIMIT`。生产与预览使用独立命名空间，预览环境按需单独配置密钥。
6. 重新部署。打开 `/api/health` 应返回 `"ai": true`。

## 部署到 GitHub Pages（只有前端）

Settings → Pages → Deploy from a branch → `main` / root。GitHub Pages 不能运行 `functions/`，画像会自动使用基础画像。

## AI 接口限流

`/api/report` 和 `/api/proxy` 对同一个来源 IP 共用滚动十分钟五次的额度。函数在转发前检查 Cloudflare 设置的 `CF-Connecting-IP`。每个获准请求会在 `AI_RATE_LIMIT` 写入一条记录，键由 IP 摘要和随机标识组成，十分钟后过期。KV 缺失或读写失败时，接口返回 503。超额返回 429，同一运行实例内来自同一 IP 的并发占位也可返回 429。

KV 使用最终一致性，多个边缘实例同时处理请求时可能短暂超额。有自定义域名和合适的 WAF 权限时，可在该域名对这两个路径的 POST 请求叠加按 IP 的限流规则。保留 KV 可覆盖项目的 pages.dev 地址与预览地址。

## 隐私

盘点和备份保存在浏览器。基础画像在本地生成。使用站点 AI 时，所选内容及笔记经本站转给 DeepSeek。用户自带 API 时，浏览器优先直连所选服务商，跨域受限时可经本站白名单代理。代理只在当前请求中使用凭据。应用代码不记录请求头、正文或 Key，备份只导出盘点数据。

密钥随鉴权请求发送，设备所有者可在浏览器开发者工具中查看。部署时不要开启请求头、正文、HAR 或调试跟踪的持久化采集。站点密钥仅配置在 Pages Secret，本地测试密钥放在被 Git 忽略的 `.dev.vars`。
