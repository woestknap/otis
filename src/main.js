import './styles.css';
import * as THREE from 'three';

let container;
let camera;
let scene;
let renderer;

let sphere;

let mouseX = 0;
let mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', onDocumentMouseMove);

init();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.z = 3;

  const textureCube = createHologridCubeTexture();

  scene = new THREE.Scene();
  scene.background = textureCube;

  scene.add(new THREE.AmbientLight(0x66eaff, 0.85));

  const geometry = new THREE.SphereGeometry(0.45, 64, 32);
  const material = new THREE.MeshStandardMaterial({
    color: 0x9af7ff,
    metalness: 1,
    roughness: 0.04,
    envMap: textureCube,
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
  mouseX = (event.clientX - windowHalfX) / 100;
  mouseY = (event.clientY - windowHalfY) / 100;
}

function animate() {
  const timer = 0.0001 * Date.now();

  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;

  camera.lookAt(scene.position);

  sphere.rotation.x = timer * 1.7;
  sphere.rotation.y = timer * 2.4;

  renderer.render(scene, camera);
}

function createHologridCubeTexture() {
  const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
  const canvases = faces.map((face) => createHologridFace(face));
  const texture = new THREE.CubeTexture(canvases);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createHologridFace(face) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const glow = ctx.createRadialGradient(center, center, 0, center, center, size * 0.72);
  glow.addColorStop(0, '#041b2a');
  glow.addColorStop(0.42, '#010814');
  glow.addColorStop(1, '#000208');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.translate(center, center);

  const faceRotation = {
    px: 0.2,
    nx: -0.2,
    py: Math.PI / 2,
    ny: -Math.PI / 2,
    pz: 0,
    nz: Math.PI
  }[face];
  ctx.rotate(faceRotation);

  drawGrid(ctx, size, 64, 'rgba(36, 214, 255, 0.34)', 1);
  drawGrid(ctx, size, 256, 'rgba(81, 246, 255, 0.56)', 2);

  ctx.strokeStyle = 'rgba(0, 132, 255, 0.22)';
  ctx.lineWidth = 1;
  for (let i = -size; i <= size; i += 128) {
    ctx.beginPath();
    ctx.moveTo(-size, i * 0.45);
    ctx.lineTo(size, i * 0.45 + size * 0.24);
    ctx.stroke();
  }

  ctx.restore();

  ctx.fillStyle = 'rgba(71, 231, 255, 0.95)';
  for (let i = 0; i < 90; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = 0.18 + Math.random() * 0.42;
    ctx.fillStyle = `rgba(71, 231, 255, ${alpha})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  return canvas;
}

function drawGrid(ctx, size, step, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (let i = -size; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, -size);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
}
