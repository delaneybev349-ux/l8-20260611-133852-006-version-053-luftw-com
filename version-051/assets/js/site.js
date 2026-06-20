(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
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
      }, 4800);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var block = panel.parentElement || document;
      var cards = Array.prototype.slice.call(block.querySelectorAll(".movie-card"));
      var search = panel.querySelector("[data-filter-search]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var empty = panel.querySelector("[data-filter-empty]");

      function apply() {
        var keyword = normalize(search && search.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardType = normalize(card.getAttribute("data-type"));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            matched = false;
          }
          if (regionValue && cardRegion.indexOf(regionValue) === -1) {
            matched = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-page-input]");
    var title = document.querySelector("[data-search-title]");
    var form = document.querySelector("[data-search-page-form]");
    if (!results || !input || !window.SITE_MOVIES) {
      return;
    }

    function card(movie) {
      var tags = movie.tags.slice(0, 4).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\">" +
        "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + " 在线观看\">" +
        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + " 在线观看\" loading=\"lazy\">" +
        "<span class=\"quality-badge\">HD</span><span class=\"poster-play\">▶</span></a>" +
        "<div class=\"movie-card-body\"><h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>" +
        "<p class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
        "<p class=\"movie-desc\">" + escapeHtml(movie.line) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
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

    function run(query) {
      var value = normalize(query);
      var list = window.SITE_MOVIES.filter(function (movie) {
        return !value || normalize(movie.title + " " + movie.genre + " " + movie.tags.join(" ") + " " + movie.region + " " + movie.year + " " + movie.type).indexOf(value) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = value ? "搜索结果" : "热门影片";
      }
      results.innerHTML = list.map(card).join("");
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;
    run(query);

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var next = input.value.trim();
        var url = next ? "search.html?q=" + encodeURIComponent(next) : "search.html";
        history.replaceState(null, "", url);
        run(next);
      });
    }
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
