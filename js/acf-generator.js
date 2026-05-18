'use strict';

// ==================== CUSTOM SELECT COMPONENT ====================
var CustomSelect = (function() {
    var allInstances = [];
    var activeInstance = null;

    function CustomSelectCtor(el, opts) {
        opts = opts || {};
        this._el = el;
        this._placeholder = opts.placeholder || (el.getAttribute('data-placeholder') || 'Выберите...');
        this._searchable = opts.searchable !== undefined ? opts.searchable : true;
        this._onChange = opts.onChange || null;
        this._nativeSelect = el;
        this._wrap = null;
        this._trigger = null;
        this._dropdown = null;
        this._options = [];
        this._selectedValue = el.value || '';

        this._build();
        allInstances.push(this);
    }

    CustomSelectCtor.prototype._build = function() {
        var self = this;
        var el = this._el;

        // Hide native select
        el.style.display = 'none';

        // Wrap
        this._wrap = document.createElement('div');
        this._wrap.className = 'cs-wrap';
        el.parentNode.insertBefore(this._wrap, el);
        this._wrap.appendChild(el);

        // Trigger
        this._trigger = document.createElement('div');
        this._trigger.className = 'cs-trigger';
        this._trigger.tabIndex = 0;
        this._trigger.innerHTML = '<span class="cs-selected"></span><span class="cs-arrow">▼</span>';
        this._wrap.appendChild(this._trigger);

        // Dropdown
        this._dropdown = document.createElement('div');
        this._dropdown.className = 'cs-dropdown';
        this._wrap.appendChild(this._dropdown);

        // Search
        if (this._searchable) {
            var searchWrap = document.createElement('div');
            searchWrap.className = 'cs-search';
            var searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Поиск...';
            searchInput.addEventListener('input', function() { self._filter(this.value); });
            searchInput.addEventListener('click', function(e) { e.stopPropagation(); });
            searchWrap.appendChild(searchInput);
            this._dropdown.appendChild(searchWrap);
            this._searchInput = searchInput;
        }

        // Options container
        var optContainer = document.createElement('div');
        optContainer.className = 'cs-options';
        this._dropdown.appendChild(optContainer);
        this._optionsContainer = optContainer;

        // Populate
        this._rebuildOptions();

        // Events
        this._trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            self._toggle();
        });

        this._wrap.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') { self._close(); }
        });
    };

    CustomSelectCtor.prototype._rebuildOptions = function() {
        var self = this;
        var container = this._optionsContainer;
        container.innerHTML = '';
        this._options = [];

        var nativeOpts = this._el.querySelectorAll('option');
        for (var i = 0; i < nativeOpts.length; i++) {
            var opt = nativeOpts[i];
            var optData = {
                value: opt.value,
                text: opt.textContent,
                selected: opt.value === this._selectedValue
            };
            this._options.push(optData);

            var optEl = document.createElement('div');
            optEl.className = 'cs-option' + (optData.selected ? ' selected' : '');
            optEl.textContent = optData.text;
            optEl.setAttribute('data-value', optData.value);
            optEl.addEventListener('click', function(e) {
                e.stopPropagation();
                self._select(this.getAttribute('data-value'));
            });
            container.appendChild(optEl);
        }

        this._updateTrigger();
    };

    CustomSelectCtor.prototype._updateTrigger = function() {
        var selectedOpt = this._el.querySelector('option[value="' + this._selectedValue + '"]');
        var display = selectedOpt ? selectedOpt.textContent : this._placeholder;
        var selSpan = this._trigger.querySelector('.cs-selected');
        if (selectedOpt) {
            selSpan.textContent = display;
            selSpan.classList.remove('cs-placeholder');
        } else {
            selSpan.textContent = this._placeholder;
            selSpan.classList.add('cs-placeholder');
        }
    };

    CustomSelectCtor.prototype._select = function(value) {
        this._selectedValue = value;
        this._el.value = value;

        // Fire native change event
        var event = document.createEvent('HTMLEvents');
        event.initEvent('change', true, true);
        this._el.dispatchEvent(event);

        // Update UI
        this._updateTrigger();
        var opts = this._optionsContainer.querySelectorAll('.cs-option');
        for (var i = 0; i < opts.length; i++) {
            opts[i].classList.toggle('selected', opts[i].getAttribute('data-value') === value);
        }

        if (this._onChange) {
            this._onChange(value, this._el);
        }

        this._close();
    };

    CustomSelectCtor.prototype._open = function() {
        if (activeInstance && activeInstance !== this) {
            activeInstance._close();
        }
        this._trigger.classList.add('open');
        this._dropdown.classList.add('open');
        activeInstance = this;
        if (this._searchInput) {
            setTimeout(function() { this._searchInput.focus(); }.bind(this), 50);
        }
    };

    CustomSelectCtor.prototype._close = function() {
        this._trigger.classList.remove('open');
        this._dropdown.classList.remove('open');
        if (this._searchInput) {
            this._searchInput.value = '';
            this._filter('');
        }
        if (activeInstance === this) activeInstance = null;
    };

    CustomSelectCtor.prototype._toggle = function() {
        if (this._trigger.classList.contains('open')) {
            this._close();
        } else {
            this._open();
        }
    };

    CustomSelectCtor.prototype._filter = function(query) {
        var lower = query.toLowerCase();
        var opts = this._optionsContainer.querySelectorAll('.cs-option');
        var visible = 0;
        for (var i = 0; i < opts.length; i++) {
            var text = (opts[i].textContent || '').toLowerCase();
            var match = text.indexOf(lower) !== -1;
            opts[i].style.display = match ? '' : 'none';
            if (match) visible++;
        }
        // Show "no results" if nothing matches
        var noRes = this._optionsContainer.querySelector('.cs-option.no-results');
        if (visible === 0) {
            if (!noRes) {
                noRes = document.createElement('div');
                noRes.className = 'cs-option no-results';
                noRes.textContent = 'Ничего не найдено';
                this._optionsContainer.appendChild(noRes);
            }
        } else if (noRes) {
            noRes.remove();
        }
    };

    CustomSelectCtor.prototype.destroy = function() {
        this._close();
        var idx = allInstances.indexOf(this);
        if (idx !== -1) allInstances.splice(idx, 1);
        if (this._wrap) {
            this._wrap.parentNode.insertBefore(this._el, this._wrap);
            this._wrap.remove();
        }
        this._el.style.display = '';
    };

    // Handle clicks outside
    document.addEventListener('click', function(e) {
        if (activeInstance) {
            var inside = activeInstance._wrap && activeInstance._wrap.contains(e.target);
            if (!inside) activeInstance._close();
        }
    });

    return {
        create: function(el, opts) { return new CustomSelectCtor(el, opts); }
    };
})();

// ==================== FIELD TYPES ====================
var FIELD_TYPES = {
    text: { label: 'Текст', icon: 'text_fields' },
    textarea: { label: 'Текстовая область', icon: 'article' },
    number: { label: 'Число', icon: 'pin' },
    email: { label: 'Email', icon: 'mail' },
    url: { label: 'URL', icon: 'link' },
    password: { label: 'Пароль', icon: 'lock' },
    wysiwyg: { label: 'Редактор', icon: 'edit' },
    image: { label: 'Изображение', icon: 'image' },
    file: { label: 'Файл', icon: 'draft' },
    gallery: { label: 'Галерея', icon: 'collections' },
    oembed: { label: 'oEmbed', icon: 'smart_display' },
    select: { label: 'Выпадающий список', icon: 'arrow_drop_down_circle' },
    checkbox: { label: 'Чекбокс', icon: 'check_box' },
    radio: { label: 'Радио', icon: 'radio_button_checked' },
    true_false: { label: 'Да / Нет', icon: 'toggle_on' },
    link: { label: 'Ссылка', icon: 'link' },
    post_object: { label: 'Запись', icon: 'feed' },
    relationship: { label: 'Связь', icon: 'compare_arrows' },
    date_picker: { label: 'Дата', icon: 'calendar_today' },
    color_picker: { label: 'Цвет', icon: 'palette' },
    tab: { label: 'Вкладка', icon: 'tab' },
    message: { label: 'Сообщение', icon: 'chat' },
    group: { label: 'Группа', icon: 'folder' },
    repeater: { label: 'Повторитель', icon: 'repeat' },
    flexible_content: { label: 'Гибкий контент', icon: 'dashboard' }
};

