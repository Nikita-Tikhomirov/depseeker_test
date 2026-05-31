'use strict';

// ==================== FIELD TYPES ====================
var MIGX_TYPES = {
    text:       { label: 'Text',      icon: 'Aa' },
    textarea:   { label: 'Textarea',  icon: '📝' },
    richtext:   { label: 'Richtext',  icon: '✏️' },
    number:     { label: 'Number',    icon: '🔢' },
    email:      { label: 'Email',     icon: '📧' },
    url:        { label: 'URL',       icon: '🔗' },
    hidden:     { label: 'Hidden',    icon: '👁️‍🗨️' },
    image:      { label: 'Image',     icon: '🖼️' },
    file:       { label: 'File',      icon: '📄' },
    video:      { label: 'Video',     icon: '🎬' },
    listbox:    { label: 'Listbox',   icon: '📋' },
    checkbox:   { label: 'Checkbox',  icon: '☑️' },
    date:       { label: 'Date',      icon: '📅' },
    color:      { label: 'Color',     icon: '🎨' },
    tag:        { label: 'Tag',       icon: '🏷️' },
    tab:        { label: 'Tab',       icon: '📑' },
    migx:       { label: 'MIGX ↻',   icon: '📦' }
};

var TAB_COLORS = ['#f59e0b','#10b981','#6366f1','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899'];

// ==================== STATE ====================
var fields = [];
var fieldIdCounter = 0;
var selectedFieldId = null;
var tabs = [];           // { id: 'tab_xxx', caption: 'Tab Name', color: '#f59e0b' }
var currentCodeTab = 'json';
var lastValidationReport = {
    score: 0,
    summary: 'Добавьте поля, чтобы увидеть готовность конфигурации.',
    warnings: [],
    metrics: { fields: 0, tabs: 0, nested: 0, errors: 0, warnings: 0 }
};

var MIGX_PRESETS = {
    json: { source: 'migx-json-generator', title: 'MIGX JSON генератор', template: 'tabs_demo' },
    tv: { source: 'migx-tv-generator', title: 'MIGX TV генератор', template: 'tabs_demo' },
    formtabs: { source: 'migx-formtabs-generator', title: 'MIGX Form Tabs', template: 'tabs_demo' },
    grid_columns: { source: 'migx-grid-columns-generator', title: 'MIGX Grid Columns', template: 'catalog' },
    nested: { source: 'migx-nested-generator', title: 'Вложенный MIGX', template: 'nested' },
    tabs: { source: 'migx-tabs-generator', title: 'MIGX tabs', template: 'tabs_demo' },
    gallery: { source: 'migx-gallery', title: 'MIGX галерея', template: 'gallery' },
    slider: { source: 'migx-slider', title: 'MIGX слайдер', template: 'slider' },
    faq: { source: 'migx-faq', title: 'MIGX FAQ', template: 'faq' },
    catalog: { source: 'migx-catalog', title: 'MIGX каталог', template: 'catalog' },
    team: { source: 'migx-team', title: 'MIGX команда', template: 'team' },
    reviews: { source: 'migx-reviews', title: 'MIGX отзывы', template: 'reviews' },
    getimagelist: { source: 'migx-getimagelist', title: 'MIGX getImageList', template: 'gallery' },
    fenom_chunk: { source: 'migx-fenom-chunk', title: 'MIGX Fenom chunk', template: 'catalog' },
    configs: { source: 'migx-configs', title: 'MIGX configs', template: 'nested' },
    image_field: { source: 'migx-image-field', title: 'MIGX image field', template: 'gallery' },
    richtext_field: { source: 'migx-richtext-field', title: 'MIGX richtext field', template: 'faq' },
    validator: { source: 'migx-validator', title: 'MIGX validator', template: 'errors' },
    import_json: { source: 'migx-import-json', title: 'MIGX import JSON', template: 'tabs_demo' },
    errors: { source: 'migx-errors', title: 'Ошибки MIGX JSON', template: 'errors' },
    examples: { source: 'migx-examples', title: 'MIGX examples', template: 'nested' }
};

// ==================== HELPERS ====================
function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escAttr(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function plural(n, forms) {
    n = Math.abs(n) % 100;
    var n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
}

function genId() {
    return 'migx_' + (++fieldIdCounter);
}

// ==================== FIELD DEFAULTS ====================
function fieldDefaults(type) {
    var d = {
        id: genId(),
        fieldname: '',
        caption: '',
        inputTVtype: type,
        description: '',
        default_value: '',
        tabid: '',
        isnew: true
    };

    if (type === 'tab') {
        d.istab = true;
        d.caption = 'Новый таб';
        d.fieldname = '';
    }
    if (type === 'migx') {
        d.nestedFields = [];
        d.configs = '';
        d.formtabs = '';
    }
    if (type === 'listbox') {
        d.configs = '';
        d.inputOptionValues = '';
    }

    return d;
}

// ==================== FIELD CRUD ====================
function addField(type) {
    var f = fieldDefaults(type);
    fields.push(f);
    selectedFieldId = f.id;
    renderAll();
    generateJSON();
}

function removeField(id) {
    fields = fields.filter(function(f) { return f.id !== id; });
    if (selectedFieldId === id) selectedFieldId = null;
    renderAll();
    generateJSON();
}

function duplicateField(id) {
    var idx = -1;
    for (var i = 0; i < fields.length; i++) { if (fields[i].id === id) { idx = i; break; } }
    if (idx === -1) return;
    var copy = deepCloneField(fields[idx]);
    copy.id = genId();
    copy.isnew = true;
    // Deep clone nested fields too
    if (copy.nestedFields) {
        copy.nestedFields = copy.nestedFields.map(function(nf) {
            nf.id = genId();
            nf.isnew = true;
            return nf;
        });
    }
    fields.splice(idx + 1, 0, copy);
    selectedFieldId = copy.id;
    renderAll();
    generateJSON();
}

function moveField(id, dir) {
    var idx = -1;
    for (var i = 0; i < fields.length; i++) { if (fields[i].id === id) { idx = i; break; } }
    if (idx === -1) return;
    var newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= fields.length) return;
    var tmp = fields[idx];
    fields[idx] = fields[newIdx];
    fields[newIdx] = tmp;
    renderAll();
    generateJSON();
}

