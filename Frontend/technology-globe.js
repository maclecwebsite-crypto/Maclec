import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const STATS = [
  { lat: 9,  lng: 330,  num: '100+', unit: 'GW',   label: 'India Potential' },
  { lat: 10,  lng: -5,  num: '10000', unit: 'TWh',  label: 'Self-identified potential worldwide' },
  { lat: 12,  lng: -94, num: 'Millions', unit: 'of km', label: 'Canal & river networks available worldwide' },
  { lat: 27,  lng: 78,  num: '3500+', unit: '',     label: 'Maclec self-identified sites' },
];

const RADIUS = 1.6;
const EARTH_TEXTURE_URL = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* ── canvas texture with glowing text ── */
function createLabelTexture(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const w = 2048;
  const h = 160;
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);

  ctx.font = 'bold 110px "Space Grotesk", Arial, sans-serif';
  const m = ctx.measureText(text);
  const tw = m.width;
  const padX = 80;
  const padY = 50;
  const rx = 44;

  // dark backing pill
  ctx.fillStyle = 'rgba(4, 10, 20, 0.55)';
  ctx.beginPath();
  ctx.roundRect((w - tw) / 2 - padX, h / 2 - 55 - padY, tw + padX * 2, 110 + padY * 2, rx);
  ctx.fill();

  // cyan glow
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px "Space Grotesk", Arial, sans-serif';
  ctx.shadowColor = '#5ec4e0';
  ctx.shadowBlur = 55;
  ctx.fillStyle = '#5ec4e0';
  ctx.fillText(text, w / 2, h / 2);

  // bright white core
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, w / 2, h / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* ── bend a plane so it hugs a sphere of given radius ── */
function createCurvedLabelMesh(text, sphereRadius) {
  const tex = createLabelTexture(text);

  const labelW = 1.35;   // world width
  const labelH = 0.28;   // world height
  const geo = new THREE.PlaneGeometry(labelW, labelH, 48, 12);
  const pos = geo.attributes.position;
  const R = sphereRadius * 1.002;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // push vertex back so it lies on the sphere surface
    const distSq = x * x + y * y;
    const zOffset = R - Math.sqrt(Math.max(0, R * R - distSq));
    pos.setZ(i, -zOffset);   // negative = inward toward globe center
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Mesh(geo, mat);
}

