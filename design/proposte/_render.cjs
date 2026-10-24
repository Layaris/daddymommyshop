// Proposte di nuove frasi (da approvare): stesse regole di design/frasi/_render.cjs, PNG trasparenti 4500x5400.
// Uso: node design/proposte/_render.cjs [cartella] [slug]
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
const heart = (c, s = 1) => `<path transform="scale(${s})" d="M50 88 C20 66 0 48 0 26 C0 10 12 0 26 0 C36 0 45 6 50 15 C55 6 64 0 74 0 C88 0 100 10 100 26 C100 48 80 66 50 88Z" fill="${c}"/>`;
const center = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center';

// colore della maglietta per ogni proposta
const COLOR = {};
const designs = {};
const add = (slug, color, body) => { COLOR[slug] = color; designs[slug] = body; };

// ---------------- UOMO ----------------
add('are-you-wifi', 'Black', `
  <div style="${center};gap:30px">
    <div style="font:400 120px/1 Bungee;color:${CREAM}">ARE YOU WIFI?</div>
    <svg width="560" height="420" viewBox="0 0 200 150"><g fill="none" stroke-linecap="round" stroke-width="16">
      <path d="M20 60 A110 110 0 0 1 180 60" stroke="${PINK}"/><path d="M48 90 A70 70 0 0 1 152 90" stroke="${PINK}"/>
      <path d="M76 118 A32 32 0 0 1 124 118" stroke="${YEL}"/></g><circle cx="100" cy="138" r="11" fill="${YEL}"/></svg>
    <div style="font:400 150px/1 'Mr Dafoe';color:${CREAM};transform:rotate(-4deg)">'cause I'm feeling a</div>
    <div style="font:400 300px/0.9 Anton;color:${PINK};letter-spacing:4px">CONNECTION</div>
  </div>`);
add('is-your-name-google', 'White', `
  <div style="${center};gap:60px;padding:0 120px">
    <div style="font:400 140px/1 'Bowlby One';color:${INK}">IS YOUR NAME GOOGLE?</div>
    <div style="display:flex;align-items:center;gap:30px;width:100%;border:12px solid ${INK};border-radius:999px;padding:44px 60px;font:400 66px/1.15 'Archivo Black';color:${INK};text-align:left">
      <svg width="110" height="110" viewBox="0 0 40 40" style="flex:none"><circle cx="16" cy="16" r="11" fill="none" stroke="${RED}" stroke-width="5"/><path d="M24 24 L36 36" stroke="${RED}" stroke-width="6" stroke-linecap="round"/></svg>
      <span>you've got everything I've been searching for</span></div>
    <div style="display:flex;gap:30px;font:400 54px 'Archivo Black'"><span style="background:${INK};color:#fff;border-radius:16px;padding:22px 40px">SEARCH</span><span style="background:${RED};color:#fff;border-radius:16px;padding:22px 40px">I'M FEELING LUCKY</span></div>
  </div>`);
add('taking-applications', 'White', `
  <div style="position:absolute;left:170px;right:170px;top:180px;bottom:180px;display:flex;flex-direction:column;gap:36px;color:${INK}">
    <div style="font:400 430px/0.8 Anton;letter-spacing:6px">SINGLE.</div>
    <div style="font:400 92px/1 'Archivo Black';color:${RED}">TAKING APPLICATIONS</div>
    ${dash}
    ${[['CUTE', 1], ['FUNNY', 1], ['GOOD TASTE IN SHIRTS', 1], ['PERFECT', 0]].map(([t, on]) => `<div style="display:flex;align-items:center;gap:40px;font:400 76px 'Archivo Black'"><span style="width:96px;height:96px;border:10px solid ${INK};border-radius:10px;display:grid;place-items:center;font:400 90px/1 'Archivo Black';color:${RED}">${on ? '✓' : ''}</span>${t}${on ? '' : '<span style="font-size:44px;opacity:.6">(NOT REQUIRED)</span>'}</div>`).join('')}
    <div style="margin-top:auto;align-self:flex-end;font:400 150px/1 'Mr Dafoe';color:${RED};transform:rotate(-6deg)">apply within</div>
  </div>`);
