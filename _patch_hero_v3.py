import re, os

base = r'C:\Users\user\Desktop\depseeker_test'

widgets_html = '''<!-- ==================== FLOATING SETTINGS WIDGET ==================== -->
<aside class="settings-widget" id="settings-widget" aria-label="Настройки оформления">
    <button class="settings-trigger" id="settings-trigger" aria-label="Открыть настройки" title="Настройки">
        <span class="settings-icon">⚙️</span>
    </button>
    <div class="settings-panel" id="settings-panel">
        <span class="settings-label">Цветовая схема</span>
        <div class="theme-switch" role="radiogroup" aria-label="Цветовая схема">
            <button class="theme-dot indigo active" data-theme="indigo" role="radio" aria-checked="true" aria-label="Индиго" title="Индиго"></button>
            <button class="theme-dot amber" data-theme="amber" role="radio" aria-checked="false" aria-label="Янтарь" title="Янтарь"></button>
            <button class="theme-dot emerald" data-theme="emerald" role="radio" aria-checked="false" aria-label="Изумруд" title="Изумруд"></button>
        </div>
        <span class="settings-label">Тема</span>
        <button class="mode-toggle" id="mode-toggle" aria-label="Переключить светлую/тёмную тему" title="Светлая / Тёмная тема">☀️</button>
    </div>
</aside>

<!-- ==================== SCROLL TO TOP ==================== -->
<button class="scroll-top" id="scroll-top" aria-label="Наверх" title="Наверх">
    <span class="scroll-top-icon">🚀</span>
    <span class="scroll-top-ring"></span>
</button>
'''

new_js = '''<!-- ==================== THEME SWITCHING JS ==================== -->
<script>
(function() {
    'use strict';
    var THEME_KEY = 'zifra-theme';
    var MODE_KEY  = 'zifra-mode';
    var DEFAULT_THEME = 'indigo';
    var DEFAULT_MODE  = 'dark';
    var html = document.documentElement;

    function applyTheme(name) {
        html.setAttribute('data-theme', name);
        localStorage.setItem(THEME_KEY, name);
        var dots = document.querySelectorAll('.theme-dot');
        for (var i = 0; i < dots.length; i++) {
            var d = dots[i];
            var match = d.getAttribute('data-theme') === name;
            d.classList.toggle('active', match);
            d.setAttribute('aria-checked', match ? 'true' : 'false');
        }
    }

    function applyMode(mode) {
        html.setAttribute('data-mode', mode);
        localStorage.setItem(MODE_KEY, mode);
        var btn = document.getElementById('mode-toggle');
        if (btn) {
            btn.innerHTML = mode === 'light' ? '\U0001f319' : '\u2600\ufe0f';
            btn.title = mode === 'light' ? 'Тёмная тема' : 'Светлая тема';
            btn.setAttribute('aria-label',
                mode === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему');
        }
    }

    function toggleMode() {
        var current = html.getAttribute('data-mode') || DEFAULT_MODE;
        applyMode(current === 'light' ? 'dark' : 'light');
    }

    var widget = document.getElementById('settings-widget');
    var trigger = document.getElementById('settings-trigger');
    if (widget && trigger) {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            widget.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (widget.classList.contains('open') && !widget.contains(e.target)) {
                widget.classList.remove('open');
            }
        });
    }

    var scrollBtn = document.getElementById('scroll-top');
    var scrollThreshold = 400;

    function updateScrollTopVisibility() {
        if (!scrollBtn) return;
        if (window.scrollY > scrollThreshold) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }

    if (scrollBtn) {
        window.addEventListener('scroll', updateScrollTopVisibility, { passive: true });
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        updateScrollTopVisibility();
    }

    applyTheme(localStorage.getItem(THEME_KEY) || DEFAULT_THEME);
    applyMode(localStorage.getItem(MODE_KEY) || DEFAULT_MODE);

    document.addEventListener('click', function(e) {
        var dot = e.target.closest('.theme-dot');
        if (dot) {
            var theme = dot.getAttribute('data-theme');
            if (theme) applyTheme(theme);
            return;
        }
        if (e.target.closest('#mode-toggle')) {
            toggleMode();
        }
    });
})();
</script>
'''

files = ['hero-v1.html', 'hero-v2.html', 'hero-v3.html', 'hero-v4.html']

for fname in files:
    path = os.path.join(base, fname)
    with open(path, 'r', encoding='utf-8', errors='surrogateescape') as f:
        text = f.read()
    
    original = text
    
    # 1. Remove demo-header style block + header
    text = re.sub(
        r'<!-- =+ MINI HEADER WITH THEME CONTROLS =+ -->\s*<style>\s*\.demo-header\s*\{.*?</style>\s*<header class="demo-header">.*?</header>',
        '',
        text,
        flags=re.DOTALL
    )
    
    # 2. Remove old theme JS
    text = re.sub(
        r'<!-- =+ THEME SWITCHING JS =+ -->\s*<script>.*?</script>',
        '',
        text,
        flags=re.DOTALL
    )
    
    # 3. Insert widgets + new JS before </body>
    text = text.replace('</body>', '\n' + widgets_html + '\n' + new_js + '\n</body>')
    
    # Clean up extra blank lines (no more than 2 consecutive)
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    
    if text != original:
        # Write as bytes to avoid surrogate issues
        with open(path, 'wb') as f:
            f.write(text.encode('utf-8', errors='surrogateescape'))
        print(f'{fname}: UPDATED')
    else:
        print(f'{fname}: NO CHANGES')

print('Done')
