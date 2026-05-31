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
        var rect = this._trigger.getBoundingClientRect();
        document.body.appendChild(this._dropdown);
        this._dropdown.style.position = 'fixed';
        this._dropdown.style.top = (rect.bottom + 4) + 'px';
        this._dropdown.style.left = rect.left + 'px';
        this._dropdown.style.width = rect.width + 'px';
        this._dropdown.style.zIndex = '10000';
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
        if (this._dropdown.parentNode !== this._wrap) {
            this._wrap.appendChild(this._dropdown);
            this._dropdown.style.position = '';
            this._dropdown.style.top = '';
            this._dropdown.style.left = '';
            this._dropdown.style.width = '';
            this._dropdown.style.zIndex = '';
        }
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

    document.addEventListener('scroll', function(e) {
        if (activeInstance && e.target && e.target.closest && e.target.closest('.gen-panel-body')) {
            activeInstance._close();
        }
    }, true);

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

// Style state (for preview + generated HTML)
function getDefaultElementStyles() {
    return {
        title: { color: '#1a1a2e', fontSize: '22', marginBottom: '24' },
        label: { color: '#6b7280', fontSize: '11', marginBottom: '6' },
        value: { color: '#1f2937', bgColor: '#f8f9fa', padding: '20', radius: '12' },
        button: { color: '#ffffff', bgColor: '#6366f1', padding: '12', radius: '8' },
        media: { bgColor: '#c7d2fe', radius: '8' },
        repeater: { gap: '14', avatarBg: '#c7d2fe' },
        faq: { questionBg: '#f8f9fa', answerColor: '#4b5563' },
        flex: { accentColor: '#6366f1', bgColor: 'rgba(99,102,241,0.04)' }
    };
}

var blockStyles = {
    bgColor: '#ffffff',
    textColor: '#1a1a2e',
    padding: '24',
    gap: '16',
    cardBg: '#f8f9fa',
    cardPadding: '20',
    cardRadius: '12',
    borderColor: '#e0e0e0',
    borderWidth: '1',
    elements: getDefaultElementStyles()
};
var styleEditorCollapsed = false;
var previewModeActive = false;
var selectedStyleTarget = null;

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
        readonly: 0,
        disabled: 0,
        choices: {},
        return_format: (type === 'image' || type === 'file' || type === 'gallery') ? 'array' : (type === 'post_object' || type === 'relationship') ? 'object' : '',
        library: 'all',
        new_lines: (type === 'textarea') ? 'br' : '',
        min: 0, max: 0, step: '',
        min_width: '', min_height: '', max_width: '', max_height: '',
        mime_types: '',
        min_size: '', max_size: '',
        width: '', height: '',
        message: '',
        esc_html: 0,
        display_format: 'd/m/Y',
        return_format_date: 'd/m/Y',
        placement: 'top',
        endpoint: 0,
        sub_fields: [],
        layouts: [],
        button_label: 'Добавить строку',
        layout: 'table',
        post_type: ['post'],
        taxonomy: '',
        filters: ['search', 'post_type', 'taxonomy'],
        elements: [],
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

function findFieldInTree(id) {
    function search(arr) {
        if (!arr) return null;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].id === id) return arr[i];
            if (arr[i].sub_fields) {
                var found = search(arr[i].sub_fields);
                if (found) return found;
            }
            if (arr[i].layouts) {
                for (var j = 0; j < arr[i].layouts.length; j++) {
                    if (arr[i].layouts[j].sub_fields) {
                        var found2 = search(arr[i].layouts[j].sub_fields);
                        if (found2) return found2;
                    }
                }
            }
        }
        return null;
    }
    return search(fields);
}

function updateField(id, key, value) {
    var f = getFieldById(id);
    if (!f) return;
    if (key === 'required' || key === 'endpoint' || key === 'allow_null' || key === 'multiple' || key === 'ui' || key === 'ajax' || key === 'readonly' || key === 'disabled' || key === 'media_upload' || key === 'pagination' || key === 'esc_html' || key === 'allow_custom' || key === 'toggle' || key === 'save_custom' || key === 'other_choice' || key === 'save_other_choice') {
        f[key] = value ? 1 : 0;
    } else if (key === 'min' || key === 'max' || key === 'min_posts' || key === 'max_posts') {
        f[key] = parseInt(value) || 0;
    } else {
        f[key] = value;
    }
    liveUpdate();
}

function debouncedPushUndo() {
    // no-op: undo stack not implemented yet
}

function toggleFieldArray(id, key, value, checked) {
    var f = getFieldById(id);
    if (!f) return;
    if (!Array.isArray(f[key])) f[key] = [];
    var idx = f[key].indexOf(value);
    if (checked && idx === -1) {
        f[key].push(value);
    } else if (!checked && idx !== -1) {
        f[key].splice(idx, 1);
    }
    liveUpdate();
    debouncedPushUndo();
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
    return fieldDefaults(type);
}

function addSubField(parentId, type) {
    var f = findFieldInTree(parentId);
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
    var f = findFieldInTree(parentId);
    if (!f || !f.sub_fields) return;
    f.sub_fields = f.sub_fields.filter(function(sf) { return sf.id !== subId; });
    renderAll();
    liveUpdate();
}

function updateSubField(parentId, subId, key, value) {
    var f = findFieldInTree(parentId);
    if (!f || !f.sub_fields) return;
    for (var i = 0; i < f.sub_fields.length; i++) {
        if (f.sub_fields[i].id === subId) { f.sub_fields[i][key] = value; break; }
    }
    liveUpdate();
}

function toggleSubFieldExpand(parentId, subId) {
    var sf = findFieldInTree(subId);
    if (sf) { sf._expanded = !sf._expanded; renderAll(); }
}

function toggleLayoutSubFieldExpand(parentId, layoutIdx, subId) {
    var f = findFieldInTree(parentId);
    if (f && f.layouts && f.layouts[layoutIdx] && f.layouts[layoutIdx].sub_fields) {
        var subs = f.layouts[layoutIdx].sub_fields;
        for (var i = 0; i < subs.length; i++) {
            if (subs[i].id === subId) {
                subs[i]._expanded = !subs[i]._expanded;
                renderAll();
                break;
            }
        }
    }
}

// Flexible Content Layouts
function addFlexLayout(parentId) {
    var f = findFieldInTree(parentId);
    if (!f) return;
    if (!f.layouts) f.layouts = [];
    var ln = 'layout_' + (f.layouts.length + 1);
    f.layouts.push({ name: ln, label: 'Layout ' + ln.replace('layout_',''), sub_fields: [] });
    renderAll();
    liveUpdate();
}

function removeFlexLayout(parentId, layoutIdx) {
    var f = findFieldInTree(parentId);
    if (!f || !f.layouts) return;
    f.layouts.splice(layoutIdx, 1);
    renderAll();
    liveUpdate();
}

function updateFlexLayout(parentId, layoutIdx, key, value) {
    var f = findFieldInTree(parentId);
    if (!f || !f.layouts || !f.layouts[layoutIdx]) return;
    f.layouts[layoutIdx][key] = value;
    liveUpdate();
}

function addSubFieldToLayout(parentId, layoutIdx, type) {
    var f = findFieldInTree(parentId);
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
    var f = findFieldInTree(parentId);
    if (!f || !f.layouts || !f.layouts[layoutIdx] || !f.layouts[layoutIdx].sub_fields) return;
    f.layouts[layoutIdx].sub_fields = f.layouts[layoutIdx].sub_fields.filter(function(sf) { return sf.id !== subId; });
    renderAll();
    liveUpdate();
}