add('daddy-material', 'Black', `
  <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800">
    <defs><path id="r" d="M750 860 m-520 0 a520 520 0 1 1 1040 0 a520 520 0 1 1 -1040 0"/></defs>
    <circle cx="750" cy="860" r="640" fill="none" stroke="${YEL}" stroke-width="22"/>
    <circle cx="750" cy="860" r="400" fill="none" stroke="${YEL}" stroke-width="10" stroke-dasharray="4 26" stroke-linecap="round"/>
    <text font-family="Bungee" font-size="104" fill="${CREAM}" letter-spacing="4"><textPath href="#r" textLength="3200" lengthAdjust="spacing">CERTIFIED ★ DADDY MATERIAL ★ </textPath></text>
    <text x="750" y="860" text-anchor="middle" font-family="Anton" font-size="330" fill="${PINK}">100%</text>
    <text x="750" y="1010" text-anchor="middle" font-family="Mr Dafoe" font-size="170" fill="${CREAM}" transform="rotate(-5 750 1010)">grade A</text>
  </svg>`);
add('rated-by-my-mom', 'White', `
  <div style="${center};gap:30px">
    <div style="display:flex;gap:30px">${Array(5).fill(`<svg width="190" height="190" viewBox="0 0 24 24"><path d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 17.7 5.6 21.2 7 14 1.7 9l7.2-.9z" fill="${YEL}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/></svg>`).join('')}</div>
    <div style="font:400 560px/0.85 Anton;color:${INK}">10/10</div>
    <div style="font:400 100px/1 'Archivo Black';color:${INK};letter-spacing:6px">WOULD DATE AGAIN</div>
    <div style="font:400 200px/1 'Mr Dafoe';color:${RED};transform:rotate(-5deg)">— my mom</div>
  </div>`);
add('swipe-right', 'Black', `
  <div style="${center};gap:50px">
    <div style="position:relative;width:480px;height:720px;border:20px solid ${CREAM};border-radius:80px;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;top:40px;width:140px;height:20px;border-radius:10px;background:${CREAM}"></div>
      <svg width="320" height="290" viewBox="0 0 100 88">${heart(PINK)}</svg>
      <svg style="position:absolute;right:-330px;top:250px" width="300" height="160" viewBox="0 0 100 50"><path d="M0 25 H80 M60 5 L88 25 L60 45" fill="none" stroke="${YEL}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </div>
    <div style="font:400 260px/0.9 Anton;color:${CREAM};letter-spacing:6px;white-space:nowrap">SWIPE RIGHT</div>
    <div style="font:400 150px/1 'Mr Dafoe';color:${PINK};transform:rotate(-4deg)">you know you want to</div>
  </div>`);
add('may-flirt-without-notice', 'White', `
  <div style="${center};gap:40px">
    <svg width="900" height="790" viewBox="0 0 100 88"><path d="M50 4 L96 84 H4 Z" fill="${YEL}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <g transform="translate(31 38) scale(.38)">${heart(RED)}</g></svg>
    <div style="font:400 330px/0.85 Anton;color:${RED};letter-spacing:10px">WARNING</div>
    <div style="font:400 112px/1.05 'Archivo Black';color:${INK}">MAY FLIRT<br>WITHOUT NOTICE</div>
  </div>`);
add('your-place-or-mine', 'Black', `
  <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800">
    <rect x="725" y="200" width="50" height="860" rx="10" fill="${CREAM}"/>
    <path d="M770 330 H1300 L1400 450 L1300 570 H770 Z" fill="${PINK}"/>
    <path d="M730 690 H200 L100 810 L200 930 H730 Z" fill="${YEL}"/>
    <text x="1060" y="490" text-anchor="middle" font-family="Anton" font-size="160" fill="${INK}" letter-spacing="4">MINE</text>
    <text x="420" y="850" text-anchor="middle" font-family="Anton" font-size="130" fill="${INK}" letter-spacing="4">YOUR PLACE</text>
    <text x="750" y="1230" text-anchor="middle" font-family="Bungee" font-size="120" fill="${CREAM}">YOUR PLACE OR MINE?</text>
    <text x="750" y="1460" text-anchor="middle" font-family="Mr Dafoe" font-size="150" fill="${PINK}" transform="rotate(-4 750 1460)">either way, I'm driving</text>
  </svg>`);
