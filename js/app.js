/* =========================================================
   BATALLA DE TALENTOS — GALA DE PREMIACION 2026
   app.js — logica de interfaz (sin dependencias externas)
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. SELECTOR DE IDIOMA (ES / EN)
     Cambia el atributo lang del <html>; el CSS se encarga
     de mostrar/ocultar los bloques [data-es] / [data-en].
     --------------------------------------------------------- */
  function setLanguage(lang) {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-active-lang", lang);

    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.lang === lang);
      btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
    });

    // Actualiza textos que dependen del idioma vía atributo data-i18n-title
    document.title =
      lang === "en"
        ? "Talent Battle – 2026 Awards Gala | SENA"
        : "Batalla de Talentos – Gala de Premiación 2026 | SENA";

    var searchInput = document.querySelector("#glossarySearch");
    if (searchInput) {
      var ph = searchInput.getAttribute("data-placeholder-" + lang);
      if (ph) searchInput.setAttribute("placeholder", ph);
    }

    // Refresca el contador del glosario con el idioma activo
    if (typeof window.__bt_refreshGlossaryCount === "function") {
      window.__bt_refreshGlossaryCount();
    }

    try {
      window.__bt_lang = lang; // estado en memoria, sin storage persistente del navegador
    } catch (e) {
      /* noop */
    }
  }

  function initLanguageToggle() {
    var buttons = document.querySelectorAll(".lang-toggle button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLanguage(btn.dataset.lang);
      });
    });
    // Idioma inicial: español
    setLanguage("es");
  }

  /* ---------------------------------------------------------
     2. MENU DE NAVEGACION MOVIL
     --------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;

    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Cierra el menu al elegir una sección (mejor experiencia en móvil)
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     3. RESALTAR ENLACE ACTIVO SEGUN SECCION VISIBLE
     --------------------------------------------------------- */
  function initScrollSpy() {
    var sections = document.querySelectorAll("main section[id]");
    var navLinks = document.querySelectorAll(".nav-links a");
    if (!sections.length || !navLinks.length) return;

    var map = {};
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").replace("#", "");
      map[id] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = map[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------------------------------------------------
     4. GALERIA: FILTROS POR CATEGORIA
     --------------------------------------------------------- */
  function initGalleryFilters() {
    var filterBar = document.querySelector(".gallery-filters");
    var items = document.querySelectorAll(".gallery-item");
    if (!filterBar || !items.length) return;

    filterBar.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBar.querySelectorAll("button").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");

        var filter = btn.dataset.filter;
        items.forEach(function (item) {
          var matches = filter === "all" || item.dataset.cat === filter;
          item.hidden = !matches;
        });
      });
    });
  }

  /* ---------------------------------------------------------
     5. LIGHTBOX DE GALERIA
     --------------------------------------------------------- */
  function initLightbox() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
    var lightbox = document.querySelector(".lightbox");
    if (!items.length || !lightbox) return;

    var imgEl = lightbox.querySelector("img");
    var capEs = lightbox.querySelector(".lightbox-cap [data-es]");
    var capEn = lightbox.querySelector(".lightbox-cap [data-en]");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtn = lightbox.querySelector(".lightbox-prev");
    var nextBtn = lightbox.querySelector(".lightbox-next");

    var visibleItems = function () {
      return items.filter(function (i) { return !i.hidden; });
    };

    var currentIndex = 0;

    function openAt(index) {
      var list = visibleItems();
      if (!list.length) return;
      currentIndex = (index + list.length) % list.length;
      var item = list[currentIndex];
      var img = item.querySelector("img");
      imgEl.src = img.src;
      imgEl.alt = img.alt;
      if (capEs) capEs.textContent = item.dataset.capEs || "";
      if (capEn) capEn.textContent = item.dataset.capEn || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      imgEl.src = "";
    }

    function step(delta) {
      var list = visibleItems();
      var item = list[currentIndex];
      var globalIndex = items.indexOf(item);
      // Buscar el siguiente/anterior visible
      var newIndex = currentIndex + delta;
      openAt(newIndex);
    }

    items.forEach(function (item, idx) {
      item.addEventListener("click", function () {
        var list = visibleItems();
        var localIndex = list.indexOf(item);
        openAt(localIndex);
      });
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "button");
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          var list = visibleItems();
          openAt(list.indexOf(item));
        }
      });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { step(-1); });
    nextBtn.addEventListener("click", function () { step(1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }

  /* ---------------------------------------------------------
     6. GLOSARIO: BUSCADOR EN VIVO
     --------------------------------------------------------- */
  function initGlossarySearch() {
    var input = document.querySelector("#glossarySearch");
    var rows = document.querySelectorAll(".glossary-table tbody tr");
    var countEl = document.querySelector("#glossaryCount");
    if (!input || !rows.length) return;

    function normalize(str) {
      return (str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    function applyFilter() {
      var q = normalize(input.value.trim());
      var visibleCount = 0;
      rows.forEach(function (row) {
        var haystack = normalize(row.textContent);
        var match = haystack.indexOf(q) !== -1;
        row.hidden = !match;
        if (match) visibleCount++;
      });
      if (countEl) {
        var lang = document.documentElement.getAttribute("lang") || "es";
        countEl.textContent =
          lang === "en"
            ? visibleCount + " of " + rows.length + " terms"
            : visibleCount + " de " + rows.length + " términos";
      }
    }

    input.addEventListener("input", applyFilter);
    applyFilter();
    window.__bt_refreshGlossaryCount = applyFilter;

    // Acordeón en móvil para mostrar definición larga
    rows.forEach(function (row) {
      row.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 760px)").matches) {
          row.classList.toggle("gl-open");
        }
      });
    });
  }

  /* ---------------------------------------------------------
     7. RELOJ DEL "ESTADO DE BUILD" EN LA STATUSBAR (detalle)
     --------------------------------------------------------- */
  function initStatusClock() {
    var el = document.querySelector("#statusClock");
    if (!el) return;
    function tick() {
      var now = new Date();
      var hh = String(now.getHours()).padStart(2, "0");
      var mm = String(now.getMinutes()).padStart(2, "0");
      var ss = String(now.getSeconds()).padStart(2, "0");
      el.textContent = hh + ":" + mm + ":" + ss;
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initScrollSpy();
    initGalleryFilters();
    initLightbox();
    initGlossarySearch();
    initStatusClock();
    initLanguageToggle();
  });
})();
