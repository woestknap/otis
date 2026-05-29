import './styles.css';
import * as THREE from 'three';
import { ParallaxBarrierEffect } from 'three/addons/effects/ParallaxBarrierEffect.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});

renderer.setClearColor(0x01030a, 1);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));

const effect = new ParallaxBarrierEffect(renderer);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01030a, 0.018);

const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 220);
camera.position.set(0, 2.6, 18);

const pointer = new THREE.Vector2(0, 0);
const targetPointer = new THREE.Vector2(0, 0);
applyPanelDeepLink(targetPointer);
pointer.copy(targetPointer);
const clock = new THREE.Clock();

const palette = {
  cyan: new THREE.Color('#3bdfff'),
  blue: new THREE.Color('#0a5cff'),
  mint: new THREE.Color('#66ffd3'),
  white: new THREE.Color('#edfaff')
};

scene.add(new THREE.AmbientLight(0x7ad9ff, 0.55));

const keyLight = new THREE.PointLight(0x60efff, 18, 52, 1.6);
keyLight.position.set(-6, 8, 8);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x0b6cff, 26, 64, 1.8);
rimLight.position.set(7, 4, -8);
scene.add(rimLight);

const bot = createCompanionBot();
scene.add(bot);

const grid = createGridWorld();
scene.add(grid);

const starField = createStarField();
scene.add(starField);

const panels = createInfoPanels();
panels.forEach((panel) => scene.add(panel.group));

const scanRing = createScanRing();
scene.add(scanRing);

window.addEventListener('pointermove', (event) => {
  targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  targetPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('pointerleave', () => {
  targetPointer.set(0, 0);
});

window.addEventListener('resize', resize);
resize();
animate();

function createCompanionBot() {
  const group = new THREE.Group();
  group.name = 'Otis procedural companion bot';

  const metal = new THREE.MeshStandardMaterial({
    color: 0xb9d3dc,
    metalness: 0.62,
    roughness: 0.28,
    emissive: 0x061923,
    emissiveIntensity: 0.25
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x14242e,
    metalness: 0.8,
    roughness: 0.32
  });

  const glow = new THREE.MeshStandardMaterial({
    color: 0x6ff6ff,
    emissive: 0x18dfff,
    emissiveIntensity: 2.7,
    roughness: 0.2
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x123f55,
    transmission: 0.22,
    opacity: 0.82,
    transparent: true,
    metalness: 0.18,
    roughness: 0.12,
    emissive: 0x08344a,
    emissiveIntensity: 0.8
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.35, 1.85, 14, 34), metal);
  body.scale.set(1.05, 1.02, 0.72);
  body.position.y = -0.6;
  group.add(body);

  const torsoCore = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.12, 44), glow);
  torsoCore.rotation.x = Math.PI / 2;
  torsoCore.position.set(0, -0.35, 0.96);
  group.add(torsoCore);

  const coreRim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 10, 64), darkMetal);
  coreRim.position.copy(torsoCore.position);
  group.add(coreRim);

  const head = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.35, 1.35, 8, 8, 8), metal);
  head.geometry.computeVertexNormals();
  head.position.y = 1.28;
  group.add(head);

  const face = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.74, 0.08), glass);
  face.position.set(0, 1.33, 0.71);
  group.add(face);

  const eyeGeometry = new THREE.SphereGeometry(0.12, 24, 16);
  const leftEye = new THREE.Mesh(eyeGeometry, glow);
  leftEye.position.set(-0.48, 1.38, 0.78);
  group.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.x = 0.48;
  group.add(rightEye);

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.017, 8, 48, Math.PI), glow);
  smile.position.set(0, 1.16, 0.79);
  smile.rotation.z = Math.PI;
  group.add(smile);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.52, 0.38, 28), darkMetal);
  neck.position.y = 0.46;
  group.add(neck);

  const armGeometry = new THREE.CapsuleGeometry(0.2, 1.35, 8, 18);
  const leftArm = new THREE.Mesh(armGeometry, darkMetal);
  leftArm.position.set(-1.48, -0.45, 0);
  leftArm.rotation.z = -0.26;
  group.add(leftArm);

  const rightArm = leftArm.clone();
  rightArm.position.x = 1.48;
  rightArm.rotation.z = 0.26;
  group.add(rightArm);

  const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.64, 12), glow);
  antennaStem.position.set(0, 2.22, 0);
  group.add(antennaStem);

  const antennaOrb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 22, 18), glow);
  antennaOrb.position.set(0, 2.6, 0);
  group.add(antennaOrb);

  const hoverBase = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.055, 12, 82), glow);
  hoverBase.position.y = -2.04;
  hoverBase.rotation.x = Math.PI / 2;
  group.add(hoverBase);

  return group;
}

