(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector("[data-hls-player]");
        var shell = document.querySelector("[data-player-shell]");
        var button = document.querySelector("[data-play-button]");
        if (!video) {
            return;
        }

        var source = video.getAttribute("data-src");
        var hls = null;
        var initialized = false;

        function bindSource() {
            if (initialized || !source) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
            }
            initialized = true;
        }

        function hideButton() {
            if (button) {
                button.classList.add("hidden");
            }
        }

        function startPlayer() {
            bindSource();
            hideButton();
            video.controls = true;
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayer();
            });
        }

        if (shell) {
            shell.addEventListener("click", function (event) {
                if (event.target === shell) {
                    startPlayer();
                }
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayer();
            }
        });

        video.addEventListener("play", hideButton);
        video.addEventListener("loadedmetadata", function () {
            video.controls = true;
        });
    });
})();
