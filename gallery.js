/* ===== LOADING SCREEN ===== */
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  const body = document.body;

  setTimeout(() => {
    if (loadingScreen) loadingScreen.classList.add('done');
    body.classList.remove('loading');
  }, 2200);
});

/* ===== FILTER ===== */
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    galleryItems.forEach(item => {
      const category = item.dataset.category;
      if (filter === 'all' || category === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

/* ===== LIGHTBOX ===== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentIndex = 0;
let visibleItems = [];

function updateVisibleItems() {
  visibleItems = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
}

function openLightbox(index) {
  updateVisibleItems();
  if (visibleItems.length === 0) return;
  currentIndex = index;
  const card = visibleItems[currentIndex].querySelector('.gallery-card');
  const img = card.querySelector('img');
  const title = card.querySelector('h3')?.textContent || '';
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = title;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showPrev() {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  const card = visibleItems[currentIndex].querySelector('.gallery-card');
  const img = card.querySelector('img');
  const title = card.querySelector('h3')?.textContent || '';
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = title;
    lightboxImg.style.opacity = '1';
  }, 150);
}

function showNext() {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  const card = visibleItems[currentIndex].querySelector('.gallery-card');
  const img = card.querySelector('img');
  const title = card.querySelector('h3')?.textContent || '';
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = title;
    lightboxImg.style.opacity = '1';
  }, 150);
}

// Click on gallery cards (not video play buttons)
document.querySelectorAll('.gallery-card').forEach((card, index) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.gallery-play-btn')) return;
    if (e.target.closest('.gallery-card-zoom')) {
      e.stopPropagation();
      openLightbox(index);
      return;
    }
    openLightbox(index);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

/* ===== VIDEO MODAL ===== */
const videoModal = document.getElementById('videoModal');
const videoModalPlayer = document.getElementById('videoModalPlayer');
const videoModalClose = document.getElementById('videoModalClose');

document.querySelectorAll('.gallery-play-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const videoSrc = btn.dataset.video;
    videoModalPlayer.src = videoSrc;
    videoModal.classList.add('open');
    videoModalPlayer.play();
    document.body.style.overflow = 'hidden';
  });
});

function closeVideoModal() {
  videoModal.classList.remove('open');
  videoModalPlayer.pause();
  videoModalPlayer.src = '';
  document.body.style.overflow = '';
}

videoModalClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal || e.target.classList.contains('video-modal-backdrop')) {
    closeVideoModal();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoModal.classList.contains('open')) {
    closeVideoModal();
  }
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