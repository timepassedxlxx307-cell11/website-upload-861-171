(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-nav-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function initFilterLists() {
        var input = document.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }
        var items = Array.prototype.slice.call(list.querySelectorAll("[data-filter-item]"));
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "没有找到匹配的影片";

        function filter() {
            var query = normalize(input.value);
            var visible = 0;
            items.forEach(function (item) {
                var text = normalize((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || "") + " " + item.textContent);
                var matched = !query || text.indexOf(query) !== -1;
                item.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (!visible && !empty.parentNode) {
                list.appendChild(empty);
            }
            if (visible && empty.parentNode) {
                empty.parentNode.removeChild(empty);
            }
        }

        input.addEventListener("input", filter);
    }

    function movieCard(movie) {
        var tags = (movie.tags || "").split(/[,，/、\s]+/).filter(Boolean).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a href=\"" + escapeHtml(movie.href) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
            "<div class=\"card-poster\"><img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"card-type\">" + escapeHtml(movie.type) + "</span></div>" +
            "<div class=\"card-body\"><h3>" + escapeHtml(movie.title) + "</h3>" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.rating) + "</span></div>" +
            "<p class=\"card-desc\">" + escapeHtml(movie.description) + "</p><div class=\"card-tags\">" + tags + "</div></div>" +
            "</a></article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initSearch() {
        var input = document.querySelector("[data-search-input]");
        var button = document.querySelector("[data-search-submit]");
        var results = document.querySelector("[data-search-results]");
        var heading = document.querySelector("[data-search-heading]");
        var subtitle = document.querySelector("[data-search-subtitle]");
        if (!input || !results || !window.SEARCH_INDEX) {
            return;
        }

        function run() {
            var query = normalize(input.value);
            var matches = window.SEARCH_INDEX.filter(function (movie) {
                var text = normalize(movie.title + " " + movie.genre + " " + movie.tags + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.description);
                return !query || text.indexOf(query) !== -1;
            }).slice(0, 96);
            if (heading) {
                heading.textContent = query ? "搜索结果" : "热门推荐";
            }
            if (subtitle) {
                subtitle.textContent = matches.length ? "点击影片卡片进入详情页观看" : "没有找到匹配的影片";
            }
            results.innerHTML = matches.length ? matches.map(movieCard).join("") : "<div class=\"empty-state\">没有找到匹配的影片</div>";
        }

        input.addEventListener("input", run);
        if (button) {
            button.addEventListener("click", run);
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initFilterLists();
        initSearch();
    });
})();
