/* Play Dog — comportamento comum a todas as páginas
   (ano do rodapé, menu do celular, sanfonas, mapa sob demanda e aviso de cookies) */
(function () {
  'use strict';

  // ano no rodapé
  var anoEl = document.getElementById('ano');
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  // menu do celular
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.classList.toggle('x', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(navLinks.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.classList.remove('x');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // sanfonas (aria-expanded sincronizado)
  Array.prototype.forEach.call(document.querySelectorAll('.acc-head'), function (btn) {
    var item = btn.parentElement;
    btn.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // mapa do Google só carrega quando a pessoa pede (não grava cookies antes)
  Array.prototype.forEach.call(document.querySelectorAll('[data-mapa]'), function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.map-card');
      if (!card) return;
      var f = document.createElement('iframe');
      f.title = 'Mapa da Play Dog';
      f.src = btn.getAttribute('data-mapa');
      f.style.cssText = 'width:100%;height:100%;border:0';
      f.setAttribute('loading', 'lazy');
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      f.setAttribute('allowfullscreen', '');
      card.innerHTML = '';
      card.appendChild(f);
    });
  });

  // consentimento de cookies (LGPD) + Consent Mode
  var KEY = 'playdog_consent';
  var banner = document.getElementById('cookieBanner');
  function apply(granted) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        'ad_storage': granted ? 'granted' : 'denied',
        'ad_user_data': granted ? 'granted' : 'denied',
        'ad_personalization': granted ? 'granted' : 'denied',
        'analytics_storage': granted ? 'granted' : 'denied'
      });
    }
  }
  var saved = null;
  try { saved = window.localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'granted') { apply(true); }
  else if (saved === 'denied') { apply(false); }
  else if (banner) { banner.classList.add('show'); }
  function choose(granted) {
    try { window.localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch (e) {}
    apply(granted);
    if (banner) banner.classList.remove('show');
  }
  var ok = document.getElementById('ckAccept');
  if (ok) ok.addEventListener('click', function () { choose(true); });
  var no = document.getElementById('ckReject');
  if (no) no.addEventListener('click', function () { choose(false); });
})();
