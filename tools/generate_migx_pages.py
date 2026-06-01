from __future__ import annotations

import html
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

TOOLS_DIR = Path(__file__).resolve().parent
if str(TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(TOOLS_DIR))

from site_config import site_origin


ROOT = Path(__file__).resolve().parents[1]
SITE = site_origin()
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
SITEMAP_LASTMOD = "2026-05-31"


PAGES = [
    {
        "slug": "migx-json-generator",
        "preset": "json",
        "query": "migx json generator",
        "title": "MIGX JSON генератор для MODX",
        "h1": "MIGX JSON генератор",
        "description": "Соберите MIGX JSON для MODX Revolution: поля, табы, вложенные MIGX и готовая структура для вставки в TV.",
        "intent": "Нужен готовый JSON без ручной сборки массива полей.",
        "deliverables": ["MIGX fields JSON", "Проверка fieldname", "Экспорт для TV"],
        "example": '[{"fieldname":"title","caption":"Заголовок","inputTVtype":"text"}]',
    },
    {
        "slug": "migx-tv-generator",
        "preset": "tv",
        "query": "migx tv modx",
        "title": "MIGX TV генератор для MODX",
        "h1": "MIGX TV генератор",
        "description": "Настройте поля для MIGX TV: Form Tabs, Grid Columns, JSON-конфигурация и пример вывода.",
        "intent": "Нужно быстро подготовить конфигурацию TV под MIGX.",
        "deliverables": ["Form Tabs", "Grid Columns", "TV-ready JSON"],
        "example": '[{"caption":"Контент","fields":[{"field":"title","caption":"Заголовок"}]}]',
    },
    {
        "slug": "migx-formtabs-generator",
        "preset": "formtabs",
        "query": "migx formtabs generator",
        "title": "MIGX Form Tabs генератор",
        "h1": "MIGX Form Tabs генератор",
        "description": "Создайте Form Tabs для MIGX: группы полей, подписи, типы ввода и безопасный JSON для MODX.",
        "intent": "Нужно собрать formtabs без ошибок кавычек и вложенных массивов.",
        "deliverables": ["Form Tabs JSON", "Группировка полей", "Подсказки по ошибкам"],
        "example": '[{"caption":"Основное","fields":[{"field":"title","caption":"Заголовок","inputTVtype":"text"}]}]',
    },
    {
        "slug": "migx-grid-columns-generator",
        "preset": "grid_columns",
        "query": "migx grid columns",
        "title": "MIGX Grid Columns генератор",
        "h1": "MIGX Grid Columns генератор",
        "description": "Соберите Grid Columns для MIGX: подписи колонок, sortable поля и видимые значения в таблице MODX.",
        "intent": "Нужно настроить список элементов MIGX в админке MODX.",
        "deliverables": ["Grid Columns JSON", "Колонки таблицы", "Рекомендуемые поля"],
        "example": '[{"header":"Заголовок","dataIndex":"title","sortable":true}]',
    },
    {
        "slug": "migx-nested-generator",
        "preset": "nested",
        "query": "nested migx modx",
        "title": "Вложенный MIGX генератор",
        "h1": "Вложенный MIGX генератор",
        "description": "Создайте nested MIGX структуру: секции, элементы внутри секций и JSON configs для вложенных полей.",
        "intent": "Нужна структура section -> items без ручного вложения configs.",
        "deliverables": ["Nested MIGX", "Вложенные configs", "Пример секций"],
        "example": '[{"fieldname":"sections","caption":"Секции","inputTVtype":"migx","configs":"[...]"}]',
    },
    {
        "slug": "migx-tabs-generator",
        "preset": "tabs",
        "query": "migx tabs modx",
        "title": "MIGX tabs генератор",
        "h1": "MIGX tabs генератор",
        "description": "Разделите MIGX-поля по табам: контент, медиа, SEO и дополнительные настройки.",
        "intent": "Нужно сделать удобную форму MIGX с табами для редактора.",
        "deliverables": ["Tabs", "tabid для полей", "Удобная структура формы"],
        "example": '[{"fieldname":"tab_content","caption":"Контент","inputTVtype":"tab"}]',
    },
    {
        "slug": "migx-gallery",
        "preset": "gallery",
        "query": "migx gallery",
        "title": "MIGX галерея для MODX",
        "h1": "MIGX галерея",
        "description": "Соберите MIGX-галерею: изображение, alt, подпись, описание и пример вывода через getImageList.",
        "intent": "Нужна редактируемая галерея изображений в MODX.",
        "deliverables": ["Image field", "Alt и подпись", "getImageList пример"],
        "example": "[[getImageList? &tvname=`gallery` &tpl=`galleryItemTpl`]]",
    },
    {
        "slug": "migx-slider",
        "preset": "slider",
        "query": "migx slider",
        "title": "MIGX слайдер для MODX",
        "h1": "MIGX слайдер",
        "description": "Соберите поля для слайдера MODX: изображение, заголовок, текст, кнопка и ссылка.",
        "intent": "Нужен управляемый слайдер без отдельного компонента.",
        "deliverables": ["Поля слайда", "CTA", "Пример chunk"],
        "example": "[[getImageList? &tvname=`slider` &tpl=`slideTpl`]]",
    },
    {
        "slug": "migx-faq",
        "preset": "faq",
        "query": "migx faq",
        "title": "MIGX FAQ блок для MODX",
        "h1": "MIGX FAQ",
        "description": "Соберите FAQ через MIGX: вопрос, ответ, категория, порядок и пример вывода аккордеоном.",
        "intent": "Нужен редактируемый FAQ-блок для SEO-страницы.",
        "deliverables": ["FAQ fields", "Richtext answer", "Accordion chunk"],
        "example": '[{"fieldname":"question","caption":"Вопрос","inputTVtype":"text"}]',
    },
    {
        "slug": "migx-catalog",
        "preset": "catalog",
        "query": "migx catalog",
        "title": "MIGX каталог для MODX",
        "h1": "MIGX каталог",
        "description": "Создайте простой каталог на MIGX: название, фото, цена, свойства и описание карточки.",
        "intent": "Нужно хранить небольшой каталог в TV без отдельной базы.",
        "deliverables": ["Карточка товара", "Цена и свойства", "Grid Columns"],
        "example": '[{"fieldname":"price","caption":"Цена","inputTVtype":"number"}]',
    },
    {
        "slug": "migx-team",
        "preset": "team",
        "query": "migx team",
        "title": "MIGX команда для MODX",
        "h1": "MIGX команда",
        "description": "Соберите блок команды: фото, имя, должность, описание, контакты и порядок сотрудников.",
        "intent": "Нужен управляемый блок сотрудников в MODX.",
        "deliverables": ["Team fields", "Фото и роль", "Контакты"],
        "example": '[{"fieldname":"name","caption":"Имя","inputTVtype":"text"}]',
    },
    {
        "slug": "migx-reviews",
        "preset": "reviews",
        "query": "migx reviews",
        "title": "MIGX отзывы для MODX",
        "h1": "MIGX отзывы",
        "description": "Соберите отзывы на MIGX: автор, компания, текст, рейтинг, фото и ссылка на кейс.",
        "intent": "Нужен редактируемый блок отзывов с рейтингом.",
        "deliverables": ["Review fields", "Rating", "Author photo"],
        "example": '[{"fieldname":"rating","caption":"Рейтинг","inputTVtype":"number"}]',
    },
    {
        "slug": "migx-getimagelist",
        "preset": "getimagelist",
        "query": "migx getimagelist",
        "title": "MIGX getImageList пример вывода",
        "h1": "MIGX getImageList",
        "description": "Получите пример вывода MIGX через getImageList: tvname, tpl, wrapperTpl и поля чанка.",
        "intent": "Нужно вывести MIGX TV на фронтенде через getImageList.",
        "deliverables": ["getImageList вызов", "tpl chunk", "Подстановка placeholders"],
        "example": "[[getImageList? &tvname=`items` &tpl=`itemTpl`]]",
    },
    {
        "slug": "migx-fenom-chunk",
        "preset": "fenom_chunk",
        "query": "migx fenom chunk",
        "title": "MIGX Fenom chunk для MODX",
        "h1": "MIGX Fenom chunk",
        "description": "Соберите Fenom/chunk пример для вывода MIGX-полей в MODX с понятными placeholders.",
        "intent": "Нужен готовый шаблон вывода MIGX-элементов.",
        "deliverables": ["Fenom snippet", "Chunk placeholders", "HTML-разметка"],
        "example": "<article>{$item.title}</article>",
    },
    {
        "slug": "migx-configs",
        "preset": "configs",
        "query": "migx configs",
        "title": "MIGX configs генератор",
        "h1": "MIGX configs",
        "description": "Разберите и соберите MIGX configs для вложенных структур, listbox и сложных наборов полей.",
        "intent": "Нужно понять и собрать configs без поломанного JSON.",
        "deliverables": ["configs JSON", "Nested fields", "Проверка синтаксиса"],
        "example": '{"formtabs":[{"caption":"Основное","fields":[]}]}',
    },
    {
        "slug": "migx-image-field",
        "preset": "image_field",
        "query": "migx image field",
        "title": "MIGX image field",
        "h1": "MIGX image field",
        "description": "Настройте изображение в MIGX: image field, alt, подпись, превью и вывод в чанке.",
        "intent": "Нужно правильно добавить изображение в MIGX-структуру.",
        "deliverables": ["Image input", "Alt field", "Preview column"],
        "example": '[{"fieldname":"image","caption":"Изображение","inputTVtype":"image"}]',
    },
    {
        "slug": "migx-richtext-field",
        "preset": "richtext_field",
        "query": "migx richtext field",
        "title": "MIGX richtext field",
        "h1": "MIGX richtext field",
        "description": "Добавьте richtext поле в MIGX и проверьте структуру для описаний, FAQ и контентных блоков.",
        "intent": "Нужно хранить форматированный текст внутри MIGX.",
        "deliverables": ["Richtext input", "Описание", "Пример вывода"],
        "example": '[{"fieldname":"content","caption":"Текст","inputTVtype":"richtext"}]',
    },
    {
        "slug": "migx-validator",
        "preset": "validator",
        "query": "migx validator",
        "title": "MIGX validator",
        "h1": "MIGX validator",
        "description": "Проверьте MIGX JSON: пустые fieldname, дубли, listbox без опций, MIGX без вложенных полей и ошибки импорта.",
        "intent": "Нужно быстро найти ошибки в MIGX-конфигурации.",
        "deliverables": ["Проверка JSON", "Список предупреждений", "Безопасный экспорт"],
        "example": "fieldname не должен быть пустым или повторяться",
    },
    {
        "slug": "migx-import-json",
        "preset": "import_json",
        "query": "migx import json",
        "title": "MIGX import JSON",
        "h1": "MIGX import JSON",
        "description": "Импортируйте существующий MIGX JSON, проверьте поля и доработайте конфигурацию визуально.",
        "intent": "Нужно загрузить старую MIGX-конфигурацию и поправить ее без ручного редактирования.",
        "deliverables": ["Импорт JSON", "Разбор tab fields", "Проверка nested MIGX"],
        "example": "Загрузите .json файл через кнопку Импорт",
    },
    {
        "slug": "migx-errors",
        "preset": "errors",
        "query": "migx json error",
        "title": "Ошибки MIGX JSON и Form Tabs",
        "h1": "Ошибки MIGX JSON",
        "description": "Найдите типовые ошибки MIGX: битый JSON, неверный configs, пустой fieldname и проблемы Form Tabs.",
        "intent": "Нужно понять, почему MIGX не сохраняет или не показывает поля.",
        "deliverables": ["Диагностика ошибок", "Подсказки", "Проверка конфига"],
        "example": "Unexpected token чаще всего означает неэкранированные кавычки или лишнюю запятую",
    },
    {
        "slug": "migx-examples",
        "preset": "examples",
        "query": "migx examples",
        "title": "MIGX examples для MODX",
        "h1": "MIGX examples",
        "description": "Готовые примеры MIGX для MODX: галерея, слайдер, FAQ, каталог, команда и отзывы.",
        "intent": "Нужна стартовая библиотека рабочих MIGX-шаблонов.",
        "deliverables": ["Готовые пресеты", "JSON examples", "Связанные страницы"],
        "example": "Выберите шаблон и откройте генератор с предустановкой",
    },
]