function updateSubFieldInLayout(parentId, layoutIdx, subId, key, value) {
    var f = findFieldInTree(parentId);
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
    renderDynamicStyleControls();
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
    var sectionEl = document.getElementById('fields-section');
    var dividerEl = document.getElementById('fields-divider-top');

    countEl.textContent = fields.length + ' ' + plural(fields.length, ['поле','поля','полей']);

    if (fields.length === 0) {
        if (emptyEl) emptyEl.style.display = '';
        if (sectionEl) sectionEl.style.display = 'none';
        if (dividerEl) dividerEl.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    if (sectionEl) sectionEl.style.display = '';
    if (dividerEl) dividerEl.style.display = '';

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

// Render full settings form for a sub-field (all types)
function renderSubFieldSettings(sf, parentId) {
    var h = '';
    var pid = parentId;
    var sid = sf.id;

    h += '<div class="gen-row-inline">';
    h += '<div class="gen-row" style="flex:2;"><label class="gen-label">Ключ</label><input type="text" class="gen-input" value="'+escAttr(sf.key||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="key" style="font-family:var(--font-mono);font-size:1.05rem;"></div>';
    h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:20px;"><label class="gen-toggle"><input type="checkbox"'+(sf.required?' checked':'')+' data-action="update-sub-field-checkbox" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="required"><span>Обязательное</span></label></div>';
    h += '</div>';

    h += '<div class="gen-row"><label class="gen-label">Инструкция</label><input type="text" class="gen-input" value="'+escAttr(sf.instructions||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="instructions" placeholder="Подсказка под полем"></div>';

    var t = sf.type;

    if (t === 'text' || t === 'number' || t === 'email' || t === 'url' || t === 'password') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Placeholder</label><input type="text" class="gen-input" value="'+escAttr(sf.placeholder||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="placeholder"></div>';
        h += '<div class="gen-row"><label class="gen-label">Макс. длина</label><input type="number" class="gen-input" value="'+(sf.maxlength||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="maxlength" min="0"></div>';
        h += '</div>';
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Значение по умолчанию</label><input type="text" class="gen-input" value="'+escAttr(sf.default_value||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="default_value"></div>';
        h += '<div class="gen-row"><label class="gen-label">Префикс</label><input type="text" class="gen-input" value="'+escAttr(sf.prepend||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="prepend"></div>';
        h += '<div class="gen-row"><label class="gen-label">Суффикс</label><input type="text" class="gen-input" value="'+escAttr(sf.append||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="append"></div>';
        h += '</div>';
    }

    if (t === 'number') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Мин</label><input type="number" class="gen-input" value="'+(sf.min||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="min"></div>';
        h += '<div class="gen-row"><label class="gen-label">Макс</label><input type="number" class="gen-input" value="'+(sf.max||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="max"></div>';
        h += '<div class="gen-row"><label class="gen-label">Шаг</label><input type="text" class="gen-input" value="'+escAttr(sf.step||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="step"></div>';
        h += '</div>';
    }

    if (t === 'textarea') {
        h += '<div class="gen-row"><label class="gen-label">Перенос строк</label><select class="gen-select" data-action="update-sub-field-select" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="new_lines"><option value="br"'+(sf.new_lines==='br'?' selected':'')+'>br</option><option value="wpautop"'+(sf.new_lines==='wpautop'?' selected':'')+'>wpautop</option></select></div>';
        h += '<div class="gen-row"><label class="gen-label">Placeholder</label><input type="text" class="gen-input" value="'+escAttr(sf.placeholder||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="placeholder"></div>';
        h += '<div class="gen-row"><label class="gen-label">Значение по умолчанию</label><textarea class="gen-textarea" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="default_value">'+escHtml(sf.default_value||'')+'</textarea></div>';
    }

    if (t === 'image' || t === 'file' || t === 'gallery') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Формат возврата</label><select class="gen-select" data-action="update-sub-field-select" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="return_format"><option value="array"'+(sf.return_format==='array'?' selected':'')+'>Массив</option><option value="url"'+(sf.return_format==='url'?' selected':'')+'>URL</option><option value="id"'+(sf.return_format==='id'?' selected':'')+'>ID</option></select></div>';
        h += '<div class="gen-row"><label class="gen-label">Библиотека</label><select class="gen-select" data-action="update-sub-field-select" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="library"><option value="all"'+(sf.library==='all'?' selected':'')+'>Все</option><option value="uploadedTo"'+(sf.library==='uploadedTo'?' selected':'')+'>К посту</option></select></div>';
        h += '</div>';
        if (t === 'file') {
            h += '<div class="gen-row"><label class="gen-label">MIME типы</label><input type="text" class="gen-input" value="'+escAttr(sf.mime_types||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="mime_types" placeholder="pdf, doc, docx"></div>';
        }
        if (t === 'image' || t === 'gallery') {
            h += '<div class="gen-row-inline">';
            h += '<div class="gen-row"><label class="gen-label">Мин. ширина</label><input type="number" class="gen-input" value="'+(sf.min_width||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="min_width"></div>';
            h += '<div class="gen-row"><label class="gen-label">Мин. высота</label><input type="number" class="gen-input" value="'+(sf.min_height||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="min_height"></div>';
            h += '</div>';
        }
    }

    if (t === 'wysiwyg') {
        h += '<div class="gen-row"><label class="gen-label">Значение по умолчанию</label><textarea class="gen-textarea" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="default_value">'+escHtml(sf.default_value||'')+'</textarea></div>';
    }

    if (t === 'oembed') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Ширина</label><input type="text" class="gen-input" value="'+escAttr(sf.width||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="width"></div>';
        h += '<div class="gen-row"><label class="gen-label">Высота</label><input type="text" class="gen-input" value="'+escAttr(sf.height||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="height"></div>';
        h += '</div>';
    }

    if (t === 'select' || t === 'checkbox' || t === 'radio') {
        h += '<div class="gen-row"><label class="gen-label">Варианты выбора</label><textarea class="gen-textarea" data-action="update-sub-choices" data-parent-id="'+pid+'" data-sub-id="'+sid+'" placeholder="ключ : Метка">'+choicesToText(sf.choices)+'</textarea><div class="gen-hint">Формат: ключ : Метка, каждая с новой строки</div></div>';
    }

    if (t === 'select') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(sf.allow_null?' checked':'')+' data-action="update-sub-field-checkbox" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="allow_null"><span>Разрешить пустое</span></label></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(sf.multiple?' checked':'')+' data-action="update-sub-field-checkbox" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="multiple"><span>Множественный</span></label></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(sf.ui?' checked':'')+' data-action="update-sub-field-checkbox" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="ui"><span>Стилизованный</span></label></div>';
        h += '</div>';
    }

    if (t === 'true_false') {
        h += '<div class="gen-row"><label class="gen-label">Сообщение</label><input type="text" class="gen-input" value="'+escAttr(sf.message||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="message"></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(sf.ui?' checked':'')+' data-action="update-sub-field-checkbox" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="ui"><span>Стилизованный переключатель</span></label></div>';
    }

    if (t === 'date_picker') {
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Формат отображения</label><input type="text" class="gen-input" value="'+escAttr(sf.display_format||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="display_format"></div>';
        h += '<div class="gen-row"><label class="gen-label">Формат возврата</label><input type="text" class="gen-input" value="'+escAttr(sf.return_format_date||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="return_format_date"></div>';
        h += '</div>';
    }

    if (t === 'color_picker') {
        h += '<div class="gen-row"><label class="gen-label">Значение по умолчанию</label><input type="color" style="width:100%;height:48px;border:1px solid var(--border);border-radius:6px;background:var(--bg);cursor:pointer;" value="'+(sf.default_value||'#7c3aed')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="default_value"></div>';
    }

    if (t === 'message') {
        h += '<div class="gen-row"><label class="gen-label">Сообщение</label><textarea class="gen-textarea" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="message">'+escHtml(sf.message||'')+'</textarea></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(sf.new_lines==='wpautop'?' checked':'')+' data-action="update-sub-field-checkbox-wpautop" data-parent-id="'+pid+'" data-sub-id="'+sid+'"><span>wpautop</span></label></div>';
    }

    if (t === 'tab') {
        h += '<div class="gen-row"><label class="gen-label">Расположение</label><select class="gen-select" data-action="update-sub-field-select" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="placement"><option value="top"'+(sf.placement==='top'?' selected':'')+'>Сверху</option><option value="left"'+(sf.placement==='left'?' selected':'')+'>Слева</option></select></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(sf.endpoint?' checked':'')+' data-action="update-sub-field-checkbox" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="endpoint"><span>Конечная точка</span></label></div>';
    }

    if (t === 'link') {
        h += '<div class="gen-row"><label class="gen-label">Формат возврата</label><select class="gen-select" data-action="update-sub-field-select" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="return_format"><option value="array"'+(sf.return_format==='array'?' selected':'')+'>Массив</option><option value="url"'+(sf.return_format==='url'?' selected':'')+'>URL</option></select></div>';
    }

    if (t === 'post_object' || t === 'relationship') {
        h += '<div class="gen-row"><label class="gen-label">Тип записи</label><input type="text" class="gen-input" value="'+escAttr(Array.isArray(sf.post_type)?sf.post_type.join(', '):sf.post_type)+'" data-action="update-sub-field-post-type" data-parent-id="'+pid+'" data-sub-id="'+sid+'" placeholder="post, page"></div>';
        if (t === 'relationship') {
            h += '<div class="gen-row-inline">';
            h += '<div class="gen-row"><label class="gen-label">Мин. записей</label><input type="number" class="gen-input" value="'+(sf.min_posts||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="min_posts"></div>';
            h += '<div class="gen-row"><label class="gen-label">Макс. записей</label><input type="number" class="gen-input" value="'+(sf.max_posts||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="max_posts"></div>';
            h += '</div>';
        }
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(sf.allow_null?' checked':'')+' data-action="update-sub-field-checkbox" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="allow_null"><span>Разрешить пустое</span></label></div>';
        h += '<div class="gen-row" style="display:flex;align-items:center;padding-top:0;"><label class="gen-toggle"><input type="checkbox"'+(sf.multiple?' checked':'')+' data-action="update-sub-field-checkbox" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="multiple"><span>Множественный</span></label></div>';
        h += '</div>';
    }

    if (t === 'repeater') {
        h += '<div class="gen-divider"></div>';
        h += '<div style="font-weight:600;margin-bottom:14px;">Настройки повторителя</div>';
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Текст кнопки</label><input type="text" class="gen-input" value="'+escAttr(sf.button_label||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="button_label"></div>';
        h += '<div class="gen-row"><label class="gen-label">Раскладка</label><select class="gen-select" data-action="update-sub-field-select" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="layout"><option value="table"'+(sf.layout==='table'?' selected':'')+'>Таблица</option><option value="block"'+(sf.layout==='block'?' selected':'')+'>Блок</option><option value="row"'+(sf.layout==='row'?' selected':'')+'>Строка</option></select></div>';
        h += '</div>';
        h += '<div class="gen-row-inline">';
        h += '<div class="gen-row"><label class="gen-label">Мин. строк</label><input type="number" class="gen-input" value="'+(sf.min||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="min"></div>';
        h += '<div class="gen-row"><label class="gen-label">Макс. строк</label><input type="number" class="gen-input" value="'+(sf.max||'')+'" data-action="update-sub-field" data-parent-id="'+pid+'" data-sub-id="'+sid+'" data-key="max"></div>';
        h += '</div>';
    }

    return h;
}

// Sub-fields section renderer
function renderSubFieldsSection(f, parentType) {
    var h = '';
    h += '<div class="sub-fields-section">';
    h += '<div class="sub-title">Подполя</div>';
    if (f.sub_fields && f.sub_fields.length > 0) {
        for (var si = 0; si < f.sub_fields.length; si++) {
            var sf = f.sub_fields[si];
            var isStruct = (sf.type === 'repeater' || sf.type === 'group' || sf.type === 'flexible_content');
            var expIcon = sf._expanded ? 'expand_less' : 'expand_more';
            h += '<div class="sub-field-row' + (isStruct ? ' sub-field-struct' : '') + (sf._expanded ? ' sub-field-expanded' : '') + '">';
            h += '<button class="sf-expand" data-action="toggle-sub-field-expand" data-parent-id="' + f.id + '" data-sub-id="' + sf.id + '" title="Настроить"><span class="material-symbols-outlined">' + expIcon + '</span></button>';
            h += '<span class="sf-type"><span class="material-symbols-outlined">' + (FIELD_TYPES[sf.type] ? FIELD_TYPES[sf.type].icon : 'text_fields') + '</span></span>';
            h += '<input type="text" value="'+escAttr(sf.label||'')+'" data-action="update-sub-field" data-parent-id="'+f.id+'" data-sub-id="'+sf.id+'" data-key="label" placeholder="Название">';
            h += '<input type="text" class="sf-name-input" value="'+escAttr(sf.name||'')+'" data-action="update-sub-field" data-parent-id="'+f.id+'" data-sub-id="'+sf.id+'" data-key="name" placeholder="field_name">';
            h += '<button class="gen-btn-icon" data-action="remove-sub-field" data-parent-id="'+f.id+'" data-sub-id="'+sf.id+'" style="color:#f87171;width:40px;height:40px;font-size:0.95rem;"><span class="material-symbols-outlined">close</span></button>';
            h += '</div>';
            // Expanded: full settings form + structure sub-fields
            if (sf._expanded) {
                h += '<div class="sub-field-nested">';
                h += renderSubFieldSettings(sf, f.id);
                if (isStruct) {
                    h += '<div class="gen-divider"></div>';
                    if (sf.type === 'flexible_content') {
                        h += renderFlexLayoutsSection(sf);
                    } else {
                        h += renderSubFieldsSection(sf, sf.type);
                    }
                }
                h += '</div>';
            }
        }
    } else {
        h += '<div style="color:var(--text-dim);font-size:1.05rem;padding:8px 0;font-style:italic;">Нет подполей — добавьте ниже</div>';
    }
    h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">';
    var subTypes = Object.keys(FIELD_TYPES);
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
                    var lIsStruct = (lsf.type === 'repeater' || lsf.type === 'group' || lsf.type === 'flexible_content');
                    var lExpIcon = lsf._expanded ? 'expand_less' : 'expand_more';
                    h += '<div class="sub-field-row' + (lIsStruct ? ' sub-field-struct' : '') + (lsf._expanded ? ' sub-field-expanded' : '') + '">';
                    h += '<button class="sf-expand" data-action="toggle-layout-sub-field-expand" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-sub-id="'+lsf.id+'" title="Настроить"><span class="material-symbols-outlined">' + lExpIcon + '</span></button>';
                    h += '<span class="sf-type"><span class="material-symbols-outlined">' + (FIELD_TYPES[lsf.type] ? FIELD_TYPES[lsf.type].icon : 'text_fields') + '</span></span>';
                    h += '<input type="text" value="'+escAttr(lsf.label||'')+'" data-action="update-layout-sub-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-sub-id="'+lsf.id+'" data-key="label" placeholder="Название">';
                    h += '<input type="text" class="sf-name-input" value="'+escAttr(lsf.name||'')+'" data-action="update-layout-sub-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-sub-id="'+lsf.id+'" data-key="name" placeholder="field_name">';
                    h += '<button class="gen-btn-icon" data-action="remove-layout-sub-field" data-parent-id="'+f.id+'" data-layout-idx="'+li+'" data-sub-id="'+lsf.id+'" style="color:#f87171;width:40px;height:40px;font-size:0.95rem;"><span class="material-symbols-outlined">close</span></button>';
                    h += '</div>';
                    if (lsf._expanded && lIsStruct) {
                        h += '<div class="sub-field-nested">';
                        h += renderSubFieldSettings(lsf, f.id);
                        h += '<div class="gen-divider"></div>';
                        if (lsf.type === 'flexible_content') {
                            h += renderFlexLayoutsSection(lsf);
                        } else {
                            h += renderSubFieldsSection(lsf, lsf.type);
                        }
                        h += '</div>';
                    }
                }
            }
            h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;">';
            var subTypes2 = Object.keys(FIELD_TYPES);
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
    } else if (currentCodeTab === 'html') {
        generateHTML();
    } else if (currentCodeTab === 'preview') {
        updatePreview();
    } else {
        generatePHP();
    }
    updateVisualEditorIfActive();
}

// ==================== CODE GENERATION ====================
var currentCodeTab = 'php';

function updateCodeExportNote(tab) {
    var note = document.getElementById('code-export-note');
    if (!note) return;
    var text = 'Регистрация ACF: вставьте код в functions.php или отдельный include.';
    if (tab === 'html') {
        text = 'WordPress-шаблон + scoped CSS: без editor-маркеров, готов для переноса в тему.';
    } else if (tab === 'json') {
        text = 'ACF JSON: сохраните файл в acf-json или используйте для миграции между проектами.';
    }
    note.innerHTML = '<span class="material-symbols-outlined">info</span><span>' + escHtml(text) + '</span>';
}

function switchCodeTab(tab) {
    currentCodeTab = tab;
    if (typeof window.trackGeneratorEvent === 'function') {
        window.trackGeneratorEvent('acf_export_tab_changed', { generator: 'acf', tab: tab });
    }
    // Update active tab buttons
    var tabs = document.querySelectorAll('.code-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tab);
    }
    updateCodeExportNote(tab);
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

// ==================== GENERATE HTML TEMPLATE ====================
function generateHTML() {
    document.getElementById('code-output').textContent = generateVisualHTML({ fullDocument: false });
}

function generateWordPressTemplateHTML() {
    var config = buildACFConfig();
    var out = [];

    out.push('<?php');
    out.push('/**');
    out.push(' * HTML-шаблон для группы полей: ' + escPHPSingle(config.title));
    out.push(' * Вставьте этот код в шаблон темы (page.php, single.php и т.д.)');
    out.push(' *');
    out.push(' * Рекомендуемые стили — добавьте в style.css или в <style>:');
    var cssOut = generatePreviewCSS().split('\n');
    for (var ci = 0; ci < cssOut.length; ci++) {
        out.push(' * ' + cssOut[ci]);
    }
    out.push(' */');
    out.push('?>');
    out.push('<section class="acf-section acf-' + escAttr(config.key) + '">');

    function renderFieldHTML(f, indent, prefix) {
        var inRepeater = !!prefix;
        prefix = prefix || '';
        var lines = [];
        var name = f.name || '';
        var label = f.label || name;
        var t = f.type;
        var getFn = inRepeater ? 'get_sub_field' : 'get_field';
        var theFn = inRepeater ? 'the_sub_field' : 'the_field';
        var haveFn = 'have_rows';

        if (!name) return [];

        if (t === 'tab') {
            if (label) lines.push(indent + '<!-- ' + escHtml(label) + ' -->');
            return lines;
        }
        if (t === 'message') {
            lines.push(indent + '<?php if (' + getFn + '(\'' + escPHPSingle(name) + '\\\')): ?>');
            lines.push(indent + '    <div class="acf-message">');
            lines.push(indent + '        <?php ' + theFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'image') {
            lines.push(indent + '<?php $img_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($img_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <div class="acf-image">');
            if (f.return_format !== 'url') {
                lines.push(indent + '        <img src="<?php echo esc_url($img_' + escapeVar(name) + '[\\\'url\\\']); ?>" alt="<?php echo esc_attr($img_' + escapeVar(name) + '[\\\'alt\\\']); ?>">');
            } else {
                lines.push(indent + '        <img src="<?php echo esc_url($img_' + escapeVar(name) + '); ?>" alt="">');
            }
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'file') {
            lines.push(indent + '<?php $file_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($file_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <a class="acf-file" href="<?php echo esc_url($file_' + escapeVar(name) + '[\\\'url\\\']); ?>" download>');
            lines.push(indent + '        <?php echo esc_html($file_' + escapeVar(name) + '[\\\'filename\\\']); ?>');
            lines.push(indent + '    </a>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'gallery') {
            lines.push(indent + '<?php $gallery_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($gallery_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <div class="acf-gallery">');
            lines.push(indent + '        <?php foreach ($gallery_' + escapeVar(name) + ' as $img): ?>');
            lines.push(indent + '            <div class="acf-gallery-item">');
            lines.push(indent + '                <img src="<?php echo esc_url($img[\\\'sizes\\\'][\\\'medium\\\'] ?? $img[\\\'url\\\']); ?>" alt="<?php echo esc_attr($img[\\\'alt\\\']); ?>">');
            lines.push(indent + '            </div>');
            lines.push(indent + '        <?php endforeach; ?>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'oembed') {
            lines.push(indent + '<?php if (' + getFn + '(\'' + escPHPSingle(name) + '\\\')): ?>');
            lines.push(indent + '    <div class="acf-oembed">');
            lines.push(indent + '        <?php ' + theFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'true_false') {
            lines.push(indent + '<?php if (' + getFn + '(\'' + escPHPSingle(name) + '\\\')): ?>');
            lines.push(indent + '    <div class="acf-true-false acf-true-false--' + escAttr(name) + '">');
            if (f.message) {
                lines.push(indent + '        <span>' + escHtml(f.message) + '</span>');
            }
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'link') {
            lines.push(indent + '<?php $link_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($link_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <a class="acf-link" href="<?php echo esc_url($link_' + escapeVar(name) + '[\\\'url\\\']); ?>"');
            lines.push(indent + '       target="<?php echo esc_attr($link_' + escapeVar(name) + '[\\\'target\\\'] ?? \\\'_self\\\'); ?>">');
            lines.push(indent + '        <?php echo esc_html($link_' + escapeVar(name) + '[\\\'title\\\']); ?>');
            lines.push(indent + '    </a>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'post_object') {
            lines.push(indent + '<?php $post_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($post_' + escapeVar(name) + '): ?>');
            if (f.multiple) {
                lines.push(indent + '    <div class="acf-posts">');
                lines.push(indent + '        <?php foreach ($post_' + escapeVar(name) + ' as $p): ?>');
                lines.push(indent + '            <div class="acf-post-item">');
                lines.push(indent + '                <?php if ($p): ?><a href="<?php echo get_permalink($p->ID); ?>"><?php echo esc_html(get_the_title($p->ID)); ?></a><?php endif; ?>');
                lines.push(indent + '            </div>');
                lines.push(indent + '        <?php endforeach; ?>');
                lines.push(indent + '    </div>');
            } else {
                lines.push(indent + '    <div class="acf-post-item">');
                lines.push(indent + '        <a href="<?php echo get_permalink($post_' + escapeVar(name) + '->ID); ?>"><?php echo esc_html(get_the_title($post_' + escapeVar(name) + '->ID)); ?></a>');
                lines.push(indent + '    </div>');
            }
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'relationship') {
            lines.push(indent + '<?php $rel_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($rel_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <div class="acf-relationship">');
            lines.push(indent + '        <?php foreach ($rel_' + escapeVar(name) + ' as $p): ?>');
            lines.push(indent + '            <div class="acf-rel-item">');
            lines.push(indent + '                <?php if ($p): ?><a href="<?php echo get_permalink($p->ID); ?>"><?php echo esc_html(get_the_title($p->ID)); ?></a><?php endif; ?>');
            lines.push(indent + '            </div>');
            lines.push(indent + '        <?php endforeach; ?>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'repeater') {
            lines.push(indent + '<?php if (' + haveFn + '(\'' + escPHPSingle(name) + '\\\')): ?>');
            lines.push(indent + '    <div class="acf-repeater acf-repeater--' + escAttr(name) + '">');
            lines.push(indent + '        <?php while (' + haveFn + '(\'' + escPHPSingle(name) + '\\\')): the_row(); ?>');
            lines.push(indent + '            <div class="acf-repeater-item">');
            if (f.sub_fields && f.sub_fields.length > 0) {
                for (var si = 0; si < f.sub_fields.length; si++) {
                    var sf = f.sub_fields[si];
                    var sfLines = renderFieldHTML(sf, indent + '                ', true);
                    for (var sl = 0; sl < sfLines.length; sl++) {
                        lines.push(sfLines[sl]);
                    }
                }
            }
            lines.push(indent + '            </div>');
            lines.push(indent + '        <?php endwhile; ?>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'group') {
            lines.push(indent + '<?php if (' + haveFn + '(\'' + escPHPSingle(name) + '\\\')): ?>');
            lines.push(indent + '    <div class="acf-group acf-group--' + escAttr(name) + '">');
            lines.push(indent + '        <?php while (' + haveFn + '(\'' + escPHPSingle(name) + '\\\')): the_row(); ?>');
            if (f.sub_fields && f.sub_fields.length > 0) {
                for (var gi = 0; gi < f.sub_fields.length; gi++) {
                    var gf = f.sub_fields[gi];
                    var gfLines = renderFieldHTML(gf, indent + '            ', true);
                    for (var gl = 0; gl < gfLines.length; gl++) {
                        lines.push(gfLines[gl]);
                    }
                }
            }
            lines.push(indent + '        <?php endwhile; ?>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'flexible_content') {
            lines.push(indent + '<?php if (' + haveFn + '(\'' + escPHPSingle(name) + '\\\')): ?>');
            lines.push(indent + '    <div class="acf-flexible">');
            lines.push(indent + '        <?php while (' + haveFn + '(\'' + escPHPSingle(name) + '\\\')): the_row(); ?>');
            if (f.layouts && f.layouts.length > 0) {
                for (var li = 0; li < f.layouts.length; li++) {
                    var lay = f.layouts[li];
                    var layName = lay.name || '';
                    if (!layName) continue;
                    var isFirst = (li === 0);
                    lines.push(indent + '            <?php ' + (isFirst ? 'if' : 'elseif') + ' (get_row_layout() === \\\'' + escPHPSingle(layName) + '\\\'): ?>');
                    lines.push(indent + '                <div class="acf-layout acf-layout--' + escAttr(layName) + '">');
                    if (lay.sub_fields && lay.sub_fields.length > 0) {
                        for (var lsi = 0; lsi < lay.sub_fields.length; lsi++) {
                            var lsf = lay.sub_fields[lsi];
                            var lsfLines = renderFieldHTML(lsf, indent + '                    ', true);
                            for (var lsl = 0; lsl < lsfLines.length; lsl++) {
                                lines.push(lsfLines[lsl]);
                            }
                        }
                    }
                    lines.push(indent + '                </div>');
                }
                lines.push(indent + '            <?php endif; ?>');
            }
            lines.push(indent + '        <?php endwhile; ?>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'checkbox') {
            lines.push(indent + '<?php $chk_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($chk_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <div class="acf-field acf-field--' + escAttr(name) + '">');
            if (label) lines.push(indent + '        <span class="acf-label">' + escHtml(label) + '</span>');
            lines.push(indent + '        <ul class="acf-checkbox-values">');
            lines.push(indent + '            <?php foreach ($chk_' + escapeVar(name) + ' as $val): ?>');
            lines.push(indent + '                <li><?php echo esc_html($val); ?></li>');
            lines.push(indent + '            <?php endforeach; ?>');
            lines.push(indent + '        </ul>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'select') {
            lines.push(indent + '<?php $sel_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($sel_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <div class="acf-field acf-field--' + escAttr(name) + '">');
            if (label) lines.push(indent + '        <span class="acf-label">' + escHtml(label) + '</span>');
            if (f.multiple) {
                lines.push(indent + '        <ul class="acf-select-values">');
                lines.push(indent + '            <?php foreach ($sel_' + escapeVar(name) + ' as $v): ?>');
                lines.push(indent + '                <li><?php echo esc_html(is_array($v) ? ($v[\\\'label\\\'] ?? $v[\\\'value\\\']) : $v); ?></li>');
                lines.push(indent + '            <?php endforeach; ?>');
                lines.push(indent + '        </ul>');
            } else {
                lines.push(indent + '        <div class="acf-value"><?php echo esc_html(is_array($sel_' + escapeVar(name) + ') ? ($sel_' + escapeVar(name) + '[\\\'label\\\'] ?? $sel_' + escapeVar(name) + '[\\\'value\\\']) : $sel_' + escapeVar(name) + '); ?></div>');
            }
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'radio') {
            lines.push(indent + '<?php $radio_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($radio_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <div class="acf-field acf-field--' + escAttr(name) + '">');
            if (label) lines.push(indent + '        <span class="acf-label">' + escHtml(label) + '</span>');
            lines.push(indent + '        <div class="acf-value"><?php echo esc_html($radio_' + escapeVar(name) + '); ?></div>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'date_picker') {
            lines.push(indent + '<?php $date_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($date_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <time class="acf-date" datetime="<?php echo esc_attr($date_' + escapeVar(name) + '); ?>"><?php echo esc_html($date_' + escapeVar(name) + '); ?></time>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'color_picker') {
            lines.push(indent + '<?php $color_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($color_' + escapeVar(name) + '): ?>');
            lines.push(indent + '    <div class="acf-color" style="background-color:<?php echo esc_attr($color_' + escapeVar(name) + '); ?>"><?php echo esc_html($color_' + escapeVar(name) + '); ?></div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        if (t === 'number') {
            lines.push(indent + '<?php $num_' + escapeVar(name) + ' = ' + getFn + '(\'' + escPHPSingle(name) + '\\\'); ?>');
            lines.push(indent + '<?php if ($num_' + escapeVar(name) + ' !== \'\' && $num_' + escapeVar(name) + ' !== null): ?>');
            lines.push(indent + '    <div class="acf-field acf-field--' + escAttr(name) + '">');
            if (label) lines.push(indent + '        <span class="acf-label">' + escHtml(label) + '</span>');
            lines.push(indent + '        <div class="acf-value"><?php echo esc_html($num_' + escapeVar(name) + '); ?></div>');
            lines.push(indent + '    </div>');
            lines.push(indent + '<?php endif; ?>');
            return lines;
        }

        lines.push(indent + '<?php if (' + getFn + '(\'' + escPHPSingle(name) + '\\\')): ?>');
        lines.push(indent + '    <div class="acf-field acf-field--' + escAttr(name) + '">');
        if (label) lines.push(indent + '        <span class="acf-label">' + escHtml(label) + '</span>');
        lines.push(indent + '        <div class="acf-value"><?php ' + theFn + '(\'' + escPHPSingle(name) + '\\\'); ?></div>');
        lines.push(indent + '    </div>');
        lines.push(indent + '<?php endif; ?>');
        return lines;
    }

    function escapeVar(name) {
        return String(name).replace(/[^a-zA-Z0-9_]/g, '_');
    }

    for (var i = 0; i < config.fields.length; i++) {
        var f = config.fields[i];
        var fLines = renderFieldHTML(f, '    ');
        for (var j = 0; j < fLines.length; j++) {
            out.push(fLines[j]);
        }
    }

    out.push('</section>');
    return out.join('\n');
}

// ==================== PREVIEW HTML (browser-renderable) ====================
function generatePreviewHTML() {
    var styles = blockStyles;
    var isFaq = fields.length === 1 && fields[0].type === 'repeater' && fields[0].name === 'faq_items';
    var css = [
        '.acf-preview-block {',
        '  background: ' + styles.bgColor + ';',
        '  color: ' + styles.textColor + ';',
        '  padding: ' + styles.padding + 'px;',
        '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        '  line-height: 1.5;',
        '  display: flex;',
        '  flex-direction: column;',
        '  gap: ' + styles.gap + 'px;',
        '}',
        '.acf-preview-card {',
        '  background: ' + styles.cardBg + ';',
        '  padding: ' + styles.cardPadding + 'px;',
        '  border-radius: ' + styles.cardRadius + 'px;',
        '  border: ' + styles.borderWidth + 'px solid ' + styles.borderColor + ';',
        '}',
        '.acf-preview-card-label {',
        '  font-size: 0.75rem;',
        '  text-transform: uppercase;',
        '  letter-spacing: 0.05em;',
        '  opacity: 0.6;',
        '  margin-bottom: 4px;',
        '}',
        '.acf-preview-card-value {',
        '  font-weight: 500;',
        '}',
        '.acf-preview-img {',
        '  width: 100%;',
        '  height: 120px;',
        '  border-radius: 8px;',
        '  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  color: #6366f1;',
        '  font-size: 1.5rem;',
        '}',
        '.acf-preview-gallery {',
        '  display: flex;',
        '  gap: 8px;',
        '  flex-wrap: wrap;',
        '}',
        '.acf-preview-gallery-item {',
        '  width: 70px;',
        '  height: 70px;',
        '  border-radius: 6px;',
        '  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);',
        '}',
        '.acf-preview-link {',
        '  color: #6366f1;',
        '  text-decoration: underline;',
        '}',
        '.acf-preview-true-false {',
        '  display: inline-block;',
        '  padding: 3px 10px;',
        '  border-radius: 999px;',
        '  background: #22c55e;',
        '  color: #fff;',
        '  font-size: 0.8rem;',
        '  font-weight: 600;',
        '}',
        '.acf-preview-meta {',
        '  font-size: 0.7rem;',
        '  opacity: 0.5;',
        '  margin-top: 8px;',
        '  text-align: right;',
        '}',
        '/* FAQ Accordion */',
        '.acf-faq-item {',
        '  border: ' + styles.borderWidth + 'px solid ' + styles.borderColor + ';',
        '  border-radius: ' + styles.cardRadius + 'px;',
        '  overflow: hidden;',
        '  background: ' + styles.cardBg + ';',
        '}',
        '.acf-faq-question {',
        '  padding: ' + styles.cardPadding + 'px;',
        '  font-weight: 600;',
        '  cursor: pointer;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: space-between;',
        '  user-select: none;',
        '  transition: background 0.2s;',
        '}',
        '.acf-faq-question:hover { opacity: 0.8; }',
        '.acf-faq-question::after {',
        '  content: "+";',
        '  font-size: 1.3rem;',
        '  font-weight: 300;',
        '  transition: transform 0.25s;',
        '  color: ' + styles.textColor + ';',
        '  opacity: 0.5;',
        '}',
        '.acf-faq-item.open .acf-faq-question::after {',
        '  content: "\\2212";',
        '}',
        '.acf-faq-answer {',
        '  max-height: 0;',
        '  overflow: hidden;',
        '  transition: max-height 0.3s ease, padding 0.3s ease;',
        '  padding: 0 ' + styles.cardPadding + 'px;',
        '  color: ' + styles.textColor + ';',
        '  opacity: 0.8;',
        '  font-size: 0.95rem;',
        '}',
        '.acf-faq-item.open .acf-faq-answer {',
        '  max-height: 400px;',
        '  padding: 0 ' + styles.cardPadding + 'px ' + styles.cardPadding + 'px;',
        '}',
        '/* SVG Placeholder */',
        '.acf-placeholder-img {',
        '  width: 100%;',
        '  height: 120px;',
        '  border-radius: 8px;',
        '  background: #f0f0f5;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  overflow: hidden;',
        '}',
        '.acf-placeholder-img svg { width: 48px; height: 48px; opacity: 0.22; }',
        '.acf-placeholder-gallery {',
        '  display: flex;',
        '  gap: 8px;',
        '  flex-wrap: wrap;',
        '}',
        '.acf-placeholder-gallery-item {',
        '  width: 70px;',
        '  height: 70px;',
        '  border-radius: 6px;',
        '  background: #f0f0f5;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '}',
        '.acf-placeholder-gallery-item svg { width: 24px; height: 24px; opacity: 0.2; }',
        '/* Responsive breakpoints */',
        '@media (max-width: 768px) {',
        '  .acf-preview-block { padding: ' + Math.max(parseInt(styles.padding) - 8, 8) + 'px; }',
        '  .acf-preview-card { padding: ' + Math.max(parseInt(styles.cardPadding) - 6, 8) + 'px; }',
        '}',
        '@media (max-width: 480px) {',
        '  .acf-preview-block { padding: 12px; gap: 10px; }',
        '  .acf-preview-card { padding: 12px; border-radius: 8px; }',
        '  .acf-placeholder-gallery-item { width: 56px; height: 56px; }',
        '}'
    ].join('\n');

    function getDummyValue(f) {
        var t = f.type;
        var label = f.label || f.name || 'Field';
        if (t === 'text' || t === 'textarea' || t === 'wysiwyg') return '<span class="acf-preview-card-value">' + escHtml(label) + ': пример текста</span>';
        if (t === 'number') return '<span class="acf-preview-card-value">42</span>';
        if (t === 'email') return '<span class="acf-preview-card-value">example@domain.com</span>';
        if (t === 'url' || t === 'link') return '<span class="acf-preview-link">https://example.com</span>';
        if (t === 'image') return '<div class="acf-placeholder-img"><svg viewBox="0 0 48 48" fill="none"><rect x="4" y="8" width="40" height="32" rx="4" stroke="#999" stroke-width="2"/><circle cx="16" cy="18" r="4" stroke="#999" stroke-width="2"/><path d="M8 36l10-12 6 6 8-10 8 10" stroke="#999" stroke-width="2" fill="none"/></svg></div>';
        if (t === 'file') return '<span class="acf-preview-card-value">&#128196; document.pdf</span>';
        if (t === 'gallery') return '<div class="acf-placeholder-gallery"><div class="acf-placeholder-gallery-item"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#999" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke="#999" stroke-width="1.5"/><path d="M4 18l6-7 3 3 5-6 4 6" stroke="#999" stroke-width="1.5" fill="none"/></svg></div><div class="acf-placeholder-gallery-item"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#999" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke="#999" stroke-width="1.5"/><path d="M4 18l6-7 3 3 5-6 4 6" stroke="#999" stroke-width="1.5" fill="none"/></svg></div><div class="acf-placeholder-gallery-item"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="#999" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke="#999" stroke-width="1.5"/><path d="M4 18l6-7 3 3 5-6 4 6" stroke="#999" stroke-width="1.5" fill="none"/></svg></div></div>';
        if (t === 'true_false') return '<span class="acf-preview-true-false">✓ Да</span>';
        if (t === 'select') return '<span class="acf-preview-card-value">Выбранный вариант</span>';
        if (t === 'checkbox') return '<span class="acf-preview-card-value">☑ Вариант 1, ☑ Вариант 2</span>';
        if (t === 'radio') return '<span class="acf-preview-card-value">◉ Вариант 1</span>';
        if (t === 'date_picker') return '<span class="acf-preview-card-value">01.01.2024</span>';
        if (t === 'color_picker') return '<span class="acf-preview-card-value" style="display:inline-block;width:24px;height:16px;background:#7c3aed;border-radius:2px;vertical-align:middle;"></span> #7c3aed';
        if (t === 'oembed') return '<div style="background:#f0f0f0;height:100px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;">▶ Видео</div>';
        if (t === 'post_object') return '<span class="acf-preview-card-value">📄 Название записи</span>';
        if (t === 'relationship') return '<span class="acf-preview-card-value">📄 Запись 1, 📄 Запись 2</span>';
        if (t === 'message') return '<div style="padding:12px;background:#fef3c7;border-radius:8px;font-size:0.85rem;">ℹ ' + escHtml(label) + '</div>';
        if (t === 'password') return '<span class="acf-preview-card-value">••••••••</span>';
        return '<span class="acf-preview-card-value">' + escHtml(label) + '</span>';
    }

    function renderPreviewField(f) {
        var t = f.type;
        if (t === 'tab' || t === 'message') return getDummyValue(f);

        // Structural types
        if (t === 'group' && f.sub_fields && f.sub_fields.length > 0) {
            var inner = '';
            for (var i = 0; i < f.sub_fields.length; i++) {
                inner += '<div class="acf-preview-card" style="margin-top:' + (i > 0 ? styles.gap + 'px' : '0') + ';">';
                inner += '<span class="acf-preview-card-label">' + escHtml(f.sub_fields[i].label || f.sub_fields[i].name) + '</span>';
                inner += renderPreviewField(f.sub_fields[i]);
                inner += '</div>';
            }
            return '<div style="border-left:2px solid ' + styles.borderColor + ';padding-left:12px;margin-top:6px;">' + inner + '</div>';
        }

        if (t === 'repeater' && f.sub_fields && f.sub_fields.length > 0) {
            // FAQ accordion mode
            if (isFaq && f.name === 'faq_items' && f.sub_fields.length >= 2) {
                var faqItems = '';
                var questions = [
                    ['Как это работает?', 'Наш сервис позволяет создать кастомные поля для WordPress без написания кода. Просто выберите типы полей, настройте параметры — и получите готовый PHP-код.'],
                    ['Сколько это стоит?', 'Генератор полностью бесплатный. Вы можете создать неограниченное количество групп полей без каких-либо ограничений.'],
                    ['Нужно ли знать PHP?', 'Нет. Генератор сам создаст весь необходимый код. Вам останется только скопировать его в файл темы. Но если вы знаете PHP — можете доработать шаблон под себя.']
                ];
                for (var qi = 0; qi < questions.length; qi++) {
                    faqItems += '<div class="acf-faq-item' + (qi === 0 ? ' open' : '') + '">';
                    faqItems += '<div class="acf-faq-question" onclick="this.parentElement.classList.toggle(\'open\')">';
                    faqItems += escHtml(questions[qi][0]);
                    faqItems += '</div>';
                    faqItems += '<div class="acf-faq-answer"><div style="padding-top:6px;">' + escHtml(questions[qi][1]) + '</div></div>';
                    faqItems += '</div>';
                }
                return '<div style="display:flex;flex-direction:column;gap:' + styles.gap + 'px;margin-top:6px;" class="acf-faq-list">' + faqItems + '</div>';
            }
            // Standard repeater
            var items = '';
            for (var r = 0; r < 2; r++) {
                items += '<div class="acf-preview-card" style="margin-bottom:' + styles.gap + 'px;">';
                items += '<span class="acf-preview-card-label" style="font-size:0.65rem;">Строка ' + (r+1) + '</span>';
                for (var ri = 0; ri < f.sub_fields.length; ri++) {
                    var sf = f.sub_fields[ri];
                    if (sf.type === 'tab') continue;
                    items += '<div style="margin-top:4px;">';
                    items += '<span style="font-size:0.65rem;opacity:0.5;">' + escHtml(sf.label || sf.name) + ': </span>';
                    items += renderPreviewField(sf);
                    items += '</div>';
                }
                items += '</div>';
            }
            return '<div style="margin-top:6px;">' + items + '<div style="font-size:0.65rem;opacity:0.4;text-align:center;">+ Добавить строку</div></div>';
        }

        if (t === 'flexible_content' && f.layouts && f.layouts.length > 0) {
            var lay = f.layouts[0];
            var layHtml = '<div class="acf-preview-card">';
            layHtml += '<span class="acf-preview-card-label">Макет: ' + escHtml(lay.label || lay.name) + '</span>';
            if (lay.sub_fields) {
                for (var li = 0; li < lay.sub_fields.length; li++) {
                    var lsf = lay.sub_fields[li];
                    if (lsf.type === 'tab') continue;
                    layHtml += '<div style="margin-top:4px;">';
                    layHtml += '<span style="font-size:0.65rem;opacity:0.5;">' + escHtml(lsf.label || lsf.name) + ': </span>';
                    layHtml += renderPreviewField(lsf);
                    layHtml += '</div>';
                }
            }
            layHtml += '</div>';
            if (f.layouts.length > 1) {
                layHtml += '<div style="font-size:0.65rem;opacity:0.4;text-align:center;margin-top:4px;">+ ' + (f.layouts.length - 1) + ' макетов</div>';
            }
            return '<div style="margin-top:6px;">' + layHtml + '<div style="font-size:0.65rem;opacity:0.4;text-align:center;margin-top:4px;">+ Добавить блок</div></div>';
        }

        return getDummyValue(f);
    }

    if (fields.length === 0) {
        return '<html><body style="margin:0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:200px;color:#999;font-size:14px;">Нет полей для превью</body></html>';
    }

    var html = '<div class="acf-preview-block">';
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (f.type === 'tab' || f.type === 'message') {
            html += renderPreviewField(f);
            continue;
        }
        html += '<div class="acf-preview-card">';
        html += '<span class="acf-preview-card-label">' + escHtml(f.label || f.name) + '</span>';
        html += renderPreviewField(f);
        html += '</div>';
    }
    html += '<div class="acf-preview-meta">ACF Preview · ' + fields.length + ' fields</div>';
    html += '</div>';

    return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' + css + '</style></head><body style="margin:0;padding:0;">' + html + '</body></html>';
}

function updatePreview() {
    var container = document.getElementById('preview-container');
    var iframe = document.getElementById('preview-frame');
    var indicator = document.getElementById('preview-synced-indicator');
    if (!container || !iframe) return;

    // In preview mode, CSS controls visibility — don't set inline display
    if (previewModeActive) {
        if (currentCodeTab === 'preview') {
            var previewDoc = generatePreviewHTML();
            iframe.srcdoc = previewDoc;
            if (indicator) indicator.style.display = '';
        }
        return;
    }

    if (currentCodeTab === 'preview') {
        container.style.display = '';
        var previewDoc = generatePreviewHTML();
        iframe.srcdoc = previewDoc;
        if (indicator) indicator.style.display = '';
        // Also update code output so copy/download works in preview tab
        document.getElementById('code-output').textContent = generatePreviewCSS() + '\n\n' + previewHTMLPlain();
    } else {
        container.style.display = 'none';
        if (indicator) indicator.style.display = 'none';
    }
}

function previewHTMLPlain() {
    // Generate a plain HTML representation of the preview block (without CSS, for copying)
    if (fields.length === 0) return '<!-- No fields -->';
    var html = [];
    html.push('<section class="acf-section">');
    for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        html.push('  <div class="acf-field acf-field--' + (f.name || 'field') + '">');
        html.push('    <div class="acf-field__label">' + escHtml(f.label || f.name || 'Field') + '</div>');
        html.push('    <div class="acf-field__value"><!-- ' + (f.type || 'text') + ' --></div>');
        html.push('  </div>');
    }
    html.push('</section>');
    return html.join('\n');
}

function generatePreviewCSS() {
    var styles = blockStyles;
    return [
        '/* Preview Block Styles */',
        '.acf-section {',
        '  background: ' + styles.bgColor + ';',
        '  color: ' + styles.textColor + ';',
        '  padding: ' + styles.padding + 'px;',
        '  display: flex;',
        '  flex-direction: column;',
        '  gap: ' + styles.gap + 'px;',
        '}',
        '.acf-field {',
        '  background: ' + styles.cardBg + ';',
        '  padding: ' + styles.cardPadding + 'px;',
        '  border-radius: ' + styles.cardRadius + 'px;',
        '  border: ' + styles.borderWidth + 'px solid ' + styles.borderColor + ';',
        '}',
        '.acf-field__label {',
        '  font-size: 0.75rem;',
        '  text-transform: uppercase;',
        '  letter-spacing: 0.05em;',
        '  opacity: 0.6;',
        '  margin-bottom: 4px;',
        '}',
        '.acf-field__value { font-weight: 500; }',
        '/* FAQ Accordion */',
        '.acf-faq-item {',
        '  border: ' + styles.borderWidth + 'px solid ' + styles.borderColor + ';',
        '  border-radius: ' + styles.cardRadius + 'px;',
        '  overflow: hidden;',
        '  background: ' + styles.cardBg + ';',
        '}',
        '.acf-faq-question {',
        '  padding: ' + styles.cardPadding + 'px;',
        '  font-weight: 600;',
        '  cursor: pointer;',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: space-between;',
        '  user-select: none;',
        '}',
        '.acf-faq-question::after { content: "+"; font-size: 1.3rem; opacity: 0.4; transition: transform 0.25s; }',
        '.acf-faq-item.open .acf-faq-question::after { content: "\\2212"; }',
        '.acf-faq-answer {',
        '  max-height: 0;',
        '  overflow: hidden;',
        '  transition: max-height 0.3s ease;',
        '  padding: 0 ' + styles.cardPadding + 'px;',
        '}',
        '.acf-faq-item.open .acf-faq-answer {',
        '  max-height: 500px;',
        '  padding: 0 ' + styles.cardPadding + 'px ' + styles.cardPadding + 'px;',
        '}',
        '/* Responsive */',
        '@media (max-width: 768px) {',
        '  .acf-section { padding: ' + Math.max(parseInt(styles.padding) - 8, 8) + 'px; }',
        '  .acf-field { padding: ' + Math.max(parseInt(styles.cardPadding) - 6, 8) + 'px; }',
        '  .acf-faq-question { padding: ' + Math.max(parseInt(styles.cardPadding) - 4, 10) + 'px; }',
        '}',
        '@media (max-width: 480px) {',
        '  .acf-section { padding: 12px; gap: 10px; }',
        '  .acf-field { padding: 12px; border-radius: 8px; }',
        '}',
        ''
    ].join('\n');
}

// ==================== STYLE EDITOR ====================
function applyStyleChange(id, value) {
    var map = {
        'se-bg-color': 'bgColor',
        'se-text-color': 'textColor',
        'se-padding': 'padding',
        'se-gap': 'gap',
        'se-card-bg': 'cardBg',
        'se-card-padding': 'cardPadding',
        'se-card-radius': 'cardRadius',
        'se-border-color': 'borderColor',
        'se-border-width': 'borderWidth'
    };
    var key = map[id];
    if (key) {
        blockStyles[key] = value;
        syncStyleTextFields();
        if (currentCodeTab === 'html') generateHTML();
        if (currentCodeTab === 'preview') updatePreview();
        if (previewModeActive) renderVisualEditor();
    }
}

function applyStyleColor(id, value) {
    var map = {
        'se-bg-color': 'bgColor',
        'se-text-color': 'textColor',
        'se-card-bg': 'cardBg',
        'se-border-color': 'borderColor'
    };
    var key = map[id];
    var textId = id + '-text';
    if (key) {
        blockStyles[key] = value;
        var textEl = document.getElementById(textId);
        if (textEl) textEl.value = value;
        if (currentCodeTab === 'html') generateHTML();
        if (currentCodeTab === 'preview') updatePreview();
        if (previewModeActive) renderVisualEditor();
    }
}

function syncStyleTextFields() {
    var map = [
        ['se-bg-color-text', 'bgColor'],
        ['se-text-color-text', 'textColor'],
        ['se-card-bg-text', 'cardBg'],
        ['se-border-color-text', 'borderColor']
    ];
    for (var i = 0; i < map.length; i++) {
        var el = document.getElementById(map[i][0]);
        if (el) el.value = blockStyles[map[i][1]];
    }
}

function ensureElementStyles() {
    var defaults = getDefaultElementStyles();
    if (!blockStyles.elements) blockStyles.elements = {};
    Object.keys(defaults).forEach(function(key) {
        if (!blockStyles.elements[key]) blockStyles.elements[key] = {};
        Object.keys(defaults[key]).forEach(function(prop) {
            if (blockStyles.elements[key][prop] === undefined) {
                blockStyles.elements[key][prop] = defaults[key][prop];
            }
        });
    });
    return blockStyles.elements;
}

function collectFieldTypes(list, out) {
    out = out || {};
    for (var i = 0; i < list.length; i++) {
        var f = list[i];
        if (!f || !f.type) continue;
        out[f.type] = true;
        if (f.sub_fields) collectFieldTypes(f.sub_fields, out);
        if (f.layouts) {
            for (var li = 0; li < f.layouts.length; li++) {
                collectFieldTypes(f.layouts[li].sub_fields || [], out);
            }
        }
    }
    return out;
}

function renderElementStyleControl(styleKey, prop, label, type, unit) {
    var styles = ensureElementStyles();
    var value = styles[styleKey][prop] || '';
    var isColor = type === 'color';
    return '<div class="se-mini-row">' +
        '<span class="se-label">' + escHtml(label) + '</span>' +
        (isColor ? '<input type="color" class="se-color" value="' + escAttr(value) + '" data-action="element-style-change" data-style-key="' + escAttr(styleKey) + '" data-style-prop="' + escAttr(prop) + '">' : '<span></span>') +
        '<input type="text" class="se-input" value="' + escAttr(value) + '" data-action="element-style-change" data-style-key="' + escAttr(styleKey) + '" data-style-prop="' + escAttr(prop) + '">' +
        '<span class="se-unit">' + escHtml(unit || '') + '</span>' +
    '</div>';
}

function renderElementStyleGroup(styleKey, title, subtitle, controls) {
    return '<div class="se-row-group" data-style-key="' + escAttr(styleKey) + '">' +
        '<div class="se-row-group-title">' + escHtml(title) + (subtitle ? '<small>' + escHtml(subtitle) + '</small>' : '') + '</div>' +
        '<div class="se-dynamic-grid">' + controls.join('') + '</div>' +
    '</div>';
}

function renderDynamicStyleControls() {
    var container = document.getElementById('dynamic-style-controls');
    if (!container) return;
    ensureElementStyles();
    if (!fields.length) {
        container.innerHTML = '<p class="se-dynamic-note">Добавьте поля, и здесь появятся настройки конкретных элементов превью.</p>';
        return;
    }

    var types = collectFieldTypes(fields);
    var groups = [];
    groups.push(renderElementStyleGroup('title', 'Заголовок блока', 'heading', [
        renderElementStyleControl('title', 'color', 'Цвет', 'color'),
        renderElementStyleControl('title', 'fontSize', 'Размер', 'text', 'px'),
        renderElementStyleControl('title', 'marginBottom', 'Низ', 'text', 'px')
    ]));
    groups.push(renderElementStyleGroup('label', 'Подписи полей', 'label', [
        renderElementStyleControl('label', 'color', 'Цвет', 'color'),
        renderElementStyleControl('label', 'fontSize', 'Размер', 'text', 'px'),
        renderElementStyleControl('label', 'marginBottom', 'Низ', 'text', 'px')
    ]));
    groups.push(renderElementStyleGroup('value', 'Значение поля', 'value/card', [
        renderElementStyleControl('value', 'color', 'Текст', 'color'),
        renderElementStyleControl('value', 'bgColor', 'Фон', 'color'),
        renderElementStyleControl('value', 'padding', 'Отступ', 'text', 'px'),
        renderElementStyleControl('value', 'radius', 'Радиус', 'text', 'px')
    ]));

    if (types.link) {
        groups.push(renderElementStyleGroup('button', 'Кнопка / ссылка', 'link field', [
            renderElementStyleControl('button', 'color', 'Текст', 'color'),
            renderElementStyleControl('button', 'bgColor', 'Фон', 'color'),
            renderElementStyleControl('button', 'padding', 'Отступ', 'text', 'px'),
            renderElementStyleControl('button', 'radius', 'Радиус', 'text', 'px')
        ]));
    }
    if (types.image || types.gallery || types.file || types.oembed || types.google_map || types.post_object || types.relationship || types.user) {
        groups.push(renderElementStyleGroup('media', 'Медиа и плейсхолдеры', 'image/gallery/file', [
            renderElementStyleControl('media', 'bgColor', 'Фон', 'color'),
            renderElementStyleControl('media', 'radius', 'Радиус', 'text', 'px')
        ]));
    }
    if (types.repeater) {
        groups.push(renderElementStyleGroup('repeater', 'Повторители', 'repeater rows', [
            renderElementStyleControl('repeater', 'gap', 'Промежуток', 'text', 'px'),
            renderElementStyleControl('repeater', 'avatarBg', 'Аватар', 'color')
        ]));
    }
    if (types.flexible_content) {
        groups.push(renderElementStyleGroup('flex', 'Flexible layout', 'sections', [
            renderElementStyleControl('flex', 'accentColor', 'Акцент', 'color'),
            renderElementStyleControl('flex', 'bgColor', 'Фон', 'text')
        ]));
    }
    if (types.repeater && fields.length === 1 && fields[0].sub_fields && fields[0].sub_fields.length === 2) {
        groups.push(renderElementStyleGroup('faq', 'FAQ элементы', 'accordion', [
            renderElementStyleControl('faq', 'questionBg', 'Вопрос', 'color'),
            renderElementStyleControl('faq', 'answerColor', 'Ответ', 'color')
        ]));
    }

    container.innerHTML = '<p class="se-dynamic-note">Эти контролы собираются из текущих полей и меняют те же элементы, которые видны в превью и HTML+CSS экспорте.</p>' + groups.join('');
    if (selectedStyleTarget) setActiveStyleGroup(selectedStyleTarget, false);
}

function refreshStyledOutputs() {
    if (currentCodeTab === 'html') generateHTML();
    if (currentCodeTab === 'preview') updatePreview();
    if (previewModeActive) renderVisualEditor();
}

function applyElementStyleChange(el) {
    var styleKey = el.getAttribute('data-style-key');
    var prop = el.getAttribute('data-style-prop');
    if (!styleKey || !prop) return;
    var styles = ensureElementStyles();
    if (!styles[styleKey]) styles[styleKey] = {};
    styles[styleKey][prop] = el.value;

    var peers = document.querySelectorAll('[data-action="element-style-change"][data-style-key="' + styleKey + '"][data-style-prop="' + prop + '"]');
    for (var i = 0; i < peers.length; i++) {
        if (peers[i] !== el) peers[i].value = el.value;
    }
    refreshStyledOutputs();
}

function setActiveStyleGroup(styleKey, shouldScroll) {
    var groups = document.querySelectorAll('#dynamic-style-controls .se-row-group');
    for (var i = 0; i < groups.length; i++) {
        groups[i].classList.toggle('is-active', groups[i].getAttribute('data-style-key') === styleKey);
    }
    var target = document.querySelector('#dynamic-style-controls .se-row-group[data-style-key="' + styleKey + '"]');
    if (target && shouldScroll) {
        target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function handleVisualStyleTarget(styleKey) {
    if (!styleKey) return;
    selectedStyleTarget = styleKey;
    setActiveStyleGroup(styleKey, true);
    var editor = document.getElementById('style-editor');
    if (editor && editor.classList.contains('collapsed')) {
        editor.classList.remove('collapsed');
    }
}

function resetStyles() {
    blockStyles = {
        bgColor: '#ffffff',
        textColor: '#1a1a2e',
        padding: '24',
        gap: '16',
        cardBg: '#f8f9fa',
        cardPadding: '20',
        cardRadius: '12',
        borderColor: '#e0e0e0',
        borderWidth: '1',
        elements: getDefaultElementStyles()
    };
    // Reset UI
    var defaults = {
        'se-bg-color': '#ffffff', 'se-bg-color-text': '#ffffff',
        'se-text-color': '#1a1a2e', 'se-text-color-text': '#1a1a2e',
        'se-padding': '24', 'se-gap': '16',
        'se-card-bg': '#f8f9fa', 'se-card-bg-text': '#f8f9fa',
        'se-card-padding': '20', 'se-card-radius': '12',
        'se-border-color': '#e0e0e0', 'se-border-color-text': '#e0e0e0',
        'se-border-width': '1'
    };
    var keys = Object.keys(defaults);
    for (var i = 0; i < keys.length; i++) {
        var el = document.getElementById(keys[i]);
        if (el) el.value = defaults[keys[i]];
    }
    renderDynamicStyleControls();
    refreshStyledOutputs();
    showToast('Стили сброшены');
}

function toggleStyleEditor() {
    var el = document.getElementById('style-editor');
    if (!el) return;
    el.classList.toggle('collapsed');
}

// ==================== FULL PREVIEW MODE ====================
var fullPreviewActive = false;
var _savedStyleEditorParent = null;
var _savedStyleEditorNext = null;

function toggleFullPreview() {
    fullPreviewActive = !fullPreviewActive;
    var grid = document.querySelector('.gen-grid');
    var btn = document.getElementById('full-preview-btn');
    var previewLayout = document.querySelector('.preview-layout');
    var mainEditor = document.getElementById('style-editor');

    if (fullPreviewActive) {
        grid.classList.add('full-preview');
        btn.classList.add('active');
        btn.innerHTML = '<span class="material-symbols-outlined">close_fullscreen</span> Свернуть';
        if (previewLayout && mainEditor) {
            _savedStyleEditorParent = mainEditor.parentNode;
            _savedStyleEditorNext = mainEditor.nextSibling;
            previewLayout.appendChild(mainEditor);
            mainEditor.style.marginTop = '0';
            mainEditor.style.maxWidth = '360px';
            mainEditor.style.flexShrink = '0';
            mainEditor.classList.remove('collapsed');
        }
        if (currentCodeTab !== 'preview') {
            switchCodeTab('preview');
        }
    } else {
        grid.classList.remove('full-preview');
        btn.classList.remove('active');
        btn.innerHTML = '<span class="material-symbols-outlined">open_in_full</span> Развернуть';
        if (mainEditor && _savedStyleEditorParent) {
            mainEditor.style.marginTop = '18px';
            mainEditor.style.maxWidth = '';
            mainEditor.style.flexShrink = '';
            if (_savedStyleEditorNext) {
                _savedStyleEditorParent.insertBefore(mainEditor, _savedStyleEditorNext);
            } else {
                _savedStyleEditorParent.appendChild(mainEditor);
            }
        }
    }
}

// ==================== PREVIEW MODE (TOGGLE BUILDER + VISUAL EDITOR) ====================
function togglePreviewMode() {
    previewModeActive = !previewModeActive;
    var ws = document.querySelector('.generator-workspace');
    var btn = document.getElementById('toggle-preview-btn');

    if (previewModeActive) {
        ws.classList.add('preview-mode');
        if (btn) {
            btn.classList.add('active');
            btn.innerHTML = '<span class="material-symbols-outlined">edit</span> Режим редактора';
        }
        // Populate both preview frame (HTML render) and visual editor
        var previewFrame = document.getElementById('preview-frame');
        if (previewFrame) {
            previewFrame.srcdoc = generatePreviewHTML();
        }
        renderVisualEditor();
    } else {
        ws.classList.remove('preview-mode');
        if (btn) {
            btn.classList.remove('active');
            btn.innerHTML = '<span class="material-symbols-outlined">visibility</span> Режим превью';
        }
    }
}

// ==================== VISUAL EDITOR ====================
function getPlaceholderSVG() {
    return 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">' +
        '<rect width="400" height="200" fill="#e8e8e8"/>' +
        '<rect width="400" height="200" fill="url(#g)"/>' +
        '<defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse">' +
        '<rect x="10" y="0" width="2" height="20" fill="#dcdcdc" opacity="0.5"/>' +
        '<rect x="0" y="10" width="20" height="2" fill="#dcdcdc" opacity="0.5"/>' +
        '</pattern></defs>' +
        '<g transform="translate(180,75)" fill="#aaa">' +
        '<rect x="0" y="0" width="40" height="30" rx="3"/>' +
        '<circle cx="10" cy="15" r="4" fill="#ccc"/>' +
        '<rect x="24" y="8" width="16" height="3" rx="1.5" fill="#ccc"/>' +
        '<rect x="24" y="14" width="12" height="3" rx="1.5" fill="#ccc"/>' +
        '<rect x="24" y="20" width="14" height="3" rx="1.5" fill="#ccc"/>' +
        '</g>' +
        '<text x="200" y="165" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#aaa">Placeholder</text>' +
        '</svg>'
    );
}

function generateVisualHTML(options) {
    var opts = options || {};
    var fullDocument = opts.fullDocument !== false;
    var styles = blockStyles;
    var elementStyles = styles.elements || ensureElementStyles();
    var e = elementStyles;
    var groupTitle = document.getElementById('group-title').value || '';
    var isFAQ = fields.length === 1 && fields[0].type === 'repeater' &&
                fields[0].sub_fields && fields[0].sub_fields.length === 2 &&
                fields[0].sub_fields[0].name && fields[0].sub_fields[0].name.indexOf('question') !== -1;

    var css = [
        '.acf-block{box-sizing:border-box;max-width:800px;margin:0 auto;padding:' + (fullDocument ? '0' : styles.padding + 'px') + ';background:' + (fullDocument ? 'transparent' : styles.bgColor) + ';color:' + styles.textColor + ';font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;}',
        '.acf-block *{box-sizing:border-box;}',
        '.acf-block :where(h1,h2,h3,p,ul,ol,figure){margin:0;}',
        '.acf-block-title{font-size:' + e.title.fontSize + 'px;font-weight:700;margin-bottom:' + e.title.marginBottom + 'px;color:' + e.title.color + ';}',
        '.acf-field{margin-bottom:' + styles.gap + 'px;}',
        '.acf-field:last-child{margin-bottom:0;}',
        '.acf-label{font-size:' + e.label.fontSize + 'px;text-transform:uppercase;letter-spacing:0.07em;font-weight:600;color:' + e.label.color + ';margin-bottom:' + e.label.marginBottom + 'px;}',
        '.acf-value{color:' + e.value.color + ';background:' + e.value.bgColor + ';padding:' + e.value.padding + 'px;border-radius:' + e.value.radius + 'px;border:' + styles.borderWidth + 'px solid ' + styles.borderColor + ';}',
        '.acf-value--text{font-size:0.95rem;}',
        '.acf-value--textarea{font-size:0.9rem;white-space:pre-wrap;min-height:60px;line-height:1.7;}',
        '.acf-value--number{font-family:"JetBrains Mono","SF Mono",monospace;font-size:1.1rem;font-weight:600;}',
        '.acf-value--email,.acf-value--url{color:#6366f1;text-decoration:underline;text-underline-offset:2px;cursor:pointer;}',
        '.acf-img{width:100%;aspect-ratio:16/9;border-radius:' + e.media.radius + 'px;background:' + e.media.bgColor + ';display:flex;align-items:center;justify-content:center;color:#6366f1;font-size:1.5rem;}',
        '.acf-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}',
        '.acf-gallery-item{aspect-ratio:1;border-radius:' + e.media.radius + 'px;background:' + e.media.bgColor + ';}',
        '.acf-btn{display:inline-block;padding:' + e.button.padding + 'px 28px;background:' + e.button.bgColor + ';color:' + e.button.color + ';border-radius:' + e.button.radius + 'px;text-decoration:none;font-weight:600;font-size:0.9rem;}',
        '.acf-badge{display:inline-block;padding:4px 12px;border-radius:999px;font-size:0.75rem;font-weight:600;}',
        '.acf-badge--yes{background:#dcfce7;color:#166534;}',
        '.acf-badge--no{background:#fee2e2;color:#991b1b;}',
        '.acf-color{display:inline-flex;align-items:center;gap:8px;}',
        '.acf-color span{width:24px;height:24px;border-radius:4px;border:1px solid rgba(0,0,0,0.1);flex-shrink:0;}',
        '.acf-file-card{display:flex;align-items:center;gap:12px;padding:12px;border:1px dashed ' + styles.borderColor + ';border-radius:8px;}',
        '.acf-file-card svg{flex-shrink:0;opacity:0.35;}',
        '.acf-file-name{font-size:0.85rem;font-weight:500;}',
        '.acf-file-size{font-size:0.75rem;opacity:0.45;}',
        '.acf-map{height:180px;border-radius:' + e.media.radius + 'px;background:' + e.media.bgColor + ';display:flex;align-items:center;justify-content:center;color:#3b82f6;font-size:0.85rem;gap:6px;}',
        '.acf-oembed{aspect-ratio:16/9;border-radius:' + e.media.radius + 'px;background:#0f0f23;display:flex;align-items:center;justify-content:center;}',
        '.acf-oembed svg{opacity:0.6;}',
        '.acf-repeater{display:grid;gap:' + e.repeater.gap + 'px;}',
        '.acf-repeater-item{display:flex;gap:14px;align-items:flex-start;}',
        '.acf-avatar{width:48px;height:48px;border-radius:50%;flex-shrink:0;background:' + e.repeater.avatarBg + ';display:flex;align-items:center;justify-content:center;color:#6366f1;font-weight:700;font-size:1rem;}',
        '.acf-info{flex:1;min-width:0;}',
        '.acf-name{font-weight:600;font-size:0.95rem;}',
        '.acf-role{font-size:0.8rem;opacity:0.5;margin-top:2px;}',
        '.acf-bio{font-size:0.85rem;opacity:0.7;margin-top:4px;line-height:1.55;}',
        '.acf-company{font-size:0.8rem;font-weight:500;opacity:0.55;margin-top:2px;}',
        '.acf-faq-item{border:' + styles.borderWidth + 'px solid ' + styles.borderColor + ';border-radius:' + styles.cardRadius + 'px;overflow:hidden;margin-bottom:8px;background:' + styles.cardBg + ';}',
        '.acf-faq-item:last-child{margin-bottom:0;}',
        '.acf-faq-question{padding:' + styles.cardPadding + 'px;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none;border:none;width:100%;text-align:left;font-size:0.95rem;color:' + styles.textColor + ';font-family:inherit;background:' + e.faq.questionBg + ';}',
        '.acf-faq-question::after{content:"+";font-size:1.2rem;opacity:0.35;transition:transform 0.2s;}',
        '.acf-faq-answer{padding:0 ' + styles.cardPadding + 'px;max-height:0;overflow:hidden;transition:all 0.3s;font-size:0.9rem;color:' + e.faq.answerColor + ';line-height:1.65;}',
        '.acf-faq-item.open .acf-faq-question::after{content:"−";transform:rotate(180deg);}',
        '.acf-faq-item.open .acf-faq-answer{max-height:200px;padding-bottom:' + styles.cardPadding + 'px;}',
        '.acf-post-card{display:flex;gap:12px;align-items:center;padding:12px;border:1px solid ' + styles.borderColor + ';border-radius:8px;}',
        '.acf-post-thumb{width:56px;height:56px;border-radius:' + e.media.radius + 'px;background:' + e.media.bgColor + ';flex-shrink:0;}',
        '.acf-post-title{font-weight:600;font-size:0.9rem;}',
        '.acf-post-meta{font-size:0.75rem;opacity:0.45;margin-top:2px;}',
        '.acf-group{padding:16px;border:1px dashed ' + styles.borderColor + ';border-radius:8px;}',
        '.acf-flex-layout{margin-bottom:12px;padding:12px 16px;border-left:3px solid ' + e.flex.accentColor + ';background:' + e.flex.bgColor + ';border-radius:0 6px 6px 0;}',
        '.acf-flex-layout:last-child{margin-bottom:0;}',
        '.acf-flex-layout-title{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.06em;opacity:0.4;margin-bottom:10px;font-weight:600;}',
    ];
    if (fullDocument) {
        css.unshift(
            '*{box-sizing:border-box;margin:0;padding:0;}',
            'body{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.6;color:' + styles.textColor + ';background:' + styles.bgColor + ';padding:' + styles.padding + 'px;}'
        );
        css.push(
            '[data-style-target]{cursor:pointer;}',
            '.acf-style-selected{outline:2px solid #7c3aed;outline-offset:3px;}'
        );
    }
    css = css.join('\n');

    function T(key) {
        return fullDocument ? ' data-style-target="' + key + '"' : '';
    }

    function V(content, cls) {
        return '<div class="acf-value' + (cls ? ' ' + cls : '') + '"' + T('value') + '>' + (content || '') + '</div>';
    }

    function F(body) {
        if (!body) return '';
        return '<div class="acf-field">' + body + '</div>';
    }

    function L(text) {
        return '<div class="acf-label"' + T('label') + '>' + escHtml(text || '') + '</div>';
    }

    function iconImg() {
        return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
    }

    function iconFile() {
        return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
    }

    function iconMap() {
        return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    }

    function iconPlay() {
        return '<svg width="40" height="40" viewBox="0 0 24 24" fill="white" opacity="0.7"><polygon points="6,3 20,12 6,21"/></svg>';
    }

    function renderField(f, nested) {
        var t = f.type || 'text';
        var label = f.label || f.name || '';
        var name = f.name || '';
        nested = !!nested;

        if (t === 'tab') return '';

        if (t === 'message') {
            return F('<div style="padding:12px 16px;background:rgba(251,191,36,0.08);border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;font-size:0.85rem;">' + escHtml(f.message || label) + '</div>');
        }

        var body = '';

        if (t === 'image') {
            body = '<div class="acf-img"' + T('media') + '>' + iconImg() + '</div>';
        } else if (t === 'gallery') {
            var g = '<div class="acf-gallery"' + T('media') + '>';
            for (var gi = 0; gi < 3; gi++) g += '<div class="acf-gallery-item"' + T('media') + '></div>';
            g += '</div>';
            body = g;
        } else if (t === 'link') {
            body = V('<a class="acf-btn" href="#"' + T('button') + '>' + escHtml(f.title || name || 'Перейти') + '</a>');
        } else if (t === 'true_false') {
            var tfVal = (f.default_value === 1 || f.default_value === '1');
            body = V('<span class="acf-badge ' + (tfVal ? 'acf-badge--yes' : 'acf-badge--no') + '">' + (tfVal ? '✓ ' + escHtml(f.message || 'Да') : '✗ ' + escHtml(f.message || 'Нет')) + '</span>');
        } else if (t === 'textarea' || t === 'wysiwyg') {
            body = V(escHtml(f.default_value || 'Содержимое текстового блока. Несколько абзацев с форматированием, списками и другими элементами контента.'), 'acf-value--textarea');
        } else if (t === 'number') {
            body = V(f.default_value || '42', 'acf-value--number');
        } else if (t === 'email') {
            body = V('hello@example.com', 'acf-value--email');
        } else if (t === 'url') {
            body = V('https://example.com', 'acf-value--url');
        } else if (t === 'select' || t === 'radio') {
            var ch = f.choices || {};
            var ck = Object.keys(ch);
            body = V(escHtml(ch[ck[0]] || 'Выбранный вариант'));
        } else if (t === 'checkbox') {
            var cc = f.choices || {};
            var ckeys = Object.keys(cc).slice(0, 2);
            body = V(ckeys.map(function(k){return '☑ ' + escHtml(cc[k] || k);}).join('  '));
        } else if (t === 'date_picker') {
            body = V('15 июня 2026');
        } else if (t === 'date_time_picker') {
            body = V('15 июня 2026, 14:30');
        } else if (t === 'time_picker') {
            body = V('14:30');
        } else if (t === 'color_picker') {
            var clr = f.default_value || '#6366f1';
            body = V('<span class="acf-color"><span style="background:' + clr + '"></span> ' + clr + '</span>');
        } else if (t === 'password') {
            body = V('••••••••');
        } else if (t === 'oembed') {
            body = '<div class="acf-oembed"' + T('media') + '>' + iconPlay() + '</div>';
        } else if (t === 'file') {
            body = '<div class="acf-file-card"' + T('media') + '>' + iconFile() + '<div><div class="acf-file-name">document.pdf</div><div class="acf-file-size">2.4 МБ</div></div></div>';
        } else if (t === 'google_map') {
            body = '<div class="acf-map"' + T('media') + '>' + iconMap() + ' Карта</div>';
        } else if (t === 'post_object' || t === 'relationship') {
            body = '<div class="acf-post-card"' + T('media') + '><div class="acf-post-thumb"></div><div><div class="acf-post-title">Выбранная запись</div><div class="acf-post-meta">ID: 42</div></div></div>';
        } else if (t === 'taxonomy') {
            body = V('Категория 1, Метка 2');
        } else if (t === 'user') {
            body = '<div class="acf-repeater-item"' + T('repeater') + '><div class="acf-avatar"' + T('repeater') + '>И</div><div class="acf-info"><div class="acf-name">Иван Петров</div><div class="acf-role">editor</div></div></div>';
        } else if (t === 'group' && f.sub_fields && f.sub_fields.length) {
            var gin = '';
            for (var gsi = 0; gsi < f.sub_fields.length; gsi++) {
                gin += renderField(f.sub_fields[gsi], true);
            }
            body = '<div class="acf-group">' + gin + '</div>';
        } else if (t === 'repeater' && f.sub_fields && f.sub_fields.length) {
            var sfAll = f.sub_fields.map(function(s){return (s.name||'').toLowerCase();});
            var hasQ = sfAll.some(function(n){return n.indexOf('question')!==-1;});
            var hasA = sfAll.some(function(n){return n.indexOf('answer')!==-1;});
            var faqMode = f.sub_fields.length === 2 && hasQ && hasA;

            if (faqMode) {
                var faqs = [
                    ['Как воспользоваться сервисом?', 'Выберите подходящий тариф, заполните форму заказа и наш менеджер свяжется с вами в течение 15 минут.'],
                    ['Какие гарантии вы даёте?', 'Мы гарантируем качество всех услуг. Если результат вас не устроит, вернём деньги или переделаем бесплатно.'],
                    ['Сколько времени занимает выполнение?', 'Стандартное время выполнения — от 1 до 3 рабочих дней. Срочные заказы обрабатываются за 2–4 часа.']
                ];
                body = '';
                for (var fi = 0; fi < faqs.length; fi++) {
                    body += '<div class="acf-faq-item' + (fi === 0 ? ' open' : '') + '"' + T('faq') + '><button class="acf-faq-question"' + T('faq') + '>' + escHtml(faqs[fi][0]) + '</button><div class="acf-faq-answer"' + T('faq') + '>' + escHtml(faqs[fi][1]) + '</div></div>';
                }
            } else {
                body = '<div class="acf-repeater"' + T('repeater') + '>';
                for (var ri = 0; ri < 2; ri++) {
                    var hasImg = false;
                    body += '<div class="acf-repeater-item"' + T('repeater') + '>';
                    for (var si = 0; si < f.sub_fields.length; si++) {
                        var sf = f.sub_fields[si];
                        if (sf.type === 'image') {
                            body += '<div class="acf-avatar"' + T('repeater') + '>' + (ri === 0 ? 'А' : 'М') + '</div>';
                            hasImg = true;
                            break;
                        }
                    }
                    body += '<div class="acf-info">';
                    for (var sj = 0; sj < f.sub_fields.length; sj++) {
                        var sf2 = f.sub_fields[sj];
                        if (sf2.type === 'image') continue;
                        var sn = (sf2.name || '').toLowerCase();
                        var sv = sf2.default_value || '';
                        if (!sv) {
                            if (sn.indexOf('name') !== -1 || sn.indexOf('title') !== -1 || sn.indexOf('имя') !== -1 || sn.indexOf('заголовок') !== -1) sv = ri === 0 ? 'Алексей Смирнов' : 'Марина Волкова';
                            else if (sn.indexOf('role') !== -1 || sn.indexOf('position') !== -1 || sn.indexOf('job') !== -1 || sn.indexOf('должн') !== -1) sv = ri === 0 ? 'Руководитель отдела' : 'Ведущий дизайнер';
                            else if (sn.indexOf('text') !== -1 || sn.indexOf('review') !== -1 || sn.indexOf('message') !== -1 || sn.indexOf('comment') !== -1 || sn.indexOf('отзыв') !== -1 || sn.indexOf('текст') !== -1) sv = 'Отличный сервис! Всё сделали быстро и качественно.';
                            else if (sn.indexOf('company') !== -1 || sn.indexOf('компан') !== -1) sv = 'ООО «Технологии»';
                            else if (sn.indexOf('bio') !== -1 || sn.indexOf('desc') !== -1 || sn.indexOf('описан') !== -1) sv = 'Специалист с 10-летним опытом в области веб-разработки.';
                            else sv = sf2.label || sf2.name || '';
                        }
                        var scls = (sn.indexOf('name') !== -1 || sn.indexOf('title') !== -1) ? 'acf-name' :
                                   (sn.indexOf('role') !== -1 || sn.indexOf('position') !== -1 || sn.indexOf('job') !== -1) ? 'acf-role' :
                                   (sn.indexOf('company') !== -1 || sn.indexOf('компан') !== -1) ? 'acf-company' : 'acf-bio';
                        body += '<div class="' + scls + '">' + escHtml(sv) + '</div>';
                    }
                    body += '</div></div>';
                }
                body += '</div>';
            }
        } else if (t === 'flexible_content' && f.layouts && f.layouts.length) {
            body = '';
            for (var li = 0; li < Math.min(f.layouts.length, 2); li++) {
                var lay = f.layouts[li];
                body += '<div class="acf-flex-layout"' + T('flex') + '><div class="acf-flex-layout-title"' + T('flex') + '>' + escHtml(lay.label || lay.name) + '</div>';
                if (lay.sub_fields) {
                    for (var lsi = 0; lsi < lay.sub_fields.length; lsi++) {
                        body += renderField(lay.sub_fields[lsi], true);
                    }
                }
                body += '</div>';
            }
        } else {
            body = V(escHtml(f.default_value || f.placeholder || 'Значение поля'), 'acf-value--text');
        }

        if (nested) return L(label) + body;
        return F(L(label) + body);
    }

    var html = '<div class="acf-block">';
    if (groupTitle && !isFAQ) html += '<h2 class="acf-block-title"' + T('title') + '>' + escHtml(groupTitle) + '</h2>';
    for (var i = 0; i < fields.length; i++) {
        html += renderField(fields[i], false);
    }
    html += '</div>';
    if (fullDocument) {
        html += '<script>(function(){function selectTarget(el){var prev=document.querySelector(".acf-style-selected");if(prev)prev.classList.remove("acf-style-selected");if(el)el.classList.add("acf-style-selected");}document.addEventListener("click",function(e){var target=e.target.closest("[data-style-target]");if(target){selectTarget(target);parent.postMessage({source:"acf-style-target",styleKey:target.getAttribute("data-style-target")},"*");}var q=e.target.closest(".acf-faq-question");if(q)q.parentElement.classList.toggle("open");});})();</' + 'script>';
        return '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + escHtml(groupTitle) + '</title><style>' + css + '</style></head><body>' + html + '</body></html>';
    }
    if (isFAQ) {
        html += '\n<script>(function(){document.addEventListener("click",function(e){var q=e.target.closest(".acf-faq-question");if(q)q.parentElement.classList.toggle("open");});})();</' + 'script>';
    }
    return '<style>\n' + css + '\n</style>\n' + html;
}

function renderVisualEditor() {
    var iframe = document.getElementById('visual-editor-iframe');
    if (!iframe) return;
    var html = generateVisualHTML();
    iframe.srcdoc = html;
}

function updateVisualEditorIfActive() {
    if (previewModeActive) {
        renderVisualEditor();
    }
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
        if (typeof window.trackGeneratorEvent === 'function') {
            window.trackGeneratorEvent('acf_code_copied', { generator: 'acf', tab: currentCodeTab, fields: fields.length });
        }
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
        if (typeof window.trackGeneratorEvent === 'function') {
            window.trackGeneratorEvent('acf_code_copied', { generator: 'acf', tab: currentCodeTab, fields: fields.length, fallback: true });
        }
    });
}

function downloadCode() {
    var code = document.getElementById('code-output').textContent;
    if (!code || code === 'Добавьте поля — код появится здесь') {
        showToast('Добавьте поля для генерации кода', true);
        return;
    }
    var ext, mime;
    if (currentCodeTab === 'json') {
        ext = 'json'; mime = 'application/json';
    } else if (currentCodeTab === 'html') {
        ext = 'php'; mime = 'text/x-php';
        if (typeof window.renderProductionPHP === 'function') {
            code = window.renderProductionPHP();
        } else {
            code = generateWordPressTemplateHTML();
        }
    } else if (currentCodeTab === 'preview') {
        ext = 'html'; mime = 'text/html';
        code = generateVisualHTML();
    } else {
        ext = 'php'; mime = 'text/x-php';
    }
    var filename = (document.getElementById('group-key').value || 'acf-export') + '.' + ext;
    var blob = new Blob([code], { type: mime + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Файл ' + filename + ' сохранён');
    if (typeof window.trackGeneratorEvent === 'function') {
        window.trackGeneratorEvent('acf_code_downloaded', { generator: 'acf', tab: currentCodeTab, filename: filename, fields: fields.length });
    }
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

            // Validate basic structure
            if (!json || typeof json !== 'object') throw new Error('Невалидный JSON');
            if (!json.key && !json.title && !json.fields) throw new Error('Не похоже на ACF JSON (нужны key/title/fields)');

            resetAll(true);

            // Import group settings
            document.getElementById('group-title').value = json.title || '';
            document.getElementById('group-key').value = json.key || '';
            document.getElementById('group-desc').value = json.description || '';
            document.getElementById('group-style').value = json.style || 'default';
            document.getElementById('group-position').value = json.position || 'normal';
            document.getElementById('group-active').checked = json.active !== 0;

            // Import location rules (all groups)
            if (Array.isArray(json.location) && json.location.length > 0) {
                locationRules = [];
                for (var lg = 0; lg < json.location.length; lg++) {
                    var group = json.location[lg];
                    if (Array.isArray(group)) {
                        for (var lr = 0; lr < group.length; lr++) {
                            var rule = group[lr];
                            locationRules.push({
                                param: rule.param || 'post_type',
                                operator: rule.operator || '==',
                                value: rule.value || 'page'
                            });
                        }
                    }
                }
                if (locationRules.length === 0) {
                    locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
                }
            }

            fieldIdCounter = 0;

            function importFields(arr) {
                var result = [];
                for (var i = 0; i < arr.length; i++) {
                    var f = arr[i];
                    var id = ++fieldIdCounter;
                    var d = fieldDefaults(f.type || 'text');
                    d.id = id;
                    for (var k in f) {
                        if (k === 'id') continue;
                        if (k === 'sub_fields' || k === 'layouts') continue;
                        d[k] = f[k];
                    }
                    d.key = d.key || 'field_' + id;
                    d.name = d.name || 'field_' + id;
                    if (Array.isArray(f.sub_fields) && f.sub_fields.length > 0) {
                        d.sub_fields = importFields(f.sub_fields);
                    }
                    if (f.layouts) {
                        d.layouts = [];
                        if (Array.isArray(f.layouts)) {
                            for (var li = 0; li < f.layouts.length; li++) {
                                var lay = f.layouts[li];
                                d.layouts.push({
                                    name: lay.name || ('layout_' + (li+1)),
                                    label: lay.label || ('Layout ' + (li+1)),
                                    sub_fields: lay.sub_fields ? importFields(lay.sub_fields) : []
                                });
                            }
                        } else {
                            var lk = Object.keys(f.layouts);
                            for (var li2 = 0; li2 < lk.length; li2++) {
                                var lay2 = f.layouts[lk[li2]];
                                d.layouts.push({
                                    name: lay2.name || lk[li2],
                                    label: lay2.label || lk[li2],
                                    sub_fields: lay2.sub_fields ? importFields(lay2.sub_fields) : []
                                });
                            }
                        }
                    }
                    result.push(d);
                }
                return result;
            }

            if (Array.isArray(json.fields)) {
                fields = importFields(json.fields);
            }

            setTimeout(function() {
                ['group-style','group-position'].forEach(function(id) {
                    var el2 = document.getElementById(id);
                    if (el2 && el2._customSelect) {
                        el2._customSelect._selectedValue = el2.value;
                        el2._customSelect._updateTrigger();
                        el2._customSelect._rebuildOptions();
                    }
                });
            }, 50);

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

    if (name === 'field_group') {
        document.getElementById('group-title').value = 'Content Fields';
        document.getElementById('group-key').value = 'group_content_fields';
        document.getElementById('group-desc').value = 'Базовая группа ACF-полей для страницы или записи';
        locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
        var featureSubs = [
            mkSubField('text','Заголовок преимущества','feature_title'),
            mkSubField('textarea','Описание','feature_text',{new_lines:'br'}),
            mkSubField('image','Иконка','feature_icon',{return_format:'array'})
        ];
        fields = [
            mkField('text','Надзаголовок','eyebrow','Короткая подпись над заголовком'),
            mkField('text','Заголовок','content_title','Основной заголовок блока'),
            mkField('wysiwyg','Текст','content_body','Основной контент блока'),
            mkField('image','Изображение','content_image','Иллюстрация или фото',{return_format:'array'}),
            mkStruct('repeater','Преимущества','features','Список преимуществ или фактов',featureSubs,{button_label:'Добавить преимущество',min:0,max:12})
        ];
    } else if (name === 'woocommerce_product') {
        document.getElementById('group-title').value = 'WooCommerce Product Fields';
        document.getElementById('group-key').value = 'group_woocommerce_product_fields';
        document.getElementById('group-desc').value = 'Дополнительные поля для карточки товара WooCommerce';
        locationRules = [{ param: 'post_type', operator: '==', value: 'product' }];
        var specSubs = [
            mkSubField('text','Название характеристики','spec_name'),
            mkSubField('text','Значение','spec_value')
        ];
        var productFaqSubs = [
            mkSubField('text','Вопрос','product_faq_question'),
            mkSubField('textarea','Ответ','product_faq_answer',{new_lines:'wpautop'})
        ];
        fields = [
            mkField('text','Бейдж товара','product_badge','Например: хит продаж, новинка, гарантия'),
            mkStruct('repeater','Характеристики','product_specs','Таблица характеристик товара',specSubs,{button_label:'Добавить характеристику',min:0,max:50}),
            mkField('wysiwyg','Комплектация','product_package','Что входит в комплект поставки'),
            mkField('file','Инструкция','product_manual','PDF-инструкция или файл для скачивания',{return_format:'array'}),
            mkStruct('repeater','FAQ товара','product_faq','Вопросы и ответы на странице товара',productFaqSubs,{button_label:'Добавить вопрос',min:0,max:20}),
            mkField('true_false','Показывать блок доверия','show_trust_block','Включить гарантию, доставку или другие trust-маркеры',{message:'Показывать блок доверия'})
        ];
    } else if (name === 'hero') {
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
    } else if (name === 'faq') {
        document.getElementById('group-title').value = 'FAQ';
        document.getElementById('group-key').value = 'group_faq';
        document.getElementById('group-desc').value = 'Часто задаваемые вопросы';
        locationRules = [{ param: 'post_type', operator: '==', value: 'page' }];
        var faqSubs = [
            mkSubField('text','Вопрос','faq_question',{placeholder:'Ваш вопрос?'}),
            mkSubField('textarea','Ответ','faq_answer',{new_lines:'wpautop'})
        ];
        fields = [
            mkStruct('repeater','Вопросы','faq_items','Добавьте вопросы и ответы',faqSubs,{button_label:'Добавить вопрос',min:0,max:100})
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
    if (typeof window.trackGeneratorEvent === 'function') {
        window.trackGeneratorEvent('acf_template_loaded', { generator: 'acf', template: name, fields: fields.length });
    }
}

function landingContextCopy(source, preset, template) {
    var map = {
        'acf-php-generator': {
            title: 'ACF PHP генератор: структура уже загружена',
            text: 'Проверьте field names, Location rules и заберите acf_add_local_field_group для functions.php или отдельного include.',
            primaryTab: 'php'
        },
        'acf-json-generator': {
            title: 'ACF JSON генератор: можно сразу экспортировать JSON',
            text: 'Проверьте field keys, group key и скачайте JSON в папку acf-json: синхронизация между окружениями не сломает поля.',
            primaryTab: 'json'
        },
        'acf-field-group-generator': {
            title: 'ACF Field Group: базовая группа полей готова',
            text: 'Отредактируйте group key, field names, location rules и состав полей перед переносом в WordPress.',
            primaryTab: 'php'
        },
        'acf-repeater-generator': {
            title: 'ACF Repeater: повторитель уже собран',
            text: 'Проверьте повторяемый список, sub fields и цикл вывода в preview перед экспортом шаблона.',
            primaryTab: 'html'
        },
        'acf-flexible-content-generator': {
            title: 'ACF Flexible Content: layouts загружены',
            text: 'Настройте flexible content, layouts и секции страницы, затем заберите WP-шаблон+CSS.',
            primaryTab: 'html'
        },
        'acf-page-builder': {
            title: 'ACF Page Builder: flexible layouts готовы',
            text: 'Отредактируйте page builder, порядок секций и шаблон вывода, затем проверьте live preview.',
            primaryTab: 'html'
        },
        'acf-seo-fields': {
            title: 'ACF SEO поля: meta-набор загружен',
            text: 'Проверьте title, description, canonical, robots и Open Graph поля перед экспортом.',
            primaryTab: 'php'
        },
        'acf-faq-fields': {
            title: 'ACF FAQ поля: вопрос-ответ уже в repeater',
            text: 'Проверьте вопрос-ответ, аккордеон FAQ и основу под FAQPage schema, затем заберите production template.',
            primaryTab: 'html'
        },
        'acf-hero-section': {
            title: 'ACF Hero Section: поля первого экрана загружены',
            text: 'Настройте первый экран, CTA и изображение hero, затем проверьте live preview.',
            primaryTab: 'html'
        },
        'acf-team-repeater': {
            title: 'ACF Team Repeater: команда загружена',
            text: 'Проверьте карточки команды, фото сотрудника и социальные ссылки перед экспортом шаблона.',
            primaryTab: 'html'
        },
        'acf-testimonials-repeater': {
            title: 'ACF Testimonials: отзывы загружены',
            text: 'Проверьте отзывы клиентов, рейтинг, автор отзыва и шаблон карточек.',
            primaryTab: 'html'
        },
        'acf-woocommerce-product-fields': {
            title: 'ACF поля товара WooCommerce: product preset загружен',
            text: 'Проверьте характеристики товара, инструкции, комплектацию и FAQ товара перед экспортом.',
            primaryTab: 'html'
        }
    };
    return map[source] || {
        title: 'Предустановка загружена',
        text: 'Проверьте поля, откройте preview и экспортируйте код в нужном формате.',
        primaryTab: preset === 'json' ? 'json' : (template === 'field_group' ? 'php' : 'html')
    };
}

function renderLandingContext(source, preset, template) {
    var el = document.getElementById('landing-context');
    if (!el || !source) return;
    var copy = landingContextCopy(source, preset, template);
    var primaryLabel = copy.primaryTab === 'json' ? 'Открыть JSON' : (copy.primaryTab === 'php' ? 'Открыть PHP' : 'Открыть шаблон');
    el.innerHTML = [
        '<div>',
        '  <div class="landing-context-kicker"><span class="material-symbols-outlined">travel_explore</span> Переход с посадочной</div>',
        '  <h2>' + escHtml(copy.title) + '</h2>',
        '  <p>' + escHtml(copy.text) + '</p>',
        '</div>',
        '<div class="landing-context-actions">',
        '  <button class="gen-btn gen-btn-sm gen-btn-primary" data-action="switch-tab" data-tab="' + escAttr(copy.primaryTab) + '"><span class="material-symbols-outlined">integration_instructions</span> ' + escHtml(primaryLabel) + '</button>',
        '  <button class="gen-btn gen-btn-sm gen-btn-outline" data-action="toggle-preview-mode"><span class="material-symbols-outlined">visibility</span> Live preview</button>',
        '</div>'
    ].join('');
    el.hidden = false;
}

function loadTemplateFromURL() {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('preset') || params.get('template');
    var source = params.get('source') || '';
    if (!preset) return;

    var aliases = {
        field_group: 'field_group',
        php: 'field_group',
        json: 'field_group',
        repeater: 'faq',
        flexible: 'flexible_page',
        page_builder: 'flexible_page',
        woocommerce: 'woocommerce_product'
    };
    var targetTabs = {
        json: 'json',
        php: 'php'
    };
    var template = aliases[preset] || preset;
    var allowed = ['field_group', 'woocommerce_product', 'hero', 'team', 'testimonials', 'seo', 'faq', 'flexible_page'];
    if (allowed.indexOf(template) === -1) return;

    loadTemplate(template);
    if (targetTabs[preset]) {
        switchCodeTab(targetTabs[preset]);
    } else if (source) {
        switchCodeTab(landingContextCopy(source, preset, template).primaryTab);
    }
    renderLandingContext(source, preset, template);
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
            var pf = findFieldInTree(parseInt(el.getAttribute('data-parent-id')));
            if (pf && pf.layouts && pf.layouts[li]) {
                pf.layouts[li]._open = !pf.layouts[li]._open;
                renderAll();
            }
            break;
        case 'toggle-sub-field-expand':
            toggleSubFieldExpand(
                parseInt(el.getAttribute('data-parent-id')),
                parseInt(el.getAttribute('data-sub-id'))
            );
            break;
        case 'toggle-layout-sub-field-expand':
            toggleLayoutSubFieldExpand(
                parseInt(el.getAttribute('data-parent-id')),
                parseInt(el.getAttribute('data-layout-idx')),
                parseInt(el.getAttribute('data-sub-id'))
            );
            break;
        case 'toggle-style-editor':
            toggleStyleEditor();
            break;
        case 'reset-styles':
            resetStyles();
            break;
        case 'toggle-full-preview':
            toggleFullPreview();
            break;
        case 'toggle-preview-mode':
            togglePreviewMode();
            break;
        case 'refresh-visual-editor':
            renderVisualEditor();
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
        case 'update-field-checkbox-array':
            toggleFieldArray(parseInt(el.getAttribute('data-field-id')), el.getAttribute('data-key'), el.getAttribute('data-value'), el.checked);
            break;
        case 'update-field-checkbox-wpautop':
            updateField(parseInt(el.getAttribute('data-field-id')), 'new_lines', el.checked ? 'wpautop' : '');
            break;
        case 'update-sub-field-checkbox':
            var sfCb = findFieldInTree(parseInt(el.getAttribute('data-sub-id')));
            if (sfCb) {
                sfCb[el.getAttribute('data-key')] = el.checked ? 1 : 0;
                liveUpdate();
            }
            break;
        case 'update-sub-field-checkbox-wpautop':
            var sfWp = findFieldInTree(parseInt(el.getAttribute('data-sub-id')));
            if (sfWp) {
                sfWp['new_lines'] = el.checked ? 'wpautop' : '';
                liveUpdate();
            }
            break;
        case 'change-field-type':
            changeFieldType(parseInt(el.getAttribute('data-field-id')), el.value);
            break;
        case 'update-field':
            // For <select> elements with data-key
            updateField(parseInt(el.getAttribute('data-field-id')), el.getAttribute('data-key'), el.value);
            break;
        case 'update-sub-field-select':
            var fSel = findFieldInTree(parseInt(el.getAttribute('data-sub-id')));
            if (fSel) {
                fSel[el.getAttribute('data-key')] = el.value;
                liveUpdate();
            }
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
        case 'style-change':
            applyStyleColor(el.id, el.value);
            break;
    }
});

// Style text field input handlers
document.addEventListener('input', function(e) {
    var el = e.target.closest('[data-action="style-change-text"]');
    if (!el) return;
    applyStyleChange(el.id, el.value);
});

// Style color picker change
document.addEventListener('input', function(e) {
    var el = e.target.closest('[data-action="style-change"]');
    if (!el) return;
    applyStyleColor(el.id, el.value);
});

window.addEventListener('message', function(e) {
    var data = e.data || {};
    if (data.source !== 'acf-style-target') return;
    handleVisualStyleTarget(data.styleKey);
});

document.addEventListener('input', function(e) {
    var el = e.target.closest('[data-action="element-style-change"]');
    if (!el) return;
    applyElementStyleChange(el);
});

document.addEventListener('change', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    // Skip style-change as it's handled by input event
    if (action === 'style-change' || action === 'element-style-change') return;

    switch (action) {
        case 'add-field-select':
            if (el.value) {
                var cs = el._customSelect;
                addField(el.value);
                el.value = '';
                if (cs) {
                    cs._selectedValue = '';
                    cs._updateTrigger();
                    var csOpts = cs._optionsContainer.querySelectorAll('.cs-option');
                    for (var ai = 0; ai < csOpts.length; ai++) csOpts[ai].classList.remove('selected');
                }
            }
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
        case 'update-sub-choices':
            var sfCh = findFieldInTree(parseInt(el.getAttribute('data-sub-id')));
            if (sfCh) {
                var choices = {};
                var lines = el.value.split('\n');
                for (var lci = 0; lci < lines.length; lci++) {
                    var line = lines[lci].trim();
                    if (!line) continue;
                    var sep = line.indexOf(':');
                    if (sep === -1) continue;
                    var key = line.substring(0, sep).trim();
                    var val = line.substring(sep + 1).trim();
                    if (key) choices[key] = val;
                }
                sfCh.choices = choices;
                liveUpdate();
            }
            break;
        case 'update-field-post-type':
            updateField(parseInt(el.getAttribute('data-field-id')), 'post_type', el.value.split(',').map(function(s){return s.trim();}));
            break;
        case 'update-sub-field-post-type':
            var sfPt = findFieldInTree(parseInt(el.getAttribute('data-sub-id')));
            if (sfPt) {
                sfPt['post_type'] = el.value.split(',').map(function(s){return s.trim();});
                liveUpdate();
            }
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
        case 'add-field-select':
            if (el.value) {
                var cs2 = el._customSelect;
                addField(el.value);
                el.value = '';
                if (cs2) {
                    cs2._selectedValue = '';
                    cs2._updateTrigger();
                    var csOpts2 = cs2._optionsContainer.querySelectorAll('.cs-option');
                    for (var ai2 = 0; ai2 < csOpts2.length; ai2++) csOpts2[ai2].classList.remove('selected');
                }
            }
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
    updateCodeExportNote(currentCodeTab);

    // Upgrade field-type-row selects to CustomSelect
    var fieldTypeSelects = document.querySelectorAll('.field-type-row select[data-action="add-field-select"]');
    for (var fts = 0; fts < fieldTypeSelects.length; fts++) {
        if (!fieldTypeSelects[fts]._customSelect && !fieldTypeSelects[fts].closest('.cs-wrap')) {
            fieldTypeSelects[fts]._customSelect = CustomSelect.create(fieldTypeSelects[fts], { searchable: true });
        }
        fieldTypeSelects[fts].setAttribute('data-custom-select', '1');
    }

    // Upgrade native selects on page load
    setTimeout(function() {
        var staticSelects = document.querySelectorAll('#group-style, #group-position');
        for (var i = 0; i < staticSelects.length; i++) {
            if (!staticSelects[i]._customSelect && !staticSelects[i].closest('.cs-wrap')) {
                staticSelects[i]._customSelect = CustomSelect.create(staticSelects[i], { searchable: true });
            }
        }
    }, 100);

    loadTemplateFromURL();

    // Visual editor toolbar — size switching
    var toolbar = document.querySelector('.visual-editor-toolbar');
    if (toolbar) {
        toolbar.addEventListener('click', function(e) {
            var btn = e.target.closest('button');
            if (!btn) return;
            var size = btn.getAttribute('data-size');
            if (size) {
                var frame = document.getElementById('visual-editor-frame');
                if (frame) {
                    frame.className = 'visual-editor-frame ' + size;
                    // Update active state
                    var buttons = toolbar.querySelectorAll('button[data-size]');
                    for (var b = 0; b < buttons.length; b++) buttons[b].classList.remove('active');
                    btn.classList.add('active');
                }
            }
        });
    }
});
