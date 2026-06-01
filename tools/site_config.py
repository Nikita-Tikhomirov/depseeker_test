from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "site.config.json"
PLACEHOLDER_ORIGIN = "https://zifra.example.com"


def load_config(root: Path = ROOT) -> dict:
    path = root / "site.config.json"
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_origin(value: str) -> str:
    parsed = urlparse(value.strip())
    if parsed.scheme != "https":
        raise ValueError("origin must start with https://")
    if not parsed.netloc:
        raise ValueError("origin must include a host")
    if parsed.path not in ("", "/") or parsed.params or parsed.query or parsed.fragment:
        raise ValueError("origin must be an HTTPS origin without path, query, or fragment")
    return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")


def site_origin(root: Path = ROOT) -> str:
    return normalize_origin(str(load_config(root)["origin"]))


def is_production(root: Path = ROOT) -> bool:
    return str(load_config(root).get("mode", "local")).lower() == "production"


def route_url(path: str, root: Path = ROOT) -> str:
    origin = site_origin(root)
    clean_path = path.strip().lstrip("/")
    if clean_path in ("", "index.html"):
        return f"{origin}/"
    return f"{origin}/{clean_path}"


def assert_launch_origin(root: Path = ROOT) -> None:
    config = load_config(root)
    origin = normalize_origin(str(config["origin"]))
    if str(config.get("mode", "local")).lower() == "production" and origin == PLACEHOLDER_ORIGIN:
        raise ValueError("production mode cannot use the placeholder origin")
