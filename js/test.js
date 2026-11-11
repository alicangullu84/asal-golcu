/* Asal Golcu otomatik testleri. Node: node js/test.js   Tarayici: index.html?test=1 */
(function (kok) {
  'use strict';
  const M = typeof module !== 'undefined' && module.exports ? require('./motor.js') : kok.Motor;

  function calistir() {
    const hatalar = [];
    const notlar = [];
    const bekle = (kosul, mesaj) => { if (!kosul) hatalar.push(mesaj); };

    /* 1. ayrilislarin carpimi sayinin kendisi */
    for (let n = 2; n <= M.MAX; n++) {
      const v = M.VERI[n];
      bekle(M.deger(v.carpan) === n, 'Ayrılış çarpımı tutmuyor: ' + n);
      v.carpan.forEach(x => bekle(M.asalMi(x[0]), 'Asal olmayan taban: ' + n));
    }
    notlar.push('1-120 ayrılışları kontrol edildi');

    /* 2. asal listesi */
    const BEKLENEN_ASAL = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
    bekle(JSON.stringify(M.ASALLAR) === JSON.stringify(BEKLENEN_ASAL), 'Asal listesi PRD ile aynı değil');
    bekle(M.ASALLAR.length === 30, 'Asal sayısı 30 değil');

    /* 3. uc farkli asal carpanlilar */
    const BEKLENEN_UC = [30, 42, 60, 66, 70, 78, 84, 90, 102, 105, 110, 114, 120];
    bekle(JSON.stringify(M.UC_ASALLI) === JSON.stringify(BEKLENEN_UC), 'Üç asallı liste PRD ile aynı değil: ' + M.UC_ASALLI.join(','));
    bekle(M.VERI.filter(v => v && v.farkli === 1).length === 40, '1 farklı asallı sayı 40 değil');
    bekle(M.VERI.filter(v => v && v.farkli === 2).length === 66, '2 farklı asallı sayı 66 değil');
    bekle(JSON.stringify(M.KUVVETLER) === JSON.stringify([4, 8, 9, 16, 25, 27, 32, 49, 64, 81]), 'Kuvvet listesi hatalı');
    M.TUZAKLAR.forEach(n => bekle(!M.asalMi(n), 'Tuzak sayı asal çıktı: ' + n));

    /* 4. soru uretimi: her beceriden her uygun sayi icin 30 deneme */
    const beceriler = ['B1', 'B2', 'B3', 'B3T', 'B4', 'B5', 'B6'];
    let soruSayisi = 0;
    beceriler.forEach(b => {
      for (let n = 1; n <= M.MAX; n++) {
        if (!M.uygunMu(n, b)) continue;
        for (let k = 0; k < 30; k++) {
          let s;
          try { s = M.soruUret(b, n); } catch (e) { hatalar.push(b + ' ' + n + ' üretilemedi: ' + e.message); break; }
          soruSayisi++;
          const beklenenSecenek = s.duzen;
          bekle(s.secenekler.length === beklenenSecenek, b + ' ' + n + ': ' + s.secenekler.length + ' şık var, ' + beklenenSecenek + ' olmalı');
          bekle(s.secenekler.filter(o => o.dogru).length === 1, b + ' ' + n + ': doğru şık sayısı 1 değil');
          const yazilar = new Set(s.secenekler.map(o => o.yazi));
          bekle(yazilar.size === s.secenekler.length, b + ' ' + n + ': şıklar tekrar ediyor: ' + s.secenekler.map(o => o.yazi).join(' | '));
          s.secenekler.forEach(o => {
            bekle(typeof o.yazi === 'string' && o.yazi.length > 0, b + ' ' + n + ': boş şık');
            if (!o.dogru) bekle(o.aciklama && o.aciklama.length > 5, b + ' ' + n + ': yanlış şıkta açıklama yok (' + o.yazi + ')');
            if (!o.dogru && s.duzen === 4) bekle(!!o.etiket, b + ' ' + n + ': çeldiricide etiket yok');
          });
          bekle(s.dogruIndex >= 0, b + ' ' + n + ': doğru index yok');
          if (k > 2 && b !== 'B4' && b !== 'B3' && b !== 'B3T' && b !== 'B5' && b !== 'B6') break;
        }
        if (hatalar.length > 40) break;
      }
    });
    notlar.push(soruSayisi + ' soru üretildi ve denetlendi');

    /* 5. dogru cevaplarin icerigi */
    for (let n = 2; n <= M.MAX; n++) {
      const v = M.VERI[n];
      const b1 = M.soruUret('B1', n);
      bekle(b1.secenekler[b1.dogruIndex].yazi === (v.asal ? 'ASAL' : 'ASAL DEĞİL'), 'B1 doğru şık hatalı: ' + n);
      const b2 = M.soruUret('B2', n);
      bekle(b2.secenekler[b2.dogruIndex].yazi === String(v.farkli), 'B2 doğru şık hatalı: ' + n);
      if (M.uygunMu(n, 'B4')) {
        const b4 = M.soruUret('B4', n);
        bekle(b4.secenekler[b4.dogruIndex].yazi === v.yazi, 'B4 doğru şık hatalı: ' + n);
      }
      if (M.uygunMu(n, 'B6')) {
        const b6 = M.soruUret('B6', n);
        bekle(Number(b6.secenekler[b6.dogruIndex].yazi) === v.enBuyuk, 'B6 doğru şık hatalı: ' + n);
        b6.secenekler.filter(o => !o.dogru).forEach(o => {
          const x = Number(o.yazi);
          bekle(!(M.asalMi(x) && n % x === 0 && x > v.enBuyuk), 'B6 çeldirici daha büyük asal çarpan: ' + n + ' ' + x);
        });
      }
    }
    const b1Bir = M.soruUret('B1', 1);
    bekle(b1Bir.secenekler[b1Bir.dogruIndex].yazi === 'ASAL DEĞİL', '1 sayısı ASAL DEĞİL olmalı');

    /* 6. B4 celdiricileri: asal-olmayan-taban disinda deger farkli */
    for (let n = 4; n <= M.MAX; n++) {
      if (!M.uygunMu(n, 'B4')) continue;
      M.ayrilisCeldiricileri(n).forEach(o => {
        if (o.etiket === 'asal-olmayan-taban') {
          bekle(o.deger === n, 'asal-olmayan-taban değeri tutmuyor: ' + n + ' ' + o.yazi);
          bekle(o.c.some(x => !M.asalMi(x[0])), 'asal-olmayan-taban içinde asal olmayan taban yok: ' + n + ' ' + o.yazi);
        } else {
          bekle(o.deger !== n, 'çeldirici değeri doğru cevaba eşit: ' + n + ' ' + o.yazi);
        }
      });
    }

    /* 7. Turkce ekler */
    const ekler = { 2: "2'ye", 3: "3'e", 5: "5'e", 6: "6'ya", 7: "7'ye", 9: "9'a", 10: "10'a", 11: "11'e", 13: "13'e", 17: "17'ye", 20: "20'ye", 40: "40'a", 100: "100'e", 120: "120'ye" };
    Object.keys(ekler).forEach(k => bekle(M.ye(Number(k)) === ekler[k], 'Ek hatalı: ' + k + ' → ' + M.ye(Number(k))));
    const nin = { 96: "96'nın", 81: "81'in", 3: "3'ün", 10: "10'un", 2: "2'nin", 40: "40'ın", 4: "4'ün" };
    Object.keys(nin).forEach(k => bekle(M.nin(Number(k)) === nin[k], 'İlgi eki hatalı: ' + k + ' → ' + M.nin(Number(k))));

    /* 8. ogrenme motoru */
    const kayit = M.yeniKayit();
    M.cevapIsle(kayit, 19, 'B1', true, 2, false, '2026-11-11');
    M.cevapIsle(kayit, 19, 'B1', true, 2, false, '2026-11-11');
    bekle(M.seviye(kayit, 19, 'B1') === 2, 'İki doğrudan sonra seviye 2 olmalı');
    M.cevapIsle(kayit, 19, 'B1', true, 2, false, '2026-11-11');
    bekle(M.seviye(kayit, 19, 'B1') === 2, 'Aynı gün altına çıkmamalı');
    M.cevapIsle(kayit, 19, 'B1', true, 2, false, '2026-11-12');
    bekle(M.seviye(kayit, 19, 'B1') === 3, 'Ertesi gün altına çıkmalı');
    M.cevapIsle(kayit, 19, 'B1', false, 4, false, '2026-11-12');
    bekle(M.seviye(kayit, 19, 'B1') === 2, 'Yanlışta seviye bir düşmeli');
    M.cevapIsle(kayit, 91, 'B1', true, 2, true, '2026-11-12');
    bekle(M.seviye(kayit, 91, 'B1') === 0, 'Yardımlı doğru seviye artırmamalı');

    /* mac plani: 10 farkli sayi */
    M.KUPA.forEach(t => {
      const havuz = t.havuz();
      bekle(havuz.length >= 10, 'Tur ' + t.id + ' havuzu küçük: ' + havuz.length);
      for (let i = 0; i < 20; i++) {
        const plan = M.macPlani(kayit, havuz, 10);
        bekle(plan.length === 10, 'Tur ' + t.id + ' planı 10 değil: ' + plan.length);
        const anahtarlar = new Set(plan.map(x => x.n + '|' + x.b));
        bekle(anahtarlar.size === 10, 'Tur ' + t.id + ' planında tekrar var');
        if (t.id !== 4) bekle(new Set(plan.map(x => x.n)).size === 10, 'Tur ' + t.id + ' planında aynı sayı iki kez');
      }
    });

    /* zayif sayilar plana girer */
    const k2 = M.yeniKayit();
    [51, 57, 91].forEach(n => M.cevapIsle(k2, n, 'B1', false, 5, false, '2026-11-11'));
    let gorulme = 0;
    for (let i = 0; i < 50; i++) {
      const plan = M.macPlani(k2, M.KUPA[1].havuz(), 10);
      if ([51, 57, 91].every(n => plan.some(x => x.n === n))) gorulme++;
    }
    bekle(gorulme === 50, 'Zayıf sayılar plana her zaman girmeli (' + gorulme + '/50)');

    /* B1 dengesi */
    let asal = 0, toplam = 0;
    const k3 = M.yeniKayit();
    for (let i = 0; i < 300; i++) {
      M.macPlani(k3, M.KUPA[1].havuz(), 10).forEach(x => { toplam++; if (M.VERI[x.n].asal) asal++; });
    }
    const oran = asal / toplam;
    notlar.push('Tur 2 asal oranı: %' + Math.round(oran * 100));
    bekle(oran > 0.33 && oran < 0.55, 'Tur 2 asal oranı dengesiz: ' + oran);

    return { hatalar, notlar };
  }

  if (typeof module !== 'undefined' && module.exports) {
    const r = calistir();
    r.notlar.forEach(n => console.log('  ' + n));
    if (r.hatalar.length) {
      console.log('HATA ' + r.hatalar.length);
      r.hatalar.slice(0, 60).forEach(h => console.log(' - ' + h));
      process.exitCode = 1;
    } else console.log('TAMAM: tüm testler geçti');
  } else kok.AsalTest = { calistir };
})(typeof window !== 'undefined' ? window : globalThis);
