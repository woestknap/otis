import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import modelUrl from './otis_shell_v2.glb?url';
import faceUrl from './anim_comp.mp4?url';

export async function createWorld(host, state) {
  const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(39,innerWidth/innerHeight,.05,70);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;room.dispose();pmrem.dispose();
  const ambient=new THREE.HemisphereLight(0xfffae9,0x52664d,1.2);scene.add(ambient);
  const key=new THREE.DirectionalLight(0xfff5df,2.8);key.position.set(-3,5,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xd5f68a,2);rim.position.set(3,2,-3);scene.add(rim);
  const pivot=new THREE.Group();scene.add(pivot);
  // Real geometry at distinct depths makes the parallax a consequence of camera travel.
  const field=new THREE.Group();scene.add(field);
  const wire=new THREE.MeshBasicMaterial({color:0x6e8269,transparent:true,opacity:.20,depthWrite:false});
  const rings=[];
  for(let i=0;i<6;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.9+i*.22,.009,5,128),wire);
    ring.position.set(Math.sin(i*1.7)*.65,-.3,-2-i*2.6);
    ring.rotation.set(.1+i*.12,.15+i*.07,i*.17);field.add(ring);rings.push(ring);
  }
  const orbit=new THREE.Group();scene.add(orbit);
  const orbitMaterial=new THREE.MeshBasicMaterial({color:0xb9472d,transparent:true,opacity:.55,depthWrite:false});
  for(let i=0;i<3;i++){
    const arc=new THREE.Mesh(new THREE.TorusGeometry(1.65+i*.22,.006,4,128),orbitMaterial);
    arc.rotation.set(Math.PI/2+i*.35,i*.7,.3+i*.3);orbit.add(arc);
  }
  const particles=new Float32Array(100*3);
  for(let i=0;i<100;i++){particles[i*3]=Math.sin(i*127.1)*9;particles[i*3+1]=Math.cos(i*73.7)*5;particles[i*3+2]=-2-(i%23);}
  const pointGeometry=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(particles,3));
  const pointMaterial=new THREE.PointsMaterial({color:0x6e8269,size:.025,transparent:true,opacity:.5,sizeAttenuation:true});
  field.add(new THREE.Points(pointGeometry,pointMaterial));
  // A quiet horizon gives the floating character a place in a larger world.
  const floor=new THREE.GridHelper(50,50,0x6e8269,0x6e8269);floor.position.y=-2.1;
  floor.material.transparent=true;floor.material.opacity=.10;floor.material.depthWrite=false;scene.add(floor);
  const draco=new DRACOLoader();draco.setDecoderPath('/draco/');
  let gltf;
  try{gltf=await new GLTFLoader().setDRACOLoader(draco).loadAsync(modelUrl);}
  catch(error){draco.dispose();renderer.dispose();environment.dispose();throw error;}
  draco.dispose();
  const model=gltf.scene;
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
  model.scale.setScalar(1.9/Math.max(size.x,size.y,size.z));model.updateMatrixWorld(true);
  model.position.sub(new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3()));pivot.add(model);
  const video=document.createElement('video');video.src=faceUrl;video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';
  const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;
  const shell=[];let roof;
  model.traverse(mesh=>{
    if(!mesh.isMesh)return;
    if(mesh.name==='roof')roof=mesh;
    const material=mesh.material;
    if(mesh.name==='fafce'||material.name==='Scratched black glass.002'){
      const source=material.map||material.emissiveMap;
      if(source){texture.offset.copy(source.offset);texture.repeat.copy(source.repeat);texture.center.copy(source.center);texture.rotation=source.rotation;texture.channel=source.channel;}
      material.emissiveIntensity=1.5;
      video.addEventListener('loadeddata',()=>{material.map=texture;material.emissiveMap=texture;material.needsUpdate=true;draw(performance.now());},{once:true});
    }else{material.color.set('#b5b8a5');material.roughness=.35;material.metalness=.09;shell.push(material);}
  });
  const roofY=roof?.position.y||0;
  let progress=state.progress,helloAt=-10000,last=0;
  const cameraPos=new THREE.Vector3(),look=new THREE.Vector3(),target=new THREE.Vector3();
  const positions=[new THREE.Vector3(0,.25,6.7),new THREE.Vector3(2.8,1.1,4.8),new THREE.Vector3(-2.9,1.9,5.2),new THREE.Vector3(.2,.5,6.3)];
  const destinations=[new THREE.Vector3(1.25,0,0),new THREE.Vector3(1.1,0,0),new THREE.Vector3(-1.45,-.1,0),new THREE.Vector3(1.3,0,0)];
  function draw(time){
    const dt=Math.min((time-last)/1000,.05)||.016;last=time;
    progress=state.still?state.progress:THREE.MathUtils.damp(progress,state.progress,5,dt);
    const segment=Math.min(2,Math.floor(progress));
    const t=THREE.MathUtils.smoothstep(progress-segment,0,1);
    const mobile=innerWidth<=600;
    cameraPos.lerpVectors(positions[segment],positions[segment+1],t);
    target.lerpVectors(destinations[segment],destinations[segment+1],t);
    const open=Math.exp(-Math.pow((progress-2)*2.8,2));
    const helloAge=(time-helloAt)/1000;
    const helloWave=helloAge<1.8?Math.sin(helloAge*11)*Math.exp(-helloAge*2)*.3:0;
    if(mobile){const distance=Math.max(7.8,4.25/camera.aspect);cameraPos.set(cameraPos.x*.18,.3,distance);target.set(0,-distance*Math.tan(THREE.MathUtils.degToRad(19.5))*.44,0);}
    if(!state.still){cameraPos.x+=state.pointerX*.32;cameraPos.y-=state.pointerY*.2;}
    camera.position.copy(cameraPos);look.set(0,0,0);camera.lookAt(look);
    pivot.position.copy(target);
    if(!state.still)pivot.position.y+=Math.sin(time*.0012)*.055;
    // Keep the face oriented toward the travelling camera, with a curious head tilt.
    pivot.rotation.set(.06+open*.12,-Math.PI/2+Math.atan2(cameraPos.x-target.x,cameraPos.z)-.1+(state.still?0:state.pointerX*.10),-.08+helloWave);
    if(roof)roof.position.y=roofY+open*.46/model.scale.x;
    orbit.position.copy(target);orbit.rotation.set(.1,progress*.7,state.still?0:time*.00006);
    orbit.scale.setScalar(mobile?.78:1);
    orbitMaterial.opacity=.08+Math.sin(Math.min(progress,3)*Math.PI/3)*.4;
    field.position.z=progress*1.8;
    field.rotation.z=progress*.055;
    const night=Math.exp(-Math.pow((progress-2)*2.1,2));
    wire.color.set(night>.45?'#b3d9ad':'#6e8269');pointMaterial.color.copy(wire.color);
    floor.material.opacity=.06+(1-night)*.06;
    ambient.intensity=1.2-night*.7;rim.intensity=2+night*2;
    renderer.render(scene,camera);
  }
  function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();draw(performance.now());}
  function activity(){const running=!state.still&&!document.hidden;renderer.setAnimationLoop(running?draw:null);if(running)video.play().catch(()=>{});else video.pause();draw(performance.now());}
  window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',activity);
  resize();activity();
  return {update(){if(state.still)draw(performance.now());},activity,finish(color){shell.forEach(material=>material.color.set(color));draw(performance.now());},hello(){helloAt=performance.now();if(state.still){pivot.rotation.z=.1;renderer.render(scene,camera);}}};
}

