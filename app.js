import { projects } from './content.js';

const workGrid = document.querySelector('#work-grid');
const year = document.querySelector('#year');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

const projectCard = ({ title, category, year: projectYear, description, image, url }) => `
  <a class="project-card reveal" href="${url}" target="_blank" rel="noopener" aria-label="Open ${title} project">
    <div class="project-visual"><img src="${image}" alt="${title} project preview" loading="lazy" /></div>
    <div class="project-meta"><div><h3 class="project-title">${title}</h3><p class="project-desc">${description}</p></div><div class="project-tag">${category}<br />${projectYear}<span class="project-arrow">↗</span></div></div>
  </a>`;

projects.forEach(({ image }) => {
  const preload = new Image();
  preload.decoding = 'async';
  preload.src = image;
});
workGrid.insertAdjacentHTML('beforeend', projects.map(projectCard).join(''));
year.textContent = new Date().getFullYear();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  observer.observe(element);
});

const setMenu = (open) => {
  menuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

// Scroll-linked storytelling controller: one sticky scene, four narrative beats.
const story = document.querySelector('.scrolly-story');
if (story) {
  const sticky = story.querySelector('.scrolly-sticky');
  const lines = [...story.querySelectorAll('.story-line')];
  const object = story.querySelector('.scrolly-object');
  const backdrop = story.querySelector('.scrolly-backdrop');
  const progress = story.querySelector('.scrolly-progress span');
  const stepLabel = story.querySelector('#story-step');
  let ticking = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const easeInOut = (value) => value < 0.5 ? 2 * value * value : 1 - ((-2 * value + 2) ** 2) / 2;
  const updateStory = () => {
    const rect = story.getBoundingClientRect();
    const travel = Math.max(1, story.offsetHeight - window.innerHeight);
    const rawProgress = clamp(-rect.top / travel);
    const easedProgress = easeInOut(rawProgress);
    const activeIndex = Math.min(lines.length - 1, Math.floor(rawProgress * lines.length));
    const objectScale = 0.08 + easedProgress * 11.5;
    const objectOpacity = .18 + Math.sin(easedProgress * Math.PI) * .7;
    const drift = (easedProgress - .5) * 12;

    lines.forEach((line, index) => line.classList.toggle('is-active', index === activeIndex));
    object.style.transform = `translate(-50%, -50%) scale(${objectScale}) rotate(${easedProgress * 110}deg)`;
    object.style.opacity = objectOpacity;
    backdrop.style.transform = `scale(${1 + easedProgress * .12}) rotate(${drift}deg)`;
    progress.style.height = `${Math.max(8, rawProgress * 100)}%`;
    stepLabel.textContent = String(activeIndex + 1).padStart(2, '0');
    ticking = false;
  };

  const requestStoryUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateStory);
      ticking = true;
    }
  };
  window.addEventListener('scroll', requestStoryUpdate, { passive: true });
  window.addEventListener('resize', requestStoryUpdate);
  updateStory();
}

// Hero sequence: scroll progress controls image reveal and split exit.
const hero = document.querySelector('#hero-sequence');
if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const title = hero.querySelector('.hero-title-animated');
  const words = [...hero.querySelectorAll('.hero-word')];
  const sequenceLabel = hero.querySelector('.hero-sequence-label');
  let ticking = false;
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const updateHeroSequence = () => {
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / travel);
    const reveal = clamp(progress / .18);
    const exit = clamp((progress - .48) / .52);
    const ease = exit * exit * (3 - 2 * exit);
    const revealEase = reveal * reveal * (3 - 2 * reveal);
    title.style.setProperty('transform', `translate3d(0, ${ease * 3}vh, 0) scale(${1 - ease * .08})`, 'important');
    title.style.opacity = String(1 - ease * .55);
    words[0].style.transform = `translate3d(${-ease * 48}vw, ${-ease * 34}vh, 0) rotate(${-ease * 6}deg)`;
    words[1].style.transform = `translate3d(${ease * 38}vw, ${ease * 10}vh, 0) rotate(${ease * 4}deg)`;
    words[2].style.transform = `translate3d(${-ease * 44}vw, ${ease * 42}vh, 0) rotate(${-ease * 5}deg)`;
    words.forEach((word) => { word.style.opacity = String(Math.min(1, revealEase * 1.35) * (1 - ease * 1.35)); });
    hero.style.setProperty('--hero-image-reveal', String(.68 - revealEase * .42));
    if (sequenceLabel) sequenceLabel.textContent = progress < .18 ? '01 / 03' : progress < .48 ? '02 / 03' : '03 / 03';
    hero.classList.toggle('is-exiting', exit > .02);
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateHeroSequence); ticking = true; } }, { passive: true });
  window.addEventListener('resize', updateHeroSequence);
  updateHeroSequence();
}

// Portfolio sequence controller: the intro and each project are explicit scroll beats.
const portfolio = document.querySelector('.portfolio-sequence');
if (portfolio) {
  const stage = portfolio.querySelector('.portfolio-stage');
  const cards = [...stage.querySelectorAll(':scope > *')];
  const backdrop = portfolio.querySelector('.portfolio-backdrop');
  const progress = portfolio.querySelector('.portfolio-progress span');
  const counter = portfolio.querySelector('#portfolio-step');
  const palettes = [
    ['#30372b', '#0d100d'], ['#74794d', '#1a1b17'], ['#8c5b2e', '#211712'],
    ['#7b4a53', '#1b1418'], ['#365c64', '#101c1f'], ['#6c6b68', '#171716'],
    ['#705742', '#1d1713'],
  ];
  let ticking = false;
  const clampPortfolio = (value) => Math.min(1, Math.max(0, value));
  const updatePortfolio = () => {
    const rect = portfolio.getBoundingClientRect();
    const travel = Math.max(1, portfolio.offsetHeight - window.innerHeight);
    const raw = clampPortfolio(-rect.top / travel);
    const exact = raw * cards.length;
    const active = Math.min(cards.length - 1, Math.floor(exact));
    const local = exact - active;
    const [light, dark] = palettes[active] || palettes[0];
    cards.forEach((card, index) => {
      card.classList.toggle('is-current', index === active);
      if (index !== active) card.style.setProperty('--beat-progress', '0');
    });
    backdrop.style.background = `radial-gradient(circle at 52% 44%, ${light} 0%, ${dark} 36%, #101010 76%)`;
    backdrop.style.transform = 'none';
    progress.style.height = `${Math.max(8, raw * 100)}%`;
    counter.textContent = String(active + 1).padStart(2, '0');
    ticking = false;
  };
  const requestPortfolioUpdate = () => {
    if (!ticking) { window.requestAnimationFrame(updatePortfolio); ticking = true; }
  };
  window.addEventListener('scroll', requestPortfolioUpdate, { passive: true });
  window.addEventListener('resize', requestPortfolioUpdate);
  updatePortfolio();
}
