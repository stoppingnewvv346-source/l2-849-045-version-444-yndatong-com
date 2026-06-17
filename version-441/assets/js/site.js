(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;

        function activateSlide(index) {
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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activateSlide(Number(dot.getAttribute("data-slide")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activateSlide(current + 1);
            }, 5200);
        }

        var grid = document.querySelector("[data-movie-grid]");
        var searchInput = document.querySelector(".movie-search");
        var typeFilter = document.querySelector(".movie-type-filter");
        var categoryFilter = document.querySelector(".movie-category-filter");
        var sortSelect = document.querySelector(".movie-sort");

        function filterCards() {
            if (!grid) {
                return;
            }
            var query = normalize(searchInput && searchInput.value);
            var typeValue = typeFilter ? typeFilter.value : "all";
            var categoryValue = categoryFilter ? categoryFilter.value : "all";
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title"));
                var type = card.getAttribute("data-type") || "";
                var category = card.querySelector(".corner-badge") ? card.querySelector(".corner-badge").textContent.trim() : "";
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedType = typeValue === "all" || type === typeValue;
                var matchedCategory = categoryValue === "all" || category === categoryValue;
                card.hidden = !(matchedQuery && matchedType && matchedCategory);
            });
        }

        function sortCards() {
            if (!grid || !sortSelect) {
                return;
            }
            var value = sortSelect.value;
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            cards.sort(function (a, b) {
                if (value === "newest") {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                }
                if (value === "title") {
                    return (a.querySelector("h3") ? a.querySelector("h3").textContent : "").localeCompare(b.querySelector("h3") ? b.querySelector("h3").textContent : "", "zh-Hans-CN");
                }
                return 0;
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
            filterCards();
        }

        [searchInput, typeFilter, categoryFilter].forEach(function (element) {
            if (element) {
                element.addEventListener("input", filterCards);
                element.addEventListener("change", filterCards);
            }
        });

        if (sortSelect) {
            sortSelect.addEventListener("change", sortCards);
        }
    });
})();