MIGX_HUB_FAQ = [
    (
        "Чем Form Tabs отличаются от Grid Columns в MIGX?",
        "Form Tabs отвечают за вкладки и группировку полей внутри формы редактирования MIGX. Grid Columns задают колонки, которые видны в таблице элементов MIGX в менеджере MODX.",
    ),
    (
        "Когда нужен nested MIGX?",
        "Nested MIGX нужен, когда один элемент должен содержать повторяемые дочерние элементы: например секция с карточками, категория с пунктами или слайд с кнопками.",
    ),
    (
        "Что выбрать для вывода MIGX: getImageList или Fenom?",
        "getImageList удобен для классического вывода MIGX TV через tpl и wrapperTpl. Fenom подходит, если проект уже использует Fenom-шаблоны и нужно вывести поля через понятный синтаксис.",
    ),
    (
        "Зачем нужен валидатор MIGX JSON?",
        "Валидатор помогает найти пустые fieldname, дубли, listbox без options, MIGX без вложенных полей и ошибки импортированного JSON до вставки конфигурации в MODX.",
    ),
]


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def slug_url(slug: str) -> str:
    return f"{SITE}/{slug}.html"


def generator_url(page: dict[str, object]) -> str:
    return f"migx-generator.html?preset={esc(page['preset'])}&amp;source={esc(page['slug'])}"


