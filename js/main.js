/**
 * Цифра — shared UI behavior.
 * Keeps production pages focused on navigation and lightweight reveal effects.
 */
(function () {
    'use strict';

    var nav = document.querySelector('.header-nav');
    var hamburger = document.querySelector('.hamburger');
    var dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

    function isProductionConfig(config) {
        return config && String(config.mode || '').toLowerCase() === 'production';
    }

    function injectYandexMetrika(counterId) {
        if (!/^\d+$/.test(String(counterId || ''))) return;
        if (window.ym) return;

        window.ym = window.ym || function () {
            (window.ym.a = window.ym.a || []).push(arguments);
        };
        window.ym.l = 1 * new Date();

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://mc.yandex.ru/metrika/tag.js';
        var firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);

        window.ym(Number(counterId), 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: false
        });
    }

    function applySiteConfig(config) {
        if (!isProductionConfig(config)) return;

        if (config.adsEnabled === true) {
            document.body.classList.add('ads-enabled');
        }

        if (config.yandexMetrikaId) {
            injectYandexMetrika(config.yandexMetrikaId);
        }
    }

    function requestSiteConfig(onSuccess) {
        if (window.fetch) {
            window.fetch('site.config.json', { cache: 'no-store' })
                .then(function (response) {
                    if (!response.ok) throw new Error('site config unavailable');
                    return response.json();
                })
                .then(onSuccess)
                .catch(function () {
                    // Keep local/static preview silent when config is unavailable.
                });
            return;
        }

        if (!window.XMLHttpRequest) return;
        var request = new XMLHttpRequest();
        request.open('GET', 'site.config.json', true);
        request.onreadystatechange = function () {
            if (request.readyState !== 4 || request.status !== 200) return;
            try {
                onSuccess(JSON.parse(request.responseText));
            } catch (error) {
                // Keep local/static preview silent when config is invalid.
            }
        };
        request.send();
    }

    function loadSiteConfig() {
        requestSiteConfig(applySiteConfig);
    }

    function closeDropdowns(exceptDropdown) {
        document.querySelectorAll('.nav-dropdown.open').forEach(function (dropdown) {
            if (dropdown === exceptDropdown) return;
            dropdown.classList.remove('open');
            var button = dropdown.querySelector('.nav-dropdown-toggle');
            if (button) button.setAttribute('aria-expanded', 'false');
        });
    }

    dropdownToggles.forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            var dropdown = button.closest('.nav-dropdown');
            if (!dropdown) return;
            var isOpen = !dropdown.classList.contains('open');
            closeDropdowns(dropdown);
            dropdown.classList.toggle('open', isOpen);
            button.setAttribute('aria-expanded', String(isOpen));
        });
    });

    if (hamburger && nav) {
        hamburger.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', String(isOpen));
            if (!isOpen) closeDropdowns();
        });

        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) {
                nav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                closeDropdowns();
            }
        });
    }

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.nav-dropdown')) closeDropdowns();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeDropdowns();
    });

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll('.reveal').forEach(function (element) {
            observer.observe(element);
        });
    }

    loadSiteConfig();
})();
