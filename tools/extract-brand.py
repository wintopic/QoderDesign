"""Build the website identity from Qoder CN's original vector mark.

Reads app.asar without changing the installed client. FontTools + Brotli are
build-time dependencies only; exported SVGs contain outlines, not web fonts.
"""
from pathlib import Path
import argparse
import copy
import hashlib
import json
import struct
import xml.etree.ElementTree as ET

from fontTools import version as fonttools_version
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont


def digest(data):
    return hashlib.sha256(data).hexdigest()


def number(value, precision=3):
    result = f"{value:.{precision}f}".rstrip("0").rstrip(".")
    return "0" if result == "-0" else result


def read_archive(path):
    with path.open("rb") as stream:
        _, header_size, _, json_size = struct.unpack("<4I", stream.read(16))
        header = json.loads(stream.read(json_size))
        data_start = 8 + header_size

        def read(name):
            entry = header
            for part in name.split("/"):
                entry = entry["files"][part]
            if entry.get("unpacked"):
                return (Path(str(path) + ".unpacked") / name).read_bytes()
            stream.seek(data_start + int(entry["offset"]))
            return stream.read(entry["size"])

        assets = header["files"]["out"]["files"]["renderer"]["files"]["assets"]["files"]
        candidates = [name for name in assets
                      if name.startswith("qoderCnIdeLogo-") and name.endswith(".svg")]
        if len(candidates) != 1:
            raise ValueError(f"Expected one Qoder CN icon, found {candidates}")
        asset = "out/renderer/assets/" + candidates[0]
        package = json.loads(read("package.json"))
        return asset, read(asset), package.get("version")


def original_paths(raw):
    root = ET.fromstring(raw)
    paths = [copy.deepcopy(element) for element in root
             if element.tag.rsplit("}", 1)[-1] == "path"]
    if len(paths) != 2 or any(path.get("fill") != "#2ADB5C" for path in paths):
        raise ValueError("The source mark changed; review its geometry before exporting")
    bounds = []
    for path in paths:
        path.tag = "path"
        pen = BoundsPen(None)
        parse_path(path.get("d"), pen)
        bounds.append(pen.bounds)
    combined = (min(b[0] for b in bounds), min(b[1] for b in bounds),
                max(b[2] for b in bounds), max(b[3] for b in bounds))
    return paths, combined


def mark_group(paths, bounds, *, box_x, box_y, box_size, height, monochrome=False):
    left, top, right, bottom = bounds
    scale = height / (bottom - top)
    x = box_x + (box_size - (right - left) * scale) / 2
    y = box_y + (box_size - height) / 2
    transform = (f"translate({number(x)} {number(y)}) scale({number(scale, 6)}) "
                 f"translate({number(-left)} {number(-top)})")
    group = ET.Element("g", {"transform": transform})
    for source_path in paths:
        path = copy.deepcopy(source_path)
        if monochrome:
            path.set("fill", "currentColor")
        group.append(path)
    return ET.tostring(group, encoding="unicode", short_empty_elements=True)


def outline_text(font, text, x, baseline, size, tracking=0):
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    paths = []
    cursor = x
    for character in text:
        name = cmap[ord(character)]
        pen = SVGPathPen(glyphs, ntos=number)
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, cursor, baseline)))
        commands = pen.getCommands()
        if commands:
            paths.append(f'<path d="{commands}"/>')
        cursor += font["hmtx"][name][0] * scale + tracking
    return "\n".join(paths)


def svg(body, *, width, height, title, color=None):
    color_attr = f' color="{color}"' if color else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
            f'viewBox="0 0 {width} {height}" role="img" aria-label="{title}"{color_attr}>\n'
            f'<title>{title}</title>\n{body}\n</svg>\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="Installed Qoder CN app.asar")
    parser.add_argument("--output", type=Path,
                        default=Path(__file__).resolve().parent.parent,
                        help="Kit root; defaults to the parent of tools/")
    args = parser.parse_args()
    output = args.output.resolve()
    font_path = output / "assets/fonts/instrument-sans-500.woff2"
    font = TTFont(font_path)
    asset, raw, version = read_archive(args.archive)
    paths, bounds = original_paths(raw)
    brand_dir = output / "assets/brand"
    evidence_dir = output / "source-evidence/brand"
    brand_dir.mkdir(parents=True, exist_ok=True)
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / "qoder-cn-ide-original.svg").write_bytes(raw)

    wordmark = (outline_text(font, "Qoder", 56, 28.5, 26.5, -.65) + "\n" +
                outline_text(font, "DESIGN KIT", 57, 42, 9.75, 1.45))
    full_mark = mark_group(paths, bounds, box_x=0, box_y=0, box_size=48, height=42)
    exports = {
        "assets/brand/qoder-mark.svg": svg(full_mark, width=48, height=48, title="Qoder CN mark"),
    }
    for filename, ink, monochrome in (
        ("qoder-design-kit.svg", "#191B18", False),
        ("qoder-design-kit-dark.svg", "#F2F4F0", False),
        ("qoder-design-kit-mono.svg", "#191B18", True),
    ):
        symbol = mark_group(paths, bounds, box_x=0, box_y=0, box_size=48,
                            height=42, monochrome=monochrome)
        exports["assets/brand/" + filename] = svg(
            symbol + '\n<g fill="currentColor">\n' + wordmark + "\n</g>",
            width=144, height=48, title="Qoder Design Kit", color=None if monochrome else ink)

    favicon_body = ('<rect width="64" height="64" rx="16" fill="#F5F7F4"/>\n' +
                    mark_group(paths, bounds, box_x=0, box_y=0, box_size=64, height=49))
    exports["assets/favicon.svg"] = svg(favicon_body, width=64, height=64,
                                       title="Qoder Design Kit")
    for name, content in exports.items():
        (output / name).write_bytes(content.encode("utf-8"))

    evidence = {
        "source": {"product": "Qoder CN", "version": version,
                   "archive": "resources/app.asar", "asset": asset,
                   "bytes": len(raw), "sha256": digest(raw),
                   "originalCopy": "source-evidence/brand/qoder-cn-ide-original.svg"},
        "geometry": {"bounds": list(bounds), "sourcePaths": [
            {"sha256": digest(path.get("d").encode()), "fill": path.get("fill"),
             "opacity": path.get("opacity", "1")} for path in paths],
            "changes": "Path data unchanged; source icon background removed; uniform scale and optical placement."},
        "websiteIdentity": {
            "name": "Qoder Design Kit", "status": "unofficial design reference",
            "composition": "Official CN mark with a newly arranged, outlined Qoder / DESIGN KIT wordmark.",
            "font": "Instrument Sans Medium, SIL OFL 1.1",
            "fontFile": "assets/fonts/instrument-sans-500.woff2",
            "fontSha256": digest(font_path.read_bytes()),
            "viewBox": [0, 0, 144, 48],
            "fontToolsVersion": fonttools_version,
        },
        "exports": [{"file": name, "bytes": len(content.encode()),
                     "sha256": digest(content.encode())} for name, content in exports.items()],
        "rights": "Qoder's mark remains the property of its rights holder; not covered by the font or icon licenses.",
    }
    (output / "source-evidence/brand.json").write_text(
        json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"source": asset, "version": version, "bounds": bounds,
                      "exports": [name for name in exports]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