// ==================== STATE ====================
var fields = [];
var fieldIdCounter = 0;
var selectedFieldId = null;
var locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];

// ==================== HELPERS ====================
function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escPHPSingle(s) {
    if (!s) return '';
    return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function plural(n, forms) {
    n = Math.abs(n) % 100;
    var n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
}

// ==================== FIELD DEFAULTS ====================
function fieldDefaults(type) {
    var d = {
        type: type,
        label: FIELD_TYPES[type] ? FIELD_TYPES[type].label : type,
        name: '',
        key: '',
        instructions: '',
        required: 0,
        wrapper: { width: '', class: '', id: '' },
        default_value: '',
        placeholder: '',
        maxlength: '',
        prepend: '',
        append: '',
        choices: {},
        return_format: (type === 'image' || type === 'file' || type === 'gallery') ? 'array' : '',
        library: 'all',
        new_lines: (type === 'textarea') ? 'br' : '',
        min: 0, max: 0, step: '',
        min_width: '', min_height: '',
        mime_types: '',
        width: '', height: '',
        message: '',
        display_format: 'd/m/Y',
        return_format_date: 'd/m/Y',
        placement: 'top',
        endpoint: 0,
        sub_fields: [],
        layouts: [],
        button_label: 'Добавить строку',
        layout: 'table',
        post_type: ['post'],
        min_posts: '', max_posts: '',
        allow_null: 0, multiple: 0, ui: 0
    };
    if (type === 'select') d.choices = { option_1: 'Вариант 1' };
    if (type === 'checkbox') d.choices = { option_1: 'Вариант 1' };
    if (type === 'radio') d.choices = { option_1: 'Вариант 1' };
    return d;
}

// ==================== FIELD CRUD ====================
function addField(type) {
    var id = ++fieldIdCounter;
    var f = fieldDefaults(type);
    f.id = id;
    f.key = 'field_' + id;
    f.name = 'field_' + id;
    fields.push(f);
    selectedFieldId = id;
    renderAll();
    liveUpdate();
}

function changeFieldType(id, newType) {
    var f = getFieldById(id);
    if (!f) return;
    var oldType = f.type;
    var newDefaults = fieldDefaults(newType);
    // Preserve user-set common fields
    var keep = ['id', 'key', 'label', 'name', 'instructions', 'required', 'wrapper'];
    var old = {};
    for (var k = 0; k < keep.length; k++) { var kk = keep[k]; old[kk] = f[kk]; }
    // Merge
    for (var k2 in newDefaults) { f[k2] = newDefaults[k2]; }
    for (var k3 = 0; k3 < keep.length; k3++) { var kk2 = keep[k3]; f[kk2] = old[kk2]; }
    f.type = newType;
    renderAll();
    liveUpdate();
}

function removeField(id) {
    fields = fields.filter(function(f) { return f.id !== id; });
    if (selectedFieldId === id) selectedFieldId = null;
    renderAll();
    liveUpdate();
}

function duplicateField(id) {
    var idx = -1;
    for (var i = 0; i < fields.length; i++) { if (fields[i].id === id) { idx = i; break; } }
    if (idx === -1) return;
    var copy = JSON.parse(JSON.stringify(fields[idx]));
    copy.id = ++fieldIdCounter;
    copy.key = 'field_' + copy.id;
    copy.name = 'field_' + copy.id;
    fields.splice(idx + 1, 0, copy);
    selectedFieldId = copy.id;
    renderAll();
    liveUpdate();
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
    liveUpdate();
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
    if (key === 'required' || key === 'endpoint' || key === 'allow_null' || key === 'multiple' || key === 'ui' || key === 'ajax') {
        f[key] = value ? 1 : 0;
    } else if (key === 'min' || key === 'max' || key === 'min_posts' || key === 'max_posts') {
        f[key] = parseInt(value) || 0;
    } else {
        f[key] = value;
    }
    liveUpdate();
}

function updateWrapperWidth(id, value) {
    var f = getFieldById(id);
    if (!f) return;
    if (!f.wrapper) f.wrapper = {};
    f.wrapper.width = value;
    liveUpdate();
}

// Sub-fields (for repeater / group)
function subFieldDefaults(type) {
    var d = {
        type: type,
        label: FIELD_TYPES[type] ? FIELD_TYPES[type].label : type,
        name: '',
        key: '',
        instructions: '',
        required: 0,
        wrapper: { width:'', class:'', id:'' },
        default_value: '',
        placeholder: '',
        maxlength: '',
        choices: {},
        return_format: (type === 'image' || type === 'file') ? 'array' : '',
        library: 'all',
        new_lines: (type === 'textarea') ? 'br' : '',
        message: '',
        display_format: 'd/m/Y',
        sub_fields: [],
        layouts: [],
        button_label: 'Добавить строку',
        min: 0, max: 0, layout: 'table',
        post_type: ['post'],
        allow_null: 0, multiple: 0
    };
    if (type === 'select' || type === 'checkbox' || type === 'radio') d.choices = { option_1: 'Вариант 1' };
    return d;
}

function addSubField(parentId, type) {
    var f = getFieldById(parentId);
    if (!f) return;
    if (!f.sub_fields) f.sub_fields = [];
    var subId = ++fieldIdCounter;
    var sf = subFieldDefaults(type);
    sf.id = subId;
    sf.key = 'field_' + subId;
    sf.name = 'sub_field_' + subId;
    f.sub_fields.push(sf);
    renderAll();
    liveUpdate();
}

function removeSubField(parentId, subId) {
    var f = getFieldById(parentId);
    if (!f || !f.sub_fields) return;
    f.sub_fields = f.sub_fields.filter(function(sf) { return sf.id !== subId; });
    renderAll();
    liveUpdate();
}

function updateSubField(parentId, subId, key, value) {
    var f = getFieldById(parentId);
    if (!f || !f.sub_fields) return;
    for (var i = 0; i < f.sub_fields.length; i++) {
        if (f.sub_fields[i].id === subId) { f.sub_fields[i][key] = value; break; }
    }
    liveUpdate();
}

// Flexible Content Layouts
function addFlexLayout(parentId) {
    var f = getFieldById(parentId);
    if (!f) return;
    if (!f.layouts) f.layouts = [];
    var ln = 'layout_' + (f.layouts.length + 1);
    f.layouts.push({ name: ln, label: 'Layout ' + ln.replace('layout_',''), sub_fields: [] });
    renderAll();
    liveUpdate();
}

function removeFlexLayout(parentId, layoutIdx) {
    var f = getFieldById(parentId);
    if (!f || !f.layouts) return;
    f.layouts.splice(layoutIdx, 1);
    renderAll();
    liveUpdate();
}

function updateFlexLayout(parentId, layoutIdx, key, value) {
    var f = getFieldById(parentId);
    if (!f || !f.layouts || !f.layouts[layoutIdx]) return;
    f.layouts[layoutIdx][key] = value;
    liveUpdate();
}

function addSubFieldToLayout(parentId, layoutIdx, type) {
    var f = getFieldById(parentId);
    if (!f || !f.layouts || !f.layouts[layoutIdx]) return;
    var layout = f.layouts[layoutIdx];
    if (!layout.sub_fields) layout.sub_fields = [];
    var subId = ++fieldIdCounter;
    var sf = subFieldDefaults(type);
    sf.id = subId;
    sf.key = 'field_' + subId;
    sf.name = 'sub_field_' + subId;
    layout.sub_fields.push(sf);
    renderAll();
    liveUpdate();
}

function removeSubFieldFromLayout(parentId, layoutIdx, subId) {
    var f = getFieldById(parentId);
    if (!f || !f.layouts || !f.layouts[layoutIdx] || !f.layouts[layoutIdx].sub_fields) return;
    f.layouts[layoutIdx].sub_fields = f.layouts[layoutIdx].sub_fields.filter(function(sf) { return sf.id !== subId; });
    renderAll();
    liveUpdate();
}

function updateSubFieldInLayout(parentId, layoutIdx, subId, key, value) {
    var f = getFieldById(parentId);
    if (!f || !f.layouts || !f.layouts[layoutIdx] || !f.layouts[layoutIdx].sub_fields) return;
    var sfs = f.layouts[layoutIdx].sub_fields;
    for (var i = 0; i < sfs.length; i++) {
        if (sfs[i].id === subId) { sfs[i][key] = value; break; }
    }
    liveUpdate();
}

// ==================== LOCATION RULES ====================
function addLocationRule() {
    locationRules.push({ param: 'post_type', operator: '==', value: 'page' });
    renderAll();
    liveUpdate();
}

function removeLocationRule(idx) {
    if (locationRules.length <= 1) { showToast('Нужно минимум одно правило', true); return; }
    locationRules.splice(idx, 1);
    renderAll();
    liveUpdate();
}

// ==================== RENDER ====================
function renderAll() {
    renderLocationRules();
    renderFields();
    document.getElementById('stat-count').textContent = fields.length;
}

function renderLocationRules() {
    var container = document.getElementById('location-rules');
    var html = '';
    var params = ['post_type','post_template','post_status','post_format','post_category','post_taxonomy','page_type','page_parent','page_template','user_type','user_form','user_role','options_page','current_user','current_user_role','widget','nav_menu','nav_menu_item','block','attachment','taxonomy','comment'];
    var operators = ['==','!='];
    for (var i = 0; i < locationRules.length; i++) {
        var r = locationRules[i];
        html += '<div class="location-rule">';
        html += '<select class="gen-select" data-action="location-param" data-index="'+i+'" style="font-size:1.1rem;">';
        for (var p = 0; p < params.length; p++) html += '<option value="'+params[p]+'"'+(r.param===params[p]?' selected':'')+'>'+params[p]+'</option>';
        html += '</select>';
        html += '<select class="gen-select" data-action="location-operator" data-index="'+i+'" style="flex:0 0 60px;font-size:0.85rem;">';
        for (var o = 0; o < operators.length; o++) html += '<option value="'+operators[o]+'"'+(r.operator===operators[o]?' selected':'')+'>'+operators[o]+'</option>';
        html += '</select>';
        html += '<input type="text" class="gen-input" value="'+escAttr(r.value||'')+'" data-action="location-value" data-index="'+i+'" placeholder="value" style="font-size:1.1rem;">';
        html += '<button class="gen-btn-icon" data-action="remove-location-rule" data-index="'+i+'" style="flex-shrink:0;color:#f87171;width:40px;height:40px;font-size:0.9rem;"><span class="material-symbols-outlined">close</span></button>';
        html += '</div>';
    }
    container.innerHTML = html;
    // Upgrade location selects to custom after render
    setTimeout(function() { upgradeLocationSelects(); }, 10);
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
        var f = fields[i];
        var isSel = selectedFieldId === f.id;
        var ti = FIELD_TYPES[f.type];
        var icon = ti ? ti.icon : 'Aa';
        var tLabel = ti ? ti.label : f.type;

        html += '<div class="field-card' + (isSel ? ' selected' : '') + '">';
        html += '<div class="field-card-header" data-action="select-field" data-field-id="' + f.id + '">';
        html += '<span class="fc-drag"><span class="material-symbols-outlined">drag_indicator</span></span>';
        html += '<span class="fc-type"><span class="material-symbols-outlined">' + icon + '</span></span>';
        html += '<span class="fc-label">' + escHtml(f.label || tLabel) + '</span>';
        html += '<span class="fc-type-name">[' + tLabel + ']</span>';
        html += '<div class="fc-actions">';
        if (i > 0) html += '<button class="gen-btn-icon" data-action="move-field" data-field-id="'+f.id+'" data-dir="-1" title="Вверх" style="font-size:1rem;"><span class="material-symbols-outlined">arrow_upward</span></button>';
        if (i < fields.length-1) html += '<button class="gen-btn-icon" data-action="move-field" data-field-id="'+f.id+'" data-dir="1" title="Вниз" style="font-size:1rem;"><span class="material-symbols-outlined">arrow_downward</span></button>';
        html += '<button class="gen-btn-icon" data-action="duplicate-field" data-field-id="'+f.id+'" title="Копировать"><span class="material-symbols-outlined">content_copy</span></button>';
        html += '<button class="gen-btn-icon" data-action="remove-field" data-field-id="'+f.id+'" title="Удалить" style="color:#f87171;"><span class="material-symbols-outlined">close</span></button>';
        html += '</div></div>';
        html += '<div class="field-card-body">' + renderFieldForm(f) + '</div>';
        html += '</div>';
    }
    container.innerHTML = html;
    // Upgrade selects inside field cards
    setTimeout(function() { upgradeSelects(container); }, 10);
}

