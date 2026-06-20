import { H as Hls } from './hls-vendor-dru42stk.js';

const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
        return;
    }
    callback();
};

const normalize = (value) => String(value || '').toLowerCase().trim();

ready(() => {
    initMobileMenu();
    initHeroCarousel();
    initInlineFilters();
    initPlayer();
});

function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', () => {
        panel.classList.toggle('is-open');
    });
}

function initHeroCarousel() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');

    if (slides.length <= 1) {
        return;
    }

    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    const restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(index + 1), 5000);
    };

    prev?.addEventListener('click', () => {
        show(index - 1);
        restart();
    });

    next?.addEventListener('click', () => {
        show(index + 1);
        restart();
    });

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.heroDot || 0));
            restart();
        });
    });

    restart();
}

function initInlineFilters() {
    const filterBlocks = Array.from(document.querySelectorAll('[data-inline-filter]'));

    filterBlocks.forEach((filterBlock) => {
        const scope = filterBlock.parentElement || document;
        const list = scope.querySelector('[data-filter-list]');
        const cards = Array.from(list?.querySelectorAll('.movie-card') || []);
        const keyword = filterBlock.querySelector('[data-filter-input]');
        const selects = Array.from(filterBlock.querySelectorAll('[data-filter-field]'));
        const count = scope.querySelector('[data-filter-count]');

        if (!cards.length) {
            return;
        }

        const apply = () => {
            const query = normalize(keyword?.value);
            const selectedValues = selects.map((select) => ({
                field: select.dataset.filterField,
                value: normalize(select.value),
            }));
            let visible = 0;

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.category,
                    card.textContent,
                ].join(' '));
                const matchesQuery = !query || haystack.includes(query);
                const matchesSelects = selectedValues.every(({ field, value }) => {
                    if (!value || !field) {
                        return true;
                    }
                    return normalize(card.dataset[field]).includes(value);
                });
                const isVisible = matchesQuery && matchesSelects;
                card.classList.toggle('is-hidden', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = `当前显示 ${visible} 部影片`;
            }
        };

        keyword?.addEventListener('input', apply);
        selects.forEach((select) => select.addEventListener('change', apply));

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');
        if (initialQuery && keyword) {
            keyword.value = initialQuery;
        }
        apply();
    });
}

function initPlayer() {
    const players = Array.from(document.querySelectorAll('[data-player]'));

    players.forEach((shell) => {
        const video = shell.querySelector('video');
        const button = shell.querySelector('.player-start');
        const source = shell.dataset.videoSrc;

        if (!video || !source || !button) {
            return;
        }

        const start = () => {
            if (shell.dataset.playerReady !== 'true') {
                attachSource(video, source, shell);
                shell.dataset.playerReady = 'true';
            }
            shell.classList.add('is-playing');
            video.controls = true;
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {
                    shell.classList.remove('is-playing');
                });
            }
        };

        button.addEventListener('click', start);
        video.addEventListener('play', () => shell.classList.add('is-playing'));
    });
}

function attachSource(video, source, shell) {
    const isM3u8 = /\.m3u8(\?|$)/i.test(source);

    if (isM3u8 && Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
            if (data?.fatal) {
                shell.classList.remove('is-playing');
                video.src = source;
            }
        });
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
        video.src = source;
        return;
    }

    video.src = source;
}
