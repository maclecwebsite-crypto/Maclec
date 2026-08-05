import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const STATS = [
  { lat: 2,  lng: 330,  num: '100+', unit: 'GW',   label: 'India Potential' },
  { lat: 2,  lng: -5,  num: '10000', unit: 'TWh',  label: 'Self-identified potential worldwide' },
  { lat: 2,  lng: -74, num: 'Millions', unit: 'of km', label: 'Canal & river networks available worldwide' },
  { lat: 1,  lng: 28,  num: '3500+', unit: '',     label: 'Maclec self-identified sites' },
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

/* ── shared "chrome" text draw routine, used for each line ──
   Draws a glow halo, a dark bevel offset, then a metallic gradient fill —
   same look as before, factored out so it can be reused per line. */
function drawChromeLine(ctx, text, cx, cy, fontSize, weight) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${fontSize}px "Space Grotesk", Arial, sans-serif`;

  // 1) Outer soft cyan glow (halo), drawn a few times for a thicker bloom
  ctx.save();
  ctx.shadowColor = 'rgba(94, 196, 224, 0.95)';
  ctx.shadowBlur = fontSize * 0.35;
  ctx.fillStyle = 'rgba(94, 196, 224, 0.9)';
  for (let i = 0; i < 3; i++) {
    ctx.fillText(text, cx, cy);
  }
  ctx.restore();

  // 2) Dark bevel/shadow offset (gives the extruded "logo" edge)
  ctx.save();
  ctx.fillStyle = 'rgba(5, 15, 25, 0.9)';
  ctx.fillText(text, cx + fontSize * 0.03, cy + fontSize * 0.045);
  ctx.restore();

  // 3) Metallic gradient fill for the main glyph body
  const grad = ctx.createLinearGradient(cx, cy - fontSize / 2, cx, cy + fontSize / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.35, '#dff3fa');
  grad.addColorStop(0.55, '#9fd7ea');
  grad.addColorStop(0.75, '#5ec4e0');
  grad.addColorStop(1, '#2f95b3');
  ctx.save();
  ctx.shadowColor = 'rgba(94, 196, 224, 0.6)';
  ctx.shadowBlur = fontSize * 0.14;
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, cy);
  ctx.restore();
}


function createLabelTexture(topText, bottomText, options = {}) {
  const topFontSize = options.topFontSize ?? 98;
  const bottomFontSize = options.bottomFontSize ?? 114;
  const lineGap = options.lineGap ?? 16;
  const padX = 50;
  const padY = 34;

  const measure = document.createElement('canvas').getContext('2d');
  measure.font = `800 ${topFontSize}px "Space Grotesk", Arial, sans-serif`;
  const topWidth = measure.measureText(topText).width;
  measure.font = `700 ${bottomFontSize}px "Space Grotesk", Arial, sans-serif`;
  const bottomWidth = bottomText ? measure.measureText(bottomText).width : 0;

  const contentWidth = Math.max(topWidth, bottomWidth);
  const contentHeight = topFontSize + (bottomText ? lineGap + bottomFontSize : 0);

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(contentWidth + padX * 2);
  canvas.height = Math.ceil(contentHeight + padY * 2);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const topCy = padY + topFontSize / 2;
  const bottomCy = topCy + topFontSize / 2 + lineGap + bottomFontSize / 2;

  drawChromeLine(ctx, topText, cx, topCy, topFontSize, 800);
  if (bottomText) drawChromeLine(ctx, bottomText, cx, bottomCy, bottomFontSize, 700);

  // Thin bright highlight sheen across the top portion for a "chrome" specular feel
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const highlight = ctx.createLinearGradient(cx, 0, cx, canvas.height * 0.6);
  highlight.addColorStop(0, 'rgba(255,255,255,0.85)');
  highlight.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = highlight;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.aspect = canvas.width / canvas.height;
  return tex;
}

function createCurvedLabelMesh(topText, bottomText, sphereRadius, options = {}) {
  const tex = createLabelTexture(topText, bottomText, options);

  const labelH = options.labelHeight ?? 0.31;   // world height
  const labelW = labelH * tex.aspect;
  const geo = new THREE.PlaneGeometry(labelW, labelH, 48, 12);
  const pos = geo.attributes.position;
  const R = sphereRadius;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const distSq = x * x + y * y;
    const zOffset = R - Math.sqrt(Math.max(0, R * R - distSq));
    pos.setZ(i, -zOffset);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: false,
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
  camera.position.set(0, 0, 5.0);


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

  // Label curves with the globe's surface, lifted slightly above it so it
  // reads clearly without z-fighting, and rotates naturally with the earth.
  const LABEL_LIFT_RADIUS = RADIUS * 1.06;

const markerObjects = STATS.map((stat, idx) => {
  const surfacePos = latLngToVector3(stat.lat, stat.lng, RADIUS);
  const normal = surfacePos.clone().normalize();

  const topText    = stat.unit ? `${stat.num} ${stat.unit}` : stat.num;
  const bottomText = stat.label;

  /* ── ONLY the 3rd label (index 2) gets smaller text ── */
  const isThird = idx === 2;
const options = isThird
  ? { topFontSize: 126, bottomFontSize: 116, lineGap: 14, labelHeight: 0.28 }
  : {};

  const labelMesh = createCurvedLabelMesh(topText, bottomText, LABEL_LIFT_RADIUS, options);
  labelMesh.position.copy(normal.clone().multiplyScalar(LABEL_LIFT_RADIUS));
  labelMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  labelMesh.visible = false;
  earthGroup.add(labelMesh);

  return { labelMesh, localPos: surfacePos.clone() };
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
      m.labelMesh.material.opacity = isActive ? 1 : 0;
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