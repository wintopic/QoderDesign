# Source mapping · Qoder CN 0.4.8

This is the technical appendix for the design kit. It records exactly which
compiled values were used, how hashed variables were mapped to semantic names,
and where each layout/component number came from.

The kit is a **reimplementation**, not a copy of Qoder's proprietary source.
Screenshots were used only for final visual verification, never for
measurement.

---

## 1. Analysis target

| Item | Value |
|---|---|
| Product | Qoder CN (qodercn) |
| Version | 0.4.8 |
| Runtime | Electron 43 / Chromium |
| Platform analyzed | Windows 10.0.26300, 96 DPI, device scale factor 1 |
| App data | `%APPDATA%\com.qodercn.app.stable` |
| Install | `...\Programs\Qoder CN\.qoder-versions\0.4.8` |
| Main renderer CSS | `resources/app.asar → out/renderer/assets/index-DohubooF.css` (378,992 bytes) |
| Secondary CSS | `index-DT-bZ071.css` (72,759), `dataDirectoryProgress-BObUSxuS.css` (192,670) |
| Main renderer JS | `out/renderer/assets/DIR8HOYO.js` (15,241,485), `CMOdY8kL.js` (3,226,252), `DhXa_iPP.js` (88,686) |
| Window config | `out/main/electronMain.js` |

The active user theme at extraction time was `light` (Local Storage:
`...theme=light`), which matches the captured UI: `#F6F6F6` chrome,
`#FFFFFF` content, `#F2F4F2` user bubble, `#4B6F5A` primary.

---

## 2. Method: hash → semantic token

Qoder's Tailwind v4 build renames theme custom properties to
`--q` + a six-hex hash, e.g. `--q1c50a8`. The semantic meaning is still visible
in utility selectors and React className strings:

```css
.bg-primary { background-color: var(--q1c50a8); }
.text-text-secondary { color: var(--q883115); }
.border-border-tertiary { border-color: var(--qbf30b8); }
```

We parsed all CSS rules, collected selectors that referenced each hashed
variable, and treated the utility/role name as the semantic token name.

Examples:

| Semantic token | Source class evidence | Hash variable | Light value |
|---|---|---|---|
| `primary` | `.bg-primary`, `.text-primary`, `.border-primary` | `--q1c50a8` | `#4B6F5A` |
| `primary-hover` | `.bg-primary-hover`, `.hover:bg-primary-hover` | `--qedba01` | `#436651` |
| `primary-active` | `.bg-primary-active` | `--q149cae` | `#3A5747` |
| `primary-bg` | `.bg-primary-bg`, user message bubble | `--qdf74ad` | `#F2F4F2` |
| `primary-bg-hover` | `.bg-primary-bg-hover` | `--qf4cfe3` | `#E8ECEA` |
| `primary-border` | `.border-primary-border` | `--qca1baf` | `#D5DBD8` |
| `primary-border-hover` | `.border-primary-border-hover` | `--q8f0315` | `#BCC6C0` |
| `primary-text` | `.text-primary-text` | `--q3d0904` | `#4B6F5A` |
| `bg-layout` | `.bg-bg-layout` | `--q1d295b` | `#FFFFFF` |
| `bg-container` | `.bg-bg-container` | `--q79944a` | `#FFFFFF` |
| `bg-elevated` | `.bg-bg-elevated` | `--q35d916` | `#F9F9F9` |
| `bg-base` | `.bg-bg-base` | `--qb28b89` | `#FFFFFF` |
| `bg-highlight` | `.bg-bg-highlight` | `--qa1f2f3` | `#080807` |
| `bg-highlight-hover` | `.hover:bg-bg-highlight-hover` | `--qd3d2fd` | `#080807` |
| `fill` | `.bg-fill` | `--qde2d3b` | `#DFDFDF` |
| `fill-secondary` | `.bg-fill-secondary` | `--q676eb9` | `#EFEFEF` |
| `fill-tertiary` | `.bg-fill-tertiary` | `--q5b15fd` | `#F6F6F6` |
| `fill-quaternary` | `.bg-fill-quaternary` | `--q9bc9e9` | `#FCFCFC` |
| `text` | `.text-text` | `--q0704b8` | `#141414` |
| `text-secondary` | `.text-text-secondary` | `--q883115` | `#636261` |
| `text-tertiary` | `.text-text-tertiary` | `--q9ab642` | `#838280` |
| `text-quaternary` | `.text-text-quaternary` | `--q3c93d1` | `#AAA9A8` |
| `text-on-primary` | `.text-text-on-primary` | `--q292341` | `#FDFDFD` |
| `border` | `.border-border` | `--q015283` | `#BCBBBA` |
| `border-secondary` | `.border-border-secondary` | `--q0584de` | `#DDDDDD` |
| `border-tertiary` | `.border-border-tertiary` | `--qbf30b8` | `#E6E6E6` |
| `border-quaternary` | `.border-border-quaternary` | `--q2be419` | `#EEEEEE` |
| `link` | `.text-link`, `.bg-link` | `--q285429` | `#4D9868` |
| `success` | `.text-success`, `.bg-success` | `--qe8d434` | `#579B6E` |
| `warning` | `.text-warning`, `.bg-warning` | `--q666047` | `#EFB041` |
| `error` | `.text-error`, `.border-error` | `--qf72fc6` | `#EC5B56` |
| `info` | `.text-info`, `.border-info` | `--qfcc724` | `#3B81E9` |
| `bg-mask` | `.bg-bg-mask` | `--qc43a07` | `#95959466` |
| `glass-bg` | `glassSurfaceStyle.background` | `--q2be96d` | `#FFFFFF` |
| `glass-blur` | `glassSurfaceStyle.backdropFilter` | `--q0657b5` | `none` in light |
| `shadow-color-1` | natural-sm shadow | `--qfd6a9c` | `#0000000A` |
| `shadow-color-2` | natural-sm / glass | `--q6a99cd` | `#0000001A` |
| `shadow-color-3` | natural-sm inset | `--q7266c7` | `#FFFFFF38` |
| `shadow-color-4` | glass / raised | `--qd4450b` | `#00000014` |
| `shadow-border` | `.shadow-border` | `--q39f442` | `0 0 0 1px #0000000F, 0 1px 2px -1px #0000000F, 0 2px 4px 0 #0000000A` |
| `shadow-raised` | `.shadow-button-raised` | `--q8fc351` | `0 1px 3px #0000000A, inset 0 0 0 1px #0000000F, inset 0 -1px 0 #0000001A, inset 0 1px 0 #FFFFFF26` (resolved) |
| `shadow-focus` | `.focus:shadow-input-focus` | `--q449f7e` | `0 0 0 1px #DDDDDD, 0 0 0 3px #EEEEEE` |
| `sidebar-hover` | sidebar active overlay | `--q6921bb` | `#0000000A` |
| `sidebar-active` | sidebar active overlay | `--q4c3325` | `#00000012` |

