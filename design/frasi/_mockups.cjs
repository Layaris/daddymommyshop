// Mockup piatti (maglietta + grafica) per il sito: 1200x1200 JPG.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
const D = '/mnt/project-files/sito-magliette/design/frasi';
const list = [
  ['call-me-daddy', 'black'], ['ci-vedo-bene', 'black'], ['perso-nei-tuoi-occhi', 'black'],
  ['colpo-di-fulmine', 'white'], ['presti-un-bacio', 'white'], ['giri-in-testa', 'white'],
];
const tee = (c) => {
  const base = c === 'black' ? '#1a1a1c' : '#f6f5f2';
  const shade = c === 'black' ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.07)';
  const deep = c === 'black' ? 'rgba(0,0,0,.45)' : 'rgba(0,0,0,.10)';
  return `<svg viewBox="0 0 1200 1200" style="position:absolute;inset:0">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecebe8"/><stop offset="1" stop-color="#dcdad5"/></linearGradient>
  <radialGradient id="sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="rgba(0,0,0,.22)"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient></defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <ellipse cx="600" cy="1130" rx="420" ry="40" fill="url(#sh)"/>
  <path d="M440 120 C 480 170, 720 170, 760 120 L 900 160 L 1080 330 L 960 470 L 890 420 L 895 1110 C 700 1130, 500 1130, 305 1110 L 310 420 L 240 470 L 120 330 L 300 160 Z" fill="${base}"/>
  <path d="M440 120 C 480 170, 720 170, 760 120 C 740 200, 460 200, 440 120 Z" fill="${deep}"/>
  <path d="M310 420 L 305 1110 C 330 1112, 350 1114, 370 1115 L 360 430 Z" fill="${shade}"/>
  <path d="M890 420 L 895 1110 C 870 1112, 850 1114, 830 1115 L 840 430 Z" fill="${shade}"/>
  <path d="M300 160 L 240 470 L 310 420 Z" fill="${shade}"/><path d="M900 160 L 960 470 L 890 420 Z" fill="${shade}"/>
  </svg>`;
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  for (const [name, color] of list) {
    const img = fs.readFileSync(`${D}/${name}.png`).toString('base64');
    await p.setContent(`<style>html,body{margin:0;width:1200px;height:1200px;position:relative;overflow:hidden}</style>${tee(color)}
      <img src="data:image/png;base64,${img}" style="position:absolute;left:432px;top:250px;width:336px;height:403px">`);
    await p.waitForTimeout(150);
    await p.screenshot({ path: `/mnt/project-files/sito-magliette/site/public/img/${name}.jpg`, type: 'jpeg', quality: 86 });
  }
  await b.close();
})();
