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
const API_BASE = 'https://maclec-52zi.onrender.com/api';

const contactForm = document.getElementById('contactForm');
const contactSuccess = document.getElementById('contactSuccess');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');

let contactErrorEl = null;
function showContactError(message) {
  if (!contactErrorEl) {
    contactErrorEl = document.createElement('p');
    contactErrorEl.className = 'contact-form-error';
    contactErrorEl.style.color = '#d9534f';
    contactErrorEl.style.marginTop = '8px';
    contactForm.querySelector('.form-actions').insertAdjacentElement('beforebegin', contactErrorEl);
  }
  contactErrorEl.textContent = message;
}
function clearContactError() {
  if (contactErrorEl) contactErrorEl.textContent = '';
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearContactError();

  contactSubmitBtn.textContent = 'Sending...';
  contactSubmitBtn.disabled = true;

  const formData = new FormData(contactForm);
  const firstName = (formData.get('first_name') || '').toString().trim();
  const lastName = (formData.get('last_name') || '').toString().trim();

  const payload = {
    name: `${firstName} ${lastName}`.trim(),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    company: formData.get('organization') || undefined,
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  try {
    const res = await fetch(`${API_BASE}/contact-queries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || 'Something went wrong while sending your message.');
    }

    contactForm.style.display = 'none';
    contactSuccess.style.display = 'block';
  } catch (err) {
    console.error('Contact form submission failed', err);
    showContactError(err.message || 'Something went wrong. Please try again.');
  } finally {
    contactSubmitBtn.textContent = 'Send Message';
    contactSubmitBtn.disabled = false;
  }
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