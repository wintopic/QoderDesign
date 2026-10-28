# 把 Qoder Design Kit 用到其他项目

[运行独立 Starter](examples/starter.html) · [组件展示](index.html#components) · [控件源码依据](source-evidence/controls.json)

这套库对应 Qoder CN 0.4.8。页面布局可以自己组合；组件的尺寸、主题和状态沿用源码中的规则。Starter 展示了一个可以保存本地偏好的设置页，未加载展示网站的 CSS 或 JS。

## 1. 原生 HTML / JavaScript

复制 `assets/` 到自己的项目，保留 `css/`、`js/`、`fonts/` 的相对位置。在页面中引入：

```html
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/components.css">
<script src="assets/js/qoder-icons.js" defer></script>
<script src="assets/js/qoder-ui.js" defer></script>
```

组件带有完整的静态结构，CSS 加载后即可正确显示。`qoder-ui.js` 在 DOM 就绪后绑定交互；字体与图标均在本地，不依赖 CDN。

```html
<span id="autosave-label">自动保存</span>
<button type="button" class="q-switch" data-q-switch
        role="switch" aria-checked="true" aria-labelledby="autosave-label">
  <span class="q-switch__thumb" data-switch-thumb="">
    <span class="q-switch__visual" data-switch-visual="" aria-hidden="true"></span>
  </span>
</button>
```

小号添加 `q-switch--sm`。禁止修改时使用原生 `disabled` 属性。业务代码读取事件中的布尔值：

```js
const sw = document.querySelector('[data-q-switch]');
sw.addEventListener('q:switch', event => {
  const enabled = event.detail.checked;
  // 把 enabled 写入你的业务状态。
});

QSwitch.get(sw);                 // true / false
QSwitch.set(sw, false);          // 同步状态，不派发事件
QSwitch.set(sw, true, { emit: true }); // 状态改变时派发一次 q:switch
```

动态创建的开关，在插入后初始化。`QSwitch.init()` 可以接收开关本身或包含它的容器，多次调用不会重复绑定：

```js
const sw = document.createElement('button');
sw.className = 'q-switch';
sw.setAttribute('data-q-switch', '');
sw.setAttribute('aria-label', '新项目通知');
sw.setAttribute('aria-checked', 'false');
container.append(sw);
QSwitch.init(sw); // 也兼容旧版空 button 标记，自动补全两层 span
```

需要用表单提交开关值时，在业务层同步一个 `input[type=hidden]`。源码中的开关是 `button[role=switch]`，本身不参与原生表单的字段提交；Checkbox 和 Radio 示例则使用原生 input。

## 2. React

复制 [QSwitch.jsx](examples/react/QSwitch.jsx)，在应用入口引入两个样式表：

```jsx
import './qoder/assets/css/tokens.css';
import './qoder/assets/css/components.css';
import { useState } from 'react';
import QSwitch from './qoder/examples/react/QSwitch.jsx';

export default function Preferences() {
  const [enabled, setEnabled] = useState(true);
  return (
    <div>
      <span id="save-label">自动保存</span>
      <QSwitch checked={enabled} onCheckedChange={setEnabled}
               aria-labelledby="save-label" />
    </div>
  );
}
```

该组件由 React 管理 `checked`，支持 `ref`、`disabled`、`size="sm"`、`className` 及原生 ARIA 属性。组件内不添加 `data-q-switch`；即使为菜单或 Toast 引入了 `qoder-ui.js`，也不会重复接管开关状态。

## 3. Vue 3

复制 [QSwitch.vue](examples/vue/QSwitch.vue)，在应用入口引入相同的两个样式表：

```vue
<script setup>
import { ref } from 'vue';
import QSwitch from './qoder/examples/vue/QSwitch.vue';
const enabled = ref(true);
</script>

<template>
  <div>
    <span id="save-label">自动保存</span>
    <QSwitch v-model:checked="enabled" aria-labelledby="save-label" />
  </div>
</template>
```

组件支持 `size="sm"`、`disabled`、`@change="handler"`；change 传入布尔值。React、Vue 和原生版本共用同一套 CSS，均保留 `data-switch-thumb`、`data-switch-visual` 及指针吸附状态。

## 4. 忠实复用的规则

| 部位 | 原版规则 | 使用方式 |
|---|---|---|
| 主界面字体 | 系统 UI 字体、13px 控件 | 使用 `--q-font-ui`、`--q-text-ui` |
| 卡片 / 按钮 | 相应圆角 + squircle | 保留组件本身的配方 |
| Switch | 圆头轨道和圆形滑块 | `corner-shape: round`，不要统一改成 squircle |
| Switch MD | 32×20；滑块 16 / 悬停 18 / 点击 24px | `.q-switch` |
| Switch SM | 28×16；滑块 12 / 悬停 14 / 点击 20px | `.q-switch.q-switch--sm` |
| 两种 Switch 位移 | 关闭 1px → 开启 13px | 由外层 thumb 负责 |
| Switch 内层 visual | 白/暗色来自 `text-on-primary`；阴影用 drop-shadow | 不合并成 thumb 的背景或伪元素 |
| Radio | 16px；选中填充 `text`；内点 8px、`bg-base` | 不把原始 Radio 圆点改成品牌绿 |
| Checkbox | 16 / 20px；勾选描边 100 / 200ms | 原生 input + `.q-checkbox__box` |
| Slider | 轨道 8 / 4px，滑块 20 / 12px | 原生 range + `.q-slider` |

Switch 只在鼠标等精细指针悬停时伸长。点击会先伸长并吸附，位移延迟 60ms 后执行 90ms；键盘 Enter / Space 切换时没有吸附动画。`prefers-reduced-motion` 下取消动画和过渡。高对比度系统配色另有 Web 适配。

Slider 当前提供单滑块的横向原生 range。其滑块位置使用源码中的半滑块边距插值，原生点击区域与可见滑块保持相同尺寸；最小值、最大值和键盘 step 均来自 input。`q:slider` 在用户输入时派发，初始排版和容器缩放不会重复触发业务事件。

主题用根元素的 `data-theme` 切换，也可以给局部容器设置主题：

```html
<html lang="zh-CN" data-theme="forest-dark">
```

```js
QTheme.set('forest-dark');
QTheme.apply('mint', 'light');
```

主题淡化使用整页 View Transition 快照，时长 160ms。像 Starter 这样需要连续操作表单的页面，使用 `QTheme.set('forest-dark', { animate: false })` 即时切换。快速重复调用时以最后一次请求为准；减少动效或不支持 View Transitions 的浏览器也会即时切换。

只需样式的框架项目可由框架直接设置 `document.documentElement.dataset.theme`，无需为开关加载 vanilla 交互层。

`showcase.css`、`showcase-specimens.css`、`showcase.js` 和 `showcase-catalog.js` 服务展示网站，不参与 Starter 或组件集成。`components.css` 自带 body、button、input 等基础规范；接入已有应用时，先核对这些基础选择器与应用原有样式的顺序。

## 5. 源码核对与机器可读规格

- [tokens.json](tokens.json)：九套主题、排版、尺寸，以及 `components.switch` 的完整状态规格。
- [source-evidence/controls.json](source-evidence/controls.json)：六类控件的编译配方、源文件 SHA-256、UTF-8 字节位置，及九主题共 126 个颜色令牌值。
- [SOURCE-MAPPING.md](SOURCE-MAPPING.md)：语义变量与源文件的对应关系，记录复刻与组合示例的边界。
- [tools/extract-controls.py](tools/extract-controls.py)：可重复提取已安装的 Qoder UI 规格。

```powershell
python tools/extract-controls.py 'C:\path\to\Qoder\resources\app.asar'
```

提取工具只读取 app.asar，生成本目录的控件证据，不读取账户或用户偏好，也不会改变客户端文件。升级 Qoder 后先核对新的配方和令牌，再更新组件实现。

## 6. 菜单、选择器与浮层

菜单触发器使用原生 `button[data-q-menu-trigger]`，通过 `aria-controls` 指向 `.q-menu`。自定义选择器沿用 `.q-select[data-q-select]` 结构；初始化时会补齐唯一 ID、触发器与列表的关联，以及列表的可访问名称。需要明确命名时，可在触发器上使用 `aria-labelledby` 关联字段标签与当前值，或给列表设置 `aria-label`。

| 操作 | 行为 |
|---|---|
| Enter / Space、方向键 | 打开菜单或选择器 |
| ↑ / ↓、Home / End | 在可用项间移动，不改变选择器的值 |
| 输入名称的开头 | 定位匹配项；支持全角字符规范化与连续输入 |
| Enter / Space 选择 | 更新选择器，关闭浮层并恢复触发器焦点 |
| Esc | 关闭当前浮层并恢复焦点 |
| Tab / Shift + Tab | 关闭浮层，移至触发器之后 / 之前的控件 |

使用原生 `disabled` 或 `aria-disabled="true"` 表示不可用项。菜单、选择器和 Tabs 的方向键会跳过禁用或隐藏项；禁用项不会派发选择事件。菜单和选择器同一时刻只展开一个，失去焦点、点击外部或调整窗口大小时收起。常规下拉根据可用空间选择向上或向下展开，长列表在内部滚动。

`q:select` 在选择器容器上派发，提供 `detail.value`、`detail.label`、`detail.option`；菜单和右键菜单在触发器上派发 `q:menu-select`，提供 `detail.value`、`detail.label`、`detail.item`、`detail.menu`。事件派发前已关闭浮层，业务回调可继续聚焦输入框或打开对话框。`menuitemcheckbox` / `menuitemradio` 的业务状态仍由接入方根据事件更新。

右键菜单可绑定任意区域；绑定原生按钮时还支持点击、触摸、Enter / Space。两种结构都支持 Shift + F10 和键盘的菜单键：

```html
<button type="button" class="q-btn q-btn--outline"
        data-q-context-menu="task-actions">任务操作</button>
<div id="task-actions" class="q-menu q-context-menu"
     role="menu" aria-label="任务操作" hidden>
  <button type="button" class="q-menu__item" role="menuitem"
          data-value="copy">复制链接</button>
  <button type="button" class="q-menu__item" role="menuitem"
          data-value="delete" aria-disabled="true">删除（不可用）</button>
</div>
```

Tooltip 通过 `aria-describedby` 与触发器关联，保留控件已有的说明。鼠标可以移入提示阅读；按 Esc 可关闭。对话框中的 Tooltip 保留在该对话框内部，第一次 Esc 关闭提示，再次 Esc 关闭对话框。

`.q-dialog` 使用原生 `showModal()` 的焦点管理。只有在背景上按下并松开指针才会点击关闭，从内容区拖动或选择文字不会误关。自定义样式的原生 `dialog` 可以添加 `data-q-dialog` 来使用相同的关闭行为。

主题切换后的令牌刷新会合并到下一帧，并先读取所有值再更新文字。手动修改 CSS 变量后，可调用 `QTokens.refresh()` 立即刷新数值。相同内容不会重复写入 DOM；不支持的主题名会回退为 `light`。

## 7. 运行回归检查

直接预览和集成组件不需要 npm。修改库时，可在套件根目录安装仅用于开发的检查工具：

```bash
npm ci
npm run test:install
npm test
```

检查需要 Node.js 20 或更高版本，自动启动项目自带的 `127.0.0.1:4180` 静态服务并使用 Chromium。`npm run test:ui` 可交互查看用例。覆盖键盘与禁用态、浮层焦点、中文输入法、九主题同步、320–1440px 布局、22 组导出示例、Starter 保存和直接文件预览；失败截图与操作追踪记录保存在 `test-results/`。日常预览可运行 `npm start`，端口已占用时使用 `npm start -- 4174`，无需安装测试依赖。

可访问性用例检查角色、名称与关联结构。原始配色仍保留源码值，部分文字的对比度不足，颜色对比度未作为这组结构检查的通过条件。完整检查记录见 [交互验证报告](source-evidence/interaction-verification.json)。
