// script.js
(function() {
  const loader = document.getElementById('loadingScreen');
  const body   = document.body;

  setTimeout(function() {
    if (loader) loader.classList.add('done');
    body.classList.remove('loading');
    document.dispatchEvent(new Event('siteReady'));
  }, 2000);
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('mobile-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Close mobile nav after clicking a link
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1100 && nav.classList.contains('mobile-open')) {
        nav.classList.remove('mobile-open');
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
window.openFileModal = openFileModal;
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
    image: './img/easy_install.png',
    hasImage: true
  },
  '2014': {
    year: '2014',
    title: 'MACLEC Incorporated',
    text: 'MTPL Incorporation Certificate',
    image: './img/MCA.jpeg',
    hasImage: true
  },
  '2020': {
    year: '2020',
    title: 'First Commercial Demonstration',
    text: 'Uttrakhand – Ramanagar Image & Rajasthan Project Image',
    image: './img/Fixed_type_surface_hydro_kinetic_turbine.png',
    hasImage: true
  },
  '2024': {
    year: '2024',
    title: '2024 — Major Regulatory Milestones',
    items: [
      {
        badge: 'CEA Report Dated Oct 21',
        fullForm: 'Central Electricity Authority',
        subtitle: 'Technology Readiness Level 9 Certification',
        text: 'Certified by the Central Electricity Authority (CEA), Ministry of Power, Government of India. SHKT became one of the few renewable energy technologies in India to achieve TRL-9, confirming successful operation under actual field conditions.',
        highlights: [
          'Commercially proven technology',
          'Successful field deployment confirmed',
          'Utility-scale deployment readiness',
          'Highest technology maturity classification'
        ],
        image: './img/CEA_Report.png',
        hasImage: true,
        reportLink: './docs/CEA_Report_DatedOct_21.pdf'
      },
      {
        badge: 'CEA · Policy',
        fullForm: 'Central Electricity Authority',
        subtitle: 'Inclusion Under Hydro & Small Hydro Sector',
        text: 'The Central Electricity Authority formally recognized Surface Hydrokinetic Turbine Technology within India\'s Hydro and Small Hydro Power sector—establishing SHKT as a recognized renewable energy generation technology within the national regulatory framework.',
        highlights: [
          'Official Hydro Power classification',
          'National regulatory recognition',
          'Eligibility under hydro power initiatives',
          'Policy integration pathway established'
        ],
        image: './img/regonization_by_cea.png',
        hasImage: true
      },
      {
        badge: 'MNRE',
        fullForm: 'Ministry of New & Renewable Energy, Small Hydro Power Division',
        subtitle: 'Office Memorandum — Hydro Category Recognition',
        text: 'The Ministry of New & Renewable Energy\'s Small Hydro Power Division issued an Office Memorandum (File No. 19/28/2024-SHP, dated 09.12.2024) forwarding the Central Electricity Authority\'s recognition of Surface Hydrokinetic Turbine (SHKT) technology under the Hydro Category, directing all State Implementing Agencies and Departments responsible for Small Hydro Power development to consider it for necessary action.',
        highlights: [
          'Forwarded CEA\'s Hydro Category recognition of SHKT',
          'Directed to all State Implementing Agencies for Small Hydro Power',
          'Aimed at driving innovation toward net-zero emission targets'
        ],
        image: './img/MNRE_acceptance.png',
        hasImage: true
      }
    ]
  },
  '2025': {
    year: '2025',
    title: 'Global Commercial Expansion',
    text: '200+ MW SHK Turbine Power Generation Projects in hand and 50+ MW SHK PSP project in hand',
    image: './img/project_Demonstrate_1.png',
    image2: './img/project_Demonstrate_2.png',
    hasImage: true
  },
  '2026': {
    year: '2026',
    title: 'DSIR Recognition',
    text: 'DSIR Recognition (in-house R & D Recognition)',
    fullForm: 'Department of Scientific and Industrial Research',
    image: './img/DSIR_recognition.png',
    hasImage: true,
    table: {
      left: 'R & D Recognition',
      right: '250+ MW SHK Turbine Power Generation Projects in hand and 100+ MW SHK PSP project in hand'
    }
  }
};

  function openModal(data) {
    if (!data) return; // guards against cards with no modal-worthy content

    modalTitle.textContent = data.title;
    const modalContent = modal.querySelector('.timeline-modal-content');
    if (data.items && data.items.length) {
      modalContent.classList.add('timeline-modal-content--wide');
    } else {
      modalContent.classList.remove('timeline-modal-content--wide');
    }

    let html = '';
    html += `<span class="timeline-modal-year-badge">${data.year}</span>`;

    if (data.items && data.items.length) {
      html += `<div class="timeline-modal-grid">`;
      data.items.forEach((item) => {
        html += `<div class="timeline-modal-grid-item">`;
        html += `<div class="timeline-badge" style="display:inline-block; margin-bottom:10px;">${item.badge}</div>`;
        if (item.fullForm) {
          html += `<span class="full-form" style="display:block; margin-bottom:4px;">${item.fullForm}</span>`;
        }
        html += `<h4 style="margin:0 0 10px; font-size:16px; color:var(--text);">${item.subtitle}</h4>`;
        if (item.hasImage && item.image) {
          html += `
            <div class="timeline-modal-grid-image">
              <img src="${item.image}" alt="${item.subtitle}">
              <button type="button" class="cert-view-btn"
                      data-view-src="${item.image}"
                      data-view-type="image"
                      data-view-title="${item.subtitle}">
                View Certificate
              </button>
            </div>
          `;
        }
        html += `<p style="margin:0 0 12px; line-height:1.6; font-size:13.5px;">${item.text}</p>`;
        if (item.highlights && item.highlights.length) {
          html += `<ul class="timeline-highlights" style="margin:0 0 12px;">`;
          item.highlights.forEach(h => { html += `<li>${h}</li>`; });
          html += `</ul>`;
        }
        if (item.reportLink) {
          html += `
            <div style="margin-top:auto; padding-top:10px;">
              <a class="tl-btn tl-btn--outline" href="${item.reportLink}" download="MACLEC-CEA-TRL9-Report.pdf">Download Report</a>
            </div>
          `;
        }
        html += `</div>`;
      });
      html += `</div>`;
    } // Single-item view (for other years)
  else {
    const hasImg = data.hasImage && data.image;
    const hasTwoImages = hasImg && data.image2;

    if (hasImg) html += `<div class="timeline-modal-columns">`;

    if (hasTwoImages) {
      // Two images shown side by side, same size
      html += `
        <div class="timeline-modal-image timeline-modal-image--pair">
          <div class="timeline-modal-image-pair-row">
            <div class="timeline-modal-image-pair-item">
              <img src="${data.image}" alt="${data.title} 1">
              <button type="button" class="cert-view-btn"
                      data-view-src="${data.image}"
                      data-view-type="image"
                      data-view-title="${data.title} 1">
                View
              </button>
            </div>
            <div class="timeline-modal-image-pair-item">
              <img src="${data.image2}" alt="${data.title} 2">
              <button type="button" class="cert-view-btn"
                      data-view-src="${data.image2}"
                      data-view-type="image"
                      data-view-title="${data.title} 2">
                View
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (hasImg) {
      html += `
        <div class="timeline-modal-image">
          <img src="${data.image}" alt="${data.title}">
          <button type="button" class="cert-view-btn"
                  data-view-src="${data.image}"
                  data-view-type="image"
                  data-view-title="${data.title}">
            View Certificate
          </button>
        </div>
      `;
    }

    html += `<div class="timeline-modal-col-right">`;

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

    html += `</div>`; // close .timeline-modal-col-right

    if (hasImg) html += `</div>`; // close .timeline-modal-columns
  }

    modalBody.innerHTML = html;
    modalBody.querySelectorAll('.cert-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = btn.getAttribute('data-view-src');
        const type = btn.getAttribute('data-view-type') || 'image';
        const title = btn.getAttribute('data-view-title') || '';
        closeModal();
        if (window.openFileModal) window.openFileModal(src, type, title);
      });
    });

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Single click handler (was previously bound twice)
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const year = card.dataset.year;
      openModal(cardData[year]); // undefined for unknown years → openModal returns early, no modal opens
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

// --- SCROLL-TRIGGERED ENTRANCE ANIMATIONS (advantage cards) ---
(function () {
  const cards = document.querySelectorAll('.adv-card');
  if (!cards.length) return;

  function startObserving() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach(card => observer.observe(card));
  }

  document.addEventListener('siteReady', startObserving);
})();



/* Stats entrance animation */
const statCards = document.querySelectorAll('.stat-card');
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
statCards.forEach(card => statsObserver.observe(card));

/* About pillars entrance animation */
const pillarCards = document.querySelectorAll('.about-pillar');
const pillarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      pillarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
pillarCards.forEach(card => pillarObserver.observe(card));


/* Benefits entrance animation */
const benefitCards = document.querySelectorAll('.benefit-card');
const benefitObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      benefitObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
benefitCards.forEach(card => benefitObserver.observe(card));


// --- INDUSTRY CARD PHOTO MODAL (Feasable locations for SHKT) ---
(function () {
  const INDUSTRY_IMAGES = {
    canals: {
      title: 'Irrigation Canals',
      photos: [
        { file: 'Small Irrigation canal.jfif', caption: 'Small irrigation canal' },
        { file: 'Lined Canal.jfif', caption: 'Lined irrigation canal' },
        { file: 'Unlined Canal.jfif', caption: 'Unlined irrigation canal' },
        { file: 'Lift Irrigation Canal Systems 1.jfif', caption: 'Lift irrigation canal system' },
      ]
    },
    hydro: {
      title: 'Hydropower Plants',
      photos: [
        { file: 'Tailrace Hydropower Dam Canal 1.jfif', caption: 'Tailrace hydropower dam canal' },
        { file: 'Tailrace Hydropower Dam Canal 3.jfif', caption: 'Tailrace hydropower dam canal' },
        { file: 'Tailrace Hydropower Dam Canal 5.jfif', caption: 'Tailrace hydropower dam canal' },
      ]
    },
    thermal: {
      title: 'Thermal Power Plants',
      photos: [
        { file: 'Thermal Power Plant Cooling Water Channels 1.jfif', caption: 'Thermal plant cooling water channel' },
        { file: 'Industrial Plant Cooling Water Channels.jfif', caption: 'Industrial cooling water channel' },
        { file: 'Thermal Power Plant Cooling Water Channels 3.jfif', caption: 'Thermal plant cooling water channel' },
      ]
    },
    rivers: {
      title: 'Rivers & Streams',
      photos: [
        { file: 'Mountain River 1.jfif', caption: 'Mountain river' },
        { file: 'Lowland or Alluvial River 1.jfif', caption: 'Lowland / alluvial river' },
        { file: 'Hilly Stream 1.jfif', caption: 'Hilly stream' },
        { file: 'Plain Ground Stream 1.jfif', caption: 'Plain ground stream' },
      ]
    },
    ports: {
      title: 'Ports & Coastal Infrastructure',
      photos: [
        { file: 'Bidirectional tidal channels 1.jfif', caption: 'Bidirectional tidal channel' },
        { file: 'Bidirectional Tidal Stream Channel 2.jfif', caption: 'Bidirectional tidal stream channel' },
        { file: 'Bidirectional Tidal Stream Channel 5.jfif', caption: 'Bidirectional tidal stream channel' },
      ]
    },
    storage: {
      title: 'Pumped Storage & Energy Storage',
      photos: [
        { file: 'Upstream Reservoir 1.jfif', caption: 'Upstream reservoir' },
        { file: 'Downstream or Lower Stream1.jfif', caption: 'Downstream / lower stream' },
        { file: 'abandoned mines 1.jfif', caption: 'Abandoned mine (PSP site)' },
      ]
    }
  };

  // Where clicking any photo should navigate to
  const ATLAS_TARGET_URL = 'atlas.html#mapping-future';

  const modal = document.getElementById('industryModal');
  const backdrop = document.getElementById('industryModalBackdrop');
  const closeBtn = document.getElementById('industryModalClose');
  const tagEl = document.getElementById('industryModalTag');
  const titleEl = document.getElementById('industryModalTitle');
  const gridEl = document.getElementById('industryModalGrid');

  if (!modal || !gridEl) return;

  function openIndustryModal(key) {
    const data = INDUSTRY_IMAGES[key];
    if (!data) return;

    titleEl.textContent = data.title;
    gridEl.innerHTML = '';

    data.photos.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'industry-modal-photo';
      btn.innerHTML = `
        <img src="img/${encodeURIComponent(p.file)}" alt="${p.caption}" loading="lazy">
        <span class="industry-modal-photo-caption">${p.caption}</span>
      `;
      btn.addEventListener('click', () => {
        window.location.href = ATLAS_TARGET_URL;
      });
      gridEl.appendChild(btn);
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeIndustryModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('.industry-card').forEach(card => {
    card.addEventListener('click', () => {
      openIndustryModal(card.dataset.industry);
    });
  });

  if (backdrop) backdrop.addEventListener('click', closeIndustryModal);
  if (closeBtn) closeBtn.addEventListener('click', closeIndustryModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeIndustryModal();
  });
})();