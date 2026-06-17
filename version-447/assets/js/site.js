(function () {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-mobile-nav]');

  if (button && menu) {
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  const filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    const input = filterRoot.querySelector('[data-filter-input]');
    const selects = filterRoot.querySelectorAll('[data-filter-select]');
    const cards = Array.from(document.querySelectorAll('[data-haystack]'));
    const empty = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const keyword = normalize(input ? input.value : '');
      const activeSelects = Array.from(selects).map(function (select) {
        return {
          key: select.getAttribute('data-filter-select'),
          value: normalize(select.value)
        };
      });
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute('data-haystack'));
        let matched = !keyword || haystack.indexOf(keyword) !== -1;

        activeSelects.forEach(function (item) {
          if (!item.value) {
            return;
          }
          const cardValue = normalize(card.getAttribute('data-' + item.key));
          if (cardValue !== item.value) {
            matched = false;
          }
        });

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
}());
