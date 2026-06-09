(function () {
  function rootPrefix() {
    return document.body.getAttribute("data-root") || "./";
  }

  function openMenu() {
    var nav = document.querySelector("[data-main-nav]");
    if (nav) {
      nav.classList.toggle("open");
    }
  }

  var menu = document.querySelector("[data-menu-toggle]");
  if (menu) {
    menu.addEventListener("click", openMenu);
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  function renderResults(input, box) {
    var keyword = input.value.trim().toLowerCase();
    if (!keyword || !window.MOVIES_INDEX) {
      box.classList.remove("active");
      box.innerHTML = "";
      return;
    }
    var root = rootPrefix();
    var results = window.MOVIES_INDEX.filter(function (item) {
      return item.q.indexOf(keyword) !== -1;
    }).slice(0, 10);
    if (!results.length) {
      box.innerHTML = '<div class="empty-result">没有找到相关影片</div>';
      box.classList.add("active");
      return;
    }
    box.innerHTML = results.map(function (item) {
      return '<a href="' + root + item.url + '"><img src="' + root + item.img + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong>' + item.title + '</strong><em>' + item.meta + '</em></span></a>';
    }).join("");
    box.classList.add("active");
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-global-search]")).forEach(function (form) {
    var input = form.querySelector("[data-search-input]");
    var box = form.querySelector("[data-search-results]");
    if (!input || !box) return;
    input.addEventListener("input", function () {
      renderResults(input, box);
    });
    input.addEventListener("focus", function () {
      renderResults(input, box);
    });
    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        box.classList.remove("active");
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]")).forEach(function (input) {
    var target = document.querySelector(input.getAttribute("data-target"));
    if (!target) return;
    var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("hidden", keyword && text.indexOf(keyword) === -1);
      });
    });
  });
})();