def asset_head(page: dict[str, object]) -> str:
    title = esc(f"{page['title']} | Цифра")
    description = esc(page["description"])
    canonical = esc(slug_url(str(page["slug"])))
    return f"""<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="{canonical}">
    <meta name="author" content="Цифра">
    <meta property="og:type" content="website">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:locale" content="ru_RU">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/base.css?v=catalog-shell-20260601-1">
    <link rel="stylesheet" href="css/components.css?v=catalog-shell-20260601-1">
    <link rel="stylesheet" href="css/layout.css?v=catalog-shell-20260601-1">
    <link rel="stylesheet" href="css/responsive.css?v=catalog-shell-20260601-1">
    <link rel="stylesheet" href="css/themes.css?v=catalog-shell-20260601-1">
    <link rel="stylesheet" href="css/acf-content.css?v=catalog-shell-20260601-1">"""


def breadcrumb_schema(page: dict[str, object] | None) -> str:
    items = [
        {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE}/"},
        {"@type": "ListItem", "position": 2, "name": "MIGX", "item": f"{SITE}/migx.html"},
    ]
    if page:
        items.append(
            {
                "@type": "ListItem",
                "position": 3,
                "name": str(page["h1"]),
                "item": slug_url(str(page["slug"])),
            }
        )
    return json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}, ensure_ascii=False, indent=4)


