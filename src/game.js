import './game.css';

// Konami mode: the portfolio as a one-screen pixel-art RPG menu. Loaded only when triggered.
const $ = (s, r = document) => r.querySelector(s);
const MAIN = ['cognit', 'profes', 'tasks']; // projects labeled MAIN QUEST, the rest are SIDE QUEST
let active = false;

const TXT = {
  en: {
    nick: 'CIRO', cls: 'Class', lv: 'LV', hp: 'HP', xp: 'XP', lives: 'LIVES', ach: 'Achievements',
    tabs: ['Past games', 'Saved games', 'Skills', 'Summon'],
    achs: { secret: 'Secret code', explorer: 'Explorer: visit every tab', player: 'Player: open a demo', archivist: 'Archivist: open a saved game', summoner: 'Summoner: open Summon' },
    unlocked: 'Unlocked:', win: 'GAME COMPLETE. SHALL WE TALK?',
    main: 'MAIN QUEST', side: 'SIDE QUEST', play: 'PLAY', slot: 'SLOT', kinds: { work: 'WORK', study: 'STUDY' },
    hint: 'Pick a skill to see where I used it.', summon: 'SUMMON', cv: 'Download CV',
    quit: 'Quit game', sound: 'Sound', on: 'on', off: 'off', help: 'Left / right: change tab. Esc: quit.',
    term: { tag: 'this is a joke. Esc to close', lines: ['$ sudo rm -rf /', '[sudo] password for visitor: ********', 'removing /usr/bin ... done', 'removing /home/ciro/projects ... done', 'removing /var/www/portfolio ... done', 'removing /etc/everything ...', "rm: cannot remove '/': Permission denied", '', 'Nice try. Just kidding, nothing was deleted.', 'I study cyberdefense, I would never do that.'] },
  },
  es: {
    nick: 'CIRO', cls: 'Clase', lv: 'NV', hp: 'HP', xp: 'XP', lives: 'VIDAS', ach: 'Logros',
    tabs: ['Partidas anteriores', 'Partidas guardadas', 'Habilidades', 'Invocar'],
    achs: { secret: 'Código secreto', explorer: 'Explorador: visitá cada pestaña', player: 'Jugador: abrí una demo', archivist: 'Archivista: abrí una partida guardada', summoner: 'Invocador: abrí Invocar' },
    unlocked: 'Desbloqueado:', win: 'JUEGO COMPLETO. ¿HABLAMOS?',
    main: 'MISIÓN PRINCIPAL', side: 'MISIÓN SECUNDARIA', play: 'JUGAR', slot: 'PARTIDA', kinds: { work: 'TRABAJO', study: 'ESTUDIO' },
    hint: 'Elegí una habilidad para ver dónde la usé.', summon: 'INVOCAR', cv: 'Descargar CV',
    quit: 'Abandonar partida', sound: 'Sonido', on: 'sí', off: 'no', help: 'Izquierda / derecha: cambiar de pestaña. Esc: abandonar.',
    term: { tag: 'es una broma. Esc para cerrar', lines: ['$ sudo rm -rf /', '[sudo] contraseña para visitante: ********', 'borrando /usr/bin ... listo', 'borrando /home/ciro/proyectos ... listo', 'borrando /var/www/portfolio ... listo', 'borrando /etc/todo ...', "rm: no se puede borrar '/': Permiso denegado", '', 'Buen intento. Es broma, no se borró nada.', 'Estudio ciberdefensa, jamás haría eso.'] },
  },
};

/* ---------- Fake terminal (in-page, clearly a joke) ---------- */
export function runTerminal(ctx) {
  const L = TXT[ctx.lang()].term;
  const el = document.createElement('div');
  el.className = 'term';
  el.innerHTML = `<div class="term__bar">visitor@portfolio: ~ <span>${L.tag}</span></div><pre></pre>`;
  document.body.appendChild(el);
  const pre = $('pre', el);
  let i = 0, timer, to;
  const close = () => { clearInterval(timer); clearTimeout(to); el.remove(); removeEventListener('keydown', esc); };
  const esc = (e) => e.key === 'Escape' && close();
  addEventListener('keydown', esc);
  el.addEventListener('click', close);
  timer = setInterval(() => {
    if (i < L.lines.length) pre.textContent += L.lines[i++] + '\n';
    else { clearInterval(timer); to = setTimeout(close, 4500); }
  }, 520);
}

