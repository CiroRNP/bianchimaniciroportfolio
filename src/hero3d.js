import * as THREE from 'three';
// Low-density 3D node network. Loaded lazily; pauses when off-screen.
export async function initHero(canvas, reduced) {
  const small = matchMedia('(max-width: 700px)').matches;
  const N = small ? 45 : 85, LINK = small ? 3.6 : 4.2, MAX = N * 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 14;
  let zt = 14;
  const group = new THREE.Group();
  scene.add(group);

  const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 26; pos[i * 3 + 1] = (Math.random() - 0.5) * 15; pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    for (let k = 0; k < 3; k++) vel[i * 3 + k] = (Math.random() - 0.5) * 0.012;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.16, transparent: true, opacity: 0.95 });
  group.add(new THREE.Points(pGeo, pMat));

  const lPos = new Float32Array(MAX * 6);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  const lMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.4 });
  group.add(new THREE.LineSegments(lGeo, lMat));

  const colors = () => {
    const c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    pMat.color.set(c); lMat.color.set(c);
  };
  colors();
  window.addEventListener('themechange', () => { colors(); draw(); });

  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  new ResizeObserver(size).observe(canvas); size();

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  window.addEventListener('deviceorientation', (e) => { if (e.gamma != null) { mx = e.gamma / 90; my = (e.beta - 45) / 90; } }, { passive: true });

  function draw() {
    let s = 0;
    for (let i = 0; i < N && s < MAX; i++) for (let j = i + 1; j < N && s < MAX; j++) {
      const dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < LINK * LINK) {
        lPos.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]], s * 6); s++;
      }
    }
    lGeo.setDrawRange(0, s * 2); lGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function tick() {
    for (let i = 0; i < N * 3; i++) {
      pos[i] += vel[i];
      const lim = i % 3 === 0 ? 13 : i % 3 === 1 ? 7.5 : 5;
      if (Math.abs(pos[i]) > lim) vel[i] *= -1;
    }
    pGeo.attributes.position.needsUpdate = true;
    camera.position.z += (zt - camera.position.z) * 0.08;
    ry += (mx * 0.35 - ry) * 0.04; rx += (my * 0.2 - rx) * 0.04;
    group.rotation.y = ry; group.rotation.x = rx;
    draw();
  }

  const api = { setScroll(p) { zt = 14 - p * 7; } };
  if (reduced) { draw(); return { setScroll() {} }; }
  let visible = true, raf = 0;
  const loop = () => { tick(); raf = requestAnimationFrame(loop); };
  const sync = () => { cancelAnimationFrame(raf); if (visible && !document.hidden) loop(); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  sync();
  return api;
}