function selectField(id) {
    selectedFieldId = (selectedFieldId === id) ? null : id;
    renderFields();
}

function getFieldById(id) {
    for (var i = 0; i < fields.length; i++) { if (fields[i].id === id) return fields[i]; }
    return null;
}

function updateField(id, key, value) {
    var f = getFieldById(id);
    if (!f) return;
    f[key] = value;
    f.isnew = false;
    // Auto-sync fieldname for caption changes on new fields
    if (key === 'caption' && f.isnew) {
        if (!f.fieldname || f.fieldname.match(/^migx_\d+$/)) {
            f.fieldname = slugify(value);
        }
    }
    generateJSON();
}

function deepCloneField(f) {
    var copy = JSON.parse(JSON.stringify(f));
    return copy;
}

function slugify(text) {
    if (!text) return '';
    // Transliterate Russian chars
    var ru = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
        'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
        'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
        'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
        'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z',
        'И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R',
        'С':'S','Т':'T','У':'U','Ф':'F','Х':'H','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Sch',
        'Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya'
    };
    var slug = '';
    for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        slug += ru[ch] || ch;
    }
    slug = slug.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    return slug || 'field';
}

function getURLParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function encodeSharePayload(payload) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

function decodeSharePayload(value) {
    return JSON.parse(decodeURIComponent(escape(atob(value))));
}

function safeSharedId(value, fallback) {
    var id = String(value || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
    return id || fallback;
}

function safeSharedColor(value) {
    var color = String(value || '');
    return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#10b981';
}

function isAllowedCodeTab(tab) {
    return ['json', 'json_flat', 'formtabs', 'grid_columns', 'getimagelist', 'fenom'].indexOf(tab) !== -1;
}

function sanitizeSharedFields(items, counterRef) {
    if (!Array.isArray(items)) return [];
    return items.map(function(item) {
        counterRef.value += 1;
        var field = {};
        for (var key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) field[key] = item[key];
        }
        field.id = safeSharedId(field.id, 'migx_' + counterRef.value);
        field.inputTVtype = MIGX_TYPES[field.inputTVtype] ? field.inputTVtype : 'text';
        field.type = field.inputTVtype;
        field.tabid = field.tabid ? safeSharedId(field.tabid, '') : '';
        field.nestedFields = sanitizeSharedFields(field.nestedFields, counterRef);
        return field;
    });
}

function sanitizeSharedTabs(items) {
    if (!Array.isArray(items)) return [];
    return items.map(function(item, index) {
        return {
            id: safeSharedId(item && item.id, 'tab_shared_' + (index + 1)),
            caption: String(item && item.caption ? item.caption : 'Таб ' + (index + 1)),
            color: safeSharedColor(item && item.color)
        };
    });
}

function syncFieldIdCounter() {
    var all = collectFields(fields, []);
    var maxId = 0;
    for (var i = 0; i < all.length; i++) {
        var match = String(all[i].id || '').match(/^migx_(\d+)$/);
        if (match) maxId = Math.max(maxId, parseInt(match[1], 10));
    }
    fieldIdCounter = Math.max(fieldIdCounter, maxId);
}

function showLandingContext(presetName, source) {
    var preset = MIGX_PRESETS[presetName];
    var box = document.getElementById('generator-context');
    if (!box || !preset) return;
    var title = document.getElementById('generator-context-title');
    var copy = document.getElementById('generator-context-copy');
    if (title) title.textContent = preset.title;
    if (copy) copy.textContent = source ? 'Источник: ' + source + '. Проверьте поля, ошибки и экспорт.' : 'Проверьте поля, ошибки и экспорт.';
    box.hidden = false;
}

function showSharedContext() {
    var box = document.getElementById('generator-context');
    if (!box) return;
    var title = document.getElementById('generator-context-title');
    var copy = document.getElementById('generator-context-copy');
    if (title) title.textContent = 'Сохраненная MIGX-конфигурация';
    if (copy) copy.textContent = 'Конфигурация восстановлена из ссылки. Можно править поля, проверять score и экспортировать результат.';
    box.hidden = false;
}

function restoreSharedStateFromURL() {
    var hash = window.location.hash || '';
    if (hash.indexOf('#migx=') !== 0) return false;
    try {
        var payload = decodeSharePayload(decodeURIComponent(hash.slice(6)));
        var counterRef = { value: 0 };
        fields = sanitizeSharedFields(payload.fields, counterRef);
        tabs = sanitizeSharedTabs(payload.tabs);
        selectedFieldId = null;
        currentCodeTab = isAllowedCodeTab(payload.currentCodeTab) ? payload.currentCodeTab : 'json';
        syncFieldIdCounter();
        renderAll();
        switchCodeTab(currentCodeTab);
        showSharedContext();
        showToast('Конфигурация загружена из ссылки');
        return true;
    } catch (err) {
        showToast('Не удалось открыть сохраненную MIGX-ссылку', true);
        return false;
    }
}

function applyPresetFromURL() {
    var presetName = getURLParam('preset');
    var source = getURLParam('source');
    if (!presetName || !MIGX_PRESETS[presetName]) return;
    loadTemplate(MIGX_PRESETS[presetName].template);
    showLandingContext(presetName, source);
}

function collectFields(arr, result) {
    result = result || [];
    for (var i = 0; i < arr.length; i++) {
        result.push(arr[i]);
        if (arr[i].nestedFields && arr[i].nestedFields.length) {
            collectFields(arr[i].nestedFields, result);
        }
    }
    return result;
}