function init() {
  const wrap = document.getElementById('tglobeCanvasWrap');
  const canvas = document.getElementById('tglobeCanvas');
  const loadingEl = document.getElementById('tglobeLoading');
  if (!wrap || !canvas) return;

  const numEl = document.getElementById('tglobeNum');
  const labelEl = document.getElementById('tglobeLabel');
  const slideEl = document.getElementById('tglobeSlide');
  const prevBtn = document.getElementById('tglobePrev');
  const nextBtn = document.getElementById('tglobeNext');
  const dotsWrap = document.getElementById('tglobeDots');
  const captionEl = document.getElementById('tglobeCaption');

  let width = wrap.clientWidth;
  let height = wrap.clientHeight;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(5, 3, 5);
  scene.add(sun);

  // Earth group
  const earthGroup = new THREE.Group();
  scene.add(earthGroup);

  const loader = new THREE.TextureLoader();
  const geometry = new THREE.SphereGeometry(RADIUS, 64, 64);
  const material = new THREE.MeshStandardMaterial({ color: 0x1a3a55, roughness: 0.85, metalness: 0.05 });
  const globeMesh = new THREE.Mesh(geometry, material);
  earthGroup.add(globeMesh);

  loader.load(
    EARTH_TEXTURE_URL,
    (tex) => {
      material.map = tex;
      material.color.set(0xffffff);
      material.needsUpdate = true;
      if (loadingEl) loadingEl.classList.add('is-hidden');
    },
    undefined,
    () => {
      if (loadingEl) loadingEl.classList.add('is-hidden');
    }
  );

  // Atmosphere glow
  const glowGeo = new THREE.SphereGeometry(RADIUS * 1.04, 64, 64);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x5ec4e0,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  });
  earthGroup.add(new THREE.Mesh(glowGeo, glowMat));

  // ── Markers: curved label + dot at each stat location ──
  const markerObjects = STATS.map((stat, i) => {
    const pos = latLngToVector3(stat.lat, stat.lng, RADIUS);
    const normal = pos.clone().normalize();

    // curved label mesh hugging the surface
    const labelMesh = createCurvedLabelMesh(stat.label, RADIUS);
    // place exactly on surface, facing outward
    labelMesh.position.copy(normal.clone().multiplyScalar(RADIUS * 1.002));
    labelMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    labelMesh.visible = false;
    earthGroup.add(labelMesh);

    // cyan dot at the anchor point
    const dotGeo = new THREE.SphereGeometry(0.038, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x5ec4e0, transparent: true, opacity: 0 });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.position.copy(normal.clone().multiplyScalar(RADIUS * 1.015));
    earthGroup.add(dotMesh);

    return { labelMesh, dotMesh, localPos: pos.clone() };
  });

  // Controls — auto-rotate only, no free drag
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableRotate = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  let autoRotate = true;
  let idleTimer = null;
  let tweening = false;
  let activeIndex = 0;

  function pauseAutoRotate() {
    autoRotate = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { autoRotate = true; }, 4000);
  }

  // Swipe-to-snap
  let swipeStartX = 0;
  let isSwiping = false;

  function handleSwipeStart(x) { swipeStartX = x; isSwiping = true; }
  function handleSwipeEnd(x) {
    if (!isSwiping) return;
    isSwiping = false;
    const diff = x - swipeStartX;
    if (Math.abs(diff) < 50) return;
    pauseAutoRotate();
    if (diff > 0) {
      selectStat((activeIndex - 1 + STATS.length) % STATS.length, true);
    } else {
      selectStat((activeIndex + 1) % STATS.length, true);
    }
  }

  wrap.addEventListener('mousedown',  e => handleSwipeStart(e.clientX));
  wrap.addEventListener('mouseup',    e => handleSwipeEnd(e.clientX));
  wrap.addEventListener('mouseleave', () => isSwiping = false);
  wrap.addEventListener('touchstart', e => handleSwipeStart(e.touches[0].clientX), { passive: true });
  wrap.addEventListener('touchend',   e => handleSwipeEnd(e.changedTouches[0].clientX), { passive: true });

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    STATS.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tglobe-dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('aria-label', `Show stat ${i + 1}`);
      b.addEventListener('click', () => selectStat(i, true));
      dotsWrap.appendChild(b);
    });
  }
  buildDots();

  function renderSlide(i) {
    const stat = STATS[i];
    if (slideEl) {
      slideEl.classList.remove('tglobe-slide');
      void slideEl.offsetWidth;
      slideEl.classList.add('tglobe-slide');
    }
    if (numEl) numEl.innerHTML = stat.unit ? `${stat.num} <small>${stat.unit}</small>` : stat.num;
    if (labelEl) labelEl.textContent = stat.label;
    if (captionEl) captionEl.textContent = stat.label;

    // only active marker visible
    markerObjects.forEach((m, idx) => {
      const isActive = idx === i;
      m.labelMesh.visible = isActive;
      m.labelMesh.material.opacity = isActive ? 0.95 : 0;
      m.dotMesh.material.opacity = isActive ? 1 : 0;
      m.dotMesh.visible = isActive;
    });

    if (dotsWrap) {
      dotsWrap.querySelectorAll('.tglobe-dot').forEach((d, idx) => d.classList.toggle('is-active', idx === i));
    }
  }

  function rotateToStat(i) {
    const local = markerObjects[i].localPos;
    const targetY = Math.atan2(-local.x, local.z);
    tweenRotationY(targetY);
  }

  function tweenRotationY(targetY) {
    tweening = true;
    const startY = earthGroup.rotation.y;
    let delta = targetY - startY;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    const duration = 700;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      earthGroup.rotation.y = startY + delta * eased;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        tweening = false;
      }
    }
    requestAnimationFrame(step);
  }

  function selectStat(i, moveGlobe) {
    activeIndex = i;
    renderSlide(i);
    if (moveGlobe) {
      pauseAutoRotate();
      rotateToStat(i);
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => selectStat((activeIndex - 1 + STATS.length) % STATS.length, true));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => selectStat((activeIndex + 1) % STATS.length, true));
  }

  renderSlide(0);

  // Resize
  const ro = new ResizeObserver(() => {
    width = wrap.clientWidth;
    height = wrap.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  ro.observe(wrap);

  // Pause when off-screen
  let isVisible = true;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { isVisible = e.isIntersecting; }),
    { threshold: 0.05 }
  );
  io.observe(wrap);

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    if (autoRotate && !tweening) {
      earthGroup.rotation.y += 0.0016;
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}