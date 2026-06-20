(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    const carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
        let active = 0;

        const show = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(active + 1);
            }, 5600);
        }
    }

    const localFilters = Array.from(document.querySelectorAll(".local-filter"));

    localFilters.forEach(function (input) {
        const cards = Array.from(document.querySelectorAll("[data-filter-card]"));
        input.addEventListener("input", function () {
            const value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
                card.classList.toggle("is-filter-hidden", value && !keywords.includes(value));
            });
        });
    });
})();

function setupPlayer(movieStreamUrl) {
    const player = document.querySelector(".movie-player");

    if (!player) {
        return;
    }

    const video = player.querySelector(".player-video");
    const cover = player.querySelector(".player-cover");
    let attached = false;
    let hls = null;

    const attach = function () {
        if (attached || !video || !movieStreamUrl) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = movieStreamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(movieStreamUrl);
            hls.attachMedia(video);
        } else {
            video.src = movieStreamUrl;
        }
    };

    const start = function () {
        attach();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    };

    if (cover) {
        cover.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                start();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

(function () {
    const input = document.getElementById("site-search-input");
    const results = document.getElementById("search-results");
    const title = document.getElementById("search-title");

    if (!input || !results || !window.searchMovies) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    input.value = initial;

    const createCard = function (movie) {
        const tags = movie.tags.slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "<article class=\"movie-card\">" +
            "<a class=\"card-cover\" href=\"./" + movie.url + "\">" +
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"play-badge\">▶</span>" +
            "<span class=\"cover-label\">" + escapeHtml(movie.duration) + "</span>" +
            "</a>" +
            "<div class=\"card-body\">" +
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.genre) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
            "<h2><a href=\"./" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p>" + escapeHtml(movie.text) + "</p>" +
            "<div class=\"card-tags\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    };

    const runSearch = function () {
        const query = input.value.trim().toLowerCase();

        if (!query) {
            title.textContent = "热门推荐";
            return;
        }

        const matched = window.searchMovies.filter(function (movie) {
            return movie.keywords.toLowerCase().includes(query);
        }).slice(0, 80);

        title.textContent = "搜索结果";

        if (!matched.length) {
            results.innerHTML = "<div class=\"no-result\">未找到相关影片</div>";
            return;
        }

        results.innerHTML = matched.map(createCard).join("");
    };

    input.addEventListener("input", runSearch);

    if (initial) {
        runSearch();
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
})();
