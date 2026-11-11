/* Klip olculeri (araclar/klip-olc.js ve kare seritleriyle olculdu).
   ax, ay: ilk karede ayak noktasi; boy: kare yuksekligine oranla boy;
   giris: topun kadraja girdigi an; tut: topun eldivene geldigi an; bas/son: oynatilan aralik (sn).
   Bir kalecinin uc klibinden biri eksikse oyun o kaleci icin gorsel animasyona doner. */
(function () {
  const k = (ad, ax, ay, boy, giris, tut) => ({
    src: 'videolar/' + ad + '.webm', ax, ay, boy, giris,
    bas: giris == null ? 0.25 : Math.max(0.04, giris - 0.04),
    tut,
    son: tut ? Math.min(3.3, tut + 1.6) : 2.6
  });
  const kaleci = (n, olcu, tutAn, ortaGiris, ortaAn, tutGiris) => ({
    tut: tutAn == null ? null : k('k' + n + '-tut', olcu[0], olcu[1], olcu[2], tutGiris, tutAn),
    bos: k('k' + n + '-bos', olcu[0], olcu[1], olcu[2], null, null),
    orta: k('k' + n + '-orta', olcu[0], olcu[1], olcu[2], ortaGiris, ortaAn)
  });
  window.KLIPLER = {
    golcu: { src: 'videolar/golcu-vurus.webm', ax: 0.506, ay: 0.778, boy: 0.467, bas: 0.5, temas: 1.58, tx: 0.583, ty: 0.733, son: 2.6, hiz: 1.35 },
    kaleci: {
      1: kaleci(1, [0.5, 0.767, 0.489], 0.8, 0.2, 0.6, 0.2),
      2: kaleci(2, [0.5, 0.933, 0.589], 1.2, 0.6, 1.0, 0.16),
      3: kaleci(3, [0.5, 0.767, 0.5], 0.85, 0.12, 0.6, 0.2),
      4: kaleci(4, [0.5, 0.822, 0.611], 1.0, 0.2, 0.7, 0.28),
      5: kaleci(5, [0.5, 0.733, 0.556], 0.7, 0.4, 0.9, 0.08),
      6: kaleci(6, [0.5, 0.8, 0.5], 1.2, 0.16, 0.5, 0.28),
      7: kaleci(7, [0.5, 0.733, 0.433], 1.0, 0.28, 0.6, 0.12),
      8: kaleci(8, [0.5, 0.778, 0.556], 0.85, 0.08, 0.7, 0.16)
    }
  };
})();
