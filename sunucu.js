/* Asal Golcu yerel sunucusu. Bagimlilik yok.
   Calistirma: node sunucu.js   Adres: http://localhost:5180 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const KOK = __dirname;
const PORT = Number(process.env.PORT) || 5180;
const TURLER = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.md': 'text/plain; charset=utf-8'
};

http.createServer((istek, yanit) => {
  let yol;
  try { yol = decodeURIComponent(new URL(istek.url, 'http://localhost').pathname); } catch (e) { yanit.writeHead(400); return yanit.end(); }
  if (yol === '/') yol = '/index.html';
  const dosya = path.normalize(path.join(KOK, yol));
  if (!dosya.startsWith(KOK) || dosya.includes(path.sep + 'ham' + path.sep)) { yanit.writeHead(403); return yanit.end('Yasak'); }
  fs.stat(dosya, (hata, bilgi) => {
    if (hata || !bilgi.isFile()) { yanit.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return yanit.end('Bulunamadı: ' + yol); }
    const tur = TURLER[path.extname(dosya).toLowerCase()] || 'application/octet-stream';
    const boy = bilgi.size;
    const aralik = istek.headers.range && /^bytes=(\d*)-(\d*)$/.exec(istek.headers.range);
    if (aralik) {
      /* video ileri sarma icin kismi icerik */
      let bas = aralik[1] === '' ? boy - Number(aralik[2]) : Number(aralik[1]);
      let son = aralik[1] !== '' && aralik[2] !== '' ? Number(aralik[2]) : boy - 1;
      if (isNaN(bas) || bas < 0 || bas >= boy || son >= boy || bas > son) {
        yanit.writeHead(416, { 'Content-Range': 'bytes */' + boy });
        return yanit.end();
      }
      yanit.writeHead(206, { 'Content-Type': tur, 'Content-Length': son - bas + 1, 'Content-Range': 'bytes ' + bas + '-' + son + '/' + boy, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
      fs.createReadStream(dosya, { start: bas, end: son }).pipe(yanit);
      return;
    }
    yanit.writeHead(200, { 'Content-Type': tur, 'Content-Length': boy, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
    fs.createReadStream(dosya).pipe(yanit);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('Asal Golcü hazır: http://localhost:' + PORT);
  console.log('Kapatmak için bu pencerede Ctrl+C.');
});