add('free-hugs-kisses-extra', 'White', `
  <div style="position:absolute;left:220px;right:220px;top:260px;bottom:260px;border:16px solid ${INK};border-radius:40px 40px 40px 40px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;color:${INK};text-align:center">
    <div style="position:absolute;top:70px;width:110px;height:110px;border-radius:50%;border:14px solid ${INK}"></div>
    <div style="font:400 300px/0.88 Anton;margin-top:120px">FREE<br>HUGS</div>
    ${dash.replace('height:10px', 'height:10px;width:80%')}
    <div style="font:400 110px 'Archivo Black'">KISSES <span style="text-decoration:line-through;text-decoration-thickness:12px;color:${RED}">$69</span></div>
    <div style="font:400 160px/1 'Mr Dafoe';color:${RED};transform:rotate(-5deg)">price negotiable</div>
  </div>`);
add('kiss-me-im-single', 'Black', `
  <div style="${center};gap:20px">
    <svg width="900" height="520" viewBox="0 0 200 116"><path d="M4 58 C30 20 60 6 82 22 C92 28 98 30 100 30 C102 30 108 28 118 22 C140 6 170 20 196 58 C170 96 136 112 100 112 C64 112 30 96 4 58Z" fill="${PINK}"/>
      <path d="M8 58 C50 66 80 62 100 56 C120 62 150 66 192 58" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/></svg>
    <div style="font:400 440px/0.85 Anton;color:${CREAM};letter-spacing:6px">KISS ME</div>
    <div style="font:400 150px/1 Bungee;color:${YEL}">I'M SINGLE</div>
  </div>`);

// ---------------- DONNA ----------------
add('call-me-maybe', 'Black', `
  <div style="${center};gap:40px">
    <div style="display:grid;grid-template-columns:repeat(3,170px);gap:30px">${['1','2','3','4','5','6','7','8','9','*','0','#'].map((k) => `<div style="height:170px;border-radius:50%;border:10px solid ${k === '6' || k === '9' ? PINK : CREAM};display:grid;place-items:center;font:400 90px Bungee;color:${k === '6' || k === '9' ? PINK : CREAM}">${k}</div>`).join('')}</div>
    <div style="font:400 330px/0.85 Anton;color:${CREAM};letter-spacing:6px">CALL ME</div>
    <div style="font:400 220px/0.8 'Mr Dafoe';color:${PINK};transform:rotate(-6deg)">maybe.</div>
    <div style="font:400 60px 'Archivo Black';color:${YEL};letter-spacing:6px">(ACTUALLY, DO)</div>
  </div>`);
add('too-hot-to-handle', 'White', `
  <div style="${center};gap:30px">
    <svg width="560" height="700" viewBox="0 0 100 125"><path d="M50 4 C58 30 86 44 86 80 C86 104 70 121 50 121 C30 121 14 104 14 80 C14 60 26 50 32 36 C36 52 42 58 46 58 C40 40 42 20 50 4Z" fill="${RED}"/>
      <path d="M50 54 C56 70 70 78 70 96 C70 110 61 118 50 118 C39 118 30 110 30 96 C30 84 38 78 42 70 C44 80 48 84 50 84 C47 74 47 64 50 54Z" fill="${YEL}"/></svg>
    <div style="font:400 160px/1 'Bowlby One';color:${INK}">TOO HOT<br>TO HANDLE</div>
    <div style="font:400 210px/1 'Mr Dafoe';color:${RED};transform:rotate(-5deg)">try anyway</div>
  </div>`);