/* ---------- Helpers ---------- */
function loadFonts() {
  if (document.getElementById('g-fonts')) return;
  const l = document.createElement('link');
  l.id = 'g-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap';
  document.head.appendChild(l);
}

function pixelPhoto(src, n = 36) {
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const x = c.getContext('2d'), img = new Image();
  img.onload = () => {
    const s = Math.min(img.width, img.height);
    x.drawImage(img, (img.width - s) / 2, (img.height - s) * 0.2, s, s, 0, 0, n, n);
    try {
      const d = x.getImageData(0, 0, n, n);
      for (let i = 0; i < d.data.length; i += 4) for (let k = 0; k < 3; k++) d.data[i + k] = Math.round(d.data[i + k] / 64) * 64;
      x.putImageData(d, 0, 0);
    } catch { /* keep the unposterized version */ }
  };
  img.src = src;
  return c;
}

// Pixel dissolve over the whole screen. `mid` runs when the screen is fully covered.
function wipe(mid) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { mid(); return Promise.resolve(); }
  return new Promise((done) => {
    const c = document.createElement('canvas');
    c.className = 'g-wipe';
    const w = (c.width = innerWidth), h = (c.height = innerHeight), x = c.getContext('2d');
    const B = Math.max(24, Math.round(w / 40)), cols = Math.ceil(w / B), rows = Math.ceil(h / B);
    const order = Array.from({ length: cols * rows }, (_, i) => i).sort(() => Math.random() - 0.5);
    const pal = ['#120d2b', '#1b1440', '#2a1f63', '#120d2b', '#1b1440', '#8b6cff'];
    const per = Math.ceil(order.length / 36);
    let n = 0, phase = 0;
    document.body.appendChild(c);
    (function step() {
      const end = Math.min(order.length, n + per);
      for (; n < end; n++) {
        const i = order[n], px = (i % cols) * B, py = ((i / cols) | 0) * B;
        if (phase === 0) { x.fillStyle = pal[(Math.random() * pal.length) | 0]; x.fillRect(px, py, B, B); } else x.clearRect(px, py, B, B);
      }
      if (n < order.length) return requestAnimationFrame(step);
      if (phase === 0) { phase = 1; n = 0; order.sort(() => Math.random() - 0.5); mid(); return setTimeout(step, 250); }
      c.remove(); done();
    })();
  });
}

// Original chiptune loop (square lead, triangle bass, noise drums). Not the Contra theme: that one is copyrighted.
function music() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return { stop() {}, mute() {}, blip() {}, jingle() {} };
  const ac = new AC(), master = ac.createGain();
  ac.resume?.();
  master.gain.value = 0.07; master.connect(ac.destination);
  const hz = (n) => 440 * 2 ** ((n - 69) / 12), step = 60 / 150 / 2;
  const LEAD = [76, 0, 72, 76, 79, 0, 76, 72, 77, 0, 72, 77, 81, 0, 77, 72, 79, 0, 76, 79, 84, 0, 79, 76, 74, 0, 71, 74, 79, 0, 74, 71];
  const ROOT = [33, 29, 36, 31];
  const nbuf = ac.createBuffer(1, ac.sampleRate * 0.2, ac.sampleRate);
  nbuf.getChannelData(0).forEach((_, i, a) => { a[i] = Math.random() * 2 - 1; });
  const tone = (type, f, t, len, vol, f2) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + len + 0.02);
  };
  const hit = (t, len, vol, hp) => {
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter();
    s.buffer = nbuf; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + len);
  };
  const play = (k, t) => {
    const bar = (k >> 3) & 3, s = k & 7;
    if (LEAD[k]) tone('square', hz(LEAD[k]), t, step * 0.9, 0.35);
    tone('triangle', hz(ROOT[bar] + (s % 3 === 2 ? 12 : 0)), t, step * 0.95, 0.9);
    if (s % 4 === 0) tone('sine', 160, t, 0.12, 1, 40);
    if (s % 4 === 2) hit(t, 0.12, 0.5, 1200);
    hit(t, 0.03, 0.15, 7000);
  };
  let i = 0, next = ac.currentTime + 0.1;
  const timer = setInterval(() => { while (next < ac.currentTime + 0.3) { play(i, next); next += step; i = (i + 1) % 32; } }, 80);
  return {
    stop() { clearInterval(timer); ac.close(); },
    mute(m) { master.gain.value = m ? 0 : 0.07; },
    blip(f = 880) { if (master.gain.value) tone('square', f, ac.currentTime, 0.07, 0.5); },
    jingle() { [660, 880, 1320].forEach((f, j) => master.gain.value && tone('square', f, ac.currentTime + j * 0.09, 0.1, 0.5)); },
  };
}

