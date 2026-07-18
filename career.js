document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  const body = document.body;

  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('done');
    body.classList.remove('loading');
  }, 2200);
});

const jobCards = document.querySelectorAll('.job-card');

jobCards.forEach(card => {
  const header = card.querySelector('.job-card-header');
  const toggle = card.querySelector('.job-card-toggle');

  const toggleCard = () => {
    const isExpanded = card.classList.contains('expanded');

    // Collapse all other cards
    jobCards.forEach(c => {
      if (c !== card) c.classList.remove('expanded');
    });

    // Toggle current
    card.classList.toggle('expanded', !isExpanded);
  };

  header.addEventListener('click', toggleCard);
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCard();
  });
});

const filterBtns = document.querySelectorAll('.job-filter-btn');
const jobList = document.getElementById('jobList');
const jobCount = document.getElementById('jobCount');
const jobNoResults = document.getElementById('jobNoResults');
const searchInput = document.getElementById('jobSearchInput');

function updateJobCount() {
  const visible = document.querySelectorAll('.job-card:not(.hidden)');
  jobCount.innerHTML = `Showing <strong>${visible.length}</strong> open position${visible.length !== 1 ? 's' : ''}`;
  jobNoResults.style.display = visible.length === 0 ? 'block' : 'none';
  jobList.style.display = visible.length === 0 ? 'none' : 'flex';
}

function filterJobs() {
  const activeDept = document.querySelector('.job-filter-btn.active')?.dataset.dept || 'all';
  const searchTerm = searchInput.value.toLowerCase().trim();

  jobCards.forEach(card => {
    const dept = card.dataset.dept;
    const keywords = card.dataset.keywords || '';
    const title = card.querySelector('.job-card-title').textContent.toLowerCase();
    const summary = card.querySelector('.job-card-summary').textContent.toLowerCase();
    const location = card.querySelector('.job-card-location').textContent.toLowerCase();

    const matchesDept = activeDept === 'all' || dept === activeDept;
    const matchesSearch = !searchTerm ||
      title.includes(searchTerm) ||
      summary.includes(searchTerm) ||
      keywords.includes(searchTerm) ||
      location.includes(searchTerm);

    if (matchesDept && matchesSearch) {
      card.classList.remove('hidden');
    } else {
      card.classList.remove('expanded');
      card.classList.add('hidden');
    }
  });

  updateJobCount();
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

// Open modal
document.querySelectorAll('.apply-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const jobTitle = btn.dataset.job;
    applyModalTitle.textContent = jobTitle;
    applyJobTitle.value = jobTitle;
    applyModal.classList.add('open');
    applyForm.style.display = 'flex';
    applySuccess.style.display = 'none';
    document.body.style.overflow = 'hidden';
    // Reset form
    applyForm.reset();
    fileName.textContent = '';
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

// Form submission
applyForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Simulate submission
  const submitBtn = document.getElementById('applySubmitBtn');
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  setTimeout(() => {
    applyForm.style.display = 'none';
    applySuccess.style.display = 'block';
    submitBtn.textContent = 'Submit Application';
    submitBtn.disabled = false;
  }, 1500);
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