import { H as Hls } from './hls-vendor-dru42stk.js';

function activatePlayer(root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('.player-cover');

    if (!video || !cover) {
        return;
    }

    var source = video.getAttribute('data-video-url');
    var started = false;
    var hls = null;

    function attachSource() {
        if (!source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function start() {
        if (!started) {
            started = true;
            attachSource();
            cover.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.setAttribute('controls', 'controls');
            });
        }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!started) {
            start();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.movie-player').forEach(activatePlayer);
});
