/* Landing-only behavior: restrained reveals, localized metadata and store routing. */
(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.querySelector('[data-header]');
  var mobileDownload = document.querySelector('[data-mobile-download]');
  var smartStore = document.querySelector('[data-smart-store]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var APP_STORE_URL = 'https://apps.apple.com/app/id6779008135';
  var PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rotascore.app';

  function currentLanguage() {
    return root.getAttribute('data-lang') === 'en' ? 'en' : 'tr';
  }

  function updateMetadata() {
    var english = currentLanguage() === 'en';
    document.title = english
      ? 'Rotascore — You\'re at the Heart of the Game'
      : 'Rotascore — Sahanın Merkezinde Sen Varsın';
    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = english
        ? 'Follow live scores, instant match notifications, lineups, standings and detailed statistics from nearly 2,000 leagues and tournaments worldwide.'
        : 'Dünyanın dört bir yanındaki 2.000\'e yakın lig ve turnuvadan canlı skorları, anlık maç bildirimlerini, kadroları, puan durumlarını ve ayrıntılı istatistikleri gör.';
    }
  }

  function routeMobileStore() {
    if (!smartStore) return;
    var agent = navigator.userAgent || '';
    var isAndroid = /Android/i.test(agent);
    smartStore.href = isAndroid ? PLAY_STORE_URL : APP_STORE_URL;
    smartStore.setAttribute('data-store-target', isAndroid ? 'google-play' : 'app-store');
  }

  function updateScrollState() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 18);
    if (mobileDownload) mobileDownload.classList.toggle('is-visible', y > 420);
  }

  function observeReveals() {
    var elements = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (var i = 0; i < elements.length; i++) elements[i].classList.add('is-visible');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.classList.add('is-visible');
        observer.unobserve(entries[i].target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var i = 0; i < elements.length; i++) observer.observe(elements[i]);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateScrollState();
      ticking = false;
    });
  }, { passive: true });

  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      if (records[i].attributeName === 'data-lang') updateMetadata();
    }
  }).observe(root, { attributes: true });

  updateMetadata();
  routeMobileStore();
  updateScrollState();
  observeReveals();
})();
