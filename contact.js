/* ===== LOADING SCREEN ===== */
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  const body = document.body;

  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('done');
    body.classList.remove('loading');
  }, 2200);
});

/* ===== CONTACT FORM ===== */
const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Simulate submission
  contactSubmitBtn.textContent = 'Sending...';
  contactSubmitBtn.disabled = true;

  setTimeout(() => {
    contactForm.style.display = 'none';
    contactSuccess.style.display = 'block';
    contactSubmitBtn.textContent = 'Send Message';
    contactSubmitBtn.disabled = false;
  }, 1500);
});

// Send another message
document.getElementById('contactSuccessClose').addEventListener('click', () => {
  contactForm.reset();
  contactForm.style.display = 'flex';
  contactSuccess.style.display = 'none';
});

/* ===== FAQ ACCORDION ===== */
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // Close all others
    faqItems.forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Toggle current
    if (!isOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ===== MOBILE NAV ===== */
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    mainNav.classList.toggle('mobile-open');
  });
}