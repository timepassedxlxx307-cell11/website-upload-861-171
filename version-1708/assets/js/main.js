(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
                var active = slides[current];
                var image = active ? active.getAttribute('data-bg') : '';
                if (image) {
                    hero.closest('.hero').style.setProperty('--hero-bg', 'url("' + image + '")');
                }
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                });
            });
            if (slides.length > 0) {
                show(0);
                window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        }

        var searchForms = document.querySelectorAll('[data-site-search]');
        searchForms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = form.getAttribute('data-target') || 'category-all.html';
                window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
            });
        });

        var filterInput = document.querySelector('[data-filter-input]');
        var filterSelect = document.querySelector('[data-filter-select]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (filterInput && initialQuery) {
            filterInput.value = initialQuery;
        }
        function normalize(value) {
            return (value || '').toString().toLowerCase();
        }
        function applyFilter() {
            var keyword = normalize(filterInput ? filterInput.value : '').trim();
            var year = filterSelect ? filterSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-desc'));
                var cardYear = card.getAttribute('data-year') || '';
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = !year || cardYear === year;
                var showCard = okKeyword && okYear;
                card.style.display = showCard ? '' : 'none';
                if (showCard) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible === 0 ? 'block' : 'none';
            }
        }
        if (filterInput || filterSelect) {
            if (filterInput) {
                filterInput.addEventListener('input', applyFilter);
            }
            if (filterSelect) {
                filterSelect.addEventListener('change', applyFilter);
            }
            applyFilter();
        }
    });
})();
