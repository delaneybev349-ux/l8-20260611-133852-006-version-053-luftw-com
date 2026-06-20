(function () {
    var mobileButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var searchInput = document.querySelector('.movie-search');
    var sortSelect = document.querySelector('.movie-sort');
    var scope = document.querySelector('[data-filter-scope]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var activeChip = '';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function getCards() {
        if (!scope) {
            return [];
        }
        return Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .list-card'));
    }

    function applyFilter() {
        var query = normalize(searchInput ? searchInput.value : '');
        var filter = normalize(activeChip);
        var visible = 0;
        getCards().forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search') || '') + ' ' + normalize(card.getAttribute('data-tags') || '') + ' ' + normalize(card.getAttribute('data-genre') || '');
            var matchedQuery = !query || haystack.indexOf(query) !== -1;
            var matchedChip = !filter || haystack.indexOf(filter) !== -1;
            var show = matchedQuery && matchedChip;
            card.classList.toggle('hidden-by-filter', !show);
            if (show) {
                visible += 1;
            }
        });
        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    function applySort() {
        if (!scope || !sortSelect) {
            return;
        }
        var cards = getCards();
        var mode = sortSelect.value;
        cards.sort(function (a, b) {
            if (mode === 'year-desc') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            if (mode === 'year-asc') {
                return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
            }
            if (mode === 'title') {
                return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
            }
            return 0;
        });
        cards.forEach(function (card) {
            scope.appendChild(card);
        });
        applyFilter();
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
            applyFilter();
        }
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var value = chip.getAttribute('data-filter') || '';
            activeChip = activeChip === value ? '' : value;
            chips.forEach(function (item) {
                item.classList.toggle('active', item.getAttribute('data-filter') === activeChip && activeChip !== '');
            });
            applyFilter();
        });
    });

    function initVideo(video) {
        if (!video || video.getAttribute('data-ready') === '1') {
            return;
        }
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var player = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            player.loadSource(stream);
            player.attachMedia(video);
            video.hlsPlayer = player;
            video.setAttribute('data-ready', '1');
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.setAttribute('data-ready', '1');
        }
    }

    function startVideo(video) {
        if (!video) {
            return;
        }
        var shell = video.closest('.player-shell');
        initVideo(video);
        video.setAttribute('controls', 'controls');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
        if (shell) {
            shell.classList.add('is-playing');
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
        var video = shell.querySelector('.video-player');
        var button = shell.querySelector('.play-overlay');
        if (button && video) {
            button.addEventListener('click', function () {
                startVideo(video);
            });
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo(video);
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
        }
    });
})();
