# MIGX SEO + Product Design

## Цель

Сделать из существующего `migx-generator.html` полноценную SEO-категорию для привлечения трафика по MODX/MIGX-запросам и усилить сам генератор так, чтобы посетитель быстро получал рабочую MIGX-конфигурацию, а не только текстовую подсказку.

## Контекст проекта

Проект уже содержит похожую SEO-модель для ACF:

- `acf.html` работает как категория.
- ACF-посадочные страницы закрывают отдельные запросы.
- Страницы ведут в `acf-generator.html` через `preset` и `source`.
- `sitemap.xml` включает ACF-кластер.

MIGX-генератор уже есть в `migx-generator.html` и `js/migx-generator.js`. Он умеет создавать поля, табы, вложенные MIGX и экспортировать JSON. Для продвижения его нужно связать с отдельными страницами под поисковые интенты и добавить продуктовые функции, которые закрывают типовые боли MODX-разработчиков.

## Выбранный подход

Выбран максимальный гибридный подход: SEO-кластер + продуктовые доработки.

Причины:

- В выдаче по MIGX заметны документация MODX, пакет MIGX и форумные обсуждения, но почти нет сильных онлайн-генераторов.
- Пользовательские боли повторяются вокруг `Form Tabs`, `Grid Columns`, nested MIGX, `configs`, `getImageList`, ошибок JSON и вывода через chunk/Fenom.
- Категория с посадочными страницами даст охват запросов, а URL-пресеты и валидатор в генераторе повысят конверсию.

## Информационная архитектура

### Центральная категория

Создать `migx.html`.

Назначение:

- Главная страница кластера “MIGX генератор и шаблоны для MODX”.
- Объясняет, какие задачи закрывает генератор.
- Показывает карту страниц и пресетов.
- Ведет в `migx-generator.html`.
- Усиливает внутреннюю перелинковку всего MIGX-кластера.

Основные блоки:

- Hero с CTA “Открыть MIGX генератор”.
- Карта интентов: базовые настройки, готовые структуры, ошибки и проверка, вывод на фронтенде.
- Сетка посадочных страниц.
- Карта пресетов: запрос -> страница -> `migx-generator.html?preset=...&source=...`.
- FAQ.
- Финальный CTA.

### Посадочные страницы

Создать 20+ страниц под низкочастотные и среднечастотные интенты:

- `migx-json-generator.html`
- `migx-tv-generator.html`
- `migx-formtabs-generator.html`
- `migx-grid-columns-generator.html`
- `migx-nested-generator.html`
- `migx-tabs-generator.html`
- `migx-gallery.html`
- `migx-slider.html`
- `migx-faq.html`
- `migx-catalog.html`
- `migx-team.html`
- `migx-reviews.html`
- `migx-getimagelist.html`
- `migx-fenom-chunk.html`
- `migx-configs.html`
- `migx-image-field.html`
- `migx-richtext-field.html`
- `migx-validator.html`
- `migx-import-json.html`
- `migx-errors.html`
- `migx-examples.html`

Каждая страница должна:

- иметь уникальные `title`, `description`, H1 и canonical;
- закрывать один конкретный сценарий;
- содержать короткий пример структуры JSON; страницы про фронтенд-вывод дополнительно содержат пример chunk/Fenom;
- вести в генератор с нужным `preset` и `source`;
- иметь FAQPage schema, если есть FAQ;
- иметь BreadcrumbList schema;
- перелинковываться с 4-6 связанными MIGX-страницами.

## Продуктовые доработки генератора

### URL-пресеты

`migx-generator.html` должен читать параметры:

- `preset`: имя предустановки;
- `source`: страница-источник.

При открытии с `preset` генератор загружает подходящий шаблон, например:

- `gallery`
- `slider`
- `faq`
- `catalog`
- `team`
- `reviews`
- `tabs`
- `nested`
- `formtabs`
- `grid_columns`
- `getimagelist`
- `fenom_chunk`
- `validator`

### Валидатор

Добавить панель проверки, которая показывает предупреждения:

- пустой `fieldname`;
- дублирующийся `fieldname`;
- кириллица или пробелы в `fieldname`;
- поле без `caption`;
- MIGX без вложенных полей;
- listbox без опций;
- неизвестный `inputTVtype`;
- невалидный импортированный JSON.

