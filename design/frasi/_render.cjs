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
