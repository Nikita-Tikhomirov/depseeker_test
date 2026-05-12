/**
 * Цифра — Main JavaScript
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

    // ==================== PROMO CODE ====================
    var promoForm = document.getElementById('promo-form');
    if (promoForm) {
        var promoInput = document.getElementById('promo-input');
        var promoApplied = document.getElementById('promo-applied');
        var promoCodeText = document.getElementById('promo-code-text');
        var promoRemove = document.getElementById('promo-remove');
        var subtotalEl = document.getElementById('summary-subtotal');
        var discountRow = document.getElementById('summary-discount-row');
        var discountEl = document.getElementById('summary-discount');
        var totalEl = document.getElementById('summary-total');

        // Valid promo codes and their discount percentages
        var promoCodes = {
            'NEW2026': 15,
            'SALE10': 10,
            'WELCOME': 20
        };

        var currentPromo = null;

        function formatPrice(n) {
            return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
        }

        function updateSummary() {
            var subtotal = parseInt(subtotalEl.getAttribute('data-subtotal'), 10);
            var discount = 0;
            if (currentPromo) {
                discount = Math.round(subtotal * promoCodes[currentPromo] / 100);
            }
            var total = subtotal - discount;

            if (discount > 0) {
                discountRow.style.display = '';
                discountEl.textContent = '−' + formatPrice(discount).replace(' ₽', '') + ' ₽';
            } else {
                discountRow.style.display = 'none';
            }
            totalEl.textContent = formatPrice(total);
        }

        function applyPromo(code) {
            currentPromo = code;
            promoCodeText.textContent = 'Промокод ' + code + ' (−' + promoCodes[code] + '%)';
            promoApplied.style.display = '';
            promoInput.value = '';
            promoInput.disabled = true;
            updateSummary();
        }

        function removePromo() {
            currentPromo = null;
            promoApplied.style.display = 'none';
            promoInput.disabled = false;
            promoInput.value = '';
            promoInput.focus();
            updateSummary();
        }

        promoForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var code = promoInput.value.trim().toUpperCase();
            if (promoCodes[code]) {
                applyPromo(code);
            } else {
                promoInput.style.borderColor = '#f87171';
                setTimeout(function () {
                    promoInput.style.borderColor = '';
                }, 1500);
            }
        });

        promoRemove.addEventListener('click', removePromo);
    }

    // ==================== FAQ ACCORDION ====================
    var faqButtons = document.querySelectorAll('.faq-q');
    for (var j = 0; j < faqButtons.length; j++) {
        faqButtons[j].addEventListener('click', function () {
            var parent = this.parentElement;
            var expanded = parent.classList.contains('open');
            parent.classList.toggle('open');
            this.setAttribute('aria-expanded', String(!expanded));
        });
    }

    // ==================== ACCOUNT TAB SWITCHING ====================
    var sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {

        /**
         * Switch to a tab by name.
         * @param {string} tabName - e.g. 'dashboard', 'purchases', etc.
         */
        function switchTab(tabName) {
            // Deactivate all panels
            var panels = document.querySelectorAll('.tab-panel');
            for (var k = 0; k < panels.length; k++) {
                panels[k].classList.remove('active');
            }

            // Deactivate all nav links
            var navLinks = sidebarNav.querySelectorAll('a[data-tab]');
            for (var m = 0; m < navLinks.length; m++) {
                navLinks[m].classList.remove('active');
                navLinks[m].setAttribute('aria-selected', 'false');
            }

            // Activate target panel
            var targetPanel = document.getElementById('tab-' + tabName);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // Activate corresponding nav link
            var activeLink = sidebarNav.querySelector('a[data-tab="' + tabName + '"]');
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.setAttribute('aria-selected', 'true');
            }

            // Update URL hash
            if (history.pushState) {
                history.pushState(null, null, '#' + tabName);
            }
        }

        // Handle sidebar nav clicks
        sidebarNav.addEventListener('click', function (e) {
            var link = e.target.closest('a[data-tab]');
            if (!link) return;
            e.preventDefault();
            var tabName = link.getAttribute('data-tab');
            switchTab(tabName);
        });

        // Handle quick-action and cross-tab links (data-tab-link)
        document.addEventListener('click', function (e) {
            var link = e.target.closest('[data-tab-link]');
            if (!link) return;
            e.preventDefault();
            var tabName = link.getAttribute('data-tab-link');
            switchTab(tabName);
        });

        // Restore tab from URL hash on page load
        var hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById('tab-' + hash)) {
            switchTab(hash);
        }
    }
})();
