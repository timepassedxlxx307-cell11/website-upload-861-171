(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero-slider]');
  if (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  qsa('[data-filter-form]').forEach(function (form) {
    var input = qs('[data-filter-input]', form);
    var genre = qs('[data-filter-genre]', form);
    var region = qs('[data-filter-region]', form);
    var year = qs('[data-filter-year]', form);
    var targetSelector = form.getAttribute('data-filter-target') || '[data-card]';
    var cards = qsa(targetSelector);
    var empty = qs('[data-empty-state]');

    function value(el) {
      return el ? el.value.trim().toLowerCase() : '';
    }

    function match(card) {
      var q = value(input);
      var g = value(genre);
      var r = value(region);
      var y = value(year);
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-category') || ''
      ].join(' ').toLowerCase();
      if (q && text.indexOf(q) === -1) return false;
      if (g && (card.getAttribute('data-genre') || '').toLowerCase().indexOf(g) === -1 && (card.getAttribute('data-tags') || '').toLowerCase().indexOf(g) === -1) return false;
      if (r && (card.getAttribute('data-region') || '').toLowerCase().indexOf(r) === -1) return false;
      if (y && (card.getAttribute('data-year') || '').toLowerCase().indexOf(y) === -1) return false;
      return true;
    }

    function run() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, genre, region, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', run);
        el.addEventListener('change', run);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      run();
    });

    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    run();
  });
})();
