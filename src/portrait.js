import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import modelUrl from './otis_shell_v2.glb?url';
import faceUrl from './anim_comp.mp4?url';
export async function initPortrait(stage, motion) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .01, 100);
  camera.position.set(0, .25, 4.7);
  camera.lookAt(0, 0, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff9e9, 0x52664d, .8));
  const key = new THREE.DirectionalLight(0xfff5df, 2.5); key.position.set(-3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xe8f2ce, 1.5); rim.position.set(3, 2, -3); scene.add(rim);
  const pivot = new THREE.Group(); scene.add(pivot);
  const draco = new DRACOLoader(); draco.setDecoderPath('/draco/');
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const gltf = await loader.loadAsync(modelUrl);
  draco.dispose();
  const model = gltf.scene;
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  model.scale.setScalar(1.9 / Math.max(size.x, size.y, size.z));
  model.updateMatrixWorld(true);
  model.position.sub(new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()));
  pivot.add(model);
  const video = document.createElement('video');
  video.src = faceUrl; video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'auto';
  const texture = new THREE.VideoTexture(video); texture.colorSpace = THREE.SRGBColorSpace; texture.flipY = false;
  const shellMaterials = [];
  model.traverse(mesh => {
    if (!mesh.isMesh) return;
    const material = mesh.material;
    if (mesh.name === 'fafce' || material.name === 'Scratched black glass.002') {
      const source = material.map || material.emissiveMap;
      if (source) {
        texture.offset.copy(source.offset); texture.repeat.copy(source.repeat); texture.center.copy(source.center);
        texture.rotation = source.rotation; texture.channel = source.channel;
      }
      // Retain the embedded face until the video has a decoded frame.
      video.addEventListener('loadeddata', () => {
        material.map = texture; material.emissiveMap = texture; material.emissiveIntensity = 1.8; material.needsUpdate = true;
        renderOnce();
      }, { once: true });
      material.emissiveIntensity = 1.8;
    } else {
      material.color.set('#b5b8a5'); material.roughness = .38; material.metalness = .08;
      shellMaterials.push(material);
    }
  });
  const setFinish = color => { shellMaterials.forEach(material => material.color.set(color)); renderOnce(); };
  pivot.rotation.set(.08, -Math.PI / 2 - .32, -.10);
  stage.classList.add('ready');
  let visible = true;
  let yaw = 0, targetYaw = 0, targetX = 0, targetY = 0;
  let down = false, startX = 0, initialYaw = 0;
  const baseYaw = -Math.PI / 2 - .32;
  const canvas = renderer.domElement;
  function renderOnce() { renderer.render(scene, camera); }
  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); renderOnce();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage); resize();
  canvas.addEventListener('pointerdown', event => { down = true; startX = event.clientX; initialYaw = targetYaw; canvas.setPointerCapture(event.pointerId); });
  canvas.addEventListener('pointermove', event => {
    const rect = stage.getBoundingClientRect();
    if (down) targetYaw = initialYaw + (event.clientX - startX) * .009;
    else { targetX = ((event.clientX - rect.left) / rect.width - .5) * .22; targetY = ((event.clientY - rect.top) / rect.height - .5) * .12; }
    if (motion.matches) { yaw = targetYaw; pivot.rotation.y = baseYaw + yaw; renderOnce(); }
  });
  const release = () => { down = false; };
  canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  const spin = () => {
    targetYaw += Math.PI * 2;
    if (motion.matches) { targetYaw += Math.PI / 2; yaw = targetYaw; pivot.rotation.y = baseYaw + yaw; renderOnce(); }
  };
  function frame(time) {
    yaw += (targetYaw - yaw) * .065;
    pivot.rotation.y = baseYaw + yaw + targetX;
    pivot.rotation.x += (.08 + targetY - pivot.rotation.x) * .06;
    pivot.position.y = Math.sin(time * .0011) * .045;
    pivot.rotation.z = -.10 + Math.sin(time * .0008) * .025;
    renderer.render(scene, camera);
  }
  function updateActivity() {
    const active = visible && !document.hidden && !motion.matches;
    renderer.setAnimationLoop(active ? frame : null);
    if (active) video.play().catch(() => {}); else { video.pause(); renderOnce(); }
  }
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateActivity(); }, { rootMargin: '80px' }).observe(stage);
  document.addEventListener('visibilitychange', updateActivity);
  motion.addEventListener('change', updateActivity);
  updateActivity();
  return { spin, setFinish };
}

