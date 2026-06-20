(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var section = form.closest('section') || document;
    var input = form.querySelector('[data-search-input]');
    var select = form.querySelector('[data-sort-select]');
    var list = section.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    var applySearch = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', query.length > 0 && text.indexOf(query) === -1);
      });
    };

    var applySort = function () {
      if (!select) {
        return;
      }
      var value = select.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (value === 'hot-desc') {
          return Number(b.getAttribute('data-hot')) - Number(a.getAttribute('data-hot'));
        }
        if (value === 'title-asc') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
      applySearch();
    };

    if (input) {
      input.addEventListener('input', applySearch);
    }

    if (select) {
      select.addEventListener('change', applySort);
    }
  });
})();
