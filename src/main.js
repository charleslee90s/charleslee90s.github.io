import './style.css';
import './extra.css';
import './resume.css';
import { animate, inView, stagger } from 'motion';
import Lenis from 'lenis';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const canAnimate = () => !reducedMotion.matches && window.matchMedia('(min-width: 1px)').matches;

if (canAnimate()) {
  const lenis = new Lenis({ autoRaf: true, anchors: true, duration: 1.05, respectReducedMotion: true });
  window.addEventListener('pagehide', () => lenis.destroy(), { once: true });

  animate('.hero-enter', { opacity: [0, 1], y: [28, 0] }, { duration: .85, delay: stagger(.13), ease: [.18, .7, .2, 1] });

  inView('.reveal', (element) => {
    animate(element, { opacity: [0, 1], y: [35, 0] }, { duration: .7, ease: [.2, .75, .25, 1] });
  }, { margin: '0px 0px -8% 0px' });

  inView('.metric', (element) => {
    const number = element.querySelector('[data-count]');
    if (!number) return;
    const target = Number(number.dataset.count);
    const value = { current: 0 };
    animate(value, { current: target }, { duration: 1.6, ease: 'easeOut', onUpdate: () => { number.textContent = Math.round(value.current).toLocaleString('zh-CN'); } });
  }, { amount: .5 });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    let animation;
    card.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch' || card.querySelector('details[open]')) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty('--spot-x', `${(x + .5) * 100}%`);
      card.style.setProperty('--spot-y', `${(y + .5) * 100}%`);
      animation?.stop();
      animation = animate(card, { rotateX: -y * 3, rotateY: x * 3 }, { duration: .25 });
    });
    card.addEventListener('pointerleave', () => {
      animation?.stop();
      animate(card, { rotateX: 0, rotateY: 0 }, { duration: .45 });
    });
  });

  const stage = document.querySelector('.hero-stage');
  if (stage && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    stage.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      stage.style.setProperty('--stage-x', `${(-y * 9).toFixed(2)}deg`);
      stage.style.setProperty('--stage-y', `${(x * 9).toFixed(2)}deg`);
      stage.style.setProperty('--light-x', `${((x + .5) * 100).toFixed(1)}%`);
      stage.style.setProperty('--light-y', `${((y + .5) * 100).toFixed(1)}%`);
    });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--stage-x', '0deg');
      stage.style.setProperty('--stage-y', '0deg');
      stage.style.setProperty('--light-x', '50%');
      stage.style.setProperty('--light-y', '50%');
    });
  }
}

const progressBar = document.getElementById('progress-bar');
const timelineWrap = document.querySelector('.timeline-wrap');
const timelineFill = document.querySelector('.timeline-line span');
const timelineItems = [...document.querySelectorAll('.timeline li')];
let progressTicking = false;
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = max > 0 ? Math.min(100, window.scrollY / max * 100) : 0;
  if (timelineWrap && timelineFill) {
    const rect = timelineWrap.getBoundingClientRect();
    const cursor = window.innerHeight * .56;
    const start = rect.top + 36;
    const end = rect.bottom - 34;
    const fraction = Math.max(0, Math.min(1, (cursor - start) / (end - start)));
    let active = -1;
    timelineItems.forEach((item, index) => {
      if (item.getBoundingClientRect().top <= cursor) active = index;
    });
    timelineFill.style.height = `${fraction * 100}%`;
    timelineItems.forEach((item, index) => item.classList.toggle('is-current', index === active));
  }
  progressBar.style.width = `${pageProgress}%`;
  progressTicking = false;
};
window.addEventListener('scroll', () => {
  if (progressTicking) return;
  progressTicking = true;
  requestAnimationFrame(updateProgress);
}, { passive: true });
window.addEventListener('resize', updateProgress, { passive: true });
updateProgress();
