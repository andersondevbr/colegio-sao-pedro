/* carousel.js
   Carrossel com scroll-snap: arrastar no celular, setas no desktop */
(function () {
  'use strict';

  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel__track');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var bar = root.querySelector('.carousel__progress span');
    if (!track) return;

    var stepSize = function () {
      var card = track.firstElementChild;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    };

    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
      if (bar) {
        var visible = Math.min(track.clientWidth / track.scrollWidth, 1);
        bar.style.width = Math.max(visible, 0.1) * 100 + '%';
        bar.style.marginLeft = max > 0 ? (track.scrollLeft / max) * (1 - visible) * 100 + '%' : '0';
      }
    };

    var go = function (dir) {
      track.scrollBy({ left: dir * stepSize(), behavior: 'smooth' });
    };

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
