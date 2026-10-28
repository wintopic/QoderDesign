"""Extract a small, verifiable UI reference from an installed Qoder app.asar.

Standard library only. Reads the archive; never changes the installed app.
The output contains six UI recipes, their asset hashes, and resolved tokens.
"""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import json
import re
import struct


THEMES = (
    "light", "forest-light", "bee-light", "mint-light", "light-parchment",
    "forest-dark", "bee-dark", "mint-dark", "parchment-dark",
)
TOKEN_MAP = {
    "primary": "--q1c50a8",
    "primary-border": "--qca1baf",
    "primary-bg": "--qdf74ad",
    "primary-active": "--q149cae",
    "text": "--q0704b8",
    "text-on-primary": "--q292341",
    "bg-base": "--qb28b89",
    "bg-container": "--q79944a",
    "border": "--q015283",
    "border-tertiary": "--qbf30b8",
    "fill-secondary": "--q676eb9",
    "switch-off-bg": "--q079bfd",
    "switch-off-border": "--qace5a8",
    "shadow-color-4": "--qd4450b",
}
RECIPES = {
    "button": ("const Button=", "Button.displayName="),
    "input": ("const Input=", "Input.displayName="),
    "checkbox": ("const checkboxSizeClassNames=", "Checkbox.displayName="),
    "radio": ("const RadioGroupItem=", "RadioGroupItem.displayName="),
    "slider": ("const Slider=", "Slider.displayName="),
    "switch": ("const switchSizeClassNames=", "Switch.displayName="),
}


class Asar:
    def __init__(self, path):
        self.path = path
        self.stream = path.open("rb")
        prefix = self.stream.read(16)
        if len(prefix) != 16:
            raise ValueError("Invalid ASAR header")
        _, header_size, _, json_size = struct.unpack("<4I", prefix)
        self.header = json.loads(self.stream.read(json_size))
        self.data_start = 8 + header_size

    def read(self, name):
        entry = self.header
        for part in name.split("/"):
            entry = entry["files"][part]
        if entry.get("unpacked"):
            return (Path(str(self.path) + ".unpacked") / name).read_bytes()
        self.stream.seek(self.data_start + int(entry["offset"]))
        return self.stream.read(entry["size"])

    def assets(self):
        return self.header["files"]["out"]["files"]["renderer"]["files"]["assets"]["files"]


def excerpt(raw, start, end):
    begin = raw.find(start.encode())
    if begin < 0:
        return None
    finish = raw.find(end.encode(), begin)
    if finish < 0:
        raise ValueError(f"Recipe changed: missing {end}")
    finish = raw.find(b";", finish) + 1
    return {"byteOffset": begin, "byteLength": finish - begin,
            "compiledRecipe": raw[begin:finish].decode("utf-8")}


def resolve_tokens(css):
    defaults = {}
    themed = {theme: {} for theme in THEMES}
    for match in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        selector, body = match.groups()
        declarations = dict(re.findall(r"(--[\w-]+)\s*:\s*([^;{}]+)", body))
        if not declarations:
            continue
        selectors = [part.strip() for part in selector.split(",")]
        if any(part in (":root", "html") for part in selectors):
            defaults.update(declarations)
        for theme in THEMES:
            direct = (f":root[data-theme={theme}]", f"html[data-theme={theme}]",
                      f':root[data-theme="{theme}"]', f'html[data-theme="{theme}"]')
            applies = any(part in direct for part in selectors)
            applies |= theme.endswith("-dark") and any(
                part in ("html[data-theme$=-dark]", ':root[data-theme$="-dark"]',
                         'html[data-theme$="-dark"]') for part in selectors)
            if applies:
                themed[theme].update(declarations)
    output = {}
    for theme in THEMES:
        variables = defaults | themed[theme]

        def resolve(name, visited=()):
            if name in visited:
                raise ValueError(f"Circular token: {name}")
            if name not in variables:
                raise ValueError(f"Missing source token: {theme} {name}")
            value = variables[name].strip()
            return re.sub(r"var\((--[\w-]+)\)",
                          lambda match: resolve(match[1], (*visited, name)), value)

        output[theme] = {semantic: resolve(hashed) for semantic, hashed in TOKEN_MAP.items()}
    return output


