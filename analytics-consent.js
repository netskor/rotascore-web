/* Rotascore website analytics: load Google Analytics only after explicit consent. */
(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-NQ1BV7BSPY';
  var CONSENT_KEY = 'rs_analytics_consent';
  var RESTRICTED_AD_REGIONS = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
    'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH'
  ];
  var root = document.documentElement;
  var analyticsLoaded = false;
  var banner;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  // Queue consent defaults before any Google tag configuration. Advertising
  // consent stays denied where regional rules require it, while other regions
  // are not incorrectly reported as permanently denied. Analytics remains
  // denied everywhere until the visitor explicitly allows it.
  window.gtag('consent', 'default', {
    analytics_storage: 'denied'
  });
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    region: RESTRICTED_AD_REGIONS
  });

  if (!root.getAttribute('data-lang')) {
    root.setAttribute(
      'data-lang',
      (navigator.language || '').toLowerCase().indexOf('tr') === 0 ? 'tr' : 'en'
    );
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;

    analyticsLoaded = true;
    window['ga-disable-' + MEASUREMENT_ID] = false;
    window.gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    script.dataset.rotascoreAnalytics = 'true';
    document.head.appendChild(script);
  }

  function deleteAnalyticsCookies() {
    var cookies = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < cookies.length; i++) {
      var name = cookies[i].split('=')[0].trim();
      if (name !== '_ga' && name.indexOf('_ga_') !== 0) continue;
      document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
      document.cookie = name + '=; Max-Age=0; Path=/; Domain=.rotascore.com; SameSite=Lax';
    }
  }

  function disableAnalytics() {
    window['ga-disable-' + MEASUREMENT_ID] = true;
    if (window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    deleteAnalyticsCookies();
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    if (value === 'granted') loadAnalytics();
    else disableAnalytics();
    hideBanner();
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    var heading = banner.querySelector('.rs-consent__title');
    if (heading) heading.focus();
  }

  function buildConsentUi() {
    banner = document.createElement('section');
    banner.className = 'rs-consent';
    banner.hidden = true;
    banner.setAttribute('aria-labelledby', 'rs-consent-title');
    banner.innerHTML =
      '<div class="rs-consent__copy">' +
        '<h2 class="rs-consent__title" id="rs-consent-title" tabindex="-1">' +
          '<span data-l="tr">Analitik tercihiniz</span>' +
          '<span data-l="en">Your analytics preference</span>' +
        '</h2>' +
        '<p>' +
          '<span data-l="tr">Siteyi nasıl kullandığınızı anlamak için Google Analytics kullanmak istiyoruz. Etiket yalnızca izin verirseniz yüklenir. </span>' +
          '<span data-l="en">We would like to use Google Analytics to understand how you use the site. The tag loads only if you allow it. </span>' +
          '<a href="/privacy">' +
            '<span data-l="tr">Gizlilik politikası</span>' +
            '<span data-l="en">Privacy policy</span>' +
          '</a>' +
        '</p>' +
      '</div>' +
      '<div class="rs-consent__actions">' +
        '<button type="button" class="rs-consent__button rs-consent__button--necessary" data-consent="denied">' +
          '<span data-l="tr">Yalnızca gerekli</span>' +
          '<span data-l="en">Necessary only</span>' +
        '</button>' +
        '<button type="button" class="rs-consent__button rs-consent__button--accept" data-consent="granted">' +
          '<span data-l="tr">Analitiğe izin ver</span>' +
          '<span data-l="en">Allow analytics</span>' +
        '</button>' +
      '</div>';

    banner.addEventListener('click', function (event) {
      var button = event.target.closest('[data-consent]');
      if (button) setConsent(button.dataset.consent);
    });
    document.body.appendChild(banner);

    var footer = document.querySelector('.footer-links, .foot-links');
    if (footer) {
      var settings = document.createElement('button');
      settings.type = 'button';
      settings.className = 'rs-consent-settings';
      settings.innerHTML =
        '<span data-l="tr">Çerez tercihleri</span>' +
        '<span data-l="en">Cookie preferences</span>';
      settings.addEventListener('click', showBanner);
      footer.appendChild(settings);
    }

    if (!localStorage.getItem(CONSENT_KEY)) showBanner();
  }

  if (localStorage.getItem(CONSENT_KEY) === 'granted') loadAnalytics();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildConsentUi);
  } else {
    buildConsentUi();
  }
})();
