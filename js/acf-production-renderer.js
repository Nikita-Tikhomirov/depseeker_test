'use strict';

(function() {
    var SAMPLE = {
        title: 'Создавайте сайты быстрее',
        subtitle: 'Готовый блок на ACF с аккуратной адаптивной версткой, безопасным выводом и понятной структурой для темы WordPress.',
        button: 'Обсудить проект',
        question: 'Как быстро можно внедрить этот блок?',
        answer: 'Скопируйте PHP-шаблон, перенесите CSS в style.css и замените тексты через поля ACF. Обычно это занимает несколько минут.',
        name: 'Анна Смирнова',
        role: 'Руководитель проекта',
        company: 'Digital Studio',
        review: 'Блок выглядит как часть нормального сайта: чистые отступы, карточки, адаптив и понятный код для доработки.'
    };

    function h(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function php(value) {
        return String(value == null ? '' : value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    function attr(value) {
        return String(value == null ? '' : value).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'field';
    }

    function varName(value) {
        return String(value == null ? '' : value).replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'field';
    }

    function getElValue(id, fallback) {
        var el = document.getElementById(id);
        return el && el.value ? el.value : fallback;
    }

    function getStyles() {
        var s = window.blockStyles || {};
        return {
            bgColor: s.bgColor || '#ffffff',
            textColor: s.textColor || '#111827',
            padding: parseInt(s.padding, 10) || 40,
            gap: parseInt(s.gap, 10) || 18,
            cardBg: s.cardBg || '#ffffff',
            cardPadding: parseInt(s.cardPadding, 10) || 22,
            cardRadius: parseInt(s.cardRadius, 10) || 16,
            borderColor: s.borderColor || '#e5e7eb',
            borderWidth: parseInt(s.borderWidth, 10) || 1
        };
    }

    var ELEMENT_STYLE_DEFAULTS = {
        section: { bgColor: '#ffffff', textColor: '#111827', paddingY: '72', maxWidth: '1120', gap: '18' },
        kicker: { color: '#14b8a6', fontSize: '12', fontWeight: '800', marginBottom: '10' },
        title: { color: '#111827', fontSize: '72', fontWeight: '850', lineHeight: '98', marginBottom: '0' },
        lead: { color: '#475569', fontSize: '19', lineHeight: '165', marginTop: '18' },
        button: { bgColor: '#111827', textColor: '#ffffff', radius: '10', paddingX: '20', height: '46', fontSize: '15' },
        media: { bgColor: '#ccfbf1', radius: '16', minHeight: '320' },
        card: { bgColor: '#ffffff', textColor: '#111827', padding: '22', radius: '16', borderColor: '#e5e7eb', borderWidth: '1' },
        fieldLabel: { color: '#64748b', fontSize: '12', fontWeight: '800' },
        fieldValue: { color: '#111827', fontSize: '16', fontWeight: '400' },
        faqList: { gap: '12', maxWidth: '860' },
        question: { bgColor: '#ffffff', textColor: '#111827', paddingY: '18', paddingX: '20', fontSize: '16', fontWeight: '800' },
        answer: { textColor: '#475569', fontSize: '15', paddingX: '20', paddingBottom: '18' },
        layout: { bgColor: '#ffffff', padding: '22', radius: '16', borderColor: '#e5e7eb' },
        avatar: { size: '64', bgColor: '#14b8a6', textColor: '#ffffff', radius: '50' },
        rating: { color: '#f59e0b', fontSize: '16' }
    };

    var FIELD_STYLE_DEFAULTS = {
        labelColor: '#64748b',
        labelSize: '12',
        valueColor: '#111827',
        valueSize: '16',
        valueWeight: '400',
        gap: '7'
    };

    var STYLE_PANELS = {
        section: { label: 'Секция', hint: 'фон, текст, ширина, внешние отступы', controls: [
            ['bgColor', 'Фон', 'color'],
            ['textColor', 'Текст', 'color'],
            ['paddingY', 'Высота секции', 'number', 'px'],
            ['maxWidth', 'Ширина контента', 'number', 'px'],
            ['gap', 'Промежуток', 'number', 'px']
        ] },
        kicker: { label: 'Бейдж / подпись', hint: '.zifra-acf-kicker', controls: [
            ['color', 'Цвет', 'color'],
            ['fontSize', 'Размер', 'number', 'px'],
            ['fontWeight', 'Насыщенность', 'number'],
            ['marginBottom', 'Отступ снизу', 'number', 'px']
        ] },
        title: { label: 'Заголовок', hint: '.zifra-acf-title', controls: [
            ['color', 'Цвет', 'color'],
            ['fontSize', 'Размер', 'number', 'px'],
            ['fontWeight', 'Насыщенность', 'number'],
            ['lineHeight', 'Интерлиньяж', 'number', '%'],
            ['marginBottom', 'Отступ снизу', 'number', 'px']
        ] },
        lead: { label: 'Описание', hint: '.zifra-acf-lead', controls: [
            ['color', 'Цвет', 'color'],
            ['fontSize', 'Размер', 'number', 'px'],
            ['lineHeight', 'Интерлиньяж', 'number', '%'],
            ['marginTop', 'Отступ сверху', 'number', 'px']
        ] },
        button: { label: 'Кнопка', hint: '.zifra-acf-btn', controls: [
            ['bgColor', 'Фон', 'color'],
            ['textColor', 'Текст', 'color'],
            ['height', 'Высота', 'number', 'px'],
            ['paddingX', 'Боковые отступы', 'number', 'px'],
            ['radius', 'Скругление', 'number', 'px'],
            ['fontSize', 'Размер текста', 'number', 'px']
        ] },
        media: { label: 'Медиа / картинка', hint: '.zifra-acf-media', controls: [
            ['bgColor', 'Фон', 'color'],
            ['minHeight', 'Высота', 'number', 'px'],
            ['radius', 'Скругление', 'number', 'px']
        ] },
        card: { label: 'Карточка', hint: '.zifra-acf-card', controls: [
            ['bgColor', 'Фон', 'color'],
            ['textColor', 'Текст', 'color'],
            ['padding', 'Внутренний отступ', 'number', 'px'],
            ['radius', 'Скругление', 'number', 'px'],
            ['borderColor', 'Граница', 'color'],
            ['borderWidth', 'Толщина', 'number', 'px']
        ] },
        fieldLabel: { label: 'Лейбл поля', hint: '.zifra-acf-label', controls: [
            ['color', 'Цвет', 'color'],
            ['fontSize', 'Размер', 'number', 'px'],
            ['fontWeight', 'Насыщенность', 'number']
        ] },
        fieldValue: { label: 'Значение поля', hint: '.zifra-acf-value', controls: [
            ['color', 'Цвет', 'color'],
            ['fontSize', 'Размер', 'number', 'px'],
            ['fontWeight', 'Насыщенность', 'number']
        ] },
        faqList: { label: 'Список FAQ', hint: '.zifra-acf-faq', controls: [
            ['gap', 'Расстояние', 'number', 'px'],
            ['maxWidth', 'Ширина', 'number', 'px']
        ] },
        question: { label: 'Вопрос FAQ', hint: '.zifra-acf-faq summary', controls: [
            ['bgColor', 'Фон', 'color'],
            ['textColor', 'Текст', 'color'],
            ['paddingY', 'Отступ сверху/снизу', 'number', 'px'],
            ['paddingX', 'Отступ слева/справа', 'number', 'px'],
            ['fontSize', 'Размер', 'number', 'px'],
            ['fontWeight', 'Насыщенность', 'number']
        ] },
        answer: { label: 'Ответ FAQ', hint: '.zifra-acf-faq-answer', controls: [
            ['textColor', 'Текст', 'color'],
            ['fontSize', 'Размер', 'number', 'px'],
            ['paddingX', 'Боковой отступ', 'number', 'px'],
            ['paddingBottom', 'Отступ снизу', 'number', 'px']
        ] },
        layout: { label: 'Flexible layout', hint: '.zifra-acf-layout', controls: [
            ['bgColor', 'Фон', 'color'],
            ['padding', 'Отступ', 'number', 'px'],
            ['radius', 'Скругление', 'number', 'px'],
            ['borderColor', 'Граница', 'color']
        ] },
        avatar: { label: 'Аватар', hint: '.zifra-acf-avatar', controls: [
            ['size', 'Размер', 'number', 'px'],
            ['bgColor', 'Фон', 'color'],
            ['textColor', 'Текст', 'color'],
            ['radius', 'Скругление', 'number', '%']
        ] },
        rating: { label: 'Рейтинг', hint: '.zifra-acf-rating', controls: [
            ['color', 'Цвет', 'color'],
            ['fontSize', 'Размер', 'number', 'px']
        ] }
    };

    var styleEditorSignature = '';
    var toggleHome = null;
    var activeProductionTarget = null;
    var activeProductionFieldTarget = null;

    function copyStyleObject(source) {
        var out = {};
        var keys = Object.keys(source || {});
        for (var i = 0; i < keys.length; i++) out[keys[i]] = source[keys[i]];
        return out;
    }

    function getElementStyle(key) {
        window.productionElementStyles = window.productionElementStyles || {};
        if (!window.productionElementStyles[key]) {
            window.productionElementStyles[key] = copyStyleObject(ELEMENT_STYLE_DEFAULTS[key] || {});
        }
        var merged = copyStyleObject(ELEMENT_STYLE_DEFAULTS[key] || {});
        var current = window.productionElementStyles[key] || {};
        var keys = Object.keys(current);
        for (var i = 0; i < keys.length; i++) merged[keys[i]] = current[keys[i]];
        return merged;
    }

    function setElementStyle(key, prop, value) {
        window.productionElementStyles = window.productionElementStyles || {};
        window.productionElementStyles[key] = window.productionElementStyles[key] || copyStyleObject(ELEMENT_STYLE_DEFAULTS[key] || {});
        window.productionElementStyles[key][prop] = String(value == null ? '' : value).trim();
        syncLegacyBlockStyles(key, prop, window.productionElementStyles[key][prop]);
        refreshProductionViews();
    }

    function collectRenderableFields(list, out) {
        out = out || [];
        list = list || [];
        for (var i = 0; i < list.length; i++) {
            var field = list[i];
            if (!field) continue;
            if (field.name && field.type !== 'tab' && field.type !== 'message' && field.type !== 'repeater' && field.type !== 'flexible_content') {
                out.push(field);
            }
            if (field.sub_fields) collectRenderableFields(field.sub_fields, out);
            if (field.layouts) {
                for (var j = 0; j < field.layouts.length; j++) collectRenderableFields(field.layouts[j].sub_fields || [], out);
            }
        }
        return out;
    }

    function fieldUsesGenericMarkup(field) {
        if (!field || !field.name) return false;
        return ['image', 'gallery', 'link', 'tab', 'message', 'repeater', 'flexible_content'].indexOf(field.type) === -1;
    }

    function collectFieldStyleTargets() {
        var kind = inferBlock(getFields());
        if (kind === 'hero' || kind === 'faq') return [];
        var fields = collectRenderableFields(getFields(), []);
        var out = [];
        for (var i = 0; i < fields.length; i++) {
            if (fieldUsesGenericMarkup(fields[i])) out.push(fields[i]);
        }
        return out;
    }

    function getFieldStyle(field) {
        var key = attr(fieldName(field));
        window.productionFieldStyles = window.productionFieldStyles || {};
        if (!window.productionFieldStyles[key]) window.productionFieldStyles[key] = copyStyleObject(FIELD_STYLE_DEFAULTS);
        var merged = copyStyleObject(FIELD_STYLE_DEFAULTS);
        var current = window.productionFieldStyles[key] || {};
        var keys = Object.keys(current);
        for (var i = 0; i < keys.length; i++) merged[keys[i]] = current[keys[i]];
        return merged;
    }

    function setFieldStyle(fieldKey, prop, value) {
        window.productionFieldStyles = window.productionFieldStyles || {};
        window.productionFieldStyles[fieldKey] = window.productionFieldStyles[fieldKey] || copyStyleObject(FIELD_STYLE_DEFAULTS);
        window.productionFieldStyles[fieldKey][prop] = String(value == null ? '' : value).trim();
        refreshProductionViews();
    }

    function syncLegacyBlockStyles(key, prop, value) {
        window.blockStyles = window.blockStyles || {};
        if (key === 'section' && prop === 'bgColor') window.blockStyles.bgColor = value;
        if (key === 'section' && prop === 'textColor') window.blockStyles.textColor = value;
        if (key === 'section' && prop === 'paddingY') window.blockStyles.padding = value;
        if (key === 'section' && prop === 'gap') window.blockStyles.gap = value;
        if (key === 'card' && prop === 'bgColor') window.blockStyles.cardBg = value;
        if (key === 'card' && prop === 'padding') window.blockStyles.cardPadding = value;
        if (key === 'card' && prop === 'radius') window.blockStyles.cardRadius = value;
        if (key === 'card' && prop === 'borderColor') window.blockStyles.borderColor = value;
        if (key === 'card' && prop === 'borderWidth') window.blockStyles.borderWidth = value;
    }

    var STYLE_CONTROL_MAP = {
        'se-bg-color': 'bgColor',
        'se-bg-color-text': 'bgColor',
        'se-text-color': 'textColor',
        'se-text-color-text': 'textColor',
        'se-padding': 'padding',
        'se-gap': 'gap',
        'se-card-bg': 'cardBg',
        'se-card-bg-text': 'cardBg',
        'se-card-padding': 'cardPadding',
        'se-card-radius': 'cardRadius',
        'se-border-color': 'borderColor',
        'se-border-color-text': 'borderColor',
        'se-border-width': 'borderWidth'
    };

    function isHexColor(value) {
        return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value || '').trim());
    }

    function syncPairedStyleInputs(id, value) {
        var textId = id.indexOf('-text') === -1 ? id + '-text' : id;
        var colorId = id.replace('-text', '');
        var textEl = document.getElementById(textId);
        var colorEl = document.getElementById(colorId);
        if (textEl && textEl.value !== value) textEl.value = value;
        if (colorEl && colorEl.type === 'color' && isHexColor(value) && colorEl.value !== value) {
            colorEl.value = value;
        }
    }

    function applyProductionStyle(id, value) {
        var key = STYLE_CONTROL_MAP[id];
        if (!key) return;
        window.blockStyles = window.blockStyles || {};
        window.blockStyles[key] = String(value == null ? '' : value).trim();
        syncPairedStyleInputs(id, window.blockStyles[key]);
        refreshProductionViews();
    }

    function getFields() {
        return Array.isArray(window.fields) ? window.fields : [];
    }

    function getGroup() {
        return {
            title: getElValue('group-title', 'ACF Block'),
            key: getElValue('group-key', 'group_acf_block'),
            desc: getElValue('group-desc', '')
        };
    }

    function fieldName(field) {
        return field && field.name ? field.name : '';
    }

    function fieldLabel(field) {
        return field && (field.label || field.name) ? (field.label || field.name) : 'Field';
    }

    function includesAny(value, parts) {
        value = String(value || '').toLowerCase();
        for (var i = 0; i < parts.length; i++) {
            if (value.indexOf(parts[i]) !== -1) return true;
        }
        return false;
    }

    function findFieldByIntent(fields, intents) {
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            var hay = [f.name, f.label, f.type].join(' ').toLowerCase();
            if (includesAny(hay, intents)) return f;
        }
        return null;
    }

    function repeaterKind(field) {
        var subs = field && field.sub_fields ? field.sub_fields : [];
        var names = subs.map(function(f) { return [f.name, f.label, f.type].join(' ').toLowerCase(); }).join(' ');
        if (includesAny(names, ['question', 'answer', 'вопрос', 'ответ'])) return 'faq';
        if (includesAny(names, ['review', 'testimonial', 'rating', 'отзыв', 'компания'])) return 'testimonials';
        if (includesAny(names, ['role', 'position', 'job', 'должность', 'bio', 'team'])) return 'team';
        return 'cards';
    }

    function inferBlock(fields) {
        if (fields.length === 1 && fields[0].type === 'repeater') return repeaterKind(fields[0]);
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].type === 'flexible_content') return 'builder';
        }
        var names = fields.map(function(f) { return [f.name, f.label, f.type].join(' ').toLowerCase(); }).join(' ');
        if (includesAny(names, ['hero', 'headline', 'subtitle', 'cta', 'button', 'заголовок', 'кнопка'])) return 'hero';
        if (includesAny(names, ['seo', 'meta', 'canonical', 'robots', 'og_'])) return 'seo';
        return 'content';
    }

    function cssPx(value, fallback) {
        var n = parseFloat(value);
        if (!isFinite(n)) n = fallback || 0;
        return n + 'px';
    }

    function cssPercent(value, fallback) {
        var n = parseFloat(value);
        if (!isFinite(n)) n = fallback || 100;
        return (n / 100).toFixed(2);
    }

    function cssRaw(value, fallback) {
        value = String(value == null ? '' : value).trim();
        return value || fallback;
    }

    function elementOverridesCSS() {
        var section = getElementStyle('section');
        var kicker = getElementStyle('kicker');
        var title = getElementStyle('title');
        var lead = getElementStyle('lead');
        var button = getElementStyle('button');
        var media = getElementStyle('media');
        var card = getElementStyle('card');
        var label = getElementStyle('fieldLabel');
        var value = getElementStyle('fieldValue');
        var faq = getElementStyle('faqList');
        var question = getElementStyle('question');
        var answer = getElementStyle('answer');
        var layout = getElementStyle('layout');
        var avatar = getElementStyle('avatar');
        var rating = getElementStyle('rating');
        return [
            '/* Element-level editor styles */',
            '.zifra-acf-block { background: ' + cssRaw(section.bgColor, '#fff') + '; color: ' + cssRaw(section.textColor, '#111827') + '; padding: clamp(32px, 6vw, ' + cssPx(section.paddingY, 72) + ') 0; }',
            '.zifra-acf-wrap { width: min(' + cssPx(section.maxWidth, 1120) + ', calc(100% - 32px)); }',
            '.zifra-acf-grid { gap: ' + cssPx(section.gap, 18) + '; }',
            '.zifra-acf-kicker { color: ' + cssRaw(kicker.color, '#14b8a6') + '; font-size: ' + cssPx(kicker.fontSize, 12) + '; font-weight: ' + cssRaw(kicker.fontWeight, '800') + '; margin-bottom: ' + cssPx(kicker.marginBottom, 10) + '; }',
            '.zifra-acf-title { color: ' + cssRaw(title.color, '#111827') + '; font-size: clamp(2rem, 5vw, ' + cssPx(title.fontSize, 72) + '); font-weight: ' + cssRaw(title.fontWeight, '850') + '; line-height: ' + cssPercent(title.lineHeight, 98) + '; margin-bottom: ' + cssPx(title.marginBottom, 0) + '; }',
            '.zifra-acf-lead { color: ' + cssRaw(lead.color, '#475569') + '; font-size: ' + cssPx(lead.fontSize, 19) + '; line-height: ' + cssPercent(lead.lineHeight, 165) + '; margin-top: ' + cssPx(lead.marginTop, 18) + '; }',
            '.zifra-acf-btn { background: ' + cssRaw(button.bgColor, '#111827') + '; color: ' + cssRaw(button.textColor, '#fff') + '; min-height: ' + cssPx(button.height, 46) + '; padding: 0 ' + cssPx(button.paddingX, 20) + '; border-radius: ' + cssPx(button.radius, 10) + '; font-size: ' + cssPx(button.fontSize, 15) + '; }',
            '.zifra-acf-media { background: linear-gradient(135deg, ' + cssRaw(media.bgColor, '#ccfbf1') + ', #e0f2fe); border-radius: ' + cssPx(media.radius, 16) + '; min-height: ' + cssPx(media.minHeight, 320) + '; }',
            '.zifra-acf-card { background: ' + cssRaw(card.bgColor, '#fff') + '; color: ' + cssRaw(card.textColor, '#111827') + '; padding: ' + cssPx(card.padding, 22) + '; border-radius: ' + cssPx(card.radius, 16) + '; border-color: ' + cssRaw(card.borderColor, '#e5e7eb') + '; border-width: ' + cssPx(card.borderWidth, 1) + '; }',
            '.zifra-acf-label { color: ' + cssRaw(label.color, '#64748b') + '; font-size: ' + cssPx(label.fontSize, 12) + '; font-weight: ' + cssRaw(label.fontWeight, '800') + '; }',
            '.zifra-acf-value { color: ' + cssRaw(value.color, '#111827') + '; font-size: ' + cssPx(value.fontSize, 16) + '; font-weight: ' + cssRaw(value.fontWeight, '400') + '; }',
            '.zifra-acf-faq { gap: ' + cssPx(faq.gap, 12) + '; max-width: ' + cssPx(faq.maxWidth, 860) + '; }',
            '.zifra-acf-faq summary { background: ' + cssRaw(question.bgColor, '#fff') + '; color: ' + cssRaw(question.textColor, '#111827') + '; padding: ' + cssPx(question.paddingY, 18) + ' ' + cssPx(question.paddingX, 20) + '; font-size: ' + cssPx(question.fontSize, 16) + '; font-weight: ' + cssRaw(question.fontWeight, '800') + '; }',
            '.zifra-acf-faq-answer { color: ' + cssRaw(answer.textColor, '#475569') + '; font-size: ' + cssPx(answer.fontSize, 15) + '; padding: 0 ' + cssPx(answer.paddingX, 20) + ' ' + cssPx(answer.paddingBottom, 18) + '; }',
            '.zifra-acf-layout { background: ' + cssRaw(layout.bgColor, '#fff') + '; padding: ' + cssPx(layout.padding, 22) + '; border-radius: ' + cssPx(layout.radius, 16) + '; border-color: ' + cssRaw(layout.borderColor, '#e5e7eb') + '; }',
            '.zifra-acf-avatar { width: ' + cssPx(avatar.size, 64) + '; height: ' + cssPx(avatar.size, 64) + '; background: ' + cssRaw(avatar.bgColor, '#14b8a6') + '; color: ' + cssRaw(avatar.textColor, '#fff') + '; border-radius: ' + cssRaw(avatar.radius, '50') + '%; }',
            '.zifra-acf-rating { color: ' + cssRaw(rating.color, '#f59e0b') + '; font-size: ' + cssPx(rating.fontSize, 16) + '; }'
        ].join('\n');
    }

    function fieldOverridesCSS() {
        var fields = collectFieldStyleTargets();
        var seen = {};
        var out = ['/* Per-field editor styles */'];
        for (var i = 0; i < fields.length; i++) {
            var key = attr(fieldName(fields[i]));
            if (!key || seen[key]) continue;
            seen[key] = true;
            var s = getFieldStyle(fields[i]);
            out.push('.zifra-acf-field--' + key + ' { gap: ' + cssPx(s.gap, 7) + '; }');
            out.push('.zifra-acf-field--' + key + ' .zifra-acf-label { color: ' + cssRaw(s.labelColor, '#64748b') + '; font-size: ' + cssPx(s.labelSize, 12) + '; }');
            out.push('.zifra-acf-field--' + key + ' .zifra-acf-value { color: ' + cssRaw(s.valueColor, '#111827') + '; font-size: ' + cssPx(s.valueSize, 16) + '; font-weight: ' + cssRaw(s.valueWeight, '400') + '; }');
        }
        return out.join('\n');
    }

    function productionCSS() {
        var s = getStyles();
        return [
            '/* Production ACF block. Move this CSS to your theme stylesheet. */',
            '.zifra-acf-block {',
            '  --acf-bg: ' + s.bgColor + ';',
            '  --acf-text: ' + s.textColor + ';',
            '  --acf-muted: color-mix(in srgb, var(--acf-text) 64%, transparent);',
            '  --acf-card: ' + s.cardBg + ';',
            '  --acf-border: ' + s.borderColor + ';',
            '  --acf-accent: #14b8a6;',
            '  background: var(--acf-bg);',
            '  color: var(--acf-text);',
            '  padding: clamp(32px, 6vw, ' + Math.max(s.padding, 64) + 'px) 0;',
            '  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
            '  line-height: 1.6;',
            '}',
            '.zifra-acf-block, .zifra-acf-block * { box-sizing: border-box; }',
            '.zifra-acf-wrap { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }',
            '.zifra-acf-kicker { margin: 0 0 10px; color: var(--acf-accent); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }',
            '.zifra-acf-title { margin: 0; max-width: 820px; font-size: clamp(2rem, 5vw, 4.5rem); line-height: 0.98; letter-spacing: -0.02em; }',
            '.zifra-acf-lead { margin: 18px 0 0; max-width: 700px; color: var(--acf-muted); font-size: clamp(1rem, 1.6vw, 1.2rem); }',
            '.zifra-acf-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }',
            '.zifra-acf-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 20px; border-radius: 10px; background: var(--acf-text); color: var(--acf-bg); text-decoration: none; font-weight: 800; }',
            '.zifra-acf-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: ' + s.gap + 'px; }',
            '.zifra-acf-card { background: var(--acf-card); border: ' + s.borderWidth + 'px solid var(--acf-border); border-radius: ' + s.cardRadius + 'px; padding: ' + s.cardPadding + 'px; box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08); }',
            '.zifra-acf-card h3 { margin: 0 0 8px; font-size: 1.05rem; line-height: 1.3; }',
            '.zifra-acf-card p { margin: 0; color: var(--acf-muted); }',
            '.zifra-acf-media { position: relative; min-height: 320px; border-radius: ' + s.cardRadius + 'px; overflow: hidden; background: linear-gradient(135deg, #ccfbf1, #e0f2fe); }',
            '.zifra-acf-media img { width: 100%; height: 100%; object-fit: cover; display: block; }',
            '.zifra-acf-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 0.78fr); gap: clamp(24px, 5vw, 56px); align-items: center; }',
            '.zifra-acf-faq { display: grid; gap: 12px; max-width: 860px; }',
            '.zifra-acf-faq details { background: var(--acf-card); border: ' + s.borderWidth + 'px solid var(--acf-border); border-radius: ' + s.cardRadius + 'px; padding: 0; overflow: hidden; }',
            '.zifra-acf-faq summary { cursor: pointer; list-style: none; padding: 18px 20px; font-weight: 800; display: flex; justify-content: space-between; gap: 16px; }',
            '.zifra-acf-faq summary::-webkit-details-marker { display: none; }',
            '.zifra-acf-faq summary::after { content: "+"; color: var(--acf-accent); font-size: 1.2rem; }',
            '.zifra-acf-faq details[open] summary::after { content: "-"; }',
            '.zifra-acf-faq-answer { padding: 0 20px 18px; color: var(--acf-muted); }',
            '.zifra-acf-person { display: grid; gap: 12px; }',
            '.zifra-acf-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #14b8a6, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.35rem; overflow: hidden; }',
            '.zifra-acf-avatar img { width: 100%; height: 100%; object-fit: cover; }',
            '.zifra-acf-role, .zifra-acf-company, .zifra-acf-meta { color: var(--acf-muted); font-size: 0.92rem; }',
            '.zifra-acf-quote { font-size: 1.02rem; }',
            '.zifra-acf-rating { color: #f59e0b; letter-spacing: 0.06em; margin-bottom: 10px; }',
            '.zifra-acf-field { display: grid; gap: 7px; }',
            '.zifra-acf-label { color: var(--acf-muted); font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em; }',
            '.zifra-acf-value { font-size: 1rem; }',
            '.zifra-acf-list { display: grid; gap: 12px; }',
            '.zifra-acf-layout { margin-top: 20px; }',
            '.zifra-acf-layout:first-child { margin-top: 0; }',
            '[data-production-target], [data-production-field-target] { cursor: pointer; }',
            '.zifra-production-selected { outline: 2px solid #7c3aed; outline-offset: 4px; }',
            elementOverridesCSS(),
            fieldOverridesCSS(),
            '@supports not (color: color-mix(in srgb, #000 50%, transparent)) { .zifra-acf-block { --acf-muted: #64748b; } }',
            '@media (max-width: 860px) {',
            '  .zifra-acf-hero, .zifra-acf-grid { grid-template-columns: 1fr; }',
            '  .zifra-acf-media { min-height: 240px; }',
            '}',
            '@media (max-width: 520px) {',
            '  .zifra-acf-wrap { width: min(100% - 24px, 1120px); }',
            '  .zifra-acf-block { padding: 34px 0; }',
            '  .zifra-acf-card { padding: 18px; }',
            '  .zifra-acf-actions .zifra-acf-btn { width: 100%; }',
            '}'
        ].join('\n');
    }

    function phpGet(field, sub) {
        return (sub ? 'get_sub_field' : 'get_field') + "('" + php(fieldName(field)) + "')";
    }

    function phpEcho(field, sub, mode) {
        var expr = phpGet(field, sub);
        if (mode === 'html') return '<?php echo wp_kses_post(' + expr + '); ?>';
        if (mode === 'url') return '<?php echo esc_url(' + expr + '); ?>';
        if (mode === 'attr') return '<?php echo esc_attr(' + expr + '); ?>';
        return '<?php echo esc_html(' + expr + '); ?>';
    }

    function phpImage(field, cls, sub) {
        var name = varName(fieldName(field));
        var fn = sub ? 'get_sub_field' : 'get_field';
        return [
            "<?php $" + name + " = " + fn + "('" + php(fieldName(field)) + "'); ?>",
            "<?php if ($" + name + "): ?>",
            '    <div class="' + cls + '">',
            "        <?php if (is_array($" + name + ")): ?>",
            "            <img src=\"<?php echo esc_url($" + name + "['url']); ?>\" alt=\"<?php echo esc_attr($" + name + "['alt'] ?? ''); ?>\">",
            '        <?php else: ?>',
            '            <img src="<?php echo esc_url($' + name + '); ?>" alt="">',
            '        <?php endif; ?>',
            '    </div>',
            '<?php endif; ?>'
        ].join('\n');
    }

    function renderPHPField(field, indent, sub) {
        indent = indent || '';
        var name = fieldName(field);
        if (!name || field.type === 'tab') return [];
        if (field.type === 'image') return phpImage(field, 'zifra-acf-media', sub).split('\n').map(function(line) { return indent + line; });
        if (field.type === 'link') {
            var v = varName(name);
            var fn = sub ? 'get_sub_field' : 'get_field';
            return [
                indent + "<?php $" + v + " = " + fn + "('" + php(name) + "'); ?>",
                indent + "<?php if ($" + v + "): ?>",
                indent + '    <a class="zifra-acf-btn" href="<?php echo esc_url($' + v + "['url']); ?>\" target=\"<?php echo esc_attr($" + v + "['target'] ?? '_self'); ?>\">",
                indent + "        <?php echo esc_html($" + v + "['title'] ?: '" + php(SAMPLE.button) + "'); ?>",
                indent + '    </a>',
                indent + '<?php endif; ?>'
            ];
        }
        var htmlMode = field.type === 'wysiwyg' || field.type === 'textarea';
        return [
            indent + "<?php if (" + phpGet(field, sub) + "): ?>",
            indent + '    <div class="zifra-acf-field zifra-acf-field--' + attr(name) + '">',
            indent + '        <span class="zifra-acf-label">' + h(fieldLabel(field)) + '</span>',
            indent + '        <div class="zifra-acf-value">' + phpEcho(field, sub, htmlMode ? 'html' : 'text') + '</div>',
            indent + '    </div>',
            indent + '<?php endif; ?>'
        ];
    }

    function renderPHPHero(fields) {
        var title = findFieldByIntent(fields, ['title', 'headline', 'заголовок']) || fields[0];
        var lead = findFieldByIntent(fields, ['subtitle', 'description', 'lead', 'подзаголовок', 'описание']);
        var image = findFieldByIntent(fields, ['image', 'photo', 'bg', 'background', 'картинка', 'изображение']);
        var link = findFieldByIntent(fields, ['button', 'cta', 'link', 'ссылка', 'кнопка']);
        var out = [];
        out.push('<div class="zifra-acf-hero">');
        out.push('    <div>');
        out.push('        <p class="zifra-acf-kicker">' + h(getGroup().title) + '</p>');
        if (title) out.push('        <h2 class="zifra-acf-title">' + phpEcho(title, false, title.type === 'wysiwyg' ? 'html' : 'text') + '</h2>');
        if (lead) out.push('        <div class="zifra-acf-lead">' + phpEcho(lead, false, 'html') + '</div>');
        if (link) {
            out.push('        <div class="zifra-acf-actions">');
            out = out.concat(renderPHPField(link, '            ', false));
            out.push('        </div>');
        }
        out.push('    </div>');
        out.push('    <div>');
        if (image) out = out.concat(renderPHPField(image, '        ', false));
        else out.push('        <div class="zifra-acf-media" aria-hidden="true"></div>');
        out.push('    </div>');
        out.push('</div>');
        return out;
    }

    function renderPHPRepeater(field) {
        var kind = repeaterKind(field);
        var subs = field.sub_fields || [];
        var q = findFieldByIntent(subs, ['question', 'вопрос']) || subs[0];
        var a = findFieldByIntent(subs, ['answer', 'ответ']) || subs[1];
        var name = findFieldByIntent(subs, ['name', 'author', 'имя']) || subs[0];
        var role = findFieldByIntent(subs, ['role', 'position', 'job', 'должность']);
        var company = findFieldByIntent(subs, ['company', 'компания']);
        var text = findFieldByIntent(subs, ['review', 'text', 'message', 'bio', 'отзыв', 'текст', 'описание']) || subs[1];
        var photo = findFieldByIntent(subs, ['photo', 'avatar', 'image', 'фото']);
        var out = [];
        out.push("<?php if (have_rows('" + php(fieldName(field)) + "')): ?>");
        if (kind === 'faq') {
            out.push('    <div class="zifra-acf-faq">');
            out.push("        <?php while (have_rows('" + php(fieldName(field)) + "')): the_row(); ?>");
            out.push('            <details class="zifra-acf-card">');
            out.push('                <summary>' + (q ? phpEcho(q, true, 'text') : h(SAMPLE.question)) + '</summary>');
            out.push('                <div class="zifra-acf-faq-answer">' + (a ? phpEcho(a, true, 'html') : h(SAMPLE.answer)) + '</div>');
            out.push('            </details>');
            out.push('        <?php endwhile; ?>');
            out.push('    </div>');
        } else {
            out.push('    <div class="zifra-acf-grid zifra-acf-grid--' + kind + '">');
            out.push("        <?php while (have_rows('" + php(fieldName(field)) + "')): the_row(); ?>");
            out.push('            <article class="zifra-acf-card zifra-acf-' + (kind === 'team' ? 'person' : 'quote') + '">');
            if (photo) out = out.concat(renderPHPField(photo, '                ', true));
            if (kind === 'testimonials') out.push('                <div class="zifra-acf-rating" aria-label="5 из 5">★★★★★</div>');
            if (text) out.push('                <div class="' + (kind === 'testimonials' ? 'zifra-acf-quote' : 'zifra-acf-meta') + '">' + phpEcho(text, true, 'html') + '</div>');
            if (name) out.push('                <h3>' + phpEcho(name, true, 'text') + '</h3>');
            if (role) out.push('                <div class="zifra-acf-role">' + phpEcho(role, true, 'text') + '</div>');
            if (company) out.push('                <div class="zifra-acf-company">' + phpEcho(company, true, 'text') + '</div>');
            out.push('            </article>');
            out.push('        <?php endwhile; ?>');
            out.push('    </div>');
        }
        out.push('<?php endif; ?>');
        return out;
    }

    function renderPHPFlexible(field) {
        var out = [];
        var layouts = field.layouts || [];
        out.push("<?php if (have_rows('" + php(fieldName(field)) + "')): ?>");
        out.push('    <div class="zifra-acf-list">');
        out.push("        <?php while (have_rows('" + php(fieldName(field)) + "')): the_row(); ?>");
        for (var i = 0; i < layouts.length; i++) {
            var layout = layouts[i];
            out.push("            <?php " + (i === 0 ? 'if' : 'elseif') + " (get_row_layout() === '" + php(layout.name) + "'): ?>");
            out.push('                <section class="zifra-acf-layout zifra-acf-card zifra-acf-layout--' + attr(layout.name) + '">');
            out.push('                    <p class="zifra-acf-kicker">' + h(layout.label || layout.name) + '</p>');
            var subs = layout.sub_fields || [];
            for (var j = 0; j < subs.length; j++) {
                out = out.concat(renderPHPField(subs[j], '                    ', true));
            }
            out.push('                </section>');
        }
        if (layouts.length) out.push('            <?php endif; ?>');
        out.push('        <?php endwhile; ?>');
        out.push('    </div>');
        out.push('<?php endif; ?>');
        return out;
    }

    function renderProductionPHP() {
        var fields = getFields();
        var group = getGroup();
        var kind = inferBlock(fields);
        var out = [];
        out.push('<?php');
        out.push('/**');
        out.push(' * Production ACF template: ' + h(group.title));
        out.push(' * Move the CSS below to style.css if you do not want inline styles.');
        out.push(' */');
        out.push('?>');
        out.push('<style>');
        out.push(productionCSS());
        out.push('</style>');
        out.push('<section class="zifra-acf-block zifra-acf-block--' + attr(group.key) + '">');
        out.push('    <div class="zifra-acf-wrap">');
        if (!fields.length) {
            out.push('        <!-- Add ACF fields to generate a production block. -->');
        } else if (kind === 'hero') {
            out = out.concat(renderPHPHero(fields).map(function(line) { return '        ' + line; }));
        } else if (kind === 'faq' || kind === 'team' || kind === 'testimonials' || kind === 'cards') {
            out.push('        <p class="zifra-acf-kicker">' + h(group.title) + '</p>');
            out = out.concat(renderPHPRepeater(fields[0]).map(function(line) { return '        ' + line; }));
        } else if (kind === 'builder') {
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].type === 'flexible_content') out = out.concat(renderPHPFlexible(fields[i]).map(function(line) { return '        ' + line; }));
            }
        } else {
            out.push('        <p class="zifra-acf-kicker">' + h(group.title) + '</p>');
            out.push('        <div class="zifra-acf-grid">');
            for (var j = 0; j < fields.length; j++) {
                out.push('            <article class="zifra-acf-card">');
                out = out.concat(renderPHPField(fields[j], '                ', false));
                out.push('            </article>');
            }
            out.push('        </div>');
        }
        out.push('    </div>');
        out.push('</section>');
        return out.join('\n');
    }

    function sampleFor(field) {
        var hay = [field.name, field.label, field.type].join(' ').toLowerCase();
        if (includesAny(hay, ['question', 'вопрос'])) return SAMPLE.question;
        if (includesAny(hay, ['answer', 'ответ'])) return SAMPLE.answer;
        if (includesAny(hay, ['title', 'headline', 'заголовок'])) return SAMPLE.title;
        if (includesAny(hay, ['subtitle', 'description', 'lead', 'описание'])) return SAMPLE.subtitle;
        if (includesAny(hay, ['button', 'cta'])) return SAMPLE.button;
        if (includesAny(hay, ['name', 'author', 'имя'])) return SAMPLE.name;
        if (includesAny(hay, ['role', 'position', 'должность'])) return SAMPLE.role;
        if (includesAny(hay, ['company', 'компания'])) return SAMPLE.company;
        if (includesAny(hay, ['review', 'testimonial', 'отзыв'])) return SAMPLE.review;
        if (field.type === 'number') return '42';
        if (field.type === 'email') return 'hello@example.com';
        if (field.type === 'url') return 'https://example.com';
        if (field.type === 'date_picker') return '30 мая 2026';
        return field.default_value || field.placeholder || fieldLabel(field);
    }

    function renderSampleField(field) {
        if (!field || field.type === 'tab') return '';
        if (field.type === 'image' || field.type === 'gallery') {
            return '<div class="zifra-acf-media" data-production-target="media" aria-hidden="true"></div>';
        }
        if (field.type === 'link') {
            return '<a class="zifra-acf-btn" data-production-target="button" href="#">' + h(sampleFor(field)) + '</a>';
        }
        var key = attr(fieldName(field));
        return '<div class="zifra-acf-field zifra-acf-field--' + key + '" data-production-field-target="' + key + '"><span class="zifra-acf-label" data-production-target="fieldLabel">' + h(fieldLabel(field)) + '</span><div class="zifra-acf-value" data-production-target="fieldValue">' + h(sampleFor(field)) + '</div></div>';
    }

    function renderPreviewBlock() {
        var fields = getFields();
        var group = getGroup();
        var kind = inferBlock(fields);
        var html = [];
        html.push('<section class="zifra-acf-block zifra-acf-block--' + attr(group.key) + '" data-production-target="section">');
        html.push('  <div class="zifra-acf-wrap">');
        if (!fields.length) {
            html.push('    <div class="zifra-acf-card"><h3>Добавьте поля</h3><p>После добавления полей здесь появится production preview.</p></div>');
        } else if (kind === 'hero') {
            var title = findFieldByIntent(fields, ['title', 'headline', 'заголовок']) || fields[0];
            var lead = findFieldByIntent(fields, ['subtitle', 'description', 'lead', 'описание']);
            var image = findFieldByIntent(fields, ['image', 'photo', 'bg', 'background', 'картинка']);
            var link = findFieldByIntent(fields, ['button', 'cta', 'link', 'ссылка', 'кнопка']);
            html.push('    <div class="zifra-acf-hero">');
            html.push('      <div>');
            html.push('        <p class="zifra-acf-kicker" data-production-target="kicker">' + h(group.title) + '</p>');
            html.push('        <h2 class="zifra-acf-title" data-production-target="title">' + h(sampleFor(title)) + '</h2>');
            if (lead) html.push('        <p class="zifra-acf-lead" data-production-target="lead">' + h(sampleFor(lead)) + '</p>');
            if (link) html.push('        <div class="zifra-acf-actions">' + renderSampleField(link) + '</div>');
            html.push('      </div>');
            html.push('      ' + (image ? renderSampleField(image) : '<div class="zifra-acf-media" data-production-target="media" aria-hidden="true"></div>'));
            html.push('    </div>');
        } else if (kind === 'faq') {
            var f = fields[0];
            var subs = f.sub_fields || [];
            var q = findFieldByIntent(subs, ['question', 'вопрос']) || subs[0] || {};
            var a = findFieldByIntent(subs, ['answer', 'ответ']) || subs[1] || {};
            html.push('    <p class="zifra-acf-kicker" data-production-target="kicker">' + h(group.title) + '</p>');
            html.push('    <div class="zifra-acf-faq" data-production-target="faqList">');
            for (var i = 0; i < 3; i++) {
                html.push('      <details class="zifra-acf-card" data-production-target="card"' + (i === 0 ? ' open' : '') + '><summary data-production-target="question">' + h(i === 0 ? sampleFor(q) : 'Можно ли менять стили блока?') + '</summary><div class="zifra-acf-faq-answer" data-production-target="answer">' + h(i === 0 ? sampleFor(a) : 'Да, CSS scoped и его можно перенести в тему, изменить цвета, сетку и отступы.') + '</div></details>');
            }
            html.push('    </div>');
        } else if (kind === 'team' || kind === 'testimonials' || kind === 'cards') {
            var rep = fields[0];
            var repSubs = rep.sub_fields || [];
            html.push('    <p class="zifra-acf-kicker" data-production-target="kicker">' + h(group.title) + '</p>');
            html.push('    <div class="zifra-acf-grid">');
            for (var ci = 0; ci < 3; ci++) {
                html.push('      <article class="zifra-acf-card ' + (kind === 'team' ? 'zifra-acf-person' : 'zifra-acf-quote') + '" data-production-target="card">');
                if (kind === 'team') html.push('        <div class="zifra-acf-avatar" data-production-target="avatar">' + (ci === 0 ? 'А' : ci === 1 ? 'М' : 'И') + '</div>');
                if (kind === 'testimonials') html.push('        <div class="zifra-acf-rating" data-production-target="rating">★★★★★</div>');
                for (var si = 0; si < Math.min(repSubs.length, 4); si++) html.push('        ' + renderSampleField(repSubs[si]));
                html.push('      </article>');
            }
            html.push('    </div>');
        } else if (kind === 'builder') {
            html.push('    <div class="zifra-acf-list">');
            for (var bi = 0; bi < fields.length; bi++) {
                if (fields[bi].type !== 'flexible_content') continue;
                var layouts = fields[bi].layouts || [];
                for (var li = 0; li < Math.min(layouts.length, 3); li++) {
                    html.push('      <section class="zifra-acf-layout zifra-acf-card" data-production-target="layout"><p class="zifra-acf-kicker" data-production-target="kicker">' + h(layouts[li].label || layouts[li].name) + '</p>');
                    var lsubs = layouts[li].sub_fields || [];
                    for (var lsi = 0; lsi < Math.min(lsubs.length, 3); lsi++) html.push('        ' + renderSampleField(lsubs[lsi]));
                    html.push('      </section>');
                }
            }
            html.push('    </div>');
        } else {
            html.push('    <p class="zifra-acf-kicker" data-production-target="kicker">' + h(group.title) + '</p>');
            html.push('    <div class="zifra-acf-grid">');
            for (var gi = 0; gi < fields.length; gi++) html.push('      <article class="zifra-acf-card" data-production-target="card">' + renderSampleField(fields[gi]) + '</article>');
            html.push('    </div>');
        }
        html.push('  </div>');
        html.push('</section>');
        return html.join('\n');
    }

    function fullPreviewDoc() {
        var script = '<script>(function(){function select(el){var prev=document.querySelector(".zifra-production-selected");if(prev)prev.classList.remove("zifra-production-selected");if(el)el.classList.add("zifra-production-selected");}document.addEventListener("click",function(e){var target=e.target.closest("[data-production-target]");var field=e.target.closest("[data-production-field-target]");if(target){select(target);parent.postMessage({source:"acf-production-target",styleKey:target.getAttribute("data-production-target")},"*");return;}if(field){select(field);parent.postMessage({source:"acf-production-target",fieldKey:field.getAttribute("data-production-field-target")},"*");}});})();</' + 'script>';
        return '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{margin:0;background:#f8fafc;}' + productionCSS() + '</style></head><body>' + renderPreviewBlock() + script + '</body></html>';
    }

    function activeStyleKeys() {
        var kind = inferBlock(getFields());
        var keys = ['section'];
        if (kind === 'hero') return keys.concat(['kicker', 'title', 'lead', 'button', 'media']);
        if (kind === 'faq') return keys.concat(['kicker', 'faqList', 'card', 'question', 'answer']);
        if (kind === 'team') return keys.concat(['kicker', 'card', 'avatar', 'fieldLabel', 'fieldValue']);
        if (kind === 'testimonials') return keys.concat(['kicker', 'card', 'rating', 'fieldLabel', 'fieldValue']);
        if (kind === 'builder') return keys.concat(['kicker', 'layout', 'card', 'fieldLabel', 'fieldValue', 'media', 'button']);
        return keys.concat(['kicker', 'card', 'fieldLabel', 'fieldValue', 'media', 'button']);
    }

    function currentStyleSignature() {
        var fieldKeys = collectFieldStyleTargets().map(function(field) {
            return attr(fieldName(field));
        }).join(',');
        return inferBlock(getFields()) + ':' + activeStyleKeys().join(',') + ':' + fieldKeys;
    }

    function renderControl(key, control) {
        var prop = control[0];
        var label = control[1];
        var type = control[2];
        var unit = control[3] || '';
        var value = getElementStyle(key)[prop];
        var id = 'pe-' + key + '-' + prop;
        if (type === 'color') {
            return [
                '<div class="se-row">',
                '  <span class="se-label">' + h(label) + '</span>',
                '  <div class="se-control-pair">',
                '    <input type="color" class="se-color" id="' + id + '-color" value="' + h(value) + '" data-production-style="1" data-element="' + h(key) + '" data-prop="' + h(prop) + '">',
                '    <input type="text" class="se-input" id="' + id + '" value="' + h(value) + '" data-production-style="1" data-element="' + h(key) + '" data-prop="' + h(prop) + '">',
                '  </div>',
                '</div>'
            ].join('');
        }
        return [
            '<div class="se-row">',
            '  <span class="se-label">' + h(label) + '</span>',
            '  <input type="number" class="se-input se-size" id="' + id + '" value="' + h(value) + '" data-production-style="1" data-element="' + h(key) + '" data-prop="' + h(prop) + '">',
            unit ? '  <span class="se-unit">' + h(unit) + '</span>' : '',
            '</div>'
        ].join('');
    }

    function renderFieldStylePanel(field) {
        var key = attr(fieldName(field));
        var s = getFieldStyle(field);
        var title = fieldLabel(field);
        return [
            '<div class="se-row-group" data-field-style-panel="' + h(key) + '">',
            '<div class="se-row-group-title"><span>Поле: ' + h(title) + '</span><small>.' + h(key) + '</small></div>',
            '<div class="se-row"><span class="se-label">Label цвет</span><div class="se-control-pair"><input type="color" class="se-color" value="' + h(s.labelColor) + '" data-field-style="1" data-field-key="' + h(key) + '" data-prop="labelColor"><input type="text" class="se-input" value="' + h(s.labelColor) + '" data-field-style="1" data-field-key="' + h(key) + '" data-prop="labelColor"></div></div>',
            '<div class="se-row"><span class="se-label">Label размер</span><input type="number" class="se-input se-size" value="' + h(s.labelSize) + '" data-field-style="1" data-field-key="' + h(key) + '" data-prop="labelSize"><span class="se-unit">px</span></div>',
            '<div class="se-row"><span class="se-label">Value цвет</span><div class="se-control-pair"><input type="color" class="se-color" value="' + h(s.valueColor) + '" data-field-style="1" data-field-key="' + h(key) + '" data-prop="valueColor"><input type="text" class="se-input" value="' + h(s.valueColor) + '" data-field-style="1" data-field-key="' + h(key) + '" data-prop="valueColor"></div></div>',
            '<div class="se-row"><span class="se-label">Value размер</span><input type="number" class="se-input se-size" value="' + h(s.valueSize) + '" data-field-style="1" data-field-key="' + h(key) + '" data-prop="valueSize"><span class="se-unit">px</span></div>',
            '<div class="se-row"><span class="se-label">Value вес</span><input type="number" class="se-input se-size" value="' + h(s.valueWeight) + '" data-field-style="1" data-field-key="' + h(key) + '" data-prop="valueWeight"></div>',
            '</div>'
        ].join('');
    }

    function renderDynamicStyleEditor(force) {
        var body = document.querySelector('#style-editor .style-editor-body');
        if (!body) return;
        var sig = currentStyleSignature();
        if (!force && styleEditorSignature === sig) return;
        styleEditorSignature = sig;
        var keys = activeStyleKeys();
        var html = ['<p class="se-dynamic-note">Редактируются реальные элементы текущего превью. Эти же значения попадают в HTML/CSS export.</p>'];
        for (var i = 0; i < keys.length; i++) {
            var panel = STYLE_PANELS[keys[i]];
            if (!panel) continue;
            html.push('<div class="se-row-group" data-style-panel="' + h(keys[i]) + '">');
            html.push('<div class="se-row-group-title"><span>' + h(panel.label) + '</span><small>' + h(panel.hint) + '</small></div>');
            for (var j = 0; j < panel.controls.length; j++) {
                html.push(renderControl(keys[i], panel.controls[j]));
            }
            html.push('</div>');
        }
        var fieldList = collectFieldStyleTargets();
        var seen = {};
        for (var f = 0; f < fieldList.length; f++) {
            var fieldKey = attr(fieldName(fieldList[f]));
            if (!fieldKey || seen[fieldKey]) continue;
            seen[fieldKey] = true;
            html.push(renderFieldStylePanel(fieldList[f]));
        }
        html.push('<div style="margin-top:10px;display:flex;justify-content:flex-end;gap:8px;"><button class="se-reset" data-action="reset-production-styles">Сбросить стили элементов</button></div>');
        body.innerHTML = html.join('');
        activateProductionStylePanel(activeProductionTarget, activeProductionFieldTarget, false);
    }

    function activateProductionStylePanel(styleKey, fieldKey, shouldScroll) {
        var panels = document.querySelectorAll('#style-editor .se-row-group');
        for (var i = 0; i < panels.length; i++) panels[i].classList.remove('is-active');

        var selector = '';
        if (fieldKey) selector = '#style-editor [data-field-style-panel="' + fieldKey + '"]';
        else if (styleKey) selector = '#style-editor [data-style-panel="' + styleKey + '"]';
        if (!selector) return;

        var target = document.querySelector(selector);
        if (!target) return;
        target.classList.add('is-active');
        var editor = document.getElementById('style-editor');
        if (editor && editor.classList.contains('collapsed')) editor.classList.remove('collapsed');
        if (shouldScroll) target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function handleProductionTargetMessage(data) {
        activeProductionTarget = data.styleKey || null;
        activeProductionFieldTarget = data.fieldKey || null;
        activateProductionStylePanel(activeProductionTarget, activeProductionFieldTarget, true);
    }

    function resetProductionStyles() {
        window.productionElementStyles = {};
        window.productionFieldStyles = {};
        var keys = Object.keys(ELEMENT_STYLE_DEFAULTS);
        for (var i = 0; i < keys.length; i++) {
            window.productionElementStyles[keys[i]] = copyStyleObject(ELEMENT_STYLE_DEFAULTS[keys[i]]);
        }
        window.blockStyles = window.blockStyles || {};
        window.blockStyles.bgColor = ELEMENT_STYLE_DEFAULTS.section.bgColor;
        window.blockStyles.textColor = ELEMENT_STYLE_DEFAULTS.section.textColor;
        window.blockStyles.padding = ELEMENT_STYLE_DEFAULTS.section.paddingY;
        window.blockStyles.gap = ELEMENT_STYLE_DEFAULTS.section.gap;
        window.blockStyles.cardBg = ELEMENT_STYLE_DEFAULTS.card.bgColor;
        window.blockStyles.cardPadding = ELEMENT_STYLE_DEFAULTS.card.padding;
        window.blockStyles.cardRadius = ELEMENT_STYLE_DEFAULTS.card.radius;
        window.blockStyles.borderColor = ELEMENT_STYLE_DEFAULTS.card.borderColor;
        window.blockStyles.borderWidth = ELEMENT_STYLE_DEFAULTS.card.borderWidth;
        renderDynamicStyleEditor(true);
        refreshProductionViews();
    }

    function handleProductionStyleInput(target) {
        var key = target.getAttribute('data-element');
        var prop = target.getAttribute('data-prop');
        if (!key || !prop) return;
        var value = target.value;
        setElementStyle(key, prop, value);
        if (target.type === 'color') {
            var paired = document.getElementById('pe-' + key + '-' + prop);
            if (paired && paired.value !== value) paired.value = value;
        } else if (isHexColor(value)) {
            var color = document.getElementById('pe-' + key + '-' + prop + '-color');
            if (color && color.value !== value) color.value = value;
        }
    }

    function handleFieldStyleInput(target) {
        var key = target.getAttribute('data-field-key');
        var prop = target.getAttribute('data-prop');
        if (!key || !prop) return;
        setFieldStyle(key, prop, target.value);
        var row = target.closest('.se-row');
        if (!row) return;
        var paired = row.querySelector(target.type === 'color' ? 'input[type="text"]' : 'input[type="color"]');
        if (paired && (target.type === 'color' || isHexColor(target.value)) && paired.value !== target.value) {
            paired.value = target.value;
        }
    }

    function moveToggleButton(active) {
        var btn = document.getElementById('toggle-preview-btn');
        if (!btn) return;
        if (!toggleHome) toggleHome = { parent: btn.parentNode, next: btn.nextSibling };
        var headerActions = document.querySelector('.visual-editor-header-actions');
        if (active && headerActions && btn.parentNode !== headerActions) {
            headerActions.appendChild(btn);
        } else if (!active && toggleHome.parent && btn.parentNode !== toggleHome.parent) {
            if (toggleHome.next) toggleHome.parent.insertBefore(btn, toggleHome.next);
            else toggleHome.parent.appendChild(btn);
        }
    }

    var refreshTimer = 0;

    function refreshProductionViews() {
        var iframe = document.getElementById('visual-editor-iframe');
        var legacyFrame = document.getElementById('preview-frame');
        var workspace = document.querySelector('.generator-workspace');
        renderDynamicStyleEditor(false);
        if (iframe && workspace && workspace.classList.contains('preview-mode')) {
            iframe.srcdoc = fullPreviewDoc();
        }
        if (legacyFrame) legacyFrame.removeAttribute('srcdoc');
        var activeTab = document.querySelector('.code-tab.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'html') {
            window.generateHTML();
        }
    }

    function setEditorMode(active) {
        var workspace = document.querySelector('.generator-workspace');
        var btn = document.getElementById('toggle-preview-btn');
        if (!workspace) return;

        window.previewModeActive = !!active;
        workspace.classList.toggle('preview-mode', !!active);
        moveToggleButton(!!active);
        if (btn) {
            btn.classList.toggle('active', !!active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            btn.innerHTML = active
                ? '<span class="material-symbols-outlined">edit</span> Вернуться к полям'
                : '<span class="material-symbols-outlined">visibility</span> Открыть live preview';
        }
        refreshProductionViews();
        if (active) {
            window.requestAnimationFrame(function() {
                var editor = document.getElementById('visual-editor');
                if (!editor) return;
                var y = editor.getBoundingClientRect().top + window.pageYOffset - 96;
                window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
            });
        }
    }

    function scheduleRefresh() {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(refreshProductionViews, 120);
    }

    window.generatePreviewCSS = productionCSS;
    window.previewHTMLPlain = renderPreviewBlock;
    window.generatePreviewHTML = fullPreviewDoc;
    window.generateVisualHTML = fullPreviewDoc;
    window.renderVisualEditor = refreshProductionViews;
    window.applyStyleChange = applyProductionStyle;
    window.applyStyleColor = applyProductionStyle;
    window.updateVisualEditorIfActive = function() {
        if (window.previewModeActive) refreshProductionViews();
    };
    window.updatePreview = refreshProductionViews;
    window.togglePreviewMode = function() {
        setEditorMode(!window.previewModeActive);
    };
    window.handleProductionTargetMessage = handleProductionTargetMessage;
    window.refreshProductionViews = refreshProductionViews;
    window.generateHTML = function() {
        var output = document.getElementById('code-output');
        if (output) output.textContent = renderProductionPHP();
    };

    document.addEventListener('DOMContentLoaded', function() {
        var label = document.querySelector('.visual-editor-label');
        if (label) label.textContent = 'Единый live preview';
        renderDynamicStyleEditor(true);
        var activeTab = document.querySelector('.code-tab.active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'html') window.generateHTML();
    });
    document.addEventListener('input', function(e) {
        var target = e.target.closest('[data-production-style]');
        if (target) handleProductionStyleInput(target);
        var fieldTarget = e.target.closest('[data-field-style]');
        if (fieldTarget) handleFieldStyleInput(fieldTarget);
    }, true);
    window.addEventListener('message', function(e) {
        var data = e.data || {};
        if (data.source !== 'acf-production-target') return;
        handleProductionTargetMessage(data);
    });
    document.addEventListener('click', function(e) {
        var reset = e.target.closest('[data-action="reset-production-styles"]');
        if (reset) resetProductionStyles();
    }, true);
    document.addEventListener('click', scheduleRefresh, true);
    document.addEventListener('input', scheduleRefresh, true);
    document.addEventListener('change', scheduleRefresh, true);
})();
