// Maglietta 3D (three.js): sagoma imbottita con la grafica davanti (e dietro se c'è).
// Si gira trascinando; da sola ruota piano. mountTee(contenitore) -> { show(prodotto), destroy() }
import * as THREE from './vendor/three.module.min.js';

// Sagoma della maglietta (coordinate 0-1200, y verso il basso), stessa dei mockup piatti.
function teeShape() {
  const P = (x, y) => [(x - 600) / 400, -(y - 600) / 400];
  const s = new THREE.Shape();
  s.moveTo(...P(440, 120));
  s.bezierCurveTo(...P(480, 170), ...P(720, 170), ...P(760, 120));
  [[900, 160], [1080, 330], [960, 470], [890, 420], [895, 1110]].forEach(([x, y]) => s.lineTo(...P(x, y)));
  s.bezierCurveTo(...P(700, 1130), ...P(500, 1130), ...P(305, 1110));
  [[310, 420], [240, 470], [120, 330], [300, 160]].forEach(([x, y]) => s.lineTo(...P(x, y)));
  s.lineTo(...P(440, 120));
  return s;
}

// "Gonfia" le facce: il centro del busto sporge, i bordi restano sottili.
const puff = (x, y) => {
  const dx = x / 0.75, dy = (y + 0.35) / 1.4;
  return 0.07 * Math.max(0, 1 - dx * dx - dy * dy);
};
function inflate(geo, sign = 0) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const z = p.getZ(i);
    const dir = sign || Math.sign(z);
    if (dir) p.setZ(i, z + dir * puff(p.getX(i), p.getY(i)));
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
}

function blobShadow() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  r.addColorStop(0, 'rgba(0,0,0,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = -1.55;
  return m;
}

export function mountTee(el, { accent = '#ff2e7e', onReady } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null; // niente WebGL: resta l'immagine di riserva
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0.05, 6.3);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x554455, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2.5, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color(accent), 1.4); rim.position.set(-3, 1.5, -3); scene.add(rim);

  const DEPTH = 0.05;
  const body = new THREE.ExtrudeGeometry(teeShape(), { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 6, curveSegments: 28, steps: 1 });
  body.translate(0, 0, -DEPTH / 2);
  inflate(body);
  const fabric = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.92, metalness: 0 });
  const tee = new THREE.Group();
  tee.add(new THREE.Mesh(body, fabric));

  // Grafica: piano suddiviso che segue la curva del busto.
  const front = DEPTH / 2 + 0.035 + 0.004;
  const decal = (side) => {
    const g = new THREE.PlaneGeometry(1.08, 1.296, 24, 24);
    g.translate(0, 0.28, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, front + puff(p.getX(i), p.getY(i)));
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2 }));
    if (side === 'back') mesh.rotation.y = Math.PI;
    mesh.visible = false;
    tee.add(mesh);
    return mesh;
  };
  const art = { front: decal('front'), back: decal('back') };
  scene.add(tee, blobShadow());

  const loader = new THREE.TextureLoader();
  const load = (src) => new Promise((ok) => loader.load(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; ok(t); }, undefined, () => ok(null)));

  let target = 0, spin = 0, dragging = false, lastX = 0, vel = 0, t0 = performance.now(), raf = 0, flip = 0;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  async function show(p) {
    const [f, b] = await Promise.all([load(p.art), p.artBack ? load(p.artBack) : null]);
    fabric.color.set(p.colorHex);
    for (const [side, tex] of [['front', f], ['back', b]]) {
      const m = art[side];
      m.material.map?.dispose?.();
      m.material.map = tex; m.material.needsUpdate = true; m.visible = !!tex;
    }
    flip = 1; // un giro completo quando cambia il design
    onReady?.();
  }

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();

  const down = (e) => { dragging = true; lastX = e.clientX; vel = 0; el.setPointerCapture?.(e.pointerId); };
  const move = (e) => { if (!dragging) return; const dx = (e.clientX - lastX) / 120; lastX = e.clientX; target += dx; vel = dx; };
  const up = () => { dragging = false; };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);

  const tick = (now) => {
    const t = (now - t0) / 1000;
    if (!dragging) {
      target += vel; vel *= 0.94;
      // lasciata andare, torna verso il davanti (o il dietro se ha la stampa) e ondeggia
      if (Math.abs(vel) < 0.002) {
        const turn = Math.PI * (art.back.visible ? 1 : 2);
        const home = Math.round(target / turn) * turn + (still ? 0 : Math.sin(t * 0.7) * 0.45);
        target += (home - target) * 0.03;
      }
    }
    if (flip > 0) { target += 0.246 * flip; flip = Math.max(0, flip - 0.02); }
    spin += (target - spin) * 0.12;
    tee.rotation.y = spin;
    tee.rotation.x = still ? 0 : Math.sin(t * 0.8) * 0.04;
    tee.position.y = still ? 0 : Math.sin(t * 1.2) * 0.05;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    show,
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect();
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}
