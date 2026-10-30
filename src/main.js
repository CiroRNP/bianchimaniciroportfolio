import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import en from './i18n/en.json';
import es from './i18n/es.json';
import { SITE, PROJECTS, STACK, EXP } from './data.js';
import { initPalette } from './palette.js';
import { initCursor } from './cursor.js';

gsap.registerPlugin(ScrollTrigger);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const dict = { en, es };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lang = localStorage.getItem('lang') || (navigator.language.startsWith('es') ? 'es' : 'en');
const t = (p) => p.split('.').reduce((a, k) => a?.[k], dict[lang]);

/* ---------- Build DOM (text is filled by applyLang) ---------- */
$('#track').innerHTML = PROJECTS.map((p) => `
  <article class="card">
    <a class="card__media" href="${p.url}" target="_blank" rel="noopener">
      <span class="card__px"><img src="${p.img}" alt="" loading="lazy">${p.video ? `<video src="${p.video}" muted loop playsinline preload="none"></video>` : ''}</span>
      <span class="card__cta"><i class="ri-external-link-line"></i><span data-i18n="work.demo"></span></span>
    </a>
    <h3 class="card__title" data-i18n="projects.${p.id}.title"></h3>
    <p class="card__desc" data-i18n="projects.${p.id}.desc"></p>
    <p class="card__stack">${p.stack}</p>
    ${p.creds ? `<dl class="creds">${[['user', p.creds.user], ['pass', p.creds.pass]].map(([k, v]) => `
      <div><dt data-i18n="work.${k}"></dt><dd>${v}</dd>
      <button data-copy="${v}" data-i18n="work.copy"></button></div>`).join('')}</dl>` : ''}
  </article>`).join('');

$('#tl').innerHTML = en.timeline.map((it, i) => `
  <li class="tl__item" data-kind="${it.kind}">
    <i class="tl__dot"></i>
    <p class="tl__period" data-i18n="timeline.${i}.period"></p>
    <div class="tl__card">
      <button class="tl__head" aria-expanded="${i === 1}">
        <span><strong data-i18n="timeline.${i}.title"></strong><em data-i18n="timeline.${i}.org"></em></span>
        ${it.points.length ? '<i class="ri-add-line"></i>' : ''}
      </button>
      ${it.points.length ? `<div class="tl__body"><ul data-i18n-ul="timeline.${i}.points"></ul></div>` : ''}
    </div>
  </li>`).join('');

const rows = [STACK.filter((_, i) => i % 2 === 0), STACK.filter((_, i) => i % 2 === 1)];
$('#marquee').innerHTML = rows.map((r, i) => `<div class="marquee__row${i ? ' rev' : ''}"><div class="marquee__in">${[0, 1].map((k) =>
  `<span${k ? ' aria-hidden="true"' : ''}>${r.map((x) => `<button class="chip" data-tech="${x}" aria-pressed="false"${k ? ' tabindex="-1"' : ''}>${x}</button>`).join('')}</span>`).join('')}</div></div>`).join('');

