const API_BASE = 'https://maclec.onrender.com/api';

const DEPT_LABELS = {
  engineering: 'Engineering',
  operations: 'Operations',
  business: 'Business & Strategy',
  research: 'R&D'
};

let authToken = sessionStorage.getItem('adminToken') || null;

const loginWrap = document.getElementById('loginWrap');
const adminBody = document.getElementById('adminBody');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function adminFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${authToken}`
    }
  });

  if (res.status === 401) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }

  return res;
}

function showAdmin() {
  loginWrap.style.display = 'none';
  adminBody.classList.add('visible');
  loadJobs();
  loadApplications();
}

function logout() {
  authToken = null;
  sessionStorage.removeItem('adminToken');
  adminBody.classList.remove('visible');
  loginWrap.style.display = 'flex';
}

if (authToken) {
  showAdmin();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Login failed.');
    }

    const data = await res.json();
    authToken = data.token;
    sessionStorage.setItem('adminToken', authToken);
    loginForm.reset();
    showAdmin();
  } catch (err) {
    loginError.textContent = err.message;
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await adminFetch('/admin/logout', { method: 'POST' });
  } catch { /* ignore */ }
  logout();
});

// Tabs
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('visible'));
    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}Panel`).classList.add('visible');
  });
});

// ===== Job Postings =====
const jobModalBackdrop = document.getElementById('jobModalBackdrop');
const jobForm = document.getElementById('jobForm');
const jobModalTitle = document.getElementById('jobModalTitle');

function openJobModal(job = null) {
  jobForm.reset();
  document.getElementById('jobId').value = job?.id ?? '';
  jobModalTitle.textContent = job ? 'Edit Job' : 'Add New Job';
  document.getElementById('jobTitleInput').value = job?.title ?? '';
  document.getElementById('jobDeptInput').value = job?.department ?? 'engineering';
  document.getElementById('jobLocationInput').value = job?.location ?? '';
  document.getElementById('jobTypeInput').value = job?.employmentType ?? 'Full-time';
  document.getElementById('jobSummaryInput').value = job?.summary ?? '';
  document.getElementById('jobResponsibilitiesInput').value = (job?.responsibilities || []).join('\n');
  document.getElementById('jobRequirementsInput').value = (job?.requirements || []).join('\n');
  document.getElementById('jobKeywordsInput').value = job?.keywords ?? '';
  document.getElementById('jobActiveInput').checked = job ? job.isActive : true;
  jobModalBackdrop.classList.add('open');
}

function closeJobModal() {
  jobModalBackdrop.classList.remove('open');
}

document.getElementById('newJobBtn').addEventListener('click', () => openJobModal());
document.getElementById('jobCancelBtn').addEventListener('click', closeJobModal);
jobModalBackdrop.addEventListener('click', (e) => {
  if (e.target === jobModalBackdrop) closeJobModal();
});

function linesToList(value) {
  return value.split('\n').map(s => s.trim()).filter(Boolean);
}

jobForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('jobId').value;
  const payload = {
    title: document.getElementById('jobTitleInput').value.trim(),
    department: document.getElementById('jobDeptInput').value,
    location: document.getElementById('jobLocationInput').value.trim(),
    employmentType: document.getElementById('jobTypeInput').value,
    summary: document.getElementById('jobSummaryInput').value.trim(),
    responsibilities: linesToList(document.getElementById('jobResponsibilitiesInput').value),
    requirements: linesToList(document.getElementById('jobRequirementsInput').value),
    keywords: document.getElementById('jobKeywordsInput').value.trim(),
    isActive: document.getElementById('jobActiveInput').checked
  };

  try {
    const res = await adminFetch(id ? `/admin/jobs/${id}` : '/admin/jobs', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Failed to save job posting.');

    closeJobModal();
    showToast(id ? 'Job posting updated.' : 'Job posting created.');
    loadJobs();
  } catch (err) {
    showToast(err.message, true);
  }
});

