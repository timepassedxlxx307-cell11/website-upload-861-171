(function () {
  var header = document.querySelector("[data-header]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function onScroll() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var homeForm = document.querySelector("[data-home-search-form]");
  if (homeForm) {
    homeForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = homeForm.querySelector("[data-home-search]");
      var value = input ? input.value.trim() : "";
      var target = "search.html";
      if (value) {
        target += "?q=" + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  }

  var filterRoot = document.querySelector("[data-filter-root]");
  if (filterRoot) {
    var searchInput = filterRoot.querySelector("[data-filter-search]");
    var genreSelect = filterRoot.querySelector("[data-filter-genre]");
    var regionSelect = filterRoot.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-filter-card]"));
    var emptyState = filterRoot.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value.trim() : "");
      var genre = normalize(genreSelect ? genreSelect.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardGenre = normalize(card.getAttribute("data-genre"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var matched = (!query || text.indexOf(query) !== -1) && (!genre || cardGenre.indexOf(genre) !== -1) && (!region || cardRegion.indexOf(region) !== -1);
        card.classList.toggle("hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    [searchInput, genreSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
}());
