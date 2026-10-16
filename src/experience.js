import './experience.css';
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const state = { progress: 0, pointerX: 0, pointerY: 0, still: preference.matches };
const chapters = [...document.querySelectorAll('.chapter')];
const links = [...document.querySelectorAll('.flight-deck nav a')];
const names = ['THE ENCOUNTER', 'CURIOSITY', 'POSSIBILITY', 'COMPANY'];
const themes = [[233,232,223],[213,220,202],[24,38,34],[213,239,159]];
let controls, scheduled = false;
const root = document.documentElement;
function update() {
  scheduled = false;
  const centers = chapters.map(el => el.offsetTop);
  let index = 0;
  while (index < 3 && scrollY >= centers[index+1]) index++;
  const part = index < 3 ? Math.min(1,(scrollY-centers[index])/(centers[index+1]-centers[index])) : 0;
  state.progress = index + part;
  const near = Math.min(3,Math.floor(state.progress + .45));
  const blend = part * part * (3 - 2 * part);
  const bg = themes[index].map((n,i)=>Math.round(n + ((themes[Math.min(3,index+1)][i])-n)*blend));
  const dark = state.progress > 1.55 && state.progress < 2.55;
  root.style.setProperty('--surface',`rgb(${bg.join(',')})`);
  root.style.setProperty('--ink',dark?'#edf0e3':'#273129');
  root.style.setProperty('--accent',dark?'#d5f68a':'#b9472d');
  root.style.backgroundColor=`rgb(${bg.join(',')})`;
  document.body.style.color=dark?'#edf0e3':'#273129';
  root.style.setProperty('--progress',Math.min(1,scrollY/(document.documentElement.scrollHeight-innerHeight)));
  document.querySelector('#coordinate').textContent=(state.progress*33.33).toFixed(2).padStart(5,'0');
  document.querySelector('#chapter-name').textContent=names[near];
  links.forEach((link,i)=>i===near?link.setAttribute('aria-current','step'):link.removeAttribute('aria-current'));
  chapters.forEach((el,i)=>{
    const content=el.querySelector('.chapter-content');
    const distance=(scrollY-el.offsetTop)/innerHeight;
    const opacity = distance > .45 ? Math.max(0,1-(distance-.45)*2) : distance < -.7 ? Math.max(0,1+ (distance+.7)*3) : 1;
    content.style.opacity=state.still?1:opacity;
    content.style.transform=state.still?'none':`translate3d(0,${Math.max(0,distance)*-35}px,0)`;
    content.inert = !state.still && opacity < .15;
  });
  controls?.update();
}
function requestUpdate(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
window.addEventListener('scroll',requestUpdate,{passive:true});
window.addEventListener('resize',requestUpdate);
window.addEventListener('pointermove',event=>{state.pointerX=(event.clientX/innerWidth-.5)*2;state.pointerY=(event.clientY/innerHeight-.5)*2;},{passive:true});
function setStill(value){state.still=value;document.body.classList.toggle('still',value);document.querySelector('#motion').setAttribute('aria-pressed',String(value));root.style.scrollBehavior=value?'auto':'smooth';controls?.activity();requestUpdate();}
document.querySelector('#motion').addEventListener('click',()=>setStill(!state.still));
preference.addEventListener('change',e=>setStill(e.matches));
setStill(state.still);update();
import('./world.js').then(({createWorld})=>createWorld(document.querySelector('#world'),state)).then(result=>{
  controls=result;document.querySelector('#world').classList.add('ready');
  document.querySelectorAll('[data-color], #hello-action').forEach(el=>el.disabled=false);
  document.querySelectorAll('[data-color]').forEach(button=>button.addEventListener('click',()=>{controls.finish(button.dataset.color);document.querySelectorAll('[data-color]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));}));
  document.querySelector('#hello-action').addEventListener('click',()=>{controls.hello();document.querySelector('#response').textContent='“Oh! There you are.”';});
  requestUpdate();
}).catch(error=>{console.warn('Spatial portrait unavailable',error);document.querySelector('#world canvas')?.remove();document.querySelector('#loading').textContent='SCROLL TO EXPLORE ↓';document.querySelector('.finishes').hidden=true;document.querySelector('#hello-action').hidden=true;});
