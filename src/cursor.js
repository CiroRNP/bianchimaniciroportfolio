// Follower dot. Grows into a label over project cards. Desktop with a mouse only.
export function initCursor(t) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const c = document.getElementById('cursor'), label = c.firstElementChild;
  document.documentElement.classList.add('has-cursor');
  let x = 0, y = 0, cx = 0, cy = 0;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; c.classList.add('on'); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => c.classList.remove('on'));
  document.addEventListener('pointerover', (e) => {
    const media = e.target.closest('.card__media');
    c.classList.toggle('big', !!media);
    c.classList.toggle('link', !media && !!e.target.closest('a, button, input'));
    label.textContent = media ? t('work.demo') : '';
  });
  (function loop() {
    cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
    c.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();
}