function renderFieldForm(f) {
    var h = '';

    // Basic properties
    h += '<div class="gen-row-inline"><div class="gen-row" style="flex:2;"><label class="gen-label">Название</label><input type="text" class="gen-input" value="'+escAttr(f.label||'')+'" data-action="update-field-label" data-field-id="'+f.id+'" placeholder="Заголовок поля"></div>';
    h += '<div class="gen-row"><label class="gen-label">Имя поля</label><input type="text" class="gen-input" value="'+escAttr(f.name||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="name" placeholder="field_name" style="font-family:var(--font-mono);font-size:1.05rem;"></div></div>';

    h += '<div class="gen-row-inline"><div class="gen-row"><label class="gen-label">Ключ</label><input type="text" class="gen-input" value="'+escAttr(f.key||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="key" style="font-family:var(--font-mono);font-size:1.05rem;"></div>';
    h += '<div class="gen-row"><label class="gen-label">Тип</label><select class="gen-select" data-action="change-field-type" data-field-id="'+f.id+'">';
    var tKeys = Object.keys(FIELD_TYPES);
    for (var tk = 0; tk < tKeys.length; tk++) {
        h += '<option value="'+tKeys[tk]+'"'+(f.type===tKeys[tk]?' selected':'')+'>'+FIELD_TYPES[tKeys[tk]].label+'</option>';
    }
    h += '</select></div></div>';

    h += '<div class="gen-row"><label class="gen-label">Инструкция</label><input type="text" class="gen-input" value="'+escAttr(f.instructions||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="instructions" placeholder="Подсказка под полем"></div>';

    h += '<div class="gen-row-inline">';
    h += '<div class="gen-row"><label class="gen-label">Ширина (%)</label><input type="text" class="gen-input" value="'+escAttr((f.wrapper&&f.wrapper.width)||'')+'" data-action="update-wrapper-width" data-field-id="'+f.id+'" placeholder="100"></div>';
    h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:20px;"><label class="gen-toggle"><input type="checkbox"'+(f.required?' checked':'')+' data-action="update-field-checkbox" data-field-id="'+f.id+'" data-key="required"><span>Обязательное</span></label></div>';
    h += '</div>';

    // Type-specific fields
    var t = f.type;

    // Text-based fields
    if (t === 'text' || t === 'number' || t === 'email' || t === 'url' || t === 'password') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Placeholder</label><input type="text" class="gen-input" value="'+escAttr(f.placeholder||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="placeholder"></div>';
        h += '<div class="gen-row"><label class="gen-label">Макс. длина</label><input type="number" class="gen-input" value="'+(f.maxlength||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="maxlength" min="0"></div>';
        h += '</div>';
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Значение по умолчанию</label><input type="text" class="gen-input" value="'+escAttr(f.default_value||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="default_value"></div>';
        h += '<div class="gen-row"><label class="gen-label">Префикс</label><input type="text" class="gen-input" value="'+escAttr(f.prepend||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="prepend"></div>';
        h += '<div class="gen-row"><label class="gen-label">Суффикс</label><input type="text" class="gen-input" value="'+escAttr(f.append||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="append"></div>';
        h += '</div>';
    }

    if (t === 'number') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Мин</label><input type="number" class="gen-input" value="'+(f.min||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="min"></div>';
        h += '<div class="gen-row"><label class="gen-label">Макс</label><input type="number" class="gen-input" value="'+(f.max||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="max"></div>';
        h += '<div class="gen-row"><label class="gen-label">Шаг</label><input type="text" class="gen-input" value="'+escAttr(f.step||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="step"></div>';
        h += '</div>';
    }

    if (t === 'textarea') {
        h += '<div class="gen-row"><label class="gen-label">Перенос строк</label><select class="gen-select" data-action="update-field" data-field-id="'+f.id+'" data-key="new_lines"><option value="br"'+(f.new_lines==='br'?' selected':'')+'>br</option><option value="wpautop"'+(f.new_lines==='wpautop'?' selected':'')+'>wpautop</option></select></div>';
        h += '<div class="gen-row"><label class="gen-label">Placeholder</label><input type="text" class="gen-input" value="'+escAttr(f.placeholder||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="placeholder"></div>';
        h += '<div class="gen-row"><label class="gen-label">Значение по умолчанию</label><textarea class="gen-textarea" data-action="update-field" data-field-id="'+f.id+'" data-key="default_value">'+escHtml(f.default_value||'')+'</textarea></div>';
    }

    if (t === 'image' || t === 'file' || t === 'gallery') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Формат возврата</label><select class="gen-select" data-action="update-field" data-field-id="'+f.id+'" data-key="return_format"><option value="array"'+(f.return_format==='array'?' selected':'')+'>Массив</option><option value="url"'+(f.return_format==='url'?' selected':'')+'>URL</option><option value="id"'+(f.return_format==='id'?' selected':'')+'>ID</option></select></div>';
        h += '<div class="gen-row"><label class="gen-label">Библиотека</label><select class="gen-select" data-action="update-field" data-field-id="'+f.id+'" data-key="library"><option value="all"'+(f.library==='all'?' selected':'')+'>Все</option><option value="uploadedTo"'+(f.library==='uploadedTo'?' selected':'')+'>К посту</option></select></div>';
        h += '</div>';
        if (t === 'file') {
            h += '<div class="gen-row"><label class="gen-label">MIME типы</label><input type="text" class="gen-input" value="'+escAttr(f.mime_types||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="mime_types" placeholder="pdf, doc, docx"></div>';
        }
        if (t === 'image' || t === 'gallery') {
            h += '<div class="gen-row-inline">';
            h += '<div class="gen-row"><label class="gen-label">Мин. ширина</label><input type="number" class="gen-input" value="'+(f.min_width||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="min_width"></div>';
            h += '<div class="gen-row"><label class="gen-label">Мин. высота</label><input type="number" class="gen-input" value="'+(f.min_height||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="min_height"></div>';
            h += '</div>';
        }
    }

    if (t === 'wysiwyg') {
        h += '<div class="gen-row"><label class="gen-label">Значение по умолчанию</label><textarea class="gen-textarea" data-action="update-field" data-field-id="'+f.id+'" data-key="default_value">'+escHtml(f.default_value||'')+'</textarea></div>';
    }

    if (t === 'oembed') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Ширина</label><input type="text" class="gen-input" value="'+escAttr(f.width||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="width"></div>';
        h += '<div class="gen-row"><label class="gen-label">Высота</label><input type="text" class="gen-input" value="'+escAttr(f.height||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="height"></div>';
        h += '</div>';
    }

    if (t === 'select' || t === 'checkbox' || t === 'radio') {
        h += '<div class="gen-row"><label class="gen-label">Варианты выбора ('+t+')</label><textarea class="gen-textarea" data-action="update-choices" data-field-id="'+f.id+'" placeholder="ключ : Метка&#10;ключ2 : Метка 2">'+choicesToText(f.choices)+'</textarea><div class="gen-hint">Формат: ключ : Метка, каждая с новой строки</div></div>';
    }

    if (t === 'select') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(f.allow_null?' checked':'')+' data-action="update-field-checkbox" data-field-id="'+f.id+'" data-key="allow_null"><span>Разрешить пустое</span></label></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(f.multiple?' checked':'')+' data-action="update-field-checkbox" data-field-id="'+f.id+'" data-key="multiple"><span>Множественный</span></label></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(f.ui?' checked':'')+' data-action="update-field-checkbox" data-field-id="'+f.id+'" data-key="ui"><span>Стилизованный</span></label></div>';
        h += '</div>';
    }

    if (t === 'true_false') {
        h += '<div class="gen-row"><label class="gen-label">Сообщение</label><input type="text" class="gen-input" value="'+escAttr(f.message||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="message" placeholder="Сообщение рядом с переключателем"></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(f.ui?' checked':'')+' data-action="update-field-checkbox" data-field-id="'+f.id+'" data-key="ui"><span>Стилизованный переключатель</span></label></div>';
    }

    if (t === 'date_picker') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Формат отображения</label><input type="text" class="gen-input" value="'+escAttr(f.display_format||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="display_format"></div>';
        h += '<div class="gen-row"><label class="gen-label">Формат возврата</label><input type="text" class="gen-input" value="'+escAttr(f.return_format_date||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="return_format_date"></div>';
        h += '</div>';
    }

    if (t === 'color_picker') {
        h += '<div class="gen-row"><label class="gen-label">Значение по умолчанию</label><input type="color" style="width:100%;height:48px;border:1px solid var(--border);border-radius:6px;background:var(--bg);cursor:pointer;" value="'+(f.default_value||'#7c3aed')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="default_value"></div>';
    }

    if (t === 'message') {
        h += '<div class="gen-row"><label class="gen-label">Сообщение</label><textarea class="gen-textarea" data-action="update-field" data-field-id="'+f.id+'" data-key="message">'+escHtml(f.message||'')+'</textarea></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(f.new_lines==='wpautop'?' checked':'')+' data-action="update-field-checkbox-wpautop" data-field-id="'+f.id+'"><span>wpautop</span></label></div>';
    }

    if (t === 'tab') {
        h += '<div class="gen-row"><label class="gen-label">Расположение</label><select class="gen-select" data-action="update-field" data-field-id="'+f.id+'" data-key="placement"><option value="top"'+(f.placement==='top'?' selected':'')+'>Сверху</option><option value="left"'+(f.placement==='left'?' selected':'')+'>Слева</option></select></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(f.endpoint?' checked':'')+' data-action="update-field-checkbox" data-field-id="'+f.id+'" data-key="endpoint"><span>Конечная точка (закрыть табы)</span></label></div>';
    }

    if (t === 'link') {
        h += '<div class="gen-row"><label class="gen-label">Формат возврата</label><select class="gen-select" data-action="update-field" data-field-id="'+f.id+'" data-key="return_format"><option value="array"'+(f.return_format==='array'?' selected':'')+'>Массив</option><option value="url"'+(f.return_format==='url'?' selected':'')+'>URL</option></select></div>';
    }

    if (t === 'post_object' || t === 'relationship') {
        h += '<div class="gen-row"><label class="gen-label">Тип записи</label><input type="text" class="gen-input" value="'+escAttr(Array.isArray(f.post_type)?f.post_type.join(', '):f.post_type)+'" data-action="update-field-post-type" data-field-id="'+f.id+'" placeholder="post, page"></div>';
        if (t === 'relationship') {
            h += '<div class="gen-row-inline">';
            h += '<div class="gen-row"><label class="gen-label">Мин. записей</label><input type="number" class="gen-input" value="'+(f.min_posts||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="min_posts"></div>';
            h += '<div class="gen-row"><label class="gen-label">Макс. записей</label><input type="number" class="gen-input" value="'+(f.max_posts||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="max_posts"></div>';
            h += '</div>';
        }
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(f.allow_null?' checked':'')+' data-action="update-field-checkbox" data-field-id="'+f.id+'" data-key="allow_null"><span>Разрешить пустое</span></label></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(f.multiple?' checked':'')+' data-action="update-field-checkbox" data-field-id="'+f.id+'" data-key="multiple"><span>Множественный</span></label></div>';
        h += '</div>';
    }

    // Structure fields
    if (t === 'repeater') {
        h += '<div class="gen-divider"></div>';
        h += '<div style="font-weight:600;margin-bottom:14px;">🔁 Настройки Repeater</div>';
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Текст кнопки</label><input type="text" class="gen-input" value="'+escAttr(f.button_label||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="button_label"></div>';
        h += '<div class="gen-row"><label class="gen-label">Раскладка</label><select class="gen-select" data-action="update-field" data-field-id="'+f.id+'" data-key="layout"><option value="table"'+(f.layout==='table'?' selected':'')+'>Таблица</option><option value="block"'+(f.layout==='block'?' selected':'')+'>Блок</option><option value="row"'+(f.layout==='row'?' selected':'')+'>Строка</option></select></div>';
        h += '</div>';
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Мин. строк</label><input type="number" class="gen-input" value="'+(f.min||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="min"></div>';
        h += '<div class="gen-row"><label class="gen-label">Макс. строк</label><input type="number" class="gen-input" value="'+(f.max||'')+'" data-action="update-field" data-field-id="'+f.id+'" data-key="max"></div>';
        h += '</div>';
        h += renderSubFieldsSection(f, 'repeater');
    }

    if (t === 'group') {
        h += '<div class="gen-divider"></div>';
        h += '<div style="font-weight:600;margin-bottom:14px;">📦 Поля группы</div>';
        h += renderSubFieldsSection(f, 'group');
    }

    if (t === 'flexible_content') {
        h += '<div class="gen-divider"></div>';
        h += '<div style="font-weight:600;margin-bottom:14px;">🧩 Макеты (Layouts)</div>';
        h += renderFlexLayoutsSection(f);
    }

    return h;
}

// Choices helpers
function choicesToText(choices) {
    if (!choices || Object.keys(choices).length === 0) return '';
    var lines = [];
    var keys = Object.keys(choices);
    for (var i = 0; i < keys.length; i++) {
        lines.push(keys[i] + ' : ' + choices[keys[i]]);
    }
    return lines.join('\n');
}

function updateChoices(id, text) {
    var f = getFieldById(id);
    if (!f) return;
    var choices = {};
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;
        var sep = line.indexOf(':');
        if (sep === -1) continue;
        var key = line.substring(0, sep).trim();
        var val = line.substring(sep + 1).trim();
        if (key) choices[key] = val;
    }
    f.choices = choices;
    liveUpdate();
}

// Sub-fields section renderer
function renderSubFieldsSection(f, parentType) {
    var h = '';
    h += '<div class="sub-fields-section">';
    h += '<div class="sub-title">Подполя</div>';
    if (f.sub_fields && f.sub_fields.length > 0) {
        for (var si = 0; si < f.sub_fields.length; si++) {
            var sf = f.sub_fields[si];
            h += '<div class="sub-field-row">';
            h += '<span class="sf-type"><span class="material-symbols-outlined">' + (FIELD_TYPES[sf.type] ? FIELD_TYPES[sf.type].icon : 'text_fields') + '</span></span>';
            h += '<input type="text" value="'+escAttr(sf.label||'')+'" data-action="update-sub-field" data-parent-id="'+f.id+'" data-sub-id="'+sf.id+'" data-key="label" placeholder="Название">';
            h += '<input type="text" class="sf-name-input" value="'+escAttr(sf.name||'')+'" data-action="update-sub-field" data-parent-id="'+f.id+'" data-sub-id="'+sf.id+'" data-key="name" placeholder="field_name">';
            h += '<button class="gen-btn-icon" data-action="remove-sub-field" data-parent-id="'+f.id+'" data-sub-id="'+sf.id+'" style="color:#f87171;width:40px;height:40px;font-size:0.95rem;"><span class="material-symbols-outlined">close</span></button>';
            h += '</div>';
        }
    }
    h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">';
    var subTypes = ['text','textarea','number','email','url','image','wysiwyg','true_false','select','date_picker','color_picker'];
    for (var st = 0; st < subTypes.length; st++) {
        var stKey = subTypes[st];
        h += '<button class="gen-btn gen-btn-sm gen-btn-outline" data-action="add-sub-field" data-parent-id="'+f.id+'" data-field-type="'+stKey+'" style="font-size:1.05rem;padding:8px 14px;">+<span class="material-symbols-outlined" style="font-size:1.4rem;">' + (FIELD_TYPES[stKey] ? FIELD_TYPES[stKey].icon : 'text_fields') + '</span> ' + (FIELD_TYPES[stKey] ? FIELD_TYPES[stKey].label : stKey) + '</button>';
    }
    h += '</div>';
    h += '</div>';
    return h;
}

// Flexible layouts section renderer
function renderFlexLayoutsSection(f) {
    var h = '';
    if (f.layouts && f.layouts.length > 0) {
        for (var li = 0; li < f.layouts.length; li++) {
            var layout = f.layouts[li];
            h += '<div class="layout-card' + (layout._open ? ' open' : '') + '">';
            h += '<div class="layout-card-header" data-action="toggle-layout" data-parent-id="'+f.id+'" data-layout-idx="'+li+'">';
            h += '<span class="lay-name">' + escHtml(layout.label || layout.name) + '</span>';
            h += '<button class="gen-btn-icon" data-action="remove-flex-layout" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" style="color:#f87171;width:40px;height:40px;font-size:0.95rem;"><span class="material-symbols-outlined">close</span></button>';
            h += '</div>';
            h += '<div class="layout-card-body">';
            h += '<div class="gen-row-inline" style="margin-bottom:14px;">';
            h += '<div class="gen-row"><label class="gen-label">Название</label><input type="text" class="gen-input" value="'+escAttr(layout.label||'')+'" data-action="update-layout-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-key="label"></div>';
            h += '<div class="gen-row"><label class="gen-label">Имя поля</label><input type="text" class="gen-input" value="'+escAttr(layout.name||'')+'" data-action="update-layout-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-key="name" style="font-family:var(--font-mono);font-size:1.05rem;"></div>';
            h += '</div>';
            // Sub-fields inside layout
            if (layout.sub_fields && layout.sub_fields.length > 0) {
                for (var lsi = 0; lsi < layout.sub_fields.length; lsi++) {
                    var lsf = layout.sub_fields[lsi];
                    h += '<div class="sub-field-row">';
                    h += '<span class="sf-type"><span class="material-symbols-outlined">' + (FIELD_TYPES[lsf.type] ? FIELD_TYPES[lsf.type].icon : 'text_fields') + '</span></span>';
                    h += '<input type="text" value="'+escAttr(lsf.label||'')+'" data-action="update-layout-sub-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-sub-id="'+lsf.id+'" data-key="label" placeholder="Название">';
                    h += '<input type="text" class="sf-name-input" value="'+escAttr(lsf.name||'')+'" data-action="update-layout-sub-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-sub-id="'+lsf.id+'" data-key="name" placeholder="field_name">';
                    h += '<button class="gen-btn-icon" data-action="remove-layout-sub-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-sub-id="'+lsf.id+'" style="color:#f87171;width:40px;height:40px;font-size:0.95rem;"><span class="material-symbols-outlined">close</span></button>';
                    h += '</div>';
                }
            }
            h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">';
            var subTypes2 = ['text','textarea','number','email','url','image','wysiwyg','true_false','select'];
            for (var st2 = 0; st2 < subTypes2.length; st2++) {
                var stKey2 = subTypes2[st2];
                h += '<button class="gen-btn gen-btn-sm gen-btn-outline" data-action="add-layout-sub-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-field-type="'+stKey2+'" style="font-size:1.05rem;padding:8px 14px;">+<span class="material-symbols-outlined" style="font-size:1.4rem;">' + (FIELD_TYPES[stKey2] ? FIELD_TYPES[stKey2].icon : 'text_fields') + '</span> ' + (FIELD_TYPES[stKey2] ? FIELD_TYPES[stKey2].label : stKey2) + '</button>';
            }
            h += '</div>';
            h += '</div>';
            h += '</div>';
        }
    }
    h += '<button class="gen-btn gen-btn-sm gen-btn-accent" data-action="add-flex-layout" data-parent-id="'+f.id+'" style="margin-top:12px;">+ Добавить макет</button>';
    return h;
}

// ==================== SELECT UPGRADE ====================
function upgradeSelects(container) {
    var selects = container.querySelectorAll('select.gen-select:not([data-custom-select])');
    for (var i = 0; i < selects.length; i++) {
        if (!selects[i]._customSelect && !selects[i].closest('.cs-wrap')) {
            selects[i]._customSelect = CustomSelect.create(selects[i], { searchable: true });
            selects[i].setAttribute('data-custom-select', '1');
        }
    }
}

function upgradeLocationSelects() {
    var container = document.getElementById('location-rules');
    if (!container) return;
    upgradeSelects(container);
}

// ==================== LIVE UPDATE ====================
function liveUpdate() {
    if (currentCodeTab === 'json') {
        generateJSON();
    } else {
        generatePHP();
    }
}

// ==================== CODE GENERATION ====================
var currentCodeTab = 'php';

function switchCodeTab(tab) {
    currentCodeTab = tab;
    // Update active tab buttons
    var tabs = document.querySelectorAll('.code-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tab);
    }
    liveUpdate();
}

function buildACFConfig() {
    return {
        key: document.getElementById('group-key').value || 'group_untitled',
        title: document.getElementById('group-title').value || 'Untitled',
        description: document.getElementById('group-desc').value || '',
        style: document.getElementById('group-style').value || 'default',
        position: document.getElementById('group-position').value || 'normal',
        active: document.getElementById('group-active').checked,
        fields: fields
    };
}

function generateJSON() {
    var config = buildACFConfig();

    function cleanField(f) {
        var c = {};
        var fieldKeys = ['key','label','name','type','instructions','required','default_value','placeholder','maxlength','prepend','append','new_lines','return_format','library','min_width','min_height','mime_types','width','height','choices','message','placement','endpoint','allow_null','multiple','ui','display_format','return_format_date','min','max','step','button_label','layout','post_type','min_posts','max_posts'];
        for (var k = 0; k < fieldKeys.length; k++) {
            var fk = fieldKeys[k];
            if (f[fk] !== undefined && f[fk] !== '' && f[fk] !== 0 && f[fk] !== null && !(Array.isArray(f[fk]) && f[fk].length === 0) && !(typeof f[fk] === 'object' && !Array.isArray(f[fk]) && Object.keys(f[fk]).length === 0)) {
                c[fk] = f[fk];
            }
        }
        if (c.return_format_date && f.type === 'date_picker') {
            c.return_format = c.return_format_date;
            delete c.return_format_date;
        }
        if (f.wrapper && (f.wrapper.width || f.wrapper.class || f.wrapper.id)) {
            c.wrapper = {};
            if (f.wrapper.width) c.wrapper.width = f.wrapper.width;
            if (f.wrapper.class) c.wrapper.class = f.wrapper.class;
            if (f.wrapper.id) c.wrapper.id = f.wrapper.id;
        }
        if (f.sub_fields && f.sub_fields.length > 0) {
            c.sub_fields = [];
            for (var i = 0; i < f.sub_fields.length; i++) {
                c.sub_fields.push(cleanField(f.sub_fields[i]));
            }
        }
        if (f.layouts && f.layouts.length > 0) {
            c.layouts = {};
            for (var i = 0; i < f.layouts.length; i++) {
                var lay = f.layouts[i];
                var lc = { key: 'layout_' + (i+1), name: lay.name, label: lay.label };
                if (lay.sub_fields && lay.sub_fields.length > 0) {
                    lc.sub_fields = [];
                    for (var j = 0; j < lay.sub_fields.length; j++) {
                        lc.sub_fields.push(cleanField(lay.sub_fields[j]));
                    }
                }
                c.layouts[lay.name] = lc;
            }
        }
        return c;
    }

    var json = {
        key: config.key,
        title: config.title,
        fields: [],
        location: [locationRules],
        menu_order: 0,
        position: config.position || 'normal',
        style: config.style || 'default',
        label_placement: 'top',
        instruction_placement: 'label',
        hide_on_screen: '',
        active: config.active ? 1 : 0
    };

    if (config.description) json.description = config.description;

    for (var i = 0; i < config.fields.length; i++) {
        json.fields.push(cleanField(config.fields[i]));
    }

    document.getElementById('code-output').textContent = JSON.stringify(json, null, 2);
}

// ==================== GENERATE PHP REGISTER ====================
function generatePHP() {
    var config = buildACFConfig();

    function fieldPHPArray(f, indent) {
        var lines = [];
        lines.push(indent + "'key' => '" + escPHPSingle(f.key || '') + "',");
        lines.push(indent + "'label' => '" + escPHPSingle(f.label || '') + "',");
        lines.push(indent + "'name' => '" + escPHPSingle(f.name || '') + "',");
        lines.push(indent + "'type' => '" + escPHPSingle(f.type || '') + "',");
        if (f.instructions) lines.push(indent + "'instructions' => '" + escPHPSingle(f.instructions) + "',");
        if (f.required) lines.push(indent + "'required' => 1,");
        if (f.default_value) lines.push(indent + "'default_value' => '" + escPHPSingle(f.default_value) + "',");
        if (f.placeholder) lines.push(indent + "'placeholder' => '" + escPHPSingle(f.placeholder) + "',");
        if (f.maxlength) lines.push(indent + "'maxlength' => '" + escPHPSingle(f.maxlength) + "',");
        if (f.prepend) lines.push(indent + "'prepend' => '" + escPHPSingle(f.prepend) + "',");
        if (f.append) lines.push(indent + "'append' => '" + escPHPSingle(f.append) + "',");
        if (f.new_lines) lines.push(indent + "'new_lines' => '" + escPHPSingle(f.new_lines) + "',");
        if (f.return_format) lines.push(indent + "'return_format' => '" + escPHPSingle(f.return_format) + "',");
        if (f.library && f.library !== 'all') lines.push(indent + "'library' => '" + escPHPSingle(f.library) + "',");
        if (f.min_width) lines.push(indent + "'min_width' => " + f.min_width + ",");
        if (f.min_height) lines.push(indent + "'min_height' => " + f.min_height + ",");
        if (f.mime_types) lines.push(indent + "'mime_types' => '" + escPHPSingle(f.mime_types) + "',");
        if (f.display_format) lines.push(indent + "'display_format' => '" + escPHPSingle(f.display_format) + "',");
        if (f.return_format_date) lines.push(indent + "'return_format' => '" + escPHPSingle(f.return_format_date) + "',");
        if (f.message) lines.push(indent + "'message' => '" + escPHPSingle(f.message) + "',");
        if (f.placement && f.placement !== 'top') lines.push(indent + "'placement' => '" + escPHPSingle(f.placement) + "',");
        if (f.endpoint) lines.push(indent + "'endpoint' => 1,");
        if (f.allow_null) lines.push(indent + "'allow_null' => 1,");
        if (f.multiple) lines.push(indent + "'multiple' => 1,");
        if (f.ui) lines.push(indent + "'ui' => 1,");

        if (f.wrapper && f.wrapper.width) {
            lines.push(indent + "'wrapper' => [");
            lines.push(indent + "    'width' => '" + escPHPSingle(f.wrapper.width) + "',");
            lines.push(indent + "],");
        }

        if (f.choices && Object.keys(f.choices).length > 0) {
            lines.push(indent + "'choices' => [");
            var ck = Object.keys(f.choices);
            for (var ci = 0; ci < ck.length; ci++) {
                lines.push(indent + "    '" + escPHPSingle(ck[ci]) + "' => '" + escPHPSingle(f.choices[ck[ci]]) + "',");
            }
            lines.push(indent + "],");
        }

        if (f.post_type) {
            var pt = Array.isArray(f.post_type) ? f.post_type : [f.post_type];
            lines.push(indent + "'post_type' => [" + pt.map(function(s){return "'" + escPHPSingle(s.trim()) + "'";}).join(', ') + "],");
        }

        if (f.type === 'repeater') {
            lines.push(indent + "'button_label' => '" + escPHPSingle(f.button_label || 'Добавить строку') + "',");
            if (f.min) lines.push(indent + "'min' => " + f.min + ",");
            if (f.max) lines.push(indent + "'max' => " + f.max + ",");
            lines.push(indent + "'layout' => '" + escPHPSingle(f.layout || 'table') + "',");
            if (f.sub_fields && f.sub_fields.length > 0) {
                lines.push(indent + "'sub_fields' => [");
                for (var si = 0; si < f.sub_fields.length; si++) {
                    lines.push(indent + "    [");
                    lines.push(fieldPHPArray(f.sub_fields[si], indent + '        '));
                    lines.push(indent + "    ],");
                }
                lines.push(indent + "],");
            }
        }
        if (f.type === 'group') {
            if (f.sub_fields && f.sub_fields.length > 0) {
                lines.push(indent + "'sub_fields' => [");
                for (var gi = 0; gi < f.sub_fields.length; gi++) {
                    lines.push(indent + "    [");
                    lines.push(fieldPHPArray(f.sub_fields[gi], indent + '        '));
                    lines.push(indent + "    ],");
                }
                lines.push(indent + "],");
            }
        }
        if (f.type === 'flexible_content') {
            if (f.layouts && f.layouts.length > 0) {
                lines.push(indent + "'layouts' => [");
                for (var li = 0; li < f.layouts.length; li++) {
                    var lay = f.layouts[li];
                    lines.push(indent + "    '" + escPHPSingle(lay.name) + "' => [");
                    lines.push(indent + "        'key' => 'layout_" + (li+1) + "',");
                    lines.push(indent + "        'name' => '" + escPHPSingle(lay.name) + "',");
                    lines.push(indent + "        'label' => '" + escPHPSingle(lay.label) + "',");
                    if (lay.sub_fields && lay.sub_fields.length > 0) {
                        lines.push(indent + "        'sub_fields' => [");
                        for (var lsi = 0; lsi < lay.sub_fields.length; lsi++) {
                            lines.push(indent + "            [");
                            lines.push(fieldPHPArray(lay.sub_fields[lsi], indent + '                '));
                            lines.push(indent + "            ],");
                        }
                        lines.push(indent + "        ],");
                    }
                    lines.push(indent + "    ],");
                }
                lines.push(indent + "],");
            }
        }
        return lines.join('\n');
    }

    var out = [];
    out.push("<?php");
    out.push("/**");
    out.push(" * ACF Field Group: " + escPHPSingle(config.title));
    out.push(" * Generated by ACF Generator");
    out.push(" */");
    out.push("");
    out.push("if ( function_exists('acf_add_local_field_group') ) :");
    out.push("");
    out.push("acf_add_local_field_group( array(");
    out.push("    'key'    => '" + escPHPSingle(config.key) + "',");
    out.push("    'title'  => '" + escPHPSingle(config.title) + "',");
    if (config.description) out.push("    'description' => '" + escPHPSingle(config.description) + "',");
    out.push("    'fields' => array(");

    for (var i = 0; i < config.fields.length; i++) {
        out.push("        array(");
        out.push(fieldPHPArray(config.fields[i], '            '));
        out.push("        ),");
    }

    out.push("    ),");
    out.push("    'location' => array(");
    out.push("        array(");
    for (var li = 0; li < locationRules.length; li++) {
        var r = locationRules[li];
        out.push("            array(");
        out.push("                'param'    => '" + escPHPSingle(r.param) + "',");
        out.push("                'operator' => '" + escPHPSingle(r.operator) + "',");
        out.push("                'value'    => '" + escPHPSingle(r.value) + "',");
        out.push("            ),");
    }
    out.push("        ),");
    out.push("    ),");
    out.push("    'menu_order' => 0,");
    out.push("    'position' => '" + escPHPSingle(config.position || 'normal') + "',");
    out.push("    'style' => '" + escPHPSingle(config.style || 'default') + "',");
    out.push("    'label_placement' => 'top',");
    out.push("    'instruction_placement' => 'label',");
    out.push("    'hide_on_screen' => '',");
    out.push("    'active' => " + (config.active ? 'true' : 'false') + ",");
    out.push("));");
    out.push("");
    out.push("endif;");

    document.getElementById('code-output').textContent = out.join('\n');
}

// ==================== COPY / DOWNLOAD ====================
function copyCode() {
    var code = document.getElementById('code-output').textContent;
    if (!code || code === 'Добавьте поля — код появится здесь') {
        showToast('Добавьте поля для генерации кода', true);
        return;
    }
    navigator.clipboard.writeText(code).then(function() {
        showToast('Код скопирован в буфер обмена');
    }).catch(function() {
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Код скопирован в буфер обмена');
    });
}

function downloadCode() {
    var code = document.getElementById('code-output').textContent;
    if (!code || code === 'Добавьте поля — код появится здесь') {
        showToast('Добавьте поля для генерации кода', true);
        return;
    }
    var ext = currentCodeTab === 'json' ? 'json' : 'php';
    var filename = (document.getElementById('group-key').value || 'acf-export') + '.' + ext;
    var blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
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
    toast._timeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 2500);
}

// ==================== RESET ====================
function resetAll(silent) {
    fields = [];
    fieldIdCounter = 0;
    selectedFieldId = null;
    locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
    document.getElementById('group-title').value = 'Hero Section';
    document.getElementById('group-key').value = 'group_hero_section';
    document.getElementById('group-desc').value = '';
    renderAll();
    liveUpdate();
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
            resetAll(true);
            document.getElementById('group-title').value = json.title || '';
            document.getElementById('group-key').value = json.key || '';
            document.getElementById('group-desc').value = json.description || '';
            document.getElementById('group-style').value = json.style || 'default';
            document.getElementById('group-position').value = json.position || 'normal';
            document.getElementById('group-active').checked = json.active !== 0;
            locationRules = (json.location && json.location[0]) ? json.location[0] : locationRules;
            fieldIdCounter = 0;

            function importFields(arr) {
                var result = [];
                for (var i = 0; i < arr.length; i++) {
                    var f = arr[i];
                    var id = ++fieldIdCounter;
                    var d = fieldDefaults(f.type || 'text');
                    d.id = id;
                    for (var k in f) {
                        if (k !== 'id') d[k] = f[k];
                    }
                    d.key = d.key || 'field_' + id;
                    if (f.sub_fields) d.sub_fields = importFields(f.sub_fields);
                    if (f.layouts) {
                        d.layouts = [];
                        var lk = Object.keys(f.layouts);
                        for (var li = 0; li < lk.length; li++) {
                            var lay = f.layouts[lk[li]];
                            if (lay.sub_fields) lay.sub_fields = importFields(lay.sub_fields);
                            d.layouts.push(lay);
                        }
                    }
                    result.push(d);
                }
                return result;
            }

            if (json.fields) fields = importFields(json.fields);

            renderAll();
            liveUpdate();
            showToast('Импортировано: ' + fields.length + ' полей');
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

    function mkField(type, label, name, instructions, extra) {
        var id = ++fieldIdCounter;
        var d = fieldDefaults(type);
        d.id = id; d.key = 'field_' + id; d.label = label; d.name = name; d.instructions = instructions || '';
        if (extra) for (var k in extra) d[k] = extra[k];
        return d;
    }

    function mkSubField(type, label, name, extra) {
        var id = ++fieldIdCounter;
        var d = subFieldDefaults(type);
        d.id = id; d.key = 'field_' + id; d.label = label; d.name = name;
        if (extra) for (var k in extra) d[k] = extra[k];
        return d;
    }

    function mkStruct(type, label, name, instructions, subFields, extra) {
        var id = ++fieldIdCounter;
        var d = fieldDefaults(type);
        d.id = id; d.key = 'field_' + id; d.label = label; d.name = name; d.instructions = instructions || '';
        d.sub_fields = subFields || [];
        if (extra) for (var k in extra) d[k] = extra[k];
        return d;
    }

    function mkFlexible(name, label, instructions, layouts) {
        var id = ++fieldIdCounter;
        var d = fieldDefaults('flexible_content');
        d.id = id; d.key = 'field_' + id; d.label = label; d.name = name; d.instructions = instructions || '';
        d.layouts = layouts || [];
        return d;
    }

    if (name === 'hero') {
        document.getElementById('group-title').value = 'Hero Section';
        document.getElementById('group-key').value = 'group_hero_section';
        document.getElementById('group-desc').value = 'Поля для главного экрана';
        locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
        fields = [
            mkField('text','Заголовок','hero_title','Поле для главного заголовка'),
            mkField('textarea','Подзаголовок','hero_subtitle','Краткое описание под заголовком',{new_lines:'br'}),
            mkField('image','Фоновое изображение','hero_bg','Фон hero-секции'),
            mkField('link','Кнопка','hero_button','Текст и ссылка кнопки'),
            mkField('text','Текст кнопки','hero_btn_text','Текст на кнопке',{default_value:'Подробнее'})
        ];
    } else if (name === 'team') {
        document.getElementById('group-title').value = 'Team Members';
        document.getElementById('group-key').value = 'group_team_members';
        document.getElementById('group-desc').value = 'Поля для команды';
        locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
        var teamSubs = [
            mkSubField('image','Фото','team_photo'),
            mkSubField('text','Имя','team_name'),
            mkSubField('text','Должность','team_role'),
            mkSubField('textarea','Био','team_bio'),
            mkSubField('url','LinkedIn','team_linkedin')
        ];
        fields = [
            mkStruct('repeater','Участники','team_members','Добавьте членов команды',teamSubs,{button_label:'Добавить участника',min:0,max:50})
        ];
    } else if (name === 'testimonials') {
        document.getElementById('group-title').value = 'Testimonials';
        document.getElementById('group-key').value = 'group_testimonials';
        document.getElementById('group-desc').value = 'Отзывы клиентов';
        locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
        var tSubs = [
            mkSubField('textarea','Текст отзыва','testimonial_text'),
            mkSubField('text','Имя','testimonial_name'),
            mkSubField('text','Компания / Должность','testimonial_title'),
            mkSubField('image','Аватар','testimonial_avatar')
        ];
        fields = [
            mkStruct('repeater','Отзывы','testimonials','Добавьте отзывы',tSubs,{button_label:'Добавить отзыв',min:0,max:100})
        ];
    } else if (name === 'seo') {
        document.getElementById('group-title').value = 'SEO Fields';
        document.getElementById('group-key').value = 'group_seo_fields';
        document.getElementById('group-desc').value = 'SEO-оптимизация';
        locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
        fields = [
            mkField('tab','SEO','tab_seo',''),
            mkField('text','Meta Title','meta_title','SEO-заголовок (60-70 символов)',{maxlength:'70'}),
            mkField('textarea','Meta Description','meta_description','SEO-описание (150-160 символов)',{maxlength:'160'}),
            mkField('image','OG Image','og_image','1200×630',{return_format:'url'}),
            mkField('true_false','Noindex','noindex','Закрыть от индексации',{message:'Скрыть от поисковиков'}),
            mkField('url','Canonical URL','canonical_url','',{placeholder:'https://'}),
            mkField('tab','END','tab_end','',{endpoint:1})
        ];
    } else if (name === 'flexible_page') {
        document.getElementById('group-title').value = 'Page Builder';
        document.getElementById('group-key').value = 'group_page_builder';
        document.getElementById('group-desc').value = 'Гибкий конструктор страницы';
        locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
        var lay1Subs = [
            mkSubField('text','Заголовок','text_title'),
            mkSubField('wysiwyg','Текст','text_content')
        ];
        var lay2Subs = [
            mkSubField('image','Изображение','banner_image'),
            mkSubField('url','Ссылка','banner_url'),
            mkSubField('text','Текст кнопки','banner_cta')
        ];
        var lay3Subs = [
            mkSubField('gallery','Изображения','gallery_images',{return_format:'array'})
        ];
        fields = [
            mkFlexible('page_blocks','Блоки страницы','Добавьте блоки на страницу',[
                {name:'text_block',label:'Текстовый блок',sub_fields:lay1Subs},
                {name:'banner',label:'Баннер',sub_fields:lay2Subs},
                {name:'gallery',label:'Галерея',sub_fields:lay3Subs}
            ])
        ];
    }
    renderAll();
    liveUpdate();
    showToast('Шаблон «' + document.getElementById('group-title').value + '» загружен');
}

// ==================== EVENT DELEGATION ====================
document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    // Prevent event bubbling for actions inside field-card-actions (to not trigger select-field)
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
        case 'add-location-rule':
            addLocationRule();
            break;
        case 'switch-tab':
            switchCodeTab(el.getAttribute('data-tab'));
            break;
        case 'copy-code':
            copyCode();
            break;
        case 'download-code':
            downloadCode();
            break;
        case 'load-template':
            loadTemplate(el.getAttribute('data-template'));
            break;
        case 'select-field':
            selectField(parseInt(el.getAttribute('data-field-id')));
            break;
        case 'move-field':
            moveField(parseInt(el.getAttribute('data-field-id')), parseInt(el.getAttribute('data-dir')));
            break;
        case 'duplicate-field':
            duplicateField(parseInt(el.getAttribute('data-field-id')));
            break;
        case 'remove-field':
            removeField(parseInt(el.getAttribute('data-field-id')));
            break;
        case 'remove-location-rule':
            removeLocationRule(parseInt(el.getAttribute('data-index')));
            break;
        case 'add-sub-field':
            addSubField(parseInt(el.getAttribute('data-parent-id')), el.getAttribute('data-field-type'));
            break;
        case 'remove-sub-field':
            removeSubField(parseInt(el.getAttribute('data-parent-id')), parseInt(el.getAttribute('data-sub-id')));
            break;
        case 'add-flex-layout':
            addFlexLayout(parseInt(el.getAttribute('data-parent-id')));
            break;
        case 'remove-flex-layout':
            removeFlexLayout(parseInt(el.getAttribute('data-parent-id')), parseInt(el.getAttribute('data-layout-idx')));
            break;
        case 'add-layout-sub-field':
            addSubFieldToLayout(parseInt(el.getAttribute('data-parent-id')), parseInt(el.getAttribute('data-layout-idx')), el.getAttribute('data-field-type'));
            break;
        case 'remove-layout-sub-field':
            removeSubFieldFromLayout(parseInt(el.getAttribute('data-parent-id')), parseInt(el.getAttribute('data-layout-idx')), parseInt(el.getAttribute('data-sub-id')));
            break;
        case 'toggle-layout':
            var li = parseInt(el.getAttribute('data-layout-idx'));
            var pf = getFieldById(parseInt(el.getAttribute('data-parent-id')));
            if (pf && pf.layouts && pf.layouts[li]) {
                pf.layouts[li]._open = !pf.layouts[li]._open;
                renderAll();
            }
            break;
    }
});

document.addEventListener('change', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    switch (action) {
        case 'update-field-checkbox':
            updateField(parseInt(el.getAttribute('data-field-id')), el.getAttribute('data-key'), el.checked);
            break;
        case 'update-field-checkbox-wpautop':
            updateField(parseInt(el.getAttribute('data-field-id')), 'new_lines', el.checked ? 'wpautop' : '');
            break;
        case 'change-field-type':
            changeFieldType(parseInt(el.getAttribute('data-field-id')), el.value);
            break;
        case 'update-field':
            // For <select> elements with data-key
            updateField(parseInt(el.getAttribute('data-field-id')), el.getAttribute('data-key'), el.value);
            break;
        case 'location-param':
            var i = parseInt(el.getAttribute('data-index'));
            locationRules[i].param = el.value;
            liveUpdate();
            break;
        case 'location-operator':
            var i2 = parseInt(el.getAttribute('data-index'));
            locationRules[i2].operator = el.value;
            liveUpdate();
            break;
        case 'live-update':
            liveUpdate();
            break;
    }
});

document.addEventListener('input', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');

    switch (action) {
        case 'update-field':
            updateField(parseInt(el.getAttribute('data-field-id')), el.getAttribute('data-key'), el.value);
            break;
        case 'update-field-label':
            updateField(parseInt(el.getAttribute('data-field-id')), 'label', el.value);
            renderFields();
            break;
        case 'update-wrapper-width':
            updateWrapperWidth(parseInt(el.getAttribute('data-field-id')), el.value);
            break;
        case 'update-choices':
            updateChoices(parseInt(el.getAttribute('data-field-id')), el.value);
            break;
        case 'update-field-post-type':
            updateField(parseInt(el.getAttribute('data-field-id')), 'post_type', el.value.split(',').map(function(s){return s.trim();}));
            break;
        case 'update-sub-field':
            updateSubField(parseInt(el.getAttribute('data-parent-id')), parseInt(el.getAttribute('data-sub-id')), el.getAttribute('data-key'), el.value);
            break;
        case 'update-layout-field':
            updateFlexLayout(parseInt(el.getAttribute('data-parent-id')), parseInt(el.getAttribute('data-layout-idx')), el.getAttribute('data-key'), el.value);
            break;
        case 'update-layout-sub-field':
            updateSubFieldInLayout(parseInt(el.getAttribute('data-parent-id')), parseInt(el.getAttribute('data-layout-idx')), parseInt(el.getAttribute('data-sub-id')), el.getAttribute('data-key'), el.value);
            break;
        case 'location-value':
            var i = parseInt(el.getAttribute('data-index'));
            locationRules[i].value = el.value;
            liveUpdate();
            break;
        case 'live-update':
            liveUpdate();
            break;
    }
});

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', function() {
    // Set up JSON import file input listener
    var jsonImport = document.getElementById('json-import-input');
    if (jsonImport) {
        jsonImport.addEventListener('change', importFromJSON);
    }

    // Set up live-update listeners for group settings
    ['group-title', 'group-key', 'group-desc'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', liveUpdate);
    });
    ['group-style', 'group-position'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('change', liveUpdate);
    });
    var groupActive = document.getElementById('group-active');
    if (groupActive) groupActive.addEventListener('change', liveUpdate);

    renderAll();
    liveUpdate();

    // Upgrade native selects on page load
    setTimeout(function() {
        var staticSelects = document.querySelectorAll('#group-style, #group-position');
        for (var i = 0; i < staticSelects.length; i++) {
            if (!staticSelects[i]._customSelect && !staticSelects[i].closest('.cs-wrap')) {
                staticSelects[i]._customSelect = CustomSelect.create(staticSelects[i], { searchable: true });
            }
        }
    }, 100);
});