function renderValidationSummary(warnings, allFields) {
    var totalFields = allFields.length;
    var errorCount = warnings.filter(function(w) { return w.level === 'error'; }).length;
    var warnCount = warnings.length - errorCount;
    var nestedCount = allFields.filter(function(f) { return f.inputTVtype === 'migx'; }).length;
    var score = totalFields ? Math.max(0, Math.min(100, 100 - errorCount * 22 - warnCount * 8)) : 0;
    var summary = 'Добавьте поля, чтобы увидеть готовность конфигурации.';

    if (totalFields && errorCount) {
        summary = 'Есть критичные ошибки. Исправьте их перед вставкой MIGX JSON в MODX.';
    } else if (totalFields && warnCount) {
        summary = 'Конфигурация почти готова. Осталось поправить предупреждения для более надежного экспорта.';
    } else if (totalFields) {
        summary = 'Конфигурация готова к экспорту: fieldname, типы полей и вложенность выглядят корректно.';
    }

    var scoreEl = document.getElementById('validation-score');
    var summaryEl = document.getElementById('validation-summary');
    var metricsEl = document.getElementById('validation-metrics');

    if (scoreEl) scoreEl.textContent = score + '%';
    if (summaryEl) summaryEl.textContent = summary;
    if (metricsEl) {
        metricsEl.innerHTML = [
            '<div class="validation-metric"><strong>' + totalFields + '</strong> <span>Полей всего</span></div>',
            '<div class="validation-metric"><strong>' + tabs.length + '</strong> <span>Табов формы</span></div>',
            '<div class="validation-metric"><strong>' + nestedCount + '</strong> <span>Вложенных MIGX</span></div>',
            '<div class="validation-metric"><strong>' + errorCount + '/' + warnCount + '</strong> <span>Ошибок / предупреждений</span></div>'
        ].join('');
    }

    lastValidationReport = {
        score: score,
        summary: summary,
        warnings: warnings.slice(),
        metrics: {
            fields: totalFields,
            tabs: tabs.length,
            nested: nestedCount,
            errors: errorCount,
            warnings: warnCount
        }
    };
}

function validateMIGXConfig() {
    var list = document.getElementById('validation-list');
    if (!list) return [];
    var warnings = [];
    var all = collectFields(fields, []);
    var seen = {};

    for (var i = 0; i < all.length; i++) {
        var f = all[i];
        var name = f.fieldname || '';
        if (!name) warnings.push({ level: 'error', text: 'Поле "' + (f.caption || 'без названия') + '" без fieldname.' });
        if (name && /[^a-zA-Z0-9_]/.test(name)) warnings.push({ level: 'error', text: 'Fieldname "' + name + '" содержит пробелы, кириллицу или спецсимволы.' });
        if (name) {
            seen[name] = (seen[name] || 0) + 1;
            if (seen[name] === 2) warnings.push({ level: 'error', text: 'Fieldname "' + name + '" повторяется.' });
        }
        if (!f.caption && f.inputTVtype !== 'tab') warnings.push({ level: 'warn', text: 'Поле "' + (name || 'без fieldname') + '" без caption.' });
        if (f.inputTVtype === 'migx' && (!f.nestedFields || !f.nestedFields.length)) warnings.push({ level: 'warn', text: 'MIGX "' + (name || f.caption || 'без имени') + '" не содержит вложенных полей.' });
        if (f.inputTVtype === 'listbox' && !f.configs && !f.inputOptionValues) warnings.push({ level: 'warn', text: 'Listbox "' + (name || f.caption || 'без имени') + '" без опций.' });
        if (!MIGX_TYPES[f.inputTVtype || '']) warnings.push({ level: 'error', text: 'Неизвестный тип поля "' + (f.inputTVtype || '') + '".' });
    }

    if (!warnings.length) {
        renderValidationSummary(warnings, all);
        list.innerHTML = '<li class="validation-ok">Ошибок не найдено. Конфигурацию можно экспортировать.</li>';
        return warnings;
    }

    renderValidationSummary(warnings, all);
    list.innerHTML = warnings.map(function(w) {
        var cls = w.level === 'error' ? 'validation-error' : '';
        return '<li class="' + cls + '">' + escHtml(w.text) + '</li>';
    }).join('');
    return warnings;
}

// ==================== NESTED MIGX ====================
function addNestedField(parentId, type) {
    var f = getFieldById(parentId);
    if (!f) return;
    if (!f.nestedFields) f.nestedFields = [];
    var nf = fieldDefaults(type);
    nf.id = genId();
    f.nestedFields.push(nf);
    generateJSON();
    renderFields();
}

function removeNestedField(parentId, nestedId) {
    var f = getFieldById(parentId);
    if (!f || !f.nestedFields) return;
    f.nestedFields = f.nestedFields.filter(function(nf) { return nf.id !== nestedId; });
    generateJSON();
    renderFields();
}

function updateNestedField(parentId, nestedId, key, value) {
    var f = getFieldById(parentId);
    if (!f || !f.nestedFields) return;
    for (var i = 0; i < f.nestedFields.length; i++) {
        if (f.nestedFields[i].id === nestedId) {
            f.nestedFields[i][key] = value;
            break;
        }
    }
    generateJSON();
}

// Deep nested MIGX (MIGX inside nested MIGX)
function addDeepNestedField(parentId, nestedId, type) {
    var f = getFieldById(parentId);
    if (!f || !f.nestedFields) return;
    for (var i = 0; i < f.nestedFields.length; i++) {
        var nf = f.nestedFields[i];
        if (nf.id === nestedId && nf.inputTVtype === 'migx') {
            if (!nf.nestedFields) nf.nestedFields = [];
            var dnf = fieldDefaults(type);
            dnf.id = genId();
            nf.nestedFields.push(dnf);
            generateJSON();
            renderFields();
            return;
        }
        // Recursively check deeper
        if (nf.nestedFields && nf.nestedFields.length > 0) {
            if (addDeepNestedFieldRecursive(nf, nestedId, type)) {
                generateJSON();
                renderFields();
                return;
            }
        }
    }
}

function addDeepNestedFieldRecursive(f, targetId, type) {
    if (!f.nestedFields) return false;
    for (var i = 0; i < f.nestedFields.length; i++) {
        var nf = f.nestedFields[i];
        if (nf.id === targetId && nf.inputTVtype === 'migx') {
            if (!nf.nestedFields) nf.nestedFields = [];
            var dnf = fieldDefaults(type);
            dnf.id = genId();
            nf.nestedFields.push(dnf);
            return true;
        }
        if (nf.nestedFields && addDeepNestedFieldRecursive(nf, targetId, type)) return true;
    }
    return false;
}

// ==================== TABS ====================
function addTab() {
    var idx = tabs.length + 1;
    var t = {
        id: 'tab_' + genId(),
        caption: 'Таб ' + idx,
        color: TAB_COLORS[(idx - 1) % TAB_COLORS.length]
    };
    tabs.push(t);
    renderTabs();
    renderFields(); // Re-render to update tab selectors
    generateJSON();
}

