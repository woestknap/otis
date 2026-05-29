import './styles.css';
import * as THREE from 'three';

let container;
let camera;
let scene;
let renderer;

let sphere;

let mouseX = 0;
let mouseY = 0;
const cameraRadius = 3;
const targetCameraPosition = new THREE.Vector3();

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', onDocumentMouseMove);

init();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.z = cameraRadius;

  const hologridTexture = createHologridTexture();

  scene = new THREE.Scene();
  scene.background = hologridTexture;
  scene.environment = hologridTexture;

  scene.add(new THREE.AmbientLight(0x66eaff, 0.85));

  const geometry = new THREE.SphereGeometry(0.45, 64, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x9af7ff,
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1.6,
    emissive: 0x003a4d,
    emissiveIntensity: 0.38
  });

  sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(0, 0, 0);
  scene.add(sphere);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

function animate() {
  const timer = 0.0001 * Date.now();

  const yaw = mouseX * 0.34;
  const pitch = -mouseY * 0.22;

  targetCameraPosition.set(
    Math.sin(yaw) * Math.cos(pitch) * cameraRadius,
    Math.sin(pitch) * cameraRadius,
    Math.cos(yaw) * Math.cos(pitch) * cameraRadius
  );

  camera.position.lerp(targetCameraPosition, 0.05).setLength(cameraRadius);

  camera.lookAt(scene.position);

  sphere.rotation.x = timer * 1.7;
  sphere.rotation.y = timer * 2.4;

  renderer.render(scene, camera);
}

function createHologridTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;

  const ctx = canvas.getContext('2d');
  drawHologrid(ctx, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function drawHologrid(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.48);
  glow.addColorStop(0, '#041b2a');
  glow.addColorStop(0.42, '#010814');
  glow.addColorStop(1, '#000208');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  drawWrappedVerticalLines(ctx, width, height, 64, 'rgba(36, 214, 255, 0.27)', 1);
  drawWrappedVerticalLines(ctx, width, height, 256, 'rgba(81, 246, 255, 0.48)', 2);
  drawHorizontalLines(ctx, width, height, 64, 'rgba(36, 214, 255, 0.24)', 1);
  drawHorizontalLines(ctx, width, height, 256, 'rgba(81, 246, 255, 0.44)', 2);

  const seed = 42;
  for (let i = 0; i < 140; i += 1) {
    const randomA = seededRandom(seed + i * 2);
    const randomB = seededRandom(seed + i * 2 + 1);
    const x = randomA * width;
    const y = randomB * height;
    const alpha = 0.18 + seededRandom(seed + i * 3 + 2) * 0.42;
    ctx.fillStyle = `rgba(71, 231, 255, ${alpha})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}

function drawWrappedVerticalLines(ctx, width, height, step, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (let x = step / 2; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawHorizontalLines(ctx, width, height, step, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (let y = step / 2; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function seededRandom(value) {
  const x = Math.sin(value) * 10000;
  return x - Math.floor(x);
}
