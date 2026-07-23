
(function(){
  if (typeof THREE === 'undefined') {
    console.warn('Three.js failed to load — skipping hero 3D animation.');
    return;
  }
  const container = document.getElementById('hero3d');
  if(!container) return;

  const width = container.clientWidth || 560;
  const height = container.clientHeight || 480;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width/height, 0.1, 100);
  camera.position.set(2.2, 0.9, 5.6);
  camera.lookAt(0, -0.1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // ---- Lighting ----
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(3, 5, 4);
  scene.add(dirLight);
  const rimLight = new THREE.DirectionalLight(0x5ec4e0, 0.35);
  rimLight.position.set(-4, 1, -3);
  scene.add(rimLight);

  // ---- Sky gradient background (canvas texture) ----
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 2; skyCanvas.height = 256;
  const skyCtx = skyCanvas.getContext('2d');
  const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 256);
  skyGrad.addColorStop(0, '#dff2e8');
  skyGrad.addColorStop(0.55, '#eaf6ef');
  skyGrad.addColorStop(1, '#cfe9d9');
  skyCtx.fillStyle = skyGrad;
  skyCtx.fillRect(0, 0, 2, 256);
  const skyTexture = new THREE.CanvasTexture(skyCanvas);
  scene.background = skyTexture;
  scene.fog = new THREE.Fog(0xeaf6ef, 6, 14);

  // ---- River surface ----
  const waterGeo = new THREE.PlaneGeometry(10, 4, 160, 60);
  const waterMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0xcfe9f3) },
      uColorB: { value: new THREE.Color(0x2a3b7e) }
    },
    vertexShader: `
      uniform float uTime;
      varying float vHeight;
      varying vec2 vUv;
      void main(){
        vUv = uv;
        vec3 pos = position;
        float flow = sin(pos.x * 2.2 - uTime * 2.2) * 0.05
                   + sin(pos.x * 5.0 - uTime * 3.5) * 0.02;
        float dx = pos.x - 0.0;
        float downstreamWake = smoothstep(-0.2, 2.5, dx) * step(0.0, dx)
                              * sin(dx * 5.0 - uTime * 4.0) * exp(-dx * 0.4);
        float h = flow + downstreamWake * 0.14;
        pos.z += h;
        vHeight = h;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vHeight;
      varying vec2 vUv;
      void main(){
        float mixAmt = clamp(vHeight * 3.5 + 0.5, 0.0, 1.0);
        vec3 color = mix(uColorB, uColorA, mixAmt);
        float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x)
                        * smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
        gl_FragColor = vec4(color, 0.72 * edgeFade + 0.18);
      }
    `
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2.3;
  water.position.set(0, -1.0, -0.3);
  scene.add(water);

  // ---- SHKT-style machine — ONE CONNECTED UNIT ----
  const machine = new THREE.Group();
  const frameMat  = new THREE.MeshStandardMaterial({ color: 0xf1f3f7, metalness: 0.15, roughness: 0.55 });

  // Pontoons (white floating bases)
  [-0.65, 0.65].forEach((zPos) => {
    const pontoon = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.35), frameMat);
    pontoon.position.set(0, -0.4, zPos);
    machine.add(pontoon);
  });

  // ---- White curved shroud cover — radius 0.75 > rotor envelope 0.7 ----
  const shroudMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    metalness: 0.05, 
    roughness: 0.4, 
    side: THREE.DoubleSide 
  });
  
  // Semi-cylinder covering TOP half — radius 0.75 is OUTSIDE rotor (envelope = 0.7)
  const shroudGeo = new THREE.CylinderGeometry(0.75, 0.75, 1.3, 32, 1, true, Math.PI, Math.PI);
  const shroud = new THREE.Mesh(shroudGeo, shroudMat);
  shroud.rotation.x = Math.PI / 2;
  shroud.position.set(-0.15, -0.4, 0);
  machine.add(shroud);

  // Side end caps — semi-circular white plates
  [-0.65, 0.65].forEach((zPos) => {
    const cap = new THREE.Mesh(
      new THREE.CircleGeometry(0.75, 32, Math.PI, Math.PI), 
      shroudMat
    );
    cap.position.set(-0.15, -0.4, zPos);
    cap.rotation.y = zPos > 0 ? 0 : Math.PI;
    cap.rotation.x = Math.PI / 2;
    machine.add(cap);
  });

  // Gantry top frame
  const gantryTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.5), frameMat);
  gantryTop.position.set(0, 0.8, 0);
  machine.add(gantryTop);

  // Vertical legs connecting pontoons to gantry
  [-1.0, 1.0].forEach((xPos) => {
    [-0.65, 0.65].forEach((zPos) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), frameMat);
      leg.position.set(xPos * 0.65, 0.25, zPos);
      leg.rotation.z = xPos * -0.15;
      machine.add(leg);
    });
  });

  // Control box on top
  const controlBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.3), frameMat);
  controlBox.position.set(0, 1.03, 0);
  machine.add(controlBox);

  // ---- Red paddle wheel — bottom half in water ----
  const paddleMat = new THREE.MeshStandardMaterial({ color: 0x8a2c1f, metalness: 0.15, roughness: 0.55 });
  const hubMat    = new THREE.MeshStandardMaterial({ color: 0x2a3b7e, metalness: 0.4, roughness: 0.35 });

  const rotor = new THREE.Group();
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.25, 16), hubMat);
  axle.rotation.x = Math.PI / 2;
  rotor.add(axle);

  const paddleCount = 8;
  const drumRadius = 0.5;
  for (let i = 0; i < paddleCount; i++) {
    const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 1.25), paddleMat);
    const pivot = new THREE.Group();
    paddle.position.set(0, drumRadius, 0);
    pivot.add(paddle);
    pivot.rotation.z = (i / paddleCount) * Math.PI * 2;
    rotor.add(pivot);
  }
  rotor.position.set(-0.15, -0.4, 0);
  machine.add(rotor);

  // Position machine so pontoons float ON water, rotor half-submerged
  machine.scale.set(0.85, 0.85, 0.85);
  machine.position.set(0, -0.7, 0.2);
  scene.add(machine);

  // ---- Splash particles ----
  const splashCount = 60;
  const splashPos = new Float32Array(splashCount * 3);
  const splashVel = new Float32Array(splashCount * 3);
  for (let i = 0; i < splashCount; i++) {
    splashPos[i*3]     = -0.5 + Math.random() * 0.6;
    splashPos[i*3 + 1] = -1.1;
    splashPos[i*3 + 2] = -0.9 + Math.random() * 1.8;
    splashVel[i*3]     = 0.005 + Math.random() * 0.01;
    splashVel[i*3 + 1] = 0.01 + Math.random() * 0.015;
    splashVel[i*3 + 2] = (Math.random() - 0.5) * 0.01;
  }
  const splashGeo = new THREE.BufferGeometry();
  splashGeo.setAttribute('position', new THREE.BufferAttribute(splashPos, 3));
  const splashMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.045, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const splash = new THREE.Points(splashGeo, splashMat);
  scene.add(splash);

  // ---- Current particles ----
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  const speeds = new Float32Array(particleCount);
  const laneY = new Float32Array(particleCount);
  for(let i=0; i<particleCount; i++){
    positions[i*3]     = -5 + Math.random() * 10;
    laneY[i]           = (Math.random() - 0.5) * 1.0;
    positions[i*3 + 1] = -0.95 + laneY[i] * 0.15;
    positions[i*3 + 2] = -0.3 + (Math.random() - 0.5) * 1.6;
    speeds[i] = 0.02 + Math.random() * 0.025;
  }
  const flowGeo = new THREE.BufferGeometry();
  flowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const flowMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.05, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const flow = new THREE.Points(flowGeo, flowMat);
  scene.add(flow);

  // ---- Animate ----
  const clock = new THREE.Clock();

  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    rotor.rotation.z += 0.03;
    waterMat.uniforms.uTime.value = t;

    const pos = flowGeo.attributes.position.array;
    for(let i=0; i<particleCount; i++){
      const idx = i*3;
      pos[idx] += speeds[i];
      const dx = pos[idx];
      if (dx > -0.3 && dx < 1.5) {
        pos[idx + 1] += Math.sin(t * 6 + i) * 0.004;
        pos[idx + 2] += Math.cos(t * 5 + i) * 0.004;
      }
      if (pos[idx] > 5) {
        pos[idx] = -5;
        pos[idx + 1] = -0.95 + laneY[i] * 0.15;
        pos[idx + 2] = -0.3 + (Math.random() - 0.5) * 1.6;
      }
    }
    flowGeo.attributes.position.needsUpdate = true;

    const sp = splashGeo.attributes.position.array;
    for (let i = 0; i < splashCount; i++) {
      const idx = i*3;
      sp[idx]     += splashVel[idx];
      sp[idx + 1] += splashVel[idx + 1];
      sp[idx + 2] += splashVel[idx + 2];
      splashVel[idx + 1] -= 0.0006;
      if (sp[idx + 1] < -1.2 || sp[idx + 1] > -0.9) {
        sp[idx]     = -0.5 + Math.random() * 0.6;
        sp[idx + 1] = -1.1;
        sp[idx + 2] = -0.9 + Math.random() * 1.8;
        splashVel[idx]     = 0.005 + Math.random() * 0.01;
        splashVel[idx + 1] = 0.01 + Math.random() * 0.015;
        splashVel[idx + 2] = (Math.random() - 0.5) * 0.01;
      }
    }
    splashGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function(){
    const w = container.clientWidth || 560;
    const h = container.clientHeight || 480;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();