function removeTab(tabId) {
    // Also clear tabid from fields referencing this tab
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].tabid === tabId) fields[i].tabid = '';
    }
    tabs = tabs.filter(function(t) { return t.id !== tabId; });
    renderTabs();
    renderFields();
    generateJSON();
}

// ==================== RENDER ====================
function renderAll() {
    renderTabs();
    renderFields();
    document.getElementById('stat-count').textContent = fields.length;
}

function renderTabs() {
    var container = document.getElementById('tab-entries');
    var countEl = document.getElementById('tabs-count');
    countEl.textContent = '(' + tabs.length + ')';

    var html = '';
    for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        html += '<div class="tab-entry">';
        html += '<span class="tab-color" style="background:' + t.color + ';"></span>';
        html += '<span>' + escHtml(t.caption) + '</span>';
        html += '<button data-action="remove-tab" data-tab-id="' + t.id + '" title="Удалить таб">✕</button>';
        html += '</div>';
    }
    container.innerHTML = html;
}

function renderFields() {
    var container = document.getElementById('fields-list');
    var emptyEl = document.getElementById('fields-empty');
    var countEl = document.getElementById('field-count-display');

    countEl.textContent = fields.length + ' ' + plural(fields.length, ['поле','поля','полей']);

    if (fields.length === 0) {
        if (emptyEl) emptyEl.style.display = '';
        container.innerHTML = '';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    var html = '';
    for (var i = 0; i < fields.length; i++) {
        html += renderFieldCard(fields[i], i, fields.length);
    }
    container.innerHTML = html;
}

function renderFieldCard(f, idx, total) {
    var isSel = selectedFieldId === f.id;
    var ti = MIGX_TYPES[f.type || f.inputTVtype];
    var icon = ti ? ti.icon : '❓';
    var tLabel = ti ? ti.label : (f.inputTVtype || '?');
    var cls = 'field-card';
    if (f.inputTVtype === 'migx') cls += ' is-migx';
    if (f.inputTVtype === 'tab') cls += ' is-tab';
    if (isSel) cls += ' selected';

    var h = '';
    h += '<div class="' + cls + '">';
    h += '<div class="field-card-header" data-action="select-field" data-field-id="' + f.id + '">';
    h += '<span class="fc-type">' + icon + '</span>';
    h += '<span class="fc-label">' + escHtml(f.caption || f.fieldname || 'Новое поле') + '</span>';
    h += '<span class="fc-type-name">[' + tLabel + ']</span>';
    // Badges
    if (f.inputTVtype === 'migx') {
        var nCount = f.nestedFields ? f.nestedFields.length : 0;
        h += '<span class="nested-badge' + (nCount === 0 ? ' empty' : '') + '">📦 ' + nCount + '</span>';
    }
    if (f.tabid) {
        var tab = findTab(f.tabid);
        if (tab) h += '<span class="tab-badge">📑 ' + escHtml(tab.caption) + '</span>';
    }
    h += '<div class="fc-actions">';
    if (idx > 0) h += '<button class="gen-btn-icon" data-action="move-field" data-field-id="'+f.id+'" data-dir="-1" title="Вверх">▲</button>';
    if (idx < total - 1) h += '<button class="gen-btn-icon" data-action="move-field" data-field-id="'+f.id+'" data-dir="1" title="Вниз">▼</button>';
    h += '<button class="gen-btn-icon" data-action="duplicate-field" data-field-id="'+f.id+'" title="Копировать">⧉</button>';
    h += '<button class="gen-btn-icon" data-action="remove-field" data-field-id="'+f.id+'" title="Удалить" style="color:#f87171;">✕</button>';
    h += '</div></div>';
    h += '<div class="field-card-body">' + renderFieldForm(f) + '</div>';
    h += '</div>';
    return h;
}

function findTab(tabId) {
    for (var i = 0; i < tabs.length; i++) { if (tabs[i].id === tabId) return tabs[i]; }
    return null;
}

function renderFieldForm(f) {
    var h = '';
    var t = f.inputTVtype || 'text';

    // Basic properties
    h += '<div class="gen-row-inline">';
    h += '<div class="gen-row" style="flex:2;"><label class="gen-label">Caption (название)</label><input type="text" class="gen-input" value="' + escAttr(f.caption || '') + '" data-action="update-field" data-field-id="' + f.id + '" data-key="caption" placeholder="Название поля"></div>';
    h += '<div class="gen-row"><label class="gen-label">Fieldname</label><input type="text" class="gen-input" value="' + escAttr(f.fieldname || '') + '" data-action="update-field" data-field-id="' + f.id + '" data-key="fieldname" placeholder="field_name" style="font-family:var(--font-mono);font-size:0.82rem;"></div>';
    h += '</div>';

    h += '<div class="gen-row-inline">';
    h += '<div class="gen-row"><label class="gen-label">Тип поля</label><select class="gen-select" data-action="change-field-type" data-field-id="' + f.id + '">';
    var tKeys = Object.keys(MIGX_TYPES);
    for (var tk = 0; tk < tKeys.length; tk++) {
        h += '<option value="' + tKeys[tk] + '"' + (t === tKeys[tk] ? ' selected' : '') + '>' + MIGX_TYPES[tKeys[tk]].label + '</option>';
    }
    h += '</select></div>';
    // Tab assignment (only for non-tab fields)
    if (t !== 'tab' && tabs.length > 0) {
        h += '<div class="gen-row"><label class="gen-label">Таб</label><select class="gen-select" data-action="update-field" data-field-id="' + f.id + '" data-key="tabid">';
        h += '<option value="">— Без таба —</option>';
        for (var ti = 0; ti < tabs.length; ti++) {
            h += '<option value="' + tabs[ti].id + '"' + (f.tabid === tabs[ti].id ? ' selected' : '') + '>' + escHtml(tabs[ti].caption) + '</option>';
        }
        h += '</select></div>';
    }
    h += '</div>';

    // Description
    h += '<div class="gen-row"><label class="gen-label">Описание</label><input type="text" class="gen-input" value="' + escAttr(f.description || '') + '" data-action="update-field" data-field-id="' + f.id + '" data-key="description" placeholder="Подсказка под полем"></div>';

    // Default value (not for tab/migx)
    if (t !== 'tab' && t !== 'migx') {
        h += '<div class="gen-row"><label class="gen-label">Default Value</label><input type="text" class="gen-input" value="' + escAttr(f.default_value || '') + '" data-action="update-field" data-field-id="' + f.id + '" data-key="default_value" placeholder="Значение по умолчанию"></div>';
    }

    // Type-specific configs
    // Listbox
    if (t === 'listbox') {
        h += '<div class="gen-divider"></div>';
        h += '<div style="font-weight:600;margin-bottom:8px;">📋 Опции Listbox</div>';
        h += '<div class="gen-row"><label class="gen-label">Опции (ключ==значение)</label><textarea class="gen-textarea configs-area" data-action="update-field" data-field-id="' + f.id + '" data-key="configs" placeholder="option1==Метка 1\noption2==Метка 2">' + escHtml(f.configs || '') + '</textarea><div class="gen-hint">Формат: ключ==Метка, каждая с новой строки</div></div>';
    }

    // Nested MIGX
    if (t === 'migx') {
        h += '<div class="gen-divider"></div>';
        h += renderNestedMIGXPanel(f);
    }

    return h;
}

// ==================== NESTED MIGX RENDER ====================
function renderNestedMIGXPanel(f) {
    var h = '';
    var nf = f.nestedFields || [];
    h += '<div class="nested-migx-panel">';
    h += '<div class="nested-title">';
    h += '📦 Вложенные поля MIGX';
    h += '<span class="nested-depth">полей: ' + nf.length + '</span>';
    h += '</div>';

    if (nf.length > 0) {
        for (var i = 0; i < nf.length; i++) {
            var child = nf[i];
            h += renderNestedFieldRow(f, child, null);
        }
    } else {
        h += '<div style="text-align:center;padding:16px;color:var(--text-dim);font-size:0.85rem;">Нет вложенных полей. Добавьте ниже.</div>';
    }

    // Add buttons for nested fields
    h += '<div class="nested-add-btns">';
    var nestableTypes = ['text','textarea','richtext','number','email','url','image','file','date','checkbox','listbox','color','tag','hidden','migx'];
    for (var ni = 0; ni < nestableTypes.length; ni++) {
        var nt = nestableTypes[ni];
        var nti = MIGX_TYPES[nt];
        var btnCls = 'gen-btn gen-btn-sm gen-btn-outline';
        if (nt === 'migx') btnCls += ' migx-btn';
        h += '<button class="' + btnCls + '" data-action="add-nested-field" data-parent-id="' + f.id + '" data-field-type="' + nt + '" style="font-size:0.7rem;padding:4px 8px;">+' + (nti ? nti.icon : nt) + '</button>';
    }
    h += '</div>';
    h += '</div>';
    return h;
}

function renderNestedFieldRow(parent, child, grandparentId) {
    var h = '';
    var cls = 'nested-field-row';
    if (child.inputTVtype === 'migx') cls += ' depth-1';
    var ti = MIGX_TYPES[child.inputTVtype];
    var icon = ti ? ti.icon : '❓';

    h += '<div class="' + cls + '">';
    h += '<span class="nf-type">' + icon + '</span>';
    h += '<input type="text" value="' + escAttr(child.caption || '') + '" data-action="update-nested-field" data-parent-id="' + parent.id + '" data-nested-id="' + child.id + '" data-key="caption" placeholder="Caption">';
    h += '<input type="text" class="nf-fn-input" value="' + escAttr(child.fieldname || '') + '" data-action="update-nested-field" data-parent-id="' + parent.id + '" data-nested-id="' + child.id + '" data-key="fieldname" placeholder="fieldname">';
    h += '<select data-action="change-nested-type" data-parent-id="' + parent.id + '" data-nested-id="' + child.id + '">';
    var tKeys = Object.keys(MIGX_TYPES);
    for (var tk = 0; tk < tKeys.length; tk++) {
        h += '<option value="' + tKeys[tk] + '"' + (child.inputTVtype === tKeys[tk] ? ' selected' : '') + '>' + MIGX_TYPES[tKeys[tk]].label + '</option>';
    }
    h += '</select>';
    h += '<button class="gen-btn-icon" data-action="remove-nested-field" data-parent-id="' + parent.id + '" data-nested-id="' + child.id + '" style="color:#f87171;width:26px;height:26px;font-size:0.7rem;">✕</button>';
    h += '</div>';

    // If the nested field itself is a migx, show its own nested fields
    if (child.inputTVtype === 'migx' && child.nestedFields && child.nestedFields.length > 0) {
        h += '<div style="margin-left:24px;padding-left:12px;border-left:2px solid rgba(16,185,129,0.2);margin-top:4px;margin-bottom:4px;">';
        for (var i = 0; i < child.nestedFields.length; i++) {
            h += renderNestedFieldRow(child, child.nestedFields[i], parent.id);
        }
        // Add button for deep nested
        h += '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:6px;margin-left:24px;">';
        var nestTypes = ['text','textarea','richtext','image','number','email','url','listbox','checkbox'];
        for (var ni = 0; ni < nestTypes.length; ni++) {
            var nt2 = nestTypes[ni];
            var nti2 = MIGX_TYPES[nt2];
            h += '<button class="gen-btn gen-btn-sm gen-btn-outline" data-action="add-deep-nested-field" data-parent-id="' + parent.id + '" data-nested-id="' + child.id + '" data-field-type="' + nt2 + '" style="font-size:0.65rem;padding:3px 6px;">+' + (nti2 ? nti2.icon : nt2) + '</button>';
        }
        h += '</div>';
        h += '</div>';
    }

    if (child.inputTVtype === 'listbox') {
        h += '<div class="nested-field-row" style="margin-left:24px;font-size:0.78rem;">';
        h += '<span style="color:var(--text-dim);flex-shrink:0;">Опции:</span>';
        h += '<input type="text" value="' + escAttr(child.configs || '') + '" data-action="update-nested-field" data-parent-id="' + parent.id + '" data-nested-id="' + child.id + '" data-key="configs" placeholder="key1==Label1" style="flex:3;font-size:0.78rem;">';
        h += '</div>';
    }

    return h;
}

// ==================== JSON GENERATION ====================
function generateJSON() {
    if (currentCodeTab === 'json_flat') {
        generateFlatJSON();
    } else if (currentCodeTab === 'formtabs') {
        generateFormTabsJSON();
    } else if (currentCodeTab === 'grid_columns') {
        generateGridColumnsJSON();
    } else if (currentCodeTab === 'getimagelist') {
        generateGetImageListSnippet();
    } else if (currentCodeTab === 'fenom') {
        generateFenomChunk();
    } else {
        generateStandardJSON();
    }
    validateMIGXConfig();
}

function cleanFieldForOutput(f) {
    var o = {};
    if (f.fieldname) o.fieldname = f.fieldname;
    if (f.caption || f.fieldname) o.caption = f.caption || f.fieldname;
    o.inputTVtype = f.inputTVtype || 'text';
    if (f.description) o.description = f.description;
    if (f.default_value) o.default_value = f.default_value;
    if (f.tabid) o.tabid = f.tabid;

    // Type-specific
    if (f.inputTVtype === 'listbox') {
        if (f.configs) o.inputOptionValues = f.configs;
    }

    if (f.inputTVtype === 'migx') {
        if (f.nestedFields && f.nestedFields.length > 0) {
            // Generate nested configs JSON
            var nestedArr = [];
            for (var i = 0; i < f.nestedFields.length; i++) {
                nestedArr.push(cleanFieldForOutput(f.nestedFields[i]));
            }
            o.configs = JSON.stringify(nestedArr);
        } else {
            o.configs = '';
        }
    }

    delete o.id;
    delete o.isnew;
    delete o.istab;

    return o;
}

function generateStandardJSON() {
    var out = [];
    // First pass: add tab definitions at the top
    for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        out.push({
            fieldname: t.id,
            caption: t.caption,
            inputTVtype: 'tab'
        });
    }
    // Then fields
    for (var i = 0; i < fields.length; i++) {
        out.push(cleanFieldForOutput(fields[i]));
    }

    var json = JSON.stringify(out, null, 2);
    document.getElementById('code-output').textContent = json || '[]';
}

