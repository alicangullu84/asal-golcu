/* Asal Golcu - saydam (VP9 alfa) WebM kliplerini sahnede oynatir.
   Yesil fon araclar/klip-hazirla.ps1 ile onceden silinir; burada yalniz konumlama ve zamanlama var.
   Video yuklenemezse hazirMi false kalir; oyun gorsellerle devam eder.
   iPhone / Safari VP9 alfasini birlestirmez: saydam piksel siyaha boyanir ve sahayi kapatir.
   O tarayicilarda klip hazir sayilmaz, oyun PNG animasyona doner. */
(function (kok) {
  'use strict';

  /* iOS (butun tarayicilar WebKit) ve masaustu Safari VP9 alfa birlestirmez. */
  function alfaMotoruYok() {
    const ua = navigator.userAgent || '';
    const iOS = /iP(hone|ad|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (iOS) return true;
    return /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg\/|OPR\/|FxiOS|Android/.test(ua);
  }

  /* Kose saydam, govde renkli ise alfa calisiyor. Kare cizilmediyse null. */
  function videoSaydamMi(video) {
    if (!video.videoWidth) return null;
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 48;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    try {
      ctx.clearRect(0, 0, 48, 48);
      ctx.drawImage(video, 0, 0, 48, 48);
      const d = ctx.getImageData(0, 0, 48, 48).data;
      let seffaf = 0;
      let renk = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 16) seffaf++;
        else if (d[i] > 40 || d[i + 1] > 40 || d[i + 2] > 40) renk++;
      }
      if (renk < 6) return null;
      return seffaf > 12;
    } catch (e) {
      return null;
    }
  }

  function kareyeGit(video, t) {
    if (Math.abs(video.currentTime - t) < 0.03 && video.readyState >= 2) return Promise.resolve();
    return new Promise(res => {
      const bitti = () => { video.removeEventListener('seeked', bitti); res(); };
      video.addEventListener('seeked', bitti);
      try { video.currentTime = t; } catch (e) { bitti(); }
      setTimeout(bitti, 500);
    });
  }

  kok.KlipSaydamDestek = !alfaMotoruYok();

  class Klip {
    constructor(src, kap) {
      const v = document.createElement('video');
      v.className = 'klip';
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.preload = 'auto';
      v.disablePictureInPicture = true;
      v.setAttribute('aria-hidden', 'true');
      v.hidden = true;
      v.src = src;
      kap.appendChild(v);
      this.video = v;
      this.tuval = v;
      this.hazirMi = false;
      this.oynuyor = false;
      this.yuklendi = new Promise(res => {
        let bitti = false;
        const son = ok => {
          if (bitti) return;
          bitti = true;
          this.hazirMi = !!ok && kok.KlipSaydamDestek !== false;
          if (!this.hazirMi) this.gizle();
          res(this.hazirMi);
        };
        const dogrula = async () => {
          if (bitti) return;
          if (kok.KlipSaydamDestek === false) { son(false); return; }
          await kareyeGit(v, 0.12);
          const saydam = videoSaydamMi(v);
          if (saydam === false) {
            kok.KlipSaydamDestek = false;
            kok.dispatchEvent(new Event('klip-saydam-yok'));
            son(false);
            return;
          }
          son(true);
        };
        v.addEventListener('canplaythrough', () => { dogrula(); }, { once: true });
        v.addEventListener('error', () => son(false), { once: true });
        setTimeout(() => {
          if (bitti) return;
          if (v.readyState >= 3) dogrula();
          else son(false);
        }, 12000);
        v.load();
      });
    }

    /* sahnede yuzde cinsinden sol, ust, genislik; ayna: yatay cevir */
    konumla(sol, ust, gen, ayna) {
      const s = this.video.style;
      s.left = sol + '%';
      s.top = ust + '%';
      s.width = gen + '%';
      s.transform = ayna ? 'scaleX(-1)' : '';
    }

    ara(t) {
      const v = this.video;
      if (Math.abs(v.currentTime - t) < 0.02) return Promise.resolve();
      return new Promise(res => {
        const bitti = () => { v.removeEventListener('seeked', bitti); res(); };
        v.addEventListener('seeked', bitti);
        v.currentTime = t;
        setTimeout(bitti, 800);
      });
    }

    /* basla saniyesinden bitis saniyesine kadar oynat; bitince cozulen bir soz doner */
    async oynat(basla, bitis, hiz) {
      if (!this.hazirMi || kok.KlipSaydamDestek === false) return false;
      const v = this.video;
      this.durdur();
      this.oynuyor = true;
      v.playbackRate = hiz || 1;
      await this.ara(basla);
      if (!this.oynuyor) return false;
      v.hidden = false;
      try { await v.play(); } catch (e) { this.oynuyor = false; return false; }
      return new Promise(res => {
        this.bitince = res;
        const kontrol = () => {
          if (!this.oynuyor) return;
          if (v.currentTime >= bitis || v.ended) {
            v.pause();
            this.oynuyor = false;
            const b = this.bitince; this.bitince = null;
            if (b) b(true);
            return;
          }
          this.rafId = requestAnimationFrame(kontrol);
        };
        this.rafId = requestAnimationFrame(kontrol);
      });
    }

    /* video t saniyesine gelene kadar bekle (video yavas oynasa da senkron kalir) */
    zamanaKadar(t, enFazlaMs) {
      const v = this.video;
      return new Promise(res => {
        const bas = performance.now();
        const bak = () => {
          if (v.currentTime >= t || v.ended || (!this.oynuyor && v.paused) || performance.now() - bas > (enFazlaMs || 4000)) { res(); return; }
          requestAnimationFrame(bak);
        };
        bak();
      });
    }

    /* bir kareyi goster (oynatmadan) */
    async kare(t) {
      if (!this.hazirMi || kok.KlipSaydamDestek === false) return false;
      this.durdur();
      await this.ara(t);
      this.video.hidden = false;
      return true;
    }

    durdur() {
      this.oynuyor = false;
      cancelAnimationFrame(this.rafId);
      if (!this.video.paused) this.video.pause();
      if (this.bitince) { const b = this.bitince; this.bitince = null; b(false); }
    }

    gizle() { this.durdur(); this.video.hidden = true; }
  }

  kok.Klip = Klip;
})(window);