function createGridWorld() {
  const group = new THREE.Group();

  const floorGrid = new THREE.GridHelper(96, 96, 0x2ee9ff, 0x073c5f);
  floorGrid.position.y = -2.2;
  floorGrid.material.transparent = true;
  floorGrid.material.opacity = 0.42;
  group.add(floorGrid);

  const backGrid = new THREE.GridHelper(96, 72, 0x155dff, 0x06243d);
  backGrid.position.set(0, 22, -35);
  backGrid.rotation.x = Math.PI / 2;
  backGrid.material.transparent = true;
  backGrid.material.opacity = 0.2;
  group.add(backGrid);

  const sideMaterial = new THREE.LineBasicMaterial({
    color: 0x0aa8ff,
    transparent: true,
    opacity: 0.18
  });

  for (let i = -16; i <= 16; i += 2) {
    const leftLine = makeLine([[-20, -2.2, i * 2], [-20, 20, i * 2]], sideMaterial);
    const rightLine = makeLine([[20, -2.2, i * 2], [20, 20, i * 2]], sideMaterial);
    group.add(leftLine, rightLine);
  }

  return group;
}

function makeLine(points, material) {
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
  );
  return new THREE.Line(geometry, material);
}

function createStarField() {
  const count = 720;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = 26 + Math.random() * 78;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi) + 8;
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 18;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x91f7ff,
    size: 0.06,
    transparent: true,
    opacity: 0.62,
    depthWrite: false
  });

  return new THREE.Points(geometry, material);
}

function createInfoPanels() {
  const data = [
    {
      id: 'mission',
      title: 'Mission',
      kicker: 'top left',
      body: ['Friendly presence', 'expressive motion', 'useful daily rituals'],
      position: [-5.9, 3.85, -2.2],
      rotation: [0.18, 0.48, -0.08],
      corner: [-1, 1]
    },
    {
      id: 'hardware',
      title: 'Hardware',
      kicker: 'top right',
      body: ['M5Stack control core', 'animated face system', 'sensor-ready chassis'],
      position: [5.9, 3.85, -2.2],
      rotation: [0.18, -0.48, 0.08],
      corner: [1, 1]
    },
    {
      id: 'intelligence',
      title: 'Intelligence',
      kicker: 'bottom left',
      body: ['Memory-aware behavior', 'voice interaction loop', 'local-first experiments'],
      position: [-5.9, -2.85, -2.05],
      rotation: [-0.16, 0.44, 0.08],
      corner: [-1, -1]
    },
    {
      id: 'roadmap',
      title: 'Roadmap',
      kicker: 'bottom right',
      body: ['Prototype demos', 'cloud sync options', 'open project log'],
      position: [5.9, -2.85, -2.05],
      rotation: [-0.16, -0.44, -0.08],
      corner: [1, -1]
    }
  ];

  return data.map((item) => {
    const texture = makePanelTexture(item);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.75, 2.8), material);
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(4.92, 2.96)),
      new THREE.LineBasicMaterial({ color: 0x47eaff, transparent: true, opacity: 0 })
    );

    const group = new THREE.Group();
    group.name = `${item.title} info plane`;
    group.position.fromArray(item.position);
    group.rotation.set(...item.rotation);
    group.add(plane, frame);
    group.userData.basePosition = new THREE.Vector3(...item.position);
    group.userData.corner = new THREE.Vector2(...item.corner);
    group.userData.materials = [material, frame.material];
    group.scale.setScalar(1);

    return { group, material, frameMaterial: frame.material, corner: group.userData.corner };
  });
}