function generateFlatJSON() {
    function flattenFields(arr) {
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            var f = arr[i];
            if (f.inputTVtype === 'tab') continue;
            result.push(cleanFieldForOutput(f));
        }
        return result;
    }

    var out = flattenFields(fields);
    var json = JSON.stringify(out, null, 2);
    document.getElementById('code-output').textContent = json || '[]';
}

function generateFormTabsJSON() {
    var formTabs = [];
    var defaultTab = { caption: 'Основное', fields: [] };
    var tabMap = {};
    for (var i = 0; i < tabs.length; i++) {
        tabMap[tabs[i].id] = { caption: tabs[i].caption, fields: [] };
        formTabs.push(tabMap[tabs[i].id]);
    }
    if (!formTabs.length) formTabs.push(defaultTab);
    for (var j = 0; j < fields.length; j++) {
        var f = fields[j];
        if (f.inputTVtype === 'tab') continue;
        var row = {
            field: f.fieldname || '',
            caption: f.caption || f.fieldname || '',
            inputTVtype: f.inputTVtype || 'text'
        };
        var target = f.tabid && tabMap[f.tabid] ? tabMap[f.tabid] : formTabs[0];
        target.fields.push(row);
    }
    document.getElementById('code-output').textContent = JSON.stringify(formTabs, null, 2);
}

