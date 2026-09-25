/* main.js
   Menu mobile, header ao rolar, animações de entrada, transição entre páginas, contador e filtro de projetos */
(function () {
  'use strict';

  /* Menu mobile ------------------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    window.matchMedia('(min-width: 980px)').addEventListener('change', function () {
      setOpen(false);
    });
  }

  /* Sombra no header ao rolar --------------------------------------------- */
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Animações de entrada --------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  var hasIO = 'IntersectionObserver' in window;

  if (hasIO) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Contador animado ------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');
  var fmt = new Intl.NumberFormat('pt-BR');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var render = function (el, value) {
    el.textContent = (el.dataset.prefix || '') + fmt.format(value) + (el.dataset.suffix || '');
  };

  var animate = function (el) {
    var target = Number(el.dataset.count);
    if (reduceMotion) { render(el, target); return; }
    var duration = 1600;
    var start = null;
    var step = function (t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / duration, 1);
      render(el, Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (hasIO && counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      if (!reduceMotion) render(el, 0);
      counterObserver.observe(el);
    });
  }

  /* Transição entre páginas ---------------------------------------------- */
  var root = document.documentElement;

  document.addEventListener('click', function (e) {
    if (reduceMotion || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    var url = new URL(link.href, window.location.href);
    if (url.protocol !== window.location.protocol || url.host !== window.location.host) return;
    if (!/(\.html|\/)$/.test(url.pathname)) return;
    if (url.pathname === window.location.pathname) return; // âncora na mesma página

    e.preventDefault();
    try { sessionStorage.setItem('csp-nav', '1'); } catch (err) { /* modo privado */ }
    root.classList.remove('page-enter');
    root.classList.add('page-leave');
    setTimeout(function () { window.location.href = url.href; }, 420);
  });

  // Voltar pelo navegador (cache do bfcache) não pode reabrir com a cortina fechada
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) root.classList.remove('page-leave', 'page-enter');
  });

  /* Ano atual no rodapé ---------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Filtro da página de projetos ------------------------------------------ */
  var filterBtns = document.querySelectorAll('[data-filter]');
  if (filterBtns.length) {
    var cards = document.querySelectorAll('[data-category]');
    var empty = document.querySelector('.projects-empty');

    var applyFilter = function (filter) {
      var shown = 0;
      filterBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
      });
      cards.forEach(function (card) {
        var match = filter === 'todos' || card.dataset.category.split(' ').indexOf(filter) !== -1;
        card.hidden = !match;
        if (match) {
          shown++;
          card.classList.add('is-visible');
        }
      });
      if (empty) empty.hidden = shown > 0;
    };

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { applyFilter(btn.dataset.filter); });
    });
  }
})();
