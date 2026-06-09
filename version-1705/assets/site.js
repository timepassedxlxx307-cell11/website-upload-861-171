(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(
      root.querySelectorAll("[data-hero-slide]"),
    );
    var dots = Array.prototype.slice.call(
      root.querySelectorAll("[data-hero-dot]"),
    );
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var value = Number(dot.getAttribute("data-hero-dot"));
        show(value);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter-panel]"),
    );
    panels.forEach(function (panel) {
      var container = panel.parentElement;
      var input = panel.querySelector("[data-search-input]");
      var chips = Array.prototype.slice.call(
        panel.querySelectorAll("[data-filter]"),
      );
      var grid = container ? container.querySelector("[data-grid]") : null;
      var empty = container
        ? container.querySelector("[data-no-results]")
        : null;
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(
        grid.querySelectorAll("[data-card]"),
      );
      var currentFilter = "";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var shown = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.textContent,
          ]
            .join(" ")
            .toLowerCase();
          var matchText = !query || text.indexOf(query) !== -1;
          var matchFilter =
            !currentFilter || text.indexOf(currentFilter.toLowerCase()) !== -1;
          var visible = matchText && matchFilter;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          currentFilter = chip.getAttribute("data-filter") || "";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });
      if (chips[0]) {
        chips[0].classList.add("active");
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector("[data-player-cover]");
  var button = document.querySelector("[data-play-button]");
  var hlsInstance = null;
  var started = false;

  if (!video || !streamUrl) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      return;
    }

    video.src = streamUrl;
    playVideo();
  }

  function playVideo() {
    if (cover) {
      cover.classList.add("hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function start(event) {
    if (event) {
      event.preventDefault();
    }
    attach();
    playVideo();
  }

  if (cover) {
    cover.addEventListener("click", start);
  }
  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (!started || video.paused) {
      start();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
