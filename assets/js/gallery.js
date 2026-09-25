/* gallery.js
   Lightbox para galerias (formaturas, eventos, estrutura).
   Uso: <button class="gallery__item" data-gallery="nome" data-caption="Legenda"> <img ...> </button>
   Para foto em alta, use <a class="gallery__item" href="foto-grande.webp" data-gallery="nome">. */
(function () {
  'use strict';

  var items = document.querySelectorAll('[data-gallery]');
  if (!items.length) return;

  var groups = {};
  items.forEach(function (item) {
    var g = item.dataset.gallery;
    (groups[g] = groups[g] || []).push(item);
  });

  var icon = function (d) {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  };

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Galeria de fotos');
  lb.innerHTML =
    '<button type="button" class="lightbox__btn lightbox__close" aria-label="Fechar galeria">' + icon('M18 6 6 18M6 6l12 12') + '</button>' +
    '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Foto anterior">' + icon('M15 18l-6-6 6-6') + '</button>' +
    '<button type="button" class="lightbox__btn lightbox__next" aria-label="Próxima foto">' + icon('M9 18l6-6-6-6') + '</button>' +
    '<figure class="lightbox__stage"><div class="lightbox__media"></div><figcaption class="lightbox__caption" aria-live="polite"></figcaption></figure>';
  document.body.appendChild(lb);

  var closeBtn = lb.querySelector('.lightbox__close');
  var prevBtn = lb.querySelector('.lightbox__prev');
  var nextBtn = lb.querySelector('.lightbox__next');
  var mediaBox = lb.querySelector('.lightbox__media');
  var caption = lb.querySelector('.lightbox__caption');

  var list = [];
  var index = 0;
  var lastFocus = null;

  var show = function (i) {
    index = (i + list.length) % list.length;
    var item = list[index];
    var media = item.querySelector('img, .ph');
    var clone;

    if (item.tagName === 'A' && item.getAttribute('href') && item.getAttribute('href') !== '#') {
      clone = document.createElement('img');
      clone.src = item.getAttribute('href');
      clone.alt = media ? (media.getAttribute('alt') || '') : '';
      clone.className = 'photo';
    } else {
      clone = media.cloneNode(true);
    }
    mediaBox.replaceChildren(clone);
    caption.textContent = item.dataset.caption ||
      (media && (media.getAttribute('alt') || media.getAttribute('aria-label'))) || '';

    var multiple = list.length > 1;
    prevBtn.hidden = !multiple;
    nextBtn.hidden = !multiple;
  };

  var open = function (group, i) {
    list = groups[group];
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  var close = function () {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  items.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var g = item.dataset.gallery;
      open(g, groups[g].indexOf(item));
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(index - 1); });
  nextBtn.addEventListener('click', function () { show(index + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Tab') {
      var focusables = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
      var pos = focusables.indexOf(document.activeElement);
      e.preventDefault();
      var nextPos = e.shiftKey ? pos - 1 : pos + 1;
      focusables[(nextPos + focusables.length) % focusables.length].focus();
    }
  });

  /* Deslizar no celular */
  var startX = null;
  lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50 && list.length > 1) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