/* ---------- The game screen ---------- */
export function enterGame(ctx) {
  if (active) return;
  active = true;
  loadFonts();
  ctx.pause();
  const L = () => TXT[ctx.lang()];
  const ACH = ['secret', 'explorer', 'player', 'archivist', 'summoner'];
  const st = { tab: 0, seen: new Set([0]), got: new Set(['secret']), skill: null, sound: true };
  const years = new Date().getFullYear() - 2012; // working at RENAPER since 2012
  const photo = pixelPhoto(ctx.SITE.pixelPhoto || ctx.SITE.photo);
  const snd = music();
  let leaving = false;

  const el = document.createElement('div');
  el.className = 'game'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
  el.innerHTML = '<aside class="g-panel g-player"></aside><main class="g-panel g-main"><nav class="g-tabs" role="tablist"></nav><section class="g-view"></section></main><div class="g-foot"><p class="g-help"></p><div><button class="g-btn" data-act="sound"></button><button class="g-btn red" data-act="quit"></button></div></div><p class="g-toast" role="status"></p>';
  const q = (s) => $(s, el);

  const drawPlayer = () => {
    const l = L(), xp = st.got.size * 20;
    q('.g-player').innerHTML = `<div class="g-photo"></div><h2>${l.nick}</h2><p>${l.cls}: ${ctx.t('hero.roles')[0]}</p>
      <p class="g-lv">${l.lv} ${years}</p>
      <div class="g-stat"><span>${l.hp}</span><i class="g-track"><b style="width:100%;--c:#3fe08a"></b></i><span>100</span></div>
      <div class="g-stat"><span>${l.xp}</span><i class="g-track"><b style="width:${xp}%;--c:#4dd9ff"></b></i><span>${xp}</span></div>
      <p class="g-lives">${l.lives} x30</p><h3>${l.ach}</h3>
      <ul class="g-ach">${ACH.map((id) => `<li class="${st.got.has(id) ? 'on' : ''}">${l.achs[id]}</li>`).join('')}</ul>
      ${xp === 100 ? `<p class="g-win">${l.win}</p>` : ''}`;
    q('.g-photo').appendChild(photo);
  };

  const views = [
    () => `<div class="g-cards">${ctx.PROJECTS.map((p) => {
      const main = MAIN.includes(p.id);
      return `<article class="g-card"><p class="g-badge${main ? ' main' : ''}">${main ? L().main : L().side}</p><h3>${ctx.t(`projects.${p.id}.title`)}</h3><p>${ctx.t(`projects.${p.id}.desc`)}</p><small>${p.stack}</small><a class="g-btn" data-play href="${p.url}" target="_blank" rel="noopener">${L().play}</a></article>`;
    }).join('')}</div>`,
    () => `<div class="g-slots">${ctx.t('timeline').map((it, i) => `<details class="g-slot"><summary><b>${L().slot} ${i + 1}</b><span>${it.period}</span><strong>${it.title}</strong><em>${L().kinds[it.kind]}</em></summary><p>${it.org}</p>${it.points.length ? `<ul>${it.points.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}</details>`).join('')}</div>`,
    () => {
      const sk = st.skill, ps = sk ? ctx.PROJECTS.filter((p) => p.tech?.includes(sk)) : [];
      const info = !sk ? L().hint
        : ps.length ? `${ctx.t('stack.with').replace('{x}', sk)}: ${ps.map((p) => `<a data-play href="${p.url}" target="_blank" rel="noopener">${ctx.t(`projects.${p.id}.title`)}</a>`).join(', ')}`
        : ctx.t('stack.none').replace('{x}', sk);
      return `<div class="g-skills">${ctx.STACK.map((s) => `<button class="g-skill${sk === s ? ' on' : ''}" data-skill="${s}">${s}</button>`).join('')}</div><p class="g-info">${info}</p>`;
    },
    () => {
      const wa = document.getElementById('wa')?.href || '#';
      const links = [['Email', `mailto:${ctx.SITE.email}`], ['WhatsApp', wa, 1], ...ctx.SITE.social.map((s) => [s.label, s.url, 1]), [L().cv, ctx.cvFor(ctx.lang()), 0, 1]];
      return `<p>${ctx.t('contact.text')}</p><div class="g-summon">${links.map(([n, h, ext, dl]) => `<a class="g-btn" href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''}${dl ? ' download' : ''}>${L().summon} ${n}</a>`).join('')}</div>`;
    },
  ];

  const drawMain = () => {
    q('.g-tabs').innerHTML = L().tabs.map((n, i) => `<button role="tab" aria-selected="${i === st.tab}" data-tab="${i}">${i + 1} ${n}</button>`).join('');
    q('.g-view').innerHTML = views[st.tab]();
    q('.g-view').scrollTop = 0;
  };
  const drawFoot = () => {
    q('.g-help').textContent = L().help;
    q('[data-act="sound"]').textContent = `${L().sound}: ${st.sound ? L().on : L().off}`;
    q('[data-act="quit"]').textContent = L().quit;
  };

  const unlock = (id) => {
    if (st.got.has(id)) return;
    st.got.add(id); snd.jingle(); drawPlayer();
    const t = q('.g-toast');
    t.textContent = `${L().unlocked} ${L().achs[id]}`; t.classList.add('on');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600);
  };
  const go = (i) => {
    st.tab = i; st.seen.add(i); snd.blip();
    if (i === 3) unlock('summoner');
    if (st.seen.size === 4) unlock('explorer');
    drawMain();
  };

  const leave = () => {
    if (leaving) return;
    leaving = true;
    removeEventListener('keydown', onKey, true);
    snd.stop();
    wipe(() => { el.remove(); document.documentElement.classList.remove('in-game'); ctx.resume(); active = false; });
  };
  const onKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (e.key === 'Escape') leave();
    else if (e.key === 'ArrowRight') { e.preventDefault(); go((st.tab + 1) % 4); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go((st.tab + 3) % 4); }
    else if (/^[1-4]$/.test(e.key)) go(+e.key - 1);
  };

  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab],[data-act],[data-skill],[data-play],summary');
    if (!b) return;
    if (b.dataset.tab != null) go(+b.dataset.tab);
    else if (b.dataset.act === 'quit') leave();
    else if (b.dataset.act === 'sound') { st.sound = !st.sound; snd.mute(!st.sound); drawFoot(); }
    else if (b.dataset.skill) { st.skill = st.skill === b.dataset.skill ? null : b.dataset.skill; snd.blip(520); drawMain(); }
    else if (b.hasAttribute('data-play')) unlock('player');
    else if (b.tagName === 'SUMMARY') unlock('archivist');
  });

  wipe(() => {
    document.body.appendChild(el);
    document.documentElement.classList.add('in-game');
    drawPlayer(); drawMain(); drawFoot();
  }).then(() => addEventListener('keydown', onKey, true));
}
