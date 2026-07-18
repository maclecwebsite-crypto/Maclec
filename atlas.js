document.addEventListener('DOMContentLoaded', () => {

  const tabs = document.querySelectorAll('.console-step-tab');
  const panels = document.querySelectorAll('.console-panel-block');

  function goToStep(step) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.step === String(step)));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === String(step)));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => goToStep(tab.dataset.step));
  });
  document.querySelectorAll('.console-next, .console-prev').forEach(btn => {
    btn.addEventListener('click', () => goToStep(btn.dataset.goto));
  });

  const ranges = [
    { id: 'f-width', outId: 'f-width-out', unit: ' m', decimals: 1 },
    { id: 'f-depth', outId: 'f-depth-out', unit: ' m', decimals: 1 },
    { id: 'f-velocity', outId: 'f-velocity-out', unit: ' m/s', decimals: 1 },
    { id: 'f-discharge', outId: 'f-discharge-out', unit: ' cumecs', decimals: 0 },
    { id: 'f-variation', outId: 'f-variation-out', unit: ' m', decimals: 1 },
    { id: 'f-length', outId: 'f-length-out', unit: ' m', decimals: 0 },
  ];

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) : 0;
  }

  function updateRangeLabels() {
    ranges.forEach(r => {
      const input = document.getElementById(r.id);
      const out = document.getElementById(r.outId);
      if (input && out) {
        out.textContent = parseFloat(input.value).toFixed(r.decimals) + r.unit;
      }
    });
  }

  ranges.forEach(r => {
    const input = document.getElementById(r.id);
    if (input) {
      input.addEventListener('input', () => {
        updateRangeLabels();
        renderDigitalTwin();
      });
    }
  });
  updateRangeLabels();

  const flowGroup = document.getElementById('twin-flowlines');
  const turbineGroup = document.getElementById('twin-turbines');
  const channelRect = document.getElementById('twin-channel');
  const powerOut = document.getElementById('twin-power');
  const turbineCountOut = document.getElementById('twin-turbine-count');

  function estimatePower() {
    const width = getVal('f-width');
    const depth = getVal('f-depth');
    const velocity = getVal('f-velocity');
    // Simplified kinetic power estimate: P = 0.5 * rho * A * v^3 * Cp * efficiency_factor
    const rho = 1000;
    const area = width * depth;
    const Cp = 0.35; // turbine efficiency coefficient
    const rawPowerW = 0.5 * rho * area * Math.pow(velocity, 3) * Cp;
    const powerKW = rawPowerW / 1000;
    return powerKW;
  }

  function renderDigitalTwin() {
    const width = getVal('f-width');
    const depth = getVal('f-depth');
    const powerKW = estimatePower();
    const turbineCount = Math.max(1, Math.min(12, Math.round(width / 6)));

    // Adjust channel height based on depth (visual scaling, capped)
    const channelHeight = Math.min(140, Math.max(40, depth * 18));
    const channelY = 110 - channelHeight / 2;
    channelRect.setAttribute('y', channelY);
    channelRect.setAttribute('height', channelHeight);

    // Flow lines
    flowGroup.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const y = channelY + 12 + i * ((channelHeight - 24) / 4);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', `M0 ${y} L360 ${y}`);
      line.setAttribute('stroke-dasharray', '8 6');
      line.classList.add('twin-flow-anim');
      flowGroup.appendChild(line);
    }

    // Turbines
    turbineGroup.innerHTML = '';
    const spacing = 360 / (turbineCount + 1);
    for (let i = 1; i <= turbineCount; i++) {
      const cx = spacing * i;
      const cy = channelY + channelHeight / 2;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = `
        <circle cx="${cx}" cy="${cy}" r="9" fill="#0a1c2c" stroke="#5ec4e0" stroke-width="2"/>
        <circle cx="${cx}" cy="${cy}" r="3" fill="#5ec4e0"/>
      `;
      turbineGroup.appendChild(g);
    }

    powerOut.textContent = Math.round(powerKW).toLocaleString() + ' kW';
    turbineCountOut.textContent = turbineCount;
  }

  renderDigitalTwin();

  const runBtn = document.getElementById('run-assessment');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runAssessment();
      document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function runAssessment() {
    const width = getVal('f-width');
    const depth = getVal('f-depth');
    const velocity = getVal('f-velocity');
    const discharge = getVal('f-discharge');
    const length = getVal('f-length');

    const powerKW = estimatePower();
    const turbineCount = Math.max(1, Math.min(12, Math.round(width / 6)));
    const installedCapacityMW = (powerKW * turbineCount) / 1000;
    const annualEnergyMU = installedCapacityMW * 8760 * 0.42 / 1000; // capacity factor ~42%, million units
    const carbonTons = annualEnergyMU * 1000000 * 0.0007; // approx kg CO2/unit avoided, converted to tons
    const households = Math.round((annualEnergyMU * 1000000) / 2200); // ~2200 units/household/year

    // Suitability score — weighted by velocity, discharge, width
    let score = 40;
    score += Math.min(25, velocity * 12);
    score += Math.min(20, discharge / 25);
    score += Math.min(15, width / 4);
    score = Math.max(35, Math.min(98, Math.round(score)));

    // Update suitability ring
    const circumference = 2 * Math.PI * 52;
    const ring = document.getElementById('suit-ring');
    const offset = circumference - (score / 100) * circumference;
    ring.setAttribute('stroke-dashoffset', offset);
    ring.setAttribute('stroke', score >= 75 ? '#3ddc84' : score >= 50 ? '#f6c945' : '#e85bd6');
    document.getElementById('suit-score').textContent = score;

    const suitTag = document.getElementById('suit-tag');
    if (score >= 80) { suitTag.textContent = 'Excellent'; suitTag.style.color = '#3ddc84'; }
    else if (score >= 60) { suitTag.textContent = 'Good'; suitTag.style.color = '#f6c945'; }
    else { suitTag.textContent = 'Moderate'; suitTag.style.color = '#e85bd6'; }

    // Technology recommendation
    document.querySelectorAll('.tech-rec-item').forEach(el => el.classList.remove('active'));
    const watertype = document.querySelector('input[name="watertype"]:checked')?.value || '';
    let recId = 'rec-fixed';
    if (watertype === 'Pumped Storage Canal') recId = 'rec-psp';
    else if (velocity < 0.8) recId = 'rec-floating';
    else if (width > 35) recId = 'rec-hybrid';
    document.getElementById(recId)?.classList.add('active');

    // Result stats
    document.getElementById('res-capacity').textContent = installedCapacityMW.toFixed(2) + ' MW';
    document.getElementById('res-energy').textContent = annualEnergyMU.toFixed(1) + 'M Units';
    document.getElementById('res-carbon').textContent = Math.round(carbonTons).toLocaleString() + ' t CO₂';
    document.getElementById('res-households').textContent = households.toLocaleString() + '+';
    const lcoeLow = (2.2 + Math.random() * 0.3).toFixed(1);
    const lcoeHigh = (5.0 + Math.random() * 0.6).toFixed(1);
    document.getElementById('res-lcoe').textContent = `₹${lcoeLow} – ₹${lcoeHigh} / kWh`;
  }

  const baToggles = document.querySelectorAll('.ba-toggle');
  const baImages = document.querySelectorAll('.ba-image');
  baToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      baToggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      baImages.forEach(img => {
        img.classList.toggle('active', img.dataset.view === btn.dataset.view);
      });
    });
  });

  /* ===== AI OPTION BUTTONS (placeholder interaction) ===== */
  document.querySelectorAll('.ai-option').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.borderColor = 'rgba(94,196,224,0.6)';
      btn.style.background = 'rgba(94,196,224,0.1)';
      const small = btn.querySelector('small');
      if (small) small.textContent = 'Upload available in full platform — proceed manually for now.';
    });
  });

});


