(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        menuButton.textContent = open ? "×" : "☰";
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;

      function showHero(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function startHero() {
        clearInterval(timer);
        timer = setInterval(function () {
          showHero(current + 1);
        }, 5200);
      }

      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (prev) {
        prev.addEventListener("click", function () {
          showHero(current - 1);
          startHero();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showHero(current + 1);
          startHero();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showHero(Number(dot.getAttribute("data-hero-index")) || 0);
          startHero();
        });
      });
      startHero();
    }

    document.querySelectorAll(".catalog-toolbar").forEach(function (toolbar) {
      var input = toolbar.querySelector(".catalog-filter");
      var targetId = input ? input.getAttribute("data-target") : "";
      var list = targetId ? document.getElementById(targetId) : null;
      var buttons = Array.prototype.slice.call(toolbar.querySelectorAll(".sort-button"));
      if (!list) {
        return;
      }

      function items() {
        return Array.prototype.slice.call(list.querySelectorAll(".catalog-item"));
      }

      function filterItems() {
        var value = input ? input.value.trim().toLowerCase() : "";
        items().forEach(function (item) {
          var text = (item.getAttribute("data-title") || "").toLowerCase();
          item.style.display = !value || text.indexOf(value) !== -1 ? "" : "none";
        });
      }

      function sortItems(type) {
        var sorted = items().sort(function (a, b) {
          var av = Number(a.getAttribute("data-" + type)) || 0;
          var bv = Number(b.getAttribute("data-" + type)) || 0;
          return bv - av;
        });
        sorted.forEach(function (item) {
          list.appendChild(item);
        });
        filterItems();
      }

      if (input) {
        input.addEventListener("input", filterItems);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (node) {
            node.classList.remove("active");
          });
          button.classList.add("active");
          sortItems(button.getAttribute("data-sort") || "rank");
        });
      });
    });
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("player-video");
  var cover = document.getElementById("player-cover");
  var startButton = document.getElementById("player-start");
  if (!video || !streamUrl) {
    return;
  }
  var attached = false;
  var hlsPlayer = null;

  function attach() {
    if (attached) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    attached = true;
  }

  function begin() {
    attach();
    if (cover) {
      cover.style.display = "none";
    }
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", begin);
  }
  if (startButton) {
    startButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      begin();
    });
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
}

function initSearchPage() {
  var form = document.getElementById("search-form");
  var input = document.getElementById("search-input");
  var category = document.getElementById("search-category");
  var type = document.getElementById("search-type");
  var results = document.getElementById("search-results");
  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";
  if (!input || !results || !Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    return;
  }
  input.value = initial;

  function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\"><a class=\"movie-link\" href=\"" + movie.url + "\"><span class=\"thumb poster\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"></span><span class=\"badge-row\"><b>" + escapeHtml(movie.type) + "</b><i>" + escapeHtml(movie.year) + "</i></span><h3>" + escapeHtml(movie.title) + "</h3><p>" + escapeHtml(movie.desc) + "</p><span class=\"tag-row\">" + tags + "</span></a></article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        "\"": "&quot;"
      }[char];
    });
  }

  function runSearch() {
    var q = input.value.trim().toLowerCase();
    var selectedCategory = category ? category.value : "";
    var selectedType = type ? type.value : "";
    var found = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      var textMatch = !q || movie.search.indexOf(q) !== -1;
      var categoryMatch = !selectedCategory || movie.category === selectedCategory;
      var typeMatch = !selectedType || movie.type.indexOf(selectedType) !== -1;
      return textMatch && categoryMatch && typeMatch;
    }).slice(0, 160);
    if (!found.length) {
      results.innerHTML = "<div class=\"empty-state\">没有找到匹配内容</div>";
      return;
    }
    results.innerHTML = found.map(card).join("");
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set("q", input.value.trim());
      } else {
        url.searchParams.delete("q");
      }
      history.replaceState(null, "", url.toString());
      runSearch();
    });
  }
  [input, category, type].forEach(function (node) {
    if (node) {
      node.addEventListener("input", runSearch);
      node.addEventListener("change", runSearch);
    }
  });
  runSearch();
}
