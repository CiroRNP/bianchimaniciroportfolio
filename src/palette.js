// Ctrl/Cmd+K command palette. `commands()` returns [{ group, icon, label, run }].
export function initPalette({ t, commands }) {
  const $ = (s) => document.getElementById(s);
  const pal = $('pal'), q = $('pal-q'), list = $('pal-list');
  let items = [], sel = 0, last;

  const render = () => {
    const s = q.value.trim().toLowerCase();
    items = commands().filter((c) => (c.secret ? s.startsWith(c.secret) : !s || `${c.label} ${c.group}`.toLowerCase().includes(s)));
    sel = 0;
    list.innerHTML = items.length
      ? items.map((c, i) => `<li role="option" data-i="${i}" aria-selected="${i === 0}"><i class="${c.icon}"></i><span>${c.label}</span><small>${c.group}</small></li>`).join('')
      : `<li class="pal__empty">${t('cmd.empty')}</li>`;
  };
  const mark = () => {
    [...list.children].forEach((li, i) => li.setAttribute('aria-selected', i === sel));
    list.children[sel]?.scrollIntoView({ block: 'nearest' });
  };
  const open = () => { last = document.activeElement; pal.hidden = false; q.value = ''; render(); q.focus(); window.dispatchEvent(new Event('palopen')); };
  const close = () => { pal.hidden = true; last?.focus?.(); window.dispatchEvent(new Event('palclose')); };
  const run = (i) => { const c = items[i]; if (c) { close(); c.run(); } };

  q.addEventListener('input', render);
  list.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) run(+li.dataset.i); });
  pal.addEventListener('mousedown', (e) => { if (e.target === pal) close(); });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? open() : close(); return; }
    if (pal.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); sel = (sel + 1) % items.length; mark(); }
    else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); sel = (sel - 1 + items.length) % items.length; mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    else if (e.key === 'Tab') { e.preventDefault(); q.focus(); }
  });
  return { open };
}
