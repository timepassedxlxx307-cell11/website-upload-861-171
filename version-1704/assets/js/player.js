(function () {
  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.play-cover');
    var stream = player.getAttribute('data-stream');
    var hls = null;

    if (!video || !cover || !stream) {
      return;
    }

    var load = function () {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    };

    var play = function () {
      load();
      cover.classList.add('is-hidden');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
