// Renderizza le grafiche delle frasi come PNG trasparenti 4500x5400 (300 dpi) per Printful.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const F = __dirname + '/fonts';
const face = (fam, dir, file) => `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${require("fs").readFileSync(`${F}/${dir}/files/${file}`).toString("base64")}) format("woff2")}`;
const fonts = [
  face('Anton', 'anton', 'anton-latin-400-normal.woff2'),
  face('Mr Dafoe', 'mr-dafoe', 'mr-dafoe-latin-400-normal.woff2'),
  face('Bowlby One', 'bowlby-one', 'bowlby-one-latin-400-normal.woff2'),
  face('Dela Gothic One', 'dela-gothic-one', 'dela-gothic-one-latin-400-normal.woff2'),
  face('Sedgwick', 'sedgwick-ave-display', 'sedgwick-ave-display-latin-400-normal.woff2'),
  face('Rubik Mono One', 'rubik-mono-one', 'rubik-mono-one-latin-400-normal.woff2'),
  face('Bungee', 'bungee', 'bungee-latin-400-normal.woff2'),
  face('Archivo Black', 'archivo-black', 'archivo-black-latin-400-normal.woff2'),
].join('');
const PINK = '#ff2e7e', CREAM = '#fff4e2', RED = '#e8112d', INK = '#141014', YEL = '#ffd21f';

