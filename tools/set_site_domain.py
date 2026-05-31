from __future__ import annotations

import argparse
from pathlib import Path
import sys
from urllib.parse import urlparse


OLD_ORIGIN = "https://zifra.example.com"
TEXT_EXTENSIONS = {".css", ".html", ".js", ".json", ".md", ".txt", ".xml"}
SKIP_DIRS = {".deepseek", ".git", ".playwright-mcp", "__pycache__", "node_modules"}


def normalize_origin(value: str) -> str:
    parsed = urlparse(value.strip())
    if parsed.scheme != "https":
        raise ValueError("Domain must start with https://")
    if not parsed.netloc:
        raise ValueError("Domain must include a host")
    if parsed.path not in ("", "/") or parsed.params or parsed.query or parsed.fragment:
        raise ValueError("Domain must be an origin only, for example https://example.com")
    return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")


def iter_text_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix.lower() in TEXT_EXTENSIONS:
            yield path


def replace_domain(root: Path, new_origin: str, dry_run: bool) -> list[Path]:
    changed: list[Path] = []
    for path in iter_text_files(root):
        text = path.read_text(encoding="utf-8")
        updated = text.replace(OLD_ORIGIN, new_origin)
        if updated == text:
            continue
        changed.append(path)
        if not dry_run:
            path.write_text(updated, encoding="utf-8", newline="")
    return changed


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Replace the placeholder site origin in static ACF/MIGX files."
    )
    parser.add_argument("domain", help="New HTTPS origin, for example https://example.com")
    parser.add_argument("--root", default=".", help="Root directory to scan. Defaults to current directory.")
    parser.add_argument("--dry-run", action="store_true", help="Show files that would change without writing them.")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        new_origin = normalize_origin(args.domain)
    except ValueError as error:
        parser.error(str(error))

    root = Path(args.root).resolve()
    if not root.exists() or not root.is_dir():
        parser.error(f"Root directory does not exist: {root}")

    changed = replace_domain(root, new_origin, args.dry_run)
    action = "would update" if args.dry_run else "updated"
    for path in changed:
        print(path.relative_to(root).as_posix())
    print(f"{action} {len(changed)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
