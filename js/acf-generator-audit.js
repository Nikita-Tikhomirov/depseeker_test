'use strict';

(function() {
    var pending = 0;

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getFields() {
        return Array.isArray(window.fields) ? window.fields : [];
    }

    function walkFields(items, cb, path) {
        items = items || [];
        path = path || [];
        for (var i = 0; i < items.length; i++) {
            var field = items[i];
            var nextPath = path.concat(field.label || field.name || field.key || ('field_' + (i + 1)));
            cb(field, nextPath);

            if (Array.isArray(field.sub_fields)) {
                walkFields(field.sub_fields, cb, nextPath);
            }

            if (Array.isArray(field.layouts)) {
                for (var j = 0; j < field.layouts.length; j++) {
                    var layout = field.layouts[j];
                    if (Array.isArray(layout.sub_fields)) {
                        walkFields(layout.sub_fields, cb, nextPath.concat(layout.label || layout.name || ('layout_' + (j + 1))));
                    }
                }
            }
        }
    }

    function addIssue(issues, type, text) {
        issues.push({ type: type, text: text });
    }

    function countNestedFields(fields) {
        var count = 0;
        walkFields(fields, function() { count += 1; });
        return count;
    }

    function countTopLevelRenderable(fields) {
        var count = 0;
        for (var i = 0; i < fields.length; i++) {
            if (fields[i] && fields[i].type !== 'tab' && fields[i].type !== 'message') count += 1;
        }
        return count;
    }

    function inferExportKind(fields) {
        if (!fields.length) return 'Не выбран';
        var first = fields[0] || {};
        var text = fields.map(function(field) {
            return [field.name, field.label, field.type].join(' ');
        }).join(' ').toLowerCase();

        if (fields.some(function(field) { return field.type === 'flexible_content'; })) return 'Page Builder';
        if (first.type === 'repeater' && /faq|question|answer|вопрос|ответ/.test(text)) return 'FAQ';
        if (first.type === 'repeater' && /team|person|member|name|role|команд|имя|должност/.test(text)) return 'Команда';
        if (first.type === 'repeater' && /review|testimonial|rating|отзыв|рейтинг/.test(text)) return 'Отзывы';
        if (/hero|headline|subtitle|button|cta|заголовок|кнопк/.test(text)) return 'Hero';
        return 'Карточки';
    }

    function renderExportSummary(fields, hardIssues) {
        var total = countNestedFields(fields);
        var topLevel = countTopLevelRenderable(fields);
        var kind = inferExportKind(fields);
        var ready = hardIssues === 0 && fields.length > 0;
        var nextText = ready
            ? 'Готовый пакет: регистрация ACF, JSON snapshot и чистый PHP-шаблон с CSS без editor-маркеров.'
            : 'Сначала закройте критичные пункты выше, затем проверьте preview и скачайте код.';
        var action = ready
            ? '<button class="gen-btn gen-btn-sm gen-btn-primary" data-action="switch-tab" data-tab="html"><span class="material-symbols-outlined">integration_instructions</span> Открыть шаблон</button>'
            : '<button class="gen-btn gen-btn-sm gen-btn-primary" data-action="toggle-preview-mode"><span class="material-symbols-outlined">visibility</span> Проверить preview</button>';

        return [
            '<div class="audit-export">',
            '  <div class="audit-export-grid">',
            '    <div class="audit-export-stat"><span class="audit-export-label">Тип блока</span><span class="audit-export-value">' + esc(kind) + '</span></div>',
            '    <div class="audit-export-stat"><span class="audit-export-label">Поля</span><span class="audit-export-value">' + total + ' всего / ' + topLevel + ' верхний слой</span></div>',
            '    <div class="audit-export-stat"><span class="audit-export-label">Экспорт</span><span class="audit-export-value">' + (ready ? 'Готов' : 'Нужны правки') + '</span></div>',
            '  </div>',
            '  <div class="audit-export-next"><span class="material-symbols-outlined">' + (ready ? 'task_alt' : 'rule') + '</span><span>' + esc(nextText) + '</span></div>',
            '  <div class="audit-handoff">',
            '    <div class="audit-handoff-item"><strong>ACF PHP</strong><span>регистрация группы полей</span></div>',
            '    <div class="audit-handoff-item"><strong>WP-шаблон+CSS</strong><span>чистая верстка блока</span></div>',
            '    <div class="audit-handoff-item"><strong>JSON snapshot</strong><span>снимок структуры проекта</span></div>',
            '  </div>',
            '  <div class="audit-actions">',
            action,
            '    <button class="gen-btn gen-btn-sm gen-btn-outline" data-action="copy-code"><span class="material-symbols-outlined">content_copy</span> Копировать</button>',
            '    <button class="gen-btn gen-btn-sm gen-btn-outline" data-action="download-code"><span class="material-symbols-outlined">download</span> Скачать код</button>',
            '    <button class="gen-btn gen-btn-sm gen-btn-outline" data-action="download-project-bundle"><span class="material-symbols-outlined">inventory_2</span> Snapshot</button>',
            '  </div>',
            '</div>'
        ].join('');
    }

    function validateStructure() {
        var fields = getFields();
        var issues = [];
        var fieldNames = {};
        var fieldKeys = {};
        var groupKeyEl = document.getElementById('group-key');
        var groupTitleEl = document.getElementById('group-title');
        var groupKey = groupKeyEl ? groupKeyEl.value.trim() : '';
        var groupTitle = groupTitleEl ? groupTitleEl.value.trim() : '';

        if (!groupTitle) {
            addIssue(issues, 'error', 'Добавьте название группы: оно попадет в админку WordPress.');
        }
        if (!groupKey) {
            addIssue(issues, 'error', 'Добавьте ключ группы в формате group_name.');
        } else if (groupKey.indexOf('group_') !== 0) {
            addIssue(issues, 'warning', 'Лучше начать ключ группы с group_, чтобы он выглядел как стандартный ACF key.');
        }
        if (fields.length === 0) {
            addIssue(issues, 'error', 'Добавьте хотя бы одно поле перед экспортом.');
        }

        walkFields(fields, function(field, path) {
            var place = path.join(' / ');
            var name = field.name ? String(field.name).trim() : '';
            var key = field.key ? String(field.key).trim() : '';

            if (!field.label) {
                addIssue(issues, 'warning', 'У поля "' + place + '" нет понятного label.');
            }
            if (!name) {
                addIssue(issues, 'error', 'У поля "' + place + '" пустое name.');
            } else if (fieldNames[name]) {
                addIssue(issues, 'error', 'Дублируется name поля: ' + name + '.');
            } else {
                fieldNames[name] = true;
            }
            if (!key) {
                addIssue(issues, 'error', 'У поля "' + place + '" пустой key.');
            } else if (fieldKeys[key]) {
                addIssue(issues, 'error', 'Дублируется key поля: ' + key + '.');
            } else {
                fieldKeys[key] = true;
            }

            if ((field.type === 'repeater' || field.type === 'group') && (!field.sub_fields || field.sub_fields.length === 0)) {
                addIssue(issues, 'warning', 'Структурное поле "' + (field.label || field.name) + '" пока без вложенных полей.');
            }

            if (field.type === 'flexible_content') {
                if (!field.layouts || field.layouts.length === 0) {
                    addIssue(issues, 'warning', 'Flexible Content "' + (field.label || field.name) + '" пока без layouts.');
                } else {
                    for (var i = 0; i < field.layouts.length; i++) {
                        if (!field.layouts[i].sub_fields || field.layouts[i].sub_fields.length === 0) {
                            addIssue(issues, 'warning', 'Layout "' + (field.layouts[i].label || field.layouts[i].name) + '" пока без полей.');
                        }
                    }
                }
            }
        });

        if (fields.length > 0 && countNestedFields(fields) < 3) {
            addIssue(issues, 'tip', 'Добавьте 2-3 поля, чтобы экспорт был полезнее как готовый шаблон.');
        }

        return issues;
    }

    function scoreIssues(issues) {
        var score = 100;
        for (var i = 0; i < issues.length; i++) {
            if (issues[i].type === 'error') score -= 20;
            else if (issues[i].type === 'warning') score -= 9;
            else score -= 3;
        }
        return Math.max(0, Math.min(100, score));
    }

    function issueIcon(type) {
        if (type === 'error') return 'error';
        if (type === 'warning') return 'warning';
        return 'tips_and_updates';
    }

    function renderAudit() {
        var status = document.getElementById('acf-audit-status');
        var scoreEl = document.getElementById('acf-audit-score');
        if (!status || !scoreEl) return;

        var fields = getFields();
        var issues = validateStructure();
        var score = scoreIssues(issues);
        var hardIssues = issues.filter(function(issue) { return issue.type === 'error'; }).length;
        var summary;
        var html = '';

        scoreEl.textContent = score + '%';
        if (hardIssues === 0 && fields.length > 0) {
            summary = 'Структура выглядит готовой: можно копировать код, скачать файл или сохранить snapshot проекта.';
            html += '<ul class="audit-list"><li class="audit-item audit-item--ok"><span class="material-symbols-outlined">check_circle</span><span>Критичных ошибок нет. Проверьте names под ваш шаблон и экспортируйте код.</span></li></ul>';
        } else if (fields.length === 0) {
            summary = 'Начните с готового шаблона или добавьте первое поле. После этого аудит покажет, что мешает экспорту.';
        } else {
            summary = 'Есть пункты, которые лучше исправить перед переносом в WordPress.';
        }

        html += renderExportSummary(fields, hardIssues);

        if (issues.length > 0) {
            html += '<ul class="audit-list">';
            for (var i = 0; i < Math.min(issues.length, 6); i++) {
                html += '<li class="audit-item audit-item--' + esc(issues[i].type) + '"><span class="material-symbols-outlined">' + issueIcon(issues[i].type) + '</span><span>' + esc(issues[i].text) + '</span></li>';
            }
            html += '</ul>';
        }

        status.innerHTML = '<div class="audit-summary">' + esc(summary) + '</div>' + html;
    }

    function scheduleAudit() {
        clearTimeout(pending);
        pending = setTimeout(renderAudit, 80);
    }

    function getCurrentCode() {
        var output = document.getElementById('code-output');
        return output ? output.textContent : '';
    }

    function downloadSnapshot() {
        var groupTitleEl = document.getElementById('group-title');
        var groupKeyEl = document.getElementById('group-key');
        var groupDescEl = document.getElementById('group-desc');
        var groupKey = groupKeyEl && groupKeyEl.value ? groupKeyEl.value : 'acf_project';
        var snapshot = {
            generated_at: new Date().toISOString(),
            generator: 'zifra-acf-generator',
            group: {
                title: groupTitleEl ? groupTitleEl.value : '',
                key: groupKey,
                description: groupDescEl ? groupDescEl.value : ''
            },
            location_rules: Array.isArray(window.locationRules) ? window.locationRules : [],
            fields: getFields(),
            current_tab: window.currentCodeTab || 'php',
            current_code: getCurrentCode(),
            audit_issues: validateStructure()
        };
        var blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = groupKey.replace(/[^a-zA-Z0-9_-]+/g, '_') + '-snapshot.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function() { URL.revokeObjectURL(link.href); }, 1000);
        if (typeof window.showToast === 'function') {
            window.showToast('Snapshot проекта скачан');
        }
    }

    function hookGlobal(name) {
        if (typeof window[name] !== 'function') return;
        var original = window[name];
        if (original._auditWrapped) return;
        window[name] = function() {
            var result = original.apply(this, arguments);
            scheduleAudit();
            return result;
        };
        window[name]._auditWrapped = true;
    }

    document.addEventListener('click', function(event) {
        var action = event.target.closest('[data-action]');
        if (!action) return;
        if (action.getAttribute('data-action') === 'download-project-bundle') {
            event.preventDefault();
            downloadSnapshot();
            return;
        }
        scheduleAudit();
    });

    document.addEventListener('input', scheduleAudit, true);
    document.addEventListener('change', scheduleAudit, true);
    document.addEventListener('DOMContentLoaded', function() {
        hookGlobal('renderAll');
        hookGlobal('liveUpdate');
        hookGlobal('loadTemplate');
        scheduleAudit();
    });
})();
