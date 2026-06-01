from __future__ import annotations

import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

from site_config import ROOT, route_url


REGISTRY_PATH = ROOT / "catalog.registry.json"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PATH_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*\.html$")


def load_registry(root: Path = ROOT) -> dict:
    return json.loads((root / "catalog.registry.json").read_text(encoding="utf-8"))


def sitemap_locs(root: Path = ROOT) -> set[str]:
    sitemap = root / "sitemap.xml"
    if not sitemap.exists():
        return set()
    tree = ET.parse(sitemap)
    return {
        node.text or ""
        for node in tree.findall(f".//{{{SITEMAP_NS}}}loc")
    }


def registry_paths(registry: dict) -> list[str]:
    paths: list[str] = []
    for category in registry.get("categories", []):
        paths.append(str(category["path"]))
        for item in category.get("items", []):
            paths.append(str(item["path"]))
    return paths


def validate_registry(root: Path = ROOT) -> list[str]:
    registry = load_registry(root)
    errors: list[str] = []
    seen_slugs: set[str] = set()
    seen_paths: set[str] = set()
    locs = sitemap_locs(root)

    if registry.get("schemaVersion") != 1:
        errors.append("catalog.registry.json must use schemaVersion=1")

    for category in registry.get("categories", []):
        slug = str(category.get("slug", ""))
        path = str(category.get("path", ""))
        items = category.get("items", [])
        primary = str(category.get("primaryUtility", ""))

        if not SLUG_RE.match(slug):
            errors.append(f"{slug or '<empty>'}: invalid category slug")
        if slug in seen_slugs:
            errors.append(f"{slug}: duplicate category slug")
        seen_slugs.add(slug)

        if not PATH_RE.match(path):
            errors.append(f"{slug}: invalid category path {path}")
        if path in seen_paths:
            errors.append(f"{slug}: duplicate path {path}")
        seen_paths.add(path)

        if not (root / path).exists():
            errors.append(f"{slug}: category page is missing: {path}")
        if route_url(path, root) not in locs:
            errors.append(f"{slug}: category page is missing from sitemap: {path}")
        if primary and primary not in [str(item.get("path")) for item in items]:
            errors.append(f"{slug}: primaryUtility must be listed in items")
        if len(items) < 2:
            errors.append(f"{slug}: category must list at least two catalog items")

        nav_count = 0
        for item in items:
            item_path = str(item.get("path", ""))
            item_type = str(item.get("type", ""))
            if item.get("nav"):
                nav_count += 1
            if item_type not in {"utility", "landing", "guide", "template"}:
                errors.append(f"{slug}: unsupported item type for {item_path}: {item_type}")
            if not PATH_RE.match(item_path):
                errors.append(f"{slug}: invalid item path {item_path}")
            if item_path in seen_paths:
                errors.append(f"{slug}: duplicate path {item_path}")
            seen_paths.add(item_path)
            if not (root / item_path).exists():
                errors.append(f"{slug}: item page is missing: {item_path}")
            if route_url(item_path, root) not in locs:
                errors.append(f"{slug}: item page is missing from sitemap: {item_path}")
        if nav_count < 2:
            errors.append(f"{slug}: category should expose at least two nav items")

    return errors
