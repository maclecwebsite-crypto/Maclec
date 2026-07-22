document.addEventListener('DOMContentLoaded', () => {

  /* ===== STEP NAVIGATION ===== */
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

  function getLengthFromSlider(rawVal) {
    if (rawVal <= 20) {
      // Phase 1: 250m to 2000m (fine control)
      return Math.round(250 + rawVal * 87.5);
    } else {
      // Phase 2: 5000m to 100,000,000m (100,000 km)
      const t = (rawVal - 20) / 80;
      return Math.round(5000 + t * t * 99995000);
    }
  }

  function getSliderFromLength(length) {
    if (length <= 2000) {
      return (length - 250) / 87.5;
    } else {
      return 20 + Math.sqrt((length - 5000) / 99995000) * 80;
    }
  }

  /* ===== GET VALUE HELPER ===== */
  function getVal(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const raw = parseFloat(el.value);
    if (id === 'f-length') {
      return getLengthFromSlider(raw);
    }
    return raw;
  }

  /* ===== RANGE SLIDERS ===== */
  const ranges = [
    { id: 'f-width', outId: 'f-width-out', unit: ' m', decimals: 1 },
    { id: 'f-depth', outId: 'f-depth-out', unit: ' m', decimals: 1 },
    { id: 'f-velocity', outId: 'f-velocity-out', unit: ' m/s', decimals: 1 },
    { id: 'f-discharge', outId: 'f-discharge-out', unit: ' cumecs', decimals: 0 },
    { id: 'f-variation', outId: 'f-variation-out', unit: ' m', decimals: 1 },
    { id: 'f-length', outId: 'f-length-out', unit: ' m', decimals: 0 },
  ];

  function formatLength(val) {
    if (val < 1000) {
      return val.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' m';
    } else {
      return (val / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' km';
    }
  }
  
  function updateRangeLabels() {
    ranges.forEach(r => {
      const input = document.getElementById(r.id);
      const out = document.getElementById(r.outId);
      if (input && out) {
        let val = parseFloat(input.value);
        if (r.id === 'f-length') {
          val = getLengthFromSlider(val);
          out.textContent = formatLength(val);
        } else {
          out.textContent = val.toLocaleString(undefined, { minimumFractionDigits: r.decimals, maximumFractionDigits: r.decimals }) + r.unit;
        }
      }
    });
  }

  // Attach listeners + initial render
  ranges.forEach(r => {
    const input = document.getElementById(r.id);
    if (input) {
      input.addEventListener('input', () => {
        updateRangeLabels();
        renderDigitalTwin();
        if (typeof window.twin3dRebuild === 'function') {
          window.twin3dRebuild();
        }
      });
    }
  });
  updateRangeLabels();

  /* ===== 2D SVG DIGITAL TWIN ===== */
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
    const rho = 1000;
    const area = width * depth;
    const Cp = 0.35;
    const rawPowerW = 0.5 * rho * area * Math.pow(velocity, 3) * Cp;
    return rawPowerW / 1000;
  }

  const DEPTH_MIN = 0.3, DEPTH_MAX = 10;
  const CHANNEL_X = 20, CHANNEL_W = 320;
  const BED_Y = 150;
  const PX_MIN = 26, PX_MAX = 130;

  function renderDigitalTwin() {
    if (!channelRect || !flowGroup || !turbineGroup) return;

    const width = getVal('f-width');
    const depth = getVal('f-depth');
    const velocity = getVal('f-velocity');
    const discharge = getVal('f-discharge');
    const variation = getVal('f-variation');
    const length = getVal('f-length');

    const powerKW = estimatePower();
    const turbineCount = Math.max(1, Math.min(12, Math.round(width / 6)));

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

    flowGroup.innerHTML = '';
    const flowLineCount = Math.max(3, Math.min(7, Math.round(depthRatio * 4) + 3));
    const flowDuration = Math.max(0.35, 2.4 - velocity * 0.5);
    for (let i = 0; i < flowLineCount; i++) {
      const y = channelY + 10 + i * ((channelHeight - 20) / (flowLineCount - 1 || 1));
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.setAttribute('d', `M${CHANNEL_X} ${y} L${CHANNEL_X + CHANNEL_W} ${y}`);
      line.setAttribute('stroke-dasharray', '8 6');
      line.classList.add('twin-flow-anim');
      line.style.animationDuration = flowDuration + 's';
      flowGroup.appendChild(line);
    }

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

    if (powerOut) powerOut.textContent = Math.round(powerKW).toLocaleString() + ' kW';
    if (turbineCountOut) turbineCountOut.textContent = turbineCount;

    if (segmentNote) {
      segmentNote.textContent =
        `Segment shown: ${width.toFixed(1)} m wide × ${depth.toFixed(1)} m deep, flowing at ${velocity.toFixed(1)} m/s ` +
        `(~${discharge} cumecs). Full installation length: ${length} m.`;
    }
  }

  renderDigitalTwin();

  /* ===== RUN ASSESSMENT ===== */
  const runBtn = document.getElementById('run-assessment');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      runAssessment();
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function runAssessment() {
    if (typeof window.twin3dRebuild === 'function') {
      window.twin3dRebuild();
    }
    const width = getVal('f-width');
    const depth = getVal('f-depth');
    const velocity = getVal('f-velocity');
    const discharge = getVal('f-discharge');
    const length = getVal('f-length');

    const powerKW = estimatePower();
    const turbineCount = Math.max(1, Math.min(12, Math.round(width / 6)));
    const installedCapacityMW = (powerKW * turbineCount) / 1000;
    const annualEnergyMU = installedCapacityMW * 8760 * 0.42 / 1000;
    const carbonTons = annualEnergyMU * 1000000 * 0.0007;
    const households = Math.round((annualEnergyMU * 1000000) / 2200);

    let score = 40;
    score += Math.min(25, velocity * 12);
    score += Math.min(20, discharge / 25);
    score += Math.min(15, width / 4);
    score = Math.max(35, Math.min(98, Math.round(score)));

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

    document.querySelectorAll('.tech-rec-item').forEach(el => el.classList.remove('active'));
    const checkedWatertype = document.querySelector('input[name="watertype"]:checked');
    const watertype = checkedWatertype?.value || '';
    const watertypeCategory = checkedWatertype?.dataset.category || '';
    let recId = 'rec-fixed';
    if (watertypeCategory === 'psp' || watertype === 'Pumped Storage Canal') recId = 'rec-psp';
    else if (velocity < 0.8) recId = 'rec-floating';
    else if (width > 35) recId = 'rec-hybrid';
    document.getElementById(recId)?.classList.add('active');

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

  /* ===== BEFORE/AFTER TOGGLE ===== */
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

  /* ===== AI OPTION BUTTONS ===== */
  document.querySelectorAll('.ai-option').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.borderColor = 'rgba(94,196,224,0.6)';
      btn.style.background = 'rgba(94,196,224,0.1)';
      const small = btn.querySelector('small');
      if (small) small.textContent = 'Upload available in full platform — proceed manually for now.';
    });
  });

  /* ===== GEOTAG LOCATION (actual coordinates) ===== */
  (function initGeotagLocation(){
    const latInput = document.getElementById('f-geo-lat');
    const lngInput = document.getElementById('f-geo-lng');
    const detectBtn = document.getElementById('geo-detect-btn');
    const readout = document.getElementById('geo-readout');
    const mapLink = document.getElementById('geo-map-link');
    const latHidden = document.getElementById('f-geo-lat-value');
    const lngHidden = document.getElementById('f-geo-lng-value');

    if (!latInput || !lngInput) return;

    function isValidCoord(lat, lng) {
      return Number.isFinite(lat) && Number.isFinite(lng) &&
             lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    function commitCoords(lat, lng, source) {
      const latFixed = lat.toFixed(6);
      const lngFixed = lng.toFixed(6);
      latInput.value = latFixed;
      lngInput.value = lngFixed;
      if (latHidden) latHidden.value = latFixed;
      if (lngHidden) lngHidden.value = lngFixed;

      if (readout) {
        readout.textContent = `Geotag captured (${source}): ${latFixed}, ${lngFixed}`;
        readout.classList.add('geo-readout--ok');
        readout.classList.remove('geo-readout--err');
      }
      if (mapLink) {
        mapLink.href = `https://www.google.com/maps?q=${latFixed},${lngFixed}`;
        mapLink.style.display = 'inline-block';
      }
    }

    // Manual typing of coordinates
    function handleManualInput() {
      const lat = parseFloat(latInput.value);
      const lng = parseFloat(lngInput.value);
      if (isValidCoord(lat, lng)) {
        commitCoords(lat, lng, 'entered manually');
      } else if (readout) {
        readout.textContent = 'Enter a valid latitude (-90 to 90) and longitude (-180 to 180).';
        readout.classList.remove('geo-readout--ok');
        readout.classList.add('geo-readout--err');
        if (mapLink) mapLink.style.display = 'none';
      }
    }
    latInput.addEventListener('change', handleManualInput);
    lngInput.addEventListener('change', handleManualInput);

    // Auto-detect using the browser Geolocation API
    if (detectBtn) {
      detectBtn.addEventListener('click', () => {
        if (!('geolocation' in navigator)) {
          if (readout) {
            readout.textContent = 'Geolocation is not supported on this device/browser — please enter coordinates manually.';
            readout.classList.add('geo-readout--err');
          }
          return;
        }
        if (readout) {
          readout.textContent = 'Detecting your current location…';
          readout.classList.remove('geo-readout--ok', 'geo-readout--err');
        }
        detectBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            detectBtn.disabled = false;
            const { latitude, longitude } = position.coords;
            commitCoords(latitude, longitude, 'auto-detected');
          },
          (err) => {
            detectBtn.disabled = false;
            if (readout) {
              readout.textContent = 'Could not detect location automatically (' + (err.message || 'permission denied') + '). Please enter coordinates manually.';
              readout.classList.add('geo-readout--err');
              readout.classList.remove('geo-readout--ok');
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }
  })();

  /* ===== SAMPLE VIDEOS: recorded river / canal upload readout ===== */
  (function initSampleVideoUpload(){
    const fileInput = document.getElementById('f-site-video');
    const readout = document.getElementById('site-video-readout');
    if (!fileInput || !readout) return;

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) {
        readout.textContent = 'No file selected yet.';
        return;
      }
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      readout.textContent = `Selected: ${file.name} (${sizeMB} MB) — ready to share with your assessment.`;
    });
  })();

});


