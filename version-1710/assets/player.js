(function () {
  window.initializePlayer = function (url) {
    var video = document.getElementById("movie-player");
    var layer = document.getElementById("play-layer");
    var loaded = false;
    var hls = null;

    if (!video || !url) {
      return;
    }

    function attachMedia() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 90,
          enableWorker: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function playVideo() {
      attachMedia();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
        hls = null;
      }
      loaded = false;
    });
  };
}());