def faq_schema(page: dict[str, object]) -> str:
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": f"Для чего нужен {page['h1']}?",
                "acceptedAnswer": {"@type": "Answer", "text": str(page["intent"])},
            },
            {
                "@type": "Question",
                "name": "Что получится на выходе?",
                "acceptedAnswer": {"@type": "Answer", "text": ", ".join(page["deliverables"])},
            },
            {
                "@type": "Question",
                "name": "Можно ли использовать результат в MODX?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Да. Скопируйте JSON, Form Tabs, Grid Columns или chunk и перенесите в MIGX TV или шаблон MODX.",
                },
            },
        ],
    }
    return json.dumps(payload, ensure_ascii=False, indent=4)


def hub_faq_schema() -> str:
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": question,
                "acceptedAnswer": {"@type": "Answer", "text": answer},
            }
            for question, answer in MIGX_HUB_FAQ
        ],
    }
    return json.dumps(payload, ensure_ascii=False, indent=4)


def hub_faq_section() -> str:
    items = "\n        ".join(
        '<details class="acf-faq-item"{open_attr}><summary>{question}</summary><p>{answer}</p></details>'.format(
            open_attr=" open" if index == 0 else "",
            question=esc(question),
            answer=esc(answer),
        )
        for index, (question, answer) in enumerate(MIGX_HUB_FAQ)
    )
    return f"""<section class="acf-section" id="faq"><div class="acf-container"><div class="acf-section-head"><span class="acf-section-label">FAQ</span><h2>Частые вопросы по MIGX</h2><p>Короткие ответы на вопросы, с которыми обычно приходят перед настройкой MIGX TV.</p></div><div class="acf-faq">
        {items}
    </div></div></section>"""


