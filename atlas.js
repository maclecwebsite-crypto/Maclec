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

  // Every slider in Site Parameters (width, depth, velocity, discharge,
  // variation, length) re-renders the digital twin on input.
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
  const bedLine = document.getElementById('twin-bedline');
  const variationGroup = document.getElementById('twin-variation');
  const depthScaleGroup = document.getElementById('twin-depth-scale');
  const widthScaleGroup = document.getElementById('twin-width-scale');
  const depthLabel = document.getElementById('twin-depth-label');
  const widthLabel = document.getElementById('twin-width-label');
  const powerOut = document.getElementById('twin-power');
  const turbineCountOut = document.getElementById('twin-turbine-count');
  const segmentNote = document.getElementById('twin-segment-note');

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

  // Slider ranges, used to map real-world values onto the SVG's pixel space
  const DEPTH_MIN = 0.3, DEPTH_MAX = 10;     // matches #f-depth min/max
  const CHANNEL_X = 20, CHANNEL_W = 320;     // horizontal extent of the water body
  const BED_Y = 150;                          // riverbed stays fixed near the bottom
  const PX_MIN = 26, PX_MAX = 130;           // shallowest / deepest channel height in px

  function renderDigitalTwin() {
    const width = getVal('f-width');
    const depth = getVal('f-depth');
    const velocity = getVal('f-velocity');
    const discharge = getVal('f-discharge');
    const variation = getVal('f-variation');
    const length = getVal('f-length');

    const powerKW = estimatePower();
    const turbineCount = Math.max(1, Math.min(12, Math.round(width / 6)));

    // --- Depth: scale channel height in the SVG to the depth slider ---
    const depthRatio = (depth - DEPTH_MIN) / (DEPTH_MAX - DEPTH_MIN);
    const channelHeight = PX_MIN + depthRatio * (PX_MAX - PX_MIN);
    const channelY = BED_Y - channelHeight;

    channelRect.setAttribute('x', CHANNEL_X);
    channelRect.setAttribute('y', channelY);
    channelRect.setAttribute('width', CHANNEL_W);
    channelRect.setAttribute('height', channelHeight);

    if (bedLine) {
      bedLine.setAttribute('x1', CHANNEL_X);
      bedLine.setAttribute('x2', CHANNEL_X + CHANNEL_W);
      bedLine.setAttribute('y1', BED_Y);
      bedLine.setAttribute('y2', BED_Y);
    }

    // --- Depth scale / ruler on the left, with tick marks + value ---
    if (depthScaleGroup) {
      let svgTicks = `<line x1="16" y1="${channelY}" x2="16" y2="${BED_Y}" />`;
      const tickCount = 4;
      for (let i = 0; i <= tickCount; i++) {
        const y = channelY + (channelHeight / tickCount) * i;
        const val = (depth - (depth / tickCount) * i).toFixed(1);
        svgTicks += `<line x1="12" y1="${y}" x2="16" y2="${y}" />`;
        svgTicks += `<text x="9" y="${y + 2.5}" text-anchor="end">${val}</text>`;
      }
      depthScaleGroup.innerHTML = svgTicks;
    }
    if (depthLabel) {
      const midY = channelY + channelHeight / 2;
      depthLabel.textContent = 'Depth ' + depth.toFixed(1) + ' m';
      depthLabel.setAttribute('y', midY + 3);
      depthLabel.setAttribute('transform', `rotate(-90 10 ${midY})`);
    }

    // --- Width scale bar above the channel, with value ---
    if (widthScaleGroup) {
      const y = channelY - 14;
      widthScaleGroup.innerHTML = `
        <line x1="${CHANNEL_X}" y1="${y}" x2="${CHANNEL_X + CHANNEL_W}" y2="${y}" />
        <line x1="${CHANNEL_X}" y1="${y - 4}" x2="${CHANNEL_X}" y2="${y + 4}" />
        <line x1="${CHANNEL_X + CHANNEL_W}" y1="${y - 4}" x2="${CHANNEL_X + CHANNEL_W}" y2="${y + 4}" />
      `;
    }
    if (widthLabel) {
      widthLabel.textContent = 'Width ' + width.toFixed(1) + ' m';
      widthLabel.setAttribute('y', Math.max(14, channelY - 20));
    }

    // --- Water level variation band, scaled proportionally to depth ---
    if (variationGroup) {
      variationGroup.innerHTML = '';
      if (variation > 0) {
        const pxPerM = channelHeight / depth;
        const varPx = Math.min(channelHeight * 0.45, (variation / 2) * pxPerM);
        variationGroup.innerHTML = `
          <line x1="${CHANNEL_X}" y1="${channelY - varPx}" x2="${CHANNEL_X + CHANNEL_W}" y2="${channelY - varPx}"
                stroke="#5ec4e0" stroke-width="1" stroke-dasharray="3 3" opacity="0.55"/>
          <line x1="${CHANNEL_X}" y1="${channelY + varPx}" x2="${CHANNEL_X + CHANNEL_W}" y2="${channelY + varPx}"
                stroke="#5ec4e0" stroke-width="1" stroke-dasharray="3 3" opacity="0.55"/>
        `;
      }
    }

    // --- Flow lines: count reflects depth, speed reflects velocity ---
    flowGroup.innerHTML = '';
    const flowLineCount = Math.max(3, Math.min(7, Math.round(depthRatio * 4) + 3));
    const flowDuration = Math.max(0.35, 2.4 - velocity * 0.5); // faster velocity -> shorter duration
    for (let i = 0; i < flowLineCount; i++) {
      const y = channelY + 10 + i * ((channelHeight - 20) / (flowLineCount - 1 || 1));
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', `M${CHANNEL_X} ${y} L${CHANNEL_X + CHANNEL_W} ${y}`);
      line.setAttribute('stroke-dasharray', '8 6');
      line.classList.add('twin-flow-anim');
      line.style.animationDuration = flowDuration + 's';
      flowGroup.appendChild(line);
    }

    // --- Turbines, sitting mid-depth in the channel ---
    turbineGroup.innerHTML = '';
    const spacing = CHANNEL_W / (turbineCount + 1);
    for (let i = 1; i <= turbineCount; i++) {
      const cx = CHANNEL_X + spacing * i;
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

    // --- Segment note reflects discharge + installation length too ---
    if (segmentNote) {
      segmentNote.textContent =
        `Segment shown: ${width.toFixed(1)} m wide × ${depth.toFixed(1)} m deep, flowing at ${velocity.toFixed(1)} m/s ` +
        `(~${discharge} cumecs). Full installation length: ${length} m.`;
    }
  }

  renderDigitalTwin();

  const runBtn = document.getElementById('run-assessment');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runAssessment();
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Update suitability ring (only runs if the results dashboard markup is present)
    const ring = document.getElementById('suit-ring');
    if (ring) {
      const circumference = 2 * Math.PI * 52;
      const offset = circumference - (score / 100) * circumference;
      ring.setAttribute('stroke-dashoffset', offset);
      ring.setAttribute('stroke', score >= 75 ? '#3ddc84' : score >= 50 ? '#f6c945' : '#e85bd6');
    }
    const suitScoreEl = document.getElementById('suit-score');
    if (suitScoreEl) suitScoreEl.textContent = score;

    const suitTag = document.getElementById('suit-tag');
    if (suitTag) {
      if (score >= 80) { suitTag.textContent = 'Excellent'; suitTag.style.color = '#3ddc84'; }
      else if (score >= 60) { suitTag.textContent = 'Good'; suitTag.style.color = '#f6c945'; }
      else { suitTag.textContent = 'Moderate'; suitTag.style.color = '#e85bd6'; }
    }

    // Technology recommendation
    document.querySelectorAll('.tech-rec-item').forEach(el => el.classList.remove('active'));
    const watertype = document.querySelector('input[name="watertype"]:checked')?.value || '';
    let recId = 'rec-fixed';
    if (watertype === 'Pumped Storage Canal') recId = 'rec-psp';
    else if (velocity < 0.8) recId = 'rec-floating';
    else if (width > 35) recId = 'rec-hybrid';
    document.getElementById(recId)?.classList.add('active');

    // Result stats (only run if present)
    const resCapacity = document.getElementById('res-capacity');
    if (resCapacity) resCapacity.textContent = installedCapacityMW.toFixed(2) + ' MW';
    const resEnergy = document.getElementById('res-energy');
    if (resEnergy) resEnergy.textContent = annualEnergyMU.toFixed(1) + 'M Units';
    const resCarbon = document.getElementById('res-carbon');
    if (resCarbon) resCarbon.textContent = Math.round(carbonTons).toLocaleString() + ' t CO₂';
    const resHouseholds = document.getElementById('res-households');
    if (resHouseholds) resHouseholds.textContent = households.toLocaleString() + '+';
    const resLcoe = document.getElementById('res-lcoe');
    if (resLcoe) {
      const lcoeLow = (2.2 + Math.random() * 0.3).toFixed(1);
      const lcoeHigh = (5.0 + Math.random() * 0.6).toFixed(1);
      resLcoe.textContent = `₹${lcoeLow} – ₹${lcoeHigh} / kWh`;
    }
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

