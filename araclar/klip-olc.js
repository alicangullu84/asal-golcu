/* Asal Golcu - video klip olcumu (ffmpeg gerekir).
   Kullanim: node araclar/klip-olc.js <cikti-klasoru> v00 v01 ...
   Her klip icin videolar/ham/<ad>.mp4 okunur; ilk karedeki karakterin ayak noktasi (ax, ay),
   boyu (boy), topun alt ortadan giris ani (giris), en sola uzanma ani (uc) olculur.
   Ayrica <cikti>/<ad>-serit.jpg (0.4 sn arayla 10 kare) uretilir. Sonuc JSON stdout'a yazilir. */
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const [cikti, ...adlar] = process.argv.slice(2);
const W = 160, H = 90, FPS = 25;
const kok = path.join(__dirname, '..');
fs.mkdirSync(cikti, { recursive: true });

const yesilMi = (d, i) => d[i + 1] > 90 && d[i + 1] - Math.max(d[i], d[i + 2]) > 45;
const r3 = x => Math.round(x * 1000) / 1000;
const sonuc = {};

for (const ad of adlar) {
  const girdi = path.join(kok, 'videolar', 'ham', ad + '.mp4');
  const ham = spawnSync(FFMPEG, ['-v', 'error', '-i', girdi, '-vf', `fps=${FPS},scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 28 });
  if (ham.status !== 0) { sonuc[ad] = { hata: String(ham.stderr) }; continue; }
  const buf = ham.stdout;
  const kb = W * H * 3;
  const kareler = [];
  for (let o = 0, n = 0; o + kb <= buf.length; o += kb, n++) {
    const d = new Uint8Array(W * H * 4);
    for (let i = 0, j = 0; i < kb; i += 3, j += 4) { d[j] = buf[o + i]; d[j + 1] = buf[o + i + 1]; d[j + 2] = buf[o + i + 2]; }
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!yesilMi(d, (y * W + x) * 4)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    kareler.push({ t: n / FPS, x0: x0 / W, x1: (x1 + 1) / W, y0: y0 / H, y1: (y1 + 1) / H, d });
  }
  const ilk = kareler[1] || kareler[0];
  const ax = (ilk.x0 + ilk.x1) / 2, ay = ilk.y1, boy = ilk.y1 - ilk.y0;
  let giris = null;
  const altSinir = Math.min(H - 1, Math.round((ay + 0.03) * H));
  for (const k of kareler.slice(2)) {
    let say = 0;
    for (let y = altSinir; y < H; y++) for (let x = Math.round(W * 0.3); x < W * 0.7; x++) if (!yesilMi(k.d, (y * W + x) * 4)) say++;
    if (say > 5) { giris = r3(k.t); break; }
  }
  let uc = kareler[0], sagUc = kareler[0], ust = kareler[0];
  kareler.forEach(k => { if (k.x0 < uc.x0) uc = k; if (k.x1 > sagUc.x1) sagUc = k; if (k.y0 < ust.y0) ust = k; });
  sonuc[ad] = {
    sure: r3(kareler.length / FPS), ax: r3(ax), ay: r3(ay), boy: r3(boy), giris,
    uc: r3(uc.t), ucX: r3(uc.x0), sagUc: r3(sagUc.t), sagX: r3(sagUc.x1), ustT: r3(ust.t), ustY: r3(ust.y0),
    ilkKutu: [r3(ilk.x0), r3(ilk.y0), r3(ilk.x1), r3(ilk.y1)]
  };
  spawnSync(FFMPEG, ['-v', 'error', '-y', '-i', girdi, '-vf', 'fps=2.5,scale=256:144,tile=10x1', '-frames:v', '1', path.join(cikti, ad + '-serit.jpg')]);
}
process.stdout.write(JSON.stringify(sonuc, null, 1));