function makePanelTexture({ title, kicker, body }) {
  const canvasTexture = document.createElement('canvas');
  canvasTexture.width = 1024;
  canvasTexture.height = 604;
  const ctx = canvasTexture.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, canvasTexture.width, canvasTexture.height);
  gradient.addColorStop(0, 'rgba(12, 37, 57, 0.90)');
  gradient.addColorStop(0.55, 'rgba(2, 12, 25, 0.78)');
  gradient.addColorStop(1, 'rgba(4, 61, 87, 0.86)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);

  ctx.strokeStyle = 'rgba(68, 236, 255, 0.78)';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, canvasTexture.width - 48, canvasTexture.height - 48);

  ctx.strokeStyle = 'rgba(68, 236, 255, 0.22)';
  ctx.lineWidth = 1;
  for (let x = 64; x < canvasTexture.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 28);
    ctx.lineTo(x, canvasTexture.height - 28);
    ctx.stroke();
  }
  for (let y = 64; y < canvasTexture.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(28, y);
    ctx.lineTo(canvasTexture.width - 28, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#71f7ff';
  ctx.font = '700 34px Inter, Arial, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(kicker.toUpperCase(), 70, 64);

  ctx.fillStyle = '#f3fdff';
  ctx.font = '800 104px Inter, Arial, sans-serif';
  ctx.fillText(title, 68, 124);

  ctx.fillStyle = 'rgba(222, 249, 255, 0.92)';
  ctx.font = '500 48px Inter, Arial, sans-serif';
  body.forEach((line, index) => {
    ctx.fillText(`// ${line}`, 72, 278 + index * 76);
  });

  ctx.fillStyle = 'rgba(102, 255, 211, 0.78)';
  ctx.fillRect(72, 520, 230, 8);

  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createScanRing() {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.8, 0.012, 8, 140),
    new THREE.MeshBasicMaterial({
      color: 0x30e6ff,
      transparent: true,
      opacity: 0.52,
      blending: THREE.AdditiveBlending
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -2.16;
  return ring;
}

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta();
  pointer.lerp(targetPointer, 1 - Math.exp(-delta * 6));

  const cornerPull = Math.min(1, Math.max(Math.abs(pointer.x), Math.abs(pointer.y)));
  const cornerIntent = Math.max(0, (cornerPull - 0.38) / 0.62);
  const zoomOut = easeOutCubic(cornerIntent);

  bot.rotation.y = Math.sin(elapsed * 0.58) * 0.14 + pointer.x * 0.22;
  bot.rotation.x = pointer.y * 0.08;
  bot.position.y = Math.sin(elapsed * 1.35) * 0.08;

  scanRing.rotation.z += delta * (0.35 + zoomOut * 1.3);
  starField.rotation.y += delta * 0.012;

  camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 2.3, 0.045);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.5 + pointer.y * 1.35, 0.045);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, 18 + zoomOut * 7.5, 0.055);
  camera.lookAt(0, 0.2, 0);

  panels.forEach(({ group, material, frameMaterial, corner }) => {
    const directionalFocus = Math.max(0, pointer.x * corner.x) * Math.max(0, pointer.y * corner.y);
    const visibility = easeOutCubic(Math.min(1, directionalFocus * 1.35));
    const pulse = 0.92 + Math.sin(elapsed * 2.2 + group.position.x) * 0.04;
    const offset = group.userData.basePosition.clone().multiplyScalar(0.09 * visibility);

    material.opacity = visibility * 0.9;
    frameMaterial.opacity = visibility * 0.78;
    group.position.copy(group.userData.basePosition).add(offset);
    group.scale.setScalar((1 + visibility * 0.15) * pulse);
  });

  effect.render(scene, camera);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  effect.setSize(width, height);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function applyPanelDeepLink(vector) {
  const panel = new URLSearchParams(window.location.search).get('panel');
  const corners = {
    mission: [-0.92, 0.92],
    hardware: [0.92, 0.92],
    intelligence: [-0.92, -0.92],
    roadmap: [0.92, -0.92]
  };

  if (panel && corners[panel]) {
    vector.fromArray(corners[panel]);
  }
}