add('princess-by-day', 'Black', `
  <div style="${center};gap:30px">
    <svg width="420" height="260" viewBox="0 0 100 62"><path d="M6 56 L2 14 L26 34 L50 2 L74 34 L98 14 L94 56 Z" fill="${YEL}"/><circle cx="50" cy="40" r="7" fill="${PINK}"/></svg>
    <div style="font:400 250px/0.9 Anton;color:${CREAM};letter-spacing:4px">PRINCESS</div>
    <div style="font:400 110px/1 Bungee;color:${CREAM}">BY DAY</div>
    <div style="height:40px"></div>
    <svg width="420" height="200" viewBox="0 0 100 48"><path d="M6 46 C4 26 10 8 22 2 C18 16 22 30 34 40 Z M94 46 C96 26 90 8 78 2 C82 16 78 30 66 40 Z" fill="${PINK}"/></svg>
    <div style="font:400 300px/0.85 'Mr Dafoe';color:${PINK};transform:rotate(-5deg)">trouble</div>
    <div style="font:400 110px/1 Bungee;color:${PINK}">BY NIGHT</div>
  </div>`);
add('boyfriend-wanted', 'White', `
  <svg style="position:absolute;inset:0" viewBox="0 0 1500 1800">
    <path d="M300 420 L750 160 L1200 420" fill="none" stroke="${INK}" stroke-width="14"/><circle cx="750" cy="160" r="30" fill="${INK}"/>
    <rect x="160" y="400" width="1180" height="820" rx="40" fill="${YEL}" stroke="${INK}" stroke-width="18"/>
    <rect x="200" y="440" width="1100" height="740" rx="24" fill="none" stroke="${INK}" stroke-width="6" stroke-dasharray="20 18"/>
    <text x="750" y="720" text-anchor="middle" font-family="Anton" font-size="250" fill="${INK}" letter-spacing="6">BOYFRIEND</text>
    <text x="750" y="960" text-anchor="middle" font-family="Anton" font-size="250" fill="${RED}" letter-spacing="10">WANTED</text>
    <text x="750" y="1100" text-anchor="middle" font-family="Archivo Black" font-size="76" fill="${INK}" letter-spacing="8">INQUIRE WITHIN</text>
    <text x="750" y="1430" text-anchor="middle" font-family="Mr Dafoe" font-size="180" fill="${RED}" transform="rotate(-4 750 1430)">no time wasters</text>
  </svg>`);
add('wine-me-dine-me', 'Black', `
  <div style="${center};gap:10px">
    <svg width="260" height="380" viewBox="0 0 60 88"><path d="M8 4 H52 C54 28 44 44 30 46 C16 44 6 28 8 4Z" fill="${PINK}"/><path d="M30 46 V78 M14 84 H46" stroke="${CREAM}" stroke-width="5" stroke-linecap="round"/></svg>
    <div style="font:400 240px/0.95 Anton;color:${CREAM};letter-spacing:6px">WINE ME.</div>
    <div style="font:400 240px/0.95 Anton;color:${CREAM};letter-spacing:6px">DINE ME.</div>
    <div style="display:flex;align-items:center;gap:40px;margin-top:20px"><span style="font:400 240px/0.95 Anton;color:${PINK};letter-spacing:6px">69 ME.</span></div>
    <div style="font:400 140px/1 'Mr Dafoe';color:${YEL};transform:rotate(-4deg);margin-top:30px">in that order</div>
  </div>`);
add('not-your-baby', 'White', `
  <div style="${center};gap:40px">
    <div style="font:400 210px/0.9 'Bowlby One';color:${INK}">NOT YOUR<br>BABY</div>
    <svg width="440" height="520" viewBox="0 0 100 118">
      ${[14, 26, 38, 50, 62, 74, 86].map((x, i) => `<rect x="${x - 5}" y="${8 + (i % 3) * 8}" width="10" height="60" rx="3" fill="${YEL}" stroke="${INK}" stroke-width="2.5"/>`).join('')}
      <path d="M6 50 H94 L84 114 H16 Z" fill="${RED}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <g transform="translate(36 70) scale(.28)">${heart('#fff')}</g></svg>
    <div style="font:400 160px/1 'Mr Dafoe';color:${RED};transform:rotate(-4deg)">unless you buy me fries</div>
  </div>`);
