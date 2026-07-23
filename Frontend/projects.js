document.addEventListener('DOMContentLoaded', () => {

  /* ===== PROJECT DATA ===== */
  const projects = [
    {
      id: 1, name: 'Yamuna Canal Pilot — Delhi NCR', country: 'India',
      x: 690, y: 195,
      category: ['completed', 'government', 'shkt'],
      status: 'completed', statusLabel: 'Completed',
      capacity: '250 kW', client: 'Delhi Irrigation Dept.',
      tech: 'Fixed SHKT', benefit: '1,800 t CO₂ avoided / year',
      desc: 'MACLEC\'s first commercial-scale canal deployment, demonstrating round-the-clock generation without interrupting irrigation flow.',
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80'
    },
    {
      id: 2, name: 'Ganga Tail Race Recovery', country: 'India',
      x: 705, y: 205,
      category: ['ongoing', 'psu', 'shkt'],
      status: 'ongoing', statusLabel: 'Ongoing',
      capacity: '1.2 MW', client: 'State Hydro PSU',
      tech: 'Fixed SHKT', benefit: '6,500 t CO₂ avoided / year',
      desc: 'Recovering untapped kinetic energy from an existing hydropower tail race channel without modifying plant operations.',
      img: 'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=700&q=80'
    },
    {
      id: 3, name: 'NTPC Cooling Channel Recovery', country: 'India',
      x: 680, y: 220,
      category: ['ongoing', 'psu', 'government'],
      status: 'ongoing', statusLabel: 'Ongoing',
      capacity: '800 kW', client: 'NTPC Ltd.',
      tech: 'Fixed SHKT', benefit: '4,100 t CO₂ avoided / year',
      desc: 'Generating auxiliary renewable power from thermal cooling water discharge, reducing the plant\'s own energy costs.',
      img: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=700&q=80'
    },
    {
      id: 4, name: 'Oman Wadi Hydrokinetic Study', country: 'Oman',
      x: 600, y: 230,
      category: ['government', 'international', 'shkt'],
      status: 'opportunity', statusLabel: 'Opportunity',
      capacity: '500 kW (indicative)', client: 'Government of Oman',
      tech: 'Floating SHKT', benefit: 'Est. 2,800 t CO₂ avoided / year',
      desc: 'Feasibility assessment underway for seasonal wadi flows feeding remote desalination infrastructure.',
      img: 'https://images.unsplash.com/photo-1439853949127-fa647821eba0?w=700&q=80'
    },
    {
      id: 5, name: 'Nairobi Irrigation Network', country: 'Kenya',
      x: 555, y: 290,
      category: ['international', 'shkt'],
      status: 'opportunity', statusLabel: 'Opportunity',
      capacity: '350 kW (indicative)', client: 'Regional Irrigation Authority',
      tech: 'Fixed SHKT', benefit: 'Est. 1,900 t CO₂ avoided / year',
      desc: 'Mapping hydrokinetic potential across a large agricultural canal network supporting smallholder farms.',
      img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=700&q=80'
    },
    {
      id: 6, name: 'Tashkent Canal Energy Pilot', country: 'Uzbekistan',
      x: 660, y: 165,
      category: ['ongoing', 'international', 'shkt'],
      status: 'ongoing', statusLabel: 'Ongoing',
      capacity: '400 kW', client: 'Municipal Water Authority',
      tech: 'Fixed SHKT', benefit: '2,200 t CO₂ avoided / year',
      desc: 'Pilot installation across a major irrigation canal feeding agricultural land in the Tashkent region.',
      img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=700&q=80'
    },
    {
      id: 7, name: 'Murray-Darling Pumped Storage Screening', country: 'Australia',
      x: 870, y: 380,
      category: ['international', 'psp'],
      status: 'opportunity', statusLabel: 'Opportunity',
      capacity: '5 MWh (indicative)', client: 'Private Developer',
      tech: 'SHK-PSP', benefit: 'Est. grid stability for 3,000+ homes',
      desc: 'Long-duration energy storage screening using SHK-PSP technology along an existing irrigation channel network.',
      img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=700&q=80'
    },
    {
      id: 8, name: 'Mississippi Industrial Channel Pilot', country: 'USA',
      x: 280, y: 220,
      category: ['international', 'shkt'],
      status: 'opportunity', statusLabel: 'Opportunity',
      capacity: '600 kW (indicative)', client: 'Private Industrial Client',
      tech: 'Floating SHKT', benefit: 'Est. 3,300 t CO₂ avoided / year',
      desc: 'Evaluating hydrokinetic recovery from a large industrial process-water discharge channel.',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&q=80'
    },
    {
      id: 9, name: 'Rajasthan Canal Cluster', country: 'India',
      x: 665, y: 200,
      category: ['completed', 'government', 'shkt'],
      status: 'completed', statusLabel: 'Completed',
      capacity: '3.5 MW', client: 'State Irrigation Department',
      tech: 'Fixed SHKT', benefit: '18,900 t CO₂ avoided / year',
      desc: 'MACLEC\'s largest canal cluster deployment to date, spanning multiple branch canals across the Indira Gandhi Canal network.',
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80'
    },
  ];

  /* ===== WORLD DOT-GRID BACKGROUND ===== */
  const worldDots = document.querySelector('.world-dots');
  // Simplified landmass silhouette approximation using scattered dot clusters
  const landClusters = [
    { cx: 250, cy: 200, rx: 130, ry: 90 },   // N. America
    { cx: 300, cy: 380, rx: 70, ry: 110 },   // S. America
    { cx: 520, cy: 150, rx: 130, ry: 80 },   // Europe
    { cx: 560, cy: 300, rx: 110, ry: 130 },  // Africa
    { cx: 720, cy: 200, rx: 160, ry: 110 },  // Asia
    { cx: 870, cy: 400, rx: 90, ry: 60 },    // Australia
  ];
  let dotsHTML = '';
  landClusters.forEach(c => {
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random();
      const x = c.cx + Math.cos(angle) * c.rx * r;
      const y = c.cy + Math.sin(angle) * c.ry * r;
      dotsHTML += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4"/>`;
    }
  });
  worldDots.innerHTML = dotsHTML;

  /* ===== RENDER PINS ===== */
  const pinsGroup = document.getElementById('proj-pins');
  const statusColor = { completed: '#5ec4e0', ongoing: '#f6c945', opportunity: '#9b6bf2' };

  function renderPins(filter) {
    pinsGroup.innerHTML = '';
    projects
      .filter(p => filter === 'all' || p.category.includes(filter))
      .forEach(p => {
        const color = statusColor[p.status];
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('proj-pin');
        g.setAttribute('data-id', p.id);
        g.innerHTML = `
          <circle class="pin-pulse" cx="${p.x}" cy="${p.y}" r="5" fill="${color}"/>
          <circle class="pin-core" cx="${p.x}" cy="${p.y}" r="5" fill="${color}" stroke="#060d17" stroke-width="1.5"/>
        `;
        g.addEventListener('click', () => openModal(p.id));
        pinsGroup.appendChild(g);
      });
  }

  /* ===== RENDER CARDS ===== */
  const grid = document.getElementById('proj-grid');
  function renderCards(filter) {
    grid.innerHTML = '';
    projects
      .filter(p => filter === 'all' || p.category.includes(filter))
      .forEach(p => {
        const statusClass = `status-${p.status}`;
        const card = document.createElement('div');
        card.className = 'proj-card';
        card.innerHTML = `
          <div class="proj-card-img">
            <img src="${p.img}" alt="${p.name}">
            <span class="proj-card-status ${statusClass}">${p.statusLabel}</span>
          </div>
          <div class="proj-card-body">
            <h3>${p.name}</h3>
            <div class="proj-card-loc">${p.country}</div>
            <div class="proj-card-meta">
              <span>Capacity: <strong>${p.capacity}</strong></span>
              <span>${p.tech}</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => openModal(p.id));
        grid.appendChild(card);
      });
  }

  /* ===== FILTERS ===== */
  const filterBtns = document.querySelectorAll('.proj-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      renderPins(filter);
      renderCards(filter);
    });
  });

  /* ===== MODAL ===== */
  const modal = document.getElementById('proj-modal');
  const modalBackdrop = document.getElementById('proj-modal-backdrop');
  const modalClose = document.getElementById('proj-modal-close');

  function openModal(id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    document.getElementById('modal-img').src = p.img;
    document.getElementById('modal-img').alt = p.name;
    document.getElementById('modal-status').textContent = p.statusLabel;
    document.getElementById('modal-status').className = `proj-modal-status status-${p.status}`;
    document.getElementById('modal-tech').textContent = p.tech;
    document.getElementById('modal-name').textContent = p.name;
    document.getElementById('modal-meta').textContent = p.country;
    document.getElementById('modal-desc').textContent = p.desc;
    document.getElementById('modal-capacity').textContent = p.capacity;
    document.getElementById('modal-client').textContent = p.client;
    document.getElementById('modal-benefit').textContent = p.benefit;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  modalBackdrop.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ===== INIT ===== */
  renderPins('all');
  renderCards('all');
});
