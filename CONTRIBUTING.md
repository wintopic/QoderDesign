# Contributing

感谢你愿意改进 Qoder Design Kit！

1. Fork 并创建分支：`git checkout -b feat/your-change`
2. 安装依赖：`npm install && npm run test:install`
3. 本地预览：`npm start` → http://localhost:4173
4. 提交前运行测试：`npm test`

## 原则

- **源码优先**：新增或修改的视觉数值须能在 Qoder 编译产物中找到依据，并记录到 [SOURCE-MAPPING.md](SOURCE-MAPPING.md)。
- **零构建**：组件库保持纯 CSS + vanilla JS，不引入打包器或运行时依赖。
- **令牌驱动**：组件只引用 `--q-*` CSS 变量，不写死颜色。
- **不分发专有素材**：不要提交 Qoder 的海报、视频、插画或其他未授权品牌资产。

Issue 与 PR 请尽量附上截图和对应的源码依据。
