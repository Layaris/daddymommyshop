// Maglietta 3D (three.js): la foto vera di Printful (maglietta piatta, fondo trasparente) su un
// telo morbido che respira e ondeggia. Dietro c'è la stampa del retro, se esiste, altrimenti la
// maglietta liscia. Si gira trascinando. mountTee(contenitore) -> { show({ front, back, colorHex }), destroy() }
import * as THREE from './vendor/three.module.min.js';

const SIZE = 3.1; // lato del telo, in unità della scena
const SEG = 72;

function blobShadow() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  r.addColorStop(0, 'rgba(0,0,0,.28)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .55), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = -1.62;
  return m;
}

// Retro senza stampa: la sagoma della maglietta davanti, a specchio, tinta unita.
function plainBack(img, hex) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d');
  g.translate(c.width, 0); g.scale(-1, 1);
  g.drawImage(img, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-in';
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  const base = new THREE.Color(hex);
  grad.addColorStop(0, `#${base.clone().offsetHSL(0, 0, .04).getHexString()}`);
  grad.addColorStop(1, `#${base.clone().offsetHSL(0, 0, -.04).getHexString()}`);
  g.fillStyle = grad; g.fillRect(0, 0, c.width, c.height);
  return c;
}

export function mountTee(el, { onReady } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null; // niente WebGL: resta l'immagine di riserva
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 6.6);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8c8d0, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(-2, 3, 4); scene.add(key);

  // Telo: un piano suddiviso che si deforma un po' a ogni fotogramma.
  // Davanti e dietro hanno ognuno il suo telo: stesse onde, pancia in fuori da entrambi i lati.
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  const geoBack = geo.clone();
  const pos = geo.attributes.position, posBack = geoBack.attributes.position;
  const base = Float32Array.from(pos.array);
  const mat = (side) => new THREE.MeshStandardMaterial({ side, alphaTest: 0.5, roughness: 0.9, metalness: 0, transparent: false });
  const front = new THREE.Mesh(geo, mat(THREE.FrontSide));
  const back = new THREE.Mesh(geoBack, mat(THREE.BackSide));
  const tee = new THREE.Group();
  tee.add(front, back);
  scene.add(tee, blobShadow());

  const loader = new THREE.TextureLoader();
  const load = (src) => (src ? new Promise((ok) => loader.load(src, ok, undefined, () => ok(null))) : Promise.resolve(null));
  const prep = (t, mirror) => {
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    if (mirror) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; }
    return t;
  };

  let target = 0, spin = 0, dragging = false, lastX = 0, vel = 0, raf = 0, pop = 0, hasBack = false;
  let tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;
  const t0 = performance.now();
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  async function show(p) {
    const [f, b] = await Promise.all([load(p.front), load(p.back)]);
    if (!f) return;
    for (const m of [front, back]) m.material.map?.dispose();
    front.material.map = prep(f);
    // il retro si vede da dietro: la texture va specchiata per leggersi dritta
    back.material.map = b ? prep(b, true) : prep(new THREE.CanvasTexture(plainBack(f.image, p.colorHex || '#141416')));
    front.material.needsUpdate = back.material.needsUpdate = true;
    hasBack = !!b;
    pop = 1;
    onReady?.();
  }

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // su schermi stretti allontano un po' la camera così la maglietta entra tutta
    camera.position.z = w / h < 0.9 ? 6.6 / (w / h) * 0.9 : 6.6;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();

  const down = (e) => { dragging = true; lastX = e.clientX; vel = 0; el.setPointerCapture?.(e.pointerId); };
  const move = (e) => {
    const r = el.getBoundingClientRect();
    aimX = ((e.clientY - r.top) / r.height - 0.5) * 0.25;
    aimY = ((e.clientX - r.left) / r.width - 0.5) * 0.35;
    if (!dragging) return;
    const dx = (e.clientX - lastX) / 110; lastX = e.clientX; target += dx; vel = dx;
  };
  const up = () => { dragging = false; };
  const leave = () => { aimX = aimY = 0; };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('pointerleave', leave);

  const tick = (now) => {
    const t = still ? 0 : (now - t0) / 1000;
    if (!dragging) {
      target += vel; vel *= 0.93;
      // lasciata andare, torna verso il davanti (o il retro stampato, se è più vicino)
      if (Math.abs(vel) < 0.002) {
        const turn = Math.PI * (hasBack ? 1 : 2);
        target += (Math.round(target / turn) * turn - target) * 0.05;
      }
    }
    if (pop > 0) pop = Math.max(0, pop - 0.025);
    spin += (target - spin) * 0.12;
    tiltX += (aimX - tiltX) * 0.06; tiltY += (aimY - tiltY) * 0.06;
    const sway = still ? 0 : Math.sin(t * 0.6) * 0.18;
    const e = 1 - pop;
    tee.rotation.set(tiltX, spin + sway + tiltY + pop * pop * Math.PI * 2, 0);
    tee.scale.setScalar(0.86 + 0.14 * (1 - (1 - e) ** 3));
    tee.position.y = still ? 0 : Math.sin(t * 1.1) * 0.04;

    // stoffa: pancia morbida al centro, onde leggere, pieghe quando gira veloce
    const fold = Math.max(-0.4, Math.min(0.4, (target - spin) * 0.6));
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      const nx = x / (SIZE / 2), ny = y / (SIZE / 2);
      const belly = 0.015 + 0.15 * Math.max(0, 1 - nx * nx * 1.6 - ny * ny * 0.9);
      const wave = still ? 0 : 0.03 * Math.sin(nx * 3.2 + t * 1.4) * Math.cos(ny * 2.4 + t * 0.9) + 0.018 * Math.sin(ny * 5 - t * 1.7);
      const z = wave + fold * nx * nx * 0.35;
      pos.setZ(i, z + belly); posBack.setZ(i, z - belly);
    }
    pos.needsUpdate = posBack.needsUpdate = true;
    geo.computeVertexNormals(); geoBack.computeVertexNormals();

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    show,
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener('pointerleave', leave);
      for (const m of [front, back]) { m.material.map?.dispose(); m.material.dispose(); }
      geo.dispose(); geoBack.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
