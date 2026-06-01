from __future__ import annotations

from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

from catalog_registry import load_registry
from site_config import ROOT


REPORT_PATH = ROOT / "docs" / "seo-content-audit.md"
WORD_RE = re.compile(r"[A-Za-zА-Яа-яЁё0-9]+(?:[-_][A-Za-zА-Яа-яЁё0-9]+)?")
TAG_RE = re.compile(r"<[^>]+>")
INTERNAL_LINK_RE = re.compile(r'href="([^"#?]+\.html)(?:[?#][^"]*)?"', re.IGNORECASE)

PLACEHOLDER_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in [
        r"lorem ipsum",
        r"заглушк",
        r"тестовый текст",
        r"todo",
        r"fixme",
        r"undefined",
        r"null",
    ]
]

THRESHOLDS = {
    "category": {"words": 520, "h2": 3, "internal_links": 6},
    "utility": {"words": 360, "h2": 2, "internal_links": 3},
    "landing": {"words": 520, "h2": 3, "internal_links": 4},
    "guide": {"words": 700, "h2": 4, "internal_links": 4},
    "template": {"words": 500, "h2": 3, "internal_links": 4},
}


class VisibleTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() in {"script", "style", "noscript", "svg"}:
            self.skip_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in {"script", "style", "noscript", "svg"} and self.skip_depth:
            self.skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if not self.skip_depth:
            self.parts.append(data)

    def text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


@dataclass(frozen=True)
class PageAudit:
    path: str
    title: str
    page_type: str
    status: str
    words: int
    h2_count: int
    h3_count: int
    internal_links: int
    has_faq: bool
    has_examples: bool
    has_ad_slot: bool
    has_placeholder: bool
    score: int
    issues: tuple[str, ...]


def visible_text(html: str) -> str:
    parser = VisibleTextParser()
    parser.feed(html)
    return parser.text()


def extract_title(html: str) -> str:
    match = re.search(r"<title>([\s\S]*?)</title>", html, re.IGNORECASE)
    if not match:
        return ""
    return TAG_RE.sub("", match.group(1)).strip()


def page_score(issue_count: int, has_faq: bool, has_examples: bool, has_ad_slot: bool) -> int:
    score = 100 - issue_count * 18
    if issue_count == 0 and has_faq:
        score += 4
    if issue_count == 0 and has_examples:
        score += 4
    if issue_count == 0 and has_ad_slot:
        score += 2
    return max(0, min(100, score))


def audit_page(root: Path, path: str, title: str, page_type: str, status: str, primary_utility: str) -> PageAudit:
    html = (root / path).read_text(encoding="utf-8")
    text = visible_text(html)
    words = len(WORD_RE.findall(text))
    h2_count = len(re.findall(r"<h2\b", html, re.IGNORECASE))
    h3_count = len(re.findall(r"<h3\b", html, re.IGNORECASE))
    links = {link for link in INTERNAL_LINK_RE.findall(html) if link != path}
    has_faq = "FAQPage" in html or re.search(r"вопрос|faq|частые", text, re.IGNORECASE) is not None
    has_examples = "<pre" in html.lower() or re.search(r"пример|код|шаблон|json|php", text, re.IGNORECASE) is not None
    has_ad_slot = 'class="ad-slot"' in html
    has_placeholder = any(pattern.search(text) for pattern in PLACEHOLDER_PATTERNS)
    thresholds = THRESHOLDS.get(page_type, THRESHOLDS["landing"])

    issues: list[str] = []
    if words < thresholds["words"]:
        issues.append(f"мало полезного текста: {words}/{thresholds['words']} слов")
    if h2_count < thresholds["h2"]:
        issues.append(f"мало H2-блоков: {h2_count}/{thresholds['h2']}")
    if len(links) < thresholds["internal_links"]:
        issues.append(f"слабая внутренняя перелинковка: {len(links)}/{thresholds['internal_links']}")
    if page_type != "category" and primary_utility and primary_utility not in links and path != primary_utility:
        issues.append(f"нет явной ссылки на основной генератор: {primary_utility}")
    if page_type in {"landing", "guide", "template"} and not has_faq:
        issues.append("нет FAQ/блока вопросов")
    if page_type in {"utility", "landing", "guide", "template"} and not has_examples:
        issues.append("нет примера использования")
    if not has_ad_slot and page_type != "utility":
        issues.append("нет рекламного слота")
    if has_placeholder:
        issues.append("найден слабый или тестовый текст")

    return PageAudit(
        path=path,
        title=title or extract_title(html),
        page_type=page_type,
        status=status,
        words=words,
        h2_count=h2_count,
        h3_count=h3_count,
        internal_links=len(links),
        has_faq=has_faq,
        has_examples=has_examples,
        has_ad_slot=has_ad_slot,
        has_placeholder=has_placeholder,
        score=page_score(len(issues), has_faq, has_examples, has_ad_slot),
        issues=tuple(issues),
    )


