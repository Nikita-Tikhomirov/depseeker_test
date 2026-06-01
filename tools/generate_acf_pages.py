from __future__ import annotations

import html
import json
from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SITE = "https://zifra.example.com"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
SITEMAP_LASTMOD = "2026-05-31"


PAGES = [
    {
        "slug": "acf-php-generator",
        "preset": "php",
        "query": "acf php generator",
        "title": "ACF PHP генератор для WordPress",
        "h1": "ACF PHP генератор",
        "description": "Соберите группу Advanced Custom Fields и получите готовый PHP-код для регистрации через acf_add_local_field_group.",
        "intent": "Нужен быстрый PHP export без ручной сборки массива полей.",
        "audience": "WordPress-разработчики, которые хранят ACF в теме или плагине.",
        "deliverables": ["PHP массив group и fields", "Location rules", "Ключи полей без конфликтов"],
    },
    {
        "slug": "acf-json-generator",
        "preset": "json",
        "query": "acf json generator",
        "title": "ACF JSON генератор",
        "h1": "ACF JSON генератор",
        "description": "Создайте структуру ACF и скопируйте JSON для local-json, миграции между проектами или code review.",
        "intent": "Нужен переносимый JSON для ACF без ручного редактирования.",
        "audience": "Команды, которые версионируют поля и синхронизируют их через Git.",
        "deliverables": ["JSON export", "Стабильные field keys", "Проверяемая структура полей"],
    },
    {
        "slug": "acf-repeater-generator",
        "preset": "faq",
        "query": "acf repeater generator",
        "title": "ACF Repeater генератор",
        "h1": "ACF Repeater генератор",
        "description": "Соберите повторяющиеся блоки ACF: FAQ, отзывы, карточки услуг, этапы, тарифы и списки преимуществ.",
        "intent": "Нужен repeater с вложенными sub fields и понятной HTML-логикой вывода.",
        "audience": "Разработчики лендингов и контентных страниц на WordPress.",
        "deliverables": ["Repeater field", "Sub fields", "Пример вывода в шаблоне"],
    },
    {
        "slug": "acf-flexible-content-generator",
        "preset": "flexible",
        "query": "acf flexible content generator",
        "title": "ACF Flexible Content генератор",
        "h1": "ACF Flexible Content генератор",
        "description": "Соберите гибкий page builder на ACF: hero, текст, медиа, FAQ, CTA и другие секции страницы.",
        "intent": "Нужно дать редактору свободу собирать страницу из заранее контролируемых блоков.",
        "audience": "Студии и разработчики, которые делают кастомные темы WordPress.",
        "deliverables": ["Flexible content", "Layouts", "Набор секций для page builder"],
    },
    {
        "slug": "acf-field-group-generator",
        "preset": "field_group",
        "query": "acf field group generator",
        "title": "ACF Field Group генератор",
        "h1": "ACF Field Group генератор",
        "description": "Настройте группу полей ACF: название, ключ, location rules, порядок и набор полей для нужного типа записи.",
        "intent": "Нужно быстро собрать field group и не ошибиться в ключах и правилах показа.",
        "audience": "Разработчики и контент-менеджеры, которые описывают структуру данных WordPress.",
        "deliverables": ["Field group", "Location rules", "PHP и JSON export"],
    },
    {
        "slug": "acf-seo-fields",
        "preset": "seo",
        "query": "acf seo fields",
        "title": "ACF SEO поля для WordPress",
        "h1": "ACF SEO поля",
        "description": "Создайте набор SEO-полей: title, description, canonical, robots, Open Graph и микроразметку.",
        "intent": "Нужна простая структура SEO-полей без установки тяжелого SEO-комбайна.",
        "audience": "Небольшие сайты, каталоги, лендинги и кастомные WordPress-проекты.",
        "deliverables": ["Meta title/description", "OG поля", "Robots и canonical"],
    },
    {
        "slug": "acf-faq-fields",
        "preset": "faq",
        "query": "acf faq fields",
        "title": "ACF FAQ поля с микроразметкой",
        "h1": "ACF FAQ поля",
        "description": "Соберите FAQ repeater для WordPress: вопрос, ответ, порядок вывода и готовая структура под FAQPage schema.",
        "intent": "Нужен FAQ-блок, который удобно редактировать и легко вывести на странице.",
        "audience": "SEO-специалисты и разработчики коммерческих страниц.",
        "deliverables": ["FAQ repeater", "Question/answer fields", "FAQPage schema"],
    },
    {
        "slug": "acf-hero-section",
        "preset": "hero",
        "query": "acf hero section",
        "title": "ACF Hero Section поля",
        "h1": "ACF Hero Section",
        "description": "Создайте поля для первого экрана: заголовок, подзаголовок, кнопки, изображение, бейджи и доверительные маркеры.",
        "intent": "Нужно управлять hero-блоком из админки WordPress без правки шаблона.",
        "audience": "Маркетинговые сайты, SaaS-страницы, продуктовые лендинги.",
        "deliverables": ["Hero title", "CTA buttons", "Image/background fields"],
    },
    {
        "slug": "acf-team-repeater",
        "preset": "team",
        "query": "acf team repeater",
        "title": "ACF Team Repeater",
        "h1": "ACF Team Repeater",
        "description": "Соберите повторитель команды: фото, имя, должность, био, соцсети и порядок отображения сотрудников.",
        "intent": "Нужен редактируемый блок команды с повторяющимися карточками.",
        "audience": "Сайты агентств, клиник, образовательных проектов и сервисных компаний.",
        "deliverables": ["Team repeater", "Фото и роль", "Социальные ссылки"],
    },
    {
        "slug": "acf-testimonials-repeater",
        "preset": "testimonials",
        "query": "acf testimonials repeater",
        "title": "ACF Testimonials Repeater",
        "h1": "ACF Testimonials Repeater",
        "description": "Создайте блок отзывов на ACF: текст отзыва, автор, компания, рейтинг, аватар и ссылка на кейс.",
        "intent": "Нужно хранить отзывы структурно и выводить их в разных местах сайта.",
        "audience": "Коммерческие сайты, услуги, SaaS и каталоги решений.",
        "deliverables": ["Отзывы repeater", "Rating field", "Автор и компания"],
    },
    {
        "slug": "acf-page-builder",
        "preset": "page_builder",
        "query": "acf page builder",
        "title": "ACF Page Builder на Flexible Content",
        "h1": "ACF Page Builder",
        "description": "Соберите page builder на ACF Flexible Content: контролируемые секции, порядок блоков и безопасное редактирование контента.",
        "intent": "Нужен легкий page builder без Elementor, но с понятной редакторской логикой.",
        "audience": "Разработчики кастомных WordPress-тем и продуктовых сайтов.",
        "deliverables": ["Набор layouts", "Порядок секций", "Шаблон вывода блоков"],
    },
    {
        "slug": "acf-woocommerce-product-fields",
        "preset": "woocommerce_product",
        "query": "acf woocommerce product fields",
        "title": "ACF поля для товара WooCommerce",
        "h1": "ACF поля для товара WooCommerce",
        "description": "Создайте дополнительные поля товара: характеристики, комплектация, FAQ, инструкции, бейджи и блоки доверия.",
        "intent": "Нужно расширить карточку товара WooCommerce без перегруза админки.",
        "audience": "Интернет-магазины, маркетплейсы, каталоги оборудования и digital-товаров.",
        "deliverables": ["Product fields", "FAQ товара", "Характеристики и инструкции"],
    },
]


