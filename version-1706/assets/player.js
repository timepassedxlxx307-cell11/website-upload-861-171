(function () {
  function start() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }

    var video = document.getElementById("movie-video");
    var cover = document.getElementById("player-cover");
    var button = document.getElementById("player-button");
    var address = shell.getAttribute("data-play");
    var attached = false;
    var hls = null;

    function attach() {
      if (attached || !video || !address) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = address;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(address);
        hls.attachMedia(video);
      } else {
        video.src = address;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  if (document.readyState !== "loading") {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start);
  }
})();
