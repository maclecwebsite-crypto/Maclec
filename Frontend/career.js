const API_BASE = 'https://maclec-52zi.onrender.com/api';

const DEPT_LABELS = {
  engineering: 'Engineering',
  operations: 'Operations',
  business: 'Business & Strategy',
  research: 'R&D'
};

document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  const body = document.body;

  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('done');
    body.classList.remove('loading');
  }, 2200);
});

function timeAgo(dateString) {
  const posted = new Date(dateString);
  const days = Math.max(0, Math.floor((Date.now() - posted.getTime()) / 86400000));
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted 1 day ago';
  if (days < 14) return `Posted ${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `Posted ${weeks} week${weeks !== 1 ? 's' : ''} ago`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function buildJobCard(job) {
  const article = document.createElement('article');
  article.className = 'job-card';
  article.dataset.dept = job.department;
  article.dataset.keywords = job.keywords || '';

  const responsibilities = (job.responsibilities || []).map(r => `<li>${escapeHtml(r)}</li>`).join('');
  const requirements = (job.requirements || []).map(r => `<li>${escapeHtml(r)}</li>`).join('');

  article.innerHTML = `
    <div class="job-card-header">
      <div class="job-card-meta">
        <span class="job-card-dept">${escapeHtml(DEPT_LABELS[job.department] || job.department)}</span>
        <span class="job-card-location">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${escapeHtml(job.location)}
        </span>
        <span class="job-card-type">${escapeHtml(job.employmentType)}</span>
      </div>
      <h3 class="job-card-title">${escapeHtml(job.title)}</h3>
      <p class="job-card-summary">${escapeHtml(job.summary)}</p>
    </div>
    <div class="job-card-body">
      <div class="job-card-details">
        <div class="job-detail-col">
          <strong>Responsibilities</strong>
          <ul>${responsibilities}</ul>
        </div>
        <div class="job-detail-col">
          <strong>Requirements</strong>
          <ul>${requirements}</ul>
        </div>
      </div>
      <div class="job-card-footer">
        <span class="job-posted">${timeAgo(job.postedDate)}</span>
        <button class="btn-primary apply-btn" data-job="${escapeHtml(job.title)}" data-external-url="${escapeHtml(job.externalApplyUrl || '')}">Apply Now</button>
      </div>
    </div>
    <button class="job-card-toggle" aria-label="Expand job details">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
    </button>
  `;

  return article;
}

let allJobs = [];

const jobList = document.getElementById('jobList');
const jobCount = document.getElementById('jobCount');
const jobNoResults = document.getElementById('jobNoResults');
const searchInput = document.getElementById('jobSearchInput');
const filterBtns = document.querySelectorAll('.job-filter-btn');

function wireJobCard(card) {
  const header = card.querySelector('.job-card-header');
  const toggle = card.querySelector('.job-card-toggle');

  const toggleCard = () => {
    const isExpanded = card.classList.contains('expanded');
    document.querySelectorAll('.job-card').forEach(c => {
      if (c !== card) c.classList.remove('expanded');
    });
    card.classList.toggle('expanded', !isExpanded);
  };

  header.addEventListener('click', toggleCard);
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCard();
  });

card.querySelector('.apply-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const url = e.currentTarget.dataset.externalUrl;
  if (url) {
    window.open(url, '_blank', 'noopener');
  } else {
    openApplyModal(e.currentTarget.dataset.job);
  }
});
}

function updateJobCount() {
  const visible = document.querySelectorAll('.job-card:not(.hidden)');
  jobCount.innerHTML = `Showing <strong>${visible.length}</strong> open position${visible.length !== 1 ? 's' : ''}`;
  jobNoResults.style.display = visible.length === 0 ? 'block' : 'none';
  jobList.style.display = visible.length === 0 ? 'none' : 'flex';
}

function filterJobs() {
  const activeDept = document.querySelector('.job-filter-btn.active')?.dataset.dept || 'all';
  const searchTerm = searchInput.value.toLowerCase().trim();
  const searchWords = searchTerm.split(/\s+/).filter(Boolean);

  document.querySelectorAll('.job-card').forEach(card => {
    const dept = card.dataset.dept;
    const keywords = (card.dataset.keywords || '').toLowerCase();
    const title = card.querySelector('.job-card-title').textContent.toLowerCase();
    const summary = card.querySelector('.job-card-summary').textContent.toLowerCase();
    const location = card.querySelector('.job-card-location').textContent.toLowerCase();
    const responsibilities = card.querySelector('.job-detail-col:nth-child(1) ul')?.textContent.toLowerCase() || '';
    const requirements = card.querySelector('.job-detail-col:nth-child(2) ul')?.textContent.toLowerCase() || '';
    const employmentType = card.querySelector('.job-card-type')?.textContent.toLowerCase() || '';

    const haystack = [title, summary, keywords, location, responsibilities, requirements, employmentType].join(' ');

    const matchesDept = activeDept === 'all' || dept === activeDept;
    const matchesSearch = searchWords.length === 0 ||
      searchWords.every(word => haystack.includes(word));

    if (matchesDept && matchesSearch) {
      card.classList.remove('hidden');
    } else {
      card.classList.remove('expanded');
      card.classList.add('hidden');
    }
  });

  updateJobCount();
}

function renderJobs(jobs) {
  jobList.innerHTML = '';
  jobs.forEach(job => {
    const card = buildJobCard(job);
    jobList.appendChild(card);
    wireJobCard(card);
  });
  filterJobs();
}

async function loadJobs() {
  jobCount.textContent = 'Loading open positions…';
  try {
    const res = await fetch(`${API_BASE}/careers?status=open&limit=100`);
    if (!res.ok) throw new Error(`Request failed with ${res.status}`);
    const body = await res.json();
    // Backend wraps results as { success, message, data, meta } - unwrap it
    const rawJobs = Array.isArray(body) ? body : (body.data || []);
    // Map backend Career fields to the shape the job cards expect
    allJobs = rawJobs.map(job => ({
      id: job._id || job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      summary: job.summary || job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      keywords: job.keywords || (job.skills || []).join(', '),
      postedDate: job.postedDate,
      externalApplyUrl: job.externalApplyUrl
    }));
    renderJobs(allJobs);
  } catch (err) {
    console.error('Failed to load job postings', err);
    jobList.innerHTML = '';
    jobCount.textContent = '';
    jobNoResults.style.display = 'block';
    jobNoResults.querySelector('h3').textContent = 'Unable to load open positions';
    jobNoResults.querySelector('p').textContent = 'We could not reach the careers service. Please try again shortly or send us your resume directly.';
  }
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterJobs();
  });
});

let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(filterJobs, 200);
});

document.getElementById('clearSearchBtn').addEventListener('click', () => {
  searchInput.value = '';
  filterBtns.forEach(b => b.classList.remove('active'));
  filterBtns[0].classList.add('active');
  filterJobs();
});

const applyModal = document.getElementById('applyModal');
const applyModalTitle = document.getElementById('applyModalTitle');
const applyJobTitle = document.getElementById('applyJobTitle');
const applyForm = document.getElementById('applyForm');
const applySuccess = document.getElementById('applySuccess');
const fileInput = document.getElementById('applyResume');
const fileName = document.getElementById('fileName');
const photoInput = document.getElementById('applyPhoto');
const photoFileName = document.getElementById('photoFileName');

photoInput.addEventListener('change', () => {
  photoFileName.textContent = photoInput.files.length > 0 ? photoInput.files[0].name : '';
});
function openApplyModal(jobTitle) {
  applyModalTitle.textContent = jobTitle;
  applyJobTitle.value = jobTitle;
  applyModal.classList.add('open');
  applyForm.style.display = 'flex';
  applySuccess.style.display = 'none';
  document.body.style.overflow = 'hidden';
  applyForm.reset();
  fileName.textContent = '';
  photoFileName.textContent = '';   
  clearFormError();
}

// General application button lives in static HTML, not the dynamic job cards
document.querySelectorAll('.general-app-section .apply-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openApplyModal(btn.dataset.job);
  });
});

// Close modal
function closeApplyModal() {
  applyModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('applyModalClose').addEventListener('click', closeApplyModal);
document.getElementById('applyCancelBtn').addEventListener('click', closeApplyModal);
document.getElementById('applySuccessClose').addEventListener('click', closeApplyModal);

applyModal.addEventListener('click', (e) => {
  if (e.target === applyModal || e.target.classList.contains('apply-modal-backdrop')) {
    closeApplyModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && applyModal.classList.contains('open')) {
    closeApplyModal();
  }
});

// File upload display
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
  } else {
    fileName.textContent = '';
  }
});

let formErrorEl = null;
function showFormError(message) {
  if (!formErrorEl) {
    formErrorEl = document.createElement('p');
    formErrorEl.className = 'apply-form-error';
    formErrorEl.style.color = '#d9534f';
    formErrorEl.style.marginTop = '8px';
    applyForm.querySelector('.form-actions').insertAdjacentElement('beforebegin', formErrorEl);
  }
  formErrorEl.textContent = message;
}
function clearFormError() {
  if (formErrorEl) {
    formErrorEl.textContent = '';
  }
}

// Form submission
applyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearFormError();

  const submitBtn = document.getElementById('applySubmitBtn');
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    const formData = new FormData(applyForm);
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || 'Something went wrong while submitting your application.');
    }

    applyForm.style.display = 'none';
    applySuccess.style.display = 'block';
  } catch (err) {
    console.error('Application submission failed', err);
    showFormError(err.message || 'Something went wrong. Please try again.');
  } finally {
    submitBtn.textContent = 'Submit Application';
    submitBtn.disabled = false;
  }
});

const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
    mainNav.classList.toggle('mobile-open');
  });
}

loadJobs();
