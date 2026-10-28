# 网页 Logo

网页标识由 **Qoder CN 官方折面标志**与新排版的 **Qoder / DESIGN KIT** 字标组成。页眉、页脚、登录示例和浏览器图标使用同一轮廓；本项目仍是非官方设计参考。

[资产预览](assets/brand/preview.html) · [源码证据](source-evidence/brand.json) · [原始资源](source-evidence/brand/qoder-cn-ide-original.svg)

## 可直接使用的文件

| 文件 | 用途 |
| --- | --- |
| [qoder-design-kit.svg](assets/brand/qoder-design-kit.svg) | 透明底，深色字标，适合亮色页面 |
| [qoder-design-kit-dark.svg](assets/brand/qoder-design-kit-dark.svg) | 透明底，浅色字标，适合暗色页面 |
| [qoder-design-kit-mono.svg](assets/brand/qoder-design-kit-mono.svg) | 单色版；内联时继承 `currentColor` |
| [qoder-mark.svg](assets/brand/qoder-mark.svg) | 48×48 透明底标志，用于小尺寸、头像或品牌展示 |
| [favicon.svg](assets/favicon.svg) | 64×64 浅色圆角底，扩大内部标志，适合浏览器标签 |

所有 SVG 都包含矢量路径和可读名称，不引用外部字体、图片或脚本。字标使用本地 Instrument Sans Medium，已转换为轮廓。

## 比例与使用

- 组合字标画布为 **144×48**，固定 **3:1** 比例。桌面页眉显示 144×48，手机显示 120×40。
- 标志保持官方的 `#2ADB5C` 与第二层 `0.5` 透明度；不随套件配色主题改变。
- 四周建议留出至少 **8px** 空间。需要小于 120px 的组合字标时，改用独立标志更清楚。
- 浅色版字色为 `#191B18`，暗色版为 `#F2F4F0`。文字转曲，因此更换字体不会改变 Logo。

```html
<a href="/" aria-label="Qoder Design Kit 首页">
  <img src="assets/brand/qoder-design-kit.svg"
       width="144" height="48" alt="">
</a>
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
```

独立的说明性 Logo 可使用 `alt="Qoder Design Kit"`。已有文字或无障碍名称的链接内使用 `alt=""`，避免重复朗读。网页里手动切换亮暗主题时，通过主题状态选择对应 SVG；单色版内联后可由 CSS 设置 `color`。

## 源码提取

来源是 Qoder CN **0.4.8** 的 `resources/app.asar`：

```text
out/renderer/assets/qoderCnIdeLogo-D6M-8wQq.svg
SHA-256: 1ee11979146bb5cf0579d0c443ac031574140abf60bfa61681ab632a16a8b374
```

原文件保存在 `source-evidence/brand/qoder-cn-ide-original.svg`。导出时移除了应用图标的白色底板，对两条原始路径做等比例缩放与位置调整，路径数据保持原样。字标组合、留白与浏览器图标底板为本网站新增设计。

复现导出需要 Python、FontTools 和 Brotli，仅在生成阶段使用：

```powershell
python -m pip install fonttools brotli
python tools/extract-brand.py "C:\path\to\Qoder CN\resources\app.asar"
```

工具只读取已安装客户端，生成 SVG 和 `source-evidence/brand.json`。证据包含原始资源、字体及导出文件的 SHA-256；不会修改客户端。

## 验证

2026-10-24 已核对官方两条路径与全部导出文件的哈希，检查网站亮暗切换、全部品牌图片加载、16 / 32 / 48px favicon，以及 320px 亮色、390px 暗色的窄屏网页。窄屏组合字标为 120×40，无页面横向溢出；两种主题的页面均无控制台错误。

见 [验证记录](source-evidence/brand-verification.json)、[资产预览截图](source-evidence/brand-preview.png) 与 [窄屏截图](source-evidence/brand-responsive.png)。

Qoder 标志的权利归其权利人所有，不适用套件中的字体或 Tabler Icons 许可证。其他产品可以参考组合、比例与主题切换方式，并替换为自己的品牌资源。详见 [licenses/README.md](licenses/README.md)。
