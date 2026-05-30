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
            return '<div class="zifra-acf-media" aria-hidden="true"></div>';
        }
        if (field.type === 'link') {
            return '<a class="zifra-acf-btn" href="#">' + h(sampleFor(field)) + '</a>';
        }
        return '<div class="zifra-acf-field zifra-acf-field--' + attr(fieldName(field)) + '"><span class="zifra-acf-label">' + h(fieldLabel(field)) + '</span><div class="zifra-acf-value">' + h(sampleFor(field)) + '</div></div>';
    }

    function renderPreviewBlock() {
        var fields = getFields();
        var group = getGroup();
        var kind = inferBlock(fields);
        var html = [];
        html.push('<section class="zifra-acf-block zifra-acf-block--' + attr(group.key) + '">');
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
            html.push('        <p class="zifra-acf-kicker">' + h(group.title) + '</p>');
            html.push('        <h2 class="zifra-acf-title">' + h(sampleFor(title)) + '</h2>');
            if (lead) html.push('        <p class="zifra-acf-lead">' + h(sampleFor(lead)) + '</p>');
            if (link) html.push('        <div class="zifra-acf-actions">' + renderSampleField(link) + '</div>');
            html.push('      </div>');
            html.push('      ' + (image ? renderSampleField(image) : '<div class="zifra-acf-media" aria-hidden="true"></div>'));
            html.push('    </div>');
        } else if (kind === 'faq') {
            var f = fields[0];
            var subs = f.sub_fields || [];
            var q = findFieldByIntent(subs, ['question', 'вопрос']) || subs[0] || {};
            var a = findFieldByIntent(subs, ['answer', 'ответ']) || subs[1] || {};
            html.push('    <p class="zifra-acf-kicker">' + h(group.title) + '</p>');
            html.push('    <div class="zifra-acf-faq">');
            for (var i = 0; i < 3; i++) {
                html.push('      <details class="zifra-acf-card"' + (i === 0 ? ' open' : '') + '><summary>' + h(i === 0 ? sampleFor(q) : 'Можно ли менять стили блока?') + '</summary><div class="zifra-acf-faq-answer">' + h(i === 0 ? sampleFor(a) : 'Да, CSS scoped и его можно перенести в тему, изменить цвета, сетку и отступы.') + '</div></details>');
            }
            html.push('    </div>');
        } else if (kind === 'team' || kind === 'testimonials' || kind === 'cards') {
            var rep = fields[0];
            var repSubs = rep.sub_fields || [];
            html.push('    <p class="zifra-acf-kicker">' + h(group.title) + '</p>');
            html.push('    <div class="zifra-acf-grid">');
            for (var ci = 0; ci < 3; ci++) {
                html.push('      <article class="zifra-acf-card ' + (kind === 'team' ? 'zifra-acf-person' : 'zifra-acf-quote') + '">');
                if (kind === 'team') html.push('        <div class="zifra-acf-avatar">' + (ci === 0 ? 'А' : ci === 1 ? 'М' : 'И') + '</div>');
                if (kind === 'testimonials') html.push('        <div class="zifra-acf-rating">★★★★★</div>');
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
                    html.push('      <section class="zifra-acf-layout zifra-acf-card"><p class="zifra-acf-kicker">' + h(layouts[li].label || layouts[li].name) + '</p>');
                    var lsubs = layouts[li].sub_fields || [];
                    for (var lsi = 0; lsi < Math.min(lsubs.length, 3); lsi++) html.push('        ' + renderSampleField(lsubs[lsi]));
                    html.push('      </section>');
                }
            }
            html.push('    </div>');
        } else {
            html.push('    <p class="zifra-acf-kicker">' + h(group.title) + '</p>');
            html.push('    <div class="zifra-acf-grid">');
            for (var gi = 0; gi < fields.length; gi++) html.push('      <article class="zifra-acf-card">' + renderSampleField(fields[gi]) + '</article>');
            html.push('    </div>');
        }
        html.push('  </div>');
        html.push('</section>');
        return html.join('\n');
    }

    function fullPreviewDoc() {
        return '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>body{margin:0;background:#f8fafc;}' + productionCSS() + '</style></head><body>' + renderPreviewBlock() + '</body></html>';
    }

    var refreshTimer = 0;

    function refreshProductionViews() {
        var iframe = document.getElementById('visual-editor-iframe');
        var workspace = document.querySelector('.generator-workspace');
        if (iframe && workspace && workspace.classList.contains('preview-mode')) {
            iframe.srcdoc = fullPreviewDoc();
        }
        if (window.currentCodeTab === 'html') {
            window.generateHTML();
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
    window.generateHTML = function() {
        var output = document.getElementById('code-output');
        if (output) output.textContent = renderProductionPHP();
    };

    document.addEventListener('DOMContentLoaded', function() {
        if (window.currentCodeTab === 'html') window.generateHTML();
    });
    document.addEventListener('click', scheduleRefresh, true);
    document.addEventListener('input', scheduleRefresh, true);
    document.addEventListener('change', scheduleRefresh, true);
})();
