
(function () {
  var HEADER_HTML =
    '<div class="header-inner">' +
      '<a style="width: 18%;" class="logo" href="index.html">' +
        '<img style="width: 100%;" src="img/logo.png" alt="MACLEC Logo">' +
      '</a>' +
      '<nav class="main-nav" aria-label="Primary">' +
        '<a href="about.html">About</a>' +
        '<a href="technology.html">Technology</a>' +
        '<a href="atlas.html">Potential Calculator</a>' +
        '<a href="gallery.html">Gallery</a>' +
        '<a href="career.html">Careers</a>' +
        '<a href="contact.html">Contact</a>' +
      '</nav>' +
      '<a class="btn-contact-nav" href="/contact.html">' +
        'Contact Us' +
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 18l6-6-6-6"/></svg>' +
      '</a>' +
      '<button class="nav-toggle" aria-label="Open menu" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</div>';

  var FOOTER_HTML =
    '<div class="footer-inner">' +
      '<div class="footer-brand">' +
        '<img src="img/logo.png" alt="MACLEC" class="footer-logo">' +
      '</div>' +
      '<div class="footer-links">' +
        '<div class="footer-col">' +
          '<strong>Company</strong>' +
          '<a href="about.html">About</a>' +
          '<a href="technology.html">Technology</a>' +
          '<a href="gallery.html">Gallery</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<strong>Resources</strong>' +
          '<a href="atlas.html">Potential Calculator</a>' +
          '<a href="index.html#knowledge">Knowledge Centre</a>' +
          '<a href="#">Investor Desk</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<strong>Connect</strong>' +
          '<a href="contact.html">Contact</a>' +
          '<a href="career.html">Careers</a>' +
          '<a href="#">Media</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="footer-bottom">' +
      '<p>&copy; 2026 MACLEC. All rights reserved.</p>' +
    '</div>';

  var headerRoot = document.getElementById('site-header-root');
  if (headerRoot && !headerRoot.hasChildNodes()) {
    headerRoot.classList.add('site-header');
    if (window.SITE_HEADER_SOLID) headerRoot.classList.add('site-header--solid');
    headerRoot.innerHTML = HEADER_HTML;
  }

  var footerRoot = document.getElementById('site-footer-root');
  if (footerRoot && !footerRoot.hasChildNodes()) {
    footerRoot.classList.add('site-footer');
    footerRoot.innerHTML = FOOTER_HTML;
  }
})();