(function(){
  const WT_DATA = [{"category": "Hydro Power Generation Through Flowing Water", "key": "hydro", "folder": "Hydro Power Generationt through flowing water", "items": [{"name": "Bidirectional Tidal Channels", "files": ["Bidirectional Tidal Stream Channel 2.jfif", "Bidirectional Tidal Stream Channel 3.jfif", "Bidirectional Tidal Stream Channel 4.jfif", "Bidirectional Tidal Stream Channel 5.jfif", "Bidirectional Tidal Stream Channel 6.jfif", "Bidirectional Tidal Stream Channel 7.jfif", "Bidirectional tidal channels 1.jfif"]}, {"name": "Drinking Water Treatment Plant Inlet & Outlet Channel", "files": ["Drinking Water Treatement Plant Inlet & Outlet channel 7.jfif", "Drinking Water Treatment Plant In_et & Outlet Channel 6.jfif"]}, {"name": "Hilly Stream", "files": ["Hilly Stream 1.jfif", "Hilly Stream 2.jfif", "Hilly Stream 3.jfif", "Hilly Stream 4.jfif", "Hilly Streams 1.jfif", "Himalaya_s River 1.jfif", "Himalaya_s River 2.jfif", "Himalaya_s River 3.jfif", "Himalaya_s River 4.jfif", "Himalaya_s River 5.jfif", "Himalaya_s River 6.jfif"]}, {"name": "Industrial Plant Cooling Water Channels", "files": ["Industrial Plant Cooling Water Channels 2.jfif", "Industrial Plant Cooling Water Channels 3.jfif", "Industrial Plant Cooling Water Channels.jfif"]}, {"name": "Irrigation Canal", "files": ["Lined Canal.jfif", "Small Irrigation canal.jfif", "Unlined Canal.jfif"]}, {"name": "Lift Irrigation and Drinkng water upper channel pump pipe outlet", "files": ["Lift Irrigation Canal Systems 1.jfif", "Lift Irrigation Canal Systems 2.jfif", "Lift Irrigation and Drinking water canal.jfif", "Lift Irrigation and Drinkng water upper channel pump pipe outlet.jfif", "Lifting and Drinking water canal 2.jfif"]}, {"name": "Raw Water Intake & Inlet Canal", "files": ["Raw Water Intake & Inlet Canal 1.jfif", "Raw Water Intake & Inlet Canal 2.jfif", "Raw Water Intake & Inlet Canal 3.jfif", "Raw Water Intake & Inlet Canal 4.jfif", "Raw Water Intake & Inlet Canal 5.jfif"]}, {"name": "Rivers", "files": ["Forest River 5.jfif", "Lowland or Alluvial River 1.jfif", "Lowland or Alluvial River 2.jfif", "Lowland or Alluvial River 3.jfif", "Lowland or Alluvial River 4.jfif", "Lowland or Alluvial River 5.jfif", "Lowland or Alluvial River 6.jfif", "Lowland or Alluvial River 7.jfif", "Lowland or Alluvial River 8.jfif", "Mountain River 1.jfif", "Mountain River 2.jfif", "Mountain River 3.jfif", "Mountain River 4.jfif", "Plain Ground Stream 1.jfif", "Plain Ground Stream 2.jfif", "Plain Ground Stream 3.jfif", "Plain Ground Stream 4.jfif", "Plain Ground Stream 5.jfif", "Plain Ground Stream 6.jfif"]}, {"name": "Sewage Water Channels", "files": ["Sewage Water Channels 1.jfif", "Sewage Water Channels 2.jfif", "Sewage Water Channels 3.jfif", "Sewage Water Channels 4.jfif", "Sewage Water Channels 5.jfif"]}, {"name": "Tailrace Hydropower Dam Canal", "files": ["Tailrace Hydropower Dam Canal 1.jfif", "Tailrace Hydropower Dam Canal 10.jfif", "Tailrace Hydropower Dam Canal 11.jfif", "Tailrace Hydropower Dam Canal 2.jfif", "Tailrace Hydropower Dam Canal 3.jfif", "Tailrace Hydropower Dam Canal 4.jfif", "Tailrace Hydropower Dam Canal 5.jfif", "Tailrace Hydropower Dam Canal 6.jfif", "Tailrace Hydropower Dam Canal 7.jfif", "Tailrace Hydropower Dam Canal 8.jfif", "Tailrace Hydropower Dam Canal 9.jfif"]}, {"name": "Thermal Power Plant Cooling Water Channels", "files": ["Thermal Power Plant Cooling Water Channels 1.jfif", "Thermal Power Plant Cooling Water Channels 2.jfif", "Thermal Power Plant Cooling Water Channels 3.jfif", "Thermal Power Plant Cooling Water Channels 4.jfif"]}, {"name": "Waste Water Inlet & Outlet Channels", "files": ["Waste Water Inlet & Outlet Channels 1.jfif", "Waste Water Inlet & Outlet Channels 2.jfif", "Waste Water Inlet & Outlet Channels 3.jfif", "Waste Water Inlet & Outlet Channels 4.jfif", "Waste Water Inlet & Outlet Channels 5.jfif", "Waste Water Inlet & Outlet Channels 6.jfif", "Wastewater Treatment Plant \u2013 Aerial Overview 1.jfif"]}]}, {"category": "SHK Pumped Storage Potential (PSP)", "key": "psp", "folder": "PSP", "items": [{"name": "Drnking water Treatment Plant", "files": ["drinking water treatment plants located in or near desert or bared land 1.jfif", "drinking water treatment plants located in or near desert or bared land 2.jfif"]}, {"name": "Uptream and Lowerstream Reservior", "files": ["Downstream or Lower Stream1.jfif", "Upstream Reservoir 1.jfif", "Upstream Reservoir 2.jfif", "Upstream Reservoir 3.jfif"]}, {"name": "abandoned mines", "files": ["abandoned mines 1.jfif", "abandoned mines 2.jfif", "abandoned mines 3.jfif", "abandoned mines 4.jfif", "abandoned mines 5.jfif"]}, {"name": "barren islands", "files": ["barren islands 1.jfif", "barren islands 2.jfif", "barren islands 3.jfif", "barren islands 4.jfif"]}, {"name": "barren or sparsely vegetated islands close to cities", "files": ["barren or sparsely vegetated islands close to cities 1.jfif", "barren or sparsely vegetated islands close to cities 2.jfif", "desert landscapes directly adjacent to the sea 1.jfif", "desert landscapes directly adjacent to the sea 2.jfif", "desert landscapes directly adjacent to the sea 3.jfif", "desert landscapes directly adjacent to the sea 4.jfif", "desert landscapes directly adjacent to the sea 5.jfif"]}, {"name": "coastal sea wetlands", "files": ["coastal sea wetlands 1.jfif", "coastal sea wetlands 2.jfif", "coastal sea wetlands 3.jfif", "coastal sea wetlands 4.jfif"]}, {"name": "desert landscapes with rivers and irrigation canals", "files": ["desert landscapes with rivers and irrigation canals 1.jfif", "desert landscapes with rivers and irrigation canals 2.jfif", "desert landscapes with rivers and irrigation canals 3.jfif", "desert landscapes with rivers and irrigation canals 4.jfif"]}, {"name": "large water ponds, reservoirs, and storage lagoons located outside cities or villages", "files": ["large water ponds, reservoirs, and storage lagoons located outside cities or villages 1.jfif", "large water ponds, reservoirs, and storage lagoons located outside cities or villages 2.jfif", "large water ponds, reservoirs, and storage lagoons located outside cities or villages 3.jfif", "large water ponds, reservoirs, and storage lagoons located outside cities or villages 4.jfif", "large water ponds, reservoirs, and storage lagoons located outside cities or villages 5.jfif"]}, {"name": "sewage treatment plants (STPs) located in desert", "files": ["sewage treatment plants (STPs) located in desert 1.jfif", "sewage treatment plants (STPs) located in desert 2.jfif", "sewage treatment plants (STPs) located in desert 3.jfif", "sewage treatment plants (STPs) located in desert 4.jfif", "sewage treatment plants (STPs) located in desert 5.jfif", "sewage treatment plants (STPs) located in desert 6.jfif"]}, {"name": "wasteland or barren land located adjacent to lakes, ponds, or reservoirs", "files": ["wasteland or barren land located adjacent to lakes, ponds, or reservoirs 1.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 2.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 3.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 4.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 5.jfif", "wasteland or barren land located adjacent to lakes, ponds, or reservoirs 6.jfif"]}, {"name": "wetlands located on the outskirts of cities", "files": ["wetlands located on the outskirts of cities 1.jfif", "wetlands located on the outskirts of cities 2.jfif", "wetlands located on the outskirts of cities 3.jfif", "wetlands located on the outskirts of cities 4.jfif"]}]}];

  const grid = document.getElementById('watertype-grid');
  const tabs = document.getElementById('watertype-tabs');
  if (!grid || !tabs) return;

  function encPath(parts){
    return parts.map(p => encodeURIComponent(p)).join('/');
  }

  function imgSrc(folder, sub, file){
    return 'img/' + encPath([folder, sub, file]);
  }

  // Turn a raw filename into a friendly display name
  function cleanName(file){
    return file
      .replace(/\.[a-zA-Z0-9]+$/, '')   // strip extension
      .replace(/_/g, ' ')                // underscores -> spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  function esc(str){
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  // Which specific photo is selected for each item, keyed by "key-idx" -> file index
  const selectedPhotoIndex = {};
  // Which item is currently the chosen watertype
  let currentSelection = { key: 'hydro', idx: 0 };

  let activeKey = 'hydro';

  function itemKey(key, idx){ return key + '-' + idx; }

  function renderGrid(key){
    const cat = WT_DATA.find(c => c.key === key);
    grid.innerHTML = '';
    if (!cat) return;

    cat.items.forEach((item, idx) => {
      const ik = itemKey(key, idx);
      const fileIdx = selectedPhotoIndex[ik] || 0;
      const file = item.files[fileIdx];
      const thumb = imgSrc(cat.folder, item.name, file);
      const inputId = 'wt-' + ik;
      const isChecked = currentSelection.key === key && currentSelection.idx === idx;
      const photoName = cleanName(file);

      const label = document.createElement('label');
      label.className = 'radio-card';
      label.dataset.key = key;
      label.dataset.idx = idx;

      label.innerHTML = `
        <input type="radio" id="${inputId}" name="watertype" value="${esc(item.name)}" data-category="${key}" ${isChecked ? 'checked' : ''}>
        <span class="radio-card-media">
          <img src="${thumb}" alt="${esc(item.name)}" loading="lazy">
          <span class="radio-card-count">${item.files.length} photo${item.files.length > 1 ? 's' : ''}</span>
        </span>
        <span class="radio-card-label">${esc(item.name)}</span>
        <span class="radio-card-selected-name">Selected: ${esc(photoName)}</span>
      `;
      grid.appendChild(label);
    });
  }

  tabs.querySelectorAll('.watertype-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.watertype-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeKey = tab.dataset.cat;
      renderGrid(activeKey);
    });
  });

  renderGrid(activeKey);

  /* ----- Gallery modal ----- */
  const modal = document.getElementById('wt-modal');
  const modalBackdrop = document.getElementById('wt-modal-backdrop');
  const modalClose = document.getElementById('wt-modal-close');
  const modalCat = document.getElementById('wt-modal-cat');
  const modalTitle = document.getElementById('wt-modal-title');
  const modalCount = document.getElementById('wt-modal-count');
  const modalImage = document.getElementById('wt-modal-image');
  const modalImageName = document.getElementById('wt-modal-image-name');
  const modalThumbs = document.getElementById('wt-modal-thumbs');
  const modalPrev = document.getElementById('wt-modal-prev');
  const modalNext = document.getElementById('wt-modal-next');
  const modalSelect = document.getElementById('wt-modal-select');

  let galCat = null;
  let galItem = null;
  let galKey = null;
  let galIdx = 0;
  let galPhotoIdx = 0;

  // Open the gallery for a given water-source-type card (does NOT select it yet)
  function openGallery(key, idx){
    const cat = WT_DATA.find(c => c.key === key);
    if (!cat) return;
    const item = cat.items[idx];
    if (!item) return;

    galCat = cat;
    galItem = item;
    galKey = key;
    galIdx = idx;
    galPhotoIdx = selectedPhotoIndex[itemKey(key, idx)] || 0;

    modalCat.textContent = cat.category;
    modalTitle.textContent = item.name;
    renderPhoto();
    renderThumbs();

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  const modalImageWrap = document.querySelector('.wt-modal-image-wrap');

  function renderPhoto(){
    const file = galItem.files[galPhotoIdx];
    modalImage.src = imgSrc(galCat.folder, galItem.name, file);
    modalImage.alt = galItem.name + ' — ' + cleanName(file);
    modalCount.textContent = 'Photo ' + (galPhotoIdx + 1) + ' of ' + galItem.files.length;
    if (modalImageName) modalImageName.textContent = cleanName(file);

    // Update thumbnail highlights
    modalThumbs.querySelectorAll('.wt-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === galPhotoIdx);
      const cb = t.querySelector('.wt-thumb-checkbox');
      if (cb) cb.setAttribute('aria-checked', i === galPhotoIdx ? 'true' : 'false');
    });

    // Update main checkbox state
    updateMainCheckbox();
  }

  function updateMainCheckbox() {
    let checkbox = document.getElementById('wt-main-checkbox');
    if (!checkbox) {
      checkbox = document.createElement('div');
      checkbox.id = 'wt-main-checkbox';
      checkbox.className = 'wt-modal-main-checkbox';
      checkbox.setAttribute('role', 'checkbox');
      checkbox.setAttribute('aria-label', 'Select this image');
      checkbox.setAttribute('tabindex', '0');

      const label = document.createElement('span');
      label.className = 'wt-modal-main-checkbox-label';
      label.textContent = 'Click to select';

      modalImageWrap.appendChild(checkbox);
      modalImageWrap.appendChild(label);

      // Click to select
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        commitSelection(galPhotoIdx);
      });

      // Keyboard support
      checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          commitSelection(galPhotoIdx);
        }
      });
    }

    // Show checked state if this photo is already selected for this item
    const ik = itemKey(galKey, galIdx);
    const isSelected = (selectedPhotoIndex[ik] === galPhotoIdx) &&
                       (currentSelection.key === galKey && currentSelection.idx === galIdx);
    checkbox.classList.toggle('checked', isSelected);
    checkbox.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  }

  function renderThumbs(){
    modalThumbs.innerHTML = '';
    galItem.files.forEach((file, i) => {
      const name = cleanName(file);
      const cell = document.createElement('div');
      cell.className = 'wt-thumb' + (i === galPhotoIdx ? ' active' : '');
      cell.dataset.idx = i;

      cell.innerHTML = `
        <button type="button" class="wt-thumb-preview" data-idx="${i}" aria-label="Preview ${esc(name)}">
          <div class="wt-thumb-checkbox" role="checkbox" aria-checked="${i === galPhotoIdx ? 'true' : 'false'}" aria-label="Select ${esc(name)}"></div>
          <img src="${imgSrc(galCat.folder, galItem.name, file)}" alt="${esc(name)}" loading="lazy">
        </button>
        <span class="wt-thumb-name" title="${esc(name)}">${esc(name)}</span>
      `;
      modalThumbs.appendChild(cell);
    });
  }

  function closeGallery(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Confirm the selection of a specific photo for the current gallery item
  function commitSelection(fileIdx){
    selectedPhotoIndex[itemKey(galKey, galIdx)] = fileIdx;
    currentSelection = { key: galKey, idx: galIdx };

    // Make sure the right tab is active so the grid re-render shows the update
    const tabBtn = tabs.querySelector(`.watertype-tab[data-cat="${galKey}"]`);
    if (tabBtn && !tabBtn.classList.contains('active')) {
      tabs.querySelectorAll('.watertype-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tabBtn.classList.add('active');
      tabBtn.setAttribute('aria-selected', 'true');
      activeKey = galKey;
    }

    renderGrid(activeKey);

    const input = document.getElementById('wt-' + itemKey(galKey, galIdx));
    if (input) {
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    closeGallery();
  }

  // Clicking anywhere on a water-source-type card opens its photo gallery
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.radio-card');
    if (!card) return;
    e.preventDefault(); // selection now happens inside the modal, not on card click
    openGallery(card.dataset.key, parseInt(card.dataset.idx, 10));
  });

  modalBackdrop.addEventListener('click', closeGallery);
  modalClose.addEventListener('click', closeGallery);
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') stepPhoto(-1);
    if (e.key === 'ArrowRight') stepPhoto(1);
  });

  function stepPhoto(dir){
    if (!galItem) return;
    const len = galItem.files.length;
    galPhotoIdx = (galPhotoIdx + dir + len) % len;
    renderPhoto();
  }
  modalPrev.addEventListener('click', () => stepPhoto(-1));
  modalNext.addEventListener('click', () => stepPhoto(1));

  // Clicking a thumbnail's checkbox OR preview selects/previews it
  modalThumbs.addEventListener('click', (e) => {
    const checkbox = e.target.closest('.wt-thumb-checkbox');
    const preview = e.target.closest('.wt-thumb-preview');

    if (checkbox || preview) {
      const thumb = (checkbox || preview).closest('.wt-thumb');
      const idx = parseInt(thumb.dataset.idx, 10);

      galPhotoIdx = idx;
      modalThumbs.querySelectorAll('.wt-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === idx);
        const cb = t.querySelector('.wt-thumb-checkbox');
        if (cb) cb.setAttribute('aria-checked', i === idx ? 'true' : 'false');
      });

      renderPhoto();
    }
  });

  // Bottom "Select This Option" button commits the choice
  modalSelect.addEventListener('click', () => {
    commitSelection(galPhotoIdx);
  });
})();