function generateGridColumnsJSON() {
    var columns = [];
    var all = fields.filter(function(f) { return f.inputTVtype !== 'tab'; });
    for (var i = 0; i < all.length; i++) {
        if (!all[i].fieldname) continue;
        columns.push({
            header: all[i].caption || all[i].fieldname,
            dataIndex: all[i].fieldname,
            sortable: true
        });
    }
    document.getElementById('code-output').textContent = JSON.stringify(columns, null, 2);
}

function generateGetImageListSnippet() {
    var tpl = '[[getImageList? &tvname=`migx_items` &tpl=`migxItemTpl`]]';
    document.getElementById('code-output').textContent = tpl;
}

function generateFenomChunk() {
    var all = fields.filter(function(f) { return f.inputTVtype !== 'tab'; });
    var lines = ['<article class="migx-item">'];
    for (var i = 0; i < all.length; i++) {
        var name = all[i].fieldname || ('field_' + i);
        lines.push('  <div class="migx-item__' + name + '">{$item.' + name + '}</div>');
    }
    lines.push('</article>');
    document.getElementById('code-output').textContent = lines.join('\n');
}

// ==================== CODE TABS ====================
function switchCodeTab(tab) {
    currentCodeTab = tab;
    var tabs = document.querySelectorAll('.code-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tab);
    }
    generateJSON();
}

// ==================== COPY / DOWNLOAD ====================
function copyCode() {
    var code = document.getElementById('code-output').textContent;
    if (!code || code === 'Добавьте поля — JSON появится здесь') {
        showToast('Добавьте поля для генерации JSON', true);
        return;
    }
    navigator.clipboard.writeText(code).then(function() {
        showToast('JSON скопирован в буфер обмена');
    }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('JSON скопирован в буфер обмена');
    });
}

function buildAuditChecklistText() {
    var report = lastValidationReport;
    var lines = [
        'MIGX аудит готовности: ' + report.score + '%',
        report.summary,
        '',
        'Метрики:',
        '- Полей всего: ' + report.metrics.fields,
        '- Табов формы: ' + report.metrics.tabs,
        '- Вложенных MIGX: ' + report.metrics.nested,
        '- Ошибок: ' + report.metrics.errors,
        '- Предупреждений: ' + report.metrics.warnings,
        ''
    ];

    if (report.warnings.length) {
        lines.push('Что исправить:');
        for (var i = 0; i < report.warnings.length; i++) {
            lines.push('- ' + report.warnings[i].text);
        }
    } else if (report.metrics.fields) {
        lines.push('Что исправить: критичных замечаний нет.');
    } else {
        lines.push('Что исправить: добавьте поля MIGX и повторите проверку.');
    }

    return lines.join('\n');
}

function copyAuditChecklist() {
    validateMIGXConfig();
    var text = buildAuditChecklistText();
    navigator.clipboard.writeText(text).then(function() {
        showToast('Аудит MIGX скопирован');
    }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Аудит MIGX скопирован');
    });
}

