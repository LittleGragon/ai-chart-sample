# AI Chat Sample with WebLLM

这是一个使用 [@mlc-ai/web-llm](https://www.npmjs.com/package/@mlc-ai/web-llm) 构建的简单 AI 聊天示例。

## 功能

- 在浏览器中直接运行大型语言模型
- 无需服务器支持
- 使用 WebGPU 加速推理
- 简单的聊天界面

## 运行项目

1. 安装依赖：
   ```
   npm install
   ```

2. 启动开发服务器：
   ```
   npm start
   ```

3. 在浏览器中打开 `http://localhost:8000` 访问应用

## 使用说明

1. 首次运行时，应用会自动下载并加载模型（大约需要几十秒到几分钟，取决于网络速度）
2. 模型加载完成后，你可以在输入框中输入消息与 AI 进行对话
3. AI 的回复会显示在聊天界面中

## 技术细节

- 使用 Llama-3.2-1B-Instruct 模型，这是一个较小的模型，加载速度相对较快且更加稳定
- 通过 WebLLM 实现浏览器内推理，无需服务器支持
- 支持流式响应（当前版本为完整响应，可进一步优化）

## 文件结构

- `index.html`: 聊天界面
- `app.js`: 应用逻辑
- `package.json`: 项目依赖和脚本

## 注意事项

- 需要支持 WebGPU 的浏览器（如最新版 Chrome）
- 首次加载模型时需要下载约 100MB-200MB 的数据，请确保网络连接稳定
- 模型数据会被缓存，后续访问速度会更快

## 故障排除

如果遇到 `net::ERR_CONNECTION_CLOSED` 错误，请检查：

1. 确保网络连接正常，可以访问 CDN
2. 如果问题持续存在，可以尝试更换 CDN 提供商，在 `app.js` 中修改导入语句：
   ```javascript
   // 原始导入方式
   import * as webllm from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm";
   
   // 备用导入方式
   import * as webllm from "https://esm.run/@mlc-ai/web-llm";
   ```
3. 确保浏览器支持 ES6 模块，检查 `index.html` 中是否有 `type="module"` 属性
4. 如果是模型加载问题，项目已从 Phi-3 模型切换到更稳定的 Llama-3.2-1B 模型，请确保使用的是最新版本代码

## 部署到 GitHub Pages

1. 确保你已经将更改推送到 GitHub 仓库
2. 运行以下命令部署到 GitHub Pages：
   ```
   npm run deploy
   ```
3. 在 GitHub 仓库设置中，将 GitHub Pages 源设置为 `gh-pages` 分支

## 使用 GitHub Actions 自动部署

本项目包含一个 GitHub Actions 工作流，可以在每次推送到 `main` 分支时自动部署到 GitHub Pages：

1. 确保你的仓库已启用 GitHub Pages，并将源设置为 GitHub Actions
2. 将更改推送到 `main` 分支
3. GitHub Actions 会自动触发部署工作流
4. 你可以在仓库的 Actions 选项卡中查看部署状态

如果遇到 "Branch 'main' is not allowed to deploy to github-pages due to environment protection rules" 错误，请检查以下设置：

1. 在 GitHub 仓库设置中，进入 Environments > github-pages
2. 检查部署保护规则，确保 'main' 分支被允许部署
3. 如果需要，可以添加 'main' 分支到允许的分支列表中