def collect_audits(root: Path = ROOT) -> list[PageAudit]:
    registry = load_registry(root)
    audits: list[PageAudit] = []
    for category in registry.get("categories", []):
        status = str(category.get("status", "published"))
        primary_utility = str(category.get("primaryUtility", ""))
        audits.append(
            audit_page(
                root,
                str(category["path"]),
                str(category.get("title", "")),
                "category",
                status,
                primary_utility,
            )
        )
        for item in category.get("items", []):
            audits.append(
                audit_page(
                    root,
                    str(item["path"]),
                    str(item.get("title", "")),
                    str(item.get("type", "landing")),
                    str(item.get("status", status)),
                    primary_utility,
                )
            )
    return audits


def priority_key(audit: PageAudit) -> tuple[int, int, str]:
    return (audit.score, -len(audit.issues), audit.path)


def render_bool(value: bool) -> str:
    return "да" if value else "нет"


def render_report(audits: list[PageAudit]) -> str:
    sorted_audits = sorted(audits, key=priority_key)
    published = [audit for audit in audits if audit.status != "draft"]
    average_score = round(sum(audit.score for audit in published) / max(1, len(published)))
    weak_pages = [audit for audit in published if audit.issues]

    lines = [
        "# SEO Content Audit",
        "",
        "Автоматический аудит страниц каталога. Он нужен как рабочая очередь: какие страницы усиливать текстом, FAQ, примерами и перелинковкой перед ростом трафика в РФ.",
        "",
        "## Summary",
        "",
        f"- Проверено страниц: {len(audits)}",
        f"- Опубликованных страниц: {len(published)}",
        f"- Средний балл опубликованных страниц: {average_score}/100",
        f"- Страниц с задачами на усиление: {len(weak_pages)}",
        "",
        "## Priority Queue",
        "",
        "| Страница | Тип | Балл | Слова | H2 | Ссылки | FAQ | Примеры | Что исправить |",
        "| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ]

    for audit in sorted_audits[:20]:
        issue_text = "; ".join(audit.issues) if audit.issues else "готова к базовой публикации"
        lines.append(
            f"| `{audit.path}` | {audit.page_type} | {audit.score} | {audit.words} | "
            f"{audit.h2_count} | {audit.internal_links} | {render_bool(audit.has_faq)} | "
            f"{render_bool(audit.has_examples)} | {issue_text} |"
        )

    lines.extend(
        [
            "",
            "## All Registered Pages",
            "",
            "| Страница | Тип | Статус | Балл |",
            "| --- | --- | --- | ---: |",
        ]
    )
    for audit in sorted(audits, key=lambda item: item.path):
        lines.append(f"| `{audit.path}` | {audit.page_type} | {audit.status} | {audit.score} |")

    lines.extend(
        [
            "",
            "## Thresholds",
            "",
            "| Тип | Минимум слов | Минимум H2 | Минимум внутренних ссылок |",
            "| --- | ---: | ---: | ---: |",
        ]
    )
    for page_type, values in THRESHOLDS.items():
        lines.append(
            f"| {page_type} | {values['words']} | {values['h2']} | {values['internal_links']} |"
        )

    lines.extend(
        [
            "",
            "## Next Content Work",
            "",
            "1. Усилить первые 5 страниц из очереди: добавить конкретный сценарий, пример, FAQ и ссылки на соседние материалы.",
            "2. Для каждой новой категории сначала заводить registry-запись и draft/noindex-страницы, потом переводить в published после наполнения.",
            "3. После доработок запускать `python tools/audit_content_quality.py`, `node tests/seo-copy-smoke.mjs` и `python tools/check_production_ready.py`.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> int:
    audits = collect_audits(ROOT)
    REPORT_PATH.write_text(render_report(audits), encoding="utf-8")
    weak_count = sum(1 for audit in audits if audit.status != "draft" and audit.issues)
    print(f"SEO content audit generated: {REPORT_PATH}")
    print(f"pages checked: {len(audits)}, pages with content tasks: {weak_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
