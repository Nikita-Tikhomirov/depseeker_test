# Добавление категорий и утилит

`catalog.registry.json` фиксирует публичную структуру каталога. Новая категория или утилита считается готовой только после того, как она появилась в registry, имеет HTML-страницу, попала в sitemap и прошла проверки.

## Новая категория

1. Добавить объект в `catalog.registry.json`:
   - `slug` латиницей;
   - `title`;
   - `path`;
   - `description`;
   - `primaryUtility`;
   - `items`.
2. Создать страницу категории, например `seo.html`.
3. Добавить минимум две страницы внутри `items`.
4. Обновить навигацию и футер, если категория должна быть видна из общего меню.
5. Запустить:

```powershell
python tools/build_site_metadata.py
python tools/check_catalog_registry.py
python tools/check_production_ready.py
node tests/site-links-smoke.mjs
```

## Новая утилита

1. Добавить HTML-страницу утилиты.
2. Добавить запись в `items` нужной категории:
   - `type=utility` для интерактивного инструмента;
   - `type=landing` для SEO-посадочной;
   - `nav=true`, если утилита должна быть в выпадающем меню.
3. Проверить, что страница имеет один H1, canonical, meta description и внутренние ссылки.
4. Пересобрать sitemap и пройти гейты.

## Перед продакшном

Когда появится домен:

1. Заполнить `origin` в `site.config.json`.
2. Переключить `mode` на `production`.
3. Запустить `python tools/set_site_domain.py https://domain.ru`.
4. Запустить `python tools/build_site_metadata.py`.
5. Запустить все smoke-проверки.