function buildShareURL() {
    var payload = {
        version: 1,
        fields: fields,
        tabs: tabs,
        currentCodeTab: currentCodeTab
    };
    var url = new URL(window.location.href);
    url.searchParams.delete('preset');
    url.searchParams.delete('source');
    url.hash = 'migx=' + encodeURIComponent(encodeSharePayload(payload));
    return url.toString();
}

function copyShareText(link) {
    function fallback() {
        var ta = document.createElement('textarea');
        ta.value = link;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var copied = document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(copied ? 'Ссылка на MIGX-конфигурацию скопирована' : 'Не удалось скопировать ссылку', !copied);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function() {
            showToast('Ссылка на MIGX-конфигурацию скопирована');
        }).catch(fallback);
        return;
    }

    fallback();
}

function copyShareLink() {
    if (!fields.length) {
        showToast('Добавьте поля, чтобы создать ссылку на конфигурацию', true);
        return;
    }
    copyShareText(buildShareURL());
}

function downloadCode() {
    var code = document.getElementById('code-output').textContent;
    if (!code || code === 'Добавьте поля — JSON появится здесь') {
        showToast('Добавьте поля для генерации JSON', true);
        return;
    }
    var filename = 'migx-config.json';
    var blob = new Blob([code], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Файл ' + filename + ' сохранён');
}

// ==================== TOAST ====================
function showToast(msg, isError) {
    var toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() { toast.classList.remove('show'); }, 2500);
}

// ==================== RESET ====================
function resetAll(silent) {
    fields = [];
    fieldIdCounter = 0;
    selectedFieldId = null;
    tabs = [];
    renderAll();
    generateJSON();
    if (!silent) showToast('Сброшено');
}

// ==================== IMPORT ====================
function importFromJSON(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var json = JSON.parse(e.target.result);
            if (!Array.isArray(json)) {
                showToast('Ожидается массив JSON', true);
                return;
            }
            resetAll(true);
            fieldIdCounter = 0;
            fields = [];
            tabs = [];

            function parseField(item) {
                var type = item.inputTVtype || 'text';
                var f = fieldDefaults(type);
                f.id = genId();
                f.fieldname = item.fieldname || '';
                f.caption = item.caption || '';
                f.inputTVtype = type;
                f.description = item.description || '';
                f.default_value = item.default_value || '';
                f.tabid = item.tabid || '';

                if (type === 'listbox') {
                    f.configs = item.inputOptionValues || item.configs || '';
                    f.inputOptionValues = item.inputOptionValues || '';
                }

                if (type === 'migx' && item.configs) {
                    try {
                        var nested = typeof item.configs === 'string' ? JSON.parse(item.configs) : item.configs;
                        if (Array.isArray(nested)) {
                            f.nestedFields = nested.map(function(ni) {
                                var nf = parseField(ni);
                                nf.id = genId();
                                return nf;
                            });
                        }
                    } catch(nex) {
                        f.configs = item.configs;
                    }
                }

                if (type === 'tab') {
                    tabs.push({
                        id: item.fieldname || f.id,
                        caption: item.caption || 'Tab',
                        color: TAB_COLORS[tabs.length % TAB_COLORS.length]
                    });
                    return null; // Don't add tab as a regular field
                }

                return f;
            }

            for (var i = 0; i < json.length; i++) {
                var parsed = parseField(json[i]);
                if (parsed) fields.push(parsed);
            }

            renderAll();
            generateJSON();
            showToast('Импортировано: ' + fields.length + ' полей, ' + tabs.length + ' табов');
        } catch(err) {
            showToast('Ошибка импорта JSON: ' + err.message, true);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ==================== TEMPLATES ====================
function loadTemplate(name) {
    resetAll(true);
    fieldIdCounter = 0;
    fields = [];
    tabs = [];

    function mkField(type, caption, fieldname, extra) {
        var f = fieldDefaults(type);
        f.id = genId();
        f.caption = caption;
        f.fieldname = fieldname || slugify(caption);
        if (extra) for (var k in extra) f[k] = extra[k];
        return f;
    }

    function mkNested(type, caption, fieldname, extra) {
        var f = fieldDefaults(type);
        f.id = genId();
        f.caption = caption;
        f.fieldname = fieldname || slugify(caption);
        if (extra) for (var k in extra) f[k] = extra[k];
        return f;
    }

    switch (name) {
        case 'slider':
            fields = [
                mkField('image', 'Изображение', 'slide_image'),
                mkField('text', 'Заголовок', 'slide_title'),
                mkField('textarea', 'Описание', 'slide_desc'),
                mkField('url', 'Ссылка', 'slide_link')
            ];
            break;

        case 'team':
            fields = [
                mkField('image', 'Фото', 'team_photo'),
                mkField('text', 'Имя', 'team_name'),
                mkField('text', 'Должность', 'team_role'),
                mkField('richtext', 'Описание', 'team_bio'),
                mkField('url', 'LinkedIn', 'team_linkedin')
            ];
            break;

        case 'gallery':
            fields = [
                mkField('image', 'Изображение', 'image'),
                mkField('text', 'Alt', 'alt'),
                mkField('text', 'Подпись', 'caption'),
                mkField('textarea', 'Описание', 'description')
            ];
            break;

        case 'reviews':
            fields = [
                mkField('image', 'Фото автора', 'author_photo'),
                mkField('text', 'Автор', 'author_name'),
                mkField('text', 'Компания', 'company'),
                mkField('richtext', 'Текст отзыва', 'review_text'),
                mkField('number', 'Рейтинг', 'rating')
            ];
            break;

        case 'errors':
            fields = [
                mkField('text', 'Поле без fieldname', ''),
                mkField('text', 'Дубликат', 'duplicate_name'),
                mkField('textarea', 'Дубликат 2', 'duplicate_name'),
                mkField('migx', 'Пустой MIGX', 'empty_nested'),
                mkField('listbox', 'Listbox без опций', 'empty_listbox')
            ];
            break;

        case 'faq':
            fields = [
                mkField('text', 'Вопрос', 'faq_q'),
                mkField('richtext', 'Ответ', 'faq_a')
            ];
            break;

        case 'catalog':
            fields = [
                mkField('text', 'Название', 'prod_name'),
                mkField('image', 'Фото', 'prod_image'),
                mkField('number', 'Цена', 'prod_price'),
                mkField('richtext', 'Описание', 'prod_desc'),
                mkField('listbox', 'Категория', 'prod_cat', {configs: 'category1==Электроника\ncategory2==Одежда\ncategory3==Аксессуары'})
            ];
            break;

        case 'nested':
            // MIGX with nested MIGX: sections -> items
            var sectionFields = [
                mkNested('text', 'Название секции', 'section_title'),
                mkNested('migx', 'Элементы', 'section_items', {
                    nestedFields: [
                        mkNested('text', 'Название', 'item_title'),
                        mkNested('image', 'Иконка', 'item_icon'),
                        mkNested('url', 'Ссылка', 'item_link'),
                        mkNested('textarea', 'Описание', 'item_desc')
                    ]
                })
            ];
            var sectionMigx = mkField('migx', 'Секции', 'sections');
            sectionMigx.nestedFields = sectionFields;
            fields = [sectionMigx];
            break;

        case 'tabs_demo':
            // Tabs: Content, Media, SEO
            tabs = [
                { id: 'tab_content', caption: 'Контент', color: '#6366f1' },
                { id: 'tab_media', caption: 'Медиа', color: '#10b981' },
                { id: 'tab_seo', caption: 'SEO', color: '#f59e0b' }
            ];
            fields = [
                mkField('text', 'Заголовок', 'title', {tabid: 'tab_content'}),
                mkField('richtext', 'Текст', 'content', {tabid: 'tab_content'}),
                mkField('image', 'Изображение', 'hero_image', {tabid: 'tab_media'}),
                mkField('image', 'Галерея', 'gallery', {tabid: 'tab_media'}),
                mkField('video', 'Видео', 'video_url', {tabid: 'tab_media'}),
                mkField('text', 'Meta Title', 'meta_title', {tabid: 'tab_seo'}),
                mkField('textarea', 'Meta Description', 'meta_desc', {tabid: 'tab_seo'})
            ];
            break;
    }

    renderAll();
    generateJSON();
    validateMIGXConfig();
    showToast('Шаблон загружен');
}

// ==================== EVENT DELEGATION ====================
document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    // Prevent event bubbling for actions inside field-card-actions
    if (action !== 'select-field' && el.closest('.fc-actions')) {
        e.stopPropagation();
    }

    switch (action) {
        case 'add-field':
            addField(el.getAttribute('data-field-type'));
            break;
        case 'reset-all':
            resetAll();
            break;
        case 'import-json':
            document.getElementById('json-import-input').click();
            break;
        case 'switch-tab':
            switchCodeTab(el.getAttribute('data-tab'));
            break;
        case 'copy-code':
            copyCode();
            break;
        case 'copy-audit':
            copyAuditChecklist();
            break;
        case 'copy-share-link':
            copyShareLink();
            break;
        case 'download-code':
            downloadCode();
            break;
        case 'load-template':
            loadTemplate(el.getAttribute('data-template'));
            break;
        case 'select-field':
            selectField(el.getAttribute('data-field-id'));
            break;
        case 'move-field':
            moveField(el.getAttribute('data-field-id'), parseInt(el.getAttribute('data-dir')));
            break;
        case 'duplicate-field':
            duplicateField(el.getAttribute('data-field-id'));
            break;
        case 'remove-field':
            removeField(el.getAttribute('data-field-id'));
            break;
        case 'add-tab':
            addTab();
            break;
        case 'remove-tab':
            removeTab(el.getAttribute('data-tab-id'));
            break;
        case 'add-nested-field':
            addNestedField(el.getAttribute('data-parent-id'), el.getAttribute('data-field-type'));
            break;
        case 'remove-nested-field':
            removeNestedField(el.getAttribute('data-parent-id'), el.getAttribute('data-nested-id'));
            break;
        case 'add-deep-nested-field':
            addDeepNestedField(el.getAttribute('data-parent-id'), el.getAttribute('data-nested-id'), el.getAttribute('data-field-type'));
            break;
    }
});

