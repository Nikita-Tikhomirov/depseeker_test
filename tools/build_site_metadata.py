from __future__ import annotations

from datetime import date
from pathlib import Path
import xml.etree.ElementTree as ET

from site_config import ROOT, load_config, route_url


SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


def page_priority(path: str) -> str:
    if path == "index.html":
        return "1.0"
    if path in {"acf.html", "migx.html"}:
        return "0.85"
    if path in {"acf-generator.html", "migx-generator.html"}:
        return "0.8"
    if path in {"about.html", "contacts.html", "privacy.html", "terms.html"}:
        return "0.35"
    return "0.75"


def discover_pages(root: Path = ROOT) -> list[str]:
    pages = sorted(path.name for path in root.glob("*.html"))
    if "index.html" in pages:
        pages.remove("index.html")
        pages.insert(0, "index.html")
    return pages


def existing_lastmods(root: Path = ROOT) -> dict[str, str]:
    sitemap = root / "sitemap.xml"
    if not sitemap.exists():
        return {}
    tree = ET.parse(sitemap)
    result: dict[str, str] = {}
    for url in tree.findall(f".//{{{SITEMAP_NS}}}url"):
        loc = url.find(f"{{{SITEMAP_NS}}}loc")
        lastmod = url.find(f"{{{SITEMAP_NS}}}lastmod")
        if loc is not None and loc.text and lastmod is not None and lastmod.text:
            result[loc.text] = lastmod.text
    return result


def build_sitemap(root: Path = ROOT) -> None:
    ET.register_namespace("", SITEMAP_NS)
    urlset = ET.Element(f"{{{SITEMAP_NS}}}urlset")
    today = date.today().isoformat()
    known_lastmods = existing_lastmods(root)
    for page in discover_pages(root):
        loc = route_url(page, root)
        url = ET.SubElement(urlset, f"{{{SITEMAP_NS}}}url")
        ET.SubElement(url, f"{{{SITEMAP_NS}}}loc").text = loc
        ET.SubElement(url, f"{{{SITEMAP_NS}}}lastmod").text = known_lastmods.get(loc, today)
        ET.SubElement(url, f"{{{SITEMAP_NS}}}changefreq").text = "weekly"
        ET.SubElement(url, f"{{{SITEMAP_NS}}}priority").text = page_priority(page)
    ET.indent(urlset, space="    ")
    tree = ET.ElementTree(urlset)
    sitemap = root / "sitemap.xml"
    tree.write(sitemap, encoding="utf-8", xml_declaration=True)
    sitemap.write_text(sitemap.read_text(encoding="utf-8") + "\n", encoding="utf-8")


def build_robots(root: Path = ROOT) -> None:
    config = load_config(root)
    lines = [
        "User-agent: *",
        "Allow: /",
    ]
    clean_params = config.get("cleanParams") or []
    if clean_params:
        lines.append(f"Clean-param: {'&'.join(clean_params)} /")
    lines.append(f"Sitemap: {route_url('sitemap.xml', root)}")
    (root / "robots.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    build_sitemap()
    build_robots()
    print(f"metadata generated for {len(discover_pages())} html pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
