/* ===================================================================
   MACLEC — Shared layout loader

   Loads partials/navbar.html and partials/footer.html and drops them
   into the placeholders every page already has:

     <header id="site-header-root"></header>
     <footer id="site-footer-root"></footer>

   To change the navbar or footer for the WHOLE SITE, edit
   partials/navbar.html or partials/footer.html — this file only
   contains the loading logic, no markup.

   Requires the site to be served over http(s) (fetch() is blocked by
   the browser on file:// pages). Any static server works, e.g. from
   the Frontend/ folder:
     npx serve .
     python3 -m http.server 5500

   Optional per-page flag (set BEFORE layout.js loads):
     <script>window.SITE_HEADER_SOLID = true;</script>
   Adds the "site-header--solid" modifier class (opaque header
   background) for pages without a hero image behind the header.
   =================================================================== */

(function () {
  var NAVBAR_URL = 'partials/navbar.html';
  var FOOTER_URL = 'partials/footer.html';

  function loadPartial(url, placeholderId) {
    var placeholder = document.getElementById(placeholderId);
    if (!placeholder) return Promise.resolve(); // page doesn't use this partial

    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error(url + ' responded with ' + res.status);
        return res.text();
      })
      .then(function (html) {
        placeholder.outerHTML = html;
      })
      .catch(function (err) {
        console.error('[layout.js] Failed to load ' + url + ':', err);
      });
  }

  // Mobile nav toggle — was previously copy-pasted into script.js,
  // gallery.js, career.js and contact.js. Now lives in one place and
  // runs once the navbar has actually been injected.
  function initMobileNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('mobile-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 1100 && nav.classList.contains('mobile-open')) {
          nav.classList.remove('mobile-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  function applyHeaderSolidVariant() {
    if (!window.SITE_HEADER_SOLID) return;
    var header = document.getElementById('site-header-root');
    if (header) header.classList.add('site-header--solid');
  }

  document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
      loadPartial(NAVBAR_URL, 'site-header-root'),
      loadPartial(FOOTER_URL, 'site-footer-root')
    ]).then(function () {
      applyHeaderSolidVariant();
      initMobileNav();
      // Other scripts can wait for this if they need the navbar/footer
      // to exist first, e.g.: document.addEventListener('layoutReady', ...)
      document.dispatchEvent(new Event('layoutReady'));
    });
  });
})();
