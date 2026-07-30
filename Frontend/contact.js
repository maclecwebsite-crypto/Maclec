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

// Inject minimal styles for validation + spinner so this works
// even if contact.css hasn't been updated yet.
(function injectContactFormStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .form-group.has-error input,
    .form-group.has-error select,
    .form-group.has-error textarea {
      border-color: #d9534f !important;
      box-shadow: 0 0 0 1px rgba(217, 83, 79, 0.25);
    }
    .field-error {
      display: block;
      color: #d9534f;
      font-size: 0.8rem;
      margin-top: 4px;
      line-height: 1.3;
    }
    .contact-form-error {
      color: #d9534f;
      background: rgba(217, 83, 79, 0.08);
      border: 1px solid rgba(217, 83, 79, 0.3);
      border-radius: 6px;
      padding: 10px 12px;
      margin-top: 8px;
      font-size: 0.9rem;
    }
    .btn-primary[disabled] {
      opacity: 0.75;
      cursor: not-allowed;
    }
    .btn-spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #fff;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: -2px;
      animation: btn-spin 0.7s linear infinite;
    }
    @keyframes btn-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
})();

// Fields we validate, with their rules and human-readable labels
const fieldRules = {
  first_name: {
    el: () => document.getElementById('contactFirstName'),
    label: 'First name',
    validate: (v) => (v.trim() ? null : 'Please enter your first name.'),
  },
  last_name: {
    el: () => document.getElementById('contactLastName'),
    label: 'Last name',
    validate: (v) => (v.trim() ? null : 'Please enter your last name.'),
  },
  email: {
    el: () => document.getElementById('contactEmail'),
    label: 'Email',
    validate: (v) => {
      const value = v.trim();
      if (!value) return 'Please enter your email address.';
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) return 'Please enter a valid email address.';
      return null;
    },
  },
  phone: {
    el: () => document.getElementById('contactPhone'),
    label: 'Phone',
    validate: (v) => {
      const value = v.trim();
      if (!value) return null; // optional field
      const phonePattern = /^[0-9+\-()\s]{7,20}$/;
      if (!phonePattern.test(value)) return 'Please enter a valid phone number.';
      return null;
    },
  },
  subject: {
    el: () => document.getElementById('contactSubject'),
    label: 'Subject',
    validate: (v) => (v ? null : 'Please select a subject.'),
  },
  message: {
    el: () => document.getElementById('contactMessage'),
    label: 'Message',
    validate: (v) => (v.trim() ? null : 'Please enter a message.'),
  },
};

function getFieldError(fieldKey) {
  const group = fieldRules[fieldKey].el().closest('.form-group');
  return group ? group.querySelector('.field-error') : null;
}

function setFieldError(fieldKey, message) {
  const el = fieldRules[fieldKey].el();
  const group = el.closest('.form-group');
  if (!group) return;

  group.classList.add('has-error');
  el.setAttribute('aria-invalid', 'true');

  let errorEl = group.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    group.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function clearFieldError(fieldKey) {
  const el = fieldRules[fieldKey].el();
  const group = el.closest('.form-group');
  if (!group) return;

  group.classList.remove('has-error');
  el.removeAttribute('aria-invalid');

  const errorEl = group.querySelector('.field-error');
  if (errorEl) errorEl.remove();
}

function validateField(fieldKey) {
  const el = fieldRules[fieldKey].el();
  const error = fieldRules[fieldKey].validate(el.value || '');
  if (error) {
    setFieldError(fieldKey, error);
    return false;
  }
  clearFieldError(fieldKey);
  return true;
}

function validateForm() {
  let isValid = true;
  let firstInvalidEl = null;

  Object.keys(fieldRules).forEach((fieldKey) => {
    const fieldIsValid = validateField(fieldKey);
    if (!fieldIsValid) {
      isValid = false;
      if (!firstInvalidEl) firstInvalidEl = fieldRules[fieldKey].el();
    }
  });

  if (firstInvalidEl) {
    firstInvalidEl.focus();
  }

  return isValid;
}

// Validate on blur, and clear the error as soon as the user starts fixing it
Object.keys(fieldRules).forEach((fieldKey) => {
  const el = fieldRules[fieldKey].el();
  if (!el) return;

  el.addEventListener('blur', () => validateField(fieldKey));
  el.addEventListener('input', () => {
    if (el.closest('.form-group').classList.contains('has-error')) {
      validateField(fieldKey);
    }
  });
  el.addEventListener('change', () => {
    if (el.closest('.form-group').classList.contains('has-error')) {
      validateField(fieldKey);
    }
  });
});

let contactErrorEl = null;
function showContactError(message) {
  if (!contactErrorEl) {
    contactErrorEl = document.createElement('p');
    contactErrorEl.className = 'contact-form-error';
    contactForm.querySelector('.form-actions').insertAdjacentElement('beforebegin', contactErrorEl);
  }
  contactErrorEl.textContent = message;
  contactErrorEl.style.display = 'block';
}
function clearContactError() {
  if (contactErrorEl) {
    contactErrorEl.textContent = '';
    contactErrorEl.style.display = 'none';
  }
}

function setSubmitLoading(isLoading) {
  if (isLoading) {
    contactSubmitBtn.dataset.originalText = contactSubmitBtn.textContent;
    contactSubmitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span>Sending...';
    contactSubmitBtn.disabled = true;
    contactSubmitBtn.setAttribute('aria-busy', 'true');
  } else {
    contactSubmitBtn.textContent = contactSubmitBtn.dataset.originalText || 'Submit';
    contactSubmitBtn.disabled = false;
    contactSubmitBtn.removeAttribute('aria-busy');
  }
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearContactError();

  if (!validateForm()) {
    showContactError('Please fix the highlighted fields above and try again.');
    return;
  }

  setSubmitLoading(true);

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
      throw new Error(body.message || 'Something went wrong while sending your message. Please try again.');
    }

    contactForm.style.display = 'none';
    contactSuccess.style.display = 'block';
  } catch (err) {
    console.error('Contact form submission failed', err);
    showContactError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setSubmitLoading(false);
  }
});

// Send another message
document.getElementById('contactSuccessClose').addEventListener('click', () => {
  contactForm.reset();
  Object.keys(fieldRules).forEach(clearFieldError);
  clearContactError();
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


/* Channel cards entrance animation */
const channelCards = document.querySelectorAll('.channel-card');
const channelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      channelObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
channelCards.forEach(card => channelObserver.observe(card));