STRUCTURE_COPY = {
    "acf-php-generator": (
        "PHP-регистрация ACF без ручной сборки массива",
        "Страница ведет в preset, который готовит структуру для acf_add_local_field_group: group key, Location rules, field names и стабильные ключи для functions.php.",
    ),
    "acf-json-generator": (
        "ACF JSON для переноса и синхронизации полей",
        "Страница ведет в JSON preset: field keys, group key и структура полей готовы для папки acf-json, а синхронизация проверяется до переноса в проект.",
    ),
    "acf-repeater-generator": (
        "Repeater-поля для списков, FAQ и карточек",
        "Страница показывает, как собрать ACF repeater: родительское поле, вложенные sub fields и понятный цикл вывода для WordPress-шаблона.",
    ),
    "acf-flexible-content-generator": (
        "Flexible layouts для управляемых страниц",
        "Страница показывает, как собрать flexible content: отдельные layouts, порядок секций страницы и поля внутри каждого блока без тяжелого конструктора.",
    ),
    "acf-field-group-generator": (
        "Field group с понятными ключами и правилами вывода",
        "Страница ведет в базовый preset группы: group key, field names, location rules и стартовые поля уже собраны для PHP или JSON export.",
    ),
    "acf-seo-fields": (
        "Набор SEO-полей для шаблона WordPress",
        "Страница показывает минимальный ACF-набор для управления сниппетом, индексированием и соцсетями: title, description, canonical, robots и Open Graph.",
    ),
    "acf-faq-fields": (
        "FAQ-блок, который удобно редактировать из админки",
        "Страница ведет в preset для списка вопросов и ответов: редактор меняет пункты FAQ, preview показывает аккордеон FAQ, а экспорт дает основу для микроразметки.",
    ),
    "acf-hero-section": (
        "Поля первого экрана без ручной сборки",
        "Страница показывает, какие ACF-поля нужны для hero-блока: текст, CTA, медиа и доверительные маркеры. Из нее пользователь сразу попадает в генератор с готовым preview.",
    ),
    "acf-team-repeater": (
        "Команда сайта как управляемый repeater",
        "Страница показывает ACF-набор для блока «Команда»: карточки команды, фото сотрудника, должность, короткое био и социальные ссылки.",
    ),
    "acf-testimonials-repeater": (
        "Отзывы как repeater с данными для доверия",
        "Страница ведет в preset для social proof: отзывы клиентов, рейтинг, автор отзыва, должность, компания и изображение собираются в один ACF repeater.",
    ),
    "acf-page-builder": (
        "Легкий page builder на ACF вместо тяжелого конструктора",
        "Страница показывает набор layouts для редактора страницы: порядок секций, поля каждого блока и шаблон вывода для темы WordPress.",
    ),
    "acf-woocommerce-product-fields": (
        "Дополнительные поля для карточки товара WooCommerce",
        "Страница ведет в preset для товарной страницы: характеристики товара, инструкции, комплектация, блок доверия и FAQ товара собираются в один управляемый ACF-набор.",
    ),
}


PRESET_MAP_RESULTS = {
    "acf-php-generator": ("acf php generator", "PHP-код для acf_add_local_field_group"),
    "acf-json-generator": ("acf json generator", "JSON для папки acf-json и синхронизации"),
    "acf-repeater-generator": ("acf repeater generator", "Повторяемые списки, FAQ и карточки"),
    "acf-flexible-content-generator": ("acf flexible content", "Гибкие секции для page builder"),
    "acf-field-group-generator": ("acf field group generator", "Группа полей, ключи и правила показа"),
    "acf-seo-fields": ("acf seo fields", "Title, description, canonical и Open Graph"),
    "acf-faq-fields": ("acf faq fields", "Вопросы, ответы и основа для FAQPage"),
    "acf-hero-section": ("acf hero section", "Заголовок, CTA, изображение и бейджи"),
    "acf-team-repeater": ("acf team repeater", "Карточки сотрудников, фото, роль и ссылки"),
    "acf-testimonials-repeater": ("acf testimonials repeater", "Отзывы, рейтинг, автор и компания"),
    "acf-page-builder": ("acf page builder", "Набор управляемых секций страницы"),
    "acf-woocommerce-product-fields": ("acf woocommerce fields", "Характеристики, инструкции и FAQ товара"),
}


HUB_CARD_CTA = {
    "acf-php-generator": "Собрать PHP export",
    "acf-json-generator": "Подготовить ACF JSON",
    "acf-repeater-generator": "Настроить repeater",
    "acf-flexible-content-generator": "Собрать flexible layouts",
    "acf-field-group-generator": "Собрать field group",
    "acf-seo-fields": "Настроить SEO-поля",
    "acf-faq-fields": "Собрать FAQ-блок",
    "acf-hero-section": "Собрать hero-поля",
    "acf-team-repeater": "Собрать блок команды",
    "acf-testimonials-repeater": "Собрать отзывы",
    "acf-page-builder": "Собрать page builder",
    "acf-woocommerce-product-fields": "Расширить товар WooCommerce",
}


