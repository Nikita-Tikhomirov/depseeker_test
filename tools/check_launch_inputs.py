from __future__ import annotations

from pathlib import Path
import re
import sys

from site_config import PLACEHOLDER_ORIGIN, ROOT, load_config


CONTACT_HINTS = [
    "После выбора домена",
    "После запуска домена",
    "До публикации реального владельца",
    "контакты нужно заполнить реальными данными",
]

LEGAL_HINTS = [
    "дополнить реквизитами владельца",
    "фактическим списком сервисов",
]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def has_email_or_contact_url(text: str) -> bool:
    return bool(re.search(r"mailto:|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.IGNORECASE))


def collect_blockers(root: Path = ROOT) -> list[str]:
    config = load_config(root)
    blockers: list[str] = []
    origin = str(config.get("origin", "")).strip()
    mode = str(config.get("mode", "")).strip().lower()
    metrika_id = str(config.get("yandexMetrikaId", "")).strip()
    contacts = read(root / "contacts.html")
    privacy = read(root / "privacy.html")
    terms = read(root / "terms.html")

    if mode != "production":
        blockers.append("production mode: switch site.config.json mode to production")
    if not origin.startswith("https://") or origin == PLACEHOLDER_ORIGIN:
        blockers.append("real HTTPS domain: replace placeholder origin across metadata")
    if any(hint in contacts for hint in CONTACT_HINTS) or not has_email_or_contact_url(contacts):
        blockers.append("real contacts: publish an email or contact URL and remove pre-launch contact copy")
    if any(hint in privacy for hint in LEGAL_HINTS) or any(hint in terms for hint in LEGAL_HINTS):
        blockers.append("owner/legal details: fill privacy and terms with real owner, services, analytics, and ads details")
    if metrika_id and not metrika_id.isdigit():
        blockers.append("Yandex Metrika: yandexMetrikaId must be numeric when set")
    if mode == "production" and not metrika_id:
        blockers.append("Yandex Metrika: add the counter ID or intentionally keep analytics disabled in launch notes")
    return blockers


def main() -> int:
    blockers = collect_blockers(ROOT)
    if blockers:
        print("external launch inputs required:")
        for blocker in blockers:
            print(f"- {blocker}")
        return 1
    print("launch inputs check passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
