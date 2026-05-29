import './styles.css';
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import otisModelUrl from './otis_shell_v2.glb?url';

let container;
let camera;
let scene;
let renderer;

let model;
let rotationAnimation = null;

let mouseX = 0;
let mouseY = 0;
const cameraRadius = 3;
const targetCameraPosition = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', onDocumentMouseMove);

init();

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.z = cameraRadius;

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);
  renderer.domElement.addEventListener('click', onCanvasClick);

  const hologridTexture = createHologridTexture();
  const studioEnvironment = createStudioEnvironment();

  scene = new THREE.Scene();
  scene.background = hologridTexture;
  scene.environment = studioEnvironment;

  scene.add(new THREE.AmbientLight(0x66eaff, 0.22));

  const keyLight = new THREE.DirectionalLight(0x9af7ff, 0.7);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x1d78ff, 0.35);
  fillLight.position.set(-4, 2, -3);
  scene.add(fillLight);

  loadModel();

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
  const yaw = mouseX * 0.68;
  const pitch = -mouseY * 0.44;

  targetCameraPosition.set(
    Math.sin(yaw) * Math.cos(pitch) * cameraRadius,
    Math.sin(pitch) * cameraRadius,
    Math.cos(yaw) * Math.cos(pitch) * cameraRadius
  );

  camera.position.lerp(targetCameraPosition, 0.05).setLength(cameraRadius);

  camera.lookAt(scene.position);

  updateModelRotation();

  renderer.render(scene, camera);
}

function onCanvasClick(event) {
  if (!model) return;

  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  if (raycaster.intersectObject(model, true).length === 0) return;

  rotationAnimation = {
    from: model.rotation.y,
    to: model.rotation.y + Math.PI,
    startTime: performance.now(),
    duration: 900
  };
}

function updateModelRotation() {
  if (!model || !rotationAnimation) return;

  const elapsed = performance.now() - rotationAnimation.startTime;
  const progress = Math.min(elapsed / rotationAnimation.duration, 1);
  const easedProgress = easeOutCubic(progress);

  model.rotation.y = THREE.MathUtils.lerp(
    rotationAnimation.from,
    rotationAnimation.to,
    easedProgress
  );

  if (progress === 1) {
    rotationAnimation = null;
  }
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

function createStudioEnvironment() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();
  return environment;
}

function loadModel() {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  loader.load(otisModelUrl, (gltf) => {
    model = gltf.scene;

    model.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material.envMapIntensity = 1.05;
        child.material.needsUpdate = true;
      }
    });

    fitModelToScene(model, 1.05);
    model.rotation.y = -Math.PI / 2;
    scene.add(model);
  }, undefined, (error) => {
    console.error('Failed to load Otis GLB model.', error);
  });
}

function fitModelToScene(object, targetSize) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);

  if (maxDimension > 0) {
    object.scale.setScalar(targetSize / maxDimension);
  }

  object.updateMatrixWorld(true);

  const centeredBox = new THREE.Box3().setFromObject(object);
  const center = centeredBox.getCenter(new THREE.Vector3());
  object.position.sub(center);
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

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}
