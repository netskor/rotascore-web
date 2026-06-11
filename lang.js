/* Rotascore — site language toggle (TR/EN), no build step, no FOUC.
   Loaded synchronously in <head>: sets data-lang on <html> before body paints.
   Builds a TR/EN toggle (into the header nav if present, else floating
   top-right) on DOM ready. Choice persists in localStorage. */
(function () {
  var KEY = 'rs_lang';
  var lang =
    localStorage.getItem(KEY) ||
    ((navigator.language || '').toLowerCase().indexOf('tr') === 0 ? 'tr' : 'en');
  document.documentElement.setAttribute('data-lang', lang);

  function apply(code) {
    lang = code;
    localStorage.setItem(KEY, code);
    document.documentElement.setAttribute('data-lang', code);
    document.documentElement.lang = code;
    var btns = document.querySelectorAll('.lang-toggle button');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute(
        'aria-pressed',
        String(btns[i].dataset.code === code)
      );
    }
  }

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'lang-toggle';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Dil / Language');
    ['tr', 'en'].forEach(function (code) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.code = code;
      b.textContent = code.toUpperCase();
      b.setAttribute('aria-pressed', String(code === lang));
      b.addEventListener('click', function () {
        apply(code);
      });
      wrap.appendChild(b);
    });
    var nav = document.querySelector('.site-header nav');
    if (nav) {
      nav.insertBefore(wrap, nav.firstChild);
    } else {
      wrap.classList.add('lang-toggle-float');
      document.body.appendChild(wrap);
    }
    document.documentElement.lang = lang;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
