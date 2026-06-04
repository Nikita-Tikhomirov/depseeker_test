/**
 * Recipe Converter — меры, веса, масштабирование рецептов.
 * Для российских пользователей. Все величины в метрической системе.
 */
(function () {
    'use strict';

    /* ================================================================
     *  DATA
     * ================================================================ */

    /** Стандартный стакан в мл */
    var CUP_ML = 250;
    var TBSP_ML = 18;
    var TSP_ML = 5;

    /** Единицы измерения */
    var UNITS = [
        { id: 'ml',    name: 'миллилитры (мл)',  kind: 'volume', factor: 1 },
        { id: 'l',     name: 'литры (л)',         kind: 'volume', factor: 1000 },
        { id: 'cup',   name: 'стаканы (250 мл)',  kind: 'volume', factor: CUP_ML },
        { id: 'tbsp',  name: 'столовые ложки',    kind: 'volume', factor: TBSP_ML },
        { id: 'tsp',   name: 'чайные ложки',      kind: 'volume', factor: TSP_ML },
        { id: 'g',     name: 'граммы (г)',         kind: 'weight', factor: 1 },
        { id: 'kg',    name: 'килограммы (кг)',    kind: 'weight', factor: 1000 },
    ];

    /** Плотность продуктов: грамм на 1 мл */
    var INGREDIENTS = [
        { name: 'Мука пшеничная',        cup: 160, tbsp: 30, tsp: 10, density: 0.64 },
        { name: 'Мука ржаная',           cup: 140, tbsp: 25, tsp: 8,  density: 0.56 },
        { name: 'Сахар-песок',           cup: 200, tbsp: 25, tsp: 8,  density: 0.80 },
        { name: 'Сахарная пудра',        cup: 180, tbsp: 25, tsp: 8,  density: 0.72 },
        { name: 'Соль',                  cup: 320, tbsp: 30, tsp: 10, density: 1.28 },
        { name: 'Масло сливочное (растопл.)', cup: 210, tbsp: 17, tsp: 5, density: 0.84 },
        { name: 'Масло растительное',    cup: 200, tbsp: 17, tsp: 5,  density: 0.80 },
        { name: 'Мёд',                   cup: 325, tbsp: 30, tsp: 10, density: 1.30 },
        { name: 'Молоко',                cup: 250, tbsp: 18, tsp: 5,  density: 1.00 },
        { name: 'Вода',                  cup: 250, tbsp: 18, tsp: 5,  density: 1.00 },
        { name: 'Сметана 20%',           cup: 250, tbsp: 25, tsp: 10, density: 1.00 },
        { name: 'Кефир',                 cup: 250, tbsp: 18, tsp: 5,  density: 1.00 },
        { name: 'Рис',                   cup: 230, tbsp: 25, tsp: 8,  density: 0.92 },
        { name: 'Гречка (ядрица)',       cup: 210, tbsp: 25, tsp: 8,  density: 0.84 },
        { name: 'Творог',                cup: 250, tbsp: 20, tsp: 10, density: 1.00 },
        { name: 'Какао-порошок',         cup: 150, tbsp: 25, tsp: 8,  density: 0.60 },
        { name: 'Крахмал картофельный',  cup: 180, tbsp: 30, tsp: 10, density: 0.72 },
        { name: 'Разрыхлитель',          cup: 180, tbsp: 15, tsp: 5,  density: 0.72 },
        { name: 'Сода пищевая',          cup: 240, tbsp: 20, tsp: 7,  density: 0.96 },
        { name: 'Желатин (порошок)',     cup: 150, tbsp: 15, tsp: 5,  density: 0.60 },
        { name: 'Манная крупа',          cup: 200, tbsp: 25, tsp: 8,  density: 0.80 },
        { name: 'Овсяные хлопья',        cup: 100, tbsp: 12, tsp: 4,  density: 0.40 },
        { name: 'Орехи молотые',         cup: 140, tbsp: 12, tsp: 4,  density: 0.56 },
        { name: 'Панировочные сухари',   cup: 130, tbsp: 12, tsp: 4,  density: 0.52 },
        { name: 'Уксус столовый',        cup: 250, tbsp: 15, tsp: 5,  density: 1.00 },
    ];

    /** Быстрые пресеты для конвертера */
    var PRESETS = [
        { label: '1 стакан муки → граммы',      from: 1, fromU: 'cup', toU: 'g', ingr: 'Мука пшеничная' },
        { label: '1 стакан сахара → граммы',     from: 1, fromU: 'cup', toU: 'g', ingr: 'Сахар-песок' },
        { label: '200 г муки → стаканы',         from: 200, fromU: 'g', toU: 'cup', ingr: 'Мука пшеничная' },
        { label: '100 мл молока → ст. ложки',    from: 100, fromU: 'ml', toU: 'tbsp', ingr: '' },
        { label: '3 ст. ложки масла → граммы',   from: 3, fromU: 'tbsp', toU: 'g', ingr: 'Масло растительное' },
        { label: '500 г → кг',                   from: 500, fromU: 'g', toU: 'kg', ingr: '' },
    ];

    /** Единицы для масштабирования */
    var SCALE_UNITS = [
        { id: 'g',  name: 'г' },
        { id: 'kg', name: 'кг' },
        { id: 'ml', name: 'мл' },
        { id: 'l',  name: 'л' },
        { id: 'cup',   name: 'стакан(ов)' },
        { id: 'tbsp',  name: 'ст. ложек' },
        { id: 'tsp',   name: 'ч. ложек' },
        { id: 'pcs',   name: 'шт.' },
        { id: 'pinch', name: 'щепоток' },
        { id: 'taste', name: 'по вкусу' },
    ];

    /** Ингредиенты по умолчанию для первого запуска скалера */
    var DEFAULT_SCALE_INGREDIENTS = [
        { name: 'Мука пшеничная', amount: 300, unit: 'g' },
        { name: 'Сахар-песок', amount: 150, unit: 'g' },
        { name: 'Масло сливочное', amount: 100, unit: 'g' },
        { name: 'Яйца', amount: 3, unit: 'pcs' },
        { name: 'Молоко', amount: 200, unit: 'ml' },
        { name: 'Разрыхлитель', amount: 1, unit: 'tsp' },
    ];

    /* ================================================================
     *  DOM refs
     * ================================================================ */

    var $ = function (id) { return document.getElementById(id); };

    // Tab 1: Converter
    var elConvIngredient = $('conv-ingredient');
    var elConvFromVal    = $('conv-from-val');
    var elConvFromUnit   = $('conv-from-unit');
    var elConvToUnit     = $('conv-to-unit');
    var elConvResult     = $('conv-result');
    var elConvResultNum  = $('conv-result-num');
    var elConvResultUnit = $('conv-result-unit');
    var elConvResultEq   = $('conv-result-eq');
    var elConvPresets    = $('conv-presets');

    // Temp
    var elTempVal    = $('temp-val');
    var elTempFrom   = $('temp-from');
    var elTempResult = $('temp-result');

    // Tab 2: Scaler
    var elScaleFromPortions = $('scale-from-portions');
    var elScaleToPortions   = $('scale-to-portions');
    var elScaleApply        = $('scale-apply');
    var elScaleFactor       = $('scale-factor-display');
    var elScaleIngredients  = $('scale-ingredients');
    var elScaleAddRow       = $('scale-add-row');
    var elScaleResult       = $('scale-result');
    var elScaleResultList   = $('scale-result-list');

    // Tab 3: Reference
    var elRefSearch  = $('ref-search');
    var elRefTable   = $('ref-table-body');

    /* ================================================================
     *  HELPERS
     * ================================================================ */

    function findUnit(id) {
        for (var i = 0; i < UNITS.length; i++) {
            if (UNITS[i].id === id) return UNITS[i];
        }
        return null;
    }

    function findIngredient(name) {
        for (var i = 0; i < INGREDIENTS.length; i++) {
            if (INGREDIENTS[i].name === name) return INGREDIENTS[i];
        }
        return null;
    }

    function formatNum(n) {
        if (n === 0) return '0';
        if (Math.abs(n) < 0.01) return n.toFixed(4);
        if (Math.abs(n) < 1) return parseFloat(n.toFixed(3)).toString();
        if (Math.abs(n) < 100) return parseFloat(n.toFixed(2)).toString();
        return parseFloat(n.toFixed(1)).toString();
    }

    /* ================================================================
     *  TAB SWITCHING
     * ================================================================ */

    function switchTab(tabId) {
        var tabs = document.querySelectorAll('.rc-tab');
        var panels = document.querySelectorAll('.rc-panel');

        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
            tabs[i].setAttribute('aria-selected', 'false');
        }
        for (var j = 0; j < panels.length; j++) {
            panels[j].classList.remove('active');
        }

        var activeTab = document.querySelector('[data-tab="' + tabId + '"]');
        var activePanel = document.getElementById('panel-' + tabId);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
        }
        if (activePanel) {
            activePanel.classList.add('active');
        }
    }

    /* ================================================================
     *  TAB 1: UNIT CONVERTER
     * ================================================================ */

    function populateUnits() {
        var html = '';
        for (var i = 0; i < UNITS.length; i++) {
            html += '<option value="' + UNITS[i].id + '">' + UNITS[i].name + '</option>';
        }
        elConvFromUnit.innerHTML = html;
        elConvToUnit.innerHTML = html;
        elConvToUnit.value = 'g';
    }

    function populateIngredients() {
        var html = '<option value="">— Без продукта (только единицы объёма) —</option>\n';
        for (var i = 0; i < INGREDIENTS.length; i++) {
            html += '<option value="' + INGREDIENTS[i].name + '">' + INGREDIENTS[i].name + '</option>\n';
        }
        elConvIngredient.innerHTML = html;
    }

    function populatePresets() {
        var html = '';
        for (var i = 0; i < PRESETS.length; i++) {
            var p = PRESETS[i];
            html += '<button class="rc-preset" data-from="' + p.from + '" data-from-u="' + p.fromU + '" data-to-u="' + p.toU + '" data-ingr="' + (p.ingr || '') + '">';
            html += '<span class="preset-icon">📌</span>' + p.label;
            html += '</button>\n';
        }
        elConvPresets.innerHTML = html;
    }

    function convert() {
        var value = parseFloat(elConvFromVal.value);
        var fromUnitId = elConvFromUnit.value;
        var toUnitId = elConvToUnit.value;
        var ingredientName = elConvIngredient.value;

        if (isNaN(value) || value <= 0) {
            elConvResult.style.display = 'none';
            return;
        }

        var fromUnit = findUnit(fromUnitId);
        var toUnit = findUnit(toUnitId);
        if (!fromUnit || !toUnit) {
            elConvResult.style.display = 'none';
            return;
        }

        var result;
        var eqText = '';

        // Same kind: direct conversion
        if (fromUnit.kind === toUnit.kind) {
            // Both volume or both weight
            var mlEquivalent = value * fromUnit.factor;   // convert to base (ml or g)
            result = mlEquivalent / toUnit.factor;
        } else if (ingredientName) {
            // Cross-kind with ingredient density
            var ingr = findIngredient(ingredientName);
            if (!ingr) {
                elConvResult.style.display = 'none';
                return;
            }

            if (fromUnit.kind === 'volume' && toUnit.kind === 'weight') {
                // volume → weight: use density
                var ml = value * fromUnit.factor;
                var grams = ml * ingr.density;
                result = grams / toUnit.factor;
            } else if (fromUnit.kind === 'weight' && toUnit.kind === 'volume') {
                // weight → volume: invert density
                var grams2 = value * fromUnit.factor;
                var ml2 = grams2 / ingr.density;
                result = ml2 / toUnit.factor;
            } else {
                elConvResult.style.display = 'none';
                return;
            }
            eqText = ' (плотность: ' + ingr.name.toLowerCase() + ')';
        } else {
            // Cross-kind without ingredient — show hint
            elConvResult.style.display = 'flex';
            elConvResultNum.textContent = '—';
            elConvResultUnit.textContent = 'Выберите продукт для перевода объёма в вес';
            elConvResultEq.textContent = '';
            return;
        }

        elConvResult.style.display = 'flex';
        elConvResultNum.textContent = formatNum(result);
        elConvResultUnit.textContent = toUnit.name;
        elConvResultEq.textContent = '= ' + formatNum(value) + ' ' + fromUnit.name + eqText;
    }

    function applyPreset(from, fromU, toU, ingr) {
        elConvFromVal.value = from;
        elConvFromUnit.value = fromU;
        elConvToUnit.value = toU;
        elConvIngredient.value = ingr || '';
        convert();
    }

    /* ================================================================
     *  TEMPERATURE
     * ================================================================ */

    function convertTemp() {
        var val = parseFloat(elTempVal.value);
        var from = elTempFrom.value;
        if (isNaN(val)) {
            elTempResult.value = '';
            return;
        }

        var result;
        if (from === 'C') {
            result = val * 9 / 5 + 32;
            elTempResult.value = formatNum(result) + ' °F';
        } else {
            result = (val - 32) * 5 / 9;
            elTempResult.value = formatNum(result) + ' °C';
        }
    }

    /* ================================================================
     *  TAB 2: RECIPE SCALER
     * ================================================================ */

    function scaleUnitName(id) {
        for (var i = 0; i < SCALE_UNITS.length; i++) {
            if (SCALE_UNITS[i].id === id) return SCALE_UNITS[i].name;
        }
        return id;
    }

    function scaleUnitOptions() {
        var html = '';
        for (var i = 0; i < SCALE_UNITS.length; i++) {
            html += '<option value="' + SCALE_UNITS[i].id + '">' + SCALE_UNITS[i].name + '</option>';
        }
        return html;
    }

    function ingredientRowHTML(ingredient, index) {
        return '<div class="rc-ingredient-row" data-index="' + index + '">'
            + '<div class="rc-field"><label>Ингредиент</label>'
            + '<input type="text" class="scale-name" value="' + escAttr(ingredient.name) + '" placeholder="Название" aria-label="Название ингредиента">'
            + '</div>'
            + '<div class="rc-field"><label>Кол-во</label>'
            + '<input type="number" class="scale-amount" value="' + ingredient.amount + '" min="0" step="any" aria-label="Количество">'
            + '</div>'
            + '<div class="rc-field"><label>Ед.</label>'
            + '<select class="scale-unit" aria-label="Единица измерения">'
            + scaleUnitOptions()
            + '</select></div>'
            + '<button class="rc-row-remove" title="Удалить" aria-label="Удалить ингредиент">&times;</button>'
            + '</div>';
    }

    function escAttr(s) {
        return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderScaleIngredients() {
        var rows = elScaleIngredients.querySelectorAll('.rc-ingredient-row');
        var html = '';
        for (var i = 0; i < rows.length; i++) {
            var nameEl = rows[i].querySelector('.scale-name');
            var amountEl = rows[i].querySelector('.scale-amount');
            var unitEl = rows[i].querySelector('.scale-unit');
            html += ingredientRowHTML({
                name: nameEl ? nameEl.value : '',
                amount: amountEl ? amountEl.value : 1,
                unit: unitEl ? unitEl.value : 'g'
            }, i);
        }
        elScaleIngredients.innerHTML = html;
        bindScaleRowEvents();
    }

    function addIngredientRow(name, amount, unit) {
        var rows = elScaleIngredients.querySelectorAll('.rc-ingredient-row');
        var html = ingredientRowHTML({ name: name || '', amount: amount || 1, unit: unit || 'g' }, rows.length);
        elScaleIngredients.insertAdjacentHTML('beforeend', html);
        bindScaleRowEvents();
    }

    function bindScaleRowEvents() {
        var rows = elScaleIngredients.querySelectorAll('.rc-ingredient-row');
        for (var i = 0; i < rows.length; i++) {
            var removeBtn = rows[i].querySelector('.rc-row-remove');
            if (removeBtn && !removeBtn._bound) {
                removeBtn._bound = true;
                removeBtn.addEventListener('click', function () {
                    this.closest('.rc-ingredient-row').remove();
                    renderScaleIngredients();
                });
            }
        }
    }

    function collectScaleIngredients() {
        var rows = elScaleIngredients.querySelectorAll('.rc-ingredient-row');
        var result = [];
        for (var i = 0; i < rows.length; i++) {
            var nameEl = rows[i].querySelector('.scale-name');
            var amountEl = rows[i].querySelector('.scale-amount');
            var unitEl = rows[i].querySelector('.scale-unit');
            if (nameEl && amountEl && unitEl) {
                result.push({
                    name: nameEl.value.trim(),
                    amount: parseFloat(amountEl.value) || 0,
                    unit: unitEl.value
                });
            }
        }
        return result;
    }

    function doScale() {
        var fromPortions = parseFloat(elScaleFromPortions.value);
        var toPortions = parseFloat(elScaleToPortions.value);

        if (isNaN(fromPortions) || isNaN(toPortions) || fromPortions <= 0 || toPortions <= 0) {
            elScaleResult.style.display = 'none';
            return;
        }

        var factor = toPortions / fromPortions;
        elScaleFactor.textContent = '\u00d7' + formatNum(factor);

        var ingredients = collectScaleIngredients();
        if (ingredients.length === 0) {
            elScaleResult.style.display = 'none';
            return;
        }

        var html = '';
        for (var i = 0; i < ingredients.length; i++) {
            var ing = ingredients[i];
            if (!ing.name) continue;

            var newAmount;
            if (ing.unit === 'taste' || ing.unit === 'pinch') {
                // «по вкусу» и «щепотка» не масштабируются арифметически
                newAmount = ing.amount;
            } else if (ing.unit === 'pcs') {
                // штуки — округляем до целого вверх, если коэффициент > 1
                newAmount = Math.max(1, Math.round(ing.amount * factor));
            } else {
                newAmount = ing.amount * factor;
            }

            html += '<div class="rc-scaled-item">'
                + '<span class="rc-scaled-name">' + escAttr(ing.name) + '</span>'
                + '<span class="rc-scaled-amount">' + formatNum(newAmount) + '</span>'
                + '<span class="rc-scaled-unit">' + scaleUnitName(ing.unit) + '</span>'
                + '</div>';
        }

        elScaleResultList.innerHTML = html;
        elScaleResult.style.display = 'block';
    }

    function initScaler() {
        var html = '';
        for (var i = 0; i < DEFAULT_SCALE_INGREDIENTS.length; i++) {
            html += ingredientRowHTML(DEFAULT_SCALE_INGREDIENTS[i], i);
        }
        elScaleIngredients.innerHTML = html;
        bindScaleRowEvents();
        doScale();
    }

    /* ================================================================
     *  TAB 3: REFERENCE TABLE
     * ================================================================ */

    function renderRefTable(filter) {
        filter = (filter || '').toLowerCase().trim();
        var html = '';
        for (var i = 0; i < INGREDIENTS.length; i++) {
            var ing = INGREDIENTS[i];
            if (filter && ing.name.toLowerCase().indexOf(filter) === -1) continue;
            html += '<tr>'
                + '<td class="td-name">' + ing.name + '</td>'
                + '<td class="td-val">' + ing.cup + ' г</td>'
                + '<td class="td-val">' + ing.tbsp + ' г</td>'
                + '<td class="td-val">' + ing.tsp + ' г</td>'
                + '</tr>';
        }
        elRefTable.innerHTML = html || '<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-dim);">Ничего не найдено</td></tr>';
    }

    /* ================================================================
     *  INIT
     * ================================================================ */

    function init() {
        // Tab 1
        populateUnits();
        populateIngredients();
        populatePresets();
        convert();

        // Tab 2
        initScaler();

        // Tab 3
        renderRefTable('');

        // Event listeners — Tab switching
        var tabs = document.querySelectorAll('.rc-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', function () {
                switchTab(this.getAttribute('data-tab'));
            });
        }

        // Event listeners — Converter
        elConvFromVal.addEventListener('input', convert);
        elConvFromUnit.addEventListener('change', convert);
        elConvToUnit.addEventListener('change', convert);
        elConvIngredient.addEventListener('change', convert);

        elConvPresets.addEventListener('click', function (e) {
            var btn = e.target.closest('.rc-preset');
            if (!btn) return;
            applyPreset(
                btn.getAttribute('data-from'),
                btn.getAttribute('data-from-u'),
                btn.getAttribute('data-to-u'),
                btn.getAttribute('data-ingr')
            );
        });

        // Event listeners — Temperature
        elTempVal.addEventListener('input', convertTemp);
        elTempFrom.addEventListener('change', convertTemp);
        convertTemp();

        document.querySelectorAll('.temp-preset').forEach(function (btn) {
            btn.addEventListener('click', function () {
                elTempVal.value = this.getAttribute('data-c');
                elTempFrom.value = 'C';
                convertTemp();
            });
        });

        // Event listeners — Scaler
        elScaleApply.addEventListener('click', doScale);
        elScaleFromPortions.addEventListener('input', doScale);
        elScaleToPortions.addEventListener('input', doScale);
        elScaleAddRow.addEventListener('click', function () {
            addIngredientRow('', 1, 'g');
        });

        // Event listeners — Reference search
        elRefSearch.addEventListener('input', function () {
            renderRefTable(this.value);
        });

        // Hamburger menu
        var hamburger = document.querySelector('.hamburger');
        var headerNav = document.querySelector('.header-nav');
        if (hamburger && headerNav) {
            hamburger.addEventListener('click', function () {
                headerNav.classList.toggle('open');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
