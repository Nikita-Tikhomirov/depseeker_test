from __future__ import annotations

import argparse
from html import escape
from pathlib import Path
import sys

from build_site_metadata import build_robots, build_sitemap
from catalog_registry import PATH_RE, SLUG_RE, find_category, load_registry, write_registry
from site_config import ROOT, route_url


CSS_VERSION = "prod-foundation-20260601-1"


def html_page(title: str, description: str, path: str, h1: str, lead: str, category_title: str | None = None) -> str:
    category_block = ""
    if category_title:
        category_block = f"""
        <section class="service-page__section">
            <h2>Раздел каталога</h2>
            <p>Страница относится к разделу «{escape(category_title)}». После наполнения ее можно перевести из черновика в опубликованный материал и добавить во внутреннюю перелинковку.</p>
        </section>"""
    canonical = route_url(path)
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{escape(description)}">
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="{escape(canonical)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{escape(title)}">
    <meta property="og:description" content="{escape(description)}">
    <meta property="og:url" content="{escape(canonical)}">
    <meta property="og:locale" content="ru_RU">
    <title>{escape(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/base.css?v={CSS_VERSION}">
    <link rel="stylesheet" href="css/components.css?v={CSS_VERSION}">
    <link rel="stylesheet" href="css/layout.css?v={CSS_VERSION}">
    <link rel="stylesheet" href="css/responsive.css?v={CSS_VERSION}">
    <link rel="stylesheet" href="css/themes.css?v={CSS_VERSION}">
</head>
<body>
<header class="header">
    <div class="container">
        <a href="index.html" class="header-logo" aria-label="Цифра — на главную"><span class="logo-icon">◆</span><span class="logo-text">Цифра</span></a>
        <nav aria-label="Основная навигация"><ul class="header-nav"><li><a href="index.html">Главная</a></li><li><a href="index.html#catalog">Каталог</a></li><li><a href="about.html">О проекте</a></li></ul></nav>
        <button class="hamburger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
</header>
<main class="service-page">
    <div class="container service-page__shell">
        <h1>{escape(h1)}</h1>
        <p class="service-page__lead">{escape(lead)}</p>{category_block}
        <section class="service-page__section">
            <h2>Что нужно добавить перед публикацией</h2>
            <ul>
                <li>Подробное описание задачи и аудитории страницы.</li>
                <li>Практический пример, код, конфигурацию или рабочий шаблон.</li>
                <li>FAQ, связанные страницы и понятный переход к утилите или категории.</li>
            </ul>
        </section>
    </div>
</main>
<footer class="footer"><div class="container"><div class="footer-bottom"><p>© 2026 Цифра.</p><p><a href="about.html">О проекте</a> · <a href="contacts.html">Контакты</a> · <a href="privacy.html">Политика</a></p></div></div></footer>
<script src="js/main.js" defer></script>
</body>
</html>
"""


def validate_slug(slug: str) -> None:
    if not SLUG_RE.match(slug):
        raise ValueError("slug must use lowercase latin letters, digits, and hyphens")


def validate_path(path: str) -> None:
    if not PATH_RE.match(path):
        raise ValueError("path must be a root HTML file like seo-tools.html")


def ensure_new_file(path: Path, overwrite: bool) -> None:
    if path.exists() and not overwrite:
        raise FileExistsError(f"file already exists: {path.name}")


def scaffold_category(args: argparse.Namespace) -> None:
    validate_slug(args.slug)
    path = f"{args.slug}.html"
    validate_path(path)
    registry = load_registry(ROOT)
    if find_category(registry, args.slug):
        raise ValueError(f"category already exists: {args.slug}")
    ensure_new_file(ROOT / path, args.overwrite)

    registry.setdefault("categories", []).append(
        {
            "slug": args.slug,
            "title": args.title,
            "path": path,
            "status": "draft",
            "description": args.description,
            "primaryUtility": "",
            "items": [],
        }
    )
    (ROOT / path).write_text(
        html_page(
            title=f"{args.title} | Цифра",
            description=args.description,
            path=path,
            h1=args.title,
            lead=args.description,
        ),
        encoding="utf-8",
    )
    write_registry(registry, ROOT)


def scaffold_item(args: argparse.Namespace) -> None:
    validate_slug(args.category)
    validate_slug(args.slug)
    path = f"{args.category}-{args.slug}.html"
    validate_path(path)
    registry = load_registry(ROOT)
    category = find_category(registry, args.category)
    if not category:
        raise ValueError(f"category does not exist: {args.category}")
    if any(item.get("path") == path for item in category.get("items", [])):
        raise ValueError(f"item already exists in registry: {path}")
    ensure_new_file(ROOT / path, args.overwrite)

    category.setdefault("items", []).append(
        {
            "path": path,
            "title": args.title,
            "type": args.type,
            "nav": bool(args.nav),
            "status": "draft",
        }
    )
    if not category.get("primaryUtility") and args.type == "utility":
        category["primaryUtility"] = path
    (ROOT / path).write_text(
        html_page(
            title=f"{args.title} | Цифра",
            description=args.description,
            path=path,
            h1=args.title,
            lead=args.description,
            category_title=str(category["title"]),
        ),
        encoding="utf-8",
    )
    write_registry(registry, ROOT)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Scaffold catalog categories and utility/landing pages.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite an existing HTML file if it exists.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    category = subparsers.add_parser("category", help="Create a draft category page and registry entry.")
    category.add_argument("slug")
    category.add_argument("title")
    category.add_argument("description")
    category.set_defaults(func=scaffold_category)

    item = subparsers.add_parser("item", help="Create a draft utility/landing page inside a category.")
    item.add_argument("category")
    item.add_argument("slug")
    item.add_argument("title")
    item.add_argument("description")
    item.add_argument("--type", choices=["utility", "landing", "guide", "template"], default="landing")
    item.add_argument("--nav", action="store_true")
    item.set_defaults(func=scaffold_item)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        args.func(args)
        build_sitemap(ROOT)
        build_robots(ROOT)
    except Exception as error:
        print(f"scaffold failed: {error}", file=sys.stderr)
        return 1
    print("catalog scaffold created and metadata regenerated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
