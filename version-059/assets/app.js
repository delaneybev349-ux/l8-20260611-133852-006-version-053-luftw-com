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

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    var search = document.querySelector(".header-search");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      if (search) {
        search.classList.toggle("is-open", open);
      }
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length < 2) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-index]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-index")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll(".library-grid, .ranking-list"));
    var input = document.querySelector(".library-search");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    if (!grids.length || (!input && !selects.length)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }
    selects.forEach(function (select) {
      var key = select.getAttribute("name") || select.getAttribute("data-filter");
      if (key && params.get(key)) {
        select.value = params.get(key);
      }
    });

    function cardMatches(card) {
      var query = normalize(input ? input.value : "");
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-category"),
        card.textContent
      ].join(" "));
      if (query && haystack.indexOf(query) === -1) {
        return false;
      }
      for (var i = 0; i < selects.length; i += 1) {
        var select = selects[i];
        var filter = select.getAttribute("data-filter");
        var value = normalize(select.value);
        if (!filter || !value) {
          continue;
        }
        var attr = normalize(card.getAttribute("data-" + filter));
        if (filter === "year") {
          var cardYear = Number(card.getAttribute("data-year")) || 0;
          var selectedYear = Number(select.value) || 0;
          if (selectedYear >= 2000 && selectedYear < 2024) {
            if (cardYear < selectedYear) {
              return false;
            }
          } else if (cardYear !== selectedYear) {
            return false;
          }
        } else if (attr.indexOf(value) === -1 && haystack.indexOf(value) === -1) {
          return false;
        }
      }
      return true;
    }

    function apply() {
      var visible = 0;
      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .rank-row"));
        cards.forEach(function (card) {
          var ok = cardMatches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
      });
      document.querySelectorAll(".empty-state").forEach(function (empty) {
        empty.hidden = visible !== 0;
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  function setupPlayers() {
    var frames = Array.prototype.slice.call(document.querySelectorAll(".video-frame"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var cover = frame.querySelector(".player-cover");
      if (!video) {
        return;
      }
      var sourceEl = video.querySelector("source");
      var source = video.getAttribute("data-video-url") || (sourceEl ? sourceEl.src : "");
      var loaded = false;

      function attach() {
        if (loaded || !source) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (!video.src) {
          video.src = source;
        }
      }

      function play() {
        attach();
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
