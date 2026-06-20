(function () {
  function preparePlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-cover');
    var source = box.getAttribute('data-video-url');
    var hls = null;

    function attach() {
      if (!video || !source || box.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      box.setAttribute('data-ready', '1');
    }

    function play() {
      attach();
      if (button) {
        button.hidden = true;
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (button) {
            button.hidden = false;
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.hidden = true;
        }
      });
      video.addEventListener('ended', function () {
        if (button) {
          button.hidden = false;
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(preparePlayer);
})();
