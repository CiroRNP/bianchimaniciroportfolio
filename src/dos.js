import './dos.css';

// "sudo open terminal": a retro DOS shell that launches PORTAFOLIO.EXE. Loaded only when triggered.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let active = false;

const LET = { C: [' █████', '██    ', '██    ', '██    ', ' █████'], I: ['██', '██', '██', '██', '██'], R: ['█████ ', '██  ██', '█████ ', '██ ██ ', '██  ██'], O: [' ████ ', '██  ██', '██  ██', '██  ██', ' ████ '] };
const LOGO = [0, 1, 2, 3, 4].map((r) => [...'CIRO'].map((c) => LET[c][r]).join('  ')).join('\n');

const TXT = {
  en: {
    boot: ['CIRO-DOS [Version 1.0]', '(C) 2026 Ciro Bianchimani. All rights reserved.'],
    cmd: 'portfolio.exe', loading: 'Loading PORTFOLIO.EXE', skip: 'Enter: skip   Esc: exit',
    title: ' CIRO PORTFOLIO  v1.0 ', select: 'Select what you are looking for:',
    menu: ['PROJECTS', 'PATH', 'SKILLS', 'CONTACT', 'EXIT'],
    help: 'Arrows: move   SPACE / X / ENTER: choose', back: 'Back', exit: 'Exit', openBtn: 'OPEN',
    tech: 'Tech:', user: 'User:', pass: 'Password:', kinds: { work: 'WORK', study: 'STUDIES' },
  },
  es: {
    boot: ['CIRO-DOS [Versión 1.0]', '(C) 2026 Ciro Bianchimani. Todos los derechos reservados.'],
    cmd: 'portafolio.exe', loading: 'Cargando PORTAFOLIO.EXE', skip: 'Enter: saltar   Esc: salir',
    title: ' PORTAFOLIO DE CIRO  v1.0 ', select: 'Seleccione lo que busca:',
    menu: ['PROYECTOS', 'TRAYECTORIA', 'HABILIDADES', 'CONTACTO', 'SALIR'],
    help: 'Flechas: mover   ESPACIO / X / ENTER: elegir', back: 'Volver', exit: 'Salir', openBtn: 'ABRIR',
    tech: 'Tecnología:', user: 'Usuario:', pass: 'Clave:', kinds: { work: 'TRABAJO', study: 'ESTUDIOS' },
  },
};

function loadFont() {
  if (document.getElementById('dos-font')) return;
  const l = document.createElement('link');
  l.id = 'dos-font'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap';
  document.head.appendChild(l);
}