add('professional-heartbreaker', 'White', `
  <div style="position:absolute;left:150px;right:150px;top:420px;height:900px;border:14px solid ${INK};border-radius:30px;padding:90px;display:flex;flex-direction:column;justify-content:space-between;color:${INK};transform:rotate(-3deg)">
    <div style="display:flex;justify-content:space-between;align-items:start">
      <div style="font:400 64px/1.2 'Archivo Black';letter-spacing:6px">HEARTBREAKER<br>& CO.</div>
      <svg width="230" height="210" viewBox="0 0 100 92"><path d="M50 88 C20 66 0 48 0 26 C0 10 12 0 26 0 C36 0 45 6 50 15 L42 34 L54 46 L44 62 Z" fill="${RED}"/><path d="M56 15 C61 6 66 0 76 0 C90 0 100 10 100 26 C100 48 80 66 54 86 L52 64 L62 48 L50 36 Z" fill="${RED}"/></svg>
    </div>
    <div><div style="font:400 120px/1 'Archivo Black';letter-spacing:4px">PROFESSIONAL</div><div style="font:400 180px/0.9 Anton;color:${RED};letter-spacing:4px">HEARTBREAKER</div></div>
    <div style="display:flex;justify-content:space-between;font:400 52px 'Archivo Black';letter-spacing:4px"><span>EST. TONIGHT</span><span>NO REFUNDS</span></div>
  </div>`);
add('spoil-me', 'Black', `
  <div style="${center};gap:20px">
    <svg width="560" height="560" viewBox="0 0 100 100"><rect x="10" y="40" width="80" height="56" rx="4" fill="${PINK}"/><rect x="4" y="28" width="92" height="16" rx="3" fill="${PINK}"/>
      <rect x="45" y="28" width="10" height="68" fill="${YEL}"/><path d="M50 28 C40 8 20 10 26 22 C30 30 44 28 50 28 C56 28 70 30 74 22 C80 10 60 8 50 28Z" fill="none" stroke="${YEL}" stroke-width="6"/></svg>
    <div style="font:400 380px/0.85 Anton;color:${CREAM};letter-spacing:8px;white-space:nowrap">SPOIL ME</div>
    <div style="font:400 170px/1 'Mr Dafoe';color:${PINK};transform:rotate(-5deg)">I'm worth it</div>
  </div>`);
add('main-character-energy', 'Black', `
  <div style="${center};gap:30px">
    <svg width="620" height="520" viewBox="0 0 120 100"><g transform="rotate(-12 10 30)"><rect x="6" y="18" width="108" height="20" fill="${CREAM}"/>${[0,1,2,3,4].map((i) => `<path d="M${12 + i * 22} 18 L${24 + i * 22} 18 L${16 + i * 22} 38 L${4 + i * 22} 38Z" fill="${INK}"/>`).join('')}</g>
      <rect x="6" y="42" width="108" height="54" fill="${CREAM}"/><rect x="6" y="42" width="108" height="20" fill="${PINK}"/></svg>
    <div style="font:400 250px/0.88 Anton;color:${CREAM};letter-spacing:4px">MAIN<br>CHARACTER</div>
    <div style="font:400 160px/1 Bungee;color:${YEL}">ENERGY</div>
    <div style="font:400 150px/1 'Mr Dafoe';color:${PINK};transform:rotate(-4deg)">you're just a cameo</div>
  </div>`);
