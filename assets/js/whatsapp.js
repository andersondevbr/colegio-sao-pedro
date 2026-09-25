/* whatsapp.js
   Formulários que montam a mensagem e abrem o WhatsApp (sem backend).
   Cada campo com data-label entra na mensagem; data-intro no <form> é a primeira linha. */
(function () {
  'use strict';

  var PHONE = '5588996314230';
  var DEFAULT_MSG = 'Olá! Vim pelo site e quero informações sobre matrículas 2027 no Colégio São Pedro.';

  var waUrl = function (text) {
    return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text);
  };

  /* Máscara de telefone: (88) 99999-9999 */
  var maskPhone = function (value) {
    var d = value.replace(/\D/g, '').slice(0, 11);
    if (!d) return '';
    if (d.length <= 2) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  };

  document.querySelectorAll('input[data-mask="phone"]').forEach(function (input) {
    input.addEventListener('input', function () { input.value = maskPhone(input.value); });
  });

  var isInvalid = function (field) {
    var value = field.value.trim();
    if (field.required && !value) return true;
    if (field.dataset.mask === 'phone' && value && value.replace(/\D/g, '').length < 10) return true;
    return false;
  };

  document.querySelectorAll('form[data-wa-form]').forEach(function (form) {
    var error = form.querySelector('.form__error');
    var fields = form.querySelectorAll('[data-label]');

    fields.forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true' && !isInvalid(field)) {
          field.setAttribute('aria-invalid', 'false');
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (field) {
        var bad = isInvalid(field);
        field.setAttribute('aria-invalid', String(bad));
        if (bad && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        if (error) {
          error.textContent = 'Preencha os campos destacados para continuar.';
          error.hidden = false;
        }
        firstInvalid.focus();
        return;
      }
      if (error) error.hidden = true;

      var lines = [form.dataset.intro || DEFAULT_MSG, ''];
      fields.forEach(function (field) {
        var value = field.value.trim();
        if (value) lines.push('*' + field.dataset.label + ':* ' + value);
      });

      var url = waUrl(lines.join('\n'));
      var win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
    });
  });
})();