const designs = {
  // 1. Su maglietta nera
  'call-me-daddy': `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="font:400 560px/0.86 Anton;color:${CREAM};letter-spacing:-6px;text-align:center">CALL<br>ME</div>
      <div style="font:400 600px/1 'Mr Dafoe';color:${PINK};margin-top:-250px;transform:rotate(-8deg);text-shadow:0 0 0 ${PINK}">Daddy</div>
      <div style="font:400 64px Anton;color:${CREAM};letter-spacing:28px;margin-top:90px">· SE HAI IL CORAGGIO ·</div>
    </div>`,
  // 2. Su maglietta bianca
  'colpo-di-fulmine': `
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px">
      <div style="font:400 150px/1 'Bowlby One';color:${INK};text-align:center">CREDI AL</div>
      <div style="display:flex;align-items:center;gap:20px">
        <svg width="300" height="520" viewBox="0 0 60 104"><path d="M38 0 L4 60 H26 L18 104 L56 38 H34 L44 0 Z" fill="${YEL}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>
        <div style="font:400 205px/0.95 'Bowlby One';color:${RED};text-align:left">COLPO<br>DI<br>FULMINE</div>
      </div>
      <div style="font:400 130px/1.05 'Mr Dafoe';color:${INK};text-align:center;transform:rotate(-4deg)">o devo ripassare?</div>
    </div>`,
  // 3. Su maglietta bianca: ricevuta di prestito
  'presti-un-bacio': `
    <div style="position:absolute;left:150px;right:150px;top:160px;bottom:160px;border:14px solid ${INK};border-radius:24px;padding:80px 100px;display:flex;flex-direction:column;gap:34px;font-family:'Archivo Black';color:${INK}">
      <div style="display:flex;justify-content:space-between;font-size:64px;letter-spacing:8px"><span>RICEVUTA</span><span>N° 0069</span></div>
      <div style="height:10px;background:repeating-linear-gradient(90deg,${INK} 0 40px,transparent 40px 64px)"></div>
      <div style="font:400 175px/0.98 'Dela Gothic One'">MI PRESTI UN BACIO?</div>
      <div style="height:10px;background:repeating-linear-gradient(90deg,${INK} 0 40px,transparent 40px 64px)"></div>
      <div style="display:flex;justify-content:space-between;font-size:54px"><span>OGGETTO</span><span>1 BACIO</span></div>
      <div style="display:flex;justify-content:space-between;font-size:54px"><span>RESTITUZIONE</span><span>GARANTITA</span></div>
      <div style="display:flex;justify-content:space-between;font-size:54px"><span>INTERESSI</span><span style="color:${RED}">DA CONCORDARE</span></div>
      <div style="margin-top:auto;align-self:flex-end;font:400 150px/1 'Mr Dafoe';color:${RED};transform:rotate(-6deg);white-space:nowrap">te lo restituisco</div>
    </div>`,
  // 4. Su maglietta nera: mappa
  'perso-nei-tuoi-occhi': `
    <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800"><path d="M210 1560 C 420 1380, 180 1200, 470 1110 S 980 1240, 1050 980 S 760 700, 1120 560" fill="none" stroke="${YEL}" stroke-width="16" stroke-dasharray="2 46" stroke-linecap="round"/>
      <circle cx="210" cy="1560" r="34" fill="${YEL}"/>
      <g stroke="${PINK}" stroke-width="30" stroke-linecap="round"><line x1="1070" y1="510" x2="1170" y2="610"/><line x1="1170" y1="510" x2="1070" y2="610"/></g></svg>
    <div style="position:absolute;left:120px;right:120px;top:130px;font:400 230px/0.95 Sedgwick;color:${CREAM};transform:rotate(-3deg)">Hai una<br>mappa?</div>
    <div style="position:absolute;right:110px;bottom:170px;width:1150px;text-align:right;font:400 150px/1 Sedgwick;color:${CREAM};transform:rotate(-3deg)">Mi sono perso<br>nei tuoi <span style="color:${PINK}">occhi</span></div>`,
  // 5. Su maglietta bianca: giri in testa
  'giri-in-testa': `
    <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800">
      <defs><path id="c1" d="M750 900 m-560 0 a560 560 0 1 1 1120 0 a560 560 0 1 1 -1120 0"/><path id="c2" d="M750 900 m-400 0 a400 400 0 1 1 800 0 a400 400 0 1 1 -800 0"/></defs>
      <text font-family="Rubik Mono One" font-size="96" fill="${INK}" letter-spacing="6"><textPath href="#c1" textLength="3440" lengthAdjust="spacing">SEI STANCA? · SEI STANCA? · SEI STANCA? ·</textPath></text>
      <text font-family="Rubik Mono One" font-size="64" fill="${RED}" letter-spacing="4"><textPath href="#c2" textLength="2440" lengthAdjust="spacing">MI GIRI IN TESTA · MI GIRI IN TESTA ·</textPath></text>
      <text x="750" y="850" text-anchor="middle" font-family="Mr Dafoe" font-size="200" fill="${INK}">da tutta</text>
      <text x="750" y="1030" text-anchor="middle" font-family="Mr Dafoe" font-size="200" fill="${RED}">la sera</text>
    </svg>`,
  // 6. Su maglietta nera: mirino
  'ci-vedo-bene': `
    <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800"><g fill="none" stroke="${CREAM}" stroke-width="22">
      <path d="M140 420 V260 H300"/><path d="M1200 260 H1360 V420"/><path d="M1360 1380 V1540 H1200"/><path d="M300 1540 H140 V1380"/></g>
      <circle cx="1270" cy="340" r="26" fill="${RED}"/><text x="1220" y="358" text-anchor="end" font-family="Bungee" font-size="54" fill="${RED}">REC</text></svg>
    <div style="position:absolute;left:230px;right:230px;top:380px;bottom:380px;display:flex;flex-direction:column;justify-content:center;gap:50px;color:${CREAM}">
      <div style="font:400 92px/1.1 Bungee">NON SONO UN FOTOGRAFO,</div>
      <div style="font:400 160px/0.95 Bungee;color:${YEL}">MA CI VEDO BENE</div>
      <div style="font:400 300px/0.8 'Mr Dafoe';color:${PINK};transform:rotate(-6deg)">insieme</div>
    </div>`,
};

(async () => {
  const b = await chromium.launch();
  const out = process.argv[2];
  const p = await b.newPage({ viewport: { width: 1500, height: 1800 }, deviceScaleFactor: 3 });
  for (const [name, body] of Object.entries(designs)) {
    await p.setContent(`<style>${fonts} html,body{margin:0;background:transparent;width:1500px;height:1800px;overflow:hidden} body{position:relative}</style>${body}`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/${name}.png`, omitBackground: true });
  }
  await b.close();
})();
