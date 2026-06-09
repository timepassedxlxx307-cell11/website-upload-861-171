(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + tag + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-wrap\" href=\"" + movie.href + "\" aria-label=\"" + movie.title + " 在线观看\">",
            "<img src=\"./" + movie.cover + "\" alt=\"" + movie.title + "\" loading=\"lazy\">",
            "<span class=\"quality-badge\">高清</span>",
            "<span class=\"poster-play\">▶</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<h3><a href=\"" + movie.href + "\">" + movie.title + "</a></h3>",
            "<p class=\"movie-meta\">" + movie.year + " · " + movie.region + " · " + movie.type + "</p>",
            "<p class=\"movie-desc\">" + movie.oneLine + "</p>",
            "<div class=\"tag-list\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
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

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-card-filter]").forEach(function (input) {
            var scope = input.closest(".filter-scope") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            input.addEventListener("input", function () {
                var keyword = normalize(input.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search") || card.textContent);
                    card.style.display = !keyword || text.indexOf(keyword) !== -1 ? "" : "none";
                });
            });
        });

        var searchPage = document.querySelector("[data-search-page]");
        if (searchPage && window.SITE_MOVIES) {
            var input = searchPage.querySelector("[data-search-input]");
            var typeFilter = searchPage.querySelector("[data-type-filter]");
            var yearFilter = searchPage.querySelector("[data-year-filter]");
            var clearButton = searchPage.querySelector("[data-search-clear]");
            var results = searchPage.querySelector("[data-search-results]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            if (input) {
                input.value = initial;
            }

            function render() {
                var keyword = normalize(input && input.value);
                var typeValue = typeFilter ? typeFilter.value : "";
                var yearValue = yearFilter ? yearFilter.value : "";
                var matched = window.SITE_MOVIES.filter(function (movie) {
                    var text = normalize([
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        (movie.tags || []).join(" "),
                        movie.oneLine
                    ].join(" "));
                    var keywordOk = !keyword || text.indexOf(keyword) !== -1;
                    var typeOk = !typeValue || movie.type === typeValue;
                    var yearOk = !yearValue || String(movie.year) === yearValue;
                    return keywordOk && typeOk && yearOk;
                }).slice(0, 120);
                results.innerHTML = matched.map(cardHtml).join("");
            }

            [input, typeFilter, yearFilter].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", render);
                    element.addEventListener("change", render);
                }
            });
            if (clearButton) {
                clearButton.addEventListener("click", function () {
                    input.value = "";
                    if (typeFilter) {
                        typeFilter.value = "";
                    }
                    if (yearFilter) {
                        yearFilter.value = "";
                    }
                    render();
                });
            }
            render();
        }
    });
})();
