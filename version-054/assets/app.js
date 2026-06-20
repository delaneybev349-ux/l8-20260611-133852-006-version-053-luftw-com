(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === activeIndex);
        });

        thumbs.forEach(function (thumb, i) {
            thumb.classList.toggle('is-current', i === activeIndex);
        });
    }

    thumbs.forEach(function (thumb, index) {
        thumb.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    showSlide(0);

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    filterForms.forEach(function (form) {
        var scope = form.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

        function applyFilter() {
            var keyword = (form.elements.keyword ? form.elements.keyword.value : '').trim().toLowerCase();
            var type = form.elements.type ? form.elements.type.value.trim().toLowerCase() : '';
            var year = form.elements.year ? form.elements.year.value.trim() : '';

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedType = !type || haystack.indexOf(type) !== -1;
                var matchedYear = !year || cardYear.indexOf(year) !== -1;
                card.classList.toggle('is-hidden-card', !(matchedKeyword && matchedType && matchedYear));
            });
        }

        form.addEventListener('input', applyFilter);
        form.addEventListener('change', applyFilter);
    });
})();
