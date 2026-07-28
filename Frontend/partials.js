(function () {
  var HEADER_HTML =
    '<div class="maclec-header-inner">' +
      '<a style="width: 18%;" class="maclec-logo" href="index.html">' +
        '<img style="width: 100%;" src="img/logo.png" alt="MACLEC Logo">' +
      '</a>' +
      '<nav class="maclec-main-nav" aria-label="Primary">' +
      '<a href="index.html">Home</a>' +  
      '<a href="about.html">About</a>' +
        '<a href="technology.html">Technology</a>' +
        '<a href="atlas.html">Potential Calculator</a>' +
        '<a href="gallery.html">Gallery</a>' +
        '<a href="career.html">Careers</a>' +
        '<a href="contact.html">Contact</a>' +
      '</nav>' +
      '<a class="maclec-btn-contact-nav" href="/contact.html">' +
        'Contact Us' +
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18l6-6-6-6"/></svg>' +
      '</a>' +
      '<button class="maclec-nav-toggle" aria-label="Open menu" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</div>';

  var FOOTER_HTML =
    '<div class="maclec-footer-inner">' +
      '<div class="maclec-footer-brand">' +
        '<img src="img/logo.png" alt="MACLEC" class="maclec-footer-logo">' +
      '</div>' +
      '<div class="maclec-footer-links">' +
        '<div class="maclec-footer-col">' +
          '<strong>Company</strong>' +
          '<a href="about.html">About</a>' +
          '<a href="technology.html">Technology</a>' +
          '<a href="gallery.html">Gallery</a>' +
        '</div>' +
        '<div class="maclec-footer-col">' +
          '<strong>Resources</strong>' +
          '<a href="atlas.html">Potential Calculator</a>' +
          '<a href="index.html#knowledge">Knowledge Centre</a>' +
          '<a href="#">Investor Desk</a>' +
        '</div>' +
        '<div class="maclec-footer-col">' +
          '<strong>Connect</strong>' +
          '<a href="contact.html">Contact</a>' +
          '<a href="career.html">Careers</a>' +
          '<a href="#">Media</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="maclec-footer-bottom">' +
      '<p>&copy; 2026 MACLEC. All rights reserved.</p>' +
    '</div>';

  var headerRoot = document.getElementById('site-header-root');
  if (headerRoot && !headerRoot.hasChildNodes()) {
    headerRoot.classList.add('maclec-site-header');
    if (window.SITE_HEADER_SOLID) headerRoot.classList.add('maclec-site-header--solid');
    headerRoot.innerHTML = HEADER_HTML;
  }

  var footerRoot = document.getElementById('site-footer-root');
  if (footerRoot && !footerRoot.hasChildNodes()) {
    footerRoot.classList.add('maclec-site-footer');
    footerRoot.innerHTML = FOOTER_HTML;
  }
})();

(function () {
  if (window.__maclecNavInit) return;
  window.__maclecNavInit = true;

  function init() {
    var header = document.querySelector('.maclec-site-header');
    var toggle = document.querySelector('.maclec-nav-toggle');
    var nav = document.querySelector('.maclec-main-nav');
    var navLinks = nav ? nav.querySelectorAll('a') : [];

    if (!toggle || !nav) return;

    function onScroll() {
      if (!header) return;
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    function toggleMenu(e) {
      if (e) e.stopPropagation();
      var isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toggle.addEventListener('click', toggleMenu);

    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();