let picked = null;
function renderPick() {
  $$('.chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.tech === picked));
  $('#marquee').classList.toggle('has-sel', !!picked);
  const box = $('#pick');
  if (!picked) { box.innerHTML = ''; return; }
  const ps = PROJECTS.filter((p) => p.tech?.includes(picked)), ex = EXP[picked] || [];
  box.innerHTML = `<h3>${t('stack.with').replace('{x}', picked)}</h3>`
    + (ps.length ? `<ul class="pick__list">${ps.map((p) => `<li><a href="${p.url}" target="_blank" rel="noopener"><img src="${p.img}" alt="" loading="lazy"><span><strong>${t(`projects.${p.id}.title`)}</strong><em>${p.stack}</em></span><i class="ri-external-link-line"></i></a></li>`).join('')}</ul>`
      : `<p class="pick__none">${t('stack.none').replace('{x}', picked)}</p>`)
    + (ex.length ? `<p class="pick__exp">${t('stack.also')} ${ex.map((i) => `<button data-tl="${i}">${t(`timeline.${i}.org`)}: ${t(`timeline.${i}.title`)}</button>`).join('')}</p>` : '');
}

$('#mail').textContent = SITE.email; $('#mail').href = `mailto:${SITE.email}`;
$('#cv').href = SITE.cv;
$('#avatar').addEventListener('error', () => { console.warn('Photo not found: ' + SITE.photo + '. Check SITE.photo in src/data.js'); $('#avatar').src = '/foto01.png'; }, { once: true });
$('#avatar').src = SITE.photo;
$('#social').innerHTML = SITE.social.map((s) => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}"><i class="${s.icon}"></i></a>`).join('');

/* ---------- i18n ---------- */
function applyLang() {
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$('[data-i18n-ul]').forEach((ul) => (ul.innerHTML = t(ul.dataset.i18nUl).map((x) => `<li>${x}</li>`).join('')));
  $$('[data-i18n-ph]').forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  $('#pal-open').setAttribute('aria-label', t('cmd.open'));
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang));
  $('#wa').href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(t('contact.wa_msg'))}`;
  localStorage.setItem('lang', lang);
  roleIdx = 0; showRole(); renderPick();
  ScrollTrigger.refresh();
}
$$('[data-lang]').forEach((b) => b.addEventListener('click', () => { lang = b.dataset.lang; applyLang(); }));

/* ---------- Theme (circular reveal from the button) ---------- */
const root = document.documentElement;
function setTheme(next, x = innerWidth - 40, y = 30, instant = false) {
  const apply = () => {
    root.dataset.theme = next; localStorage.setItem('theme', next);
    $('#theme i').className = next === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    window.dispatchEvent(new Event('themechange'));
  };
  if (instant || !document.startViewTransition || reduced) return apply();
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => root.animate(
    { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
    { duration: 650, easing: 'ease-in', pseudoElement: '::view-transition-new(root)' }));
}
setTheme(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'), 0, 0, true);
$('#theme').addEventListener('click', (e) => {
  const b = e.currentTarget.getBoundingClientRect();
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', b.x + b.width / 2, b.y + b.height / 2);
});

/* ---------- Role text scramble ---------- */
let roleIdx = 0;
function scramble(el, to) {
  const chars = 'abcdefghijklmnopqrstuvwxyz#%&/=+'; let f = 0;
  cancelAnimationFrame(el._r);
  const step = () => {
    el.textContent = [...to].map((c, i) => (i < f / 1.6 || c === ' ' ? c : chars[(Math.random() * chars.length) | 0])).join('');
    if (f / 1.6 < to.length) { f++; el._r = requestAnimationFrame(step); }
  };
  step();
}
function showRole() { const roles = t('hero.roles'); const el = $('#role'); reduced ? (el.textContent = roles[0]) : scramble(el, roles[roleIdx % roles.length]); }
if (!reduced) setInterval(() => { roleIdx++; showRole(); }, 3200);

/* ---------- Copy, hover video, timeline ---------- */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) { navigator.clipboard?.writeText(b.dataset.copy); b.textContent = t('work.copied'); setTimeout(() => (b.textContent = t('work.copy')), 1200); }
  const h = e.target.closest('.tl__head');
  if (h) { h.setAttribute('aria-expanded', h.getAttribute('aria-expanded') !== 'true'); setTimeout(() => ScrollTrigger.refresh(), 450); }
  const f = e.target.closest('[data-f]');
  if (f) {
    $$('[data-f]').forEach((x) => x.setAttribute('aria-pressed', x === f));
    $$('.tl__item').forEach((li) => (li.hidden = f.dataset.f !== 'all' && li.dataset.kind !== f.dataset.f));
    ScrollTrigger.refresh();
  }
});
$$('.card__media').forEach((m) => {
  const v = $('video', m); if (!v) return;
  m.addEventListener('mouseenter', () => v.play()); m.addEventListener('mouseleave', () => v.pause());
});

/* ---------- Scroll: smooth scroll + animations ---------- */
let lenis;
if (!reduced) {
  lenis = new Lenis({ anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const mm = gsap.matchMedia();
mm.add('(min-width: 900px)', () => {
  const track = $('#track'), n = PROJECTS.length, dist = () => Math.max(0, track.scrollWidth - innerWidth);
  const scroll = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
    trigger: '#work', pin: true, scrub: 0.6, end: () => '+=' + dist(), invalidateOnRefresh: true,
    onUpdate: (s) => { $('#bar').style.transform = `scaleX(${s.progress})`; $('#count').textContent = `${Math.round(s.progress * (n - 1)) + 1} / ${n}`; } } });
  $('#count').textContent = `1 / ${n}`;
  if (reduced) return;
  // depth: the giant word moves slower than the cards, each card tilts in 3D and its image slides inside the frame
  gsap.to('.work__ghost', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: '#work', start: 'top top', end: () => '+=' + dist(), scrub: true } });
  $$('.card').forEach((card) => {
    const st = () => ({ trigger: card, containerAnimation: scroll, start: 'left 98%', end: 'right 2%', scrub: true });
    gsap.timeline({ scrollTrigger: st(), defaults: { ease: 'none' } })
      .fromTo(card, { scale: 0.86, rotationY: -16, opacity: 0.45, transformPerspective: 1200 }, { scale: 1, rotationY: 0, opacity: 1, duration: 0.5 })
      .to(card, { scale: 0.86, rotationY: 16, opacity: 0.45, duration: 0.5 });
    gsap.fromTo($('.card__px', card), { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: st() });
  });
});

gsap.fromTo('.tl__fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#tl', start: 'top 60%', end: 'bottom 60%', scrub: true } });
$$('.tl__item').forEach((it) => ScrollTrigger.create({ trigger: it, start: 'top 68%', onEnter: () => it.classList.add('is-on'), onLeaveBack: () => it.classList.remove('is-on') }));

if (!reduced) gsap.from('.hero__name span', { yPercent: 110, duration: 1.1, stagger: 0.12, ease: 'power4.out' });

/* ---------- 3D hero (lazy, skipped on data saver) ---------- */
let heroFx;
const canvas = $('#hero-canvas');
if (!navigator.connection?.saveData && canvas.getContext) {
  import('./hero3d.js').then((mod) => mod.initHero(canvas, reduced)).then((api) => (heroFx = api)).catch(() => canvas.remove());
}
if (!reduced) {
  ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => heroFx?.setScroll(s.progress) });
  // the photo leaves faster than the text, drifting up and shrinking
  gsap.to('.hero__photo', { y: -160, scale: 0.8, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: '55% top', scrub: true } });
  gsap.to('.hero__grid', { opacity: 0, y: -80, ease: 'none', scrollTrigger: { trigger: '#hero', start: '25% top', end: 'bottom 25%', scrub: true } });
}

/* ---------- Technology picker ---------- */
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-tech]');
  if (c) { picked = picked === c.dataset.tech ? null : c.dataset.tech; renderPick(); }
  const g = e.target.closest('[data-tl]');
  if (g) {
    if ($$('.tl__item')[+g.dataset.tl].hidden) $('[data-f="all"]').click();
    const li = $$('.tl__item')[+g.dataset.tl];
    $('.tl__head', li)?.setAttribute('aria-expanded', 'true');
    lenis ? lenis.scrollTo(li, { offset: -120 }) : li.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

/* ---------- Cursor + command palette ---------- */
if (!reduced) initCursor(t);
const go = (sel) => () => { const el = $(sel); lenis ? lenis.scrollTo(el) : el.scrollIntoView({ behavior: 'smooth' }); };
const palette = initPalette({ t, commands: () => [
  ...[['work', '#work', 'ri-folder-open-line'], ['path', '#path', 'ri-route-line'], ['stack', '#stack', 'ri-stack-line'], ['contact', '#contact', 'ri-mail-send-line']]
    .map(([k, sel, icon]) => ({ group: t('cmd.nav'), icon, label: t('nav.' + k), run: go(sel) })),
  { group: t('cmd.actions'), icon: 'ri-translate-2', label: t('cmd.to_lang'), run: () => { lang = lang === 'en' ? 'es' : 'en'; applyLang(); } },
  { group: t('cmd.actions'), icon: 'ri-contrast-2-line', label: t('cmd.theme'), run: () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark') },
  { group: t('cmd.actions'), icon: 'ri-download-line', label: t('hero.cv'), run: () => $('#cv').click() },
  { group: t('cmd.actions'), icon: 'ri-mail-line', label: t('cmd.mail'), run: () => (location.href = `mailto:${SITE.email}`) },
  { group: t('cmd.actions'), icon: 'ri-whatsapp-line', label: t('contact.whatsapp'), run: () => window.open($('#wa').href, '_blank', 'noopener') },
  ...PROJECTS.map((p) => ({ group: t('cmd.projects'), icon: 'ri-external-link-line', label: t(`projects.${p.id}.title`), run: () => window.open(p.url, '_blank', 'noopener') })),
] });
$('#pal-open').addEventListener('click', palette.open);
$('#pal-open kbd').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
window.addEventListener('palopen', () => lenis?.stop());
window.addEventListener('palclose', () => lenis?.start());

applyLang();