> For dark themes, `sidebar-hover` / `sidebar-active` use the source values
> `#2C312D` / `#343B35` (forest-dark). The light values are translucent black
> overlays from the source's light theme block; using `fill-secondary` would
> produce the observed `#E5E5E5` active row.

### Where the readable names come from

The compiled CSS retains utility class names even though variable names are
hashed:

```css
.text-text-secondary { color: var(--q883115, var(--q883115)); }
.border-border-tertiary { border-color: var(--qbf30b8, var(--qbf30b8)); }
```

React source also contains the readable semantic names directly:

```js
// Composer shell, extracted from DIR8HOYO.js
"group/chat-composer relative flex min-h-[120px] flex-col overflow-visible
 border border-border-tertiary bg-bg-base
 rounded-2xl shadow-none" / "rounded-[20px] shadow-sm"
```

```js
// Sidebar item (session)
"group/sidebar-nav-item relative squircle-lg"
"flex h-7 w-full items-center ... text-[13px] leading-4 ..."
"text-text-tertiary" // inactive; "text-text" when active
```

---

## 3. Theme selectors

Source selector groups (exact ids):

```
:root[data-theme=light]
:root[data-theme=forest-light]
:root[data-theme=bee-light]
:root[data-theme=mint-light]
:root[data-theme=light-parchment]
:root[data-theme=forest-dark]
:root[data-theme=bee-dark]
:root[data-theme=mint-dark]
:root[data-theme=parchment-dark]
```

`dark` also exists as a sparse alias in source; the kit maps it to
`forest-dark` for a complete token set.

The extraction merged all rule blocks matching each id, in source order, and
then filled any missing token from the same brightness family. The full
semantic maps are in `tokens.json`; the raw 261-variable maps per theme were
retained during analysis to check completeness.

### Core theme values

| theme | primary | bg-layout | bg-container | fill-tertiary | text | border-tertiary | primary-bg |
|---|---|---|---|---|---|---|---|
| light | #4B6F5A | #FFFFFF | #FFFFFF | #F6F6F6 | #141414 | #E6E6E6 | #F2F4F2 |
| forest-light | #4B6F5A | #FFFFFF | #FFFFFF | #F6F6F6 | #141414 | #E6E6E6 | #F2F4F2 |
| bee-light | #0D0D0D | #FFFFFF | #FFFFFF | #F6F6F6 | #141414 | #E6E6E6 | #F2F4F2 |
| mint-light | #4FA98F | #F9FBF9 | #FFFFFF | #F6F6F6 | #2F4B2D | #E1EEE9 | #E6F5F0 |
| light-parchment | #C96442 | #FBFBFA | #FFFFFF | #F5F4F1 | #202116 | #EDE9E2 | #F1F0ED |
| forest-dark | #4D9C61 | #191B1A | #191B1A | #252B26 | #D9DCD9 | #363C37 | #14261C |
| bee-dark | #E0C65C | #10110E | #12130F | #23251F | #F2F1E8 | #30322D | #2E2916 |
| mint-dark | #62C9A8 | #0B110E | #0E1411 | #1A2420 | #EAF3EF | #27332E | #122A24 |
| parchment-dark | #E08A68 | #151310 | #171512 | #26221D | #F1ECE5 | #352F2A | #321F19 |

`forest-light` only changes four of the exported tokens relative to `light`
(`fill-secondary`, `button-raised-bg-hover`, `switch-off-bg`,
`switch-off-border` all become `#00000012`), which is why its theme preview is
nearly identical. This is source behavior, not a merge bug.

### Accent palette (light)

| name | base | bg |
|---|---|---|
| blue | #3F8EF7 | #E1EDFD |
| orange | #EA873F | #FCF0E0 |
| yellow | #F2C647 | #FDF3D3 |
| pink | #DA5597 | #F5E4F2 |
| purple | #605CE5 | #EBE9FD |
| teal | #55B5A6 | #E3F6F1 |
| sage | #7CB196 | #F0F3F2 |
| mauve | #8E8C98 | #F1F2F3 |
| lavender | #B49EF9 | #EBE4FD |
| slate | #20293A | #E3E8EF |

---

## 4. Layout / window evidence

### Main process window options

`electronMain.js` (obfuscated) contains:

```js
titleBarOverlay: { color: BT, height: tnx }, // const tnx = 40
```

Qoder also sets a `window-controls-overlay` layout and uses:

```js
const WINDOW_CONTROLS_OVERLAY_SAFE_WIDTH = "env(titlebar-area-width, calc(100% - 138px))";
```

### WorkbenchFrame

From renderer source:

```js
defaultSidebarSize: 238,
minSidebarSize: 180,
maxSidebarSize: 420,
minContentSize: 320,
windowControlsMode: "native" // or window-controls-overlay / windows-overlay
```

The app route passes:

```js
minSidebarSize: 208,
defaultSidebarSize: 248,
```

which is why the kit defaults to **248** with **208–420** bounds.

Content region classes:

```
loop-chrome-shell p-0
[&_[data-layout-region=b]]:m-1
[&_[data-layout-region=b]]:w-[calc(100%-0.5rem)]
[&_[data-layout-region=b]]:border
[&_[data-layout-region=b]]:border-border-tertiary
[&_[data-layout-region=b]]:shadow-[-4px_0_12px_-8px_var(--q6a99cd)]
```

Content corner source:

```css
.workbench-content-corner { border-radius: 8px; }
:root[data-native-window-corner-profile=large] .workbench-content-corner { border-radius: 1rem; }
```

### Showcase workbench shell

The showcase website (`index.html` + `showcase.css`) reuses the WorkbenchFrame above
instead of a marketing header, at viewports ≥ 1001px:

| Region | Source evidence | Showcase value |
|---|---|---|
| Sidebar `aside[data-layout-region=a]` | `CMOdY8kL.js`: `relative flex size-full flex-col overflow-hidden`, header `flex h-10 shrink-0 items-center px-3`, chrome background | fixed, `defaultSidebarSize` **248px** (`minSidebarSize` **208px** at 1001–1240px), `fill-tertiary` |
| Content `[data-layout-region=b]` | `m-1`, `border border-border-tertiary`, `shadow-[-4px_0_12px_-8px_var(--q6a99cd)]`, `workbench-content-corner bg-bg-layout` | 4px inset, 1px `border-tertiary`, radius `1rem`, `#0000001a` side shadow |
| Sidebar heading | `DIR8HOYO.js` settings sidebar: `mb-0.5 flex h-[18px] items-center px-2 text-[12px] font-medium leading-4 text-text-quaternary` | same |
| Sidebar item | `bz2 = "relative z-[1] flex h-7 w-full justify-start gap-2 squircle-lg px-2 text-left text-[12px] font-normal leading-4"`, icon `size-3.5` | 28px row, 8px padding, 12px text, 14px icon |
| Item indicator | `group/settings-sidebar-nav-item`: `backgroundColor: active ? var(--q4c3325) : var(--q6921bb)` (light `#00000012` / `#0000000a`), variants `rest {opacity:0, scale:.9}` → `selected/hover {opacity:1, scale:1}`, spring 420 / 26 / .75 | `--q-sidebar-active` / `--q-sidebar-hover`, opacity + scale .9 → 1 with an overshooting cubic-bezier (CSS approximation of the spring) |

Below 1001px the shell collapses to the single-column page with the navigation sheet.

### Chat width

```css
:root { --q8ad7df: 768px; }
html[data-chat-width=wide] { --q8ad7df: 968px; }
```

`--q8ad7df` is used as the max-width for chat content and composer.

### Composer

From `function zd` in `DIR8HOYO.js`:

```
group/chat-composer relative flex min-h-[120px] flex-col overflow-visible
border border-border-tertiary bg-bg-base rounded-[20px] shadow-sm
focus-within:border-border-secondary focus-within:shadow-md
```

Editor:

```
relative min-h-[52px] flex-1 data-chat-composer-editor-shell
loop-rich-editor h-full min-h-[52px] overflow-y-auto whitespace-pre-wrap
break-words px-4 py-3 text-sm leading-6 text-text outline-none
```

Toolbar:

```
flex min-w-0 shrink-0 items-center border-t border-dashed border-border-tertiary/60
min-h-11 gap-1 px-1.5 pb-2 data-chat-composer-toolbar
```

Toolbar selectors use Inter:

```js
const composerToolbarFontClass =
  "[font-family:Inter,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_sans-serif]";
const selectorClass = "chatComposerToolbarSelectorText h-7 px-2 py-0 text-xs !font-normal leading-4";
```

### User message

```
flex flex-col items-end gap-2 max-w-[752px] min-w-0 w-full
squircle-2xl relative max-w-full overflow-hidden bg-primary-bg
px-[13px] py-2.5 text-xs font-normal leading-4 text-text whitespace-pre-wrap break-words
max-h-[100px] // collapsed state
```

### Chat font-size setting

```css
html[data-font-size=small]  [data-chat-session-conversation-viewport] [data-part-type=text] { font-size:13px!important; line-height:24px!important; }
html[data-font-size=medium] ... { font-size:14px!important; line-height:24px!important; }
html[data-font-size=large]  ... { font-size:16px!important; line-height:28px!important; }
```

The kit exposes this as `.q-app[data-font-size=...] .q-prose`.

---

## 5. Component evidence

### Button

Source (CMOdY8kL.js) — abbreviated:

```js
const Button = React.forwardRef(({ variant="ghost", size="md", textButton=false,
  rounded="square", disabled=false, ...}) => {
  const base = clsx(
    "inline-flex items-center transition-[color,background-color,outline-color,...] duration-150",
    size !== "custom" && "justify-center",
    rounded === "pill" && "squircle-full",
    rounded === "square" && "squircle-2xl"
  );
  const sizes = {
    sm: text ? "gap-1 py-0.5 text-xs font-medium leading-4"
             : "h-5 gap-1 px-2 py-0.5 text-xs font-medium leading-4",
    md: text ? "gap-1.5 py-1.5 text-[13px] font-medium leading-4"
             : "h-7 gap-1.5 text-[13px] font-medium leading-4" + (prefixIcon ? "pl-2.5 pr-3.5" : "px-3"),
    lg: text ? "gap-2 py-2 text-sm font-medium"
             : "h-9 gap-2 px-4 py-2 text-sm font-medium"
  };
  const variants = {
    primary: "bg-primary text-text-on-primary hover:bg-primary-hover focus-visible:bg-primary-active",
    secondary: "bg-bg-highlight text-text-on-primary hover:bg-bg-highlight-hover",
    tertiary: "bg-fill-secondary text-text hover:bg-fill",
    ghost: "bg-transparent text-text-secondary hover:bg-fill-secondary hover:text-text",
    text: "bg-transparent text-text-secondary hover:text-text",
    outline: "border border-border-tertiary bg-bg-base text-text hover:bg-fill-secondary",
    raised: "bg-button-raised-bg text-text shadow-button-raised ...",
    destructive: "bg-error text-text-on-primary hover:bg-error/90"
  };
});
```

The kit's `.q-btn` reproduces these values, including the `squircle` corners.

### IconButton

```
"inline-flex items-center justify-center duration-150 ease-out"
"focus-visible:outline-none"
square && "squircle-2xl"
secondary: "border border-border-tertiary bg-bg-base hover:bg-fill-tertiary ..."
ghost: "bg-transparent hover:bg-fill-tertiary ..."
sizes: sm "size-5 p-1.5", md "size-7 p-1.5", lg "size-9 p-2"
toolbar: 28px, radial-gradient + inset highlight
```

### Menus / popovers

```
Dropdown content:
z-50 w-fit min-w-[8rem] overflow-hidden rounded-lg border p-1
floatingLayerBaseClassName (border-border-tertiary text-text + glass shadow)
solid surface: bg-bg-container

Item:
relative flex w-full min-w-0 cursor-pointer select-none items-center whitespace-nowrap
gap-2 rounded-sm p-2 text-xs
hover:bg-fill-secondary focus:bg-fill-secondary data-[highlighted]:bg-fill-secondary
```

### Dialog

```
fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2
rounded-xl border border-border-tertiary bg-bg-base text-text shadow-lg p-6
sizes: max-w-sm / max-w-lg / max-w-2xl / max-w-4xl
overlay: bg-bg-mask/60, backdropFilter var(--qd1b3f1) // blur(16px)
title: text-base font-medium leading-6
description: text-sm leading-6 text-text-tertiary
close: right-4 top-[21px]
```

### Tabs

```
TabsList segmented: gap-0.5 overflow-hidden squircle-xl bg-fill-secondary p-0.5
TabsTrigger: squircle-lg px-2 py-1 text-[13px] leading-4 font-medium
active: bg-bg-base shadow-sm; inactive: text-text-tertiary
pills: px-3 py-1.5; active bg-fill-secondary
line: gap-3 / compact gap-4; active font-semibold
```