Валидатор не должен блокировать экспорт. Он должен объяснять, что исправить.

### Режимы экспорта

Добавить или расширить режимы вывода:

- `Form Tabs`;
- `Grid Columns`;
- текущий JSON;
- flat JSON;
- пример вызова `getImageList`;
- пример Fenom/chunk для вывода.

### Сценарные пресеты

Пресеты должны быть не декоративными, а рабочими:

- Галерея: image, title, description, alt.
- Слайдер: image, title, subtitle, button text, button link.
- FAQ: question, answer, category.
- Каталог: title, image, price, description, properties.
- Team: photo, name, role, bio, contacts.
- Reviews: author, company, text, rating, photo.
- Tabs: tab title, content, media.
- Nested MIGX: section -> items.

## SEO-стратегия

### Кластеры

1. Базовый кластер:
   - MIGX generator
   - MODX MIGX
   - MIGX TV
   - MIGX JSON
   - MIGX config

2. Структурный кластер:
   - MIGX Form Tabs
   - MIGX Grid Columns
   - MIGX tabs
   - nested MIGX
   - MIGX configs

3. Готовые структуры:
   - MIGX gallery
   - MIGX slider
   - MIGX FAQ
   - MIGX catalog
   - MIGX team
   - MIGX reviews

4. Ошибки и проверка:
   - MIGX validator
   - MIGX JSON error
   - error in formtabs config
   - duplicate fieldname
   - MIGX import JSON

5. Вывод на фронтенде:
   - MIGX getImageList
   - MIGX Fenom
   - MIGX chunk
   - MODX MIGX output

### Перелинковка

Поток пользователя:

1. Поисковая страница.
2. Точная посадочная.
3. Генератор с предустановкой.
4. Экспорт.
5. Связанные страницы для следующего сценария.

Все страницы должны ссылаться:

- на `migx.html`;
- на `migx-generator.html`;
- на 4-6 близких страниц;
- на страницу валидатора или ошибок, если сценарий связан с JSON/configs.

### Sitemap

Добавить `migx.html`, `migx-generator.html` и все MIGX-посадочные в `sitemap.xml` с `changefreq=weekly` и `priority=0.75-0.85`.

## UX и визуальный подход

Повторить уже работающий паттерн ACF-страниц, чтобы не создавать второй дизайн-системы:

- использовать общие стили `css/base.css`, `css/components.css`, `css/layout.css`, `css/responsive.css`, `css/themes.css`;
- для контентных страниц можно переиспользовать подход `css/acf-content.css` или создать нейтральный `css/migx-content.css`, если MIGX-блокам нужны отдельные классы;
- первый экран должен сразу показывать, что это инструмент для MODX/MIGX;
- CTA должны вести в генератор с конкретным пресетом.

## Источники и рыночный ориентир

Для ориентира использованы:

- официальная документация MODX по MIGX backend usage;
- страница пакета MIGX на extras.modx.com;
- обсуждения MODX Community и старого форума о nested MIGX, `configs` и ошибках formtabs;
- существующая ACF-структура проекта.

Вывод: ниша онлайн-генератора MIGX выглядит свободной. Главная возможность — закрывать практический путь “запрос -> рабочий пресет -> проверка -> экспорт”, а не только публиковать справочные статьи.

## Ограничения

- Не трогать несвязанные пользовательские изменения в рабочем дереве.
- Не коммитить служебные файлы `.superpowers/brainstorm`.
- Не добавлять внешние зависимости без необходимости.
- Сохранять ASCII в кодовых идентификаторах и файлах. Русский текст допустим в HTML-контенте, документации и пользовательских сообщениях.

## Критерии готовности

Реализация считается готовой, когда:

- создана категория `migx.html`;
- создано не менее 20 MIGX-посадочных страниц;
- `migx-generator.html` поддерживает URL-пресеты;
- генератор показывает валидатор и предупреждения;
- добавлены режимы экспорта под Form Tabs, Grid Columns, getImageList/Fenom;
- все новые страницы добавлены в `sitemap.xml`;
- проверены ссылки, базовый рендер и отсутствие явных ошибок в браузере;
- изменения закоммичены и запушены.
