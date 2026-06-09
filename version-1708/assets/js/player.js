(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function loadLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-library]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            existing.addEventListener('error', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-library', 'true');
        script.addEventListener('load', callback, { once: true });
        script.addEventListener('error', callback, { once: true });
        document.head.appendChild(script);
    }

    function setupPlayer(box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.play-cover');
        var status = box.querySelector('.player-status');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src');
        var started = false;
        function setStatus(text) {
            if (status) {
                status.textContent = text || '';
            }
        }
        function attachAndPlay() {
            if (!source) {
                return;
            }
            if (cover) {
                cover.classList.add('hidden');
            }
            setStatus('正在加载播放源');
            var playNow = function () {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        setStatus('点击视频区域继续播放');
                    });
                }
            };
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.src = source;
                }
                playNow();
                return;
            }
            loadLibrary(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    if (!video._hlsObject) {
                        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        video._hlsObject = hls;
                    }
                    playNow();
                } else {
                    if (!video.getAttribute('src')) {
                        video.src = source;
                    }
                    playNow();
                }
            });
        }
        function start() {
            started = true;
            attachAndPlay();
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!started || video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        video.addEventListener('playing', function () {
            setStatus('');
        });
        video.addEventListener('error', function () {
            setStatus('播放源加载异常，请稍后重试');
        });
    }

    ready(function () {
        document.querySelectorAll('[data-player]').forEach(setupPlayer);
    });
})();