DELIVERABLES_COPY = {
    "acf-php-generator": ["Группа Content Fields", "PHP registration array", "Location rules и стабильные field keys"],
    "acf-json-generator": ["Группа Content Fields", "JSON export tab", "Стабильные field keys"],
    "acf-repeater-generator": ["повторяемый список", "sub fields", "цикл вывода"],
    "acf-flexible-content-generator": ["flexible content", "layouts", "секции страницы"],
    "acf-field-group-generator": ["Group title, key и location rules", "Text, image и repeater fields", "PHP и JSON export tabs"],
    "acf-seo-fields": ["Meta title и description", "canonical и robots", "Open Graph поля"],
    "acf-faq-fields": ["Repeater вопрос-ответ", "аккордеон FAQ", "FAQPage schema"],
    "acf-hero-section": ["Заголовок и подзаголовок", "CTA-кнопка", "изображение hero"],
    "acf-team-repeater": ["карточки команды", "фото сотрудника", "социальные ссылки"],
    "acf-testimonials-repeater": ["отзывы клиентов", "рейтинг", "автор отзыва"],
    "acf-page-builder": ["page builder layouts", "порядок секций", "шаблон вывода"],
    "acf-woocommerce-product-fields": ["характеристики товара", "инструкции и комплектация", "FAQ товара"],
}


CHECKLIST_COPY = {
    "acf-php-generator": ["Группа Content Fields", "PHP registration array", "Location rules и стабильные field keys"],
    "acf-json-generator": ["Группа Content Fields", "JSON export tab", "Стабильные field keys"],
    "acf-repeater-generator": ["Repeater field", "Sub fields", "Пример вывода в шаблоне"],
    "acf-flexible-content-generator": ["Flexible content", "Layouts", "Набор секций для page builder"],
    "acf-field-group-generator": ["Group title, key и location rules", "Text, image и repeater fields", "PHP и JSON export tabs"],
    "acf-seo-fields": ["Meta title/description", "OG поля", "Robots и canonical"],
    "acf-faq-fields": ["FAQ repeater", "Question/answer fields", "FAQPage schema"],
    "acf-hero-section": ["Hero title", "CTA buttons", "Image/background fields"],
    "acf-team-repeater": ["Team repeater", "Фото и роль", "Социальные ссылки"],
    "acf-testimonials-repeater": ["Отзывы repeater", "Rating field", "Автор и компания"],
    "acf-page-builder": ["Набор layouts", "Порядок секций", "Шаблон вывода блоков"],
    "acf-woocommerce-product-fields": ["Product fields", "FAQ товара", "Характеристики и инструкции"],
}


PRESET_COPY = {
    "acf-php-generator": "Предустановка под запрос «acf php generator» открывает группу Content Fields и сразу ведет к PHP-коду, который можно перенести в functions.php или отдельный include.",
    "acf-json-generator": "Предустановка под запрос «acf json generator» открывает группу Content Fields и сразу переключает генератор на JSON export.",
    "acf-repeater-generator": "Предустановка под запрос «acf repeater generator» открывает повторяемый список с sub fields и примером под цикл вывода в шаблоне.",
    "acf-flexible-content-generator": "Предустановка под запрос «acf flexible content generator» открывает flexible content с layouts для hero, текста, FAQ и других секций страницы.",
    "acf-field-group-generator": "Предустановка под запрос «acf field group generator» открывает группу Content Fields с текстовыми, медиа и повторяемыми полями.",
    "acf-seo-fields": "Предустановка под запрос «acf seo fields» открывает поля meta title, description, canonical, robots и Open Graph без тяжелого SEO-комбайна.",
    "acf-faq-fields": "Предустановка под запрос «acf faq fields» открывает repeater вопрос-ответ, готовый аккордеон FAQ и структуру под FAQPage schema.",
    "acf-hero-section": "Предустановка под запрос «acf hero section» открывает набор для первого экрана: заголовок, описание, CTA и изображение hero для live preview.",
    "acf-team-repeater": "Предустановка под запрос «acf team repeater» открывает карточки команды: фото сотрудника, роль, описание и социальные ссылки.",
    "acf-testimonials-repeater": "Предустановка под запрос «acf testimonials repeater» открывает отзывы клиентов: текст, рейтинг, автор отзыва, компания и аватар.",
    "acf-page-builder": "Предустановка под запрос «acf page builder» открывает page builder на flexible content: layouts, порядок секций и шаблон вывода блоков.",
    "acf-woocommerce-product-fields": "Предустановка под запрос «acf woocommerce product fields» открывает product preset: характеристики товара, инструкции, комплектацию и FAQ товара.",
}


STEP_COPY = {
    "acf-php-generator": [
        "Откройте генератор с готовой группой Content Fields и PHP export.",
        "Переименуйте группу и поля под свой тип записи, шаблон или страницу.",
        "Скопируйте PHP-массив и подключите его в проект WordPress.",
    ],
    "acf-json-generator": [
        "Откройте генератор с готовой группой Content Fields и активной вкладкой JSON.",
        "Переименуйте группу и поля под свой тип записи, шаблон или страницу.",
        "Скачайте или скопируйте JSON и перенесите его в ACF JSON workflow проекта.",
    ],
    "acf-repeater-generator": [
        "Откройте repeater preset с вложенными sub fields.",
        "Настройте названия строк, item-поля и порядок элементов.",
        "Экспортируйте структуру и используйте цикл вывода в теме.",
    ],
    "acf-flexible-content-generator": [
        "Откройте flexible preset с несколькими layouts.",
        "Оставьте только нужные секции страницы и переименуйте поля.",
        "Экспортируйте WP-шаблон+CSS или PHP-регистрацию для темы.",
    ],
    "acf-field-group-generator": [
        "Откройте генератор с готовой группой Content Fields.",
        "Переименуйте группу и поля под свой тип записи, шаблон или страницу.",
        "Выберите PHP или JSON вкладку и перенесите структуру в проект WordPress.",
    ],
    "acf-seo-fields": [
        "Откройте SEO preset с готовой группой meta-полей.",
        "Настройте names под ваш шаблон вывода в head.",
        "Экспортируйте PHP-регистрацию и подключите значения в теме.",
    ],
    "acf-faq-fields": [
        "Откройте FAQ preset с repeater-полями вопрос-ответ.",
        "Переименуйте вопросы, ответы и кнопку добавления строки под свой шаблон.",
        "Проверьте аккордеон FAQ в preview и экспортируйте шаблон.",
    ],
    "acf-hero-section": [
        "Откройте hero preset с готовыми полями для первого экрана.",
        "Переименуйте заголовок, описание, CTA и изображение под ваш шаблон.",
        "Экспортируйте WP-шаблон+CSS или PHP-регистрацию для темы.",
    ],
    "acf-team-repeater": [
        "Откройте team preset с повторяемыми карточками сотрудников.",
        "Настройте поля фото, роли, описания и ссылок под ваш дизайн.",
        "Экспортируйте WP-шаблон+CSS или PHP-регистрацию для темы.",
    ],
    "acf-testimonials-repeater": [
        "Откройте testimonials preset с повторяемыми отзывами.",
        "Настройте поля текста, рейтинга, автора и компании.",
        "Проверьте preview и экспортируйте блок для темы.",
    ],
    "acf-page-builder": [
        "Откройте page builder preset с готовыми layouts.",
        "Настройте порядок секций и поля внутри каждого блока.",
        "Экспортируйте шаблон вывода и CSS для темы.",
    ],
    "acf-woocommerce-product-fields": [
        "Откройте WooCommerce product preset с готовыми секциями товара.",
        "Переименуйте поля под вашу карточку, атрибуты и шаблон вывода.",
        "Проверьте preview и экспортируйте WP-шаблон+CSS для темы.",
    ],
}


