/* Asal Golcu - matematik verisi, soru motoru, ogrenme motoru.
   Tarayicida window.Motor, Node'da module.exports olarak kullanilir. */
(function (kok) {
  'use strict';

  const MAX = 120;
  const TUZAKLAR = [39, 49, 51, 57, 69, 77, 87, 91, 93, 111, 117, 119];

  /* ---------- yardimcilar ---------- */
  const UST = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const ust = e => String(e).split('').map(c => UST[c]).join('');
  const us = (p, e) => (e === 1 ? String(p) : p + ust(e));
  const yaz = c => c.map(x => us(x[0], x[1])).join(' · ');
  const deger = c => c.reduce((a, x) => a * Math.pow(x[0], x[1]), 1);
  const kopya = c => c.map(x => [x[0], x[1]]);
  const sirala = c => c.sort((a, b) => a[0] - b[0]);

  function asalMi(n) {
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  }
  function ayir(n) {
    const r = [];
    let m = n;
    for (let p = 2; m > 1; p++) {
      let e = 0;
      while (m % p === 0) { m /= p; e++; }
      if (e) r.push([p, e]);
    }
    return r;
  }
  /* ayni tabanlari birlestir (asal olmayan taban ureten ceviricilerde gerekir) */
  function birlestir(c) {
    const m = new Map();
    c.forEach(x => { if (x[1] > 0) m.set(x[0], (m.get(x[0]) || 0) + x[1]); });
    return sirala([...m.entries()].map(x => [x[0], x[1]]));
  }
  const toplamUs = c => c.reduce((a, x) => a + x[1], 0);

  function rastgele(n) { return Math.floor(Math.random() * n); }
  function karistir(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = rastgele(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sec(a) { return a[rastgele(a.length)]; }

  /* ---------- Turkce ek ---------- */
  const BIRLER = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz'];
  const ONLAR = ['', 'on', 'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan'];
  function sonKelime(n) {
    if (n % 10) return BIRLER[n % 10];
    if (n % 100) return ONLAR[(n % 100) / 10];
    if (n % 1000) return 'yüz';
    return 'bin';
  }
  function sonUnlu(k) {
    for (let i = k.length - 1; i >= 0; i--) if ('aeıioöuü'.includes(k[i])) return k[i];
    return 'e';
  }
  const unluyleBiter = k => 'aeıioöuü'.includes(k[k.length - 1]);
  /* 2'ye, 3'e, 9'a, 6'ya */
  function ye(n) {
    const k = sonKelime(n);
    const u = 'aıou'.includes(sonUnlu(k)) ? 'a' : 'e';
    return n + "'" + (unluyleBiter(k) ? 'y' : '') + u;
  }
  /* 96'nın, 81'in, 3'ün */
  function nin(n) {
    const k = sonKelime(n);
    const v = sonUnlu(k);
    const u = 'aı'.includes(v) ? 'ı' : 'ei'.includes(v) ? 'i' : 'ou'.includes(v) ? 'u' : 'ü';
    return n + "'" + (unluyleBiter(k) ? 'n' : '') + u + 'n';
  }

  /* ---------- 1-120 verisi ---------- */
  const VERI = [null];
  for (let n = 1; n <= MAX; n++) {
    const c = ayir(n);
    VERI.push({
      n,
      asal: asalMi(n),
      carpan: c,
      yazi: n === 1 ? '1' : yaz(c),
      farkli: c.length,
      enBuyuk: c.length ? c[c.length - 1][0] : null,
      tuzak: TUZAKLAR.includes(n),
      kuvvet: c.length === 1 && c[0][1] >= 2
    });
  }
  const ASALLAR = VERI.filter(v => v && v.asal).map(v => v.n);
  const KUVVETLER = VERI.filter(v => v && v.kuvvet).map(v => v.n);
  const BILESIKLER = VERI.filter(v => v && v.n > 1 && !v.asal).map(v => v.n);
  const UC_ASALLI = VERI.filter(v => v && v.farkli === 3).map(v => v.n);

  /* bolen merdiveni: [[96,2],[48,2],...,[1,null]] */
  function merdiven(n) {
    const r = [];
    let m = n;
    VERI[n].carpan.forEach(x => { for (let i = 0; i < x[1]; i++) { r.push([m, x[0]]); m /= x[0]; } });
    r.push([1, null]);
    return r;
  }
  /* 2 x 2 x 2 x 3 gibi acik carpim */
  function acikCarpim(c) {
    const r = [];
    c.forEach(x => { for (let i = 0; i < x[1]; i++) r.push(x[0]); });
    return r.join(' · ');
  }
  /* 2³ · 3 · 5 = 8 · 3 · 5 = 120 */
  function hesapSatiri(c) {
    const n = deger(c);
    const ara = c.map(x => Math.pow(x[0], x[1])).join(' · ');
    const y = yaz(c);
    return ara === y || c.length === 1 ? y + ' = ' + n : y + ' = ' + ara + ' = ' + n;
  }
  /* bolunebilme ipucu: hangi kural yakalar */
  function bolunmeIpucu(n) {
    if (n % 2 === 0) return 'Son basamağı çift, 2\'ye bölünür.';
    const t = String(n).split('').reduce((a, d) => a + Number(d), 0);
    if (n % 3 === 0) return 'Rakamları toplamı ' + t + ', 3\'e bölünür.';
    if (n % 5 === 0) return 'Son basamağı ' + (n % 10) + ', 5\'e bölünür.';
    if (n % 7 === 0) return '2, 3 ve 5 yakalamaz ama 7\'ye bölünür. Bunlar: 49, 77, 91, 119.';
    return '';
  }
  function asallikAciklamasi(n) {
    if (n === 2) return '2 asal: bölenleri yalnız 1 ve 2. Tek çift asal sayı.';
    const kontrol = [2, 3, 5, 7].filter(p => p * p <= n && p !== n);
    if (!kontrol.length) return n + ' asal: bölenleri yalnız 1 ve ' + n + '.';
    const liste = kontrol.map(ye);
    const metin = liste.length === 1 ? liste[0] : liste.slice(0, -1).join(', ') + ' ve ' + liste[liste.length - 1];
    return n + ' asal: ' + metin + ' bölünmüyor.';
  }

  /* ---------- beceriler ---------- */
  const BECERILER = {
    B1: { ad: 'Asal mı?', kisa: 'Asal mı' },
    B2: { ad: 'Kaç farklı asal çarpan?', kisa: 'Farklı asal' },
    B3: { ad: 'Asal kuvvet (sayı → üs)', kisa: 'Üslü yazım' },
    B3T: { ad: 'Asal kuvvet (üs → sayı)', kisa: 'Üsten sayı' },
    B4: { ad: 'Asal çarpanlara ayırma', kisa: 'Ayrılış' },
    B5: { ad: 'Ayrılıştan sayıya', kisa: 'Ters okuma' },
    B6: { ad: 'En büyük asal çarpan', kisa: 'En büyük asal' }
  };
  const ALTIN_SURE = { B1: 3, B2: 5, B3: 4, B3T: 4, B4: 8, B5: 8, B6: 8 };

  /* hangi sayilar hangi beceriye uygun */
  function uygunMu(n, b) {
    const v = VERI[n];
    if (!v) return false;
    switch (b) {
      case 'B1': return true;
      case 'B2': return n >= 2;
      case 'B3': case 'B3T': return v.kuvvet;
      case 'B4': return n > 1 && !v.asal;
      case 'B5': return n > 1 && !v.asal;
      case 'B6': return v.farkli >= 2;
    }
    return false;
  }

  /* ---------- celdirici ureticiler ---------- */
  const YAKIN_ASALLAR = [2, 3, 5, 7, 11, 13];
  function yabanciAsal(c, p) {
    const icinde = c.map(x => x[0]);
    const aday = YAKIN_ASALLAR.filter(q => !icinde.includes(q));
    aday.sort((a, b) => Math.abs(a - p) - Math.abs(b - p));
    return aday[0];
  }

  /* B4 icin yanlis ayrilislar: [{c, etiket, aciklama}] */
  function ayrilisCeldiricileri(n) {
    const c = VERI[n].carpan;
    const dogru = yaz(c);
    const r = [];
    const ekle = (yeni, etiket, aciklama) => r.push({ c: yeni, yazi: yaz(yeni), deger: deger(yeni), etiket, aciklama });

    c.forEach((x, i) => {
      const a = kopya(c); a[i][1]++;
      ekle(a, 'us-fazla', yaz(a) + ' = ' + deger(a) + ' eder. ' + x[0] + ' bir kez fazla.');
      if (x[1] >= 2) {
        const b = kopya(c); b[i][1]--;
        ekle(b, 'us-eksik', yaz(b) + ' = ' + deger(b) + ' eder. ' + x[0] + ' bir kez eksik.');
      }
      if (c.length >= 2) {
        const d = kopya(c).filter((_, j) => j !== i);
        if (toplamUs(d) >= 2) ekle(d, 'carpan-eksik', yaz(d) + ' = ' + deger(d) + ' eder. ' + us(x[0], x[1]) + ' çarpanı eksik.');
      }
      const q = yabanciAsal(c, x[0]);
      if (q) {
        const e = sirala(kopya(c).map(y => (y[0] === x[0] ? [q, y[1]] : y)));
        ekle(e, 'yanlis-asal', n + ', ' + ye(q) + ' bölünmez. ' + x[0] + ' yerine ' + q + ' yazılmış.');
      }
    });
    if (c.length >= 2) {
      for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) {
        if (c[i][1] !== c[j][1]) {
          const a = kopya(c); a[i][1] = c[j][1]; a[j][1] = c[i][1];
          ekle(a, 'us-yer-degisik', yaz(a) + ' = ' + deger(a) + ' eder. Üsler yer değiştirmiş.');
        }
      }
    }
    /* asal olmayan taban: degeri dogru ama taban asal degil */
    const tabanAciklama = (a, t) => yaz(a) + ' de ' + n + ' eder ama ' + t + ' asal değil (' + t + ' = ' + yaz(ayir(t)) + '). Tabanlar asal olmalı.';
    for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) {
      const t = c[i][0] * c[j][0];
      const a = kopya(c); a[i][1]--; a[j][1]--; a.push([t, 1]);
      const b = birlestir(a);
      if (b.length >= 2 || (b.length === 1 && b[0][1] >= 2)) ekle(b, 'asal-olmayan-taban', tabanAciklama(b, t));
    }
    c.forEach((x, i) => {
      if (x[1] >= 2) {
        const t = x[0] * x[0];
        const a = kopya(c); a[i][1] -= 2; a.push([t, 1]);
        const b = birlestir(a);
        if (b.length >= 2 || (b.length === 1 && b[0][1] >= 2)) ekle(b, 'asal-olmayan-taban', tabanAciklama(b, t));
      }
      if (c.length === 1 && x[1] >= 4 && x[1] % 2 === 0) {
        const b = [[x[0] * x[0], x[1] / 2]];
        ekle(b, 'asal-olmayan-taban', tabanAciklama(b, x[0] * x[0]));
      }
    });
    /* temizle: dogruyla ayni yazim yok, ayni deger yalniz asal-olmayan-taban'da */
    const gorulen = new Set([dogru]);
    return r.filter(o => {
      if (gorulen.has(o.yazi)) return false;
      if (o.deger === n && o.etiket !== 'asal-olmayan-taban') return false;
      if (o.deger < 2) return false;
      gorulen.add(o.yazi);
      return true;
    });
  }

  /* adaylardan, etiket cesitliligini koruyarak k tane sec */
  function cesitliSec(adaylar, k, oncelikliEtiket) {
    const secilen = [];
    const kalan = karistir(adaylar.slice());
    if (oncelikliEtiket) {
      const i = kalan.findIndex(a => a.etiket === oncelikliEtiket);
      if (i >= 0) secilen.push(kalan.splice(i, 1)[0]);
    }
    const etiketler = new Set(secilen.map(s => s.etiket));
    for (let i = 0; i < kalan.length && secilen.length < k; i++) {
      if (!etiketler.has(kalan[i].etiket)) { etiketler.add(kalan[i].etiket); secilen.push(kalan.splice(i, 1)[0]); i--; }
    }
    while (secilen.length < k && kalan.length) secilen.push(kalan.shift());
    return secilen;
  }

  function soruKur(beceri, n, ozellikler) {
    const s = Object.assign({ beceri, sayi: n, ozet: '', merdiven: merdiven(n) }, ozellikler);
    s.dogruIndex = s.secenekler.findIndex(o => o.dogru);
    return s;
  }
  function dortluKur(dogruSecenek, celdiriciler) {
    return karistir([dogruSecenek].concat(celdiriciler));
  }

  /* ---------- soru ureticileri ---------- */
  const URETICI = {
    B1(n) {
      const v = VERI[n];
      const yanlisAciklama = v.asal
        ? asallikAciklamasi(n)
        : n === 1
          ? '1 asal değildir. Asal sayının tam iki böleni olur, 1\'in tek böleni var.'
          : (() => {
            const p = v.carpan[0][0];
            return n + ' asal değil: ' + p + ' · ' + n / p + ' = ' + n + '. ' + bolunmeIpucu(n);
          })();
      return soruKur('B1', n, {
        top: String(n),
        soru: 'Asal mı?',
        duzen: 2,
        ozet: n === 1 ? '1 ne asal ne bileşik.' : v.asal ? n + ' asal sayı.' : n + ' = ' + v.yazi,
        secenekler: [
          { yazi: 'ASAL', dogru: v.asal, etiket: 'b1', aciklama: v.asal ? '' : yanlisAciklama },
          { yazi: 'ASAL DEĞİL', dogru: !v.asal, etiket: 'b1', aciklama: v.asal ? yanlisAciklama : '' }
        ]
      });
    },

    B2(n) {
      const v = VERI[n];
      const k = v.farkli;
      const asallar = v.carpan.map(x => x[0]).join(', ');
      const ozet = n + ' = ' + v.yazi + '. Farklı asal çarpanlar: ' + asallar + '. Yani ' + k + '.';
      const toplam = Math.min(3, toplamUs(v.carpan));
      const secenekler = [1, 2, 3].map(i => {
        let ac = '';
        if (i !== k) ac = (i === toplam && toplam !== k) ? 'Üsleri sayma, farklı asalları say. ' + ozet : ozet;
        return { yazi: String(i), dogru: i === k, etiket: 'b2', aciklama: ac };
      });
      return soruKur('B2', n, { top: String(n), soru: 'Kaç farklı asal çarpanı var?', duzen: 3, ozet, secenekler });
    },

    B3(n) {
      const [p, e] = VERI[n].carpan[0];
      const ad = [];
      const ekle = (yazi, etiket, aciklama) => ad.push({ yazi, etiket, aciklama, dogru: false });
      if (e >= 2) ekle(us(p, e - 1), 'us-eksik', us(p, e - 1) + ' = ' + Math.pow(p, e - 1) + ' eder.');
      ekle(us(p, e + 1), 'us-fazla', us(p, e + 1) + ' = ' + Math.pow(p, e + 1) + ' eder.');
      if (e >= 2 && e !== p) ekle(us(e, p), 'taban-us-karisik', us(e, p) + ' = ' + Math.pow(e, p) + ' eder. Taban ile üssü karıştırdın.');
      for (let a = 2; a <= n; a++) {
        if (asalMi(a)) continue;
        for (let b = 2; Math.pow(a, b) <= n; b++) {
          if (Math.pow(a, b) === n) ekle(us(a, b), 'asal-olmayan-taban', us(a, b) + ' de ' + n + ' eder ama ' + a + ' asal değil. Asal tabanla: ' + us(p, e) + '.');
        }
      }
      const q = yabanciAsal([[p, e]], p);
      ekle(us(q, e), 'yanlis-asal', us(q, e) + ' = ' + Math.pow(q, e) + ' eder.');
      const dogru = us(p, e);
      const gor = new Set([dogru]);
      const temiz = ad.filter(o => (gor.has(o.yazi) ? false : (gor.add(o.yazi), true)));
      const cel = cesitliSec(temiz, 3, Math.random() < 0.6 ? 'asal-olmayan-taban' : null);
      return soruKur('B3', n, {
        top: String(n),
        soru: 'Asal tabanlı üslü yazımı hangisi?',
        duzen: 4,
        ozet: n + ' = ' + acikCarpim([[p, e]]) + ' = ' + us(p, e),
        secenekler: dortluKur({ yazi: dogru, dogru: true, etiket: 'dogru', aciklama: '' }, cel)
      });
    },

    B3T(n) {
      const [p, e] = VERI[n].carpan[0];
      const ad = [];
      const ekle = (v, etiket, aciklama) => ad.push({ yazi: String(v), deger: v, etiket, aciklama, dogru: false });
      ekle(p * e, 'carpim-sanma', us(p, e) + ', ' + p + ' · ' + e + ' demek değil. ' + us(p, e) + ' = ' + acikCarpim([[p, e]]) + ' = ' + n + '.');
      if (e !== p) ekle(Math.pow(e, p), 'taban-us-karisik', Math.pow(e, p) + ' = ' + us(e, p) + '. Taban ile üssü karıştırdın.');
      if (e >= 2) ekle(Math.pow(p, e - 1), 'us-eksik', Math.pow(p, e - 1) + ' = ' + us(p, e - 1) + '. Bir ' + p + ' eksik çarptın.');
      ekle(Math.pow(p, e + 1), 'us-fazla', Math.pow(p, e + 1) + ' = ' + us(p, e + 1) + '. Bir ' + p + ' fazla çarptın.');
      const q = yabanciAsal([[p, e]], p);
      ekle(Math.pow(q, e), 'yanlis-asal', Math.pow(q, e) + ' = ' + us(q, e) + '.');
      const gor = new Set([String(n)]);
      const temiz = ad.filter(o => o.deger > 1 && !gor.has(o.yazi) && (gor.add(o.yazi), true));
      const cel = cesitliSec(temiz, 3, e >= 2 && p * e !== n ? 'carpim-sanma' : null);
      return soruKur('B3T', n, {
        top: us(p, e),
        soru: 'Hangi sayı?',
        duzen: 4,
        ozet: us(p, e) + ' = ' + acikCarpim([[p, e]]) + ' = ' + n,
        secenekler: dortluKur({ yazi: String(n), dogru: true, etiket: 'dogru', aciklama: '' }, cel)
      });
    },

    B4(n) {
      const v = VERI[n];
      let ad = ayrilisCeldiricileri(n).map(o => ({ yazi: o.yazi, deger: o.deger, etiket: o.etiket, aciklama: o.aciklama, dogru: false }));
      /* 3 · 5⁵ gibi akla yatmayan buyuklukteki celdiricileri ele */
      const makul = ad.filter(o => o.deger <= 6 * n);
      if (makul.length >= 3) ad = makul;
      const cel = cesitliSec(ad, 3, Math.random() < 0.7 ? 'asal-olmayan-taban' : null);
      return soruKur('B4', n, {
        top: String(n),
        soru: 'Asal çarpanlarına ayrılmış hali hangisi?',
        duzen: 4,
        ozet: n + ' = ' + v.yazi,
        secenekler: dortluKur({ yazi: v.yazi, dogru: true, etiket: 'dogru', aciklama: '' }, cel)
      });
    },

    B5(n) {
      const v = VERI[n];
      const gor = new Set([n]);
      const ad = [];
      ayrilisCeldiricileri(n).forEach(o => {
        if (o.etiket === 'asal-olmayan-taban' || gor.has(o.deger) || o.deger > 999) return;
        gor.add(o.deger);
        ad.push({
          yazi: String(o.deger), etiket: o.etiket, dogru: false,
          aciklama: 'Senin seçtiğin ' + o.deger + ' = ' + yaz(ayir(o.deger)) + '. ' + hesapSatiri(v.carpan) + '.'
        });
      });
      const cel = cesitliSec(ad, 3);
      return soruKur('B5', n, {
        top: v.yazi,
        soru: 'Hangi sayı?',
        duzen: 4,
        ozet: hesapSatiri(v.carpan),
        secenekler: dortluKur({ yazi: String(n), dogru: true, etiket: 'dogru', aciklama: '' }, cel)
      });
    },

    B6(n) {
      const v = VERI[n];
      const max = v.enBuyuk;
      const ad = [];
      const gor = new Set([max]);
      const ekle = (x, etiket, aciklama) => { if (!gor.has(x) && x > 1) { gor.add(x); ad.push({ yazi: String(x), etiket, aciklama, dogru: false }); } };
      v.carpan.forEach(x => { if (x[0] !== max) ekle(x[0], 'kucuk-asal', x[0] + ' de asal çarpan ama ' + max + ' daha büyük.'); });
      const bolenler = [];
      for (let d = 4; d < n; d++) if (n % d === 0 && !asalMi(d)) bolenler.push(d);
      const maxli = bolenler.filter(d => d % max === 0);
      const bilesik = sec(maxli.length ? maxli : bolenler.length ? bolenler : [0]);
      if (bilesik) ekle(bilesik, 'asal-olmayan', bilesik + ' bir çarpan ama asal değil: ' + bilesik + ' = ' + yaz(ayir(bilesik)) + '.');
      [max + 1, max + 2, max + 3, max + 4, max + 6, max + 8, max + 10, max + 12].filter(asalMi).slice(0, 2)
        .forEach(q => ekle(q, 'bolmeyen-asal', n + ', ' + ye(q) + ' bölünmez.'));
      const cel = cesitliSec(ad, 3, 'asal-olmayan');
      return soruKur('B6', n, {
        top: String(n),
        soru: 'En büyük asal çarpanı kaç?',
        duzen: 4,
        ozet: n + ' = ' + v.yazi + '. En büyük asal çarpan ' + max + '.',
        secenekler: dortluKur({ yazi: String(max), dogru: true, etiket: 'dogru', aciklama: '' }, cel)
      });
    }
  };

  function soruUret(beceri, n) {
    if (!uygunMu(n, beceri)) throw new Error('Uygun değil: ' + beceri + ' ' + n);
    return URETICI[beceri](n);
  }

  /* ---------- kupa yolu ---------- */
  const aralik = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const ciftler = (beceri, sayilar) => sayilar.filter(n => uygunMu(n, beceri)).map(n => ({ n, b: beceri }));

  const KUPA = [
    { id: 1, mac: 'Mahalle Maçı', kaleci: 'Uykucu Umut', konu: 'Asal mı, değil mi? (1-50)',
      replik: 'Esniyorum ama asal sayıyı kaçırmam.',
      taktik: 'Asal sayının tam iki böleni vardır: 1 ve kendisi. 1 asal değildir.',
      havuz: () => ciftler('B1', aralik(1, 50)), sure: null },
    { id: 2, mac: 'Okul Turnuvası', kaleci: 'Duvar Davut', konu: 'Asal mı? Tuzak sayılar (1-120)',
      replik: '51\'i asal sanan çok golcü gördüm.',
      taktik: '120\'ye kadar: 2, 3, 5 ve 7\'ye bölünmeyen sayı asaldır. 51 = 3 · 17, 91 = 7 · 13.',
      havuz: () => ciftler('B1', aralik(1, 120)), sure: { B1: 10 } },
    { id: 3, mac: 'İlçe Kupası', kaleci: 'Ahtapot Orhan', konu: 'Kaç farklı asal çarpan?',
      replik: 'Sekiz kolum var. Senin sayıların en fazla üç farklı asal çarpanı.',
      taktik: 'Üsleri sayma, farklı asalları say. 96 = 2⁵ · 3 → 2 farklı asal.',
      havuz: () => ciftler('B2', aralik(2, 120)), sure: { B2: 12 } },
    { id: 4, mac: 'İl Finali', kaleci: 'Panter Polat', konu: 'Asal kuvvetler: 81 = 3⁴',
      replik: 'Üsleri karıştıranın topu bende kalır.',
      taktik: '2² 2³ 2⁴ 2⁵ 2⁶ = 4 8 16 32 64. 3² 3³ 3⁴ = 9 27 81. 5² = 25, 7² = 49.',
      havuz: () => ciftler('B3', KUVVETLER).concat(ciftler('B3T', KUVVETLER)), sure: { B3: 10, B3T: 10 } },
    { id: 5, mac: 'Bölge Kupası', kaleci: 'Örümcek Ömer', konu: 'Asal çarpanlara ayırma (4-60)',
      replik: 'Ağıma takılan her top bir çarpandır.',
      taktik: 'En küçük asaldan başla: 2, sonra 3, 5, 7. Tabanların hepsi asal olmalı.',
      havuz: () => ciftler('B4', aralik(4, 60)), sure: { B4: 15 } },
    { id: 6, mac: 'Türkiye Yarı Finali', kaleci: 'Kartal Kaan', konu: 'Asal çarpanlara ayırma (61-120)',
      replik: 'Altmışın üstünde hava serttir.',
      taktik: 'Büyük sayıda önce 2\'leri bitir: 112 → 56 → 28 → 14 → 7. Yani 2⁴ · 7.',
      havuz: () => ciftler('B4', aralik(61, 120)), sure: { B4: 15 } },
    { id: 7, mac: 'Türkiye Finali', kaleci: 'Robot Rıza', konu: 'Ayrılıştan sayıya, en büyük asal',
      replik: '2 üssü 3, çarpı 3, çarpı 5. Ben hesapladım. Sen?',
      taktik: 'Üslüleri önce hesapla: 2³ · 3 · 5 = 8 · 15 = 120. En büyük asal çarpan, ayrılıştaki en büyük taban.',
      havuz: () => ciftler('B5', aralik(4, 120)).concat(ciftler('B6', aralik(6, 120))), sure: { B5: 12, B6: 12 } },
    { id: 8, mac: 'LGS Kupası Finali', kaleci: 'Efsane Eldiven', konu: 'Hepsi karışık, hızlı',
      replik: 'LGS\'de süre de rakiptir.',
      taktik: 'Sakin ol. Önce 2, 3, 5, 7 ile böl. Süre az ama sen hazırsın.',
      havuz: () => ['B1', 'B2', 'B3', 'B3T', 'B4', 'B5', 'B6'].reduce((a, b) => a.concat(ciftler(b, aralik(1, 120))), []),
      sure: { B1: 6, B2: 8, B3: 8, B3T: 8, B4: 12, B5: 12, B6: 10 } }
  ];

  /* ---------- ogrenme motoru ---------- */
  function bugun(t) {
    const d = t ? new Date(t) : new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  const anahtar = (n, b) => n + '|' + b;

  function cift(kayit, n, b) { return kayit.ciftler[anahtar(n, b)] || null; }
  function seviye(kayit, n, b) { const c = cift(kayit, n, b); return c ? c.s : 0; }

  /* cevabi isle; donus: yeni seviye */
  function cevapIsle(kayit, n, b, dogru, sure, yardimli, gun) {
    gun = gun || bugun();
    const k = anahtar(n, b);
    const c = kayit.ciftler[k] || (kayit.ciftler[k] = { s: 0, d: 0, y: 0, t: [], g: '', o: '' });
    c.t.push(Math.round(sure * 10) / 10);
    if (c.t.length > 5) c.t.shift();
    c.o = gun;
    if (dogru) {
      c.d++;
      if (!yardimli) {
        if (c.s < 2) { c.s++; if (c.s === 2) c.g = gun; }
        else if (c.s === 2 && c.g && c.g !== gun) c.s = 3;
        else if (c.s === 2) c.g = c.g || gun;
      }
    } else {
      c.y++;
      c.s = Math.max(0, c.s - 1);
      c.g = '';
    }
    return c.s;
  }

  /* B1 dengesi: asal ve tuzak sayilar one cikar, cift sayilar seyrek gelir */
  function agirlik(n, b) {
    const v = VERI[n];
    if (b === 'B1') {
      if (n === 1) return 1;
      if (v.asal) return 2;
      if (v.tuzak) return 3;
      if (n % 2 === 0 || n % 5 === 0) return 0.35;
      return 1.2;
    }
    if (b === 'B2' && v.farkli === 3) return 2;
    return 1;
  }

  function agirlikliCek(liste, k, agirlikFn, kullanilan) {
    const r = [];
    const havuz = liste.filter(x => !kullanilan.has(x.n));
    while (r.length < k && havuz.length) {
      const top = havuz.reduce((a, x) => a + agirlikFn(x), 0);
      let z = Math.random() * top;
      let i = 0;
      for (; i < havuz.length - 1; i++) { z -= agirlikFn(havuz[i]); if (z <= 0) break; }
      const x = havuz.splice(i, 1)[0];
      r.push(x);
      kullanilan.add(x.n);
      for (let j = havuz.length - 1; j >= 0; j--) if (havuz[j].n === x.n) havuz.splice(j, 1);
    }
    return r;
  }

  /* bir mac icin 'adet' tane {n,b} sec */
  function macPlani(kayit, havuz, adet) {
    adet = adet || 10;
    const gorulmus = x => { const c = cift(kayit, x.n, x.b); return c && c.d + c.y > 0; };
    const zayif = havuz.filter(x => gorulmus(x) && seviye(kayit, x.n, x.b) <= 1);
    const yeni = havuz.filter(x => !gorulmus(x));
    const guclu = havuz.filter(x => gorulmus(x) && seviye(kayit, x.n, x.b) >= 2);
    const kullanilan = new Set();
    const w = x => agirlik(x.n, x.b);
    const wz = x => w(x) * (1 + Math.min(3, cift(kayit, x.n, x.b).y));
    let plan = [];
    plan = plan.concat(agirlikliCek(zayif, 5, wz, kullanilan));
    plan = plan.concat(agirlikliCek(yeni, Math.max(3, 8 - plan.length), w, kullanilan));
    plan = plan.concat(agirlikliCek(guclu, adet - plan.length, w, kullanilan));
    if (plan.length < adet) plan = plan.concat(agirlikliCek(havuz, adet - plan.length, w, kullanilan));
    /* havuz kucukse (ornegin 10 kuvvet) ayni sayi farkli beceriyle gelebilir */
    if (plan.length < adet) {
      const k2 = new Set(plan.map(x => anahtar(x.n, x.b)));
      const kalan = havuz.filter(x => !k2.has(anahtar(x.n, x.b)));
      plan = plan.concat(karistir(kalan).slice(0, adet - plan.length));
    }
    return karistir(plan).slice(0, adet);
  }

  /* en zayif cifler: [{n,b,d,y,s}] */
  function zayiflar(kayit, k) {
    return Object.keys(kayit.ciftler).map(a => {
      const [n, b] = a.split('|');
      return Object.assign({ n: Number(n), b }, kayit.ciftler[a]);
    }).filter(x => x.y > 0 || x.s === 0)
      .sort((a, b) => (b.y / (b.d + b.y || 1)) - (a.y / (a.d + a.y || 1)) || b.y - a.y || a.s - b.s)
      .slice(0, k || 10);
  }
  function yavaslar(kayit, k) {
    const ort = t => t.reduce((a, x) => a + x, 0) / (t.length || 1);
    return Object.keys(kayit.ciftler).map(a => {
      const [n, b] = a.split('|');
      const c = kayit.ciftler[a];
      return { n: Number(n), b, ort: ort(c.t), s: c.s };
    }).filter(x => x.ort > 0).sort((a, b) => b.ort - a.ort).slice(0, k || 10);
  }
  /* albüm karti seviyesi */
  function kartSeviyesi(kayit, n) {
    const v = VERI[n];
    if (n === 1 || v.asal) return seviye(kayit, n, 'B1');
    return Math.min(seviye(kayit, n, 'B1'), seviye(kayit, n, 'B2'), seviye(kayit, n, 'B4'));
  }

  function yeniKayit() {
    return {
      surum: 1,
      oyuncu: { ad: '', forma: 10 },
      ciftler: {},
      kupa: {},
      ayarlar: { ses: true, spiker: false, hareketAz: false, sutSaati: true, sureCarpani: 1, aralikAlt: 1, aralikUst: 120 },
      gunler: {},
      rekor: 0,
      oduller: [],
      secili: { top: 'klasik' },
      isinma: false
    };
  }

  const Motor = {
    MAX, VERI, ASALLAR, KUVVETLER, BILESIKLER, UC_ASALLI, TUZAKLAR, BECERILER, ALTIN_SURE, KUPA,
    asalMi, ayir, yaz, us, deger, merdiven, hesapSatiri, acikCarpim, ye, nin, uygunMu,
    soruUret, ayrilisCeldiricileri, karistir, sec,
    bugun, cevapIsle, seviye, cift, macPlani, agirlik, zayiflar, yavaslar, kartSeviyesi, yeniKayit
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Motor;
  else kok.Motor = Motor;
})(typeof window !== 'undefined' ? window : globalThis);