def header(active: str = "") -> str:
    home_active = ' class="is-active"' if active == "home" else ""
    catalog_active = ' class="is-active"' if active == "catalog" else ""
    utilities_active = " is-active" if active in {"utilities", "acf", "hub", "migx", "acf-generator", "migx-generator"} else ""
    return f"""<header class="header">
    <div class="container">
        <a href="index.html" class="header-logo" aria-label="Цифра — на главную">
            <span class="logo-icon">◆</span>
            <span class="logo-text">Цифра</span>
        </a>
        <nav aria-label="Основная навигация">
            <ul class="header-nav">
                <li><a href="index.html"{home_active}>Главная</a></li>
                <li><a href="index.html#catalog"{catalog_active}>Каталог</a></li>
                <li class="nav-dropdown">
                    <button class="nav-dropdown-toggle{utilities_active}" type="button" aria-expanded="false" aria-controls="utilities-menu">Утилиты <span class="nav-caret" aria-hidden="true">⌄</span></button>
                    <div class="nav-dropdown-menu" id="utilities-menu">
                        <div class="nav-dropdown-grid">
                            <div class="nav-dropdown-group">
                                <a class="nav-dropdown-heading" href="acf.html">ACF / WordPress</a>
                                <a href="acf-generator.html">ACF генератор</a>
                                <a href="acf-php-generator.html">PHP export</a>
                                <a href="acf-json-generator.html">JSON export</a>
                                <a href="acf-repeater-generator.html">Repeater</a>
                                <a href="acf-flexible-content-generator.html">Flexible Content</a>
                            </div>
                            <div class="nav-dropdown-group">
                                <a class="nav-dropdown-heading" href="migx.html">MODX / MIGX</a>
                                <a href="migx-generator.html">MIGX генератор</a>
                                <a href="migx-json-generator.html">MIGX JSON</a>
                                <a href="migx-formtabs-generator.html">Form Tabs</a>
                                <a href="migx-grid-columns-generator.html">Grid Columns</a>
                                <a href="migx-getimagelist.html">getImageList</a>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </nav>
        <button class="hamburger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
</header>"""


def footer() -> str:
    return """<footer class="acf-footer">
    <div class="acf-container acf-footer__inner">
        <div>
            <strong>Цифра</strong>
            <p>Каталог цифровых продуктов, генераторов и веб-утилит для рабочих интернет-проектов.</p>
        </div>
        <div class="acf-footer-links">
            <a href="index.html">Главная</a>
            <a href="index.html#catalog">Каталог</a>
            <a href="index.html#utilities">Утилиты</a>
            <a href="acf.html">ACF</a>
            <a href="migx.html">MIGX</a>
            <a href="about.html">О проекте</a>
            <a href="contacts.html">Контакты</a>
            <a href="privacy.html">Политика</a>
        </div>
    </div>
</footer>"""


def related_links(current_slug: str) -> str:
    links = [p for p in PAGES if p["slug"] != current_slug][:6]
    return "\n".join(
        f'<a class="acf-related-card" href="{esc(p["slug"])}.html"><span>{esc(p["query"])}</span><strong>{esc(p["h1"])}</strong></a>'
        for p in links
    )


