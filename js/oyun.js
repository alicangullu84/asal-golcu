/* Asal Golcu - ekranlar, mac motoru, sahne ve canlandirmalar */
(function () {
  'use strict';
  const M = window.Motor;
  const S = window.Ses;
  const $ = s => document.querySelector(s);
  const bekle = ms => new Promise(r => setTimeout(r, ms));
  const kacis = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const buyukHarf = s => String(s).toLocaleUpperCase('tr-TR');
  /* ozetin ilk cumlesi: "96 = 2⁵ · 3" */
  const kisaOzet = s => String(s).split('. Farklı')[0].split('. En büyük')[0].replace(/\.$/, '');

  /* ---------- sabitler ---------- */
  const KALE = { sol: 25, sag: 75, ust: 36.4, alt: 69.5 };
  const KISA_AD = ['', 'UMUT', 'DAVUT', 'ORHAN', 'POLAT', 'ÖMER', 'KAAN', 'RIZA', 'EFSANE'];
  const kaleciGorsel = id => 'gorseller/kaleci-' + id + '.png';
  const TOPLAR = [
    { id: 'klasik', ad: 'Klasik', filtre: 'none', tur: 0 },
    { id: 'alev', ad: 'Alev', filtre: 'sepia(1) saturate(5) hue-rotate(-25deg)', tur: 1 },
    { id: 'buz', ad: 'Buz', filtre: 'sepia(1) saturate(4) hue-rotate(160deg) brightness(1.05)', tur: 2 },
    { id: 'ahtapot', ad: 'Ahtapot', filtre: 'sepia(1) saturate(4) hue-rotate(230deg)', tur: 3 },
    { id: 'gece', ad: 'Gece', filtre: 'invert(1) hue-rotate(180deg)', tur: 4 },
    { id: 'zumrut', ad: 'Zümrüt', filtre: 'sepia(1) saturate(4) hue-rotate(90deg)', tur: 5 },
    { id: 'altin', ad: 'Altın', filtre: 'sepia(1) saturate(3.2) brightness(1.08)', tur: 6 },
    { id: 'gokkusagi', ad: 'Gökkuşağı', filtre: '', sinif: 'gokkusagi', tur: 7 },
    { id: 'efsane', ad: 'Efsane', filtre: 'sepia(1) saturate(3.2) brightness(1.12) drop-shadow(0 0 0.8cqw #ffd34d)', tur: 8 }
  ];
  const PENALTI_SURE = { B1: 8, B2: 10, B3: 10, B3T: 10, B4: 15, B5: 12, B6: 12 };
  const TAKTIK = {
    B1: ['Asal sayının tam iki böleni vardır: 1 ve kendisi. 1 asal değildir.', '120\'ye kadar bir sayı 2, 3, 5 ve 7\'ye bölünmüyorsa asaldır (çünkü 11 · 11 = 121).', 'Yalnız 7\'ye takılan tuzaklar: 49, 77, 91, 119.'],
    B2: ['Önce asal çarpanlarına ayır.', 'Üsleri sayma, farklı tabanları say: 96 = 2⁵ · 3 → 2 farklı asal.', '120\'ye kadar en fazla 3 farklı asal çarpan olur (2 · 3 · 5 · 7 = 210).'],
    B3: ['Aynı asalı kaç kez çarptığını say: 81 = 3 · 3 · 3 · 3 → 3⁴.', 'Taban asal olmalı: 9² de 81 eder ama 9 asal değil.'],
    B3T: ['Üs, tabanın kaç kez çarpıldığını söyler: 3⁴ = 3 · 3 · 3 · 3.', '3⁴, 3 · 4 demek değildir.'],
    B4: ['Bölen merdiveni kur: en küçük asaldan başla, bölünmüyorsa sıradakine geç.', 'Merdivenin sağındaki asalları üslü yaz.', 'Tabanların hepsi asal olmalı.'],
    B5: ['Önce üslüleri hesapla: 2³ = 8.', 'Sonra hepsini çarp: 8 · 3 · 5 = 120.'],
    B6: ['Ayrılışı yap, en büyük tabana bak.', 'Bölen her sayı asal değildir: 21 = 3 · 7.']
  };
  const SPIKER = {
    hazir: ['{ad} topun başında.', 'Seyirci nefesini tuttu.', 'Kaleci çizgide sağa sola sallanıyor.', '{ad} köşeyi kolluyor.', 'Hakem düdüğü çaldı, şut bekleniyor.'],
    gol: ['Ağlar havalandı!', 'Kaleci sadece baktı!', 'Doksana taktı!', '{ad} affetmedi!', 'Ne vuruş ama!', 'Tribünler ayakta!', 'Kaleci yanlış köşeye uçtu!'],
    fuze: ['Füze gibi! Kaleci kıpırdayamadı.', 'Şimşek hızında karar!', 'Düşünmeden vurdu, gol!'],
    kurtaris: ['Kaleci köşeyi bildi.', 'Eldivenler bugün formda.', 'Kurtarış! VAR\'a bakalım.', 'Top kalecide kaldı.'],
    sure: ['Hakem düdüğü çaldı, süre doldu.', 'Çok bekledi, top kalecide.']
  };

  /* ---------- kayit ---------- */
  const ANAHTAR = 'asalGolcu.v1';
  function yukle() {
    const bos = M.yeniKayit();
    try {
      const s = localStorage.getItem(ANAHTAR);
      if (s) {
        const k = JSON.parse(s);
        return Object.assign(bos, k, { ayarlar: Object.assign(bos.ayarlar, k.ayarlar || {}), oyuncu: Object.assign(bos.oyuncu, k.oyuncu || {}) });
      }
    } catch (e) { /* bozuk kayit: bastan basla */ }
    return bos;
  }
  let K = yukle();
  function kaydet() { try { localStorage.setItem(ANAHTAR, JSON.stringify(K)); } catch (e) { /* depolama kapali */ } }
  const ad = () => K.oyuncu.ad || 'Akif';
  const doldur = s => s.replace(/\{ad\}/g, ad());
  const sec = a => doldur(a[Math.floor(Math.random() * a.length)]);
  function ayarlariUygula() {
    S.ayarla(K.ayarlar.ses);
    document.body.classList.toggle('hareket-az', !!K.ayarlar.hareketAz);
  }
  const hiz = () => (K.ayarlar.hareketAz ? 0.45 : 1);

  /* ---------- kupa durumu ---------- */
  const turYildiz = id => (K.kupa[id] && K.kupa[id].yildiz) || 0;
  const turAcik = id => id === 1 || turYildiz(id - 1) >= 1;
  const acikTurlar = () => M.KUPA.filter(t => turAcik(t.id));
  const toplamYildiz = () => M.KUPA.reduce((a, t) => a + turYildiz(t.id), 0);
  function aralikFiltre(havuz) {
    const a = K.ayarlar.aralikAlt || 1, b = K.ayarlar.aralikUst || 120;
    if (a <= 1 && b >= 120) return havuz;
    const f = havuz.filter(x => x.n >= a && x.n <= b);
    return f.length >= 10 ? f : havuz;
  }
  function gunlukSeri() {
    let seri = 0;
    const d = new Date();
    if (!(K.gunler[M.bugun(d)] && K.gunler[M.bugun(d)].sut)) d.setDate(d.getDate() - 1);
    while (K.gunler[M.bugun(d)] && K.gunler[M.bugun(d)].sut > 0) { seri++; d.setDate(d.getDate() - 1); }
    return seri;
  }
  function albumSayim() {
    const r = [0, 0, 0, 0];
    for (let n = 1; n <= 120; n++) r[M.kartSeviyesi(K, n)]++;
    return r;
  }

  /* ---------- ekran yonetimi ---------- */
  let aktif = '';
  const CIZ = {};
  function git(adi, veri) {
    if (aktif === 'mac' && adi !== 'mac') macTemizle();
    aktif = adi;
    if (CIZ[adi]) CIZ[adi](veri);
    document.querySelectorAll('.ekran').forEach(e => e.classList.toggle('acik', e.id === 'ekran-' + adi));
    window.scrollTo(0, 0);
  }
  function modalAc(html) { const m = $('#modal'); m.innerHTML = '<div class="kart">' + html + '</div>'; m.hidden = false; }
  function modalKapat() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-kapat]')) modalKapat(); });

  document.addEventListener('click', e => {
    const d = e.target.closest('[data-git]');
    if (d && !d.disabled) { S.tikla(); git(d.dataset.git, d.dataset.veri); }
  });

  const yildizYaz = (k, max) => '<span class="yildizlar">' + '★'.repeat(k) + '<span class="bos">' + '★'.repeat((max || 3) - k) + '</span></span>';

  /* ---------- giris ---------- */
  CIZ.giris = function () {
    $('#ekran-giris').innerHTML = `
      <div class="arka-kapak"></div>
      <div class="icerik"><div class="kart giris-kart">
        <img class="kupa-resim" src="gorseller/kupa.png" alt="">
        <div class="oyun-adi">ASAL <span>GOLCÜ</span></div>
        <p class="soluk">Kupa yolunda her şut bir sayı. Doğru köşeye vur, golü at!</p>
        <label class="alan">Adın <input id="g-ad" maxlength="14" value="${kacis(K.oyuncu.ad || 'Akif')}" autocomplete="off"></label>
        <label class="alan">Forma numaran (1-120) <input id="g-forma" type="number" min="1" max="120" value="${K.oyuncu.forma || 10}"></label>
        <div class="hata" id="g-hata"></div>
        <button class="buyuk-dugme" id="g-basla" type="button">Sahaya çık</button>
      </div></div>`;
    const basla = () => {
      S.uyandir();
      const a = $('#g-ad').value.trim();
      const f = Number($('#g-forma').value);
      if (!a) { $('#g-hata').textContent = 'Adını yaz.'; return; }
      if (!Number.isInteger(f) || f < 1 || f > 120) { $('#g-hata').textContent = 'Forma numarası 1 ile 120 arasında olmalı.'; return; }
      K.oyuncu.ad = a; K.oyuncu.forma = f; kaydet();
      formaGoster();
    };
    $('#g-basla').onclick = basla;
    ['#g-ad', '#g-forma'].forEach(s => $(s).addEventListener('keydown', e => { $('#g-hata').textContent = ''; if (e.key === 'Enter') basla(); }));
  };
  function formaGoster() {
    const n = K.oyuncu.forma;
    const v = M.VERI[n];
    const bilgi = n === 1 ? '1 ne asal ne bileşik' : v.asal ? n + ' asal sayı' : n + ' = ' + v.yazi;
    $('#ekran-giris .giris-kart').innerHTML = `
      <p class="soluk">Formanı giydin!</p>
      <div class="forma-kart"><div class="no">${n}</div><div class="bilgi">${bilgi}</div></div>
      <p>Senin numaranın kimliği bu. Oyunda 120 sayının hepsinin kimliğini öğreneceksin.</p>
      <button class="buyuk-dugme yesil" id="g-isin" type="button">${K.isinma ? 'Ana menüye geç' : 'Isınmaya başla'}</button>`;
    S.yildiz(2);
    $('#g-isin').onclick = () => (K.isinma ? git('menu') : macBaslat({ mod: 'isinma' }));
  }

  /* ---------- menu ---------- */
  CIZ.menu = function () {
    const al = albumSayim();
    $('#ekran-menu').innerHTML = `
      <div class="arka-kapak"></div>
      <div class="icerik">
        <div class="menu-baslik">
          <div class="oyun-adi">ASAL<br><span>GOLCÜ</span></div>
          <p>${kacis(ad())}'in kupa yolu · Forma ${K.oyuncu.forma}</p>
        </div>
        <div class="menu-kutu">
          <div class="istatistik">
            <div><b>${gunlukSeri()}</b><span>gün seri</span></div>
            <div><b>${toplamYildiz()}</b><span>/ 24 yıldız</span></div>
            <div><b>${al[3]}</b><span>altın kart</span></div>
            <div><b>${K.rekor}</b><span>rekor puan</span></div>
          </div>
          <button class="buyuk-dugme" data-git="harita" type="button">Kupa yolu <small>${acikTurlar().length}/8 tur açık</small></button>
          <button class="buyuk-dugme yesil" id="m-penalti" type="button">Penaltı atışları <small>1 dakika</small></button>
          <button class="buyuk-dugme ikincil" data-git="antrenman" type="button">Antrenman</button>
          <button class="buyuk-dugme ikincil" data-git="album" type="button">Sayı albümü <small>${al[1] + al[2] + al[3]}/120</small></button>
          <button class="buyuk-dugme ikincil" data-git="hoca" type="button">Hoca köşesi</button>
          <button class="buyuk-dugme ikincil" data-git="ayarlar" type="button">Ayarlar</button>
          <button class="buyuk-dugme ikincil" id="m-tam-ekran" type="button" data-tam-ekran>Tam Ekran</button>
        </div>
      </div>`;
    $('#m-penalti').onclick = () => { S.tikla(); macBaslat({ mod: 'penalti' }); };
    $('#m-tam-ekran').onclick = () => { S.tikla(); tamEkranDugme(); };
    tamEkranEtiket();
  };

  /* ---------- harita ---------- */
  CIZ.harita = function () {
    const siradaki = M.KUPA.find(t => turAcik(t.id) && turYildiz(t.id) === 0);
    const kartlar = M.KUPA.map(t => {
      const acik = turAcik(t.id);
      const sinif = ['durak', acik ? '' : 'kilitli', siradaki && siradaki.id === t.id ? 'siradaki' : '', t.id === 8 ? 'final' : ''].join(' ');
      return `<button class="${sinif}" type="button" ${acik ? `data-git="maconcesi" data-veri="${t.id}"` : 'disabled'}>
        <span class="no">${t.id}</span>
        <img src="${kaleciGorsel(t.id)}" alt="">
        <span class="mac">${t.mac}</span>
        <span class="kaleci-adi">${t.kaleci}</span>
        <span class="konu">${t.konu}</span>
        ${yildizYaz(turYildiz(t.id))}
      </button>`;
    }).join('');
    $('#ekran-harita').innerHTML = `
      <div class="arka-stadyum"></div>
      <div class="icerik">
        <div class="ust-cubuk"><button class="geri" data-git="menu" type="button">← Menü</button><h2>Kupa yolu</h2><span class="rozet">${toplamYildiz()} / 24 yıldız</span></div>
        <div class="harita">${kartlar}</div>
        <p class="soluk" style="margin-top:16px">Bir turu geçmek için 10 şutta en az 7 gol at. 8-9 gol iki yıldız, 10 gol üç yıldız.</p>
      </div>`;
  };

  /* ---------- mac oncesi ---------- */
  CIZ.maconcesi = function (veri) {
    const t = M.KUPA[Number(veri) - 1];
    const sure = t.sure ? Object.values(t.sure)[0] : 0;
    $('#ekran-maconcesi').innerHTML = `
      <div class="arka-stadyum"></div>
      <div class="icerik">
        <div class="ust-cubuk"><button class="geri" data-git="harita" type="button">← Kupa yolu</button></div>
        <div class="onces">
          <img class="kaleci-buyuk" src="${kaleciGorsel(t.id)}" alt="${t.kaleci}">
          <div>
            <span class="rozet">Tur ${t.id} · ${t.mac}</span>
            <h3>${t.kaleci}</h3>
            <div class="balon">“${t.replik}”</div>
            <p><b>Konu:</b> ${t.konu}</p>
            <p><b>Şut saati:</b> ${sure && K.ayarlar.sutSaati ? Math.round(sure * (K.ayarlar.sureCarpani || 1)) + ' saniye' : 'yok, rahat düşün'} · <b>En iyi:</b> ${yildizYaz(turYildiz(t.id))}</p>
            <div class="taktik-kutu"><b>Hocanın taktiği:</b> ${t.taktik}</div>
            <button class="buyuk-dugme yesil" id="o-basla" type="button">Maça başla</button>
          </div>
        </div>
      </div>`;
    $('#o-basla').onclick = () => { S.uyandir(); macBaslat({ mod: 'kupa', tur: t.id }); };
  };

  /* ================= MAC MOTORU ================= */
  let MAC = null;
  let zamanlayici = null;

  function rastgeleKaleci() { const a = acikTurlar(); return a[Math.floor(Math.random() * a.length)].id; }

  function macBaslat(ayar) {
    if (telefonMu()) tamEkranAc();
    let plan, rakip, baslik, sure = null, adet = 10;
    if (ayar.mod === 'kupa') {
      const t = M.KUPA[ayar.tur - 1];
      plan = M.macPlani(K, aralikFiltre(t.havuz()), 10);
      rakip = t.id; baslik = t.mac;
      if (K.ayarlar.sutSaati && t.sure) sure = t.sure;
    } else if (ayar.mod === 'penalti') {
      const havuz = aralikFiltre(acikTurlar().reduce((a, t) => a.concat(t.havuz()), []));
      ayar.havuz = havuz;
      plan = M.macPlani(K, havuz, 5);
      adet = 5;
      rakip = rastgeleKaleci(); baslik = 'Penaltı atışları';
      if (K.ayarlar.sutSaati) sure = PENALTI_SURE;
    } else if (ayar.mod === 'antrenman') {
      plan = M.macPlani(K, ayar.havuz, 10);
      rakip = rastgeleKaleci(); baslik = 'Antrenman';
    } else if (ayar.mod === 'ozel') {
      plan = ozelPlan();
      rakip = rastgeleKaleci(); baslik = 'Hocanın özel antrenmanı';
    } else {
      plan = [{ n: 7, b: 'B1', ipucu: true }, { n: 10, b: 'B1' }, { n: 9, b: 'B1' }];
      adet = 3; rakip = 1; baslik = 'Isınma';
    }
    const once = {};
    for (let n = 1; n <= 120; n++) once[n] = M.kartSeviyesi(K, n);
    MAC = {
      ayar, plan, adet, rakip, baslik, sure,
      i: 0, gol: 0, kurt: 0, seri: 0, enSeri: 0, puan: 0, joker: ayar.mod !== 'isinma',
      yanlislar: [], dogrular: [], once, devre: false, basla: Date.now(),
      akifSeri: [], rakipSeri: [], duraklatildi: false
    };
    git('mac');
    macEkraniKur();
    S.ugultuBasla();
    const buMac = MAC;
    const bekleyen = [];
    if (KLIP.golcu) bekleyen.push(KLIP.golcu.yuklendi);
    if (KLIP.kaleci) Object.values(KLIP.kaleci).forEach(k => bekleyen.push(k.yuklendi));
    if (bekleyen.length) spiker('Takımlar sahaya çıkıyor...');
    Promise.race([Promise.all(bekleyen), bekle(5000)]).then(() => {
      if (MAC !== buMac) return;
      S.duduk(false);
      pozisyon();
    });
  }

  function ozelPlan() {
    const z = M.zayiflar(K, 10).filter(x => M.uygunMu(x.n, x.b)).map(x => ({ n: x.n, b: x.b }));
    const kullanilan = new Set(z.map(x => x.n));
    const havuz = acikTurlar().reduce((a, t) => a.concat(t.havuz()), []).filter(x => !kullanilan.has(x.n));
    const ek = z.length >= 10 ? [] : M.macPlani(K, havuz, 10 - z.length);
    return M.karistir(z.concat(ek)).slice(0, 10);
  }

  function macEkraniKur() {
    $('#t-ad').textContent = buyukHarf(ad());
    $('#t-rakip').textContent = KISA_AD[MAC.rakip];
    $('#t-mac').textContent = MAC.baslik;
    $('#kaleci').src = kaleciGorsel(MAC.rakip);
    const top = TOPLAR.find(t => t.id === K.secili.top) || TOPLAR[0];
    const tg = $('#top-gorsel');
    tg.style.filter = top.filtre || '';
    tg.className = top.sinif || '';
    $('#b-joker').classList.toggle('kullanildi', !MAC.joker);
    $('#b-joker').hidden = MAC.ayar.mod === 'isinma';
    $('#katman').hidden = true;
    klipleriHazirla(MAC.rakip);
    tabela();
    gorselOlcu();
    kameraSigdir();
    requestAnimationFrame(kameraSigdir);
  }

  function tabela() {
    $('#t-gol').textContent = MAC.gol;
    $('#t-kurt').textContent = MAC.ayar.mod === 'penalti' ? MAC.rakipSeri.filter(Boolean).length : MAC.kurt;
    $('#t-puan').textContent = MAC.puan;
    const sr = $('#t-seri');
    sr.textContent = 'Seri ' + MAC.seri;
    sr.classList.toggle('ates', MAC.seri >= 3);
    const toplam = MAC.ayar.mod === 'penalti' ? Math.max(5, MAC.plan.length) : MAC.plan.length;
    $('#t-poz').textContent = (MAC.ayar.mod === 'penalti' ? 'Atış ' : 'Pozisyon ') + Math.min(MAC.i + 1, toplam) + '/' + toplam;
    const ps = $('#penalti-seri');
    if (MAC.ayar.mod === 'penalti') {
      const top = Math.max(5, MAC.akifSeri.length, MAC.rakipSeri.length);
      const satir = (adi, dizi) => '<div class="satir"><span>' + adi + '</span>' + Array.from({ length: top }, (_, k) => '<i class="' + (dizi[k] === undefined ? '' : dizi[k] ? 'g' : 'k') + '"></i>').join('') + '</div>';
      ps.innerHTML = satir(buyukHarf(ad()).slice(0, 6), MAC.akifSeri) + satir(KISA_AD[MAC.rakip].slice(0, 6), MAC.rakipSeri);
    } else ps.innerHTML = '';
  }

  function spiker(metin) {
    $('#spiker').textContent = metin;
    if (K.ayarlar.spiker && 'speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(metin.replace(/·/g, ' çarpı '));
        u.lang = 'tr-TR';
        const ses = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('tr'));
        if (ses) u.voice = ses;
        u.rate = 1.08;
        speechSynthesis.speak(u);
      } catch (e) { /* sesli okuma yok */ }
    }
  }

  /* ---------- video klipleri ---------- */
  const KALECI_BOY = 0.25;          /* ayakta kalecinin sahne yuksekligine orani */
  const KALECI_AYAK = 0.696;        /* kale cizgisi */
  const GOLCU_BOY = 0.38;
  const TOP_TEMAS = { x: 0.515, y: 0.97 };    /* vurus aninda ayagin degdigi nokta */
  const KLIP = { golcu: null, kaleci: null, rakip: 0 };
  const KLIP_ATLA = /[?&]klipsiz=1/.test(location.search);
  const klipDestek = () => !!(window.KLIPLER && window.Klip);

  function klipleriKapat() {
    if (KLIP.golcu) { KLIP.golcu.gizle(); KLIP.golcu.tuval.remove(); KLIP.golcu = null; }
    if (KLIP.kaleci) {
      Object.values(KLIP.kaleci).forEach(k => { k.gizle(); k.tuval.remove(); });
      KLIP.kaleci = null;
    }
    const g = $('#golcu'); if (g) g.hidden = false;
    const k = $('#kaleci-kap'); if (k) k.hidden = false;
  }
  window.addEventListener('klip-saydam-yok', klipleriKapat);

  function klipleriHazirla(rakip) {
    if (!klipDestek() || window.KlipSaydamDestek === false) return;
    const meta = window.KLIPLER;
    if (!KLIP.golcu && meta.golcu) { KLIP.golcu = new window.Klip(meta.golcu.src, $('#golcu-katman')); KLIP.golcu.meta = meta.golcu; }
    if (KLIP.rakip !== rakip) {
      if (KLIP.kaleci) Object.values(KLIP.kaleci).forEach(k => { k.gizle(); k.tuval.remove(); });
      KLIP.kaleci = null;
      KLIP.rakip = rakip;
      const m = meta.kaleci && meta.kaleci[rakip];
      if (m && m.tut && m.bos && m.orta && !KLIP_ATLA) {
        KLIP.kaleci = {};
        ['tut', 'bos', 'orta'].forEach(t => { const k = new window.Klip(m[t].src, $('#kaleci-katman')); k.meta = m[t]; KLIP.kaleci[t] = k; });
      }
    }
  }
  const kaleciKlipHazir = () => !!(KLIP.kaleci && KLIP.kaleci.tut.hazirMi && KLIP.kaleci.bos.hazirMi && KLIP.kaleci.orta.hazirMi);
  const golcuKlipHazir = () => !!(KLIP.golcu && KLIP.golcu.hazirMi);

  function kaleciKlipKonumla(k, ayna) {
    const m = k.meta;
    const H = KALECI_BOY / m.boy;
    const ax = ayna ? 1 - m.ax : m.ax;
    k.konumla((0.5 - ax * H) * 100, (KALECI_AYAK - m.ay * H) * 100, H * 100, ayna);
  }
  function golcuKlipKonumla(k) {
    const m = k.meta;
    const H = GOLCU_BOY / m.boy;
    k.konumla((TOP_TEMAS.x - m.tx * H) * 100, (TOP_TEMAS.y - m.ty * H) * 100, H * 100, false);
  }
  /* ayakta bekleyen kaleci ve golcu: kliplerin ilk karesi */
  async function klipBeklemeKaresi() {
    const kh = kaleciKlipHazir(), gh = golcuKlipHazir();
    $('#kaleci-kap').hidden = kh;
    $('#golcu').hidden = gh;
    if (kh) {
      Object.values(KLIP.kaleci).forEach(k => k.gizle());
      const k = KLIP.kaleci.bos;
      kaleciKlipKonumla(k, false);
      await k.kare(0.04);
      k.tuval.classList.add('salin');
    }
    if (gh) {
      golcuKlipKonumla(KLIP.golcu);
      await KLIP.golcu.kare(KLIP.golcu.meta.bas);
    }
  }

  /* ---------- telefon olcusu, tam ekran, kamera ---------- */
  /* Kale agzi (yatay ~%24-76) ve ayaktaki oyuncu kadrajda kalsin. */
  const GUVENLI_KARE = { x: 0.18, y: 0.30, w: 0.64, h: 0.72 };
  const cepheSorgu = window.matchMedia('(orientation: portrait) and (max-width: 820px)');
  function telefonMu() {
    return window.matchMedia('(max-width: 820px), (max-height: 520px) and (pointer: coarse)').matches;
  }
  function gorselOlcu() {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    const u = vv ? vv.offsetTop : 0;
    document.documentElement.style.setProperty('--ekran-h', Math.round(h) + 'px');
    document.documentElement.style.setProperty('--ekran-ust', Math.round(u) + 'px');
  }
  function tamEkranAcikMi() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function tamEkranEtiket() {
    const acik = tamEkranAcikMi();
    document.querySelectorAll('[data-tam-ekran]').forEach(b => {
      b.textContent = acik ? 'Küçült' : 'Tam Ekran';
      b.setAttribute('aria-pressed', acik ? 'true' : 'false');
    });
  }
  function tamEkranAc() {
    document.body.classList.add('tam-ekran');
    const el = document.documentElement;
    const iste = el.requestFullscreen || el.webkitRequestFullscreen;
    if (iste && !tamEkranAcikMi()) {
      try {
        const p = iste.call(el);
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) { /* iOS webview reddeder; CSS kadraj yeter */ }
    }
    gorselOlcu();
    requestAnimationFrame(kameraSigdir);
  }
  function tamEkranKapat() {
    const cikis = document.exitFullscreen || document.webkitExitFullscreen;
    if (tamEkranAcikMi() && cikis) {
      try {
        const p = cikis.call(document);
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } catch (e) { /* cikis yok */ }
    }
    document.body.classList.remove('tam-ekran');
    gorselOlcu();
    requestAnimationFrame(kameraSigdir);
  }
  function tamEkranDugme() {
    if (tamEkranAcikMi()) tamEkranKapat();
    else tamEkranAc();
  }
  /* Portre telefonda 16:9 sahayi, kale ve oyuncu kirpilmadan buyut. */
  function kameraSigdir() {
    const sahne = $('#sahne');
    const kamera = $('#kamera');
    if (!sahne || !kamera) return;
    if (!cepheSorgu.matches) {
      sahne.classList.remove('yerlesti');
      kamera.style.left = '';
      kamera.style.top = '';
      kamera.style.right = '';
      kamera.style.bottom = '';
      kamera.style.width = '';
      kamera.style.height = '';
      sahne.style.removeProperty('--kamera-sol');
      sahne.style.removeProperty('--kamera-ust');
      sahne.style.removeProperty('--kamera-gen');
      sahne.style.removeProperty('--kamera-boy');
      return;
    }
    const sw = sahne.clientWidth;
    const sh = sahne.clientHeight;
    if (sw < 8 || sh < 8) return;
    const guvenli = GUVENLI_KARE;
    const kh0 = sw * 9 / 16;
    let S = Math.min(1 / guvenli.w, sh / (guvenli.h * kh0));
    if (S < 1) S = Math.min(1, sh / kh0);
    const kw = sw * S;
    const kh = kh0 * S;
    let left = sw / 2 - (guvenli.x + guvenli.w / 2) * kw;
    let top = sh / 2 - (guvenli.y + guvenli.h / 2) * kh;
    if (kw >= sw - 0.5) left = Math.min(0, Math.max(sw - kw, left));
    else left = (sw - kw) / 2;
    if (kh >= sh - 0.5) top = Math.min(0, Math.max(sh - kh, top));
    else top = (sh - kh) / 2;
    kamera.style.right = 'auto';
    kamera.style.bottom = 'auto';
    kamera.style.width = kw + 'px';
    kamera.style.height = kh + 'px';
    kamera.style.left = left + 'px';
    kamera.style.top = top + 'px';
    sahne.classList.add('yerlesti');
    sahne.style.setProperty('--kamera-sol', left + 'px');
    sahne.style.setProperty('--kamera-ust', top + 'px');
    sahne.style.setProperty('--kamera-gen', kw + 'px');
    sahne.style.setProperty('--kamera-boy', kh + 'px');
  }

  /* ---------- sahne ---------- */
  function sahneSifirla() {
    const kk = $('#kaleci-kap');
    kk.getAnimations().forEach(a => a.cancel());
    kk.classList.add('salin');
    const top = $('#top');
    top.getAnimations().forEach(a => a.cancel());
    top.classList.remove('ucuyor');
    top.style.opacity = '';
    ['#top-golge', '#top-iz1', '#top-iz2', '#kamera', '#flas'].forEach(s => $(s).getAnimations().forEach(a => a.cancel()));
    $('#ag-katman').innerHTML = '';
    $('#golcu').getAnimations().forEach(a => a.cancel());
    $('#buyuk-yazi').className = 'buyuk-yazi';
    $('#ayrilis').className = 'ayrilis-tabela';
    kameraSigdir();
    klipBeklemeKaresi();
  }

  /* topu sahnedeki bir noktaya ucur (golge, iz ve kamera ile) */
  function topUcur(h, sure, sureDoldu) {
    const top = $('#top');
    top.classList.add('ucuyor');
    const ortaX = (50 + h.x) / 2;
    const ortaY = Math.min(h.y, 90) - (sureDoldu ? 2 : 13);
    const don = sureDoldu ? 240 : 760;
    const kare = [
      { left: '50%', top: '92%', transform: 'translate(-50%,-50%) scale(1) rotate(0deg)' },
      { left: ortaX + '%', top: ortaY + '%', transform: 'translate(-50%,-50%) scale(0.62) rotate(' + don / 2 + 'deg)', offset: 0.5 },
      { left: h.x + '%', top: h.y + '%', transform: 'translate(-50%,-50%) scale(0.45) rotate(' + don + 'deg)' }
    ];
    const egri = sureDoldu ? 'ease-out' : 'cubic-bezier(.15,.75,.35,1)';
    const ucus = canlandir(top, kare, sure, egri);
    if (!sureDoldu && !K.ayarlar.hareketAz) {
      ['#top-iz1', '#top-iz2'].forEach((s, k) => {
        $(s).animate(kare.map((f, j) => Object.assign({}, f, { opacity: j === 0 ? 0 : 0.35 - k * 0.15 })), { duration: sure * hiz(), delay: 28 * (k + 1), easing: egri, fill: 'forwards' });
      });
      $('#kamera').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], { duration: sure * 1.2 * hiz(), easing: 'ease-out', fill: 'forwards' });
    }
    $('#top-golge').animate([
      { left: '50%', top: '97.6%', width: '5.6%', opacity: 1 },
      { left: h.x + '%', top: (KALE.alt + 1) + '%', width: '2.4%', opacity: 0.35 }
    ], { duration: sure * hiz(), easing: egri, fill: 'forwards' });
    return ucus;
  }

  function agKabart(h) {
    const kap = $('#ag-katman');
    const r = $('#kamera').getBoundingClientRect();
    const p = document.createElement('div');
    p.className = 'ag-parca';
    const w = r.width * 0.18;
    p.style.left = h.x + '%';
    p.style.top = h.y + '%';
    p.style.backgroundSize = r.width + 'px ' + r.height + 'px';
    p.style.backgroundPosition = (w / 2 - h.x / 100 * r.width) + 'px ' + (w / 2 - h.y / 100 * r.height) + 'px';
    kap.appendChild(p);
    p.animate([
      { transform: 'translate(-50%,-50%) scale(1)', filter: 'brightness(1)' },
      { transform: 'translate(-50%,-47%) scale(1.22)', filter: 'brightness(1.25)', offset: 0.25 },
      { transform: 'translate(-50%,-50%) scale(1)', filter: 'brightness(1)' }
    ], { duration: 900 * hiz(), easing: 'ease-out' });
  }
  function kameraSars(guc) {
    if (K.ayarlar.hareketAz) return;
    const g = guc || 1;
    $('#kamera').animate([
      { transform: 'scale(1.06) translate(0,0)' }, { transform: 'scale(1.06) translate(' + 0.6 * g + '%,' + -0.4 * g + '%)' },
      { transform: 'scale(1.06) translate(' + -0.5 * g + '%,' + 0.3 * g + '%)' }, { transform: 'scale(1.06) translate(' + 0.3 * g + '%,0)' },
      { transform: 'scale(1.06) translate(0,0)' }
    ], { duration: 320, fill: 'forwards' });
  }
  function flasPatla() {
    $('#flas').animate([{ opacity: 0 }, { opacity: 0.55 }, { opacity: 0 }], { duration: 380 });
  }

  /* klipli sut sahnesi. Donus: sonucun goruldugu an (top agda ya da kalecinin elinde) */
  async function klipliVurus(hedefI, dogru, sureDoldu) {
    const h = bolgeMerkezi(hedefI);
    const g = KLIP.golcu;
    const kalecinin = KLIP.kaleci;
    let tur, ayna;
    if (sureDoldu) { tur = 'orta'; ayna = false; }
    else if (dogru) { tur = 'bos'; ayna = h.x < 47 ? true : h.x > 53 ? false : Math.random() < 0.5; }
    else if (h.x < 45) { tur = 'tut'; ayna = false; }
    else if (h.x > 55) { tur = 'tut'; ayna = true; }
    else { tur = 'orta'; ayna = false; }
    const kk = kalecinin[tur];
    const m = kk.meta;
    const rk = 1.25 / hiz();                       /* kaleci klibi hizi */
    const rs = (g ? g.meta.hiz : 1) / hiz();       /* golcu klibi hizi */
    const golcuVar = !sureDoldu && golcuKlipHazir();
    /* kalecinin vurustan ne kadar once harekete gececegi (golcu klibi saniyesi cinsinden):
       yakalamada klipteki top tam vurus aninda kadraja girsin; golde kaleci vurusla birlikte ucsun */
    const onceSn = tur === 'bos' ? 0.08 : ((m.giris - m.bas) / rk) * (golcuVar ? rs : 1);

    const kaleciBaslat = () => {
      kk.tuval.classList.remove('salin');
      kaleciKlipKonumla(kk, ayna);
      kk.oynat(m.bas, m.son, rk).catch(() => {});
      /* yeni klip ilk karesini cizince bekleme klibini gizle */
      setTimeout(() => Object.entries(kalecinin).forEach(([t, k]) => { if (t !== tur) k.gizle(); }), 60);
    };

    if (golcuVar) {
      g.oynat(g.meta.bas, g.meta.son, rs);
      /* zamanlama golcu videosunun kendi saatine bagli: video yavas oynasa da kayma olmaz */
      await g.zamanaKadar(Math.max(g.meta.bas, g.meta.temas - onceSn), 3000);
      kaleciBaslat();
      await g.zamanaKadar(g.meta.temas, 3000);
    } else {
      if (!sureDoldu) canlandir($('#golcu'), [{ transform: 'none' }, { transform: 'translate(18%, -4%) rotate(4deg)' }, { transform: 'translate(30%, -6%) rotate(-6deg)' }], 260);
      kaleciBaslat();
      await bekle(sureDoldu ? 0 : Math.max(0, 280 * hiz() - onceSn * 1000));
    }
    if (!sureDoldu) S.vurus();
    if (tur === 'bos') {
      await topUcur(h, 560, false);
      return { h };
    }
    /* kurtaris: oyundaki top kaybolur, klipteki top kaleciye gelir */
    $('#top').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' });
    $('#top-golge').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' });
    if (!K.ayarlar.hareketAz) $('#kamera').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.05)' }], { duration: 700, easing: 'ease-out', fill: 'forwards' });
    await kk.zamanaKadar(m.tut, 3500);
    return { h };
  }

  function bolgeleriCiz(soru) {
    const b = $('#bolgeler');
    b.className = 'bolgeler d' + soru.duzen;
    const tuslar = soru.duzen === 2 ? ['← veya 1', '→ veya 2'] : soru.duzen === 3 ? ['1', '2', '3'] : ['Q veya 1', 'W veya 2', 'A veya 3', 'S veya 4'];
    b.innerHTML = soru.secenekler.map((o, k) =>
      `<button class="bolge" type="button" data-i="${k}" aria-label="${kacis(o.yazi)}"><span class="plaka">${kacis(o.yazi)}<small>${tuslar[k]}</small></span></button>`).join('');
  }

  function pozisyon() {
    if (!MAC) return;
    if (MAC.adet === 10 && MAC.i === 5 && !MAC.devre && MAC.ayar.mod !== 'penalti') { devreArasi(); return; }
    const p = MAC.plan[MAC.i];
    const soru = M.soruUret(p.b, p.n);
    MAC.soru = soru;
    MAC.yardim = false;
    MAC.bekliyor = false;
    MAC.duraklamaSure = 0;
    sahneSifirla();
    tabela();
    $('#soru').textContent = soru.soru;
    const ty = $('#top-yazi');
    ty.textContent = soru.top;
    ty.className = soru.top.length > 4 ? 'uzun' : '';
    bolgeleriCiz(soru);
    $('#b-joker').disabled = !MAC.joker;
    const sr = $('#sure');
    sr.hidden = !sureVar();
    sr.querySelector('i').style.transform = 'scaleX(1)';
    sr.classList.remove('az');
    spiker(p.ipucu ? 'İlk şut: 7 asal mı? Parlayan köşeye vur!' : p.tekrar ? 'Tanıdık bir top geri geldi: ' + soru.top + '. Bu sefer kaçırma!' : sec(SPIKER.hazir));
    setTimeout(() => {
      if (!MAC || MAC.soru !== soru) return;
      MAC.bekliyor = true;
      MAC.t0 = performance.now();
      if (p.ipucu) document.querySelector('.bolge[data-i="' + soru.dogruIndex + '"]').classList.add('ipucu');
      sureBaslat();
    }, 450 * hiz());
  }

  const sureVar = () => !!(MAC && MAC.sure && MAC.sure[MAC.plan[MAC.i].b]);
  function sureLimiti() { return MAC.sure[MAC.plan[MAC.i].b] * (K.ayarlar.sureCarpani || 1); }
  function sureBaslat() {
    cancelAnimationFrame(zamanlayici);
    if (!sureVar()) return;
    const limit = sureLimiti();
    let sonTik = -1;
    const cubuk = $('#sure');
    const dongu = () => {
      if (!MAC || !MAC.bekliyor) return;
      if (MAC.duraklatildi) { zamanlayici = requestAnimationFrame(dongu); return; }
      const gecen = (performance.now() - MAC.t0) / 1000 - MAC.duraklamaSure;
      const kalan = Math.max(0, limit - gecen);
      cubuk.querySelector('i').style.transform = 'scaleX(' + (kalan / limit) + ')';
      cubuk.classList.toggle('az', kalan < 3);
      const tam = Math.ceil(kalan);
      if (kalan < 3 && tam !== sonTik && kalan > 0) { sonTik = tam; S.tik(); }
      if (kalan <= 0) { sut(-1); return; }
      zamanlayici = requestAnimationFrame(dongu);
    };
    zamanlayici = requestAnimationFrame(dongu);
  }
  function duraklat(evet) {
    if (!MAC) return;
    if (evet && !MAC.duraklatildi) { MAC.duraklatildi = true; MAC.durakBas = performance.now(); }
    if (!evet && MAC.duraklatildi) { MAC.duraklatildi = false; MAC.duraklamaSure += (performance.now() - MAC.durakBas) / 1000; }
  }

  /* bolgenin sahnedeki merkezi (yuzde) */
  function bolgeMerkezi(i) {
    const kutu = $('#kamera').getBoundingClientRect();
    if (!kutu.width || !kutu.height) return { x: 50, y: (KALE.ust + KALE.alt) / 2 };
    if (i < 0) return { x: 50, y: (KALE.ust + KALE.alt) / 2 + 6 };
    const r = document.querySelector('.bolge[data-i="' + i + '"]').getBoundingClientRect();
    return { x: ((r.left + r.width / 2) - kutu.left) / kutu.width * 100, y: ((r.top + r.height / 2) - kutu.top) / kutu.height * 100 };
  }

  function canlandir(el, kareler, sure, yumusak) {
    const a = el.animate(kareler, { duration: sure * hiz(), easing: yumusak || 'ease-out', fill: 'forwards' });
    return a.finished.catch(() => {});
  }

  async function vurusCanlandir(hedefI, kaleciI, sureDoldu) {
    const top = $('#top');
    const golcu = $('#golcu');
    const kk = $('#kaleci-kap');
    kk.classList.remove('salin');
    const h = bolgeMerkezi(hedefI);
    if (!sureDoldu && golcuKlipHazir()) {
      const g = KLIP.golcu;
      g.oynat(g.meta.bas, g.meta.son, g.meta.hiz / hiz());
      await g.zamanaKadar(g.meta.temas, 3000);
      S.vurus();
    } else if (!sureDoldu) {
      await canlandir(golcu, [{ transform: 'none' }, { transform: 'translate(18%, -4%) rotate(4deg)' }, { transform: 'translate(30%, -6%) rotate(-6deg)' }], 260);
      S.vurus();
    }
    void top;
    const ucus = topUcur(h, sureDoldu ? 1100 : 620, sureDoldu);
    golcu.animate([{ transform: 'translate(30%, -6%) rotate(-6deg)' }, { transform: 'none' }], { duration: 500 * hiz(), delay: 200, fill: 'forwards' });

    /* kaleci dalisi */
    const kh = kaleciI === null ? { x: 50, y: 60 } : bolgeMerkezi(kaleciI);
    const kutu = $('#kamera').getBoundingClientRect();
    const dx = (kh.x - 50) / 100 * kutu.width * 0.92;
    const ustteMi = kh.y < (KALE.ust + KALE.alt) / 2 - 2;
    const dy = ustteMi ? -kutu.height * 0.08 : kutu.height * 0.015;
    let aci = 0;
    if (Math.abs(kh.x - 50) > 6) aci = (kh.x < 50 ? -1 : 1) * (ustteMi ? 55 : 78);
    const son = 'translate(calc(-50% + ' + dx + 'px), calc(-100% + ' + dy + 'px)) rotate(' + aci + 'deg)' + (aci === 0 && !ustteMi ? ' scaleY(0.85)' : '');
    await bekle((sureDoldu ? 380 : 120) * hiz());
    const dalis = canlandir(kk, [{ transform: 'translate(-50%,-100%)' }, { transform: son }], sureDoldu ? 500 : 430, 'cubic-bezier(.3,.6,.4,1)');
    await Promise.all([ucus, dalis]);
  }

  function konfeti() {
    if (K.ayarlar.hareketAz) return;
    const cv = $('#konfeti');
    const r = cv.getBoundingClientRect();
    cv.width = r.width; cv.height = r.height;
    const g = cv.getContext('2d');
    const renk = ['#ffc93c', '#ff4d5e', '#2fd27a', '#4cc9f0', '#ffffff', '#9b5de5'];
    const p = Array.from({ length: 140 }, () => ({
      x: r.width * (0.3 + Math.random() * 0.4), y: r.height * 0.45,
      vx: (Math.random() - 0.5) * r.width * 0.018, vy: -Math.random() * r.height * 0.03 - r.height * 0.008,
      a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 8, h: 4 + Math.random() * 5, c: renk[Math.floor(Math.random() * renk.length)]
    }));
    const bas = performance.now();
    const ciz = t => {
      const gecen = t - bas;
      g.clearRect(0, 0, cv.width, cv.height);
      p.forEach(q => {
        q.x += q.vx; q.y += q.vy; q.vy += r.height * 0.0009; q.vx *= 0.99; q.a += q.va;
        g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.fillStyle = q.c; g.globalAlpha = Math.max(0, 1 - gecen / 1900);
        g.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); g.restore();
      });
      if (gecen < 1900) requestAnimationFrame(ciz); else g.clearRect(0, 0, cv.width, cv.height);
    };
    requestAnimationFrame(ciz);
  }

  function buyukYazi(metin, kurtaris) {
    const b = $('#buyuk-yazi');
    b.textContent = metin;
    b.className = 'buyuk-yazi';
    void b.offsetWidth;
    b.className = 'buyuk-yazi goster' + (kurtaris ? ' kurtaris' : '');
  }
  function ayrilisGoster(metin) {
    const a = $('#ayrilis');
    a.textContent = metin;
    a.className = 'ayrilis-tabela';
    void a.offsetWidth;
    a.className = 'ayrilis-tabela goster';
  }

  /* ---------- sut ---------- */
  async function sut(i) {
    if (!MAC || !MAC.bekliyor || MAC.duraklatildi) return;
    MAC.bekliyor = false;
    cancelAnimationFrame(zamanlayici);
    const soru = MAC.soru;
    const p = MAC.plan[MAC.i];
    const sureDoldu = i < 0;
    const sure = (performance.now() - MAC.t0) / 1000 - MAC.duraklamaSure;
    const dogru = i === soru.dogruIndex;
    M.cevapIsle(K, p.n, p.b, dogru, sure, MAC.yardim || !!p.ipucu, M.bugun());
    const gun = K.gunler[M.bugun()] || (K.gunler[M.bugun()] = { sut: 0, gol: 0, sn: 0 });
    gun.sut++; if (dogru) gun.gol++;
    kaydet();

    document.querySelectorAll('.bolge').forEach(b => b.classList.remove('ipucu', 'nisan'));
    if (!sureDoldu) document.querySelector('.bolge[data-i="' + i + '"]').classList.add('nisan');

    let kaleciI;
    if (dogru) {
      const digerleri = soru.secenekler.map((_, k) => k).filter(k => k !== i);
      kaleciI = digerleri[Math.floor(Math.random() * digerleri.length)];
    } else kaleciI = sureDoldu ? null : i;
    const buMac = MAC;
    const klipli = kaleciKlipHazir();
    let sonuc = null;
    if (klipli) sonuc = await klipliVurus(sureDoldu ? -1 : i, dogru, sureDoldu);
    else await vurusCanlandir(sureDoldu ? -1 : i, kaleciI, sureDoldu);
    if (MAC !== buMac) return;

    if (dogru) {
      const h = sonuc ? sonuc.h : bolgeMerkezi(i);
      agKabart(h);
      kameraSars(1);
      flasPatla();
      const fuze = sure <= M.ALTIN_SURE[p.b] && !MAC.yardim;
      MAC.gol++; MAC.seri++; MAC.enSeri = Math.max(MAC.enSeri, MAC.seri);
      MAC.puan += 100 + (fuze ? 50 : 0) + Math.min(100, 10 * (MAC.seri - 1));
      MAC.dogrular.push(p);
      if (MAC.ayar.mod === 'penalti') MAC.akifSeri.push(true);
      const bolge = document.querySelector('.bolge[data-i="' + i + '"]');
      bolge.classList.add('ag-salla', 'dogru-bolge');
      S.ag(); S.tezahurat(MAC.seri >= 3);
      buyukYazi(MAC.seri === 3 ? 'HAT-TRICK!' : MAC.seri === 5 ? 'MUHTEŞEM!' : fuze ? 'FÜZE GOL!' : 'GOOOL!');
      ayrilisGoster(kisaOzet(soru.ozet));
      konfeti();
      $('#top').style.opacity = '0';
      let s = sec(fuze ? SPIKER.fuze : SPIKER.gol);
      if (M.VERI[p.n].tuzak && p.b === 'B1') s = M.nin(p.n) + ' çalımını yemedi! ' + s;
      if (MAC.seri === 5) s = 'Tribünde dalga var! ' + s;
      spiker(s);
      tabela();
      $('#t-gol').classList.remove('vurgu'); void $('#t-gol').offsetWidth; $('#t-gol').classList.add('vurgu');
      await bekle(1700 * hiz());
      if (MAC === buMac) sonraki();
    } else {
      MAC.kurt++; MAC.seri = 0;
      MAC.yanlislar.push({ n: p.n, b: p.b, ozet: soru.ozet });
      if (MAC.ayar.mod === 'penalti') MAC.akifSeri.push(false);
      if (!sureDoldu) document.querySelector('.bolge[data-i="' + i + '"]').classList.add('yanlis-bolge');
      S.ooo();
      if (sureDoldu) S.duduk(false);
      if (klipli) kameraSars(0.5);
      buyukYazi(sureDoldu ? 'SÜRE DOLDU' : 'KURTARIŞ!', true);
      spiker(sec(sureDoldu ? SPIKER.sure : SPIKER.kurtaris));
      tabela();
      tekrarPlanla(p);
      await bekle((klipli ? 1500 : 1100) * hiz());
      if (MAC === buMac) varGoster(soru, i);
    }
  }

  /* yanlis yapilan soru 3-5 pozisyon sonra tekrar gelir */
  function tekrarPlanla(p) {
    if (['kupa', 'antrenman', 'ozel'].indexOf(MAC.ayar.mod) < 0) return;
    const son = MAC.plan.length - 1;
    if (MAC.i >= son) return;
    let j = Math.min(son, MAC.i + 3 + Math.floor(Math.random() * 3));
    while (j > MAC.i && MAC.plan[j].tekrar) j--;
    if (j <= MAC.i) return;
    MAC.plan[j] = { n: p.n, b: p.b, tekrar: true };
  }

  function varGoster(soru, i) {
    const n = soru.sayi;
    const merdiven = n > 1 ? soru.merdiven.map((r, k) => `<div style="animation-delay:${k * 0.16}s"><span>${r[0]}</span><span>${r[1] || ''}</span></div>`).join('') : '';
    const secilen = i >= 0 ? soru.secenekler[i] : null;
    const dogru = soru.secenekler[soru.dogruIndex];
    const k = $('#katman');
    k.innerHTML = `<div class="kart katman-panel">
      <div class="var-baslik"><span class="var-rozet">VAR</span> İnceleme · ${kacis(String(soru.top))}</div>
      <div class="var-govde">
        ${merdiven ? '<div class="merdiven">' + merdiven + '</div>' : ''}
        <div>
          <div class="var-sonuc">${kacis(soru.ozet)}</div>
          <div class="var-sut">${secilen ? 'Senin şutun: <b>' + kacis(secilen.yazi) + '</b>' : 'Süre doldu, şut çekmedin.'}</div>
          ${secilen && secilen.aciklama ? '<p class="var-aciklama">' + kacis(secilen.aciklama) + '</p>' : ''}
          <div class="var-dogru">Doğrusu: <b>${kacis(dogru.yazi)}</b></div>
          <p class="soluk" style="margin:10px 0 0;font-size:14px">${MAC.ayar.mod === 'penalti' || MAC.ayar.mod === 'isinma' ? '' : 'Bu sayı birkaç şut sonra tekrar gelecek.'}</p>
        </div>
      </div>
      <div class="katman-alt"><button class="buyuk-dugme" id="var-devam" type="button" disabled>Devam</button></div>
    </div>`;
    k.hidden = false;
    const d = $('#var-devam');
    setTimeout(() => { d.disabled = false; d.focus(); }, 1500 * hiz());
    d.onclick = () => { k.hidden = true; sonraki(); };
  }

  async function rakipAtisi() {
    const ihtimal = 0.6 + 0.025 * acikTurlar().length;
    const atti = Math.random() < ihtimal;
    MAC.rakipSeri.push(atti);
    spiker(KISA_AD[MAC.rakip] + ' penaltıda... ' + (atti ? 'gol! Sıra yine sende.' : 'kaçırdı! Fırsat sende.'));
    if (atti) S.tezahurat(false); else S.ooo();
    tabela();
    await bekle(1300 * hiz());
  }
  function penaltiBittiMi() {
    const a = MAC.akifSeri.filter(Boolean).length, r = MAC.rakipSeri.filter(Boolean).length;
    const na = MAC.akifSeri.length, nr = MAC.rakipSeri.length;
    if (na < 5 || nr < 5) {
      if (a + (5 - na) < r) return true;
      if (r + (5 - nr) < a) return true;
      return false;
    }
    return na === nr && a !== r;
  }

  async function sonraki() {
    if (!MAC) return;
    if (MAC.ayar.mod === 'penalti') {
      await rakipAtisi();
      if (!MAC) return;
      MAC.i++;
      if (penaltiBittiMi()) { macBitir(); return; }
      if (MAC.i >= MAC.plan.length) {
        const kul = new Set(MAC.plan.map(x => x.n));
        const ek = M.macPlani(K, MAC.ayar.havuz.filter(x => !kul.has(x.n)), 1);
        MAC.plan.push(ek[0] || MAC.plan[0]);
        spiker('Seri penaltılar! Kim kaçırırsa kaybeder.');
      }
      pozisyon();
      return;
    }
    MAC.i++;
    if (MAC.i >= MAC.plan.length) macBitir();
    else pozisyon();
  }

  function devreArasi() {
    MAC.devre = true;
    sahneSifirla();
    S.duduk(false);
    const ilk = MAC.yanlislar.slice(0, 2);
    const ipucu = ilk.length ? 'İlk yarıda kaçanlar: ' + ilk.map(y => kacis(kisaOzet(y.ozet))).join(' · ') : 'Hiç kaçırmadın. Aynen devam!';
    const k = $('#katman');
    k.innerHTML = `<div class="kart katman-panel" style="text-align:center">
      <div class="var-baslik" style="justify-content:center">Devre arası</div>
      <div class="sonuc-skor">${MAC.gol} - ${MAC.kurt}</div>
      <p class="var-aciklama">${ipucu}</p>
      <div class="taktik-kutu" style="text-align:left"><b>Hoca diyor ki:</b> ${kacis(TAKTIK[MAC.plan[5].b][0])}</div>
      <div class="katman-alt" style="justify-content:center"><button class="buyuk-dugme yesil" id="devre-devam" type="button">İkinci yarıya başla</button></div>
    </div>`;
    k.hidden = false;
    $('#devre-devam').focus();
    $('#devre-devam').onclick = () => { k.hidden = true; S.duduk(false); pozisyon(); };
  }

  function taktikAc(jokerden) {
    if (!MAC || !MAC.soru) return;
    const b = MAC.plan[MAC.i].b;
    const bekliyordu = MAC.bekliyor;
    if (bekliyordu) { MAC.yardim = true; duraklat(true); }
    const bolunme = b === 'B1' ? `<div class="bolunme-tablo">
        <div><b>2</b>son basamak çift</div><div><b>3</b>rakamlar toplamı 3'ün katı</div>
        <div><b>5</b>son basamak 0 veya 5</div><div><b>7</b>49, 77, 91, 119</div></div>` : '';
    const k = $('#katman');
    k.innerHTML = `<div class="kart katman-panel">
      <div class="var-baslik">${jokerden ? 'Hoca taktiği' : 'Taktik tahtası'} · ${M.BECERILER[b].ad}</div>
      ${bolunme}
      <ul class="taktik-liste">${TAKTIK[b].map(x => '<li>' + kacis(x) + '</li>').join('')}</ul>
      ${bekliyordu ? '<p class="soluk" style="font-size:14px">Bu şut yardımlı sayılır: gol olur ama albümde seviye atlatmaz.</p>' : ''}
      <div class="katman-alt"><button class="buyuk-dugme" id="taktik-kapat" type="button">Sahaya dön</button></div>
    </div>`;
    k.hidden = false;
    $('#taktik-kapat').focus();
    $('#taktik-kapat').onclick = () => { k.hidden = true; duraklat(false); };
  }

  function jokerKullan() {
    if (!MAC || !MAC.joker || !MAC.bekliyor) return;
    MAC.joker = false;
    MAC.yardim = true;
    $('#b-joker').classList.add('kullanildi');
    $('#b-joker').disabled = true;
    const soru = MAC.soru;
    if (soru.duzen === 2) { taktikAc(true); return; }
    const yanlis = soru.secenekler.map((_, k) => k).filter(k => k !== soru.dogruIndex);
    M.karistir(yanlis).slice(0, soru.duzen === 4 ? 2 : 1).forEach(k => document.querySelector('.bolge[data-i="' + k + '"]').classList.add('kapali'));
    spiker('Hoca kenardan bağırdı: o köşelere vurma!');
  }

  function duraklatMenusu() {
    if (!MAC || !$('#katman').hidden) return;
    duraklat(true);
    const k = $('#katman');
    k.innerHTML = `<div class="kart katman-panel" style="text-align:center">
      <div class="var-baslik" style="justify-content:center">Mola</div>
      <p>Skor: ${MAC.gol} - ${MAC.kurt}</p>
      <div class="katman-alt" style="justify-content:center">
        <button class="buyuk-dugme ikincil" id="d-cik" type="button">Maçtan çık</button>
        <button class="buyuk-dugme yesil" id="d-devam" type="button">Devam et</button>
      </div></div>`;
    k.hidden = false;
    $('#d-devam').focus();
    $('#d-devam').onclick = () => { k.hidden = true; duraklat(false); };
    $('#d-cik').onclick = () => { k.hidden = true; git(MAC && MAC.ayar.mod === 'kupa' ? 'harita' : 'menu'); };
  }

  function macTemizle() {
    cancelAnimationFrame(zamanlayici);
    S.ugultuDur();
    if ('speechSynthesis' in window) try { speechSynthesis.cancel(); } catch (e) { /* yok */ }
    if (MAC) {
      const gun = K.gunler[M.bugun()];
      if (gun) gun.sn = (gun.sn || 0) + Math.round((Date.now() - MAC.basla) / 1000);
      kaydet();
    }
    MAC = null;
    $('#katman').hidden = true;
  }

  function macBitir() {
    const m = MAC;
    S.duduk(true);
    const sonucVeri = { m };
    if (m.ayar.mod === 'kupa') {
      const yildiz = m.gol >= 10 ? 3 : m.gol >= 8 ? 2 : m.gol >= 7 ? 1 : 0;
      const eski = K.kupa[m.ayar.tur] || { yildiz: 0, enIyi: 0 };
      sonucVeri.yildiz = yildiz;
      sonucVeri.ilkKez = yildiz >= 1 && eski.yildiz === 0;
      K.kupa[m.ayar.tur] = { yildiz: Math.max(eski.yildiz, yildiz), enIyi: Math.max(eski.enIyi, m.gol) };
      if (sonucVeri.ilkKez) {
        const odul = TOPLAR.find(t => t.tur === m.ayar.tur);
        if (odul && K.oduller.indexOf(odul.id) < 0) { K.oduller.push(odul.id); sonucVeri.odul = odul; }
      }
    }
    if (m.ayar.mod === 'isinma') K.isinma = true;
    sonucVeri.rekor = m.puan > K.rekor;
    K.rekor = Math.max(K.rekor, m.puan);
    const kartlar = [];
    for (let n = 1; n <= 120; n++) if (M.kartSeviyesi(K, n) > m.once[n]) kartlar.push(n);
    sonucVeri.kartlar = kartlar;
    kaydet();
    git('macsonu', sonucVeri);
  }

  /* ---------- mac sonu ---------- */
  CIZ.macsonu = function (v) {
    if (!v || !v.m) { git('menu'); return; }
    const m = v.m;
    let baslik, alt = '', yildizHtml = '', sonrakiDugme = '';
    if (m.ayar.mod === 'kupa') {
      const t = M.KUPA[m.ayar.tur - 1];
      baslik = v.yildiz ? (m.ayar.tur === 8 ? 'LGS KUPASI SENİN!' : 'Tur geçildi!') : 'Bu sefer olmadı';
      alt = v.yildiz ? t.kaleci + ' yenildi.' : 'Geçmek için en az 7 gol gerekiyor. Tekrar dene, bu sefer olacak.';
      yildizHtml = '<div class="sonuc-yildiz">' + [0, 1, 2].map(k => '<span class="' + (k < v.yildiz ? 'dolu' : '') + '" style="animation-delay:' + (0.3 + k * 0.35) + 's">★</span>').join('') + '</div>';
      if (v.yildiz && m.ayar.tur < 8) sonrakiDugme = `<button class="buyuk-dugme yesil" data-git="maconcesi" data-veri="${m.ayar.tur + 1}" type="button">Sıradaki maç</button>`;
    } else if (m.ayar.mod === 'penalti') {
      const a = m.akifSeri.filter(Boolean).length, r = m.rakipSeri.filter(Boolean).length;
      baslik = a > r ? 'Penaltılarda kazandın!' : 'Penaltılarda kaybettin';
      alt = 'Skor ' + a + ' - ' + r + ' · Rakip: ' + M.KUPA[m.rakip - 1].kaleci;
    } else if (m.ayar.mod === 'isinma') {
      baslik = 'Isındın, hazırsın!';
      alt = 'Şimdi kupa yoluna çık. İlk rakibin Uykucu Umut.';
    } else {
      baslik = m.baslik + ' bitti';
      alt = m.gol + ' doğru, ' + m.kurt + ' yanlış.';
    }
    const skor = m.ayar.mod === 'penalti' ? m.akifSeri.filter(Boolean).length + ' - ' + m.rakipSeri.filter(Boolean).length : m.gol + ' - ' + m.kurt;
    const zor = [];
    const gorulen = new Set();
    m.yanlislar.forEach(y => { const k = y.n + y.b; if (!gorulen.has(k)) { gorulen.add(k); zor.push(y); } });
    $('#ekran-macsonu').innerHTML = `
      <div class="arka-stadyum"></div>
      <div class="icerik">
        <div class="kart sonuc-ust">
          ${v.yildiz && m.ayar.tur === 8 ? '<img src="gorseller/kupa.png" alt="" style="width:140px;filter:drop-shadow(0 0 30px rgba(255,201,60,.7))">' : ''}
          <h2>${baslik}</h2>
          <div class="sonuc-skor">${kacis(buyukHarf(ad()))} ${skor} ${KISA_AD[m.rakip]}</div>
          ${yildizHtml}
          <p>${alt}</p>
          <p class="soluk">${m.puan} puan${v.rekor ? ' · Yeni rekor!' : ''} · En uzun seri ${m.enSeri}</p>
        </div>
        <div class="sonuc-izgara">
          <div class="kart">
            <h3 style="margin-top:0">Zorlandığın sayılar</h3>
            ${zor.length ? '<div class="cip-liste">' + zor.map(y => '<span class="cip kirmizi">' + kacis(kisaOzet(y.ozet)) + '</span>').join('') + '</div><p class="soluk" style="font-size:14px">Bunlar sonraki maçlarda daha sık gelecek.</p>' : '<p>Hiç kaçırmadın. Harika!</p>'}
          </div>
          <div class="kart">
            <h3 style="margin-top:0">Albüm</h3>
            ${v.kartlar.length ? '<p>Seviye atlayan kartlar:</p><div class="cip-liste">' + v.kartlar.map(n => '<span class="cip yesil">' + n + '</span>').join('') + '</div>' : '<p class="soluk">Bu maçta seviye atlayan kart yok. Kart altın olmak için başka bir günde de doğru bilinmeli.</p>'}
            ${v.odul ? `<div class="odul" style="margin-top:14px"><img src="gorseller/top.png" style="filter:${v.odul.filtre}" class="${v.odul.sinif || ''}" alt=""><div><b>Yeni top kazandın: ${v.odul.ad} topu</b><br><button class="kucuk-dugme" id="odul-kullan" type="button">Hemen kullan</button></div></div>` : ''}
          </div>
        </div>
        <div class="dugmeler">
          ${m.ayar.mod === 'isinma' ? '<button class="buyuk-dugme yesil" data-git="harita" type="button">Kupa yoluna çık</button>' : `<button class="buyuk-dugme ikincil" id="s-tekrar" type="button">Tekrar oyna</button>`}
          ${sonrakiDugme}
          ${m.ayar.mod === 'kupa' ? '<button class="buyuk-dugme ikincil" data-git="harita" type="button">Kupa yolu</button>' : ''}
          <button class="buyuk-dugme ikincil" data-git="menu" type="button">Ana menü</button>
        </div>
      </div>`;
    if (v.yildiz) setTimeout(() => { for (let k = 0; k < v.yildiz; k++) setTimeout(() => S.yildiz(k), 350 * k); if (m.ayar.tur === 8) S.kupa(); }, 300);
    const t = $('#s-tekrar');
    if (t) t.onclick = () => macBaslat(m.ayar.mod === 'antrenman' ? m.ayar : { mod: m.ayar.mod, tur: m.ayar.tur });
    const o = $('#odul-kullan');
    if (o) o.onclick = () => { K.secili.top = v.odul.id; kaydet(); o.textContent = 'Seçildi'; o.disabled = true; };
  };

  /* ---------- album ---------- */
  CIZ.album = function () {
    const al = albumSayim();
    const kartlar = [];
    for (let n = 1; n <= 120; n++) {
      const s = M.kartSeviyesi(K, n);
      const v = M.VERI[n];
      const goruldu = Object.keys(K.ciftler).some(a => a.startsWith(n + '|'));
      const alt = s >= 1 || goruldu ? (n === 1 ? 'özel' : v.asal ? 'asal' : v.yazi) : '?';
      kartlar.push(`<button class="album-kart s${s}" data-n="${n}" type="button">${s >= 1 && v.asal ? '<span class="asal-isaret">A</span>' : ''}<span class="s">${n}</span><span class="a">${alt}</span></button>`);
    }
    $('#ekran-album').innerHTML = `
      <div class="arka-stadyum"></div>
      <div class="icerik">
        <div class="ust-cubuk"><button class="geri" data-git="menu" type="button">← Menü</button><h2>Sayı albümü</h2></div>
        <div class="album-ozet">
          <span class="rozet" style="background:linear-gradient(160deg,#ffe58a,#d49b00);color:#3b2500">${al[3]} altın</span>
          <span class="rozet" style="background:#dfe6f3;color:#1a2340">${al[2]} gümüş</span>
          <span class="rozet" style="background:#b87440">${al[1]} bronz</span>
          <span class="rozet">${al[0]} yeni</span>
        </div>
        <div class="album">${kartlar.join('')}</div>
        <div class="lejant"><span><i style="background:#26325f"></i>Yeni</span><span><i style="background:#c27a3f"></i>Bronz: bir kez bildin</span><span><i style="background:#c9d3e6"></i>Gümüş: iki kez bildin</span><span><i style="background:#ffc93c"></i>Altın: başka bir günde de bildin</span><span>A: asal sayı</span></div>
      </div>`;
    $('#ekran-album .album').onclick = e => { const k = e.target.closest('[data-n]'); if (k) kimlikGoster(Number(k.dataset.n)); };
  };
  function kimlikGoster(n) {
    const v = M.VERI[n];
    const sev = ['Yeni', 'Bronz', 'Gümüş', 'Altın'];
    const satirlar = ['B1', 'B2', 'B3', 'B3T', 'B4', 'B5', 'B6'].filter(b => M.uygunMu(n, b)).map(b => {
      const c = M.cift(K, n, b);
      return `<tr><td>${M.BECERILER[b].ad}</td><td>${c ? c.d + ' / ' + (c.d + c.y) : '-'}</td><td>${sev[c ? c.s : 0]}</td></tr>`;
    }).join('');
    const merdiven = n > 1 ? '<div class="merdiven" style="display:inline-block">' + M.merdiven(n).map(r => `<div style="opacity:1;animation:none"><span>${r[0]}</span><span>${r[1] || ''}</span></div>`).join('') + '</div>' : '';
    modalAc(`
      <div class="kimlik-ust"><div class="kimlik-no">${n}</div><div>
        <div style="font-size:20px;font-weight:800">${n === 1 ? 'Ne asal ne bileşik' : v.asal ? 'Asal sayı' : 'Bileşik sayı'}${v.tuzak ? ' <span class="rozet" style="background:#ff4d5e">tuzak</span>' : ''}</div>
        ${n > 1 ? '<div class="var-sonuc" style="margin:4px 0 0">' + n + ' = ' + v.yazi + '</div>' : ''}
        ${n > 1 ? '<div class="soluk">' + v.farkli + ' farklı asal çarpan · en büyüğü ' + v.enBuyuk + '</div>' : ''}
      </div></div>
      <div style="display:flex;gap:18px;align-items:flex-start;margin-top:14px;flex-wrap:wrap">${merdiven}
        <table class="tablo" style="flex:1;min-width:240px"><tr><th>Beceri</th><th>Doğru</th><th>Seviye</th></tr>${satirlar}</table></div>
      <div class="katman-alt"><button class="buyuk-dugme" data-kapat type="button">Kapat</button></div>`);
  }

  /* ---------- antrenman ---------- */
  CIZ.antrenman = function () {
    const secili = new Set(['B1']);
    const kartlar = Object.keys(M.BECERILER).map(b => `<button class="secim ${secili.has(b) ? 'secili' : ''}" data-b="${b}" type="button"><b>${M.BECERILER[b].ad}</b><span>${{ B1: '19 → asal', B2: '84 → 3', B3: '81 → 3⁴', B3T: '3⁴ → 81', B4: '96 → 2⁵ · 3', B5: '2³ · 3 · 5 → 120', B6: '84 → 7' }[b]}</span></button>`).join('');
    $('#ekran-antrenman').innerHTML = `
      <div class="arka-stadyum"></div>
      <div class="icerik">
        <div class="ust-cubuk"><button class="geri" data-git="menu" type="button">← Menü</button><h2>Antrenman</h2></div>
        <div class="kart">
          <p style="margin-top:0">Süre yok, yıldız yok. Taktik tahtası her zaman açık. Ne çalışmak istiyorsun?</p>
          <div class="secim-izgara" id="a-beceri">${kartlar}</div>
          <div class="satir-alan">
            <label class="alan">En küçük sayı <input id="a-alt" type="number" min="1" max="120" value="1"></label>
            <label class="alan">En büyük sayı <input id="a-ust" type="number" min="1" max="120" value="120"></label>
          </div>
          <div class="hata" id="a-hata"></div>
          <div class="dugmeler" style="justify-content:flex-start">
            <button class="buyuk-dugme yesil" id="a-basla" type="button">Antrenmana başla</button>
            <button class="buyuk-dugme ikincil" id="a-ozel" type="button">Zayıf sayılarımı çalış</button>
          </div>
        </div>
      </div>`;
    $('#a-beceri').onclick = e => {
      const b = e.target.closest('[data-b]'); if (!b) return;
      if (secili.has(b.dataset.b)) secili.delete(b.dataset.b); else secili.add(b.dataset.b);
      b.classList.toggle('secili', secili.has(b.dataset.b));
      $('#a-hata').textContent = '';
    };
    $('#a-basla').onclick = () => {
      const a = Number($('#a-alt').value), u = Number($('#a-ust').value);
      if (!secili.size) { $('#a-hata').textContent = 'En az bir beceri seç.'; return; }
      if (!(a >= 1 && u <= 120 && a <= u)) { $('#a-hata').textContent = 'Sayı aralığı 1 ile 120 arasında olmalı.'; return; }
      const havuz = [];
      secili.forEach(b => { for (let n = a; n <= u; n++) if (M.uygunMu(n, b)) havuz.push({ n, b }); });
      if (havuz.length < 10) { $('#a-hata').textContent = 'Bu aralıkta yeterli soru yok. Aralığı genişlet ya da başka beceri ekle.'; return; }
      S.uyandir();
      macBaslat({ mod: 'antrenman', havuz });
    };
    $('#a-ozel').onclick = () => { S.uyandir(); macBaslat({ mod: 'ozel' }); };
  };

  /* ---------- hoca kosesi ---------- */
  let hocaAcik = false;
  CIZ.hoca = function () {
    const kap = $('#ekran-hoca');
    if (!hocaAcik) {
      kap.innerHTML = `<div class="arka-stadyum"></div><div class="icerik">
        <div class="ust-cubuk"><button class="geri" data-git="menu" type="button">← Menü</button><h2>Hoca köşesi</h2></div>
        <div class="kart" style="max-width:420px">
          <p style="margin-top:0">Hoca girişi: <b>7 · 13</b> kaç eder?</p>
          <label class="alan"><input id="h-kilit" type="number" autocomplete="off"></label>
          <div class="hata" id="h-hata"></div>
          <button class="buyuk-dugme" id="h-gir" type="button">Gir</button>
        </div></div>`;
      const gir = () => { if ($('#h-kilit').value.trim() === '91') { hocaAcik = true; CIZ.hoca(); } else $('#h-hata').textContent = 'Yanlış. İpucu: bu sayı asal görünür ama değildir.'; };
      $('#h-gir').onclick = gir;
      $('#h-kilit').addEventListener('keydown', e => { $('#h-hata').textContent = ''; if (e.key === 'Enter') gir(); });
      return;
    }
    const becSatir = Object.keys(M.BECERILER).map(b => {
      let d = 0, y = 0, t = 0, tn = 0, alt = 0;
      Object.keys(K.ciftler).forEach(a => {
        if (a.split('|')[1] !== b) return;
        const c = K.ciftler[a];
        d += c.d; y += c.y; c.t.forEach(x => { t += x; tn++; }); if (c.s === 3) alt++;
      });
      const oran = d + y ? Math.round(d / (d + y) * 100) + '%' : '-';
      return `<tr><td>${M.BECERILER[b].ad}</td><td>${d + y}</td><td>${oran}</td><td>${tn ? (t / tn).toFixed(1) + ' sn' : '-'}</td><td>${alt}</td></tr>`;
    }).join('');
    const zayif = M.zayiflar(K, 10).map(x => `<tr><td><b>${x.n}</b></td><td>${M.BECERILER[x.b].kisa}</td><td>${x.d} / ${x.d + x.y}</td><td>${kacis(M.VERI[x.n].yazi)}</td></tr>`).join('') || '<tr><td colspan="4" class="soluk">Henüz veri yok.</td></tr>';
    const yavas = M.yavaslar(K, 10).map(x => `<tr><td><b>${x.n}</b></td><td>${M.BECERILER[x.b].kisa}</td><td>${x.ort.toFixed(1)} sn</td></tr>`).join('') || '<tr><td colspan="3" class="soluk">Henüz veri yok.</td></tr>';
    const al = albumSayim();
    const gunler = [];
    for (let k = 13; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); const g = K.gunler[M.bugun(d)]; gunler.push({ et: d.getDate() + '.' + (d.getMonth() + 1), sut: g ? g.sut : 0, dk: g ? Math.round((g.sn || 0) / 60) : 0 }); }
    const maxSut = Math.max(10, ...gunler.map(g => g.sut));
    const A = K.ayarlar;
    kap.innerHTML = `<div class="arka-stadyum"></div><div class="icerik">
      <div class="ust-cubuk"><button class="geri" data-git="menu" type="button">← Menü</button><h2>Hoca köşesi · ${kacis(ad())}</h2></div>
      <div class="iki-sutun">
        <div class="kart"><h3 style="margin-top:0">Beceriler</h3>
          <table class="tablo"><tr><th>Beceri</th><th>Şut</th><th>Doğru</th><th>Ort. süre</th><th>Altın</th></tr>${becSatir}</table></div>
        <div class="kart"><h3 style="margin-top:0">Albüm ve çalışma</h3>
          <p>${al[3]} altın · ${al[2]} gümüş · ${al[1]} bronz · ${al[0]} yeni · Günlük seri ${gunlukSeri()} gün</p>
          <div class="cubuk-grafik">${gunler.map(g => `<div style="height:${g.sut / maxSut * 100}%" title="${g.sut} şut, ${g.dk} dk"><span>${g.et}</span></div>`).join('')}</div>
          <p class="soluk" style="font-size:13px;margin-top:28px">Son 14 günün şut sayısı.</p></div>
        <div class="kart"><h3 style="margin-top:0">En zayıf 10</h3>
          <table class="tablo"><tr><th>Sayı</th><th>Beceri</th><th>Doğru</th><th>Ayrılış</th></tr>${zayif}</table>
          <div class="dugmeler" style="justify-content:flex-start"><button class="buyuk-dugme yesil" id="h-ozel" type="button">Zayıf sayılardan maç kur</button></div></div>
        <div class="kart"><h3 style="margin-top:0">En yavaş 10</h3>
          <table class="tablo"><tr><th>Sayı</th><th>Beceri</th><th>Ortalama</th></tr>${yavas}</table></div>
        <div class="kart"><h3 style="margin-top:0">Oyun ayarları</h3>
          <div class="anahtar"><span>Şut saati</span><button class="kucuk-dugme ${A.sutSaati ? 'secili' : ''}" id="h-saat" type="button">${A.sutSaati ? 'Açık' : 'Kapalı'}</button></div>
          <div class="anahtar"><span>Süre çarpanı</span><span>${[1, 1.5, 2].map(c => `<button class="kucuk-dugme ${A.sureCarpani === c ? 'secili' : ''}" data-carpan="${c}" type="button">${c}x</button>`).join(' ')}</span></div>
          <div class="satir-alan">
            <label class="alan">Sayı aralığı: en küçük <input id="h-alt" type="number" min="1" max="120" value="${A.aralikAlt}"></label>
            <label class="alan">en büyük <input id="h-ust" type="number" min="1" max="120" value="${A.aralikUst}"></label>
            <button class="kucuk-dugme" id="h-aralik" type="button" style="margin-bottom:12px">Kaydet</button>
          </div><div class="hata" id="h-hata2"></div></div>
        <div class="kart"><h3 style="margin-top:0">İlerleme dosyası</h3>
          <p class="soluk" style="margin-top:0">İlerlemeyi başka bilgisayara taşımak için dışa aktar, orada içe aktar.</p>
          <div class="dugmeler" style="justify-content:flex-start;margin-top:8px">
            <button class="kucuk-dugme" id="h-disa" type="button">Dışa aktar</button>
            <label class="kucuk-dugme" style="cursor:pointer">İçe aktar<input id="h-ice" type="file" accept=".json,application/json" hidden></label>
            <button class="kucuk-dugme" id="h-kilitle" type="button">Hoca köşesini kilitle</button>
          </div><div class="hata" id="h-hata3"></div></div>
      </div></div>`;
    $('#h-ozel').onclick = () => { S.uyandir(); macBaslat({ mod: 'ozel' }); };
    $('#h-saat').onclick = () => { A.sutSaati = !A.sutSaati; kaydet(); CIZ.hoca(); };
    kap.querySelectorAll('[data-carpan]').forEach(b => b.onclick = () => { A.sureCarpani = Number(b.dataset.carpan); kaydet(); CIZ.hoca(); });
    $('#h-aralik').onclick = () => {
      const a = Number($('#h-alt').value), u = Number($('#h-ust').value);
      if (!(a >= 1 && u <= 120 && u - a >= 9)) { $('#h-hata2').textContent = 'Aralık 1-120 içinde ve en az 10 sayı olmalı.'; return; }
      A.aralikAlt = a; A.aralikUst = u; kaydet(); $('#h-hata2').textContent = 'Kaydedildi.';
    };
    $('#h-disa').onclick = () => {
      const blob = new Blob([JSON.stringify(K, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'asal-golcu-' + (K.oyuncu.ad || 'oyuncu') + '-' + M.bugun() + '.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    $('#h-ice').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const k = JSON.parse(r.result);
          if (!k || k.surum !== 1 || typeof k.ciftler !== 'object') throw new Error('biçim');
          localStorage.setItem(ANAHTAR, JSON.stringify(k));
          K = yukle(); ayarlariUygula(); CIZ.hoca();
        } catch (err) { $('#h-hata3').textContent = 'Bu dosya Asal Golcü ilerleme dosyası değil.'; }
      };
      r.readAsText(f);
    };
    $('#h-kilitle').onclick = () => { hocaAcik = false; git('menu'); };
  };

  /* ---------- ayarlar ---------- */
  CIZ.ayarlar = function () {
    const A = K.ayarlar;
    const anahtar = (id, etiket, deger) => `<div class="anahtar"><span>${etiket}</span><button class="kucuk-dugme ${deger ? 'secili' : ''}" id="${id}" type="button">${deger ? 'Açık' : 'Kapalı'}</button></div>`;
    const toplar = TOPLAR.map(t => {
      const acik = t.tur === 0 || K.oduller.indexOf(t.id) >= 0;
      return `<button class="${K.secili.top === t.id ? 'secili' : ''}" data-top="${t.id}" type="button" ${acik ? '' : 'disabled'}><img src="gorseller/top.png" alt="" style="filter:${t.filtre || 'none'}" class="${t.sinif || ''}">${acik ? t.ad : 'Tur ' + t.tur}</button>`;
    }).join('');
    $('#ekran-ayarlar').innerHTML = `<div class="arka-stadyum"></div><div class="icerik">
      <div class="ust-cubuk"><button class="geri" data-git="menu" type="button">← Menü</button><h2>Ayarlar</h2></div>
      <div class="iki-sutun">
        <div class="kart">
          ${anahtar('y-ses', 'Ses efektleri', A.ses)}
          ${anahtar('y-spiker', 'Sesli spiker (cihazda Türkçe ses varsa)', A.spiker)}
          ${anahtar('y-hareket', 'Hareketi azalt', A.hareketAz)}
          <div class="anahtar"><span>Oyuncu: <b>${kacis(ad())}</b> · Forma ${K.oyuncu.forma}</span><button class="kucuk-dugme" data-git="giris" type="button">Değiştir</button></div>
          <div class="anahtar"><span>Tüm ilerlemeyi sil</span><button class="kucuk-dugme" id="y-sifirla" type="button">Sıfırla</button></div>
        </div>
        <div class="kart"><h3 style="margin-top:0">Topun</h3><p class="soluk" style="margin-top:0">Her kupa turunu ilk kez geçince yeni bir top açılır.</p><div class="top-sec">${toplar}</div></div>
      </div></div>`;
    $('#y-ses').onclick = () => { A.ses = !A.ses; kaydet(); ayarlariUygula(); CIZ.ayarlar(); };
    $('#y-spiker').onclick = () => { A.spiker = !A.spiker; kaydet(); CIZ.ayarlar(); };
    $('#y-hareket').onclick = () => { A.hareketAz = !A.hareketAz; kaydet(); ayarlariUygula(); CIZ.ayarlar(); };
    $('#ekran-ayarlar .top-sec').onclick = e => { const b = e.target.closest('[data-top]'); if (b && !b.disabled) { K.secili.top = b.dataset.top; kaydet(); CIZ.ayarlar(); } };
    $('#y-sifirla').onclick = () => {
      modalAc(`<h3 style="margin-top:0">Her şey silinsin mi?</h3><p>Albüm, yıldızlar, rekor ve hoca raporu silinir. Geri alınamaz.</p>
        <div class="katman-alt"><button class="buyuk-dugme ikincil" data-kapat type="button">Vazgeç</button><button class="buyuk-dugme" id="y-sil" type="button">Evet, sil</button></div>`);
      $('#y-sil').onclick = () => {
        try { localStorage.removeItem(ANAHTAR); } catch (e) { /* depolama kapali */ }
        K = M.yeniKayit(); ayarlariUygula(); modalKapat(); git('giris');
      };
    };
  };

  /* ---------- test ---------- */
  CIZ.test = function () {
    const r = window.AsalTest.calistir();
    $('#ekran-test').innerHTML = `<div class="arka-stadyum"></div><div class="icerik test-sonuc">
      <div class="ust-cubuk"><button class="geri" data-git="menu" type="button">← Menü</button><h2>Otomatik test</h2></div>
      <div class="kart"><h3 style="margin-top:0;color:${r.hatalar.length ? 'var(--kirmizi)' : 'var(--yesil)'}">${r.hatalar.length ? r.hatalar.length + ' hata' : 'Tüm testler geçti'}</h3>
      <pre>${kacis(r.notlar.join('\n'))}${r.hatalar.length ? '\n\n' + kacis(r.hatalar.slice(0, 80).join('\n')) : ''}</pre></div></div>`;
  };

  /* ---------- mac ekrani girdileri ---------- */
  $('#bolgeler').addEventListener('click', e => { const b = e.target.closest('.bolge'); if (b) sut(Number(b.dataset.i)); });
  $('#b-taktik').onclick = () => { if (MAC && $('#katman').hidden) taktikAc(false); };
  $('#b-joker').onclick = () => jokerKullan();
  $('#b-duraklat').onclick = () => duraklatMenusu();
  $('#b-tam-ekran').onclick = () => tamEkranDugme();
  document.addEventListener('fullscreenchange', () => { tamEkranEtiket(); gorselOlcu(); kameraSigdir(); });
  document.addEventListener('webkitfullscreenchange', () => { tamEkranEtiket(); gorselOlcu(); kameraSigdir(); });
  gorselOlcu();
  window.addEventListener('resize', () => { gorselOlcu(); kameraSigdir(); });
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', () => { gorselOlcu(); kameraSigdir(); });
    visualViewport.addEventListener('scroll', gorselOlcu);
  }
  window.addEventListener('orientationchange', () => setTimeout(() => { gorselOlcu(); kameraSigdir(); }, 250));
  if (window.ResizeObserver) new ResizeObserver(() => kameraSigdir()).observe($('#sahne'));

  /* toptan kaydirarak sut */
  let surukle = null;
  $('#top').addEventListener('pointerdown', e => { if (MAC && MAC.bekliyor) { surukle = { x: e.clientX, y: e.clientY }; e.preventDefault(); } });
  window.addEventListener('pointerup', e => {
    if (!surukle || !MAC || !MAC.bekliyor) { surukle = null; return; }
    const dx = e.clientX - surukle.x, dy = e.clientY - surukle.y;
    const bas = surukle; surukle = null;
    if (Math.hypot(dx, dy) < 30 || dy > -10) return;
    const hx = bas.x + dx * 3, hy = bas.y + dy * 3;
    const r = $('#bolgeler').getBoundingClientRect();
    const x = Math.min(r.right - 2, Math.max(r.left + 2, hx));
    const y = Math.min(r.bottom - 2, Math.max(r.top + 2, hy));
    const hedef = [...document.querySelectorAll('.bolge')].find(b => { const q = b.getBoundingClientRect(); return x >= q.left && x <= q.right && y >= q.top && y <= q.bottom && !b.classList.contains('kapali'); });
    if (hedef) sut(Number(hedef.dataset.i));
  });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (!$('#modal').hidden && e.key === 'Escape') { modalKapat(); return; }
    if (aktif !== 'mac' || !MAC) return;
    const k = $('#katman');
    if (!k.hidden) {
      if (e.key === 'Escape') { const b = k.querySelector('#taktik-kapat, #d-devam'); if (b) b.click(); }
      return;
    }
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { duraklatMenusu(); return; }
    if (e.key === 't' || e.key === 'T') { taktikAc(false); return; }
    if (!MAC.bekliyor) return;
    const d = MAC.soru.duzen;
    const t = e.key.toLowerCase();
    let i = -1;
    if (d === 2) i = { arrowleft: 0, '1': 0, arrowright: 1, '2': 1 }[t];
    else if (d === 3) i = { arrowleft: 0, '1': 0, arrowdown: 1, arrowup: 1, '2': 1, arrowright: 2, '3': 2 }[t];
    else i = { q: 0, '1': 0, w: 1, '2': 1, a: 2, '3': 2, s: 3, '4': 3 }[t];
    if (i === undefined || i < 0) return;
    const b = document.querySelector('.bolge[data-i="' + i + '"]');
    if (b && !b.classList.contains('kapali')) { e.preventDefault(); sut(i); }
  });

  /* gorsel bulunamazsa sade yedek */
  const YEDEK = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="22" r="14" fill="#f2c9a0"/><rect x="30" y="38" width="40" height="36" rx="8" fill="#4cc9f0"/><rect x="6" y="40" width="26" height="10" rx="5" fill="#4cc9f0"/><rect x="68" y="40" width="26" height="10" rx="5" fill="#4cc9f0"/><rect x="34" y="74" width="12" height="24" rx="5" fill="#223"/><rect x="54" y="74" width="12" height="24" rx="5" fill="#223"/></svg>');
  $('#kaleci').addEventListener('error', e => { if (!e.target.src.startsWith('data:')) e.target.src = YEDEK; });

  /* ---------- baslat ---------- */
  ayarlariUygula();
  if (/[?&]test=1/.test(location.search)) git('test');
  else if (!K.oyuncu.ad) git('giris');
  else git('menu');
  window.addEventListener('pointerdown', () => S.uyandir(), { once: true });
})();