def switch_spec(recipe, css):
    sizes = {}
    for size in ("md", "sm"):
        body = re.search(rf'{size}:\{{(.*?)\}}', recipe)[1]
        height, width = re.search(r'root:"h-(\d+) w-(\d+)"', body).groups()
        normal, hover, attract = re.search(
            r'--qb9d00d:(\d+)px.*?--q69124d:(\d+)px.*?--q88ca86:(\d+)px', body).groups()
        sizes[size] = {
            "trackWidth": int(width) * 4, "trackHeight": int(height) * 4,
            "thumbSize": int(normal), "hoverWidth": int(hover),
            "attractWidth": int(attract),
            "checkedTranslateX": int(re.search(r'checkedTranslate:"translate-x-\[(\d+)px\]"', body)[1]),
            "uncheckedTranslateX": 1,
        }
    delay = int(re.search(r'transition-delay:(\d+)ms', css)[1])
    duration = int(re.search(r'transition-duration:(\d+)ms', css)[1])
    return {
        "element": "button", "type": "button", "role": "switch",
        "stateAttribute": "aria-checked", "cornerShape": "round", "borderWidth": 1,
        "structure": ["button.q-switch", "span[data-switch-thumb]", "span[data-switch-visual]"],
        "sizes": sizes,
        "motion": {
            "trackDurationMs": 120, "trackEasing": "ease-out",
            "translateDurationMs": 150, "translateEasing": "cubic-bezier(0.4,0,0.2,1)",
            "visualDurationMs": 200, "hoverDurationMs": 150,
            "clickDurationMs": 150, "clickTranslateDelayMs": delay,
            "clickTranslateDurationMs": duration,
            "widthKeyframes": [
                {"at": "0%", "width": "hoverWidth", "easing": "cubic-bezier(.2,.8,.2,1)"},
                {"at": "33.333%", "width": "attractWidth", "easing": "linear"},
                {"at": "40%", "width": "attractWidth", "easing": "cubic-bezier(.4,0,.2,1)"},
                {"at": "100%", "width": "thumbSize"},
            ],
            "hoverMedia": "(hover: hover) and (pointer: fine)",
            "disabledOpacity": 0.5, "reducedMotion": "no animation or transition",
            "pointerClick": "event.detail > 0 sets on/off attraction; pointerenter resets motion",
            "keyboardClick": "event.detail == 0 toggles state without attraction",
        },
        "tokens": {"on": "primary", "off": "switch-off-bg", "offBorder": "switch-off-border",
                   "visual": "text-on-primary", "shadow": "shadow-color-4", "focusBorder": "primary-border"},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="Path to the installed resources/app.asar")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "source-evidence/controls.json")
    args = parser.parse_args()
    archive = Asar(args.archive.resolve())
    package = json.loads(archive.read("package.json"))
    recipes, assets = {}, {}
    theme_css = switch_css = slider_bounds = theme_css_asset = None
    try:
        for name in sorted(archive.assets()):
            if not name.endswith((".js", ".css")):
                continue
            path = "out/renderer/assets/" + name
            raw = archive.read(path)
            found = False
            if name.endswith(".js"):
                for key, (start, end) in RECIPES.items():
                    if key in recipes:
                        continue
                    part = excerpt(raw, start, end)
                    if part:
                        recipes[key] = {"asset": path, **part}
                        found = True
                part = excerpt(raw, "function getThumbInBoundsOffset(", "__name(getThumbInBoundsOffset,")
                if part:
                    slider_bounds = {"asset": path, **part}
                    found = True
            if name.endswith(".css"):
                if b"--q079bfd:" in raw and b"--q292341:" in raw and b"data-theme=light" in raw:
                    theme_css = raw.decode("utf-8")
                    theme_css_asset = path
                    found = True
                start = raw.find(b".qoder-switch [data-switch-visual]")
                if start >= 0:
                    end = raw.find(b".qoder-thinking-dot-matrix", start)
                    if end < 0:
                        raise ValueError("Switch CSS changed; check the extraction boundary")
                    switch_css = {"asset": path, "byteOffset": start, "byteLength": end - start,
                                  "compiledRecipe": raw[start:end].decode("utf-8")}
                    found = True
            if found:
                assets[path] = {"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
    finally:
        archive.stream.close()
    missing = set(RECIPES) - recipes.keys()
    if missing or not theme_css or not switch_css:
        raise ValueError(f"Unsupported build: missing recipes {sorted(missing)}, theme CSS or switch CSS")
    tokens = resolve_tokens(theme_css)
    output = {
        "meta": {
            "product": package.get("name"), "version": package.get("version"),
            "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "method": "Read-only ASAR extraction; byte offsets are UTF-8 offsets in the named assets.",
            "scope": "Shared UI controls and their CSS tokens; no app data, account data or complete renderer included.",
        },
        "assets": assets, "themeCssAsset": theme_css_asset, "tokenMap": TOKEN_MAP, "themes": tokens,
        "switch": switch_spec(recipes["switch"]["compiledRecipe"], switch_css["compiledRecipe"]),
        "recipes": recipes, "switchCss": switch_css, "sliderThumbBounds": slider_bounds,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output.resolve()), "version": package.get("version"),
                      "recipes": sorted(recipes), "assets": assets, "themes": len(tokens)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