### Tooltip

```
fixed z-[1000] w-max
tooltip-content inline-block max-w-[240px] whitespace-normal break-words
rounded-md px-2 py-1.5 text-xs leading-[14px] shadow-lg
light: bg-bg-highlight text-text-on-primary
dark: bg-neutral-900 text-text border border-border-tertiary
```

### Switch

Re-audited on 2026-10-24 against the installed 0.4.8 build. Exact compiled
recipes and asset SHA-256 values are in [source-evidence/controls.json](source-evidence/controls.json).
The implementation has **two spans**, not a pseudo-element:

```text
button: role=switch, type=button, aria-checked, rounded-full, border
  span[data-switch-thumb]: relative block, fixed square, transform only
    span[data-switch-visual]: absolute top-0, rounded-full, width only
```

| Size | Root | Thumb | Hover width | Attraction width | Off / on translation |
|---|---|---|---|---|---|
| md | 32 × 20 | 16 × 16 | 18px | 24px | 1px / 13px |
| sm | 28 × 16 | 12 × 12 | 14px | 20px | 1px / 13px |

Both track and visual use **round** corners. The source does not apply
`squircle` to Switch. The source visual width hash is `--q69124d` for hover;
`--qb9d00d` is resting width, `--q88ca86` is attraction width.

```text
on:     border-transparent bg-[var(--q1c50a8)]
off:    border-[var(--qace5a8)] bg-[var(--q079bfd)]
visual: bg-[var(--q292341)] drop-shadow-[0_2px_2px_var(--qd4450b)]
focus:  border-primary-border (no ordinary extra ring)
```

The track transitions for 120ms with `ease-out`. Thumb translation uses
150ms `cubic-bezier(.4,0,.2,1)`. Visual width normally transitions for 200ms
with `ease-out`, shortened to 150ms on hover. Hover is restricted to
`(hover: hover) and (pointer: fine)` and excludes disabled controls and
controls with an active `data-switch-motion` attribute.

A pointer click (`event.detail > 0`) sets `data-switch-motion=on|off`.
Translation waits 60ms and then runs for 90ms. Width runs a 150ms animation:
hover width → attraction width at 33.333% → hold until 40% → resting width.
The expanding visual anchors left for on and right for off; a resting
checked visual anchors right. `pointerenter` clears the motion attribute,
matching the React component. Keyboard clicks (`detail=0`) toggle without
attraction. Reduced motion disables animations and transitions.

The kit also supports `aria-disabled` and Windows forced-colors as Web
adaptations. Native `disabled`, accessible names and keyboard activation
are preserved. Legacy empty `button[data-q-switch]` markup is upgraded by
`QSwitch.init()`; new examples include both spans before JS runs.

### Kbd

```
inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded
border text-[11px] leading-4
default: border-border-tertiary bg-bg-highlight text-text-on-primary shadow-[0_1px_0_0_var(--qbf30b8)]
font-family: "Geist", -apple-system, ...
```

The kit uses Inter for Kbd because Geist is not bundled in the Qoder build.

### Sidebar item

```
group/sidebar-nav-item relative squircle-lg
session row: flex h-7 w-full items-center squircle-lg pr-1 text-[13px] leading-4
inactive text-text-tertiary; active text-text
background overlays:
  active var(--q4c3325) (#00000012 light)
  hover  var(--q6921bb) (#0000000A light)
```

### Loading animations

There are two source layers: the **boot splash** in `out/renderer/index.html` and the
runtime **Loader** component whose styles are injected by
`LoaderStyles` inside `CMOdY8kL.js`.

Boot splash (verbatim values):

```css
#qoder-boot-splash {
  position: fixed; inset: 0; z-index: 2147483647;
  display: grid; place-items: center;
  background: var(--qoder-boot-bg); /* --q1d295b, i.e. bg-layout */
  -webkit-app-region: drag;
}
#qoder-boot-splash[data-hidden="true"] {
  opacity: 0;
  transition: opacity 120ms ease-out;
}
.qoder-boot-logo {
  --qoder-boot-logo-size: 72px;
  opacity: .6;
}
.qoder-boot-logo__base {
  animation: qoder-boot-logo-breath 2.15s linear infinite;
  filter: blur(0.18px);
}
.qoder-boot-logo__bottom-blur {
  filter: blur(24px);
  opacity: .58;
  mask-image: mask, linear-gradient(to bottom, transparent 70%, black 100%);
}
.qoder-boot-logo__sweep span {
  background: radial-gradient(...);
  filter: blur(10px);
  transform: translateY(-120%) rotate(-24deg) scale(1.18);
  animation: qoder-boot-logo-sweep 2.15s cubic-bezier(.28, 0, .62, 1) infinite;
}
@keyframes qoder-boot-logo-sweep {
  0% { transform: translateY(-120%) rotate(-24deg) scale(1.18); }
  72% { transform: translateY(120%) rotate(-24deg) scale(1.18); }
  100% { transform: translateY(120%) rotate(-24deg) scale(1.18); }
}
@keyframes qoder-boot-logo-breath {
  0%, 100% { opacity: 1; }
  62% { opacity: .86; }
}
```

Runtime Loader (`Loader$1`):

- API: `variant="spinner"`, `size=32`, `speed=1`.
- CSS variables: `--q690118 = size px`, `--q89b2d4 = speed s`.
- `qoder-logo`: base breath `speed × 2.15`; bottom blur `size × 0.34`; sweep `speed × 2.15`.
- `spinner`: SVG circle + arc, `qoder-loader-spin var(--q89b2d4) linear infinite`.
- `dots`: 18% dots, 1×speed, delays -0.78 / -0.56.
- `bars`: 5 × (10% × 58%), 1.15×speed, delays -0.46…-0.1.
- `matrix`: 3×3, 1.35×speed, diagonal delays -0.2…-0.8.
- `comet`: ring 82%, border size × 0.045, dot size × 0.16, glow size × 0.2, 1×speed.
- Reduced motion → `qoder-loader-calm` pulse; logo sweep hidden.

Thinking indicator (`index-DT-bZ071.css`):

```css
.qoder-thinking-dot-matrix {
  width: 12px; height: 12px;
  grid-template-columns: repeat(3, 2.5px);
  grid-template-rows: repeat(3, 2.5px);
  align-content: space-between;
  justify-content: space-between;
}
.qoder-thinking-dot-matrix__dot {
  width: 2.5px; height: 2.5px;
  opacity: .28;
  animation: qoder-thinking-dot-matrix 1.4s ease-in-out infinite;
}
@keyframes qoder-thinking-dot-matrix {
  0%, 100% { opacity: .24; transform: scale(.72); }
  36% { opacity: 1; transform: scale(1); }
  68% { opacity: .44; transform: scale(.82); }
}
```

