(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll('.menu-toggle').forEach(function (button) {
      var panel = document.querySelector('.mobile-panel');
      if (!panel) {
        return;
      }
      button.addEventListener('click', function () {
        var open = panel.hasAttribute('hidden');
        if (open) {
          panel.removeAttribute('hidden');
          button.setAttribute('aria-expanded', 'true');
          button.textContent = '×';
        } else {
          panel.setAttribute('hidden', '');
          button.setAttribute('aria-expanded', 'false');
          button.textContent = '☰';
        }
      });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

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

      show(0);
      restart();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var area = panel.parentElement;
      var list = area ? area.querySelector('[data-filter-list]') : null;
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
      var input = panel.querySelector('[data-filter-text]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var count = panel.querySelector('[data-filter-count]');
      var empty = area.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (input && query) {
        input.value = query;
      }

      function matchType(card, value) {
        if (!value) {
          return true;
        }
        return (card.getAttribute('data-type') || '').indexOf(value) !== -1;
      }

      function matchYear(card, value) {
        if (!value) {
          return true;
        }
        return (card.getAttribute('data-year') || '') === value;
      }

      function applyFilter() {
        var text = input ? input.value.trim().toLowerCase() : '';
        var typeValue = typeSelect ? typeSelect.value : '';
        var yearValue = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-search') || '',
            card.getAttribute('data-genre') || ''
          ].join(' ').toLowerCase();
          var ok = (!text || haystack.indexOf(text) !== -1) && matchType(card, typeValue) && matchYear(card, yearValue);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '已显示 ' + visible + ' 部';
        }
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  });
})();