/* ===== DIGITAL TWIN VIEW TOGGLE + 3D SCENE ===== */
const viewBtns = document.querySelectorAll('.twin-view-btn');
const viewPanels = document.querySelectorAll('.twin-view');
const container3d = document.getElementById('twin-3d-container');
let riverScene = null;

function getTwinParams() {
  return {
    width: getVal('f-width'),
    depth: getVal('f-depth'),
    velocity: getVal('f-velocity'),
    discharge: getVal('f-discharge'),
    variation: getVal('f-variation'),
    length: getVal('f-length'),
  };
}

function ensureRiverScene() {
  if (riverScene || !container3d) return;
  if (typeof RiverScene !== 'function') {
    console.error('RiverScene not available — check that three.min.js and river3d.js loaded before atlas.js.');
    return;
  }
  riverScene = RiverScene(container3d);
  if (riverScene) {
    riverScene.update(getTwinParams());
    riverScene.start();
  }
}

function setTwinView(view) {
  viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === view));
  viewPanels.forEach(p => p.classList.toggle('active', p.dataset.view === view));
  if (view === 'side3d') {
    ensureRiverScene();
    if (riverScene) { riverScene.resize(); riverScene.start(); }
  } else if (riverScene) {
    riverScene.stop();
  }
}

viewBtns.forEach(btn => btn.addEventListener('click', () => setTwinView(btn.dataset.view)));

const resetViewBtn = document.getElementById('btn-reset-view');
if (resetViewBtn) {
  resetViewBtn.addEventListener('click', () => { if (riverScene) riverScene.resetView(); });
}

// keep the 3D model synced with slider changes
ranges.forEach(r => {
  const input = document.getElementById(r.id);
  if (input) {
    input.addEventListener('input', () => {
      if (riverScene) riverScene.update(getTwinParams());
    });
  }
});

// default to the 3D view
setTwinView('side3d');