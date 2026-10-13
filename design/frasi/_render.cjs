// Renderizza le grafiche delle frasi (in inglese) come PNG trasparenti 4500x5400 (300 dpi) per Printful.
// Uso: node design/frasi/_render.cjs   (scrive in design/frasi/<slug>.png)
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
const F = __dirname + '/../fonts';
const face = (fam, file) => `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${fs.readFileSync(`${F}/${file}`).toString('base64')}) format("woff2")}`;
const fonts = [
  face('Anton', 'anton-latin-400-normal.woff2'),
  face('Mr Dafoe', 'mr-dafoe-latin-400-normal.woff2'),
  face('Bowlby One', 'bowlby-one-latin-400-normal.woff2'),
  face('Dela Gothic One', 'dela-gothic-one-latin-400-normal.woff2'),
  face('Sedgwick', 'sedgwick-ave-display-latin-400-normal.woff2'),
  face('Rubik Mono One', 'rubik-mono-one-latin-400-normal.woff2'),
  face('Bungee', 'bungee-latin-400-normal.woff2'),
  face('Archivo Black', 'archivo-black-latin-400-normal.woff2'),
].join('');
const PINK = '#ff2e7e', CREAM = '#fff4e2', RED = '#e8112d', INK = '#141014', YEL = '#ffd21f';
const dash = `<div style="height:10px;background:repeating-linear-gradient(90deg,${INK} 0 40px,transparent 40px 64px)"></div>`;