add('text-me-when-brave', 'White', `
  <div style="position:absolute;left:170px;right:170px;top:200px;bottom:200px;display:flex;flex-direction:column;gap:50px">
    <div style="align-self:flex-start;background:#e9e7ec;color:${INK};font:400 80px 'Archivo Black';padding:40px 60px;border-radius:70px 70px 70px 16px">hey</div>
    <div style="align-self:flex-start;background:#e9e7ec;padding:44px 60px;border-radius:70px 70px 70px 16px;display:flex;gap:26px">${[0,1,2].map(() => `<span style="width:44px;height:44px;border-radius:50%;background:#9a93a3"></span>`).join('')}</div>
    <div style="align-self:flex-end;background:${RED};color:#fff;font:400 74px/1.1 'Archivo Black';padding:44px 60px;border-radius:70px 70px 16px 70px;max-width:900px;text-align:right">typing for 3 hours?</div>
    <div style="margin-top:auto;font:400 220px/0.88 Anton;color:${INK};letter-spacing:4px">TEXT ME WHEN<br>YOU'RE <span style="color:${RED}">BRAVE</span></div>
  </div>`);

// ---------------- SECONDO GIRO: da decifrare (come I can't read Chinese) ----------------
const MORSE = { K: '-.-', I: '..', S: '...', M: '--', E: '.' };
const morseRow = (word, c) => `<div style="display:flex;gap:70px;justify-content:center">${[...word].map((l) => `<div style="display:flex;gap:22px;align-items:center">${[...MORSE[l]].map((s) => s === '.' ? `<span style="width:56px;height:56px;border-radius:50%;background:${c}"></span>` : `<span style="width:150px;height:56px;border-radius:28px;background:${c}"></span>`).join('')}</div>`).join('')}</div>`;
add('morse-kiss-me', 'Black', `
  <div style="${center};gap:70px">
    <div style="font:400 104px/1.05 'Archivo Black';color:${CREAM};letter-spacing:-1px;transform:skewX(-9deg)">I DON'T SPEAK MORSE</div>
    ${morseRow('KISS', PINK)}${morseRow('ME', PINK)}
    <div style="font:400 104px/1.05 'Archivo Black';color:${CREAM};letter-spacing:-1px;transform:skewX(-9deg)">BUT I GOT<br><span style="font-size:190px;color:${YEL}">THE MESSAGE</span></div>
  </div>`);
const EYE = [['U', 300], ['R H', 220], ['O T C', 170], ['A L L M', 130], ['E T O N', 100], ['I G H T', 76]];
add('eye-chart', 'White', `
  <div style="${center};gap:34px">
    <div style="font:400 72px 'Archivo Black';color:${INK};letter-spacing:10px">EYE TEST</div>
    ${EYE.map(([t, s], i) => `<div style="display:flex;align-items:center;gap:60px"><span style="font:400 40px 'Archivo Black';color:${RED};width:60px">${i + 1}</span><span style="font:400 ${s}px/1 'Archivo Black';color:${INK};letter-spacing:${s / 4}px">${t}</span></div>`).join('')}
    <div style="height:10px;width:900px;background:${RED};margin-top:20px"></div>
    <div style="font:400 150px/1 'Mr Dafoe';color:${RED};transform:rotate(-4deg)">read it again, slowly</div>
  </div>`);
const BIN = { S: '01010011', E: '01000101', X: '01011000', Y: '01011001' };
add('binary-sexy', 'Black', `
  <div style="${center};gap:50px">
    <div style="font:400 96px/1.1 Bungee;color:${CREAM}">I'M NOT A NERD</div>
    <div style="display:grid;gap:26px;font:400 118px/1 'Rubik Mono One';letter-spacing:10px">${Object.entries(BIN).map(([l, b]) => `<div><span style="color:${CREAM}">${b}</span></div>`).join('')}</div>
    <div style="font:400 96px/1.1 Bungee;color:${CREAM}">BUT I SPEAK FLUENT</div>
    <div style="font:400 300px/0.85 Anton;color:${PINK};letter-spacing:20px">S E X Y</div>
  </div>`);
