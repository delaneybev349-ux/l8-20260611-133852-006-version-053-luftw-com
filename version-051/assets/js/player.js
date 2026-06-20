(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initPlayer() {
    var container = document.querySelector("[data-player]");
    if (!container) {
      return;
    }

    var video = container.querySelector("video");
    var overlay = container.querySelector("[data-play]");
    var src = container.getAttribute("data-hls");
    var attached = false;

    function attach() {
      if (attached || !video || !src) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        container._player = hls;
        return;
      }
      video.src = src;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }
  }

  ready(initPlayer);
})();
