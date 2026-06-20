(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.getElementById('mainNav');
  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      startHero();
    });
  });
  startHero();

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyCards() {
    var terms = searchInputs.map(function (input) {
      return normalize(input.value);
    }).filter(Boolean).join(' ');
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' '));
      var byText = !terms || terms.split(/\s+/).every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
      var byFilter = activeFilter === 'all' || card.getAttribute('data-region') === activeFilter;
      var matched = byText && byFilter;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyCards);
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  var searchInput = document.querySelector('[data-search-input]');
  if (q) {
    searchInputs.forEach(function (input) {
      input.value = q;
    });
    if (searchInput) {
      searchInput.value = q;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter]')).forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      Array.prototype.slice.call(button.parentNode.querySelectorAll('[data-filter]')).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyCards();
    });
  });

  applyCards();
})();