// --- Finti ideogrammi a pennello (I can't read Chinese) ---
// Pennellata: curva cubica con spessore che parte pieno (attacco del pennello, tagliato in diagonale) e si assottiglia.
// s = [x0,y0, x1,y1, x2,y2, x3,y3, w0, w1]   (w1 piccolo = punta, w1 grande = fine tonda)
function brush([x0, y0, x1, y1, x2, y2, x3, y3, w0, w1 = 4]) {
  const N = 56, L = [], R = [];
  const pt = (t) => { const u = 1 - t; return [u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3, u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3]; };
  let d0;
  for (let i = 0; i <= N; i++) {
    const t = i / N, [x, y] = pt(t), [xa, ya] = pt(Math.max(0, t - 0.01)), [xb, yb] = pt(Math.min(1, t + 0.01));
    let dx = xb - xa, dy = yb - ya; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    if (!i) d0 = [dx, dy];
    const w = (w0 + (w1 - w0) * Math.pow(t, 1.8)) * (1 + 0.22 * Math.exp(-t * 18)) / 2;
    L.push([x - dy * w, y + dx * w]); R.push([x + dy * w, y - dx * w]);
  }
  const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  // attacco: punta del pennello che sporge in alto a sinistra
  const k = [x0 - d0[0] * w0 * 0.55 - Math.abs(d0[1]) * w0 * 0.25, y0 - d0[1] * w0 * 0.55 - w0 * 0.35];
  const end = w1 > 12 ? `A${w1 / 2} ${w1 / 2} 0 0 0` : 'L';
  return `<path d="M${f(R[0])} Q${f(k)} ${f(L[0])} L${L.slice(1).map(f).join(' L')} ${end} ${R.slice().reverse().map(f).join(' L')} Z"/>`;
}
// FREE: F sopra a sinistra (stessa asta della prima E), R sopra a destra, E E sotto.
const FREE = [
  [262,118, 360,100, 450,84, 545,62, 74,10],     // F barra alta, sale verso destra
  [300,110, 295,300, 280,480, 250,640, 82,40],   // asta comune F / E
  [110,330, 230,315, 340,305, 460,290, 64,10],   // F barra media che attraversa l'asta
  [655,150, 650,300, 645,420, 630,560, 76,24],   // R asta
  [640,165, 960,110, 960,350, 680,380, 66,14],   // R occhiello
  [720,380, 800,450, 880,520, 990,575, 70,6],    // R gamba lunga (come un 乀)
  [250,640, 245,740, 240,830, 225,935, 82,34],   // E1 asta
  [255,650, 330,642, 410,636, 480,625, 60,10],
  [245,790, 310,782, 370,778, 430,770, 54,10],
  [225,925, 330,915, 440,905, 540,890, 66,8],
  [620,640, 625,750, 620,850, 605,945, 78,30],   // E2 asta
  [615,650, 720,640, 820,632, 900,618, 62,8],
  [620,795, 690,786, 760,782, 830,772, 54,8],
  [605,935, 740,922, 880,910, 1010,880, 70,6],   // ultima barra lunga
];
// SEX: S in alto come un 乙, E sotto a sinistra, X sotto a destra come un 乂.
const SEX = [
  [760,60, 600,30, 360,110, 470,230, 76,46],     // S curva alta
  [470,230, 650,320, 720,430, 300,500, 68,6],    // S curva bassa che si chiude in punta
  [190,580, 195,700, 192,820, 178,945, 80,32],   // E asta
  [180,590, 270,580, 350,575, 430,560, 62,8],
  [190,760, 250,752, 310,748, 370,738, 54,8],
  [178,935, 280,925, 380,915, 470,895, 66,6],
  [560,560, 660,690, 780,830, 960,960, 84,8],    // X discendente
  [930,560, 840,690, 700,840, 520,985, 78,6],    // X ascendente
];
const ink = (strokes, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${INK}">${strokes.map(brush).join('')}</g>`;

const designs = {
  // Maglietta nera
  'call-me-daddy': `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="font:400 560px/0.86 Anton;color:${CREAM};letter-spacing:-6px;text-align:center">CALL<br>ME</div>
      <div style="font:400 500px/1 'Mr Dafoe';color:${PINK};margin-top:-210px;padding-right:60px;transform:rotate(-8deg)">Daddy</div>
      <div style="font:400 64px Anton;color:${CREAM};letter-spacing:28px;margin-top:90px">· IF YOU DARE ·</div>
    </div>`,
  // Maglietta bianca
  'love-at-first-sight': `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px">
      <div style="font:400 120px/1 'Bowlby One';color:${INK};text-align:center">DO YOU BELIEVE IN</div>
      <div style="display:flex;align-items:center;gap:20px">
        <svg width="280" height="520" viewBox="0 0 60 104"><path d="M38 0 L4 60 H26 L18 104 L56 38 H34 L44 0 Z" fill="${YEL}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>
        <div style="font:400 170px/0.95 'Bowlby One';color:${RED};text-align:left">LOVE<br>AT FIRST<br>SIGHT</div>
      </div>
      <div style="font:400 120px/1.05 'Mr Dafoe';color:${INK};text-align:center;transform:rotate(-4deg)">or should I walk by again?</div>
    </div>`,
  // Maglietta bianca: ricevuta
  'borrow-a-kiss': `
    <div style="position:absolute;left:150px;right:150px;top:160px;bottom:160px;border:14px solid ${INK};border-radius:24px;padding:80px 100px;display:flex;flex-direction:column;gap:34px;font-family:'Archivo Black';color:${INK}">
      <div style="display:flex;justify-content:space-between;font-size:64px;letter-spacing:8px"><span>RECEIPT</span><span>N° 0069</span></div>
      ${dash}
      <div style="font:400 165px/0.98 'Dela Gothic One'">CAN I BORROW A KISS?</div>
      ${dash}
      <div style="display:flex;justify-content:space-between;font-size:54px"><span>ITEM</span><span>1 KISS</span></div>
      <div style="display:flex;justify-content:space-between;font-size:54px"><span>RETURN</span><span>GUARANTEED</span></div>
      <div style="display:flex;justify-content:space-between;font-size:54px"><span>INTEREST</span><span style="color:${RED}">TO BE AGREED</span></div>
      <div style="margin-top:auto;align-self:flex-end;font:400 150px/1 'Mr Dafoe';color:${RED};transform:rotate(-6deg);white-space:nowrap">I'll give it back</div>
    </div>`,
  // Maglietta nera: mappa
  'lost-in-your-eyes': `
    <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800"><path d="M210 1560 C 420 1380, 180 1200, 470 1110 S 980 1240, 1050 980 S 760 700, 1120 560" fill="none" stroke="${YEL}" stroke-width="16" stroke-dasharray="2 46" stroke-linecap="round"/>
      <circle cx="210" cy="1560" r="34" fill="${YEL}"/>
      <g stroke="${PINK}" stroke-width="30" stroke-linecap="round"><line x1="1070" y1="510" x2="1170" y2="610"/><line x1="1170" y1="510" x2="1070" y2="610"/></g></svg>
    <div style="position:absolute;left:120px;right:120px;top:130px;font:400 250px/0.95 Sedgwick;color:${CREAM};transform:rotate(-3deg)">Got a<br>map?</div>
    <div style="position:absolute;right:110px;bottom:170px;width:1200px;text-align:right;font:400 150px/1 Sedgwick;color:${CREAM};transform:rotate(-3deg)">I just got lost<br>in your <span style="color:${PINK}">eyes</span></div>`,
  // Maglietta bianca: giri
  'running-through-my-mind': `
    <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800">
      <defs><path id="c1" d="M750 900 m-560 0 a560 560 0 1 1 1120 0 a560 560 0 1 1 -1120 0"/><path id="c2" d="M750 900 m-400 0 a400 400 0 1 1 800 0 a400 400 0 1 1 -800 0"/></defs>
      <text font-family="Rubik Mono One" font-size="96" fill="${INK}" letter-spacing="6"><textPath href="#c1" textLength="3440" lengthAdjust="spacing">TIRED? · TIRED? · TIRED? · TIRED? ·</textPath></text>
      <text font-family="Rubik Mono One" font-size="54" fill="${RED}" letter-spacing="3"><textPath href="#c2" textLength="2440" lengthAdjust="spacing">YOU'VE BEEN RUNNING THROUGH MY MIND ·</textPath></text>
      <text x="750" y="850" text-anchor="middle" font-family="Mr Dafoe" font-size="220" fill="${INK}">all</text>
      <text x="750" y="1040" text-anchor="middle" font-family="Mr Dafoe" font-size="220" fill="${RED}">night</text>
    </svg>`,
  // Maglietta nera: mirino
  'picture-us-together': `
    <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800"><g fill="none" stroke="${CREAM}" stroke-width="22">
      <path d="M140 420 V260 H300"/><path d="M1200 260 H1360 V420"/><path d="M1360 1380 V1540 H1200"/><path d="M300 1540 H140 V1380"/></g>
      <circle cx="1270" cy="340" r="26" fill="${RED}"/><text x="1220" y="358" text-anchor="end" font-family="Bungee" font-size="54" fill="${RED}">REC</text></svg>
    <div style="position:absolute;left:230px;right:230px;top:380px;bottom:380px;display:flex;flex-direction:column;justify-content:center;gap:50px;color:${CREAM}">
      <div style="font:400 96px/1.1 Bungee">I'M NO PHOTOGRAPHER,</div>
      <div style="font:400 150px/0.95 Bungee;color:${YEL}">BUT I CAN PICTURE US</div>
      <div style="font:400 300px/0.8 'Mr Dafoe';color:${PINK};transform:rotate(-6deg)">together</div>
    </div>`,
  // Maglietta nera: stelle rubate
  'stole-the-stars': `
    <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800">
      ${Array.from({ length: 34 }, (_, i) => { const x = 130 + ((i * 397) % 1240), y = 120 + ((i * 263) % 520), r = 6 + (i % 4) * 5; return `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 5 ? CREAM : YEL}"/>`; }).join('')}
      <path d="M750 210 l38 92 100 8 -76 64 24 98 -86 -54 -86 54 24 -98 -76 -64 100 -8z" fill="${YEL}"/>
    </svg>
    <div style="position:absolute;left:140px;right:140px;top:700px;display:flex;flex-direction:column;align-items:center;gap:30px;text-align:center;color:${CREAM}">
      <div style="font:400 150px/0.95 Anton;letter-spacing:2px">IS YOUR DAD<br>A THIEF?</div>
      <div style="font:400 140px/1 'Mr Dafoe';color:${PINK};transform:rotate(-4deg)">he stole the stars</div>
      <div style="font:400 86px/1 Anton;letter-spacing:6px">AND PUT THEM IN YOUR EYES</div>
    </div>`,
  // Maglietta bianca: multa
  'parking-ticket': `
    <div style="position:absolute;left:190px;right:190px;top:180px;bottom:180px;background:${YEL};border:14px solid ${INK};border-radius:18px;padding:90px 100px;display:flex;flex-direction:column;gap:40px;font-family:'Archivo Black';color:${INK}">
      <div style="display:flex;justify-content:space-between;font-size:60px;letter-spacing:6px"><span>CITATION</span><span>N° 69</span></div>
      ${dash}
      <div style="font:400 130px/1 'Dela Gothic One'">ARE YOU A PARKING TICKET?</div>
      <div style="font:400 64px/1.2 'Archivo Black'">'CAUSE YOU'VE GOT</div>
      <div style="font:400 330px/0.85 Anton;color:${RED};letter-spacing:4px">FINE</div>
      <div style="font:400 64px/1.2 'Archivo Black'">WRITTEN ALL OVER YOU</div>
      <div style="margin-top:auto;align-self:flex-end;font:400 130px/1 'Mr Dafoe';transform:rotate(-6deg)">pay up, gorgeous</div>
    </div>`,
  // --- Donna ---
  // Maglietta nera
  'call-me-mommy': `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="font:400 560px/0.86 Anton;color:${CREAM};letter-spacing:-6px;text-align:center">CALL<br>ME</div>
      <div style="font:400 390px/1 'Mr Dafoe';color:${PINK};margin-top:-160px;padding-right:40px;transform:rotate(-8deg)">Mommy</div>
      <div style="font:400 64px Anton;color:${CREAM};letter-spacing:22px;margin-top:90px">· IF YOU CAN KEEP UP ·</div>
    </div>`,
  // Maglietta bianca: cocktail
  'buy-me-a-drink-first': `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px">
      <svg width="520" height="560" viewBox="0 0 104 112"><path d="M8 8 H96 L56 56 V98 H76 V104 H28 V98 H48 V56 Z" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M20 20 H84 L52 52 Z" fill="${PINK}"/><circle cx="74" cy="14" r="9" fill="${RED}" stroke="${INK}" stroke-width="3"/><line x1="70" y1="2" x2="80" y2="-8" stroke="${INK}" stroke-width="3"/></svg>
      <div style="font:400 210px/0.95 'Bowlby One';color:${INK};text-align:center">BUY ME<br>A DRINK</div>
      <div style="font:400 280px/0.9 'Mr Dafoe';color:${RED};transform:rotate(-6deg);margin:-40px 0 60px">first.</div>
      <div style="font:400 70px 'Archivo Black';color:${INK};letter-spacing:18px">THEN WE'LL TALK</div>
    </div>`,
  // Maglietta nera: tabellone
  'out-of-your-league': `
    <div style="position:absolute;left:170px;right:170px;top:330px;bottom:330px;border:16px solid ${YEL};border-radius:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;color:${CREAM}">
      <div style="display:flex;gap:40px;font:400 70px Bungee;color:${YEL}"><span>HOME 10</span><span>·</span><span>YOU 0</span></div>
      <div style="font:400 250px/0.9 Bungee;text-align:center">OUT OF<br>YOUR<br>LEAGUE</div>
      <div style="font:400 260px/0.9 'Mr Dafoe';color:${PINK};transform:rotate(-6deg)">try anyway</div>
    </div>`,
  // Maglietta bianca: fumetto
  'talk-flirty-to-me': `
    <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800">
      <path d="M170 250 H1330 Q1390 250 1390 310 V1150 Q1390 1210 1330 1210 H640 L420 1430 L470 1210 H170 Q110 1210 110 1150 V310 Q110 250 170 250 Z" fill="none" stroke="${INK}" stroke-width="22" stroke-linejoin="round"/>
      <path d="M1180 1430 c-60-60-150-30-150 45 c0 80 150 150 150 150 s150-70 150-150 c0-75-90-105-150-45z" fill="${RED}"/>
    </svg>
    <div style="position:absolute;left:190px;right:190px;top:330px;height:800px;display:flex;flex-direction:column;justify-content:center;gap:20px;color:${INK}">
      <div style="font:400 205px/0.95 'Dela Gothic One'">TALK<br>FLIRTY</div>
      <div style="font:400 250px/0.9 'Mr Dafoe';color:${PINK};transform:rotate(-5deg);align-self:flex-end;margin-right:40px">to me</div>
    </div>`,
  // Maglietta bianca: finti ideogrammi che dicono FREE SEX
  'cant-read-chinese': `
    <div style="position:absolute;left:0;right:0;top:170px;text-align:center;white-space:nowrap;font:400 94px/1 'Archivo Black';color:${INK};letter-spacing:-1px;transform:skewX(-9deg)">I CAN'T READ CHINESE</div>
    <svg style="position:absolute;left:0;top:330px" width="1500" height="680" viewBox="0 0 1500 680">
      ${ink(FREE, 95, 25, 0.6)}${ink(SEX, 790, 25, 0.6)}
      <g transform="translate(1335 545) rotate(-5)"><rect x="0" y="0" width="92" height="100" rx="10" fill="${RED}"/>
        <text x="46" y="74" text-anchor="middle" font-family="Dela Gothic One" font-size="50" letter-spacing="-2" fill="#fff">69</text></g>
    </svg>
    <div style="position:absolute;left:0;right:0;top:1060px;text-align:center;white-space:nowrap;font:400 94px/1.05 'Archivo Black';color:${INK};letter-spacing:-1px;transform:skewX(-9deg)">BUT I CAN UNDERSTAND<br><span style="font-size:200px;line-height:1.08">THIS</span></div>`,
};

(async () => {
  const b = await chromium.launch();
  const out = process.argv[2] || __dirname;
  const only = process.argv[3];
  const p = await b.newPage({ viewport: { width: 1500, height: 1800 }, deviceScaleFactor: 3 });
  for (const [name, body] of Object.entries(designs)) {
    if (only && only !== name) continue;
    await p.setContent(`<style>${fonts} html,body{margin:0;background:transparent;width:1500px;height:1800px;overflow:hidden} body{position:relative}</style>${body}`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    
    await p.screenshot({ path: `${out}/${name}.png`, omitBackground: true });
  }
  await b.close();
})();