export function runDos(ctx) {
  if (active) return;
  active = true;
  loadFont();
  ctx.pause();
  const L = () => TXT[ctx.lang()];
  const st = { screen: 'boot', sel: 0, last: 0, items: [], fast: matchMedia('(prefers-reduced-motion: reduce)').matches };
  let alive = true;

  const el = document.createElement('div');
  el.className = 'dos'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'CIRO-DOS');
  el.innerHTML = '<div class="dos__boot"><pre class="dos__out"></pre><p class="dos__skip"></p></div><div class="dos__app"></div><div class="dos__crt"></div>';
  document.body.appendChild(el);
  document.documentElement.classList.add('in-dos');
  const app = $('.dos__app', el);

  const close = () => {
    alive = false;
    removeEventListener('keydown', onKey, true);
    el.remove();
    document.documentElement.classList.remove('in-dos');
    ctx.resume();
    active = false;
  };

  /* ----- content of each screen ----- */
  const sections = (key) => {
    const T = L(), t = ctx.t, lang = ctx.lang();
    if (key === 'projects') return ctx.PROJECTS.map((p) => ({
      label: t(`projects.${p.id}.title`), href: p.url,
      detail: `<h2>${esc(t(`projects.${p.id}.title`))}</h2><p>${esc(t(`projects.${p.id}.desc`))}</p><p><b>${T.tech}</b> ${esc(p.stack)}</p><p><b>URL</b> ${esc(p.url)}</p>${p.creds ? `<p><b>${T.user}</b> ${esc(p.creds.user)}<br><b>${T.pass}</b> ${esc(p.creds.pass)}</p>` : ''}`,
    }));
    if (key === 'saves') return t('timeline').map((it) => ({
      label: it.title,
      detail: `<h2>${esc(it.title)}</h2><p><b>${esc(it.period)}</b> | ${esc(it.org)} | ${T.kinds[it.kind]}</p>${it.points.length ? `<ul>${it.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`,
    }));
    if (key === 'skills') return ctx.STACK.map((s) => {
      const ps = ctx.PROJECTS.filter((p) => p.tech?.includes(s)), ex = ctx.EXP[s] || [];
      return {
        label: s,
        detail: `<h2>${esc(s)}</h2>`
          + (ps.length ? `<p>${esc(t('stack.with').replace('{x}', s))}</p><ul>${ps.map((p) => `<li>${esc(t(`projects.${p.id}.title`))}</li>`).join('')}</ul>` : `<p>${esc(t('stack.none').replace('{x}', s))}</p>`)
          + (ex.length ? `<p>${esc(t('stack.also'))}</p><ul>${ex.map((i) => `<li>${esc(t(`timeline.${i}.org`))}: ${esc(t(`timeline.${i}.title`))}</li>`).join('')}</ul>` : ''),
      };
    });
    const wa = document.getElementById('wa')?.href || '#';
    return [
      { label: 'Email', href: `mailto:${ctx.SITE.email}`, detail: `<h2>Email</h2><p>${esc(ctx.SITE.email)}</p>` },
      { label: 'WhatsApp', href: wa, detail: `<h2>WhatsApp</h2><p>${esc(t('contact.whatsapp'))}</p>` },
      ...ctx.SITE.social.map((s) => ({ label: s.label, href: s.url, detail: `<h2>${esc(s.label)}</h2><p>${esc(s.url)}</p>` })),
      { label: t('hero.cv'), href: ctx.cvFor(lang), dl: true, detail: `<h2>${esc(t('hero.cv'))}</h2><p>PDF</p>` },
    ];
  };

  const frame = (title, inner, inSection) => `<div class="dos__title">${esc(title)}</div><div class="dos__win">${inner}</div>
    <div class="dos__status"><span>${esc(L().help)}</span><span>${inSection ? `<button data-act="back"><b>ESC</b> ${esc(L().back)}</button>` : ''}<button data-act="exit"><b>F10</b> ${esc(L().exit)}</button></span></div>`;

  const setSel = (i) => {
    const menu = st.screen === 'menu', n = menu ? L().menu.length : st.items.length;
    st.sel = Math.max(0, Math.min(n - 1, i));
    if (menu) {
      $$('.dos__menu li', app).forEach((li, k) => { li.classList.toggle('sel', k === st.sel); li.textContent = `[${k === st.sel ? 'X' : ' '}] ${li.dataset.n}`; });
      return;
    }
    $$('.dos__list li', app).forEach((li, k) => li.classList.toggle('sel', k === st.sel));
    $('.dos__list li.sel', app)?.scrollIntoView({ block: 'nearest' });
    const it = st.items[st.sel], box = $('.dos__detail', app);
    box.innerHTML = it.detail + (it.href ? `<p><button class="dos__btn" data-act="open">[ ${esc(L().openBtn)} ]</button></p>` : '');
    box.scrollTop = 0;
  };

  const drawMenu = (idx = 0) => {
    const T = L(), roles = ctx.t('hero.roles');
    st.screen = 'menu';
    app.innerHTML = frame(T.title, `<div class="dos__pres"><pre class="dos__logo">${LOGO}</pre><h1>Ciro Bianchimani</h1><p class="dos__role">${esc(roles.join('  |  '))}</p><p class="dos__sum">${esc(ctx.t('hero.intro'))}</p><p class="dos__loc">${esc(ctx.t('hero.loc'))}</p><p class="dos__ask">${esc(T.select)}</p><ul class="dos__menu">${T.menu.map((n, i) => `<li data-i="${i}" data-n="${esc(n)}"></li>`).join('')}</ul></div>`, false);
    setSel(idx);
  };

  const drawSection = (key, idx) => {
    st.screen = key; st.items = sections(key);
    app.innerHTML = frame(`${L().menu[idx]} (${st.items.length})`, `<div class="dos__split"><ul class="dos__list">${st.items.map((it, i) => `<li data-i="${i}">${esc(it.label)}</li>`).join('')}</ul><div class="dos__detail"></div></div>`, true);
    setSel(0);
  };

  const choose = (i) => {
    st.last = i;
    if (i === 4) close(); else drawSection(['projects', 'saves', 'skills', 'contact'][i], i);
  };

  const act = () => {
    const it = st.items[st.sel];
    if (!it?.href) return;
    if (it.dl) { const a = document.createElement('a'); a.href = it.href; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); }
    else if (it.href.startsWith('mailto:')) location.href = it.href;
    else window.open(it.href, '_blank', 'noopener');
  };

  /* ----- input: keyboard and mouse ----- */
  function onKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); e.stopImmediatePropagation(); return; }
    const k = e.key;
    if (k === 'F10') { e.preventDefault(); close(); return; }
    if (st.screen === 'boot') {
      if (k === 'Escape') close(); else if (k === 'Enter' || k === ' ') { e.preventDefault(); st.fast = true; }
      return;
    }
    const menu = st.screen === 'menu';
    if (k === 'ArrowDown') { e.preventDefault(); setSel(st.sel + 1); }
    else if (k === 'ArrowUp') { e.preventDefault(); setSel(st.sel - 1); }
    else if (k === 'Home') { e.preventDefault(); setSel(0); }
    else if (k === 'End') { e.preventDefault(); setSel(1e3); }
    else if (k === 'Enter' || k === ' ' || k.toLowerCase() === 'x') { e.preventDefault(); if (menu) choose(st.sel); else act(); }
    else if (k === 'Escape') { if (menu) close(); else drawMenu(st.last); }
    else if (k === 'Backspace' && !menu) { e.preventDefault(); drawMenu(st.last); }
    else if (menu && /^[1-5]$/.test(k)) choose(+k - 1);
  }
  addEventListener('keydown', onKey, true);

  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (b) { const a = b.dataset.act; if (a === 'exit') close(); else if (a === 'back') drawMenu(st.last); else if (a === 'open') act(); return; }
    const li = e.target.closest('li[data-i]');
    if (!li) return;
    if (st.screen === 'menu') choose(+li.dataset.i); else setSel(+li.dataset.i);
  });
  app.addEventListener('dblclick', (e) => { if (st.screen !== 'menu' && e.target.closest('.dos__list li')) act(); });
  app.addEventListener('mousemove', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li && +li.dataset.i !== st.sel) setSel(+li.dataset.i);
  });

  /* ----- boot: black screen, cursor, types the command, then the program opens bottom to top ----- */
  const sleep = async (ms) => { await new Promise((r) => setTimeout(r, st.fast ? 0 : ms)); if (!alive) throw new Error('closed'); };
  (async () => {
    const out = $('.dos__out', el), T = L();
    $('.dos__skip', el).textContent = T.skip;
    let text = T.boot.join('\n') + '\n\nC:\\> ';
    const draw = () => { out.innerHTML = esc(text) + '<span class="dos__cur"></span>'; };
    draw(); await sleep(900);
    for (const ch of T.cmd) { text += ch; draw(); await sleep(95); }
    await sleep(450);
    text += '\n\n' + T.loading + ' '; draw();
    for (let i = 0; i < 24; i++) { text += '█'; draw(); await sleep(45); }
    await sleep(400);
    drawMenu(0);
    app.classList.add('reveal');
  })().catch((err) => { if (err.message !== 'closed') console.error(err); });
}