def page_cta(page: dict[str, object]) -> str:
    return "Открыть пресет"


def implementation_checks(page: dict[str, object]) -> list[str]:
    checks = [
        "fieldname заполняются латиницей, без пробелов и дублей;",
        "caption понятны редактору MODX и совпадают со смыслом поля;",
        "экспорт JSON, Form Tabs и Grid Columns не содержит пустых обязательных значений;",
    ]
    preset = str(page["preset"])
    if preset in {"gallery", "image_field", "slider"}:
        checks.append("для image field есть alt или подпись, чтобы вывод через getImageList был полезен для SEO;")
    elif preset in {"nested", "configs"}:
        checks.append("у вложенных MIGX заполнены дочерние поля и пример вывода через &value не теряет структуру;")
    elif preset in {"getimagelist", "fenom_chunk"}:
        checks.append("имена placeholders в chunk совпадают с fieldname из MIGX-конфигурации;")
    else:
        checks.append("получившийся preset открывается в генераторе и проходит readiness score без критичных ошибок;")
    return checks


def practical_section(page: dict[str, object]) -> str:
    deliverables = ", ".join(str(item) for item in page["deliverables"])
    checks = "\n".join(f"<li>{esc(item)}</li>" for item in implementation_checks(page))
    return f"""<section class="acf-section acf-section--muted">
        <div class="acf-container acf-use-grid">
            <article>
                <span class="acf-section-label">Практический разбор</span>
                <h2>Как использовать {esc(page["h1"])} в MODX</h2>
                <p>{esc(page["description"])} Этот раздел закрывает запрос <strong>{esc(page["query"])}</strong>: показывает, какие поля нужны, какой результат забрать из генератора и где его применить в MIGX TV.</p>
                <p>После открытия пресета проверьте структуру, переименуйте поля под свой проект и заберите готовые артефакты: {esc(deliverables)}.</p>
            </article>
            <article>
                <span class="acf-section-label">Что проверить перед вставкой в MODX</span>
                <h2>Мини-чек-лист перед публикацией</h2>
                <div class="acf-checklist"><ul>{checks}</ul></div>
            </article>
        </div>
    </section>"""


def preset_rows() -> str:
    return "\n".join(
        f"""<div class="acf-preset-row">
            <span class="acf-preset-query">{esc(p["query"])}</span>
            <strong class="acf-preset-name">{esc(p["h1"])}</strong>
            <span class="acf-preset-result">{esc(p["intent"])} На выходе: {esc(", ".join(p["deliverables"]))}.</span>
            <a class="acf-preset-link" href="{generator_url(p)}">{esc(page_cta(p))}</a>
        </div>"""
        for p in PAGES
    )


def render_page(page: dict[str, object]) -> str:
    deliverables = "\n".join(f"<li>{esc(item)}</li>" for item in page["deliverables"])
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    {asset_head(page)}
    <script type="application/ld+json">{breadcrumb_schema(page)}</script>
    <script type="application/ld+json">{faq_schema(page)}</script>