The kit reproduces the timings and proportions. Qoder's boot logo is a
proprietary line-art mask; the kit uses its own compact QDK mark as the
`--q-loader-mask` and documents how to swap in a brand mark. The website's
identity uses the separately extracted official CN mark described below.
The original boot/loading-line asset is not shipped.

### Website brand / official CN mark

Source: `out/renderer/assets/qoderCnIdeLogo-D6M-8wQq.svg` from Qoder CN 0.4.8.
The original file is preserved in `source-evidence/brand/qoder-cn-ide-original.svg`;
`source-evidence/brand.json` records its hash, both source path hashes, the
Instrument Sans Medium font hash, and the hashes of exported SVGs.

The two green paths are preserved, including `#2ADB5C` and second-layer
opacity `0.5`. Only the white app-icon background is removed and uniform
scaling/placement is applied. The 144×48 Qoder / DESIGN KIT wordmark is a new
website composition with outlined text; it is not an official Qoder wordmark.
Light, dark, monochrome, standalone-mark and favicon exports are provided.
Header, footer, auth example and closing banner share the same source mark.

See [BRAND.md](BRAND.md) and [the asset preview](assets/brand/preview.html).
`tools/extract-brand.py` reproduces the exports without changing the client.
Qoder's brand rights remain with its rights holder. The brand checks and
screenshots are recorded in [source-evidence/brand-verification.json](source-evidence/brand-verification.json).

### Visual effects / gradients

Qoder layers several low-contrast effects rather than using flat surfaces.

**Shell wash and noise** (`index-DohubooF.css`, `.loop-chrome-*`):

```css
.loop-chrome-shell { background: var(--qbb40b5); }
.loop-chrome-window { background: var(--q5b417c); background-color: var(--q1d295b); }
.loop-chrome-shell:before {
  content: "";
  position: absolute; inset: 0;
  background-image: var(--qc5b575);   /* noise-Bbnt96hm.webp */
  background-repeat: repeat;
  background-size: var(--qe1993d);    /* 50px */
  opacity: var(--qcfc410);            /* 0 / .2 / 1 */
  pointer-events: none;
}
.loop-chrome-content {
  background: var(--q1b2d87);
  -webkit-backdrop-filter: blur(var(--qf422db)); /* 0px on Windows */
}
```

Source values seen per theme:

| theme | `--qbb40b5` shell | `--q5b417c` window | noise |
|---|---|---|---|
| light | `var(--q676eb9)` (#EFEFEF) | bg-layout | none |
| forest-light | `#ffffff80` | transparent (win32: bg-layout) | webp, opacity .2 |
| bee-light | `#ffffff38` | `linear-gradient(180deg,#e6e6b6,#c4d0da)` | none |
| mint-light | `#c9e8dd8a` | transparent (win32: #c9e8dd) | none |
| light-parchment | `#ffffffbd` | #fdfcfa | none |
| forest-dark | `#242624` | #242624 | webp, opacity 1 |
| bee-dark | `#10110e` | bg-layout | none |
| mint-dark | `#112820` | bg-layout | none |
| parchment-dark | `#292017` | bg-layout | none |

The kit keeps the visible light chrome as fill-tertiary, applies the theme wash as a background layer on `.q-window`, and makes the titlebar/sidebar transparent so the wash can show. The noise webp is replaced by a generated SVG turbulence with normalized opacity (`.018` forest-light / `.035` forest-dark).

**Glass** (`glassSurfaceClassName`, `PopoverContent`):

```js
const glassSurfaceClassName = "shadow-[0_8px_18px_-8px_var(--q6a99cd),0_18px_42px_-20px_var(--qd4450b),inset_0_1px_0_color-mix(...)]";
const glassSurfaceStyle = {
  background: "var(--q2be96d)",
  backdropFilter: "var(--q0657b5)"
};
```

- base `--q2be96d: var(--q79944a)` (solid);
- `:root:not([data-platform=win32])` → `linear-gradient(180deg, var(--qb28b89) 0%, var(--q35d916) 100%)`;
- another non-win variant → 64% / 42% translucent stops;
- `--q0657b5: none` on Windows, `blur(40px) saturate(150%)` on non-Windows;
- `data-visual-effects=off` resets glass to solid and blur none.

The kit's `.q-glass` uses the non-Windows gradient + blur to expose the full recipe; default menus remain solid `bg-bg-container`.

**Composer gradient**:

```css
.chat-composer-home-surface {
  background: linear-gradient(0deg, var(--qb28b89) 68%, var(--q9bc9e9) 100%);
}
html[data-theme$=-dark] .chat-composer-home-surface {
  background: linear-gradient(0deg, var(--qb28b89) 68%, color-mix(in srgb,var(--qb28b89) 62%,var(--q9bc9e9)) 100%);
}
```

**Scroll fade**:

Source uses CSS scroll-driven animations with a mask gradient:

```css
/* simplified */
mask-image: linear-gradient(to bottom, transparent, black var(--start-fade),
  black calc(100% - var(--end-fade)), transparent);
--q461433: min(12%, 40px);  /* fade size */
--qdea196: 96px;            /* animation range */
```

`scroll-fade-y` animates the top/bottom stops with `scroll(self y)`. The kit uses a JS-toggled mask (`data-q-scroll-fade`, 40px cap) for compatibility and applies it to the chat timeline, command palette result list, and the effects demo.

**Theme transition**:

```js
const THEME_TRANSITION_DURATION = 160;
document.documentElement.dataset.qoderThemeTransition = "fade";
document.documentElement.style.setProperty("--q6822d0", "160ms");
document.startViewTransition(update).finished.finally(cleanup);
```

```css
@keyframes qoder-theme-transition-fade-out { from { opacity: 1 } to { opacity: 0 } }
@keyframes qoder-theme-transition-fade-in { from { opacity: 0 } to { opacity: 1 } }
html[data-qoder-theme-transition=fade]::view-transition-old(root) {
  animation: qoder-theme-transition-fade-out var(--q6822d0) ease-out both;
}
html[data-qoder-theme-transition=fade]::view-transition-new(root) {
  animation: qoder-theme-transition-fade-in var(--q6822d0) ease-out both;
}
```

The kit uses 160ms, skips the transition when reduced motion or `data-visual-effects=off`, and falls back to immediate application when `document.startViewTransition` is unavailable.

**New chat pointer field**:

Qoder uses a canvas field with `cellSize: 24`, `radius: 72`, `holdTime: 220`, `fadeDuration: 720`, `lineWidth: 0.4`, `maxOpacity: 0.42`, `gridOpacity: 0`. The kit's `.q-dot-field` is a lightweight CSS/JS equivalent: 24px dot cells and a 144px pointer-follow glow; it fades in over 450ms.

**Gradient text**:

```css
background: linear-gradient(100deg, var(--q0704b8) 20%, var(--q1c50a8) 100%);
background-clip: text;
color: transparent;
```

The kit maps this to `.q-text-gradient`.

### New chat, surfaces and Agent patterns

**New chat / welcome** (`DIR8HOYO.js`):

```
pt-[clamp(64px,14dvh,220px)]        // welcome container top padding
max-w-[924px]                        // centered content
h1 text-[20px] font-medium leading-8 text-text
p  text-[20px] font-medium leading-6 text-text-quaternary
newChatWorkspacePromptTrigger:
  !text-[20px] !font-medium !leading-6 !text-text-quaternary
  underline decoration-border-secondary underline-offset-4
composer wrapper max-w-[768px]
```

The kit mirrors these numbers in `.q-welcome`; the four starter-prompt cards
are a kit extension (the source surface is primarily a doodle + greeting +
workspace line + composer).

**Auth / login**:

```
w-[calc(100vw-32px)] max-w-[690px] minHeight:446
rounded-xl bg-bg-base shadow-natural-sm
```

The kit uses the same card dimensions and split layout, with a QDK art panel
instead of Qoder's proprietary login poster/video.

**Composer context**:

```
"flex min-w-0 flex-wrap gap-1.5 px-3 pt-3"
"data-chat-composer-context-tags": true

PropertyTag:
"h-6 min-w-0 max-w-full shrink-0 gap-1 rounded-md border
 border-border-quaternary bg-fill-tertiary pl-1 pr-1.5 py-0
 text-xs font-normal leading-[18px] text-text-secondary"
```

The attachment card (44px), error banner (11px) and context chip (24px) in the
kit follow the same surface/typography scale.

**Command palette / Agent activity / HoverCard / context menu**:

These are patterns composed from Qoder's existing dialog, menu, badge, card and
activity tokens rather than new design languages. The command palette uses
`rounded-xl + bg-bg-container + shadow-lg` from Dialog, 34px menu-like rows, and
`q-kbd` metadata. Agent activity reuses 10/12px card surfaces, success/error
colors and mono file paths. HoverCard uses the source class values
`w-64 rounded-lg border-border-tertiary bg-bg-base text-text shadow-lg`.
Context menus are the same `.q-menu` recipe positioned at the pointer.

### Fonts

Root renderer rule:

```css
:root {
  color: var(--q0704b8);
  background: var(--q1d295b);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --qd72db4: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --qc6371b: "Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif;
}
```

Composer toolbar font:

```js
"[font-family:Inter,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_sans-serif]"
```

Font assets included in the kit:

- Inter 400/500/600 latin woff2 (from app assets)
- Instrument Sans 400/500 latin woff2
- Crimson Pro 400/600 latin woff2
- all OFL licensed

### Motion / radii / spacing

- Tailwind v4 radius defaults: `--radius-xs .125rem`, `sm .25rem`, `md .375rem`,
  `lg .5rem`, `xl .75rem`, `2xl 1rem`.
- Spacing base: `--spacing: .25rem` (4px).
- Qoder squircle utilities:
  `.squircle-lg { corner-shape:squircle; border-radius:.5rem }`
  `.squircle-xl { corner-shape:squircle; border-radius:.75rem }`
  `.squircle-2xl { corner-shape:squircle; border-radius:1rem }`
- Motion constants:
  `MICRO_TRANSITION = { duration: .15, ease: [.2,.8,.2,1] }`
  `LAYOUT_TRANSITION = { duration: .22, ease: [.2,.8,.2,1] }`
  drawer `width .32s cubic-bezier(.25,.1,.25,1)`.

### Product surfaces (batch 3)

These components come from `DIR8HOYO.js` (app surfaces) and `CMOdY8kL.js`
(shared UI primitives) plus the compiled CSS in `index-DohubooF.css` /
`index-DT-bZ071.css`.

#### Settings page

The settings route is a **full-page surface**, not a drawer. Source root:

```js
// UD() — settings route
loop-chrome-shell p-0
  [&_[data-layout-region=b]]:m-1
  [&_[data-layout-region=b]]:size-[calc(100%-0.5rem)]
  [&_[data-layout-region=b]]:border
  [&_[data-layout-region=b]]:border-border-tertiary
  [&_[data-layout-region=b]]:shadow-[-4px_0_12px_-8px_var(--q6a99cd)]
sidebarClassName: "loop-chrome-sidebar"
```

Sidebar:

```js
search input:  className="h-8 pl-8 text-[12px]"
nav item:      h-7 w-full squircle-lg px-2 text-[12px] leading-4
               selected background var(--q4c3325)
nav heading:   12px / 16px, text-text-quaternary, opacity .6
```

Content and settings rows:

```js
// content column
"mx-auto w-full max-w-[820px] px-8 pb-12 pt-2"
// page title
<h1 className="text-[20px] font-medium leading-8 text-text">
// section header
"flex h-11 w-full items-end px-4" + "text-[12px] leading-[18px] text-text-tertiary"
// settings group r0
"w-full overflow-hidden rounded-xl border border-border-tertiary bg-bg-container px-4 shadow-surface-subtle"
// settings row he
"border-b border-dashed border-border-tertiary last:border-b-0 py-3.5"
title: "text-[13px] font-normal leading-5 text-text"
desc:  "mt-1 text-[12px] leading-[18px] text-text-tertiary"
```

Theme preview (`$Ue`):

```js
"group min-w-0 cursor-pointer"
frame:  "relative block aspect-[8/5] overflow-hidden rounded-lg border bg-fill-tertiary"
selected: "border-primary shadow-[inset_0_0_0_1px_var(--q1c50a8)]"
label:  "mt-2 block text-center text-[12px] leading-4"
        selected → font-semibold text-text
```

The kit keeps these dimensions. `loop-chrome-sidebar` is transparent, so the
sidebar uses the surface wash and the content region gets the 4px inset with
8px radius. `shadow-surface-subtle` was not among the mapped hash values; the
kit approximates it with `--q-natural-shadow-sm`.

#### Radio / Slider

Shared primitives in `CMOdY8kL.js`:

```js
// RadioGroupItem
"size-4 shrink-0 rounded-full border border-[var(--q015283)] outline-offset-2"
"data-[state=checked]:border-[var(--q0704b8)] data-[state=checked]:bg-[var(--q0704b8)]"
"data-[state=checked]:text-[var(--qb28b89)]"
// indicator
<span className="size-2 rounded-full bg-current" />

// Slider
root track:  "rounded-full bg-fill-secondary"
             md → h-2, sm → h-1
range:       "absolute rounded-full bg-primary"
thumb:       md → size-5 border-2, sm → size-3 border
             "border-primary bg-bg-base shadow-natural-sm"
focus:       "border-primary-border bg-primary-bg"
```

Source semantics: `q015283` = border token, `q0704b8` = text, `qb28b89` =
bg-base. The selected radio is therefore a **text-colored** disc; the selected card
variant adds a primary outline without changing the primitive radio color.
The unselected border uses `--q015283` (semantic `border`), and the 8px
indicator uses `--qb28b89` (`bg-base`).

The slider's source `getThumbInBoundsOffset(width, percent, direction)` is
also extracted in `source-evidence/controls.json`. For LTR it places the
center at `thumbWidth/2 + (trackWidth - thumbWidth) * percent/100`.
The kit uses this interpolation rather than clamping the center only at
the ends. Its invisible native thumb matches the visual 20px/12px thumb;
the native range therefore uses the same pointer geometry. Only user input
emits `q:slider`; initialization and resize synchronize the visual silently.

#### File tree

Source primitives (`CMOdY8kL.js`):

```js
root default: "text-[13px] leading-5"
root compact: "text-[12px] leading-4"
card variant: "rounded-lg border border-border-tertiary bg-bg-container" + "p-2"
virtual row:  compact 28px / default 32px
              "text-text-secondary hover:bg-fill-secondary hover:text-text"
              selected → "bg-fill-secondary text-text"
row padding:  paddingLeft: 8 + depth * 14
chevron box:  h-5 w-5, rotate-90 when expanded
icons:        14px compact / 16px default
```

Extension colors are per-extension hashed tokens (`--qd990cd` for ts/tsx,
`--q4ec2e9` for js, etc.). Those hashes were not all semantically mapped, so
the kit substitutes the nearest accent token per family and documents the
choice in the README.

#### Terminal

From `w11()` in `DIR8HOYO.js`:

```js
header:  "min-h-11" (44px)
tabs:    28px tab shell with 3.5 icon and close action
actions: split right / split down / new / light-dark / close
title:   "newChat.terminalPanel"
theme:   terminalThemeMode = follow | manual
```

xterm colors are resolved from the editor/terminal theme. The chunk includes
the VS Code default ANSI fallback:

```js
black #000000  red #cd3131   green #0DBC79  yellow #E5E510
blue  #2472C8  magenta #BC3FBC  cyan #11A8CD  white #E5E5E5
brightBlack #666666  brightRed #F14C4C  brightGreen #23D18B
brightYellow #F5F543  brightBlue #3B8EEA  brightMagenta #D670D6
brightCyan #29B8DB   brightWhite #FFFFFF
```

The demo uses these values, a 12px mono screen, green/yellow prompt accents,
and a 44px header. It intentionally does **not** ship xterm or a Pty.

#### Chart

The compiled CSS is fully available even though the Recharts component is
lazily bundled:

```css
.qoder-chart { font-size:12px; line-height:16px; color:var(--q883115); }
.qoder-chart-plot { height:240px; }
.qoder-chart[data-size=sm] .qoder-chart-plot { height:200px; }
.qoder-chart[data-size=lg] .qoder-chart-plot { height:360px; }
.qoder-chart .recharts-cartesian-axis-tick text { fill:var(--q9ab642); font-size:12px; }
.qoder-chart-tooltip {
  max-width:min(280px,70vw); padding:8px 12px;
  border:1px solid var(--qbf30b8); border-radius:8px;
  background:var(--q79944a); box-shadow:var(--q948c0d);
}
.qoder-chart-tooltip-title { margin-bottom:8px; font-size:11px; color:var(--q9ab642); }
.qoder-chart-tooltip-row + .qoder-chart-tooltip-row { margin-top:4px; }
.qoder-chart-value { font-family:ui-monospace; font-variant-numeric:tabular-nums; font-size:14px; }
.qoder-chart-legend { gap:8px 24px; margin-bottom:16px; }
.qoder-chart-indicator:empty[data-indicator=line] { width:4px; border-radius:2px; }
```

Semantic mapping: `q883115` → text-secondary, `q9ab642` → text-tertiary,
`qbf30b8` → border-tertiary, `q79944a` → bg-container, `q948c0d` → shadow-sm.
The kit reproduces the structure with a static SVG and adds a JS tooltip/guide.
Series colors are an interpretation (primary + accent-blue) because they are
passed as Recharts props rather than static CSS.

#### Stacked empty state

Exact source CSS, reproduced in `.q-empty--stacked` / `.q-empty__stack`:

```css
.qoder-empty-state-stacked { width:100%; padding-block:32px; }
.qoder-empty-state-stack { width:48px; height:48px; margin-inline:auto; isolation:isolate; }
.qoder-empty-state-stack:before/after {
  inset:4px 0 0; border:1px solid var(--qbf30b8);
  border-radius:12px; background:var(--qb28b89);
}
:before { transform:translate(-6px) rotate(-12deg); }
:after  { transform:translate(6px) rotate(12deg); }
hover: ±18deg, face translateY(-2px); transition 160ms cubic-bezier(.2,.8,.2,1)
title: 16px/24px 700, letter-spacing -.025em,
       linear-gradient(100deg,var(--q0704b8) 20%,var(--q1c50a8) 100%) clip:text
desc:  max-width:560px; margin-top:10px; font-size:12px; line-height:16px;
       color:var(--q883115)
action: flex; gap:8px; margin-top:16px
```

Generic empty state (`a0`): 48px mark, 13/20 medium secondary title, 11/20
quaternary description, 32px padding.

---

## 6. Interpretations / non-verbatim details

These are the few places where an exact semantic name was not available in
source and a documented choice was made:

1. **`--q-natural-shadow-md`** — Qoder uses `shadow-natural-md` in source class
   strings, but the static class was not found in the bundled CSS. The kit uses
   the source `glassSurfaceClassName` shadow as the medium natural elevation:
   `0 8px 18px -8px ..., 0 18px 42px -20px ..., inset 0 1px 0 ...`.
2. **Sidebar overlays** — light theme literals `#00000012` / `#0000000A`
   are taken from direct `--q4c3325` / `--q6921bb` definitions; dark themes use
   the source theme values.
3. **Menu glass surface** — light theme has `glassSurfaceStyle.backdropFilter`
   = `none`; the kit exposes `.q-popover--glass` but defaults menu surfaces to
   solid `bg-bg-container`, matching Qoder's default `surface="solid"`.
4. **Icons** — Qoder custom icon components (`Qoder*Line`, `Qoder*Fill`) are
   replaced by Tabler equivalents. The visual grammar (24 grid / 2px stroke /
   round caps) is preserved. The official CN brand mark is separately included
   for the website identity; see the brand section above.
5. **Kbd font** — Geist is referenced by Qoder but not shipped; Inter is used.
6. **Component JS** — Radix primitives, Motion, and Sonner are replaced with
   vanilla equivalents. Visual specs are source-derived; exact animation frames
   may differ by a few milliseconds.
7. **Values in nested theme previews** — the kit applies theme tokens to any
   `[data-theme=...]` element (not only `:root`) so theme cards can be
   previewed in place.
8. **Boot / Loader logo** — Qoder's `qoder-loading-line-*.svg` is not shipped;
   the animation timings are preserved but the mask is the kit's own abstract
   mark. Override `--q-loader-mask` if you have your own brand line art.
9. **Auth artwork** — Qoder's login poster/video is not shipped. The 690×446
   card geometry is source-derived; the left-side gradient/grid and wordmark
   composition are the kit's own, while the CN mark is extracted from source.
10. **Command palette / Agent activity** — Qoder has equivalent internal
    components, but these are re-composed from its shared dialog/menu/activity
    tokens for reuse. Treat them as source-consistent patterns, not verbatim
    markup.
11. **Surface effects** — The noise webp is replaced by SVG turbulence with
    normalized opacity; the new-chat canvas is replaced by a CSS/JS dot field;
    scroll fades use JS state rather than scroll-driven animations. The
    original theme-transition timing (160ms), masks, gradient stops, and wash
    values are preserved.
12. **Settings route** — Source renders settings as a full route using the
    loop-chrome shell. The kit reproduces three panels (general, appearance,
    terminal) plus a read-only shortcuts reference. Account, models, hooks,
    memory, voice and other source sections are omitted rather than faked.
13. **Terminal** — Source uses xterm plus a Pty. The kit reproduces the header,
    tab strip, terminal themes and ANSI palette but simulates input with a
    small command map; there is no shell execution.
14. **Chart series colors** — Recharts series colors are JS props, not static
    CSS. The kit uses primary for the main series and accent-blue for the
    dashed comparison series. All dimensions/typography/tooltip styles are
    source CSS.
15. **File-type icon colors** — The per-extension hashed tokens were only
    partially mapped to semantics. The kit maps families to accent tokens and
    labels this as an approximation.
16. **Settings theme previews** — Preview cards use nested `[data-theme]`
    scopes (source uses dedicated preview components). The visual dimensions
    and selected outline are copied; the mini page content is a QDK
    simplification.

---

## 7. Verification

Final checks were run with Playwright driving local Chrome against
`http://127.0.0.1:4173/`:

- 9 theme cards, 81 rendered icon tiles, inline sprite injected
- no page-level horizontal overflow at 1440 and 768
- nested theme tokens resolve independently
- titlebar menu / Escape, permission menu, dialog open+close, tabs,
  tooltip, switch, composer send/stop, theme select, theme card,
  sidebar collapse all pass
- no console errors, no failed requests (after favicon was added)
- Loader timings verified in browser: logo base/sweep 2.15s, spinner 1s,
  thinking 1.4s; boot overlay 72px and auto-fade; reduced-motion freezes the
  logo and hides the sweep; `QBoot.show/hide` and `data-q-boot-replay` work.
- Batch 2 verified: Ctrl/Cmd K palette open/filter/keyboard/theme command,
  sidebar-search trigger, context menu visibility, hover card, context chip /
  attachment / error banner removal, auth toast, tool details toggle; no
  overflow at 1440/1024/768/390.
- Visual effects verified: theme shell wash and noise values, glass
  `blur(40px) saturate(150%)`, pointer-field variables and opacity, dynamic
  scroll-fade state at top/mid/bottom, View Transition attribute during a
  theme change, and full shutdown via `data-visual-effects=off`.
- Batch 3 verified: file-tree expand/collapse/select, terminal typing
  (`ls`, `git status`, `clear`), new/close tab and dark/light toggle, chart
  hover tooltip + guide line, settings section nav/search filtering, theme
  preview switching, effects toggle, slider keyboard and output, plus no
  horizontal overflow at 1440/1024/768/390. Settings sidebar becomes a
  horizontal nav below 720px; account footer is hidden there.
- Settings DOM is a route-like page (248px sidebar, 4px content inset,
  820px column), confirming that no drawer component is needed for parity.

The interactive demo itself is the best reference: open `index.html`.


## 8. Reproducible control audit (2026-10-24)

Run `python tools/extract-controls.py PATH_TO_APP_ASAR`. The standard-library
script locates six shared control recipes in renderer chunks, records UTF-8
byte offsets and asset hashes, resolves source token aliases for nine themes,
and writes `source-evidence/controls.json`. It only reads the installed app
archive; it does not access app data or preferences.

This audit found that the existing 126 control-related theme tokens already
matched the source. The fixes were in geometry, corner treatment, motion,
focus styling, radio composition and disabled-state handling. The Switch
spec is also available as `tokens.json → components.switch`.

`examples/starter.html` imports only reusable assets and its own page
composition. The React and Vue switches are controlled components with the
same two spans, ARIA state and source motion attribute; they do not opt into
vanilla auto-binding. See [INTEGRATION.md](INTEGRATION.md).

The saved browser verification is [source-evidence/verification.json](source-evidence/verification.json).

The current control audit used Codex's in-app Chromium through Cua. React 19
and Vue 3 examples were compiled and mounted alongside the native runtime;
pointer/keyboard events, disabled states, repeated initialization and dynamic
insertion passed. The measured attraction peaks are 24px (MD) and 20px (SM).
Slider native hit testing and bounds, quiet resize synchronization, reduced
motion, forced colors, complete copied HTML and Starter persistence were
also checked. Both pages have no document overflow at 320, 390, 768, 1024
and 1440px with the code and theme reference expanded.

The web integration uses a revision guard when theme changes overlap and
skips stale transitions. The Starter opts out of document snapshot fading
to keep form edits and saving responsive. These are integration behaviors;
the showcase retains the source 160ms theme fade. This audit verifies the
shared controls and integration examples, not every Qoder client screen.