FAQ_OUTPUT_COPY = {
    "acf-php-generator": "Content Fields preset, PHP-массив для acf_add_local_field_group, Location rules и код для functions.php.",
    "acf-json-generator": "ACF JSON для acf-json workflow: стабильные field keys, group key и понятная структура, где синхронизация между окружениями не ломает поля.",
    "acf-repeater-generator": "Повторяемый список, sub fields и основа под цикл вывода в шаблоне.",
    "acf-flexible-content-generator": "Flexible content, layouts и набор секций страницы для WordPress-шаблона.",
    "acf-field-group-generator": "Content Fields preset с group key, field names, location rules, базовыми полями и PHP/JSON export.",
    "acf-seo-fields": "Meta title, description, canonical, robots и Open Graph поля.",
    "acf-faq-fields": "Repeater вопрос-ответ, аккордеон FAQ и основа под FAQPage schema.",
    "acf-hero-section": "Поля для первого экрана: заголовок, описание, CTA и изображение hero.",
    "acf-team-repeater": "Карточки команды: фото сотрудника, роль, описание и социальные ссылки.",
    "acf-testimonials-repeater": "Отзывы клиентов, рейтинг, автор отзыва, компания и аватар.",
    "acf-page-builder": "Page builder: layouts, порядок секций и шаблон вывода блоков.",
    "acf-woocommerce-product-fields": "Product fields: характеристики товара, инструкции, комплектация и FAQ товара.",
}


FINAL_CTA_COPY = {
    "acf-php-generator": "Откройте генератор, проверьте поля в визуальном превью и экспортируйте чистый PHP-код.",
    "acf-json-generator": "Откройте генератор, проверьте поля в визуальном превью и экспортируйте ACF JSON.",
    "acf-field-group-generator": "Откройте генератор, проверьте группу в визуальном превью и выберите PHP или JSON export.",
}


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def page_deliverables(page: dict[str, object]) -> list[str]:
    return DELIVERABLES_COPY.get(str(page["slug"]), list(page["deliverables"]))


def checklist_deliverables(page: dict[str, object]) -> list[str]:
    return CHECKLIST_COPY.get(str(page["slug"]), list(page["deliverables"]))


def preset_copy(page: dict[str, object]) -> str:
    return PRESET_COPY.get(
        str(page["slug"]),
        f"Предустановка под запрос «{page['query']}» сразу подставит базовые поля, а дальше можно поправить названия, стили и экспорт.",
    )


def steps_copy(page: dict[str, object]) -> list[str]:
    return STEP_COPY.get(
        str(page["slug"]),
        [
            "Откройте генератор с готовой предустановкой под этот тип ACF-структуры.",
            "Переименуйте группу и поля под свой тип записи, шаблон или страницу.",
            "Скопируйте PHP или JSON и перенесите в проект WordPress.",
        ],
    )


def faq_output_copy(page: dict[str, object]) -> str:
    return FAQ_OUTPUT_COPY.get(str(page["slug"]), f"{', '.join(page_deliverables(page))}.")


def final_cta_copy(page: dict[str, object]) -> str:
    return FINAL_CTA_COPY.get(str(page["slug"]), "Откройте генератор, проверьте поля в визуальном превью и экспортируйте PHP или JSON.")


def code_sample(page: dict[str, object], group_key: str) -> str:
    if page["slug"] == "acf-json-generator":
        return """{
  "key": "group_content_fields",
  "title": "Content Fields",
  "fields": [
    {
      "key": "field_hero_title",
      "label": "Hero title",
      "type": "text"
    }
  ]
}"""
    return f"""acf_add_local_field_group([
  'key' => 'group_{group_key}',
  'title' => '{esc(page["h1"])}',
  'fields' => [
    // fields from generator
  ],
]);"""


def slug_url(slug: str) -> str:
    return f"{SITE}/{slug}.html"


def asset_head(page: dict[str, object]) -> str:
    title = esc(f"{page['title']} | Цифра")
    description = esc(str(page["description"]))
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
    return f"""<footer class="acf-footer">
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
        </div>
    </div>
</footer>"""


def faq_schema(page: dict[str, object]) -> str:
    questions = [
        {
            "q": f"Для чего нужен {page['h1']}?",
            "a": str(page["intent"]),
        },
        {
            "q": "Что можно получить на выходе?",
            "a": ", ".join(page["deliverables"]),
        },
        {
            "q": "Можно ли использовать результат в WordPress?",
            "a": "Да. Структуру можно скопировать из генератора и перенести в тему, плагин или ACF local-json.",
        },
    ]
    payload = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": item["q"],
                "acceptedAnswer": {"@type": "Answer", "text": item["a"]},
            }
            for item in questions
        ],
    }
    return json.dumps(payload, ensure_ascii=False, indent=4)


