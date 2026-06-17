(function () {
  function basePath(path) {
    var base = window.SITE_BASE || ".";
    if (base === ".") {
      return "./" + path;
    }
    return base + "/" + path;
  }

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");
    if (toggle && mobilePanel) {
      toggle.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    var prev = document.querySelector(".hero-control.prev");
    var next = document.querySelector(".hero-control.next");
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var layer = document.querySelector(".search-layer");
    var results = document.querySelector(".search-results");
    var close = document.querySelector(".search-close");

    function normalize(text) {
      return String(text || "").toLowerCase().replace(/\s+/g, "");
    }

    function renderSearch(query) {
      if (!layer || !results) {
        return;
      }
      var keyword = normalize(query);
      if (!keyword) {
        return;
      }
      var list = (window.MOVIES || []).filter(function (movie) {
        var hay = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(""),
          movie.oneLine
        ].join(" "));
        return hay.indexOf(keyword) !== -1;
      }).slice(0, 16);

      if (!list.length) {
        results.innerHTML = '<p class="empty-result">没有找到匹配内容</p>';
      } else {
        results.innerHTML = list.map(function (movie) {
          var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + tag + "</span>";
          }).join("");
          return '<a class="search-item" href="' + basePath(movie.url) + '">' +
            '<img src="' + basePath(movie.cover) + '" alt="' + movie.title + '">' +
            '<div><strong>' + movie.title + '</strong>' +
            '<p>' + movie.year + ' · ' + movie.region + ' · ' + movie.genre + '</p>' +
            '<div class="tag-row">' + tags + '</div></div></a>';
        }).join("");
      }
      layer.classList.add("open");
      layer.setAttribute("aria-hidden", "false");
    }

    Array.prototype.slice.call(document.querySelectorAll(".global-search-form")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector(".global-search-input");
        renderSearch(input ? input.value : "");
      });
    });

    if (close && layer) {
      close.addEventListener("click", function () {
        layer.classList.remove("open");
        layer.setAttribute("aria-hidden", "true");
      });
    }
    if (layer) {
      layer.addEventListener("click", function (event) {
        if (event.target === layer) {
          layer.classList.remove("open");
          layer.setAttribute("aria-hidden", "true");
        }
      });
    }

    var filterInput = document.querySelector(".page-filter-input");
    var filterGenre = document.querySelector(".page-filter-genre");
    var filterYear = document.querySelector(".page-filter-year");
    var catalogCards = Array.prototype.slice.call(document.querySelectorAll(".catalog-grid .movie-card"));

    function filterCatalog() {
      var keyword = normalize(filterInput ? filterInput.value : "");
      var genre = normalize(filterGenre ? filterGenre.value : "");
      var year = normalize(filterYear ? filterYear.value : "");
      catalogCards.forEach(function (card) {
        var hay = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));
        var ok = true;
        if (keyword && hay.indexOf(keyword) === -1) {
          ok = false;
        }
        if (genre && hay.indexOf(genre) === -1) {
          ok = false;
        }
        if (year && hay.indexOf(year) === -1) {
          ok = false;
        }
        card.classList.toggle("hidden", !ok);
      });
    }

    [filterInput, filterGenre, filterYear].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filterCatalog);
        control.addEventListener("change", filterCatalog);
      }
    });
  });
})();
