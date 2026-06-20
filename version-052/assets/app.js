(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function resolveUrl(root, url) {
    return String(root || '') + String(url || '');
  }

  function bindMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function bindHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = parseInt(dot.getAttribute('data-hero-dot') || '0', 10);
        show(next);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function getSearchIndex() {
    return Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
  }

  function bindHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
    forms.forEach(function (form) {
      var input = form.querySelector('input[name="q"]');
      var panel = form.querySelector('[data-quick-results]');
      var root = form.getAttribute('data-search-root') || '';
      if (!input) {
        return;
      }

      function render() {
        var query = normalize(input.value);
        if (!panel) {
          return;
        }
        if (query.length < 1) {
          panel.classList.remove('active');
          panel.innerHTML = '';
          return;
        }
        var matches = getSearchIndex().filter(function (item) {
          return normalize(item.title + ' ' + item.genre + ' ' + item.tags + ' ' + item.year + ' ' + item.region).indexOf(query) !== -1;
        }).slice(0, 6);
        panel.innerHTML = matches.map(function (item) {
          return '<a href="' + escapeHtml(resolveUrl(root, item.url)) + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.genre + ' · ' + item.year) + '</small></a>';
        }).join('') || '<a href="' + escapeHtml(resolveUrl(root, 'search.html?q=' + encodeURIComponent(query))) + '"><strong>查看完整搜索结果</strong><small>' + escapeHtml(query) + '</small></a>';
        panel.classList.add('active');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);
      document.addEventListener('click', function (event) {
        if (!form.contains(event.target) && panel) {
          panel.classList.remove('active');
        }
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        if (query) {
          window.location.href = resolveUrl(root, 'search.html?q=' + encodeURIComponent(query));
        }
      });
    });
  }

  function bindFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var count = panel.querySelector('[data-filter-count]');
      var termButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-term]'));
      var activeTerm = '';
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

      if (year && year.options.length <= 1) {
        var years = [];
        cards.forEach(function (card) {
          var value = card.getAttribute('data-year') || '';
          if (value && years.indexOf(value) === -1) {
            years.push(value);
          }
        });
        years.sort().reverse().forEach(function (value) {
          var option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          year.appendChild(option);
        });
      }

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-keywords') || card.textContent || '');
          var cardYear = card.getAttribute('data-year') || '';
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          var yearMatch = !selectedYear || cardYear === selectedYear;
          var termMatch = !activeTerm || haystack.indexOf(normalize(activeTerm)) !== -1;
          var shouldShow = queryMatch && yearMatch && termMatch;
          card.classList.toggle('hidden-by-filter', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }
      if (year) {
        year.addEventListener('change', applyFilter);
      }
      termButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          termButtons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          activeTerm = button.getAttribute('data-term') || '';
          applyFilter();
        });
      });
      applyFilter();
    });
  }

  function bindSearchPage() {
    var container = document.querySelector('[data-search-results]');
    if (!container) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var title = document.querySelector('[data-search-title]');
    var mainInput = document.querySelector('[data-main-search]');
    var fallback = document.querySelector('[data-search-fallback]');
    if (mainInput) {
      mainInput.value = query;
    }
    if (!query.trim()) {
      container.innerHTML = '';
      if (title) {
        title.textContent = '热门影片';
      }
      return;
    }
    var normalizedQuery = normalize(query);
    var results = getSearchIndex().filter(function (item) {
      return normalize(item.title + ' ' + item.genre + ' ' + item.tags + ' ' + item.year + ' ' + item.region + ' ' + item.description).indexOf(normalizedQuery) !== -1;
    }).slice(0, 80);
    if (title) {
      title.textContent = '搜索结果：' + query + '（' + results.length + '）';
    }
    if (fallback) {
      fallback.style.display = 'none';
    }
    container.innerHTML = results.map(function (item) {
      return '<a class="search-result-card" href="' + escapeHtml(item.url) + '"><img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.genre + ' · ' + item.year + ' · ' + item.region) + '</p><p>' + escapeHtml(item.description) + '</p></span></a>';
    }).join('') || '<p class="muted">没有找到匹配结果，请换一个关键词。</p>';
  }

  function bindPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (card) {
      var video = card.querySelector('video[data-src]');
      var button = card.querySelector('[data-play-button]');
      var hlsInstance = null;
      if (!video) {
        return;
      }

      function loadPlayer() {
        if (video.getAttribute('data-loaded') === 'true') {
          return;
        }
        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (card.classList.contains('is-playing')) {
              var readyPlay = video.play();
              if (readyPlay && typeof readyPlay.catch === 'function') {
                readyPlay.catch(function () {});
              }
            }
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else {
          video.src = source;
        }
        video.setAttribute('data-loaded', 'true');
      }

      function play() {
        loadPlayer();
        card.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        card.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          card.classList.remove('is-playing');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    bindMenu();
    bindHero();
    bindHeaderSearch();
    bindFilters();
    bindSearchPage();
    bindPlayers();
  });
})();
