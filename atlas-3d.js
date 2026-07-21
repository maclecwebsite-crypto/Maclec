import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function initTwin() {
  const mount = document.getElementById('twin3d-canvas');
  if (!mount) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0xc8dce8, 30, 180);

  const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 2000);
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
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.update();

  initDepthScene();

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

    // Water volume — visible from side angles
    const waterVolMat = new THREE.MeshStandardMaterial({
      color: 0x1a5a7a,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.1,
      depthWrite: false
    });
    const waterVol = new THREE.Mesh(new THREE.BoxGeometry(length, depth + 0.5, width * 0.96), waterVolMat);
    waterVol.position.y = -depth / 2 + 0.25;
    waterVol.renderOrder = 9;
    channelGroup.add(waterVol);

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

  const wakeGroup = new THREE.Group();
  scene.add(wakeGroup);
  const wakeLines = [];

  function buildWakeLines(length, width, velocity) {
    wakeLines.forEach(w => wakeGroup.remove(w.mesh));
    wakeLines.length = 0;
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
        const dashPhase = Math.sin(x * 2 + time * wake.speed * 3 + wake.offset) > 0.3 ? 1 : 0;
        const wiggle = Math.sin(x * 1.5 + time * wake.speed * 2 + wake.offset) * 0.08 * wake.speed;
        positions.setY(i, 0.5 + wiggle * dashPhase);
      }
      positions.needsUpdate = true;
      wake.mesh.material.opacity = 0.2 + Math.sin(time * wake.speed * 2 + wake.offset) * 0.15 + (wake.speed * 0.08);
    });
  }

  function buildTurbine(xPos, hubY, depth, zPos = 0) {
    const g = new THREE.Group();
    const scale = 2.5;
    g.rotation.y = -Math.PI / 2;

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

    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(1.4 * scale, 0.12, 1.0 * scale),
      armMat
    );
    platform.position.y = 0.3;
    platform.castShadow = true;
    g.add(platform);

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

    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.8 * scale, 0.6 * scale, 0.7 * scale),
      noseMat
    );
    tail.position.x = -1.05 * scale;
    tail.castShadow = true;
    g.add(tail);

    const rotor = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xc8d8e8, metalness: 0.8, roughness: 0.15,
      side: THREE.DoubleSide, emissive: 0x2a4a6a, emissiveIntensity: 0.2
    });

    for (let i = 0; i < 5; i++) {
      const holder = new THREE.Group();
      holder.rotation.x = (i * Math.PI * 2) / 5;
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(-0.30 * scale, 0.15 * scale);
      bladeShape.lineTo(0.30 * scale, 0.15 * scale);
      bladeShape.lineTo(0.22 * scale, 1.20 * scale);
      bladeShape.lineTo(-0.22 * scale, 1.20 * scale);
      bladeShape.lineTo(-0.30 * scale, 0.15 * scale);
      const extrudeSettings = {
        depth: 0.15 * scale,
        bevelEnabled: true,
        bevelThickness: 0.03 * scale,
        bevelSize: 0.03 * scale,
        bevelSegments: 2
      };
      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
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
    if (id === 'f-length') {
      return getLengthFromSlider(parseFloat(el.value));
    }
    return parseFloat(el.value);
  }

  function getLengthFromSlider(rawVal) {
    if (rawVal <= 20) {
      return Math.round(500 + rawVal * 75);
    } else {
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
        `Segment shown: ${width.toFixed(1)} m wide x ${depth.toFixed(1)} m deep, flowing at ${velocity.toFixed(1)} m/s` +
        (discharge ? ` (~${discharge} cumecs)` : '') +
        (variation ? `, variation +/-${variation.toFixed(1)} m` : '') +
        `. Full installation length: ${realLength} m.`;
    }

    waterUniforms.flowSpeed.value = velocity * 1.5;
    waterUniforms.waveIntensity.value = 0.5 + Math.min(2.0, discharge / 100);

    if (window.twin3dDepthRebuild) {
      window.twin3dDepthRebuild(width, depth, waterLevel, hubY);
    }
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
  window.twin3dRebuild = rebuild;

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    waterUniforms.time.value += dt;
    rotors.forEach(r => { r.rotation.x += dt * 4; });
    updateWakeLines(elapsed);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
})();


