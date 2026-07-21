import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function initTwin() {
  const mount = document.getElementById('twin3d-canvas');
  if (!mount) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0xc8dce8, 30, 180);

  const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 2000);
  // Zoomed in 20% — closer initial view
  camera.position.set(24, 15.6, 32);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  mount.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, -2, 0);
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.minDistance = 10;
  controls.maxDistance = 150;
  controls.update();

  const ro = new ResizeObserver(() => {
    if (!mount.clientWidth || !mount.clientHeight) return;
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  });
  ro.observe(mount);

  const ambient = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x87CEEB, 0x3d5a3a, 0.5);
  scene.add(hemi);

  const sunLight = new THREE.DirectionalLight(0xfff5e1, 1.8);
  sunLight.position.set(50, 80, 40);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 200;
  sunLight.shadow.camera.left = -60;
  sunLight.shadow.camera.right = 60;
  sunLight.shadow.camera.top = 60;
  sunLight.shadow.camera.bottom = -60;
  scene.add(sunLight);


  const channelGroup = new THREE.Group();
  scene.add(channelGroup);

  const waterVertexShader = `
    uniform float time;
    uniform float flowSpeed;
    uniform float waveIntensity;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave1 = sin(pos.x * 0.3 + time * flowSpeed) * 0.25 * waveIntensity;
      float wave2 = sin(pos.z * 0.5 + time * flowSpeed * 0.8) * 0.20 * waveIntensity;
      float wave3 = sin((pos.x + pos.z) * 0.8 + time * flowSpeed * 1.2) * 0.12 * waveIntensity;
      float wave4 = sin(pos.x * 1.2 + pos.z * 0.4 + time * flowSpeed * 0.5) * 0.08 * waveIntensity;
      float wave5 = sin(pos.x * 2.5 + pos.z * 1.5 + time * flowSpeed * 1.5) * 0.05 * waveIntensity;
      pos.y += wave1 + wave2 + wave3 + wave4 + wave5;
      vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
      float dx = cos(pos.x * 0.3 + time * flowSpeed) * 0.075 * waveIntensity +
                 cos((pos.x + pos.z) * 0.8 + time * flowSpeed * 1.2) * 0.096 * waveIntensity +
                 cos(pos.x * 1.2 + pos.z * 0.4 + time * flowSpeed * 0.5) * 0.096 * waveIntensity +
                 cos(pos.x * 2.5 + pos.z * 1.5 + time * flowSpeed * 1.5) * 0.125 * waveIntensity;
      float dz = cos(pos.z * 0.5 + time * flowSpeed * 0.8) * 0.10 * waveIntensity +
                 cos((pos.x + pos.z) * 0.8 + time * flowSpeed * 1.2) * 0.096 * waveIntensity +
                 cos(pos.x * 1.2 + pos.z * 0.4 + time * flowSpeed * 0.5) * 0.032 * waveIntensity +
                 cos(pos.x * 2.5 + pos.z * 1.5 + time * flowSpeed * 1.5) * 0.075 * waveIntensity;
      vNormal = normalize(vec3(-dx, 1.0, -dz));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const waterFragmentShader = `
    uniform float time;
    uniform vec3 waterColor;
    uniform vec3 sunDirection;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vec3 normal = normalize(vNormal);
      float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
      vec3 halfDir = normalize(viewDir + sunDirection);
      float specAngle = max(dot(normal, halfDir), 0.0);
      float specular = pow(specAngle, 64.0) * 0.8;
      float caustic1 = sin(vWorldPos.x * 2.0 + time * 0.5) * sin(vWorldPos.z * 2.0 + time * 0.3);
      float caustic2 = sin(vWorldPos.x * 3.5 - time * 0.4) * sin(vWorldPos.z * 1.5 + time * 0.6);
      float caustics = (caustic1 + caustic2) * 0.03;
      float flowLine = sin(vWorldPos.x * 8.0 + vWorldPos.z * 0.5 + time * 2.0) * 0.5 + 0.5;
      flowLine = pow(flowLine, 8.0) * 0.08;
      vec3 deepColor = waterColor * 0.6;
      vec3 shallowColor = waterColor * 1.3;
      vec3 baseColor = mix(deepColor, shallowColor, fresnel * 0.5 + 0.3);
      vec3 finalColor = baseColor + vec3(specular) + vec3(caustics) + vec3(flowLine);
      gl_FragColor = vec4(finalColor, 0.92);
    }
  `;

  let waterMesh;
  let waterUniforms = {
    time: { value: 0 },
    flowSpeed: { value: 1.0 },
    waveIntensity: { value: 1.0 },
    waterColor: { value: new THREE.Color(0x2a7a9a) },
    sunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() }
  };

  function buildWater(width, length) {
    if (waterMesh) channelGroup.remove(waterMesh);
    const geometry = new THREE.PlaneGeometry(length, width, 80, 40);
    const material = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: waterUniforms,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    waterMesh = new THREE.Mesh(geometry, material);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = 0.5;
    waterMesh.receiveShadow = true;
    waterMesh.renderOrder = 10;
    channelGroup.add(waterMesh);
  }

  function buildRiverbed(length, width, depth) {
    const toRemove = [];
    channelGroup.children.forEach(child => {
      if (child !== waterMesh) toRemove.push(child);
    });
    toRemove.forEach(child => channelGroup.remove(child));
    if (waterMesh) channelGroup.remove(waterMesh);

    const bedMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.9, metalness: 0.05 });
    const bed = new THREE.Mesh(new THREE.BoxGeometry(length, 0.3, width), bedMat);
    bed.position.y = -depth - 1.0;
    bed.receiveShadow = true;
    channelGroup.add(bed);

    const rockGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a5045, roughness: 1 });
    for (let i = 0; i < 20; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(
        (Math.random() - 0.5) * length * 0.8,
        -depth + 0.05,
        (Math.random() - 0.5) * width * 0.7
      );
      rock.scale.setScalar(0.4 + Math.random() * 1.0);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      channelGroup.add(rock);
    }

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 0.85 });
    const wallTopMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.8 });
    const wallHeight = depth + 1.35;
    const wallThick = 0.4;

    const wallL = new THREE.Mesh(new THREE.BoxGeometry(length, wallHeight, wallThick), wallMat);
    wallL.position.set(0, -depth / 2 - 0.175, width / 2 + wallThick / 2);
    wallL.castShadow = true;
    wallL.receiveShadow = true;
    channelGroup.add(wallL);

    const wallR = new THREE.Mesh(new THREE.BoxGeometry(length, wallHeight, wallThick), wallMat);
    wallR.position.set(0, -depth / 2 - 0.175, -width / 2 - wallThick / 2);
    wallR.castShadow = true;
    wallR.receiveShadow = true;
    channelGroup.add(wallR);

    const capL = new THREE.Mesh(new THREE.BoxGeometry(length, 0.15, wallThick + 0.3), wallTopMat);
    capL.position.set(0, 0.48, width / 2 + wallThick / 2);
    capL.castShadow = true;
    channelGroup.add(capL);

    const capR = new THREE.Mesh(new THREE.BoxGeometry(length, 0.15, wallThick + 0.3), wallTopMat);
    capR.position.set(0, 0.48, -width / 2 - wallThick / 2);
    capR.castShadow = true;
    channelGroup.add(capR);

    const slopeGeo = new THREE.BoxGeometry(length, 1.5, 3);
    const slopeMat = new THREE.MeshStandardMaterial({ color: 0x5a7a4a, roughness: 1 });

    const slopeL = new THREE.Mesh(slopeGeo, slopeMat);
    slopeL.position.set(0, -0.25, width / 2 + 2);
    slopeL.rotation.x = -0.15;
    slopeL.receiveShadow = true;
    channelGroup.add(slopeL);

    const slopeR = new THREE.Mesh(slopeGeo, slopeMat);
    slopeR.position.set(0, -0.25, -width / 2 - 2);
    slopeR.rotation.x = 0.15;
    slopeR.receiveShadow = true;
    channelGroup.add(slopeR);

    if (waterMesh) {
      waterMesh.position.y = 0.5;
      channelGroup.add(waterMesh);
    }
  }

  const turbineGroup = new THREE.Group();
  scene.add(turbineGroup);
  const rotors = [];

  // Wake flow lines to visualize velocity
  const wakeGroup = new THREE.Group();
  scene.add(wakeGroup);
  const wakeLines = [];

  function buildWakeLines(length, width, velocity) {
    // Clear existing wake lines
    wakeLines.forEach(w => wakeGroup.remove(w.mesh));
    wakeLines.length = 0;

    // Number of wake lines proportional to velocity (more lines = faster flow)
    const lineCount = Math.max(3, Math.min(20, Math.round(velocity * 6)));
    const wakeMat = new THREE.LineBasicMaterial({ 
      color: 0x88ccff, 
      transparent: true, 
      opacity: 0.35 + (velocity * 0.1) 
    });

    for (let i = 0; i < lineCount; i++) {
      const zPos = -width / 2 + (width / (lineCount + 1)) * (i + 1);
      const points = [];
      const segments = 40;
      for (let j = 0; j <= segments; j++) {
        const x = -length / 2 + (length / segments) * j;
        const y = 0.5 + Math.sin(x * 0.5 + i) * 0.05;
        points.push(new THREE.Vector3(x, y, zPos));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, wakeMat.clone());
      wakeGroup.add(line);
      wakeLines.push({ mesh: line, offset: i * 0.5, speed: velocity });
    }
  }

  function updateWakeLines(time) {
    wakeLines.forEach(wake => {
      const positions = wake.mesh.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        // Broken/dashed effect: segments appear/disappear based on time
        const dashPhase = Math.sin(x * 2 + time * wake.speed * 3 + wake.offset) > 0.3 ? 1 : 0;
        // Wiggle amplitude increases with velocity
        const wiggle = Math.sin(x * 1.5 + time * wake.speed * 2 + wake.offset) * 0.08 * wake.speed;
        positions.setY(i, 0.5 + wiggle * dashPhase);
      }
      positions.needsUpdate = true;
      // Pulsing opacity based on velocity
      wake.mesh.material.opacity = 0.2 + Math.sin(time * wake.speed * 2 + wake.offset) * 0.15 + (wake.speed * 0.08);
    });
  }

  function buildTurbine(xPos, hubY, depth, zPos = 0) {
    const g = new THREE.Group();
    
    // Larger turbine for visibility
    const scale = 2.5;

    // Rotate so housing points Z (width), rotor faces Z
    g.rotation.y = -Math.PI / 2;

    // --- Surface Mounting Post ---
    const armMat = new THREE.MeshStandardMaterial({ 
      color: 0x6a7a8a, metalness: 0.6, roughness: 0.3 
    });
    const postHeight = Math.min(Math.abs(hubY) + depth * 0.5, Math.abs(hubY) + 1.5);
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 * scale, 0.15 * scale, 1, 12), 
      armMat
    );
    post.scale.y = postHeight;
    post.position.y = -postHeight / 2;
    post.castShadow = true;
    g.add(post);

    // Surface platform
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(1.4 * scale, 0.12, 1.0 * scale),
      armMat
    );
    platform.position.y = 0.3;
    platform.castShadow = true;
    g.add(platform);

    // --- Main Housing (FLAT SIDES) ---
    const housingMat = new THREE.MeshStandardMaterial({ 
      color: 0xf5f8fa, metalness: 0.6, roughness: 0.25, 
      emissive: 0x1a2a3a, emissiveIntensity: 0.15 
    });
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(0.9 * scale, 0.7 * scale, 1.4 * scale), 
      housingMat
    );
    housing.castShadow = true;
    g.add(housing);

    // --- Front Nose (FLAT) ---
    const noseMat = new THREE.MeshStandardMaterial({ 
      color: 0xe8eef4, metalness: 0.55, roughness: 0.2, 
      emissive: 0x1a2a3a, emissiveIntensity: 0.1 
    });
    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(0.7 * scale, 0.5 * scale, 0.6 * scale), 
      noseMat
    );
    nose.position.x = 0.95 * scale;
    nose.castShadow = true;
    g.add(nose);

    // --- Rear Tail (FLAT) ---
    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.8 * scale, 0.6 * scale, 0.7 * scale), 
      noseMat
    );
    tail.position.x = -1.05 * scale;
    tail.castShadow = true;
    g.add(tail);

    // --- ROTOR with STRAIGHT, WIDE BLADES ---
    const rotor = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xc8d8e8, metalness: 0.8, roughness: 0.15, 
      side: THREE.DoubleSide, emissive: 0x2a4a6a, emissiveIntensity: 0.2
    });

    for (let i = 0; i < 5; i++) {
      const holder = new THREE.Group();
      holder.rotation.x = (i * Math.PI * 2) / 5;

      // STRAIGHT, WIDE blade shape (trapezoid)
      const bladeShape = new THREE.Shape();
      // Root (near hub) — wider
      bladeShape.moveTo(-0.30 * scale, 0.15 * scale);
      bladeShape.lineTo(0.30 * scale, 0.15 * scale);
      // Tip — slightly tapered
      bladeShape.lineTo(0.22 * scale, 1.20 * scale);
      bladeShape.lineTo(-0.22 * scale, 1.20 * scale);
      // Close back to root
      bladeShape.lineTo(-0.30 * scale, 0.15 * scale);

      // Thicker extrusion for visible blade
      const extrudeSettings = {
        depth: 0.15 * scale,
        bevelEnabled: true,
        bevelThickness: 0.03 * scale,
        bevelSize: 0.03 * scale,
        bevelSegments: 2
      };
      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      
      // No twist — blade stays straight
      blade.position.set(0, 0, -0.075 * scale);
      blade.castShadow = true;
      holder.add(blade);
      rotor.add(holder);
    }

    const hubMat = new THREE.MeshStandardMaterial({ 
      color: 0xd8e4f0, metalness: 0.85, roughness: 0.1, 
      emissive: 0x3a5a7a, emissiveIntensity: 0.25 
    });
    const hubCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.30 * scale, 20, 20), 
      hubMat
    );
    hubCap.scale.set(1, 0.5, 1);
    rotor.add(hubCap);

    const spinner = new THREE.Mesh(
      new THREE.SphereGeometry(0.20 * scale, 16, 16), 
      hubMat
    );
    spinner.position.x = 1.3 * scale;
    rotor.add(spinner);

    g.add(rotor);
    
    g.position.set(xPos, hubY, zPos);
    turbineGroup.add(g);

    const turbineLight = new THREE.PointLight(0x88ccff, 0.8, 15);
    turbineLight.position.set(xPos, hubY + 0.5, zPos);
    turbineGroup.add(turbineLight);
    rotors.push(rotor);
  }

  function getVal(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    // Special handling for length slider (non-linear 0-100 -> 500-200000m)
    if (id === 'f-length') {
      return getLengthFromSlider(parseFloat(el.value));
    }
    return parseFloat(el.value);
  }

  function getLengthFromSlider(rawVal) {
    if (rawVal <= 20) {
      // Phase 1: 500m to 2000m (fine control for small installations)
      return Math.round(500 + rawVal * 75);
    } else {
      // Phase 2: 5000m to 200000m (coarse control for large installations)
      const t = (rawVal - 20) / 80;
      return Math.round(5000 + t * t * 195000);
    }
  }

  function getSliderFromLength(length) {
    if (length <= 2000) {
      return (length - 500) / 75;
    } else {
      return 20 + Math.sqrt((length - 5000) / 195000) * 80;
    }
  }

  function estimatePowerKW(width, depth, velocity) {
    const rho = 1000, Cp = 0.35;
    return 0.5 * rho * (width * depth) * Math.pow(velocity, 3) * Cp / 1000;
  }

  const powerOut = document.getElementById('twin-power');
  const turbineCountOut = document.getElementById('twin-turbine-count');
  const segmentNote = document.getElementById('twin-segment-note');

  function rebuild() {
    const width = getVal('f-width') || 12;
    const depth = getVal('f-depth') || 2;
    const velocity = getVal('f-velocity') || 1.5;
    const discharge = getVal('f-discharge') || 0;
    const variation = getVal('f-variation') || 0;
    const realLength = getVal('f-length') || 250;

    // FIX: displayLength now scales with realLength (capped 20-80 for performance)
    let displayLength;
    if (realLength <= 250) {
      displayLength = 20;
    } else {
      displayLength = Math.min(80, Math.max(20, 20 + Math.log10(realLength / 250) * 30));
    }

    const waterLevel = 0.5 + (variation * 0.1);
    if (waterMesh) waterMesh.position.y = waterLevel;

    buildWater(width, displayLength);
    buildRiverbed(displayLength, width, depth);

    turbineGroup.clear();
    rotors.length = 0;

    const bladeRadius = 1.15 * 2.5;
    const hubY = waterLevel + bladeRadius * 0.25;

    // Turbine count and spacing now based on displayLength
    const turbineSpacing = 20;
    const maxTurbines = Math.floor((displayLength - 10) / turbineSpacing);
    const turbineCount = Math.max(1, Math.min(6, maxTurbines));

    const startX = -displayLength / 2 + turbineSpacing;
    for (let i = 0; i < turbineCount; i++) {
      const xPos = startX + i * turbineSpacing;
      buildTurbine(xPos, hubY, depth, 0);
    }

    buildWakeLines(displayLength, width, velocity);

    const powerKW = estimatePowerKW(width, depth, velocity) * turbineCount;
    if (powerOut) powerOut.textContent = Math.round(powerKW).toLocaleString() + ' kW';
    if (turbineCountOut) turbineCountOut.textContent = turbineCount;
    if (segmentNote) {
      segmentNote.textContent =
        `Segment shown: ${width.toFixed(1)} m wide × ${depth.toFixed(1)} m deep, flowing at ${velocity.toFixed(1)} m/s` +
        (discharge ? ` (~${discharge} cumecs)` : '') +
        (variation ? `, variation ±${variation.toFixed(1)} m` : '') +
        `. Full installation length: ${realLength} m.`;
    }

    waterUniforms.flowSpeed.value = velocity * 1.5;
    waterUniforms.waveIntensity.value = 0.5 + Math.min(2.0, discharge / 100);
  }

  ['f-width', 'f-depth', 'f-velocity', 'f-length', 'f-discharge', 'f-variation'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', rebuild);
  });

  function flyTo(pos, target) {
    camera.position.set(pos.x, pos.y, pos.z);
    controls.target.set(target.x, target.y, target.z);
    controls.update();
  }

  document.querySelectorAll('.twin3d-views button').forEach(btn => {
    btn.addEventListener('click', () => {
      const width = getVal('f-width') || 12, depth = getVal('f-depth') || 2;
      const displayLength = Math.min(80, Math.max(20, width * 2.5));
      if (btn.dataset.view === 'top') {
        flyTo({ x: 0.001, y: Math.max(30, displayLength * 0.9), z: 0.001 }, { x: 0, y: 0, z: 0 });
      } else if (btn.dataset.view === 'side') {
        flyTo({ x: 0.001, y: -depth / 2, z: Math.max(20, width * 2.2) }, { x: 0, y: -depth / 2, z: 0 });
      } else {
        flyTo({ x: displayLength * 0.55, y: displayLength * 0.35, z: width * 1.6 + 15 }, { x: 0, y: -depth / 3, z: 0 });
      }
    });
  });

  rebuild();

  // Expose rebuild globally so atlas.js can sync the 3D twin
  window.twin3dRebuild = rebuild;

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    waterUniforms.time.value += dt;
    
    // FIX 2: rotors spin around local X (which is world Z after Y-rotation)
    rotors.forEach(r => { r.rotation.x += dt * 4; });
    
    updateWakeLines(elapsed);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
  })();