/* =========================================================================
   Country / State dropdowns — live data from the CountriesNow API
   https://countriesnow.space/api/v0.1/countries          (GET  -> countries)
   https://countriesnow.space/api/v0.1/countries/states    (POST -> states)
   ========================================================================= */
(function () {
  const API_BASE = 'https://countriesnow.space/api/v0.1';

  // Cache so we don't re-fetch on every open
  let countriesCache = null;
  const statesCache = {}; // countryName -> [state names]

  function createDropdown({ wrapId, toggleId, textId, panelId, searchId, listId, placeholder }) {
    const wrap = document.getElementById(wrapId);
    const toggle = document.getElementById(toggleId);
    const text = document.getElementById(textId);
    const panel = document.getElementById(panelId);
    const search = document.getElementById(searchId);
    const list = document.getElementById(listId);

    if (!wrap || !toggle || !text || !panel || !search || !list) {
      return null; // markup not present on this page
    }

    let allOptions = []; // full list of strings currently available
    let selectedValue = '';
    let onSelectCallback = null;

  function open() {
      if (toggle.disabled) return;
      wrap.classList.add('open');
      openPanel();
      search.value = '';
      renderList(allOptions);
      setTimeout(() => search.focus(), 0);
    }

function close() {
      wrap.classList.remove('open');
      panel.setAttribute('style', 'display: none !important;');
    }

    function openPanel() {
      panel.removeAttribute('style');
    }

    function toggleOpen() {
      if (wrap.classList.contains('open')) close();
      else open();
    }

function renderList(items) {
      list.innerHTML = '';
      if (!items || items.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'loc-dropdown-empty';
        empty.textContent = 'No matches found';
        list.appendChild(empty);
        return;
      }
      items.forEach((name) => {
        const li = document.createElement('li');
        li.className = 'loc-dropdown-item' + (name === selectedValue ? ' active' : '');
        li.textContent = name;
        li.dataset.value = name;
        li.setAttribute('role', 'option');
        list.appendChild(li);
      });
    }

    // Event delegation: one listener handles clicks on any item, present or future
    list.addEventListener('click', (e) => {
      const item = e.target.closest('.loc-dropdown-item');
      if (!item || !item.dataset.value) return;
      e.stopPropagation();
      selectValue(item.dataset.value);
    });

    function selectValue(name) {
      selectedValue = name;
      text.textContent = name;
      text.classList.remove('is-placeholder');
      close();
      if (typeof onSelectCallback === 'function') onSelectCallback(name);
    }

    function setLoading(msg) {
      list.innerHTML = `<li class="loc-dropdown-loading">${msg}</li>`;
    }

    function setOptions(items) {
      allOptions = items || [];
      renderList(allOptions);
    }

    function reset(newPlaceholder) {
      selectedValue = '';
      text.textContent = newPlaceholder || placeholder;
      text.classList.add('is-placeholder');
      allOptions = [];
      list.innerHTML = '';
    }

    function setDisabled(isDisabled) {
      toggle.disabled = isDisabled;
      if (isDisabled) close();
    }

    // Search / filter as you type
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      const filtered = q ? allOptions.filter((n) => n.toLowerCase().includes(q)) : allOptions;
      renderList(filtered);
    });

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleOpen();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) close();
    });

    // Close on escape
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    return {
      setOptions,
      setLoading,
      reset,
      setDisabled,
      getValue: () => selectedValue,
      onSelect: (cb) => { onSelectCallback = cb; },
    };
  }

  async function fetchCountries() {
    if (countriesCache) return countriesCache;
    const res = await fetch(`${API_BASE}/countries`);
    const json = await res.json();
    if (json.error) throw new Error(json.msg || 'Failed to load countries');
    // Keep just the names, sorted alphabetically
    countriesCache = json.data
      .map((c) => c.country)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return countriesCache;
  }

  async function fetchStates(countryName) {
    if (statesCache[countryName]) return statesCache[countryName];
    const res = await fetch(`${API_BASE}/countries/states`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.msg || 'Failed to load states');
    const names = (json.data && json.data.states ? json.data.states : [])
      .map((s) => s.name)
      .filter(Boolean);
    statesCache[countryName] = names;
    return names;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const countryDD = createDropdown({
      wrapId: 'loc-country-dropdown',
      toggleId: 'loc-country-toggle',
      textId: 'loc-country-text',
      panelId: 'loc-country-panel',
      searchId: 'loc-country-search',
      listId: 'loc-country-list',
      placeholder: 'Select Country',
    });

    const stateDD = createDropdown({
      wrapId: 'loc-state-dropdown',
      toggleId: 'loc-state-toggle',
      textId: 'loc-state-text',
      panelId: 'loc-state-panel',
      searchId: 'loc-state-search',
      listId: 'loc-state-list',
      placeholder: 'Select State / Province',
    });

    if (!countryDD || !stateDD) return; // markup not present, nothing to do

    const countryHidden = document.getElementById('f-country');
    const stateHidden = document.getElementById('f-state');

    stateDD.setDisabled(true);
    stateDD.reset('Select Country First');

    countryDD.setLoading('Loading countries…');
    fetchCountries()
      .then((names) => countryDD.setOptions(names))
      .catch(() => countryDD.setOptions([]));

    countryDD.onSelect((countryName) => {
      if (countryHidden) {
        countryHidden.value = countryName;
        countryHidden.dispatchEvent(new Event('change', { bubbles: true }));
      }

      stateDD.reset('Loading states…');
      stateDD.setDisabled(true);
      if (stateHidden) stateHidden.value = '';
      stateDD.setLoading('Loading states…');

      fetchStates(countryName)
        .then((states) => {
          stateDD.setDisabled(false);
          stateDD.reset(states.length ? 'Select State / Province' : 'No states available');
          if (!states.length) {
            stateDD.setDisabled(true);
            return;
          }
          stateDD.setOptions(states);
        })
        .catch(() => {
          stateDD.reset('Could not load states');
          stateDD.setDisabled(true);
        });
    });

    stateDD.onSelect((stateName) => {
      if (stateHidden) {
        stateHidden.value = stateName;
        stateHidden.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
})();