const bars = Array.from({ length: 40 }, (_, i) => [3, 1, 2, 1, 4, 1, 1, 2, 3, 1][i % 10] * (i % 7 === 3 ? 1.6 : 1));
add('barcode-single', 'White', `
  <div style="${center};gap:30px">
    <div style="font:400 300px/0.85 Anton;color:${INK};letter-spacing:8px">SINGLE</div>
    <div style="font:400 74px 'Archivo Black';color:${RED};letter-spacing:8px">100% AVAILABLE</div>
    <div style="display:flex;align-items:stretch;gap:10px;height:480px;margin-top:20px">${bars.map((w, i) => `<span style="width:${w * 6}px;background:${i % 2 ? 'transparent' : INK}"></span>`).join('')}</div>
    <div style="font:400 84px 'Rubik Mono One';color:${INK};letter-spacing:22px">0 69 6969 69 0</div>
    <div style="font:400 160px/1 'Mr Dafoe';color:${RED};transform:rotate(-4deg)">scan me for my number</div>
  </div>`);
add('too-close', 'White', `
  <div style="${center};gap:40px">
    <div style="font:400 64px/1.3 'Archivo Black';color:${INK};letter-spacing:4px">IF YOU CAN READ THIS<br>YOU'RE TOO CLOSE</div>
    <div style="font:400 120px/1 'Mr Dafoe';color:${RED};transform:rotate(-4deg)">...don't move</div>
  </div>`);
add('cyrillic-sexy', 'White', `
  <div style="${center};gap:50px">
    <div style="font:400 112px/1 'Archivo Black';color:${INK};letter-spacing:-1px;transform:skewX(-9deg)">I CAN'T READ RUSSIAN</div>
    <div style="display:flex;align-items:flex-start;gap:14px;font:400 340px/1 'Dela Gothic One';color:${INK};height:390px"><span>SEX</span><svg style="margin-top:68px" width="256" height="320" viewBox="0 0 80 100"><path d="M4 0 H28 L42 46 L54 0 H76 L46 78 C40 94 30 100 12 98 L14 84 C24 86 28 82 31 74 Z" fill="${INK}"/></svg></div>
    <div style="font:400 112px/1.05 'Archivo Black';color:${INK};letter-spacing:-1px;transform:skewX(-9deg)">BUT I CAN UNDERSTAND<br><span style="font-size:210px;color:${RED}">THIS</span></div>
  </div>`);
add('solve-for-x', 'Black', `
  <div style="${center};gap:30px;color:${CREAM}">
    <div style="font:400 130px/1 Sedgwick">I'm bad at math</div>
    <div style="font:400 130px/1 Sedgwick">but I solved for</div>
    <div style="display:flex;align-items:center;gap:60px;font:400 420px/1 Sedgwick;margin-top:60px"><span style="color:${PINK}">x</span><span>=</span><span style="color:${YEL}">you</span></div>
    <svg width="900" height="120" viewBox="0 0 300 40"><path d="M5 30 C80 5 200 5 295 26" fill="none" stroke="${CREAM}" stroke-width="5" stroke-linecap="round"/></svg>
  </div>`);
const BR = { T: [2, 3, 4, 5], O: [1, 3, 5], U: [1, 3, 6], C: [1, 4], H: [1, 2, 5], M: [1, 3, 4], E: [1, 5] };
const cell = (l, c) => `<svg width="150" height="230" viewBox="0 0 30 46">${[1, 2, 3, 4, 5, 6].map((d) => { const x = d > 3 ? 23 : 7, y = 7 + ((d - 1) % 3) * 16; return BR[l].includes(d) ? `<circle cx="${x}" cy="${y}" r="6" fill="${c}"/>` : `<circle cx="${x}" cy="${y}" r="3" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="1"/>`; }).join('')}</svg>`;
add('braille-touch-me', 'Black', `
  <div style="${center};gap:60px">
    <div style="font:400 112px/1 'Archivo Black';color:${CREAM};letter-spacing:-1px;transform:skewX(-9deg)">CAN'T READ BRAILLE?</div>
    <div style="display:flex;gap:30px">${[...'TOUCH'].map((l) => cell(l, PINK)).join('')}</div>
    <div style="display:flex;gap:30px">${[...'ME'].map((l) => cell(l, PINK)).join('')}</div>
    <div style="font:400 112px/1.05 'Archivo Black';color:${CREAM};letter-spacing:-1px;transform:skewX(-9deg)">I'LL TEACH YOU</div>
    <div style="font:400 140px/1 'Mr Dafoe';color:${YEL};transform:rotate(-4deg)">hands-on lessons only</div>
  </div>`);
