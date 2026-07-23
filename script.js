  (function() {
    const loader = document.getElementById('loadingScreen');
    const body = document.body;
    
    // Remove loading screen after 2 seconds
    setTimeout(function() {
      loader.classList.add('done');
      body.classList.remove('loading');
    }, 2000);
  })();

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);

      if (isOpen) {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.background = 'rgba(6,13,23,0.97)';
        nav.style.padding = '20px 24px';
        nav.style.gap = '16px';
      } else {
        nav.style.display = 'none';
      }
    });
  }

  // Close mobile nav after clicking a link
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1100 && nav.classList.contains('open')) {
        nav.classList.remove('open');
        nav.style.display = 'none';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Himalayan river video — pause/play based on visibility for performance
  const video = document.querySelector('.hero-media .hero-video');
  if (video) {
    // If video fails to load, hide it so the fallback image shows through
    video.addEventListener('error', () => {
      video.style.display = 'none';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(video);
  }
});





// ---  CAROUSEL & VIDEO MODAL ------
(function () {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.querySelector('.carousel-arrow--prev');
  const nextBtn = document.querySelector('.carousel-arrow--next');
  const modal = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('videoModalPlayer');
  const modalClose = document.getElementById('videoModalClose');

  if (!track) return;

  const scrollAmount = () => track.clientWidth * 0.8;
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

  document.querySelectorAll('.carousel-slide').forEach(slide => {
    slide.addEventListener('click', () => {
      const src = slide.getAttribute('data-video');
      modalPlayer.src = src;
      modal.classList.add('open');
      modalPlayer.play();
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    modalPlayer.pause();
    modalPlayer.currentTime = 0;
    modalPlayer.src = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.querySelector('.video-modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();

// ---  FILE VIEW / DOWNLOAD HANDLING ------
(function () {
  const fileModal = document.getElementById('fileModal');
  const fileModalBody = document.getElementById('fileModalBody');
  const fileModalTitle = document.getElementById('fileModalTitle');
  const fileModalDownload = document.getElementById('fileModalDownload');
  const fileModalClose = document.getElementById('fileModalClose');

  if (!fileModal) return;

  function openFileModal(src, type, title) {
    fileModalTitle.textContent = title || 'Document';
    fileModalDownload.href = src;
    fileModalDownload.setAttribute('download', title ? title.replace(/\s+/g, '-') : '');
    fileModalBody.innerHTML = '';

    if (type === 'pdf') {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      fileModalBody.appendChild(iframe);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = title || '';
      fileModalBody.appendChild(img);
    }

    fileModal.classList.add('open');
  }

  function closeFileModal() {
    fileModal.classList.remove('open');
    fileModalBody.innerHTML = '';
  }

  document.querySelectorAll('[data-view-src]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const src = btn.getAttribute('data-view-src');
      const type = btn.getAttribute('data-view-type') || 'pdf';
      const title = btn.getAttribute('data-view-title') || btn.textContent.trim();
      openFileModal(src, type, title);
    });
  });

  fileModalClose.addEventListener('click', closeFileModal);
  fileModal.querySelector('.file-modal-backdrop').addEventListener('click', closeFileModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeFileModal();
  });

  document.querySelectorAll('a[download]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const href = btn.getAttribute('href');
      if (!href || href === '#') return; // no file wired yet
      try {
        const response = await fetch(href);
        if (!response.ok) return; // let default anchor behavior try
        e.preventDefault();
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.href = url;
        tempLink.download = btn.getAttribute('download') || 'download';
        document.body.appendChild(tempLink);
        tempLink.click();
        tempLink.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        // If fetch fails (e.g. CORS), fall back to native <a download> behavior
      }
    });
  });
})();

document.querySelectorAll('.carousel-slide').forEach(slide => {
  const videoUrl = slide.dataset.video;
  const fallback = slide.dataset.fallback;
  const img = slide.querySelector('img');
  if (videoUrl && img) {
    const thumbUrl = videoUrl.replace('/video/upload/', '/video/upload/so_1.0/')
                             .replace(/\.[^/.]+$/, '.jpg');
    img.src = thumbUrl;
    img.onerror = () => {
      if (fallback) img.src = fallback; // graceful fallback per-slide
    };
  }
});


// --- TIMELINE MODAL ---
(function () {
  const cards = document.querySelectorAll('.about-card');
  const modal = document.getElementById('timelineModal');
  const modalBackdrop = document.getElementById('timelineModalBackdrop');
  const modalClose = document.getElementById('timelineModalClose');
  const modalTitle = document.getElementById('timelineModalTitle');
  const modalBody = document.getElementById('timelineModalBody');

  const cardData = {
    '2008': {
      year: '2008',
      title: 'Technology Conceptualization',
      text: 'First floating Turbine Picture Upper Ganga Canal UP',
      image: './img/2008-ganga-canal.jpg',   // ← replace with your image path
      hasImage: true
    },
    '2014': {
      year: '2014',
      title: 'MACLEC Incorporated',
      text: 'MTPL Incorporation Certificate',
      image: './img/award_forensic_lab_assocham_ict_cert.jpg',  // ← your image
      hasImage: true
    },
    '2020': {
      year: '2020',
      title: 'First Commercial Demonstration',
      text: 'Add Picture of Uttrakhand – Ramanagar Image & Rajasthan Project Image',
      image: './img/Fixed_type_surface_hydro_kinetic_turbine.png',  // ← your image
      hasImage: true
    },
    '2024-cea': {
      year: '2024',
      title: 'CEA TRL-9 Validation',
      text: 'CEA TRL-9 Validation',
      fullForm: 'Central Electricity Authority',
      hasImage: false
    },
    '2024-mnre': {
      year: '2024',
      title: 'Hydro & Small Hydro Recognition',
      text: 'Hydro & Small Hydro Recognition by MNRE',
      fullForm: 'Ministry of New & Renewable Energy',
      hasImage: false
    },
    '2025': {
      year: '2025+',
      title: 'Global Commercial Expansion',
      text: '200+ MW SHK Turbine Power Generation Projects in hand and 50+ MW SHK PSP project in hand',
      hasImage: false
    },
    '2026': {
      year: '2026',
      title: 'DSIR Recognition',
      text: 'DSIR Recognition (in-house R & D Recognition)',
      fullForm: 'Department of Scientific and Industrial Research',
      table: {
        left: 'R & D Recognition',
        right: '250+ MW SHK Turbine Power Generation Projects in hand and 100+ MW SHK PSP project in hand'
      },
      hasImage: false
    }
  };

  function openModal(data) {
    modalTitle.textContent = data.title;

    let html = '';

    html += `<span class="timeline-modal-year-badge">${data.year}</span>`;

    if (data.hasImage && data.image) {
      html += `
        <div class="timeline-modal-image">
          <img src="${data.image}" alt="${data.title}">
        </div>
      `;
    }

    html += `<div class="timeline-modal-text">`;
    html += `<p>${data.text}</p>`;

    if (data.fullForm) {
      html += `<span class="full-form">${data.fullForm}</span>`;
    }

    html += `</div>`;

    if (data.table) {
      html += `
        <div class="timeline-modal-table">
          <div class="timeline-modal-table-row">
            <div class="timeline-modal-table-cell">${data.table.left}</div>
            <div class="timeline-modal-table-cell">${data.table.right}</div>
          </div>
        </div>
      `;
    }

    modalBody.innerHTML = html;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const year = card.dataset.year;
      openModal(cardData[year]);
    });
  });

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
})();



// --- SCHEDULE A MEETING DROPDOWN ---
(function () {
  const btn = document.getElementById('meetingCtaBtn');
  const menu = document.getElementById('meetingDropdownMenu');
  const arrow = document.getElementById('meetingCtaArrow');
  const wrap = document.getElementById('meetingDropdown');

  if (!btn || !menu) return;

  function closeMenu() {
    menu.style.display = 'none';
    arrow.style.transform = 'rotate(0deg)';
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.style.display === 'block';
    menu.style.display = isOpen ? 'none' : 'block';
    arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();