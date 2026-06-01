/**
 * Цифра — shared UI behavior.
 * Keeps production pages focused on navigation and lightweight reveal effects.
 */
(function () {
    'use strict';

    var nav = document.querySelector('.header-nav');
    var hamburger = document.querySelector('.hamburger');

    if (hamburger && nav) {
        hamburger.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        nav.addEventListener('click', function (event) {
            if (event.target.closest('a')) {
                nav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

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
})();
