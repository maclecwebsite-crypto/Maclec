
(function (global) {
  'use strict';

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Small canvas-texture label sprite (used for depth/length ruler ticks)
  function makeLabelSprite(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '600 34px Manrope, Arial, sans-serif';
    ctx.fillStyle = color || '#8fd9f0';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 4, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.5, 0.75, 1);
    return sprite;
  }

  function RiverScene(container) {
    if (!global.THREE) {
      console.error('RiverScene: THREE.js must be loaded before river3d.js');
      return null;
    }
    const THREE_ = global.THREE;

    const state = {
      width: 12, depth: 2, velocity: 1.5, discharge: 40, variation: 0.8, length: 250
    };

    let width_ = container.clientWidth || 400;
    let height_ = container.clientHeight || 300;

    const scene = new THREE_.Scene();
    scene.background = new THREE_.Color(0x060d17);
    scene.fog = new THREE_.Fog(0x060d17, 14, 46);

    const camera = new THREE_.PerspectiveCamera(42, width_ / height_, 0.1, 200);

    const renderer = new THREE_.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    renderer.setSize(width_, height_);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';

    // ---- lighting ---------------------------------------------------------
    scene.add(new THREE_.AmbientLight(0x2a4a5f, 1.1));
    const sun = new THREE_.DirectionalLight(0xdff3ff, 1.1);
    sun.position.set(6, 12, 8);
    scene.add(sun);
    const rim = new THREE_.DirectionalLight(0x5ec4e0, 0.55);
    rim.position.set(-8, 4, -6);
    scene.add(rim);

    // ---- static-ish groups (rebuilt on relevant param changes) -----------
    const root = new THREE_.Group();
    scene.add(root);

    const bedMat = new THREE_.MeshStandardMaterial({ color: 0x0d2233, roughness: 0.9, metalness: 0.05 });
    const bankMat = new THREE_.MeshStandardMaterial({ color: 0x123349, roughness: 0.85, metalness: 0.08 });
    const waterMat = new THREE_.MeshPhysicalMaterial({
      color: 0x2f95c9, transparent: true, opacity: 0.58, roughness: 0.15,
      metalness: 0.05, clearcoat: 0.6, side: THREE_.DoubleSide, emissive: 0x0d3a4d, emissiveIntensity: 0.25
    });
    const streakMat = new THREE_.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.75 });
    const rotorMat = new THREE_.MeshStandardMaterial({ color: 0x11202c, roughness: 0.4, metalness: 0.6, emissive: 0x184b5c, emissiveIntensity: 0.4 });
    const bladeMat = new THREE_.MeshStandardMaterial({ color: 0x5ec4e0, roughness: 0.3, metalness: 0.3, emissive: 0x1c5f75, emissiveIntensity: 0.5 });
    const gridMat = new THREE_.LineBasicMaterial({ color: 0x3d6b82, transparent: true, opacity: 0.35 });

    let bed, banks = [], waterMesh, waterGeo, rulerGroup, floorGrid;
    const turbineGroup = new THREE_.Group(); root.add(turbineGroup);
    const streakGroup = new THREE_.Group(); root.add(streakGroup);
    const turbines = []; // { pivot, rotor }
    const streaks = [];  // { mesh, speed, x0, halfLen }

    let visualLength = 20, visualDepth = 3, visualWidth = 6, waterFillY = 2;

    function disposeObject(obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(m => {
          if (m.map) m.map.dispose();
          m.dispose && m.dispose();
        });
      }
    }
    function disposeGroupChildren(group) {
      while (group.children.length) {
        const c = group.children.pop();
        c.traverse(disposeObject);
      }
    }

    function buildStaticGeometry() {
      // clear previous
      if (bed) { root.remove(bed); bed.geometry.dispose(); }
      banks.forEach(b => { root.remove(b); b.geometry.dispose(); });
      banks = [];
      if (waterMesh) { root.remove(waterMesh); waterMesh.geometry.dispose(); }
      if (rulerGroup) { root.remove(rulerGroup); disposeGroupChildren(rulerGroup); }
      if (floorGrid) { root.remove(floorGrid); floorGrid.geometry.dispose(); }

      const d = state.depth, w = state.width, len = state.length;

      visualDepth = clamp(d * 1.3, 1.6, 8.5);
      visualWidth = clamp(w * 0.32, 3.2, 10.5);
      const t = clamp((len - 10) / 990, 0, 1);
      visualLength = 13 + Math.pow(t, 0.5) * 29;
      waterFillY = visualDepth * clamp(0.5 + state.velocity / 9, 0.5, 0.82);

      // bed slab
      const bedGeo = new THREE_.BoxGeometry(visualLength, 0.35, visualWidth);
      bed = new THREE_.Mesh(bedGeo, bedMat);
      bed.position.set(0, -0.175, 0);
      root.add(bed);

      // banks
      const bankHeight = visualDepth * 1.18;
      [1, -1].forEach(sign => {
        const bankGeo = new THREE_.BoxGeometry(visualLength, bankHeight, 0.4);
        const bank = new THREE_.Mesh(bankGeo, bankMat);
        bank.position.set(0, bankHeight / 2 - 0.175, sign * (visualWidth / 2 + 0.2));
        root.add(bank);
        banks.push(bank);
      });

      // water surface (subdivided for wave animation)
      const segX = 48, segZ = 10;
      waterGeo = new THREE_.PlaneGeometry(visualLength * 0.985, visualWidth * 0.94, segX, segZ);
      waterGeo.rotateX(-Math.PI / 2);
      waterMesh = new THREE_.Mesh(waterGeo, waterMat);
      waterMesh.position.y = waterFillY;
      root.add(waterMesh);

      // depth ruler on the near end wall
      rulerGroup = new THREE_.Group();
      const wallX = -visualLength / 2 - 0.02;
      const step = d > 6 ? 2 : 1;
      for (let m = 0; m <= Math.ceil(d) + step; m += step) {
        const y = m * (visualDepth / Math.max(d, 0.001));
        if (y > visualDepth * 1.25) break;
        const tickGeo = new THREE_.BufferGeometry().setFromPoints([
          new THREE_.Vector3(wallX, y, -visualWidth / 2 - 0.25),
          new THREE_.Vector3(wallX, y, -visualWidth / 2 - 0.55)
        ]);
        rulerGroup.add(new THREE_.Line(tickGeo, gridMat));
        const label = makeLabelSprite(m + 'm', '#8fd9f0');
        label.position.set(wallX, y, -visualWidth / 2 - 0.95);
        rulerGroup.add(label);
      }
      const vLineGeo = new THREE_.BufferGeometry().setFromPoints([
        new THREE_.Vector3(wallX, 0, -visualWidth / 2 - 0.25),
        new THREE_.Vector3(wallX, visualDepth * 1.2, -visualWidth / 2 - 0.25)
      ]);
      rulerGroup.add(new THREE_.Line(vLineGeo, gridMat));
      root.add(rulerGroup);

      // faint floor grid running the length, for a sense of scale/motion
      const gridPts = [];
      const lines = 6;
      for (let i = 0; i <= lines; i++) {
        const z = -visualWidth / 2 + (visualWidth / lines) * i;
        gridPts.push(new THREE_.Vector3(-visualLength / 2, 0.01, z), new THREE_.Vector3(visualLength / 2, 0.01, z));
      }
      const floorGeo = new THREE_.BufferGeometry().setFromPoints(gridPts);
      floorGrid = new THREE_.LineSegments(floorGeo, gridMat);
      root.add(floorGrid);
    }

    function buildTurbines() {
      disposeGroupChildren(turbineGroup);
      turbines.length = 0;
      const count = clamp(Math.round(state.width / 6), 1, 12);
      const spacing = visualLength / (count + 1);
      for (let i = 1; i <= count; i++) {
        const x = -visualLength / 2 + spacing * i;
        const pivot = new THREE_.Group();
        pivot.position.set(x, waterFillY * 0.55, 0);
        turbineGroup.add(pivot);

        const mount = new THREE_.Mesh(new THREE_.CylinderGeometry(0.05, 0.05, waterFillY * 0.55, 8), rotorMat);
        mount.position.y = -waterFillY * 0.275;
        pivot.add(mount);

        const ring = new THREE_.Mesh(new THREE_.TorusGeometry(0.32, 0.08, 10, 20), rotorMat);
        ring.rotation.y = Math.PI / 2;
        pivot.add(ring);

        const rotor = new THREE_.Group();
        pivot.add(rotor);
        for (let b = 0; b < 3; b++) {
          const bladeHolder = new THREE_.Group();
          bladeHolder.rotation.x = (b * Math.PI * 2) / 3;
          const blade = new THREE_.Mesh(new THREE_.BoxGeometry(0.05, 0.5, 0.14), bladeMat);
          blade.position.set(0, 0.28, 0);
          bladeHolder.add(blade);
          rotor.add(bladeHolder);
        }
        turbines.push({ pivot, rotor });
      }
    }

    function buildStreaks() {
      disposeGroupChildren(streakGroup);
      streaks.length = 0;
      const count = clamp(Math.round((state.discharge / 40) * 5), 3, 18);
      const halfLen = visualLength / 2;
      for (let i = 0; i < count; i++) {
        const geo = new THREE_.CylinderGeometry(0.045, 0.045, 0.9, 6);
        geo.rotateZ(Math.PI / 2);
        const mesh = new THREE_.Mesh(geo, streakMat);
        const z = (Math.random() - 0.5) * (visualWidth * 0.8);
        const y = waterFillY * (0.25 + Math.random() * 0.55);
        const x0 = -halfLen + Math.random() * visualLength;
        mesh.position.set(x0, y, z);
        streakGroup.add(mesh);
        streaks.push({ mesh, x0, z, y, phase: Math.random() * Math.PI * 2 });
      }
    }

    function rebuildAll() {
      buildStaticGeometry();
      buildTurbines();
      buildStreaks();
      frameCamera();
    }

    // ---- camera orbit (hand-rolled, no addons needed) ---------------------
    const camState = { theta: 1.05, phi: 1.2, radius: 20, target: new THREE_.Vector3(0, 1.5, 0) };
    let defaultCam = { theta: 1.05, phi: 1.2, radius: 20 };

    function frameCamera() {
      const radius = clamp(visualLength * 0.62, 10, 34);
      defaultCam = { theta: 1.05, phi: 1.2, radius };
      camState.radius = radius;
      camState.target.set(0, waterFillY * 0.7, 0);
      applyCamera();
    }

    function applyCamera() {
      const { theta, phi, radius, target } = camState;
      camera.position.set(
        target.x + radius * Math.sin(phi) * Math.cos(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target);
    }

    function resetView() {
      camState.theta = defaultCam.theta;
      camState.phi = defaultCam.phi;
      camState.radius = defaultCam.radius;
      applyCamera();
    }

    // pointer drag + wheel zoom
    let dragging = false, lastX = 0, lastY = 0;
    const dom = renderer.domElement;
    function onDown(e) {
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      dom.style.cursor = 'grabbing';
    }
    function onMove(e) {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      camState.theta -= dx * 0.005;
      camState.phi = clamp(camState.phi - dy * 0.005, 0.45, 1.5);
      applyCamera();
    }
    function onUp() { dragging = false; dom.style.cursor = 'grab'; }
    function onWheel(e) {
      e.preventDefault();
      camState.radius = clamp(camState.radius + e.deltaY * 0.02, 8, 46);
      applyCamera();
    }
    dom.addEventListener('pointerdown', onDown);
    global.addEventListener('pointermove', onMove);
    global.addEventListener('pointerup', onUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // ---- animation loop -----------------------------------------------------
    const clock = new THREE_.Clock();
    let rafId = null;
    let running = false;

    function animateFrame() {
      if (!running) return;
      rafId = global.requestAnimationFrame(animateFrame);
      const t = clock.getElapsedTime();
      const speed = clamp(state.velocity, 0.2, 5);
      const amp = clamp(state.variation * 0.55, 0.05, 1.1);

      // water ripple (fast, flow-driven) + slow level bob (variation-driven)
      if (waterGeo) {
        const pos = waterGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), z = pos.getZ(i);
          const wave = Math.sin(x * 0.6 - t * speed * 1.8) * 0.05 +
                       Math.sin(x * 0.22 + z * 0.4 - t * speed * 1.1) * amp * 0.35;
          pos.setY(i, wave);
        }
        pos.needsUpdate = true;
      }
      if (waterMesh) {
        waterMesh.position.y = waterFillY + Math.sin(t * 0.5) * amp * 0.15;
      }

      // turbine spin
      turbines.forEach((tb, i) => {
        tb.rotor.rotation.x += speed * 0.055 + 0.01;
      });

      // flow streaks drifting downstream, looping
      const halfLen = visualLength / 2;
      streaks.forEach(s => {
        let x = s.x0 + t * speed * 1.6;
        x = ((x + halfLen) % visualLength) - halfLen;
        s.mesh.position.set(x, s.y + Math.sin(t * 2 + s.phase) * 0.05, s.z);
      });

      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      clock.start();
      animateFrame();
    }
    function stop() {
      running = false;
      if (rafId) global.cancelAnimationFrame(rafId);
    }

    function resize() {
      width_ = container.clientWidth || width_;
      height_ = container.clientHeight || height_;
      if (!width_ || !height_) return;
      camera.aspect = width_ / height_;
      camera.updateProjectionMatrix();
      renderer.setSize(width_, height_);
    }

    const resizeObserver = ('ResizeObserver' in global) ? new ResizeObserver(() => resize()) : null;
    if (resizeObserver) resizeObserver.observe(container);
    global.addEventListener('resize', resize);

    function update(params) {
      Object.assign(state, params || {});
      rebuildAll();
    }

    function dispose() {
      stop();
      if (resizeObserver) resizeObserver.disconnect();
      global.removeEventListener('resize', resize);
      global.removeEventListener('pointermove', onMove);
      global.removeEventListener('pointerup', onUp);
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
    }

    rebuildAll();
    resize();

    return { update, start, stop, resize, resetView, dispose };
  }

  global.RiverScene = RiverScene;
})(window);