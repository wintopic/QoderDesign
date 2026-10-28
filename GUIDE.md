# Qoder Design Kit — 完整设计指南

> 从 **Qoder CN 0.4.8** 的编译产物中逐项还原的可复用 UI 设计系统。
> 不靠截图临摹：颜色、字体、尺寸、圆角、阴影和组件配方均来自 renderer CSS 与 React 组件的 className。

[live showcase](index.html) · [tokens](tokens.json) · [source mapping](SOURCE-MAPPING.md) · [集成指南](INTEGRATION.md) · [独立 Starter](examples/starter.html) · [licenses](licenses/README.md)

---

## 1. 快速开始

### 直接预览

打开 `index.html`，或在本目录启动任意静态服务器：

```bash
npx serve .
# 或者
python -m http.server 4173
# 已安装 Node.js 时也可使用项目自带的本地服务，无需安装依赖
npm start
```

页面包含完整的令牌、组件与应用示例。所有素材都在本地，不需要构建步骤。

展示网站包含可操作的首屏组件样本、23 组组件目录、分类筛选、中英文搜索、HTML 示例复制与完整页面下载、组件分享链接，以及 125 枚图标的中英文检索、风格筛选和 SVG 导出。另有移动端导航、滚动进度和回到顶部。

桌面宽度（≥1001px）下，展示网站直接复用 Qoder 的工作台框架：左侧为 248px 的 chrome 侧栏（设置页同款 12px 分组标题与 28px 导航项，选中指示从 0.9 缩放弹入），右侧文档位于内缩 4px、1px 描边、1rem 圆角的内容面板中，顶部 48px 标题栏显示随滚动更新的「Design Kit › 当前章节」面包屑。网站外壳的按钮、卡片、筛选与搜索框改用 `--q-shadow-raised`、`--q-shadow-border` 等原版配方；数值来源见 [SOURCE-MAPPING.md](SOURCE-MAPPING.md#showcase-workbench-shell)。窄屏回到单栏页面与导航抽屉。网站布局与样本排版分别放在 `showcase.css`、`showcase-specimens.css`；网站交互放在 `showcase.js`、`showcase-catalog.js`。这些文件均独立于可复用组件库。

组件卡片保持顶部对齐，高度随内容自然变化，示例代码入口位于预览区下方；表单、菜单、滑块和加载样本按预览区宽度调整分栏。字号样本的实际大小、行高与字重和旁侧标注一致。

应用预览工具栏按控件分组，聊天字号支持方向键选择；小屏代码窗口由代码区负责滚动。主题与图标的完整名称可换行显示。

顶部的「搜索」或 **Ctrl / Cmd K** 可直接定位页面和具体组件。组件卡片底部的「示例代码」来自页面实际使用的 HTML，弹窗、Tabs 等示例会一并带上关联结构；弹窗可切换「组件 HTML」与「完整页面」，复制当前格式或下载包含样式、脚本引用的完整 HTML。下载的页面请放在套件根目录，或调整其中的 `assets/` 路径。卡片底部的「链接」会复制当前主题下的组件定位地址。

组件查询与分类会写入链接的 `q`、`category` 参数，图标查询与风格使用 `icons`、`iconStyle`；刷新后恢复筛选。图标支持「文件夹」「星星」等中文词、英文名称和组合关键词；点击图标可查看独立 SVG、复制名称或 HTML，并下载 SVG 文件。

九套主题切换时，色块和复制的令牌值同步更新。也可通过 `index.html?theme=forest-dark` 指定预览主题；URL 参数优先于已保存的主题，切换主题时会同步当前链接的 `theme` 参数，刷新后保留选择。

网页 Logo 使用从客户端提取的官方 CN 折面标志，配合新排版的「Qoder / DESIGN KIT」字标。页眉、页脚、登录示例与 favicon 已统一；提供转曲 SVG 的亮色、暗色、单色和独立标志版本。见 [Logo 资产预览](assets/brand/preview.html) 与 [BRAND.md](BRAND.md)。

### 引入到项目

```html
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/components.css">

<script src="assets/js/qoder-icons.js"></script>
<script src="assets/js/qoder-ui.js"></script>
```

```html
<button class="q-btn q-btn--primary">
  <svg class="q-icon"><use href="#q-i-sparkles"></use></svg>
  开始任务
</button>
```

```js
// 主题：light / forest-light / bee-light / mint-light / light-parchment
//       forest-dark / bee-dark / mint-dark / parchment-dark
QTheme.set('forest-dark');

QToast.show({
  title: '已保存',
  description: '主题令牌已写入。',
  type: 'success'
});
```

`tokens.css` 内含字体 `@font-face` 和九套主题；`components.css` 只依赖 CSS 变量。图标由 `qoder-icons.js` 注入内联 SVG 精灵，因此直接双击 `index.html` 也能显示。

---

## 2. 这套库从哪里来

分析目标是本机安装的 **Qoder CN 0.4.8**（Electron 43 / Windows）：

- `resources/app.asar` → `out/renderer/assets/index-DohubooF.css`（379 KB 主样式表）
- 同目录下的 React renderer chunks（组件 JSX、className、主题值）
- `out/main/electronMain.js`（窗口尺寸与 `titleBarOverlay.height = 40`）
- 主题选择器：`data-theme` 的九个组合式 id

具体方法：

1. 把 Qoder 的哈希 CSS 变量（如 `--q1c50a8`）与 Tailwind 语义类名（`.bg-primary`、`.bg-bg-layout`、`.text-text-secondary`）对照，建立「哈希变量 → 语义令牌」映射。
2. 从主题选择器块中合并每个主题的变量值，保留亮/暗两套；用 `tokens.json` 固化。
3. 从 React bundle 中直接提取 `Button`、`WorkbenchFrame`、Composer 的真实 className 组合，重写为零依赖 CSS/JS。
4. 用无头浏览器做结构与交互验证；截图仅用于最终视觉对照，不作为测量来源。

> 版本限定：Qoder 更新后类名、尺寸或主题值可能变化。本套件对应 0.4.8；需要追新版时请先按 `SOURCE-MAPPING.md` 的方法重新核对。

---

## 3. 设计语言

### 3.1 关键词

**低饱和苔绿、柔和圆形、细线图标、分层中性表面、13px 信息密度。**

Qoder 的界面没有大量装饰。层级主要由这些手段建立，而不是重阴影：

- 表面明度：`bg-layout` / `bg-container` / `fill-tertiary` / `fill-secondary` / `fill`
- 1px 低对比边框：`border-tertiary` → `border-secondary` → `border`
- 大留白与 4px 间距网格
- 少量、低饱和的苔绿主色，只给主要动作和品牌
- 菜单、弹窗才使用阴影与浮层模糊

### 3.2 四条可复用原则

1. **表面优先于阴影。** 96% 的层级由表面和边框完成，浮层才有明显阴影。
2. **一个有记忆点的颜色。** 苔绿 `#4B6F5A` 承担主要动作；其余彩色只表达状态和数据。
3. **圆角要“软”，不要“弹”。** 8px 侧栏项、12px 卡片、16px 按钮、20px Composer，统一叠加 `corner-shape: squircle`。
4. **13px 的密度。** 控件 13px；聊天正文 14/24；元信息 11–12px；靠行高而非粗体区分层级。

### 3.3 界面比例（源码值）

| 区域 | 数值 | 来源 |
|---|---|---|
| 标题栏 | **40px** | Electron `titleBarOverlay.height = 40`；Workbench header `h-10` |
| Windows 窗口控件安全区 | **138px** | `WINDOW_CONTROLS_OVERLAY_SAFE_WIDTH` fallback |
| 左侧栏 | **248px**（208–420px 可拖拽） | 应用传入 `defaultSidebarSize: 248`、`minSidebarSize: 208`、`maxSidebarSize: 420` |
| 内容区外边距 | **4px** | `m-1` + `w-[calc(100%-0.5rem)]` |
| 内容卡片圆角 | **8px**（大窗口 16px） | `.workbench-content-corner`；`data-native-window-corner-profile=large` |
| 对话列 | **768px** / 宽屏 **968px** | `--q8ad7df: 768px`；`html[data-chat-width=wide]{--q8ad7df:968px}` |
| 右侧产出/任务栏 | **280px** | 任务监视侧栏与 `Ok1` 动画宽度 |
| Composer | 最小 **120px**，圆角 **20px** | `min-h-[120px] rounded-[20px]` |
| Composer 编辑区 | 最小 **52px**，14px / 24px | `min-h-[52px] px-4 py-3 text-sm leading-6` |
| Composer 工具栏 | 最小 **44px**，顶部虚线 | `min-h-11 border-t border-dashed` |
| 窗口最小尺寸 | **720 × 540** | `min-w-[720px] min-h-[540px]` |
| 大字号缩放 | **1.1×** | `html[data-ui-scale=large]{--q03686d:1.1}` |

### 3.4 字体

Qoder 主界面使用系统字体；Inter 只在 Composer 工具栏出现；Instrument Sans 用于品牌性标题/空状态；Crimson Pro 是衬线阅读选项。

| 场景 | 字体栈（源码） | 用法 |
|---|---|---|
| 主 UI | `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | 几乎所有控件、侧栏、正文 |
| 品牌/展示 | `"Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | 新会话问候、品牌化标题 |
| 衬线阅读 | `"Crimson Pro", Georgia, "Times New Roman", "Songti SC", …` | `data-font-style=serif` |
| Composer 控件 | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | 模型/权限等工具栏文本，12px |
| 代码/Kbd | `IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, …` | 代码块、快捷键 |

字号与行高：

| 角色 | 字号/行高 | 字重 | 使用 |
|---|---|---|---|
| display | 28 / 36 | 500 | 品牌性标题、空状态 |
| heading | 18–20 / 26–28 | 500 | 内容标题 |
| title | 16 / 24 | 500 | 对话标题、卡片标题 |
| body | 14 / 24 | 400 | 聊天正文、Markdown |
| label | 13 / 16（20） | 400–500 | 按钮、侧栏项、表单 |
| caption | 12 / 16 | 400 | 元信息、徽标旁说明 |
| micro | 10–11 / 14–16 | 400–500 | 状态、快捷键、eyebrow |

用户消息气泡固定 **12 / 16**；聊天正文遵循 `data-font-size`：small 13/24、medium 14/24、large 16/28。

### 3.5 颜色

默认亮色（`light`）：

| 语义 | 值 | 角色 |
|---|---|---|
| `bg-layout` | `#FFFFFF` | 内容画布 |
| `bg-container` | `#FFFFFF` | 卡片/浮层表面 |
| `bg-elevated` | `#F9F9F9` | 抬起表面 |
| `fill-tertiary` | `#F6F6F6` | 标题栏、侧栏、工具条 |
| `fill-secondary` | `#EFEFEF` | 填充、active 背景 |
| `fill` | `#DFDFDF` | 较强填充/按下 |
| `text` | `#141414` | 主文字 |
| `text-secondary` | `#636261` | 次级文字 |
| `text-tertiary` | `#838280` | 三级文字/图标 |
| `text-quaternary` | `#AAA9A8` | 占位、弱提示 |
| `border-tertiary` | `#E6E6E6` | 默认 1px 边框 |
| `border-secondary` | `#DDDDDD` | hover / 强调边框 |
| `border` | `#BCBBBA` | 强边框/焦点 |
| `primary` | `#4B6F5A` | 主色 |
| `primary-hover` | `#436651` | 主色悬停 |
| `primary-active` | `#3A5747` | 主色按下 |
| `primary-bg` | `#F2F4F2` | 用户气泡/弱主色底 |
| `primary-border` | `#D5DBD8` | 主色弱边框 |
| `success` | `#579B6E` | 成功 |
| `warning` | `#EFB041` | 警告 |
| `error` | `#EC5B56` | 错误/危险 |
| `info` | `#3B81E9` | 信息 |
| `link` | `#4D9868` | 链接 |

默认暗色（`forest-dark`，也是 `dark` 别名）：

| 语义 | 值 | 语义 | 值 |
|---|---|---|---|
| `bg-layout` | `#191B1A` | `text` | `#D9DCD9` |
| `bg-container` | `#191B1A` | `text-secondary` | `#B3BAB4` |
| `bg-elevated` | `#252825` | `text-tertiary` | `#949D96` |
| `fill-tertiary` | `#252B26` | `text-quaternary` | `#8A948C` |
| `fill-secondary` | `#2D332E` | `border-tertiary` | `#363C37` |
| `fill` | `#363D37` | `border` | `#4B554D` |
| `primary` | `#4D9C61` | `primary-bg` | `#14261C` |
| `primary-hover` | `#62AD78` | `primary-border` | `#335942` |

强调色板（亮色）：blue `#3F8EF7` · orange `#EA873F` · yellow `#F2C647` · pink `#DA5597` · purple `#605CE5` · teal `#55B5A6` · sage `#7CB196` · mauve `#8E8C98` · lavender `#B49EF9` · slate `#20293A`。

> 暗色不是简单反相：表面带有绿色调，主色被提亮，边框对比度降低；详见 `tokens.json`。

### 3.6 圆角与 squircle

| Token | 值 | 用途 |
|---|---|---|
| `radius-sm` | 4px | 菜单项/键帽 |
| `radius-md` | 6px | 紧凑标签、Kbd |
| `radius-lg` | 8px | 菜单、侧栏项、内容卡片 |
| `radius-xl` | 12px | 对话框、卡片、Tabs 容器 |
| `radius-2xl` | 16px | 默认按钮、输入框、用户气泡 |
| `radius-20` | 20px | Composer |
| `radius-28` | 28px | 大型空状态/海报卡 |
| `radius-full` | 9999px | 药丸、模式切换、开关 |

Qoder 在大量元素上使用 `corner-shape: squircle`。本库把它封装为 `.q-squircle` 与组件默认的 `corner-shape`；不支持该属性的浏览器会自然回退到普通 `border-radius`。

### 3.7 阴影

- `--q-shadow-sm`：Tailwind 默认轻阴影；用于 Composer 默认状态。
- `--q-natural-shadow-sm`：`0 1px 1px rgba(0,0,0,.04), 0 4px 12px -6px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,.22)`；用于侧栏项、输入区等“自然”抬起。
- `--q-natural-shadow-md`：玻璃浮层阴影（源码 `glassSurfaceClassName`）：
  `0 8px 18px -8px rgba(0,0,0,.10), 0 18px 42px -20px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.72)`。
- `--q-shadow-border`：`0 0 0 1px rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06), 0 2px 4px 0 rgba(0,0,0,.04)`。
- `--q-shadow-lg`：菜单与对话框的抬升。
- 输入框 focus：`0 0 0 1px border-secondary, 0 0 0 3px border-quaternary`（源码 `--q449f7e`）。

### 3.8 动效

| Token | 值 | 用途 |
|---|---|---|
| micro | 120–150ms | hover、背景、颜色 |
| fast | 150ms | 菜单/浮层进入 |
| layout | 220ms | 侧栏宽度、布局展开 |
| drawer | 320ms | 大抽屉 |
| ease-out | `cubic-bezier(.2,.8,.2,1)` | 大多数交互 |
| emphasized | `cubic-bezier(.16,1,.3,1)` | 菜单/弹窗进入 |
| standard | `cubic-bezier(.4,0,.2,1)` | 通用过渡 |

菜单从 `scale(.95) + y(-4px)` 进入；弹窗从 `scale(.95) + y(8px)`；开关 thumb 拉伸 60ms 延迟、90ms 完成；全部尊重 `prefers-reduced-motion`。

### 3.9 图标

- 24 × 24 网格，2px 描边，圆头 cap/join；`currentColor` 着色。
- 常用渲染尺寸 12 / 14 / 16 / 20 / 24px；本套件默认 16px。
- Qoder 的线框图标命名类似 `Qoder*Line`，另有 `Qoder*Fill` 实心状态图标。
- 本套件以 **Tabler Icons** 的同风格等价物替代，并提供 125 枚 symbol（110 线框 + 15 实心）。替换方法见 `assets/icons/README.md`。

### 3.10 Loading / 加载动画

Qoder 的加载动效分三层：**启动页 Logo 扫光**、**运行时变体 Loader**、**聊天 Thinking 点阵**。

| 场景 | 源码参数 | 本套件 |
|---|---|---|
| 启动页 | Logo 72px，整体 opacity 0.6；base 呼吸 2.15s linear；扫光 2.15s `cubic-bezier(.28,0,.62,1)`（-120% → 120%，rotate -24°，scale 1.18）；底部模糊 24px / 0.58；淡出 120ms | `.q-boot-splash` + `QBoot.show()` |
| Logo Loader | 运行时尺寸可配；base 2.15×speed、扫光 2.15×speed；bottom blur = size × 0.34 | `.q-loader--logo` |
| Spinner | 单圈旋转 1s linear；轨道 20% 透明、3px 圆头弧 | `.q-loader--spinner` |
| Dots | 三个 18% 圆点；1s ease-in-out；延迟 -0.78 / -0.56s | `.q-loader--dots` |
| Bars | 五根 10% × 58% 圆条；1.15s；错峰延迟 | `.q-loader--bars` |
| Matrix | 3×3 点阵；1.35s；对角线延迟 | `.q-loader--matrix` |
| Comet | 22% 透明轨道 + 发光点；1s | `.q-loader--comet` |
| Thinking | 3×3、2.5px 点；1.4s ease-in-out；12px 容器 | `.q-thinking` |
| 减少动效 | 源码将动画降为 calm pulse；启动 Logo 停止并隐藏扫光 | 已实现 `prefers-reduced-motion` |

```html
<div class="q-loader q-loader--logo" role="status" aria-label="正在加载">
  <span class="q-loader__logo-base"></span>
  <span class="q-loader__logo-blur"></span>
  <span class="q-loader__logo-sweep"><i></i></span>
</div>

<button class="q-btn q-btn--primary" data-q-boot-replay>播放启动动画</button>
```

```js
QBoot.show({ duration: 2400, label: '正在启动' });
```

Loader 蒙版默认仍是 QDK 的抽象线标；网页品牌使用的官方 CN 标志见 [BRAND.md](BRAND.md)。加载器可通过 CSS 变量换成自己的品牌：

```css
.q-loader {
  --q-loader-mask: url("assets/your-loader-mark.svg");
  --q-loader-speed: 1s;
}
```

### 3.11 渐变、噪点与玻璃

Qoder 不是纯色 UI。它在中性表面上叠了四层很轻的效果：

| 层 | 源码依据 | 本套件 |
|---|---|---|
| **Shell wash** | `--qbb40b5` / `--q5b417c`；bee-light 为 `linear-gradient(180deg,#e6e6b6,#c4d0da)`，forest-dark 为 `#242624`，森林主题带噪点 | `.q-window` 背景层；标题栏/侧栏透明，让 wash 透出 |
| **Noise** | `--qc5b575` noise 贴图、`--qe1993d:50px`、森林主题 opacity `.2/1` | SVG turbulence 纹理，归一化为 `.018/.035`，soft-light；仅森林主题默认可见 |
| **Glass** | 非 Windows：`--q2be96d` 180° 渐变 + `blur(40px) saturate(150%)`、inset highlight、双层阴影 | `.q-glass` / `.q-menu--glass`；默认菜单仍是实色 |
| **Scroll fade** | `scroll-fade-y` 遮罩渐变，`min(12%,40px)` / 96px 动画区间 | `[data-q-scroll-fade]` 动态遮罩，JS 检测顶/底边缘 |
| **Pointer field** | 新会话 canvas：cell 24px、radius 72、fade 720ms | `.q-dot-field` 点阵 + 144px 指针光场，使用 CSS 变量 |
| **Theme fade** | View Transitions，`$50 = 160ms`，fade-in/fade-out | `QTheme.set()` 自动包裹 `startViewTransition`；不支持/减少动效时立即切换 |
| **Gradient text** | `linear-gradient(100deg, text 20%, primary 100%)` text clip | `.q-text-gradient` |
| **Status tint** | 错误/成功卡的 116° 语义渐变 | 展区样张；可按需用于反馈卡 |

核心 token：

```css
--q-window-wash        /* 每个主题的 shell 渐变/洗色 */
--q-noise-size         /* 50px */
--q-noise-opacity      /* 森林主题默认 .018 / .035 */
--q-glass-gradient     /* 180° 半透明渐变 */
--q-glass-blur-strong  /* blur(40px) saturate(150%) */
--q-scroll-fade-size   /* min(12%, 40px) */
--q-field-radius       /* 144px */
--q-theme-transition-duration /* 160ms */
```

视觉特效可以在任何时候关闭：

```js
document.documentElement.dataset.visualEffects = 'off';
// 或点击展示页的「视觉特效」开关
```

它会同时关闭 wash、噪点、玻璃 blur、光场、渐变文字与主题交叉淡化。原生 Qoder 在 Windows 上玻璃默认为实色；`.q-glass` 展示的是其非 Windows 的玻璃配方，默认浮层仍遵循实色表面。

---

## 4. 组件规格

这些数值全部来自源码类名。库中对应类名以 `.q-` 前缀重写，视觉值保持一致。

| 组件 | 关键规格 | 源码依据 |
|---|---|---|
| **Button** | 20 / 28 / 36px 高；12/13/14px 字；默认 `radius 16` + squircle；8 种变体 | `h-5/h-7/h-9`、`squircle-2xl`、primary/secondary/tertiary/ghost/text/outline/raised/destructive |
| **IconButton** | 20 / 28 / 36px；secondary 默认带 tertiary 边框；另有 toolbar 渐变按钮 | `size-5/size-7/size-9`、`variant toolbar` 的 radial-gradient + inset 高光 |
| **Input** | 20 / 28 / 36px；radius 16；13px / 16px；错误/填充/focus shadow | `h-5 h-7 h-9`、`squircle-2xl`、`focus:border-border` |
| **Textarea** | 最小 80px；padding 8/12；13/20；无 resize | `min-h-[80px] px-3 py-2 text-[13px] leading-5` |
| **Select** | 表单 36px / radius 12；Composer 28px / pill；Inter 12px | `h-9 rounded-[12px]`；`h-7 px-2 text-xs` |
| **Menu** | radius 8；p-4；item p-8、12/16；hover `fill-secondary`；`shadow-lg` | `rounded-lg border p-1`、`p-2 text-xs`、`data-[highlighted]:bg-fill-secondary` |
| **Dialog** | 384/512/672/896px 宽；radius 12；p-24；遮罩 `bg-mask/60` + blur 16 | `rounded-xl p-6`、`max-w-sm/lg/2xl/4xl` |
| **Tabs** | segmented：容器 radius 12、p-2、填色 secondary；trigger radius 8、13/16、active 白底 shadow-sm | `squircle-xl bg-fill-secondary p-0.5`、`data-[state=active]:bg-bg-base` |
| **Checkbox** | 16px / radius 4；checked 主色；指示线条 10px、1.5px 描边 | `size-4 rounded border-border-tertiary`、`group-data-[state=checked]` 动画 |
| **Switch** | MD 32×20 / SM 28×16；双层 thumb 16 / 12px；hover 18 / 14px，点击 24 / 20px；普通圆角 | `switchSizeClassNames`、`data-switch-thumb` / `data-switch-visual`、60ms + 90ms 吸附位移 |
| **Tooltip** | max 240px；p 6/8；radius 6；12/14；亮色黑底、暗色中性 900 | `max-w-[240px] rounded-md px-2 py-1.5 text-xs leading-[14px]` |
| **Toast** | 宽 356px；radius 12；p 12；border + shadow-lg；语义色图标 | Sonner 结构，Qoder 表面 token |
| **Sidebar item** | 28px 高；13/16；radius 8；active/hover 用黑色低透明叠层 | `h-7 squircle-lg`；active `--q4c3325`、hover `--q6921bb` |
| **Composer** | 20px 圆角；min 120；border tertiary；focus 时 border-secondary + shadow-md；工具栏 44px 虚线 | `rounded-[20px] min-h-[120px]`、`border-t border-dashed` |
| **User message** | max 752px；padding 10/13；radius 16；12/16；`primary-bg` | `max-w-[752px] px-[13px] py-2.5 text-xs leading-4 squircle-2xl` |
| **Assistant prose** | 14/24；标题 16/24–20/28；代码 12/20 等宽 | Markdown 组件 `font-body text-sm`；`data-font-size` 三档 |
| **Alert** | radius 8；padding 8/12；14/22；语义背景 + 前景 | `rounded-lg px-3 py-2 text-sm leading-[22px]` |
| **Kbd** | 高 20；radius 4；11/16；黑底白字 + 1px inset 阴影 | `h-5 rounded border bg-bg-highlight` |
| **Loader / Boot** | Logo 72px / 可配；慢速呼吸 2.15s；扫光 2.15s；spinner 1s；dots 1s；bars 1.15s；matrix 1.35s；thinking 1.4s | `qoder-loader` 注入样式、`#qoder-boot-splash` |
| **Welcome** | 内容 max 924px；Composer max 768px；欢迎语 20/32；工作区行 20/24 下划线 | 新会话容器、`[data-new-chat-greeting]`、`max-w-[768px]` |
| **Auth** | 690×446px；radius 12；双栏；`shadow-natural-sm` | 登录卡源码尺寸；QDK 艺术面板替代 Qoder 海报 |
| **Command palette** | 640px；顶部 12vh；搜索 40px；结果行 34px；分组标签 9px | 由 Qoder 菜单/对话框 token 组合的检索模式 |
| **Agent activity** | 工具行 36px；Todo 标记 14px；文件行 32px；diff 10–11px mono | Qoder Agent 活动的视觉语法 |
| **Composer context** | chip 24px / radius 6；附件卡 44px；错误条 11px | `data-chat-composer-context-tags`、PropertyTag、附件/错误样式 |
| **Hover card / context menu** | HoverCard 264px / radius 8；右键菜单复用 `q-menu` | HoverCard 源码 `w-64 rounded-lg`；菜单 token |
| **Radio** | 16px 圆点；边框 `border`；选中填 `text` + 8px `bg-base` 内点；focus 主色边框 + `primary-bg` | `size-4 rounded-full border`、`data-[state=checked]:bg-[--q0704b8]`、内点 `size-2` |
| **Slider** | 轨道 8px / 小号 4px；thumb 20px（小号 12px），2px 主色描边；range 主色；支持键盘 | `h-2 rounded-full bg-fill-secondary`、`size-5 border-2 border-primary bg-bg-base` |
| **Settings page** | 248px 侧栏；内容区 4px margin + 8px radius；820px 内容列；分组 12px 圆角、44px 组头、行 `padding-block: 14px` + 虚线分隔 | `loop-chrome-shell`、`max-w-[820px] px-8`、`h-11`、`py-3.5 border-dashed` |
| **Theme preview** | 8:5 比例；radius 8；选中 `border-primary` + 1px inset；标签 12/16；使用真实主题令牌渲染 | `aspect-[8/5] rounded-lg`、`shadow-[inset_0_0_0_1px_var(--q1c50a8)]` |
| **File tree** | 13/20（compact 12/16）；行高 28/32；缩进 `8 + depth×14`；卡片 p-8 / radius 8；选中 fill-secondary | `text-[13px] leading-5`、`paddingLeft: 8 + depth*14`、`rounded-lg border` |
| **Terminal** | 面板标签栏 44px；标签 28px；使用独立亮暗终端主题；ANSI 调色板来自源码 fallback | `min-h-11`、`size-3.5`、`terminal.ansi*` / VS Code 默认 ANSI 表 |
| **Chart** | 12/16；绘图区 200/240/360px；tooltip 最多 280px、radius 8、padding 8/12；legend gap 8/24；线形指示器 4px | `.qoder-chart*` 全量 CSS；Recharts 结构以静态 SVG 复刻 |
| **Empty state** | stacked：48px 三卡、±12°（hover ±18°）、标题 16/24 700 渐变、描述 12/16、按钮 gap 8；默认：48px mark、13/20 标题、11/20 描述 | `.qoder-empty-state-stacked*`、`.qoder-empty-state-stack*` |

完整标记与交互示例见 `index.html` 的 Components 与 Surfaces 区。

### 页面与 Agent 模式

- **Welcome**：20px 欢迎语 + 工作区下划线 + 起始提示 + 768px Composer。起始提示卡是套件扩展，源码主体仅问候与 Composer。
- **Auth**：690×446 双栏登录卡；左侧使用套件字标、官方 CN 标志和网格纹理，海报叙事为套件设计，专有海报/视频未包含。
- **Command palette**：Ctrl/Cmd K 唤起，支持输入过滤、↑↓/Home/End、Enter、Esc；展示网站可检索页面、组件与演示操作。
- **Agent activity**：工具调用（可展开输出）、执行计划 Todo、文件变更与 diff 统计，语义色使用 success/error。
- **Composer context**：工作区/文件标签、附件卡、错误 Banner 和发送态；标签/附件可在 Composer 内直接移除。
- **HoverCard / 右键菜单**：浮层复用 8px 圆角、1px 三级边框与 lg 阴影，不引入新的视觉语言。
- **Settings**：源码中设置是**整页路由**而不是右侧抽屉。套件保留 248px 侧栏、4px 内容区外边距、820px 内容列和 44px 分组头；主题预览使用真实主题令牌，外观/通用/终端三组页面可切换，侧栏搜索可过滤分组。

---

## 5. 主题系统

Qoder 使用**组合式主题 id**。本套件保留相同 id：

| id | 明暗 | primary | bg-layout | fill-tertiary |
|---|---|---|---|---|
| `light` | 亮 | `#4B6F5A` | `#FFFFFF` | `#F6F6F6` |
| `forest-light` | 亮 | `#4B6F5A` | `#FFFFFF` | `#F6F6F6` |
| `bee-light` | 亮 | `#0D0D0D` | `#FFFFFF` | `#F6F6F6` |
| `mint-light` | 亮 | `#4FA98F` | `#F9FBF9` | `#F6F6F6` |
| `light-parchment` | 亮 | `#C96442` | `#FBFBFA` | `#F5F4F1` |
| `forest-dark` | 暗 | `#4D9C61` | `#191B1A` | `#252B26` |
| `bee-dark` | 暗 | `#E0C65C` | `#10110E` | `#23251F` |
| `mint-dark` | 暗 | `#62C9A8` | `#0B110E` | `#1A2420` |
| `parchment-dark` | 暗 | `#E08A68` | `#151310` | `#26221D` |

`dark` 是 `forest-dark` 的别名，便于做「默认暗色」切换。

> `forest-light` 在 0.4.8 源码中与 `light` 极为接近（主要差异是 translucent fill），这是源数据本身的结果，不是解析遗漏。

用法：

```js
QTheme.set('light-parchment');      // 直接使用 Qoder 主题 id
QTheme.apply('mint', 'dark');       // → mint-dark
QTheme.toggle();                    // 保留配色切换明暗
```

直接写 CSS：

```html
<html data-theme="mint-dark">
```

```css
:root[data-theme="mint-dark"] {
  --q-primary: #62C9A8;
}
```

令牌同时作用于任意带 `data-theme` 的嵌套元素，适合做主题预览卡。亮暗都会自动设置 `color-scheme`。

---

## 6. 交互 API

### 全局方法

- `QTheme.get()`、`.set(id)`、`.apply(accent, mode)`、`.toggle()`、`.list()`、`.info()`。
- `QToast.show({ title, description, type, duration })`，type 为 `info | success | warning | error`。
- `QBoot.show({ duration, label })` / `.hide()`：全屏启动 Logo；默认 2200ms 后淡出。
- `QComposer.setValue(composer, value)`、`.setRunning(composer, bool)`、`.focus(composer)`。
- `QTokens.refresh()`：重新读取当前主题的 CSS 变量并写入 `[data-token-value]`。
- `QIcon(name, className)`：返回内联 SVG 字符串。
- `QSwitch.init(root)`、`.get(el)`、`.set(el, checked, { emit: false })`：初始化动态开关、读取或同步布尔状态。

### 声明式标记

| 属性 | 行为 |
|---|---|
| `data-q-menu-trigger` + `aria-controls` | 打开/关闭菜单；支持方向键、Home/End、Escape、焦点返回 |
| `data-q-select` | 自定义 Select：禁用项跳过、首字母定位、焦点恢复、自适应展开、`q:select` 事件 |
| `data-q-dialog-open="id"` / `data-q-dialog-close` | 打开/关闭原生 `<dialog>` |
| `data-q-tabs` / `data-q-tab` / `data-q-panel` | 局部 Tabs；支持方向键、Home/End，与关联面板同步 |
| `data-q-slider` + 内层 `input[type=range]` | 同步 `--q-slider-fill`；`data-q-slider-unit` 追加单位；`[data-q-slider-value]` 输出数值 |
| `data-q-file-tree` | 文件夹 `data-q-tree-folder` + 组 `data-q-tree-group`；点击/方向键展开、选择；派发 `q:file-select` |
| `data-q-terminal` | 标签、亮暗切换、新建/关闭标签、输入回显与演示命令；派发 `q:terminal-tab` |
| `data-terminal-close-current` | 关闭当前终端标签；也可在标签上按 Delete，最后一个标签会保留 |
| `data-q-chart` | 图表数据点 hover/focus 显示 tooltip 与参考线；Esc 隐藏 |
| `data-q-settings` | 设置页侧栏分区、搜索过滤与面板切换；`data-settings-section` / `[data-settings-panel]` |
| `data-settings-chat-width` | 演示用：把设置页的内容宽度选择同步到应用示例 |
| `data-q-switch` | 两层 span；`role=switch`、`aria-checked`；原生点击 / Enter / Space，派发 `q:switch`；重复初始化安全 |
| `data-q-tooltip="text"` | 150ms 后显示；自动翻转与视口夹取；滚动时隐藏 |
| `data-q-toast="success"` + `data-title` / `data-desc` | 快捷 Toast 触发 |
| `data-q-sidebar-toggle` | 折叠/展开最近 `.q-window` 的侧栏 |
| `data-q-sidebar-resizer` | 拖动侧栏 208–420px；双击恢复 248px |
| `data-q-artifacts-toggle` | 隐藏/显示右侧产出栏 |
| `data-q-boot-replay` | 播放 2.4s 的全屏启动 Logo 动画 |
| `data-q-command-open` | 打开命令面板；也支持全局 Ctrl/Cmd K |
| `data-q-context-menu="menu-id"` | 右键或 Shift + F10 打开指定 `.q-context-menu`；原生按钮也支持点击与触摸 |
| `data-q-effects-toggle` | 开关全部视觉特效（wash / noise / glass / field / fade） |
| `data-q-scroll-fade` | 为滚动容器启用动态顶/底渐隐遮罩 |
| `data-q-dot-field` + host 上的 `data-q-dot-host` | 指针跟随点阵光场；可放在任意相对定位表面 |
| `html[data-visual-effects="off"]` | 全局关闭视觉特效 |
| `html[data-q-theme-transition="fade"]` | 内部主题切换状态；通常由 `QTheme.set()` 自动管理。 |
| `data-q-window-control="minimize|maximize|close"` | 演示窗口控制；Web 环境显示提示 |
| `data-chat-composer` | 启用 Composer 自动增高、发送状态与键盘提交 |
| `data-q-composer-input` / `data-q-composer-send` | 输入/发送按钮 |
| `data-q-tooltip-placement="top|bottom|left|right"` | Tooltip 首选方向 |
| `data-q-dialog` | 让自定义样式的原生 Dialog 使用背景点击关闭与浮层清理行为 |

在 Composer 内，`.q-context-chip__remove`、`.q-attachment__remove`、`.q-composer__banner-close` 会自动移除对应元素。命令选择会派发可取消的 `q:command` 事件（`detail.command` / `.label` / `.item`）；调用 `event.preventDefault()` 可接管动作，阻止默认演示逻辑。视觉特效开关会派发 `q:effects` 事件。`QTheme.set()` 在支持 View Transitions 且未开启减少动效时，会先播放 160ms 的根节点交叉淡化，再完成主题状态更新。

### 自定义事件

- `q:themechange` on `document`
- `q:menu-select` on trigger（`detail.value` / `.label` / `.item`）
- `q:select` on select wrapper
- `q:tab-change` on tabs root
- `q:switch` on switch
- `q:slider` on slider（`detail.value/min/max`）
- `q:file-select` on tree（`detail.path/name`）
- `q:terminal-tab` on terminal（`detail.id`）
- `q:settings-section` on settings surface（`detail.section/item`）
- `q:command` on `document`（可取消；`detail.command/label/item`）
- `q:effects` on `document`（`detail.enabled`）
- `q:composer-input` / `q:composer-submit` / `q:composer-stop` / `q:composer-state`
- `q:sidebar-resize`

Composer 默认会在 `q:composer-submit` 未被 `preventDefault()` 时清空输入。示例页用它来追加演示消息。

例如，接管业务命令：

```js
document.addEventListener('q:command', (event) => {
  if (event.detail.command !== 'open-project') return;
  event.preventDefault();
  // 在这里执行自己的项目打开逻辑。
});
```

终端标签使用原生按钮，支持左右方向键、Home/End 和 Delete；关闭按钮放在标题栏工具区。输入按标签保留，新建和关闭后会同步更新选中状态与面板关系。

---

## 7. 目录

```
qoder-design-kit/
├─ index.html                     ← 完整展示与交互示例
├─ tokens.json                    ← 九套主题的语义令牌（可供 Figma/其他栈使用）
├─ README.md
├─ SOURCE-MAPPING.md              ← 哈希变量、组件源码依据、还原记录
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css               ← 字体、基础令牌、九套主题
│  │  ├─ components.css           ← 可复用组件与工作台外壳
│  │  ├─ showcase-specimens.css   ← 文档样本排版，保留原始 UI 密度
│  │  └─ showcase.css             ← 展示网站布局、导航、目录与响应式样式
│  ├─ js/
│  │  ├─ qoder-icons.js           ← 内联 SVG 精灵 + QIcon()
│  │  ├─ qoder-ui.js              ← 主题/菜单/弹窗/Tooltip/Toast/Composer/侧栏
│  │  ├─ showcase-catalog.js      ← 组件/图标检索、示例代码、页面命令
│  │  └─ showcase.js              ← 主题同步、复制反馈与演示交互
│  ├─ icons/                      ← 110 outline + 15 filled + sprite.svg
│  └─ fonts/                      ← Inter / Instrument Sans / Crimson Pro（woff2）
└─ licenses/                       ← MIT / OFL 原文
```

`showcase*.css`、`showcase*.js`、`index.html` 只服务于展示网站，不需要复制到业务项目。
业务项目最小只需要：`tokens.css` + `components.css` + `qoder-icons.js` + `qoder-ui.js`。

---

## 8. 自定义

### 改主色

```css
:root {
  --q-primary: #3F6B5A;
  --q-primary-hover: #345A4A;
  --q-primary-active: #2A4A3C;
  --q-primary-bg: #EDF3EF;
  --q-primary-border: #CBDAD2;
}
```

### 增加主题

在 `tokens.css` 复制一个主题块，改 `data-theme` 与色值；或在运行时设置：

```js
document.documentElement.dataset.theme = 'my-theme';
```

### 与 React / Vue 集成

可直接复制 [React QSwitch](examples/react/QSwitch.jsx) 或 [Vue QSwitch](examples/vue/QSwitch.vue)。组件由框架管理布尔状态，共用库的 CSS，保留源码的两层滑块与吸附动画。完整接入方式见 [INTEGRATION.md](INTEGRATION.md)。

组件类名是普通的 class；直接用 `<button className="q-btn q-btn--primary">` 即可。交互层通过 DOM 属性工作，也可以在框架里只复用 CSS、自行实现弹出层逻辑。

### 导出到设计工具

`tokens.json` 的结构：

```json
{
  "meta": { "source": "Qoder CN 0.4.8" },
  "typography": { "families": {}, "sizes": {}, "weights": {} },
  "spacing": {}, "radii": {}, "layout": {}, "motion": {},
  "themes": {
    "light": { "label": "Light / 默认亮色", "tokens": { "primary": "#4b6f5a", "...": "..." } }
  }
}
```

---

## 9. 已知差异与边界

- **视觉值 vs. 实现字节**：颜色、尺寸、圆角、阴影、字体、图标风格为源码级还原；交互实现是轻量的 vanilla 重写，不复用 Qoder 的 React/Radix/Motion/Sonner 代码。
- **图标**：Qoder 使用自研 `Qoder*Line/Fill` 图标；本套件用 MIT 的 Tabler Icons 等价替换，网格、描边、圆头一致，个别轮廓不同。网页 Logo 复用官方 CN 标志，原始资源及 SHA-256 见 `source-evidence/brand.json`；桌面宠物、登录视频、插画未包含。
- **加载动画**：启动页与 Loader 的时长、尺寸比例、错峰延迟按源码还原；Qoder 的 loading-line 蒙版是品牌资产，未随套件分发，改用 QDK 抽象线标，可用 `--q-loader-mask` 替换为自己的 Logo。
- **页面模式**：Welcome、Auth 的骨架尺寸来自源码；欢迎页的提示卡、认证插画与命令面板/Agent 活动展示为基于 Qoder 令牌的套件扩展。Qoder 登录海报、视频与品牌插画未分发。
- **视觉特效**：noise 贴图替换为等价的 SVG turbulence；指针点阵用 CSS/JS 复刻 canvas 光场；滚动渐隐用 JS 状态驱动遮罩（源码使用 CSS scroll-driven animation）；`.q-glass` 展示 Qoder 非 Windows 的玻璃渐变，而 Windows 默认仍是实色浮层。
- **终端**：演示使用 DOM + 少量命令模拟，不包含 xterm.js、Pty 或真实 shell；标签栏、亮暗主题、ANSI 配色和 44px 头部来自源码。ANSI fallback 使用源码中的 VS Code 默认表（`#cd3131/#0DBC79/...`）。
- **图表**：源码使用 Recharts；套件用静态 SVG + 原生 tooltip 保留尺寸、配色、legend 指示器与 8px tooltip 规格，不提供缩放、刷选等 Recharts 能力。
- **设置页**：保留外观、通用、终端三个完整面板；账户、模型、快捷键等入口在源码中存在，但套件只保留一个只读快捷键面板，避免伪造不存在的设置逻辑。设置是整页路由，不是抽屉。
- **文件图标**：Qoder 的扩展名颜色是哈希令牌（如 `--qd990cd`）。套件映射到最接近的 accent 令牌（ts → blue、js → yellow、css → purple 等），不声称逐哈希一致。
- **字体**：Inter / Instrument Sans / Crimson Pro 为开源字体；中文回退到系统字体（与 Qoder 在 Windows 上的实际渲染一致）。Kbd 在源码中首选 Geist，本库使用 Inter。
- **颜色对比度**：原始令牌中部分三级/四级文字、状态色和危险按钮未达到 WCAG 的文字对比度要求，本项目保留这些源值。展示网站的文档文字与高亮使用独立的 `--dk-*` 配色提高可读性；自动审查区分展示布局与原始组件样本，不将结果表述为整站通过 WCAG。
- **主题 `forest-light`**：与默认 light 非常接近，这是 0.4.8 源数据；不是解析错误。
- **动态资产**：示例页的聊天内容、项目名、模型名是演示数据，用来展示密度和层级，不代表 Qoder 的真实内容。
- **版本**：对应 Qoder CN 0.4.8。升级后请重新执行源码映射（见 `SOURCE-MAPPING.md`）。

---

## 10. 许可与致谢

- 字体 Inter、Instrument Sans、Crimson Pro：**SIL OFL 1.1**，原文见 `licenses/`。
- 图标 Tabler Icons：**MIT**，原文见 `licenses/MIT-Tabler-Icons.txt`。
- Qoder 的名称、包内官方 CN 标志与其他专有品牌素材归其权利人所有，不适用本套件的字体或图标许可证。本项目是**非官方**的设计参考/复刻，与 Qoder 无隶属关系。
- 本套件中的示例代码与文档用于帮助你复刻这种设计语言；请遵守你所在项目与第三方的许可要求。

---

## 11. 展示网站 3.0（2026-10-24）

本轮重新组织首屏、基础设计、组件目录和应用示例：首屏采用文案与可操作样本的双栏布局，字体、配色与控件共同展示设计语言；页面统一留白、圆角、边框和章节层级。展示布局独立于原始组件规格，继续保持零构建、素材本地加载。

- 22 组组件支持分类筛选、中英文搜索、清空和空结果恢复；125 枚图标支持检索、Escape 恢复和名称复制。
- 示例代码从实际 HTML 生成，包含 Tabs、弹窗、终端等组件的关联结构；代码区可聚焦并在卡片内横向滚动，复制终端示例会带上帮助说明。
- Ctrl/Cmd K 搜索支持方向键、Home/End、Enter 定位、空结果与 Escape 焦点返回；手机导航切入搜索后也能返回顶部可见按钮。
- 三组 Tabs、设置分区、终端标签的选中状态和面板关系通过检查；设置页在窄屏使用横向键盘导航，终端支持新建、关闭、输入保留和最后标签保护。
- 九套主题、令牌值与复制内容同步；工作台发送/停止、登录反馈、原生 Dialog 关闭与焦点返回、首屏开关反馈通过交互检查。
- 320 / 390 / 768 / 1024 / 1440px 下无页面级横向溢出；打开长代码区后仍能在卡片内滚动。减少动效时内容保持可见，平滑滚动和 Logo 扫光关闭。
- axe-core 自动审查中，展示布局与文档区域在默认亮色、薄荷亮色、森林暗色下没有明确违规；全页最终检查的明确违规限于原始样本的颜色对比度。自动工具仍有需要人工判断的项目，该结果不是整站 WCAG 合规声明。
- 审查展示布局时排除 `.dk-demo`、`.q-window`、`.q-welcome`、`.q-auth`、`.q-settings` 与 `.dk-lab .q-btn` 原始样本；按钮的可访问名称包含可见标签，页面仅保留一个主内容区。
- 本地资源、125 枚图标、7 个 WOFF2 字体、唯一 ID 和脚本语法通过静态检查；交互回归没有 JS 运行异常、控制台错误或资源加载失败。

### 历史验证记录（3.0 之前）

下列记录保留早期迭代的验证依据；其中展示页 2.0 的首屏与导航布局已由 3.0 更新。

- 1440 / 768 宽度下无页面级横向溢出。
- 菜单、Escape、权限菜单、Dialog、Tabs、Tooltip、Switch、Composer 发送/停止、主题切换、主题卡、侧栏折叠均通过无头浏览器交互检查。
- Loader 各变体与实际时序通过检查：Logo 2.15s、spinner 1s、thinking 1.4s；启动遮罩 72px、2.4s 自动淡出；`prefers-reduced-motion` 静止/隐藏扫光。
- 新增模式通过检查：Ctrl/Cmd K 命令面板（过滤、键盘选择、主题切换）、侧栏搜索唤起、右键菜单、HoverCard、上下文标签/附件/错误条移除、登录 Toast、工具详情折叠。
- 视觉层通过检查：明暗/彩色主题的 shell wash、森林主题噪点、玻璃 blur(40px)、滚动渐隐顶/底状态、指针光场变量、160ms 内完成的 View Transition 主题淡化、`data-visual-effects=off` 全量关闭。
- 1440 / 1024 / 768 / 390 宽度无页面级横向溢出。
- 无 JS 运行时错误；字体、CSS、图标资源均本地加载。
- 第三批产品组件通过交互检查：文件树展开/折叠/选择、终端输入 `ls` / `git status` / `clear`、新建/关闭标签、亮暗切换、图表 hover tooltip 与参考线、设置页三区导航与搜索过滤、主题预览切换、特效开关、Slider 键盘（End）与数值输出。
- 设置页在 1024 / 768 / 390 宽度检查：968→220px 侧栏、390px 下横向导航与隐藏账户区，无横向溢出。
- 展示页 2.0 验证：1440 / 1280 / 1180 / 1121 / 1120 / 1024 / 980 / 900 / 861 / 860 / 768 / 390 / 320 无横向溢出；导航在 861px 以上保留并通过三栏网格居中（误差 ≤3px），860px 以下切换导航抽屉。
- 头部工具统一为单个 squircle 工具组（外 12px、内 8px），页面主要界面采用 8 / 12 / 16 / 20 / 28 的圆角层级；主题下拉含 5 个配色色点，移动端抽屉含 Accent 选择。滚动进度、回到顶部、主题色 meta 同步均通过。
- 长页 reveal 改为视口驱动，锚点跳转后约 600ms 内完整显示；渐显结束后移除 reveal 类，恢复卡片 hover 过渡。`prefers-reduced-motion` 下没有隐藏内容，跳过渐显。
- Hero 采用居中的文本型展示：标题、说明、统计、CTA 与来源信息构成唯一视觉焦点，不再放置模拟产品窗口；完整工作台保留在独立的应用示例章节。


## 12. 控件源码核对与复用（2026-10-24）

重新读取本机 Qoder CN 0.4.8 的 app.asar，提取了 Button、Input、Checkbox、Radio、Slider、Switch 的编译配方，保存文件 SHA-256 和 UTF-8 字节位置。九套主题共 126 个控件相关颜色令牌与现有 tokens.json 一致。证据见 [source-evidence/controls.json](source-evidence/controls.json)，可用 [tools/extract-controls.py](tools/extract-controls.py) 重复生成。

- Switch 恢复普通圆角、两层滑块、13px 开启位移、精细指针悬停，以及 150ms 吸附动画；禁用状态不再伸长。
- Checkbox 修正源码缓动和禁用状态；Radio 修正 border 令牌、bg-base 内点，卡片中的原始圆点保持 text 颜色。
- Slider 使用源码中的半滑块边距插值，修正原生点击区域和 `max=0` 的范围解析；初始化与容器缩放静默同步，用户操作派发一次事件。
- 展示站新增独立开关卡，包含两种尺寸、八种基础状态和九主题对照；所有 26 个开关都使用完整静态结构。开关样本采用设置页的 bg-container 表面色，让关闭轨道更清楚。
- [独立 Starter](examples/starter.html) 包含原生控件与本地偏好保存；[React](examples/react/QSwitch.jsx) / [Vue](examples/vue/QSwitch.vue) 开关与 [集成指南](INTEGRATION.md) 可直接带入其他项目。
- React 19 和 Vue 3 示例完成真实编译，并与原生运行时一起进行浏览器交互检查；点击、Enter / Space、禁用态、重复初始化、动态插入和事件次数通过验证。MD / SM 吸附峰值实测为 24 / 20px，结束后恢复 16 / 12px。
- 两个视觉特效开关同步；复制代码包含八个开关的完整双层结构。减少动效时过渡和动画为零，高对比度下使用系统配色。
- Starter 保存后可恢复开关、单选、滑块和工作区名称；即时主题切换保证连续保存。展示页保留 160ms 主题淡化，快速调用以最后一次请求为准。
- 展示站和 Starter 在 320 / 390 / 768 / 1024 / 1440px 下无页面级横向溢出；展开九主题和长代码后也保持局部滚动。24 项浏览器断言、资源与脚本检查通过。

本轮浏览器与源码核对记录见 [source-evidence/verification.json](source-evidence/verification.json)。

## 13. 检索与复用体验（2026-10-25）

组件代码入口改为原生按钮，与复制定位链接并列；代码弹窗提供组件片段与完整页面两种格式，支持键盘切换、复制及 HTML 下载。完整页面包含本地依赖、关联结构和当前主题，22 组组件示例可独立加载。

图标支持中英文组合检索、全角字符规范化、线框/实心筛选、清空与空结果恢复。图标详情显示实际网格和描边规格，可复制名称、精灵引用 HTML 或独立 SVG，也可下载附带 MIT 来源说明的 SVG。

组件和图标的筛选条件保存在 URL 中。命令搜索定位组件时保留浏览器返回记录，返回后恢复先前的查询；分享组件链接会带上主题，并移除可能隐藏目标的组件筛选条件。

修复原生 Dialog 中剪贴板备用路径的焦点与选择范围，避免浏览器报告复制成功却没有选中目标文本。直接打开本地 HTML 时跳过需要 CORS 的字体预加载，字体仍由本地样式表加载。

验证通过 90 项浏览器断言，覆盖 22 组独立组件页面、10 组亮暗主题与屏幕组合（320 / 390 / 768 / 1024 / 1440px）、下载内容、复制内容、返回导航和直接文件预览。没有脚本异常或资源加载失败，展示页与新弹窗没有横向溢出。新弹窗的 axe-core 检查没有明确违规；图标弹窗仍有需人工判断的颜色对比度项，该结果不是整站 WCAG 合规声明。记录见 [source-evidence/reuse-verification.json](source-evidence/reuse-verification.json)，另存有 [移动端代码弹窗](source-evidence/reuse-code-mobile.png) 与 [图标详情](source-evidence/reuse-icon-desktop.png) 截图。

## 14. 交互完善与回归检查（2026-10-25）

菜单与选择器共用浮层管理，支持禁用项跳过、连续输入名称定位、Home / End，以及正确的 Tab / Shift + Tab 焦点顺序。下拉随屏幕空间调整方向，长列表内部滚动；Tabs 同样跳过禁用和隐藏项。右键菜单增加点击、触摸和 Shift + F10 入口，导出代码包含触发器与关联菜单。

Tooltip 增加可访问说明关联、悬停阅读、Esc 关闭和原生弹窗内显示。弹窗背景只接受在背景上完成的点击，避免拖选文字时误关闭。命令面板支持全角与组合关键词，确认中文输入法候选时不会误执行命令。图表的动态标签按纯文本显示，非法主题名回退为亮色。

主题令牌统一在下一帧刷新，批量读取后再写入，并跳过未改变的内容，减少重复样式计算。组件样式、主题配方和零构建的接入方式继续沿用原有设计。

新增可重复运行的 Playwright 检查。首次运行：

```bash
npm ci
npm run test:install
npm test
```

检查工具需要 Node.js 20 或更高版本；直接打开 `index.html` 不需要安装 Node.js 或测试依赖。`npm start` 使用自带的本地静态服务，默认地址为 `http://127.0.0.1:4173`；端口已占用时可运行 `npm start -- 4174`。用例与接入约定见 [INTEGRATION.md](INTEGRATION.md#6-菜单选择器与浮层)，本轮记录见 [source-evidence/interaction-verification.json](source-evidence/interaction-verification.json)。