function buildAdminJobCard(job) {
  const card = document.createElement('div');
  card.className = 'admin-job-card';
  card.innerHTML = `
    <div class="admin-job-info">
      <h3>${escapeHtml(job.title)} <span class="status-badge ${job.isActive ? 'active' : 'inactive'}">${job.isActive ? 'Published' : 'Unpublished'}</span></h3>
      <div class="admin-job-meta">
        <span>${escapeHtml(DEPT_LABELS[job.department] || job.department)}</span>
        <span>${escapeHtml(job.location)}</span>
        <span>${escapeHtml(job.employmentType)}</span>
      </div>
    </div>
    <div class="admin-job-actions">
      <button class="btn btn-outline btn-sm" data-action="edit">Edit</button>
      <button class="btn btn-outline btn-sm" data-action="toggle">${job.isActive ? 'Unpublish' : 'Publish'}</button>
      <button class="btn btn-danger btn-sm" data-action="delete">Delete</button>
    </div>
  `;

  card.querySelector('[data-action="edit"]').addEventListener('click', () => openJobModal(job));

  card.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
    try {
      const res = await adminFetch(`/admin/jobs/${job.id}/${job.isActive ? 'unpublish' : 'publish'}`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to update job status.');
      showToast(job.isActive ? 'Job unpublished.' : 'Job published.');
      loadJobs();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      const res = await adminFetch(`/admin/jobs/${job.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete job posting.');
      showToast('Job posting deleted.');
      loadJobs();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  return card;
}

async function loadJobs() {
  const list = document.getElementById('adminJobList');
  const emptyState = document.getElementById('jobsEmptyState');
  try {
    const res = await adminFetch('/admin/jobs');
    if (!res.ok) throw new Error('Failed to load job postings.');
    const jobs = await res.json();

    list.innerHTML = '';
    jobs.forEach(job => list.appendChild(buildAdminJobCard(job)));
    emptyState.style.display = jobs.length === 0 ? 'block' : 'none';
  } catch (err) {
    showToast(err.message, true);
  }
}

// ===== Applications =====
async function downloadResume(id, fileName) {
  try {
    const res = await adminFetch(`/admin/applications/${id}/resume`);
    if (!res.ok) throw new Error('Failed to download resume.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    showToast(err.message, true);
  }
}

function buildApplicationRow(app) {
  const tr = document.createElement('tr');
  const submittedDate = new Date(app.submittedAt);
  const submittedDay = submittedDate.toLocaleDateString();
  const submittedTime = submittedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const links = [
    app.linkedIn ? `<a href="${escapeHtml(app.linkedIn)}" target="_blank" rel="noopener">LinkedIn</a>` : '',
    app.portfolio ? `<a href="${escapeHtml(app.portfolio)}" target="_blank" rel="noopener">Portfolio</a>` : ''
  ].filter(Boolean).join(' · ') || '—';

  tr.innerHTML = `
    <td>${submittedDay}<br><span style="color:var(--text-muted); font-size:12px;">${submittedTime}</span></td>
    <td>${escapeHtml(app.firstName)} ${escapeHtml(app.lastName)}<br><span style="color:var(--text-muted); font-size:12px;">${escapeHtml(app.email)}</span></td>
    <td>${escapeHtml(app.jobTitle)}</td>
    <td>${escapeHtml(app.phone)}</td>
    <td>${links}</td>
    <td class="message-cell">${escapeHtml(app.message) || '—'}</td>
    <td><button class="btn btn-outline btn-sm" data-action="download">Download</button></td>
    <td><button class="btn btn-danger btn-sm" data-action="delete">Delete</button></td>
  `;

  tr.querySelector('[data-action="download"]').addEventListener('click', () => downloadResume(app.id, app.resumeFileName));

  tr.querySelector('[data-action="delete"]').addEventListener('click', async () => {
    if (!confirm(`Delete the application from ${app.firstName} ${app.lastName}? This cannot be undone.`)) return;
    try {
      const res = await adminFetch(`/admin/applications/${app.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete application.');
      showToast('Application deleted.');
      loadApplications();
    } catch (err) {
      showToast(err.message, true);
    }
  });

  return tr;
}

async function loadApplications() {
  const tbody = document.getElementById('applicationsTableBody');
  const emptyState = document.getElementById('applicationsEmptyState');
  try {
    const res = await adminFetch('/admin/applications');
    if (!res.ok) throw new Error('Failed to load applications.');
    const applications = await res.json();

    tbody.innerHTML = '';
    applications.forEach(app => tbody.appendChild(buildApplicationRow(app)));
    emptyState.style.display = applications.length === 0 ? 'block' : 'none';
  } catch (err) {
    showToast(err.message, true);
  }
}
