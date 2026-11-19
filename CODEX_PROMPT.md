# 给 Codex 的部署任务：能力星图

## 背景
这个文件夹是一个已经写好的纯静态网站「能力星图」：用户在浏览器里盘点自己 8 个领域、36 项能力，数据存在 localStorage，可导出/导入 JSON 备份；可选的 AI 画像由 Cloudflare Pages Function 调用 DeepSeek 生成。

文件：
- `index.html`、`assets/styles.css`、`assets/app.js`：前端，无构建步骤、无 npm 依赖
- `functions/api/health.js`：`GET /api/health` 返回 `{"ok":true,"ai":<是否配置了密钥>}`
- `functions/api/report.js`：`POST /api/report`，body 为 `{"data":[...]}`，服务端拼提示词调用 DeepSeek，返回画像 JSON
- `functions/api/proxy.js`：`POST /api/proxy`，用户在前端「AI 设置」里填了自己的 API Key、但浏览器直连被跨域拦下时的转发通道，只允许白名单里的服务商地址
- `_headers`：Cloudflare Pages 的响应头
- `README.md`：部署说明

## 你的任务
1. **建仓库**：在我的 GitHub 账号下新建公开仓库 `ability-starmap`，把本文件夹全部内容提交到 `main` 分支（不要提交任何密钥）。
2. **本地验证**（部署前）：
   - `python3 -m http.server 8000`，打开首页，确认：首次进入出现欢迎卡片；「快速点亮」能选范围并用 1/2/3 键作答；星图可悬停、点击星座放大；角色面板雷达图会变化；画像报告在没有 AI 时生成「基础画像」；右上角「⋯」的导出、导入、清空都能用；浏览器控制台没有报错（`/api/health` 的 404 在纯静态预览下是正常的）。
   - `npx wrangler pages dev . --binding DEEPSEEK_API_KEY=<我提供的测试 key>`，确认 `/api/health` 返回 `"ai": true`，「生成画像」能拿到 AI 结果，画像卡片底部显示「由 AI 生成」。
3. **部署到 Cloudflare Pages**（用 Git 集成，push 即自动部署）：
   - Framework preset：None；Build command：留空；Build output directory：`/`
   - 在 Settings → Variables and Secrets 添加 `DEEPSEEK_API_KEY`（Secret）；`DEEPSEEK_MODEL` 可选，默认 `deepseek-chat`
   - 部署后在线上地址重复第 2 步的检查
4. **防滥用**（`/api/report` 会消耗我的 DeepSeek 额度，`/api/proxy` 可能被当作免费中转）：给 `/api/report` 和 `/api/proxy` 都加每个 IP 的频率限制，例如每 IP 每 10 分钟最多 5 次。优先用 Cloudflare 的 Rate Limiting 规则（WAF）；如果做不到，就在函数里用 KV 实现，并在 README 写清楚需要绑定的 KV 名称。超限返回 429，前端已经会在 429 时回退到基础画像。
5. **验证自带 API**：在线上用「⋯ → AI 设置」分别测试 DeepSeek（或我提供的任一 Key）的「测试连接」和「生成画像」；确认 Key 不会出现在导出的备份 JSON、网络请求日志和 Cloudflare 日志里。预设的模型名如果已经下线，按服务商官方文档更新 `assets/app.js` 里 `AI_PROVIDERS` 的默认模型，并告诉我改了哪些。
6. **可选**：如果我提供了自定义域名，把它绑定到 Pages 项目。
7. **交付**：告诉我线上网址、仓库地址，以及你改动过的文件和原因。

## 约束
- 不要改变产品的功能、文案和视觉；只在部署、安全、修复真实 bug 的范围内改代码。发现 bug 先说明再修。
- 不要引入构建工具、框架或 npm 依赖；保持纯静态 + Pages Functions。
- 站点自己的密钥只能放在 Cloudflare 的 Secret 里，不能出现在前端代码、仓库或日志里；用户自带的 Key 不能被服务端保存或记录。
- `/api/proxy` 必须保持白名单，不能改成可以转发到任意地址。
- 不要加任何统计、追踪或第三方脚本，除非我同意。网站不收集用户数据。
- 如果 DeepSeek 接口格式与 `functions/api/report.js` 不一致（例如模型名变更），以 DeepSeek 官方文档为准修改，并告诉我改了什么。
