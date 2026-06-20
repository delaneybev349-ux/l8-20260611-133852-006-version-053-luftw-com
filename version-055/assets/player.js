var Hls = window.Hls;
var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (root) {
  var video = root.querySelector('video');
  var cover = root.querySelector('[data-cover]');
  var playButton = root.querySelector('[data-play]');
  var source = video ? video.querySelector('source') : null;
  var url = source ? source.getAttribute('src') : '';
  var attached = false;

  if (!video || !url) {
    return;
  }

  var attach = function () {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    attached = true;
  };

  var start = function () {
    attach();
    root.classList.add('is-playing');
    video.setAttribute('controls', 'controls');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  cover && cover.addEventListener('click', start);
  playButton && playButton.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!attached) {
      start();
    }
  });
});