const dots = (n, c) => Array.from({ length: 6 }, (_, i) => `<span style="width:64px;height:64px;border-radius:50%;${i < n ? `background:${c}` : `border:8px solid ${c}`}"></span>`).join('');
add('languages-cv', 'White', `
  <div style="position:absolute;left:190px;right:190px;top:260px;bottom:260px;display:flex;flex-direction:column;gap:56px;color:${INK}">
    <div style="font:400 210px/0.9 Anton;letter-spacing:6px">LANGUAGES</div>
    ${dash}
    ${[['ENGLISH', 4, INK], ['ITALIAN', 3, INK], ['RUSSIAN', 1, INK], ['FLIRTING', 6, RED]].map(([t, n, c]) => `<div style="display:flex;justify-content:space-between;align-items:center;font:400 84px 'Archivo Black';color:${c}"><span>${t}</span><span style="display:flex;gap:18px">${dots(n, c)}</span></div>`).join('')}
    <div style="margin-top:auto;align-self:flex-end;font:400 150px/1 'Mr Dafoe';color:${RED};transform:rotate(-5deg)">native speaker</div>
  </div>`);
add('care-label', 'White', `
  <div style="position:absolute;left:330px;right:330px;top:200px;bottom:200px;border:14px solid ${INK};border-radius:20px 20px 60px 60px;padding:70px 70px;display:flex;flex-direction:column;align-items:center;gap:44px;color:${INK};text-align:center">
    <div style="font:400 64px 'Archivo Black';letter-spacing:12px">CARE LABEL</div>
    ${dash.replace('height:10px', 'height:10px;width:100%')}
    <div style="font:400 74px/1.25 'Archivo Black'">100% SINGLE<br>HANDLE WITH CARE</div>
    <svg width="560" height="140" viewBox="0 0 160 40"><path d="M6 8 L18 34 H52 L64 8" fill="none" stroke="${INK}" stroke-width="4"/><path d="M14 16 C24 10 34 22 44 16 C50 12 54 14 58 16" fill="none" stroke="${INK}" stroke-width="3"/>
      <rect x="92" y="6" width="30" height="30" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="107" cy="21" r="10" fill="none" stroke="${INK}" stroke-width="4"/>
      <path d="M130 36 L154 6 M130 6 L154 36" stroke="${RED}" stroke-width="4"/></svg>
    <div style="font:400 66px/1.3 'Archivo Black'">WASH WITH: <span style="color:${RED}">YOU</span><br>DO NOT TUMBLE DRY ALONE<br>KEEP WARM AT NIGHT</div>
    <div style="margin-top:auto;font:400 130px/1 'Mr Dafoe';color:${RED};transform:rotate(-4deg)">made with love</div>
  </div>`);

module.exports = { COLOR, designs };
if (require.main === module) (async () => {
  const b = await chromium.launch();
  const out = process.argv[2] || __dirname;
  const only = process.argv[3];
  const p = await b.newPage({ viewport: { width: 1500, height: 1800 }, deviceScaleFactor: 3 });
  for (const [name, body] of Object.entries(designs)) {
    if (only && only !== name) continue;
    await p.setContent(`<style>${fonts} html,body{margin:0;background:transparent;width:1500px;height:1800px;overflow:hidden} body{position:relative}</style>${body}`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    await p.screenshot({ path: `${out}/${name}.png`, omitBackground: true });
  }
  await b.close();
})();