</head>
<body>
{header("migx")}
<main>
    <section class="acf-hero acf-page-hero">
        <div class="acf-container acf-hero__grid">
            <div class="acf-hero__copy">
                <nav class="acf-breadcrumbs" aria-label="Хлебные крошки"><a href="index.html">Главная</a><span>/</span><a href="migx.html">MIGX</a><span>/</span>{esc(page["h1"])}</nav>
                <span class="acf-kicker">{esc(page["query"])}</span>
                <h1>{esc(page["h1"])}</h1>
                <p>{esc(page["description"])}</p>
                <div class="acf-actions">
                    <a class="acf-btn acf-btn--primary" href="{generator_url(page)}">{esc(page_cta(page))}</a>
                    <a class="acf-btn acf-btn--ghost" href="#example">Посмотреть пример</a>
                </div>
            </div>
            <aside class="acf-intent-card" aria-label="Сценарий использования">
                <span>Когда использовать</span>
                <h2>{esc(page["intent"])}</h2>
                <p>Это не общая статья, а рабочий сценарий для MIGX: структура полей, пример вывода и ссылка на preset генератора уже связаны с запросом {esc(page["query"])}.</p>
            </aside>
        </div>
    </section>
    <section class="acf-section" id="example">
        <div class="acf-container acf-use-grid">
            <div class="ad-slot" data-ad-slot="migx-landing-after-hero" aria-label="Рекламный блок после первого экрана"></div>
            <article>
                <span class="acf-section-label">Что входит</span>
                <h2>Готовая структура под запрос</h2>
                <div class="acf-checklist"><ul>{deliverables}</ul></div>
            </article>
            <article class="acf-code-card"><pre><code>{esc(page["example"])}</code></pre></article>
        </div>
    </section>
    {practical_section(page)}
    <section class="acf-section">
        <div class="acf-container">
            <div class="ad-slot" data-ad-slot="migx-landing-before-related" aria-label="Рекламный блок перед связанными страницами"></div>
            <div class="acf-section-head"><span class="acf-section-label">Связанные страницы</span><h2>Продолжить по MIGX-кластеру</h2></div>
            <div class="acf-related-grid">{related_links(str(page["slug"]))}</div>
        </div>
    </section>
    <section class="acf-final-cta"><div class="acf-container"><h2>Соберите {esc(page["h1"])} без ручной сборки JSON</h2><p>Откройте preset, проверьте readiness score и заберите конфигурацию, getImageList package или chunk для MODX.</p><a class="acf-btn acf-btn--primary" href="{generator_url(page)}">{esc(page_cta(page))}</a></div></section>
</main>
{footer()}
<script src="js/main.js" defer></script>
</body>
</html>
"""


def render_hub() -> str:
    page = {
        "slug": "migx",
        "title": "MIGX генератор и шаблоны для MODX",
        "description": "Категория MIGX-инструментов для MODX: JSON, Form Tabs, Grid Columns, nested MIGX, getImageList, Fenom chunks и готовые пресеты.",
    }
    cards = "\n".join(
        f'<article class="acf-topic-card"><span>{esc(p["query"])}</span><h3>{esc(p["h1"])}</h3><p>{esc(p["description"])}</p><p>{esc(p["intent"])} Генератор сразу откроется с нужными полями и экспортом под этот сценарий.</p><a class="acf-card-cta" href="{generator_url(p)}">{esc(page_cta(p))}</a></article>'
        for p in PAGES
    )
    item_list = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "url": slug_url(str(p["slug"])), "name": str(p["h1"])}
            for i, p in enumerate(PAGES)
        ],
    }
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    {asset_head(page)}
    <script type="application/ld+json">{breadcrumb_schema(None)}</script>
    <script type="application/ld+json">{json.dumps(item_list, ensure_ascii=False, indent=4)}</script>
    <script type="application/ld+json">{hub_faq_schema()}</script>
</head>
<body>
{header("migx")}
<main>
    <section class="acf-hero">
        <div class="acf-container acf-hero__grid">
            <div class="acf-hero__copy">
                <span class="acf-kicker">MODX MIGX</span>
                <h1>MIGX генератор и шаблоны для MODX</h1>
                <p>Соберите MIGX JSON, Form Tabs, Grid Columns, nested-конфигурации и готовые chunks без ручной сборки массива.</p>
                <div class="acf-actions"><a class="acf-btn acf-btn--primary" href="migx-generator.html">Открыть генератор</a><a class="acf-btn acf-btn--ghost" href="#pages">Смотреть страницы</a></div>
            </div>
            <aside class="acf-plan-card"><h2>Карта категории</h2><ul><li>Базовые MIGX JSON и TV.</li><li>Form Tabs и Grid Columns.</li><li>Галерея, слайдер, FAQ, каталог, команда и отзывы.</li><li>Валидатор, импорт, ошибки и вывод через getImageList/Fenom.</li></ul></aside>
        </div>
    </section>
    <section class="acf-section" id="pages"><div class="acf-container"><div class="ad-slot" data-ad-slot="migx-hub-after-hero" aria-label="Рекламный блок после первого экрана"></div><div class="acf-section-head"><span class="acf-section-label">MIGX-разделы</span><h2>Практические страницы под MIGX-запросы</h2><p>Каждая страница закрывает отдельный интент: от MIGX JSON и Form Tabs до nested MIGX, getImageList, Fenom chunk и ошибок конфигурации.</p></div><div class="acf-topic-grid">{cards}</div></div></section>
    <section class="acf-section acf-section--muted"><div class="acf-container"><div class="acf-section-head"><span class="acf-section-label">Выбор инструмента</span><h2>Какой MIGX-инструмент выбрать под задачу MODX</h2><p>Если нужен JSON для TV, открывайте базовый генератор. Для фронтенда используйте getImageList package или Fenom chunk. Для сложных блоков выбирайте nested MIGX, tabs и configs.</p></div><div class="acf-preset-map" aria-label="Подбор MIGX-инструмента по задаче">{preset_rows()}</div></div></section>
    {hub_faq_section()}
    <section class="acf-final-cta"><div class="acf-container"><h2>Откройте MIGX генератор</h2><p>Выберите шаблон, проверьте ошибки и экспортируйте JSON или chunk.</p><a class="acf-btn acf-btn--primary" href="migx-generator.html">Запустить</a></div></section>
</main>
{footer()}
<script src="js/main.js" defer></script>
</body>
</html>
"""


