(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileNav() {
    var toggle = qs('[data-mobile-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) return;
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initIndexFilter() {
    var tabs = qs('[data-index-filter-tabs]');
    var grid = qs('[data-index-filter-grid]');
    if (!tabs || !grid) return;
    var buttons = qsa('[data-index-filter]', tabs);
    var cards = qsa('[data-index-card]', grid);

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var slug = button.getAttribute('data-index-filter');
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          var cats = (card.getAttribute('data-cats') || '').split(/\s+/);
          card.hidden = slug !== 'all' && cats.indexOf(slug) === -1;
        });
      });
    });
  }

  function initCardFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var search = qs('[data-card-search]', scope);
      var typeFilter = qs('[data-type-filter]', scope);
      var yearFilter = qs('[data-year-filter]', scope);
      var grid = qs('[data-card-grid]', scope);
      var empty = qs('[data-empty-state]', scope);
      var buttons = qsa('[data-sort]', scope);
      if (!grid) return;

      function apply() {
        var query = normalize(search && search.value);
        var type = normalize(typeFilter && typeFilter.value);
        var year = normalize(yearFilter && yearFilter.value);
        var visible = 0;
        qsa('.movie-card', grid).forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = (!query || haystack.indexOf(query) !== -1) &&
            (!type || cardType === type) &&
            (!year || cardYear === year);
          card.hidden = !matched;
          if (matched) visible += 1;
        });
        if (empty) empty.hidden = visible !== 0;
      }

      function sortBy(mode) {
        var cards = qsa('.movie-card', grid);
        cards.sort(function (a, b) {
          if (mode === 'views') {
            return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
          }
          if (mode === 'likes') {
            return Number(b.getAttribute('data-likes') || 0) - Number(a.getAttribute('data-likes') || 0);
          }
          return String(b.getAttribute('data-date') || '').localeCompare(String(a.getAttribute('data-date') || ''));
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
        apply();
      }

      [search, typeFilter, yearFilter].forEach(function (control) {
        if (!control) return;
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      });

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          sortBy(button.getAttribute('data-sort'));
        });
      });

      apply();
    });
  }

  function movieCard(movie) {
    var href = 'video/' + movie.id_str + '.html';
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>#' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
      '  <a href="' + href + '" class="card-link">' +
      '    <div class="card-cover">' +
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '      <span class="duration">' + escapeHtml(movie.duration) + '</span>' +
      '    </div>' +
      '    <div class="card-body">' +
      '      <h3>' + escapeHtml(movie.title) + '</h3>' +
      '      <p>' + escapeHtml(movie.one_line) + '</p>' +
      '      <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '      <div class="hero-tags">' + tags + '</div>' +
      '    </div>' +
      '  </a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var form = qs('[data-search-form]');
    var input = qs('[data-search-input]');
    var results = qs('[data-search-results]');
    var empty = qs('[data-search-empty]');
    var title = qs('[data-search-title]');
    if (!form || !input || !results || !window.MOVIES) return;

    function getQuery() {
      return new URLSearchParams(window.location.search).get('q') || '';
    }

    function render(query) {
      input.value = query;
      var q = normalize(query);
      if (!q) {
        results.innerHTML = '';
        if (empty) {
          empty.hidden = false;
          empty.textContent = '输入关键词开始搜索';
        }
        if (title) title.textContent = '搜索结果';
        return;
      }
      var matched = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.one_line,
          movie.summary,
          movie.genre,
          movie.region,
          movie.type,
          movie.year,
          (movie.tags || []).join(' ')
        ].join(' '));
        return haystack.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(movieCard).join('');
      if (empty) {
        empty.hidden = matched.length !== 0;
        empty.textContent = '没有找到匹配内容';
      }
      if (title) title.textContent = '搜索：' + query;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.pushState(null, '', url);
      render(query);
    });

    window.addEventListener('popstate', function () {
      render(getQuery());
    });

    render(getQuery());
  }

  function initActions() {
    qsa('[data-like]').forEach(function (button) {
      button.addEventListener('click', function () {
        button.classList.toggle('is-active');
      });
    });

    qsa('[data-share]').forEach(function (button) {
      button.addEventListener('click', function () {
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = '已复制链接';
          });
        } else {
          button.textContent = '复制当前链接';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initIndexFilter();
    initCardFilters();
    initSearchPage();
    initActions();
  });
})();
