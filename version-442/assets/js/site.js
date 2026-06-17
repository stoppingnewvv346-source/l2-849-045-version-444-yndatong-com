(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    var reset = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        reset();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  var queryParams = new URLSearchParams(window.location.search);
  var initialQuery = queryParams.get('q') || '';
  var globalSearch = document.querySelector('[data-global-search]');
  var globalSort = document.querySelector('[data-global-sort]');
  var pageFilter = document.querySelector('[data-page-filter]');
  var pageSort = document.querySelector('[data-page-sort]');
  var cardList = document.querySelector('[data-card-list]');
  var categoryButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
  var activeCategory = 'all';

  var normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };

  var getCards = function () {
    if (!cardList) {
      return [];
    }

    return Array.prototype.slice.call(cardList.querySelectorAll('[data-movie-card]'));
  };

  var applyFilter = function () {
    var input = globalSearch || pageFilter;
    var text = normalize(input ? input.value : '');
    var cards = getCards();

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search') || '';
      var category = card.getAttribute('data-category') || '';
      var matchText = !text || haystack.indexOf(text) !== -1;
      var matchCategory = activeCategory === 'all' || category === activeCategory;
      card.classList.toggle('is-hidden', !(matchText && matchCategory));
    });
  };

  var sortCards = function (mode) {
    if (!cardList || !mode || mode === 'default') {
      return;
    }

    var cards = getCards();

    cards.sort(function (a, b) {
      if (mode === 'year') {
        return String(b.getAttribute('data-year') || '').localeCompare(String(a.getAttribute('data-year') || ''));
      }

      if (mode === 'title') {
        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
      }

      return 0;
    });

    cards.forEach(function (card) {
      cardList.appendChild(card);
    });
  };

  if (globalSearch) {
    globalSearch.value = initialQuery;
    globalSearch.addEventListener('input', applyFilter);
  }

  if (pageFilter) {
    pageFilter.addEventListener('input', applyFilter);
  }

  if (globalSort) {
    globalSort.addEventListener('change', function () {
      sortCards(globalSort.value);
      applyFilter();
    });
  }

  if (pageSort) {
    pageSort.addEventListener('change', function () {
      sortCards(pageSort.value);
      applyFilter();
    });
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter-category') || 'all';

      categoryButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      applyFilter();
    });
  });

  applyFilter();
})();
