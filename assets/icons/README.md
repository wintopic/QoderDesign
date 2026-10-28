# Icons

This directory ships a curated subset of **Tabler Icons** (MIT) in the same
visual grammar as Qoder's custom `Qoder*Line / Qoder*Fill` icon family:
24px grid, 2px round stroke, `currentColor`, plus filled variants for states.

- `sprite.svg` — a single symbol sheet.
- `outline/` — 110 individual outline SVGs.
- `filled/` — 15 individual filled SVGs.
- `../js/qoder-icons.js` — injects the sprite and exposes `QIcon(name, className)`.

```html
<svg class="q-icon"><use href="#q-i-sparkles"></use></svg>
<svg class="q-icon q-icon--filled"><use href="#q-i-circle-check-filled"></use></svg>
```

```js
QIcon('search', 'q-icon--sm'); // returns an SVG string
```

The Qoder logo and Qoder-proprietary illustrations are **not** included.
See `../../licenses/MIT-Tabler-Icons.txt`.
