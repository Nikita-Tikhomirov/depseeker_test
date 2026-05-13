import re, os

base = rb'C:\Users\user\Desktop\depseeker_test'

# Widgets HTML to insert
widgets = b'''\x0d\x0a<!-- ==================== FLOATING SETTINGS WIDGET ==================== -->
<aside class="settings-widget" id="settings-widget" aria-label="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043e\u0444\u043e\u0440\u043c\u043b\u0435\u043d\u0438\u044f">
    <button class="settings-trigger" id="settings-trigger" aria-label="\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438" title="\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438">
        <span class="settings-icon">\xe2\x9a\x99\xef\xb8\x8f</span>
    </button>
    <div class="settings-panel" id="settings-panel">
        <span class="settings-label">\u0426\u0432\u0435\u0442\u043e\u0432\u0430\u044f \u0441\u0445\u0435\u043c\u0430</span>
        <div class="theme-switch" role="radiogroup" aria-label="\u0426\u0432\u0435\u0442\u043e\u0432\u0430\u044f \u0441\u0445\u0435\u043c\u0430">
            <button class="theme-dot indigo active" data-theme="indigo" role="radio" aria-checked="true" aria-label="\u0418\u043d\u0434\u0438\u0433\u043e" title="\u0418\u043d\u0434\u0438\u0433\u043e"></button>
            <button class="theme-dot amber" data-theme="amber" role="radio" aria-checked="false" aria-label="\u042f\u043d\u0442\u0430\u0440\u044c" title="\u042f\u043d\u0442\u0430\u0440\u044c"></button>
            <button class="theme-dot emerald" data-theme="emerald" role="radio" aria-checked="false" aria-label="\u0418\u0437\u0443\u043c\u0440\u0443\u0434" title="\u0418\u0437\u0443\u043c\u0440\u0443\u0434"></button>
        </div>
        <span class="settings-label">\u0422\u0435\u043c\u0430</span>
        <button class="mode-toggle" id="mode-toggle" aria-label="\u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u0441\u0432\u0435\u0442\u043b\u0443\u044e/\u0442\u0451\u043c\u043d\u0443\u044e \u0442\u0435\u043c\u0443" title="\u0421\u0432\u0435\u0442\u043b\u0430\u044f / \u0422\u0451\u043c\u043d\u0430\u044f \u0442\u0435\u043c\u0430">\xe2\x98\x80\xef\xb8\x8f</button>
    </div>
</aside>

<!-- ==================== SCROLL TO TOP ==================== -->
<button class="scroll-top" id="scroll-top" aria-label="\u041d\u0430\u0432\u0435\u0440\u0445" title="\u041d\u0430\u0432\u0435\u0440\u0445">
    <span class="scroll-top-icon">\xf0\x9f\x9a\x80</span>
    <span class="scroll-top-ring"></span>
</button>
'''

# New theme JS
new_js = b'''\x0d\x0a<!-- ==================== THEME SWITCHING JS ==================== -->
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
            btn.innerHTML = mode === 'light' ? '\xf0\x9f\x8c\x99' : '\xe2\x98\x80\xef\xb8\x8f';
            btn.title = mode === 'light' ? '\xd0\xa2\xd1\x91\xd0\xbc\xd0\xbd\xd0\xb0\xd1\x8f \xd1\x82\xd0\xb5\xd0\xbc\xd0\xb0' : '\xd0\xa1\xd0\xb2\xd0\xb5\xd1\x82\xd0\xbb\xd0\xb0\xd1\x8f \xd1\x82\xd0\xb5\xd0\xbc\xd0\xb0';
            btn.setAttribute('aria-label',
                mode === 'light' ? '\xd0\x9f\xd0\xb5\xd1\x80\xd0\xb5\xd0\xba\xd0\xbb\xd1\x8e\xd1\x87\xd0\xb8\xd1\x82\xd1\x8c \xd0\xbd\xd0\xb0 \xd1\x82\xd1\x91\xd0\xbc\xd0\xbd\xd1\x83\xd1\x8e \xd1\x82\xd0\xb5\xd0\xbc\xd1\x83' : '\xd0\x9f\xd0\xb5\xd1\x80\xd0\xb5\xd0\xba\xd0\xbb\xd1\x8e\xd1\x87\xd0\xb8\xd1\x82\xd1\x8c \xd0\xbd\xd0\xb0 \xd1\x81\xd0\xb2\xd0\xb5\xd1\x82\xd0\xbb\xd1\x83\xd1\x8e \xd1\x82\xd0\xb5\xd0\xbc\xd1\x83');
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

files = [b'hero-v1.html', b'hero-v2.html', b'hero-v3.html', b'hero-v4.html']

for fname in files:
    path = os.path.join(base, fname)
    with open(path, 'rb') as f:
        content = f.read()

    original = content

    # 1. Remove demo-header style block (from <!-- ====== MINI HEADER  to </style>)
    # Pattern: <!-- ====== MINI HEADER ... -->\r\n<style>\r\n    .demo-header { ... }</style>
    content = re.sub(
        rb'<!-- =+ MINI HEADER WITH THEME CONTROLS =+ -->\s*<style>\s*\.demo-header\s*\{.*?</style>',
        b'',
        content,
        flags=re.DOTALL
    )

    # 2. Remove demo-header <header> block
    content = re.sub(
        rb'<header class="demo-header">.*?</header>',
        b'',
        content,
        flags=re.DOTALL
    )

    # 3. Remove old theme JS
    content = re.sub(
        rb'<!-- =+ THEME SWITCHING JS =+ -->\s*<script>.*?</script>',
        b'',
        content,
        flags=re.DOTALL
    )

    # 4. Insert widgets + new JS before </body>
    content = content.replace(b'</body>', widgets + new_js + b'\x0d\x0a</body>')

    if content != original:
        with open(path, 'wb') as f:
            f.write(content)
        print(f'{fname.decode()}: UPDATED')
    else:
        print(f'{fname.decode()}: NO CHANGES')

print('Done')