def write_pages() -> None:
    (ROOT / "migx.html").write_text(render_hub(), encoding="utf-8")
    for page in PAGES:
        (ROOT / f"{page['slug']}.html").write_text(render_page(page), encoding="utf-8")


def update_sitemap() -> None:
    sitemap = ROOT / "sitemap.xml"
    tree = ET.parse(sitemap)
    old_root = tree.getroot()
    entries: dict[str, tuple[str | None, str, str]] = {}
    for url in old_root.findall(".//{*}url"):
        loc = url.find("{*}loc")
        if loc is None or not loc.text:
            continue
        if not (
            loc.text == f"{SITE}/"
            or loc.text.startswith(f"{SITE}/acf")
            or loc.text.startswith(f"{SITE}/migx")
        ):
            continue
        lastmod = url.find("{*}lastmod")
        changefreq = url.find("{*}changefreq")
        priority = url.find("{*}priority")
        entries[loc.text] = (
            lastmod.text if lastmod is not None and lastmod.text else None,
            changefreq.text if changefreq is not None and changefreq.text else "weekly",
            priority.text if priority is not None and priority.text else "0.5",
        )
    entries[f"{SITE}/"] = ("2026-06-01", "weekly", "1.0")
    entries[f"{SITE}/migx.html"] = (SITEMAP_LASTMOD, "weekly", "0.85")
    entries[f"{SITE}/migx-generator.html"] = (SITEMAP_LASTMOD, "weekly", "0.8")
    for page in PAGES:
        entries[slug_url(str(page["slug"]))] = (SITEMAP_LASTMOD, "weekly", "0.75")
    ET.register_namespace("", SITEMAP_NS)
    root = ET.Element(f"{{{SITEMAP_NS}}}urlset")
    for loc, (lastmod, changefreq, priority) in entries.items():
        url = ET.SubElement(root, f"{{{SITEMAP_NS}}}url")
        ET.SubElement(url, f"{{{SITEMAP_NS}}}loc").text = loc
        if lastmod:
            ET.SubElement(url, f"{{{SITEMAP_NS}}}lastmod").text = lastmod
        ET.SubElement(url, f"{{{SITEMAP_NS}}}changefreq").text = changefreq
        ET.SubElement(url, f"{{{SITEMAP_NS}}}priority").text = priority
    tree = ET.ElementTree(root)
    ET.indent(tree, space="    ")
    tree.write(sitemap, encoding="utf-8", xml_declaration=True)
    sitemap.write_text(sitemap.read_text(encoding="utf-8") + "\n", encoding="utf-8")


def main() -> None:
    write_pages()
    update_sitemap()


if __name__ == "__main__":
    main()
