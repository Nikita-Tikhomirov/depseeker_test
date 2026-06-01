from __future__ import annotations

from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

from site_config import PLACEHOLDER_ORIGIN, ROOT, assert_launch_origin, is_production, load_config, route_url


HTML_RE = re.compile(r"<html\b", re.IGNORECASE)


def html_pages(root: Path = ROOT) -> list[Path]:
    return sorted(path for path in root.glob("*.html") if HTML_RE.search(path.read_text(encoding="utf-8")[:200]))


def fail(message: str) -> None:
    raise AssertionError(message)


def check_service_pages(root: Path, config: dict) -> None:
    missing = [page["path"] for page in config.get("servicePages", []) if not (root / page["path"]).exists()]
    if missing:
        fail(f"missing service pages: {', '.join(missing)}")


def check_page_basics(root: Path) -> None:
    for path in html_pages(root):
        html = path.read_text(encoding="utf-8")
        h1_count = len(re.findall(r"<h1\b", html, flags=re.IGNORECASE))
        if h1_count != 1:
            fail(f"{path.name}: expected exactly one H1, got {h1_count}")
        if 'href="#"' in html:
            fail(f"{path.name}: empty href found")
        if '<meta name="description"' not in html:
            fail(f"{path.name}: missing meta description")
        if '<link rel="canonical"' not in html:
            fail(f"{path.name}: missing canonical")


def check_sitemap(root: Path) -> None:
    sitemap_path = root / "sitemap.xml"
    if not sitemap_path.exists():
        fail("sitemap.xml is missing")
    tree = ET.parse(sitemap_path)
    locs = {node.text for node in tree.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
    for path in html_pages(root):
        expected = route_url(path.name, root)
        if expected not in locs:
            fail(f"sitemap.xml missing {expected}")


def check_robots(root: Path) -> None:
    robots = (root / "robots.txt").read_text(encoding="utf-8")
    if f"Sitemap: {route_url('sitemap.xml', root)}" not in robots:
        fail("robots.txt must point to the generated sitemap URL")
    for param in load_config(root).get("cleanParams", []):
        if param not in robots:
            fail(f"robots.txt missing Clean-param entry for {param}")


def check_production_origin(root: Path) -> None:
    assert_launch_origin(root)
    if not is_production(root):
        return
    offenders = []
    for path in [*html_pages(root), root / "sitemap.xml", root / "robots.txt"]:
        if PLACEHOLDER_ORIGIN in path.read_text(encoding="utf-8"):
            offenders.append(path.name)
    if offenders:
        fail(f"placeholder origin remains in production files: {', '.join(offenders)}")


def main() -> int:
    try:
        config = load_config(ROOT)
        check_service_pages(ROOT, config)
        check_page_basics(ROOT)
        check_sitemap(ROOT)
        check_robots(ROOT)
        check_production_origin(ROOT)
    except Exception as error:
        print(f"production readiness failed: {error}", file=sys.stderr)
        return 1
    mode = load_config(ROOT).get("mode", "local")
    print(f"production readiness checks passed in {mode} mode")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
