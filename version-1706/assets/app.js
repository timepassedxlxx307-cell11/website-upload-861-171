(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function move(step) {
        show(index + step);
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          move(1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          move(-1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          move(1);
          restart();
        });
      }

      show(0);
      restart();
    });

    document.querySelectorAll(".browse-section").forEach(function (section) {
      var input = section.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-movie-card]"));
      var chips = Array.prototype.slice.call(section.querySelectorAll("[data-filter-value]"));
      var empty = section.querySelector(".empty-state");
      var activeFilter = "all";

      function apply() {
        var query = input ? text(input.value) : "";
        var visible = 0;

        cards.forEach(function (card) {
          var hay = text(card.getAttribute("data-search"));
          var type = text(card.getAttribute("data-type"));
          var genre = text(card.getAttribute("data-genre"));
          var passText = !query || hay.indexOf(query) !== -1;
          var filter = text(activeFilter);
          var passFilter = filter === "all" || type.indexOf(filter) !== -1 || genre.indexOf(filter) !== -1;
          var show = passText && passFilter;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });

      apply();
    });
  });
})();