def breadcrumb_schema(page: dict[str, object] | None) -> str:
    items = [
        {"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{SITE}/"},
        {"@type": "ListItem", "position": 2, "name": "ACF", "item": f"{SITE}/acf.html"},
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


def related_links(current_slug: str) -> str:
    links = [p for p in PAGES if p["slug"] != current_slug][:5]
    return "\n".join(
        f'<a class="acf-related-card" href="{esc(p["slug"])}.html"><span>{esc(p["query"])}</span><strong>{esc(p["h1"])}</strong></a>'
        for p in links
    )


def generator_url(page: dict[str, object]) -> str:
    preset = esc(str(page["preset"]))
    slug = esc(str(page["slug"]))
    return f"acf-generator.html?preset={preset}&amp;source={slug}"


def structure_copy(page: dict[str, object]) -> tuple[str, str]:
    fallback = (
        f"{page['h1']}: структура полей и маршрут в генератор",
        "Посадочная показывает состав полей, объясняет сценарий и переводит пользователя в генератор с подходящей предустановкой.",
    )
    return STRUCTURE_COPY.get(str(page["slug"]), fallback)


def hub_chooser() -> str:
    choices = [
        ("Нужен код в тему", "PHP/JSON экспорт для Git, code review и локальной регистрации ACF.", "acf-php-generator.html", "PHP и JSON"),
        ("Нужен повторяемый блок", "FAQ, отзывы, команда, преимущества и любые карточки через repeater.", "acf-repeater-generator.html", "Repeater"),
        ("Нужна страница из секций", "Page builder на Flexible Content без тяжелого конструктора.", "acf-page-builder.html", "Flexible"),
        ("Нужны готовые блоки", "Hero, SEO, FAQ, WooCommerce и другие типовые структуры.", "acf-hero-section.html", "Готовые блоки"),
    ]
    return "\n".join(
        f"""<a class="acf-choice-card" href="{href}">
            <span>{esc(tag)}</span>
            <strong>{esc(title)}</strong>
            <p>{esc(text)}</p>
        </a>"""
        for title, text, href, tag in choices
    )


def preset_map() -> str:
    rows = []
    for page in PAGES:
        query, result = PRESET_MAP_RESULTS[str(page["slug"])]
        rows.append(
            f"""<div class="acf-preset-row">
                    <span class="acf-preset-query">{esc(query)}</span>
                    <a class="acf-preset-name" href="{esc(page["slug"])}.html">{esc(page["h1"])}</a>
                    <span class="acf-preset-result">{esc(result)}</span>
                    <a class="acf-preset-link" href="{generator_url(page)}">{esc(HUB_CARD_CTA[str(page["slug"])])}</a>
                </div>"""
        )
    return "\n                ".join(rows)


def preset_strip(page: dict[str, object]) -> str:
    items = "\n".join(f"<li>{esc(item)}</li>" for item in page_deliverables(page))
    return f"""<section class="acf-conversion-strip" aria-label="Быстрый переход в генератор">
        <div class="acf-conversion-copy">
            <span class="acf-section-label">Быстрый старт</span>
            <h2>Откройте генератор уже с нужной структурой</h2>
            <p>{esc(preset_copy(page))}</p>
        </div>
        <ul>{items}</ul>
        <a class="acf-btn acf-btn--primary" href="{generator_url(page)}">Открыть preset</a>
    </section>"""


def render_page(page: dict[str, object]) -> str:
    deliverables = "\n".join(f"<li>{esc(item)}</li>" for item in checklist_deliverables(page))
    steps = "\n".join(
        f'                    <li><span>{index}</span><p>{esc(text)}</p></li>'
        for index, text in enumerate(steps_copy(page), 1)
    )
    related = related_links(str(page["slug"]))
    structure_heading, structure_text = structure_copy(page)
    group_key_example = esc(str(page["slug"]).replace("-", "_"))
    sample = code_sample(page, group_key_example)
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
    {asset_head(page)}
    <script type="application/ld+json">
    {breadcrumb_schema(page)}
    </script>
    <script type="application/ld+json">
    {faq_schema(page)}
    </script>
</head>
<body>
{header("acf")}
<main>
    <section class="acf-hero acf-page-hero">
        <div class="acf-container acf-hero__grid">
            <div class="acf-hero__copy">
                <nav class="acf-breadcrumbs" aria-label="Хлебные крошки"><a href="index.html">Главная</a><span>/</span><a href="acf.html">ACF</a><span>/</span>{esc(page["h1"])}</nav>
                <span class="acf-kicker">{esc(page["query"])}</span>
                <h1>{esc(page["h1"])}</h1>
                <p>{esc(page["description"])}</p>
                <div class="acf-actions">
                    <a class="acf-btn acf-btn--primary" href="{generator_url(page)}">Собрать поля</a>
                    <a class="acf-btn acf-btn--ghost" href="#structure">Посмотреть структуру</a>
                </div>
            </div>
            <aside class="acf-intent-card" aria-label="Сценарий использования">
                <span>Сценарий</span>
                <h2>{esc(page["intent"])}</h2>
                <p>{esc(page["audience"])}</p>
            </aside>
        </div>
    </section>

    <section class="acf-section acf-section--tight">
        <div class="acf-container">
            {preset_strip(page)}
        </div>
    </section>

    <section class="acf-section" id="structure">
        <div class="acf-container acf-two-col">
            <div>
                <span class="acf-section-label">Что входит</span>
                <h2>{esc(structure_heading)}</h2>
                <p>{esc(structure_text)}</p>
            </div>
            <div class="acf-checklist">
                <ul>
                    {deliverables}
                </ul>
            </div>
        </div>
    </section>

    <section class="acf-section acf-section--muted">
        <div class="acf-container acf-use-grid">
            <article>
                <h2>Как использовать</h2>
                <ol class="acf-steps">
{steps}
                </ol>
            </article>
            <article class="acf-code-card" aria-label="Пример структуры">
                <pre><code>{sample}</code></pre>
            </article>
        </div>
    </section>

    <section class="acf-section">
        <div class="acf-container">
            <div class="acf-section-head">
                <span class="acf-section-label">Конверсия</span>
                <h2>Почему такая посадочная должна работать</h2>
            </div>
            <div class="acf-benefit-grid">
                <article><h3>Точный интент</h3><p>H1, title и первый экран совпадают с запросом, поэтому пользователь быстро понимает, что попал туда.</p></article>
                <article><h3>Быстрый первый шаг</h3><p>Основная кнопка открывает генератор уже с нужным шаблоном полей.</p></article>
                <article><h3>Внутренняя перелинковка</h3><p>Страница ведет на соседние ACF-сценарии и усиливает категорию целиком.</p></article>
            </div>
        </div>
    </section>

    <section class="acf-section acf-section--muted">
        <div class="acf-container acf-faq">
            <h2>Вопросы по {esc(page["h1"])}</h2>
            <details open><summary>Для чего нужен этот генератор?</summary><p>{esc(page["intent"])}</p></details>
            <details><summary>Что получится на выходе?</summary><p>{esc(faq_output_copy(page))}</p></details>
            <details><summary>Можно ли доработать поля после генерации?</summary><p>Да, генератор дает стартовую структуру. Поля можно переименовать, удалить, вложить или дополнить перед экспортом.</p></details>
        </div>
    </section>

    <section class="acf-section">
        <div class="acf-container">
            <div class="acf-section-head">
                <span class="acf-section-label">Дальше</span>
                <h2>Связанные ACF-страницы</h2>
            </div>
            <div class="acf-related-grid">
                {related}
            </div>
        </div>
    </section>

    <section class="acf-final-cta">
        <div class="acf-container">
            <h2>Соберите структуру прямо сейчас</h2>
            <p>{esc(final_cta_copy(page))}</p>
            <a class="acf-btn acf-btn--primary" href="{generator_url(page)}">Открыть предустановку</a>
        </div>
    </section>
</main>
{footer()}
<script src="js/main.js" defer></script>
</body>
</html>
"""


def render_hub() -> str:
    page = {
        "slug": "acf",
        "title": "ACF генераторы и шаблоны полей для WordPress",
        "h1": "ACF генераторы и шаблоны полей",
        "description": "Выберите ACF-шаблон для WordPress: PHP, JSON, repeater, flexible content, SEO-поля, FAQ, hero, команда, отзывы и WooCommerce.",
    }
    cards = "\n".join(
        f"""<article class="acf-topic-card">
            <span>{esc(p["query"])}</span>
            <h3><a href="{esc(p["slug"])}.html">{esc(p["h1"])}</a></h3>
            <p>{esc(p["description"])}</p>
            <a class="acf-card-cta" href="{esc(p["slug"])}.html">{esc(HUB_CARD_CTA[str(p["slug"])])}</a>
        </article>"""
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
    <script type="application/ld+json">
    {breadcrumb_schema(None)}
    </script>
    <script type="application/ld+json">
    {json.dumps(item_list, ensure_ascii=False, indent=4)}
    </script>
</head>
<body>
{header("acf")}
<main>
    <section class="acf-hero">
        <div class="acf-container acf-hero__grid">
            <div class="acf-hero__copy">
                <span class="acf-kicker">Advanced Custom Fields</span>
                <h1>ACF генераторы и шаблоны полей</h1>
                <p>Соберите структуру полей для WordPress без ручной сборки массивов. Выберите задачу, откройте готовый шаблон и заберите PHP или JSON для темы, плагина или клиентского проекта.</p>
                <div class="acf-actions">
                    <a class="acf-btn acf-btn--primary" href="acf-generator.html">Открыть генератор</a>
                    <a class="acf-btn acf-btn--ghost" href="#pages">Выбрать шаблон</a>
                </div>
            </div>
            <aside class="acf-plan-card">
                <h2>Что можно собрать</h2>
                <ul>
                    <li>PHP-код для регистрации полей через acf_add_local_field_group.</li>
                    <li>JSON для переноса ACF-настроек между WordPress-проектами.</li>
                    <li>Repeater и flexible content для списков, блоков и страниц.</li>
                    <li>Готовые группы для SEO, FAQ, hero, команды, отзывов и WooCommerce.</li>
                </ul>
            </aside>
        </div>
    </section>

    <section class="acf-section" id="pages">
        <div class="acf-container">
            <div class="acf-section-head">
                <span class="acf-section-label">Для WordPress-разработчиков</span>
                <h2>Выберите ACF-инструмент под задачу</h2>
                <p>Каждый раздел объясняет, какие поля нужны, где они используются в шаблоне и какой экспорт лучше взять для проекта.</p>
            </div>
            <div class="acf-topic-grid">
                {cards}
            </div>
        </div>
    </section>

    <section class="acf-section acf-section--muted">
        <div class="acf-container">
            <div class="acf-section-head">
                <span class="acf-section-label">Подбор</span>
                <h2>Какой генератор выбрать</h2>
                <p>Начните с формата результата: регистрация в коде, перенос через JSON, повторяемый блок, гибкая страница или готовая группа полей под конкретный раздел сайта.</p>
            </div>
            <div class="acf-choice-grid">
                {hub_chooser()}
            </div>
        </div>
    </section>

    <section class="acf-section">
        <div class="acf-container">
            <div class="acf-section-head">
                <span class="acf-section-label">Быстрый старт</span>
                <h2>Откройте нужный шаблон без пустого экрана</h2>
                <p>В таблице собраны самые частые ACF-задачи: выберите строку, проверьте состав полей и сразу переходите к генерации кода.</p>
            </div>
            <div class="acf-preset-map" aria-label="Карта ACF-пресетов">
                {preset_map()}
            </div>
        </div>
    </section>

    <section class="acf-section acf-section--muted">
        <div class="acf-container acf-roadmap">
            <div>
                <span class="acf-section-label">Процесс</span>
                <h2>Как работать с ACF генератором</h2>
                <p>Страница помогает быстро перейти от идеи блока к готовой структуре полей, которую можно вставить в WordPress-проект.</p>
            </div>
            <ol>
                <li><strong>Выберите тип блока.</strong> Например, SEO-поля, FAQ, hero, команда, отзывы, карточка товара или flexible page builder.</li>
                <li><strong>Проверьте названия полей.</strong> Сразу задайте понятные field names, labels и структуру вложенных элементов.</li>
                <li><strong>Оцените вывод.</strong> Посмотрите, как данные будут выглядеть в блоке, и уберите лишние поля до экспорта.</li>
                <li><strong>Заберите код.</strong> Скопируйте PHP для темы или JSON для синхронизации ACF через репозиторий.</li>
                <li><strong>Вставьте в проект.</strong> Добавьте код в functions.php, mu-plugin или подключите JSON через папку acf-json.</li>
            </ol>
        </div>
    </section>

    <section class="acf-final-cta">
        <div class="acf-container">
            <h2>Соберите ACF-поля для WordPress за несколько минут</h2>
            <p>Откройте генератор, выберите шаблон и получите структуру, которую можно доработать под свой сайт.</p>
            <a class="acf-btn acf-btn--primary" href="acf-generator.html">Запустить ACF генератор</a>
        </div>
    </section>
</main>
{footer()}
<script src="js/main.js" defer></script>
</body>
</html>
"""


def render_css() -> str:
    return """html, body { background: #0b0f14; }
.acf-container { width: min(1160px, calc(100% - 32px)); margin: 0 auto; }
.acf-header { position: sticky; top: 0; z-index: 40; background: rgba(11, 15, 20, 0.86); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(255,255,255,0.08); }
.acf-header__inner { min-height: 72px; display: flex; align-items: center; gap: 24px; }
.acf-logo { color: #fff; font-weight: 900; text-decoration: none; letter-spacing: 0; display: inline-flex; align-items: center; gap: 9px; }
.acf-logo span { color: #22d3a6; }
.acf-nav { display: flex; gap: 8px; align-items: center; margin-left: auto; }
.acf-nav a, .acf-header-cta { color: rgba(255,255,255,0.72); text-decoration: none; font-size: 0.9rem; font-weight: 700; padding: 9px 11px; border-radius: 8px; }
.acf-nav a:hover, .acf-nav a.is-active { color: #fff; background: rgba(255,255,255,0.08); }
.acf-header-cta { background: #22d3a6; color: #07110e; padding: 11px 15px; }
.acf-hero { color: #fff; padding: 72px 0 58px; position: relative; overflow: hidden; background: radial-gradient(circle at 20% 10%, rgba(34,211,166,0.24), transparent 28%), radial-gradient(circle at 84% 18%, rgba(246,200,95,0.16), transparent 26%), #0b0f14; }
.acf-page-hero { padding-top: 54px; }
.acf-hero__grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.55fr); gap: 34px; align-items: center; }
.acf-hero__copy { min-width: 0; }
.acf-kicker, .acf-section-label { color: #22d3a6; font-weight: 900; letter-spacing: 0; text-transform: uppercase; font-size: 0.76rem; }
.acf-hero h1 { font-size: clamp(2.35rem, 5vw, 5rem); line-height: 0.98; letter-spacing: 0; margin: 14px 0 20px; max-width: 840px; }
.acf-hero p { color: rgba(255,255,255,0.72); font-size: 1.12rem; line-height: 1.7; max-width: 760px; margin: 0; }
.acf-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.acf-btn { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; padding: 0 18px; border-radius: 8px; font-weight: 900; text-decoration: none; border: 1px solid transparent; }
.acf-btn--primary { background: #22d3a6; color: #07110e; box-shadow: 0 16px 42px rgba(34,211,166,0.22); }
.acf-btn--ghost { color: #fff; border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.05); }
.acf-plan-card, .acf-intent-card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 24px; box-shadow: 0 24px 80px rgba(0,0,0,0.22); }
.acf-plan-card h2, .acf-intent-card h2 { color: #fff; font-size: 1.18rem; line-height: 1.35; margin: 0 0 14px; }
.acf-plan-card ul, .acf-roadmap ol { margin: 0; padding-left: 20px; color: rgba(255,255,255,0.72); line-height: 1.75; }
.acf-intent-card span { display: inline-block; color: #f6c85f; font-weight: 900; font-size: 0.76rem; text-transform: uppercase; margin-bottom: 12px; }
.acf-intent-card p { font-size: 0.95rem; }
.acf-section { padding: 70px 0; background: #ffffff; color: #121821; }
.acf-section--muted { background: #f4f8f7; }
.acf-section-head { max-width: 790px; margin-bottom: 28px; }
.acf-section h2 { font-size: clamp(1.8rem, 3vw, 3rem); line-height: 1.08; letter-spacing: 0; margin: 10px 0 14px; }
.acf-section p { color: #4b5563; line-height: 1.75; font-size: 1rem; }
.acf-topic-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.acf-topic-card, .acf-benefit-grid article, .acf-related-card, .acf-code-card, .acf-checklist { border: 1px solid #dce7e3; border-radius: 8px; background: #fff; padding: 22px; }
.acf-topic-card { display: flex; min-height: 250px; flex-direction: column; box-shadow: 0 18px 45px rgba(15, 23, 42, 0.04); transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s; }
.acf-topic-card:hover { transform: translateY(-2px); border-color: #22d3a6; box-shadow: 0 24px 58px rgba(15, 23, 42, 0.08); }
.acf-topic-card span, .acf-related-card span { align-self: flex-start; color: #0b8f73; background: #e8fbf6; border-radius: 999px; padding: 5px 9px; font-weight: 900; font-size: 0.72rem; line-height: 1; display: inline-flex; margin-bottom: 14px; text-transform: uppercase; }
.acf-topic-card h3 { font-size: 1.13rem; line-height: 1.28; margin: 0 0 12px; }
.acf-topic-card h3 a { color: #121821; text-decoration: none; }
.acf-topic-card h3 a:hover { color: #0f9f7e; }
.acf-topic-card p { margin: 0; }
.acf-related-card { color: #121821; text-decoration: none; }
.acf-card-cta { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; margin-top: auto; padding: 0 16px; border-radius: 8px; background: #121821; color: #fff; font-weight: 900; text-decoration: none; width: fit-content; box-shadow: 0 12px 28px rgba(18, 24, 33, 0.12); }
.acf-card-cta:hover { background: #22d3a6; color: #07110e; }
.acf-two-col, .acf-use-grid, .acf-roadmap { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(300px, 0.7fr); gap: 34px; align-items: start; }
.acf-checklist ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 12px; }
.acf-checklist li { padding-left: 30px; position: relative; color: #243142; font-weight: 800; }
.acf-checklist li::before { content: ""; width: 18px; height: 18px; border-radius: 50%; background: #22d3a6; position: absolute; left: 0; top: 2px; box-shadow: inset 0 0 0 5px #dffaf4; }
.acf-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.acf-steps li { display: grid; grid-template-columns: 38px 1fr; gap: 14px; align-items: start; }
.acf-steps span { width: 38px; height: 38px; border-radius: 50%; background: #121821; color: #22d3a6; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; }
.acf-steps p { margin: 5px 0 0; }
.acf-code-card { background: #0f151d; color: #dffaf4; overflow: auto; }
.acf-code-card pre { margin: 0; font-family: "JetBrains Mono", monospace; font-size: 0.88rem; line-height: 1.7; }
.acf-benefit-grid, .acf-related-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.acf-benefit-grid h3 { margin: 0 0 10px; font-size: 1.08rem; }
.acf-faq { max-width: 860px; }
.acf-faq details { background: #fff; border: 1px solid #dce7e3; border-radius: 8px; margin-top: 10px; padding: 16px 18px; }
.acf-faq summary { cursor: pointer; font-weight: 900; }
.acf-faq p { margin: 10px 0 0; }
.acf-related-card { display: block; min-height: 120px; }
.acf-related-card strong { display: block; font-size: 1.05rem; line-height: 1.35; }
.acf-section--tight { padding: 34px 0; }
.acf-conversion-strip { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(240px, 0.75fr) auto; gap: 20px; align-items: center; border: 1px solid #cfe0dc; border-radius: 8px; background: linear-gradient(135deg, #ffffff, #effaf7); padding: 22px; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.07); }
.acf-conversion-copy h2 { margin: 8px 0 8px; font-size: clamp(1.35rem, 2.4vw, 2rem); line-height: 1.1; }
.acf-conversion-copy p { margin: 0; }
.acf-conversion-strip ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; color: #273444; font-weight: 800; }
.acf-conversion-strip li { position: relative; padding-left: 24px; }
.acf-conversion-strip li::before { content: ""; width: 12px; height: 12px; border-radius: 50%; background: #22d3a6; position: absolute; left: 0; top: 8px; }
.acf-choice-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.acf-choice-card { display: grid; align-content: start; min-height: 190px; gap: 10px; padding: 20px; border: 1px solid #dce7e3; border-radius: 8px; background: #fff; color: #121821; text-decoration: none; transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s; }
.acf-choice-card:hover { transform: translateY(-2px); border-color: #22d3a6; box-shadow: 0 18px 44px rgba(15, 23, 42, 0.09); }
.acf-choice-card span { color: #0f9f7e; font-size: 0.76rem; font-weight: 900; text-transform: uppercase; }
.acf-choice-card strong { font-size: 1.12rem; line-height: 1.25; }
.acf-choice-card p { margin: 0; font-size: 0.94rem; }
.acf-preset-map { display: grid; gap: 12px; }
.acf-preset-row { display: grid; grid-template-columns: minmax(160px, 0.72fr) minmax(190px, 1fr) minmax(180px, 0.82fr) auto; gap: 12px; align-items: center; padding: 14px 16px; border: 1px solid #dce7e3; border-radius: 8px; background: #fff; }
.acf-preset-row:hover { border-color: #22d3a6; box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07); }
.acf-preset-query { color: #0f9f7e; font-weight: 900; font-size: 0.78rem; text-transform: uppercase; }
.acf-preset-name { color: #121821; font-weight: 900; line-height: 1.35; text-decoration: none; }
.acf-preset-result { color: #4b5563; font-size: 0.94rem; line-height: 1.45; }
.acf-preset-link { color: #07110e; background: #22d3a6; border-radius: 8px; padding: 10px 12px; text-decoration: none; font-size: 0.86rem; font-weight: 900; white-space: nowrap; text-align: center; }
.acf-roadmap ol { color: #273444; background: #fff; border: 1px solid #dce7e3; border-radius: 8px; padding: 22px 22px 22px 42px; }
.acf-roadmap li { margin-bottom: 10px; }
.acf-final-cta { color: #fff; background: #101820; padding: 58px 0; text-align: center; }
.acf-final-cta h2 { font-size: clamp(1.8rem, 3vw, 3rem); max-width: 820px; margin: 0 auto 12px; }
.acf-final-cta p { color: rgba(255,255,255,0.72); max-width: 640px; margin: 0 auto 24px; }
.acf-footer { background: #07100e; color: rgba(255,255,255,0.68); padding: 28px 0; border-top: 1px solid rgba(255,255,255,0.08); }
.acf-footer__inner { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.acf-footer strong { color: #fff; }
.acf-footer p { margin: 6px 0 0; }
.acf-footer a { color: #22d3a6; font-weight: 900; text-decoration: none; }
.acf-footer-links { display: flex; flex-wrap: wrap; gap: 14px; justify-content: flex-end; }
.acf-breadcrumbs { display: flex; gap: 8px; flex-wrap: wrap; color: rgba(255,255,255,0.48); font-size: 0.88rem; margin-bottom: 18px; }
.acf-breadcrumbs a { color: rgba(255,255,255,0.7); text-decoration: none; }
@media (max-width: 900px) {
    .acf-header__inner { min-height: auto; padding: 14px 0; flex-wrap: wrap; }
    .acf-nav { order: 3; width: 100%; overflow-x: auto; margin-left: 0; padding-bottom: 4px; }
    .acf-header-cta { margin-left: auto; }
    .acf-hero__grid, .acf-two-col, .acf-use-grid, .acf-roadmap { grid-template-columns: 1fr; }
    .acf-topic-grid, .acf-benefit-grid, .acf-related-grid, .acf-choice-grid, .acf-conversion-strip, .acf-preset-row { grid-template-columns: 1fr; }
    .acf-hero { padding: 46px 0; }
    .acf-section { padding: 46px 0; }
}
@media (max-width: 520px) {
    .acf-container { width: min(100% - 24px, 1160px); }
    .acf-header-cta { display: none; }
    .acf-hero h1 { font-size: 2.35rem; }
    .acf-actions .acf-btn { width: 100%; }
    .acf-plan-card, .acf-intent-card, .acf-topic-card, .acf-benefit-grid article, .acf-code-card, .acf-checklist { padding: 16px; }
    .acf-footer__inner { align-items: flex-start; flex-direction: column; }
    .acf-footer-links { justify-content: flex-start; }
}
"""


def write_pages() -> None:
    (ROOT / "css" / "acf-content.css").write_text(render_css(), encoding="utf-8")
    (ROOT / "acf.html").write_text(render_hub(), encoding="utf-8")
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
    urls = ["acf.html", "acf-generator.html"] + [f"{p['slug']}.html" for p in PAGES]
    for path in urls:
        loc = f"{SITE}/{path}"
        priority = "0.85" if path == "acf.html" else "0.75"
        entries[loc] = (SITEMAP_LASTMOD, "weekly", priority)

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


def main() -> None:
    write_pages()
    update_sitemap()


if __name__ == "__main__":
    main()
