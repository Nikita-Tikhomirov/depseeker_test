/**
 * DigiMarket — Main JavaScript
 * Scroll reveal animations + FAQ accordion
 */
(function () {
    'use strict';

    // ==================== SCROLL REVEAL ====================
    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    var revealEls = document.querySelectorAll('.reveal');
    for (var i = 0; i < revealEls.length; i++) {
        observer.observe(revealEls[i]);
    }

    // ==================== MOBILE MENU ====================
    var hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function () {
            var nav = document.querySelector('.header-nav');
            if (nav) nav.classList.toggle('open');
        });
    }

    // ==================== FAQ ACCORDION ====================
    var faqButtons = document.querySelectorAll('.faq-q');
    for (var j = 0; j < faqButtons.length; j++) {
        faqButtons[j].addEventListener('click', function () {
            var parent = this.parentElement;
            var expanded = parent.classList.contains('open');
            this.setAttribute('aria-expanded', String(!expanded));
        });
    }
})();
