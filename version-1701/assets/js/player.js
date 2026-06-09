function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var hls = null;

    function bind() {
        if (!video || video.getAttribute("data-ready") === "true") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(options.source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    video.src = options.source;
                }
            });
        } else {
            video.src = options.source;
        }
        video.setAttribute("data-ready", "true");
    }

    function play() {
        bind();
        if (button) {
            button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }
    }

    if (!video) {
        return;
    }

    if (button) {
        button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });

    video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
            button.classList.remove("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