function initDepthScene() {
  const depthMount = document.getElementById('twin3d-depth-canvas');
  if (!depthMount) return;

  const depthScene = new THREE.Scene();
  depthScene.background = new THREE.Color(0x0d1b2a);

  // Fixed orthographic camera — never changes zoom
  const baseViewWidth = 9;
  const aspect = depthMount.clientWidth / depthMount.clientHeight;

  const depthCamera = new THREE.OrthographicCamera(
    -baseViewWidth / 2, baseViewWidth / 2,
    (baseViewWidth / aspect) / 2, -(baseViewWidth / aspect) / 2,
    0.1, 200
  );
  depthCamera.position.set(0, 0, 40);
  depthCamera.lookAt(0, 0, 0);

  const depthRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  depthRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  depthRenderer.setSize(depthMount.clientWidth, depthMount.clientHeight);
  depthMount.appendChild(depthRenderer.domElement);

  const depthRO = new ResizeObserver(() => {
    if (!depthMount.clientWidth || !depthMount.clientHeight) return;
    const a = depthMount.clientWidth / depthMount.clientHeight;
    const dh = baseViewWidth / a;
    depthCamera.top = dh / 2;
    depthCamera.bottom = -dh / 2;
    depthCamera.updateProjectionMatrix();
    depthRenderer.setSize(depthMount.clientWidth, depthMount.clientHeight);
  });
  depthRO.observe(depthMount);

  const depthAmbient = new THREE.AmbientLight(0xffffff, 0.7);
  depthScene.add(depthAmbient);

  // --- SCALE FACTOR: channel geometry scales to fit fixed camera ---
  const maxChannelWidth = 60;
  const maxChannelDepth = 10;
  const widthScale = (baseViewWidth * 1.0) / maxChannelWidth;
  const heightScale = ((baseViewWidth / aspect) * 1.0) / maxChannelDepth;
  const sceneScale = Math.min(widthScale, heightScale);

  // Vertical offset to center channel in frame
  const vOffset = (baseViewWidth / aspect) * 0.28;

  // --- WATER SURFACE (separate from channel group, always in front) ---
  const depthWaterGeo = new THREE.PlaneGeometry(1, 1);
  const depthWaterMat = new THREE.MeshBasicMaterial({
    color: 0x2a9aaa,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const depthWater = new THREE.Mesh(depthWaterGeo, depthWaterMat);
  depthWater.renderOrder = 5;
  depthScene.add(depthWater);

  // --- CHANNEL GROUP (bed + walls, scaled together) ---
  const depthChannelGroup = new THREE.Group();
  depthChannelGroup.scale.set(sceneScale, sceneScale, 1);
  depthChannelGroup.position.y = vOffset;
  depthScene.add(depthChannelGroup);

  // Riverbed
  const depthBedMat = new THREE.MeshBasicMaterial({ color: 0x4a3f35 });
  const depthBed = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), depthBedMat);
  depthBed.rotation.set(0, 0, 0);
  depthChannelGroup.add(depthBed);

  // Left wall
  const depthWallMat = new THREE.MeshBasicMaterial({ color: 0x8a7a6a });
  const depthWallL = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), depthWallMat);
  depthChannelGroup.add(depthWallL);

  // Right wall
  const depthWallR = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), depthWallMat);
  depthChannelGroup.add(depthWallR);

  // Water surface highlight line
  const surfaceLineMat = new THREE.LineBasicMaterial({ color: 0x5ec4e0, linewidth: 2 });
  const surfaceLineGeo = new THREE.BufferGeometry();
  const surfaceLine = new THREE.Line(surfaceLineGeo, surfaceLineMat);
  depthScene.add(surfaceLine);

  // --- TURBINE ---
  const depthTurbineGroup = new THREE.Group();
  depthTurbineGroup.scale.set(sceneScale, sceneScale, 1);
  depthTurbineGroup.position.y = vOffset;
  depthScene.add(depthTurbineGroup);

  const depthTurbineMat = new THREE.MeshBasicMaterial({ color: 0xc8d8e8 });
  const depthTurbineHub = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), depthTurbineMat);
  depthTurbineGroup.add(depthTurbineHub);

  const depthBladeLines = [];
  for (let i = 0; i < 3; i++) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0.3),
      new THREE.Vector3(0, 1, 0.3)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x88ccff, linewidth: 2 });
    const line = new THREE.Line(lineGeo, lineMat);
    line.rotation.z = (i * Math.PI * 2) / 3;
    depthTurbineGroup.add(line);
    depthBladeLines.push(line);
  }

  // --- RULERS ---
  const rulerGroup = new THREE.Group();
  depthScene.add(rulerGroup);
  const rulerTickMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  let rulerTicks = [];

  function buildRuler(viewBottom, viewTop) {
    rulerTicks.forEach(t => rulerGroup.remove(t));
    rulerTicks = [];
    const totalRange = viewTop - viewBottom;
    const step = totalRange > 8 ? 2 : (totalRange > 4 ? 1 : 0.5);
    const startY = Math.ceil(viewBottom / step) * step;
    for (let y = startY; y <= viewTop; y += step) {
      const longTick = (Math.abs(y - Math.round(y)) < 0.01);
      const tickLen = longTick ? 0.35 : 0.2;
      const tickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-baseViewWidth / 2 + 0.05, y, 0.5),
        new THREE.Vector3(-baseViewWidth / 2 + 0.05 + tickLen, y, 0.5)
      ]);
      const tick = new THREE.Line(tickGeo, rulerTickMat);
      rulerGroup.add(tick);
      rulerTicks.push(tick);
    }
    const rulerLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-baseViewWidth / 2 + 0.05, viewBottom - 0.3, 0.5),
      new THREE.Vector3(-baseViewWidth / 2 + 0.05, viewTop + 0.3, 0.5)
    ]);
    const rulerLine = new THREE.Line(rulerLineGeo, rulerTickMat);
    rulerGroup.add(rulerLine);
    rulerTicks.push(rulerLine);
  }

  const widthScaleGroup = new THREE.Group();
  depthScene.add(widthScaleGroup);
  let widthTicks = [];

  function buildWidthScale(viewLeft, viewRight) {
    widthTicks.forEach(t => widthScaleGroup.remove(t));
    widthTicks = [];
    const totalRange = viewRight - viewLeft;
    const step = totalRange > 20 ? 5 : (totalRange > 10 ? 2 : 1);
    const startX = Math.ceil(viewLeft / step) * step;
    for (let x = startX; x <= viewRight; x += step) {
      const tickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, -baseViewWidth / aspect / 2 + 0.05, 0.5),
        new THREE.Vector3(x, -baseViewWidth / aspect / 2 + 0.05 + 0.2, 0.5)
      ]);
      const tick = new THREE.Line(tickGeo, rulerTickMat);
      widthScaleGroup.add(tick);
      widthTicks.push(tick);
    }
    const hLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(viewLeft - 0.3, -baseViewWidth / aspect / 2 + 0.05, 0.5),
      new THREE.Vector3(viewRight + 0.3, -baseViewWidth / aspect / 2 + 0.05, 0.5)
    ]);
    const hLine = new THREE.Line(hLineGeo, rulerTickMat);
    widthScaleGroup.add(hLine);
    widthTicks.push(hLine);
  }

  // --- LABEL ---
  const labelDiv = document.createElement('div');
  labelDiv.style.cssText = `
    position: absolute;
    bottom: 2px;
    right: 2px;
    font-size: 7px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    background: rgba(6,13,23,0.5);
    padding: 2px 5px;
    border-radius: 3px;
    pointer-events: none;
    line-height: 1.3;
    font-family: 'Space Grotesk', sans-serif;
    z-index: 5;
    text-align: right;
  `;
  depthMount.appendChild(labelDiv);

  // --- FLOW ARROW ---
  const flowArrowGroup = new THREE.Group();
  flowArrowGroup.scale.set(sceneScale, sceneScale, 1);
  flowArrowGroup.position.y = vOffset;
  depthScene.add(flowArrowGroup);

  const arrowMat = new THREE.MeshBasicMaterial({ color: 0x5ec4e0, transparent: true, opacity: 0.6 });
  const arrowShaftGeo = new THREE.PlaneGeometry(3, 0.15);
  const arrowShaft = new THREE.Mesh(arrowShaftGeo, arrowMat);
  arrowShaft.position.set(-1.5, 0, 0.3);
  flowArrowGroup.add(arrowShaft);

  const arrowHeadGeo = new THREE.BufferGeometry();
  const arrowHeadPoints = [
    new THREE.Vector3(0, 0.3, 0.3),
    new THREE.Vector3(0.5, 0, 0.3),
    new THREE.Vector3(0, -0.3, 0.3)
  ];
  arrowHeadGeo.setFromPoints(arrowHeadPoints);
  const arrowHead = new THREE.Line(arrowHeadGeo, new THREE.LineBasicMaterial({ color: 0x5ec4e0, transparent: true, opacity: 0.6 }));
  flowArrowGroup.add(arrowHead);

  // --- PARTICLES ---
  const particleCount = 20;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSpeeds = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 10;
    particlePositions[i * 3 + 1] = Math.random() * 2 - 1;
    particlePositions[i * 3 + 2] = 0.15;
    particleSpeeds[i] = 0.02 + Math.random() * 0.03;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x88ccff,
    size: 0.08,
    transparent: true,
    opacity: 0.5
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  particles.scale.set(sceneScale, sceneScale, 1);
  particles.position.y = vOffset;
  depthScene.add(particles);

  // --- WAVY LINE ---
  const wavyLineMat = new THREE.LineBasicMaterial({ color: 0x5ec4e0, transparent: true, opacity: 0.5 });
  const wavyLineGeo = new THREE.BufferGeometry();
  const wavyLine = new THREE.Line(wavyLineGeo, wavyLineMat);
  depthScene.add(wavyLine);

  // Store last known dimensions
  let lastWidth = 12, lastDepth = 2;

  // Expose update function
  window.twin3dDepthRebuild = function(width, depth, waterLevel, hubY) {
    lastWidth = width;
    lastDepth = depth;

    // Water surface — positioned and scaled directly in camera space
    // so it always renders on top of walls
    const waterWorldHeight = waterLevel + depth + 1.0;
    depthWater.scale.set(width * sceneScale, waterWorldHeight * sceneScale, 1);
    // Center the water vertically: top at waterLevel, bottom at -depth-1.0
    // In camera space: group offset + local position * scale
    const waterCenterY = vOffset + (waterLevel - waterWorldHeight / 2) * sceneScale;
    depthWater.position.set(0, waterCenterY, 0.1);

    // Riverbed (inside scaled group)
    depthBed.scale.set(width, 1.0, 1);
    depthBed.position.set(0, -depth - 0.5, 0);

    // Walls (inside scaled group)
    const wallHeight = depth + waterLevel + 1.0;
    depthWallL.scale.set(0.3, wallHeight, 1);
    depthWallL.position.set(-width / 2 - 0.15, (waterLevel - wallHeight) / 2, 0);
    depthWallR.scale.set(0.3, wallHeight, 1);
    depthWallR.position.set(width / 2 + 0.15, (waterLevel - wallHeight) / 2, 0);

    // Surface highlight line (in camera space, on top of water)
    const surfacePoints = [];
    const segCount = 20;
    const waterTopY = vOffset + waterLevel * sceneScale;
    for (let i = 0; i <= segCount; i++) {
      const xLocal = -width / 2 + (width / segCount) * i;
      const xCam = xLocal * sceneScale;
      const yCam = waterTopY + Math.sin(i * 0.8) * 0.03 * sceneScale;
      surfacePoints.push(new THREE.Vector3(xCam, yCam, 0.15));
    }
    surfaceLineGeo.setFromPoints(surfacePoints);

    // Turbine (inside scaled group)
    depthTurbineGroup.position.set(0, vOffset + hubY * sceneScale, 0.2);
    const tScale = Math.min(2.0, Math.max(0.4, depth * 0.35));
    depthTurbineHub.scale.set(tScale * 0.5, tScale * 0.5, 1);
    depthBladeLines.forEach(line => {
      line.scale.set(tScale, tScale, 1);
    });

    // Rulers
    const camTop = depthCamera.top;
    const camBottom = depthCamera.bottom;
    const camLeft = depthCamera.left;
    const camRight = depthCamera.right;
    buildRuler(camBottom + 0.5, camTop - 0.5);
    buildWidthScale(camLeft + 0.5, camRight - 0.5);

    // Flow arrow (inside scaled group)
    flowArrowGroup.position.set(0, vOffset + (waterLevel - 0.3) * sceneScale, 0);

    // Label
    labelDiv.innerHTML = `${width.toFixed(1)}m × ${depth.toFixed(1)}m`;

    // Wavy line (in camera space)
    const wavyPoints = [];
    for (let i = 0; i <= 30; i++) {
      const xLocal = -width / 2 + (width / 30) * i;
      const xCam = xLocal * sceneScale;
      const yCam = waterTopY + Math.sin(i * 0.5) * 0.04 * sceneScale;
      wavyPoints.push(new THREE.Vector3(xCam, yCam, 0.12));
    }
    wavyLineGeo.setFromPoints(wavyPoints);
  };

  // Animation loop
  let time = 0;
  function animateDepth() {
    requestAnimationFrame(animateDepth);
    time += 0.016;

    depthBladeLines.forEach((line) => {
      line.rotation.z += 0.03;
    });

    const posAttr = particles.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      let x = posAttr.getX(i);
      x += particleSpeeds[i];
      if (x > 15) x = -15;
      posAttr.setX(i, x);
      posAttr.setY(i, Math.sin(x * 0.5 + time * 2 + i) * 0.15);
    }
    posAttr.needsUpdate = true;

    const wavyPos = wavyLine.geometry.attributes.position;
    if (wavyPos) {
      for (let i = 0; i < wavyPos.count; i++) {
        const x = wavyPos.getX(i);
        wavyPos.setY(i, wavyPos.getY(i) + Math.sin(time * 3 + i * 0.3) * 0.002);
      }
      wavyPos.needsUpdate = true;
    }

    depthRenderer.render(depthScene, depthCamera);
  }
  animateDepth();
}