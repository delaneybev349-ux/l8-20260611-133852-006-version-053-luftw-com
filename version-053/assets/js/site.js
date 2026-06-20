(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) return;
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) prev.addEventListener("click", function () { show(index - 1); start(); });
    if (next) next.addEventListener("click", function () { show(index + 1); start(); });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () { show(i); start(); });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilter() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    var select = document.querySelector("[data-filter-select='type']");
    if (!list) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input && initial) input.value = initial;

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var type = select ? select.value : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardType = card.getAttribute("data-type") || "";
        var okText = !query || text.indexOf(query) !== -1;
        var okType = !type || cardType === type;
        card.classList.toggle("is-hidden", !(okText && okType));
      });
    }

    if (input) input.addEventListener("input", apply);
    if (select) select.addEventListener("change", apply);
    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-movie-player]");
    var overlay = document.querySelector("[data-player-overlay]");
    var detailButton = document.querySelector("[data-detail-play]");
    if (!video || !streamUrl) return;
    var loaded = false;
    var hlsInstance = null;

    function mount() {
      if (loaded) return;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
      video.setAttribute("data-loaded", "true");
    }

    function play() {
      mount();
      if (overlay) overlay.classList.add("is-hidden");
      video.controls = true;
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () {});
    }

    if (overlay) overlay.addEventListener("click", play);
    if (detailButton) detailButton.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!loaded) play();
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && hlsInstance.destroy) hlsInstance.destroy();
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilter();
  });
})();
