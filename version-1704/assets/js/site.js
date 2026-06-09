(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var show = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    var reset = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        reset();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        reset();
      });
    });

    start();
  }

  var forms = document.querySelectorAll('[data-site-search-form]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }

      event.preventDefault();
      window.location.href = './movies.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var textInput = filterRoot.querySelector('[data-filter-text]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var categorySelect = filterRoot.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (textInput && initialQuery) {
      textInput.value = initialQuery;
    }

    var apply = function () {
      var keyword = textInput ? textInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        var matchedCategory = !category || card.getAttribute('data-category') === category;
        card.hidden = !(matchedKeyword && matchedYear && matchedCategory);
      });
    };

    [textInput, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }
})();
