/* Asal Golcu - saydam (VP9 alfa) WebM kliplerini sahnede oynatir.
   Yesil fon araclar/klip-hazirla.ps1 ile onceden silinir; burada yalniz konumlama ve zamanlama var.
   Video yuklenemezse hazirMi false kalir; oyun gorsellerle devam eder. */
(function (kok) {
  'use strict';

  class Klip {
    constructor(src, kap) {
      const v = document.createElement('video');
      v.className = 'klip';
      v.muted = true;
      v.playsInline = true;
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
        const son = ok => { if (bitti) return; bitti = true; this.hazirMi = ok; res(ok); };
        v.addEventListener('canplaythrough', () => son(true), { once: true });
        v.addEventListener('error', () => son(false), { once: true });
        setTimeout(() => son(v.readyState >= 3), 12000);
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
      if (!this.hazirMi) return false;
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
      if (!this.hazirMi) return false;
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