// ==================== CHANGE / INPUT EVENTS ====================
document.addEventListener('change', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    switch (action) {
        case 'update-field':
            updateField(el.getAttribute('data-field-id'), el.getAttribute('data-key'), el.value);
            break;
        case 'change-field-type':
            changeFieldType(el.getAttribute('data-field-id'), el.value);
            break;
        case 'update-nested-field':
            updateNestedField(el.getAttribute('data-parent-id'), el.getAttribute('data-nested-id'), el.getAttribute('data-key'), el.value);
            break;
        case 'change-nested-type':
            updateNestedField(el.getAttribute('data-parent-id'), el.getAttribute('data-nested-id'), 'inputTVtype', el.value);
            renderFields();
            break;
    }
});

document.addEventListener('input', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    switch (action) {
        case 'update-field':
            updateField(el.getAttribute('data-field-id'), el.getAttribute('data-key'), el.value);
            // Re-render label in card header on caption change
            if (el.getAttribute('data-key') === 'caption') {
                // Update just the label text
                updateField(el.getAttribute('data-field-id'), 'caption', el.value);
            }
            if (el.getAttribute('data-key') === 'fieldname') {
                updateField(el.getAttribute('data-field-id'), 'fieldname', el.value);
            }
            break;
        case 'update-nested-field':
            updateNestedField(el.getAttribute('data-parent-id'), el.getAttribute('data-nested-id'), el.getAttribute('data-key'), el.value);
            break;
    }
});

// ==================== CHANGE FIELD TYPE ====================
function changeFieldType(id, newType) {
    var f = getFieldById(id);
    if (!f) return;
    var oldType = f.inputTVtype;

    f.inputTVtype = newType;

    // Initialize type-specific properties
    if (newType === 'migx') {
        if (!f.nestedFields) f.nestedFields = [];
        if (!f.configs) f.configs = '';
    }
    if (newType === 'listbox') {
        if (!f.configs) f.configs = '';
    }
    if (newType === 'tab') {
        f.istab = true;
    } else {
        f.istab = false;
    }

    renderAll();
    generateJSON();
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    var jsonImport = document.getElementById('json-import-input');
    if (jsonImport) {
        jsonImport.addEventListener('change', importFromJSON);
    }

    if (!restoreSharedStateFromURL()) {
        renderAll();
        generateJSON();
        applyPresetFromURL();
    }
    validateMIGXConfig();
});
