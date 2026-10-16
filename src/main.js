import './styles.css';

const stage = document.querySelector('#stage');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const captions = { curious: '“Oh. What\'s that?”', happy: '“You\'re here!”', sleepy: '“Just five more minutes.”' };
let mood = 'curious';
let spin = () => {};
let setFinish = () => {};
document.querySelectorAll('[data-finish]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-finish]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#finish-name').textContent = button.dataset.finish;
    setFinish(button.dataset.color);
  });
});
document.querySelectorAll('[data-mood][aria-pressed]').forEach(button => {
  button.addEventListener('click', () => {
    mood = button.dataset.mood;
    document.querySelectorAll('[data-mood][aria-pressed]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('.face').dataset.mood = mood;
    document.querySelector('#mood-caption').textContent = captions[mood];
  });
});
document.querySelector('#turn').addEventListener('click', () => spin());

import('./portrait.js').then(({ initPortrait }) => initPortrait(stage, motion)).then(controls => {
  spin = controls.spin;
  setFinish = controls.setFinish;
  document.querySelectorAll('[data-finish], #turn').forEach(button => { button.disabled = false; });
}).catch(error => {
  console.warn('Otis portrait unavailable:', error);
  stage.querySelector('canvas')?.remove();
  stage.classList.remove('ready');
  document.querySelector('#loading').textContent = 'A little portrait of Otis';
  document.querySelector('#turn').hidden = true;
  document.querySelector('.finishes').hidden = true;
});
