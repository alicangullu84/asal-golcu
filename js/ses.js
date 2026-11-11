/* Asal Golcu - ses efektleri. Dis dosya yok, hepsi Web Audio ile uretilir. */
(function (kok) {
  'use strict';
  let ctx = null;
  let ana = null;
  let acik = true;
  let ugultu = null;
  let gurultuTampon = null;

  function hazir() {
    if (!acik) return null;
    if (!ctx) {
      const AC = kok.AudioContext || kok.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      ana = ctx.createGain();
      ana.gain.value = 0.7;
      ana.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function gurultu() {
    if (!gurultuTampon) {
      const n = ctx.sampleRate * 2;
      gurultuTampon = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = gurultuTampon.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource();
    s.buffer = gurultuTampon;
    s.loop = true;
    return s;
  }
  function zarf(g, t, atak, tepe, surme, birak) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(tepe, t + atak);
    g.gain.setValueAtTime(tepe, t + atak + surme);
    g.gain.exponentialRampToValueAtTime(0.0001, t + atak + surme + birak);
    return t + atak + surme + birak;
  }
  function nota(frek, bas, sure, tur, guc) {
    const c = ctx;
    const o = c.createOscillator();
    o.type = tur || 'sine';
    o.frequency.value = frek;
    const g = c.createGain();
    const bit = zarf(g, bas, 0.01, guc || 0.2, sure, 0.12);
    o.connect(g).connect(ana);
    o.start(bas);
    o.stop(bit + 0.05);
  }
  function filtreliGurultu(bas, tip, frek, q, atak, tepe, surme, birak, frekSon) {
    const c = ctx;
    const s = gurultu();
    const f = c.createBiquadFilter();
    f.type = tip;
    f.frequency.setValueAtTime(frek, bas);
    if (frekSon) f.frequency.exponentialRampToValueAtTime(frekSon, bas + atak + surme + birak);
    f.Q.value = q;
    const g = c.createGain();
    const bit = zarf(g, bas, atak, tepe, surme, birak);
    s.connect(f).connect(g).connect(ana);
    s.start(bas, Math.random());
    s.stop(bit + 0.05);
  }

  const Ses = {
    ayarla(v) { acik = !!v; if (!acik) Ses.ugultuDur(); },
    acikMi() { return acik; },
    uyandir() { hazir(); },

    duduk(uzun) {
      const c = hazir(); if (!c) return;
      const t = c.currentTime;
      const atislar = uzun ? [[0, 0.25], [0.35, 0.25], [0.7, 0.9]] : [[0, 0.16], [0.26, 0.2]];
      atislar.forEach(([d, sure]) => {
        const o = c.createOscillator();
        o.type = 'sine';
        o.frequency.value = 2750;
        const lfo = c.createOscillator();
        lfo.frequency.value = 34;
        const lg = c.createGain();
        lg.gain.value = 140;
        lfo.connect(lg).connect(o.frequency);
        const g = c.createGain();
        const bit = zarf(g, t + d, 0.01, 0.16, sure, 0.04);
        o.connect(g).connect(ana);
        o.start(t + d); lfo.start(t + d);
        o.stop(bit + 0.05); lfo.stop(bit + 0.05);
      });
    },

    vurus() {
      const c = hazir(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(150, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      const g = c.createGain();
      const bit = zarf(g, t, 0.005, 0.9, 0.03, 0.14);
      o.connect(g).connect(ana);
      o.start(t); o.stop(bit + 0.05);
      filtreliGurultu(t, 'highpass', 1800, 0.7, 0.002, 0.35, 0.01, 0.05);
    },

    ag() {
      const c = hazir(); if (!c) return;
      filtreliGurultu(c.currentTime, 'bandpass', 3200, 0.9, 0.02, 0.35, 0.12, 0.35, 1400);
    },

    tezahurat(guclu) {
      const c = hazir(); if (!c) return;
      const t = c.currentTime;
      const sure = guclu ? 2.2 : 1.4;
      filtreliGurultu(t, 'lowpass', 900, 0.6, 0.18, guclu ? 0.75 : 0.5, sure, 1.1, 1300);
      filtreliGurultu(t + 0.05, 'bandpass', 1100, 1.4, 0.2, guclu ? 0.45 : 0.3, sure * 0.8, 0.9, 1700);
    },

    ooo() {
      const c = hazir(); if (!c) return;
      const t = c.currentTime;
      filtreliGurultu(t, 'bandpass', 560, 3, 0.25, 0.55, 0.6, 0.7, 260);
      filtreliGurultu(t, 'lowpass', 400, 0.5, 0.3, 0.25, 0.5, 0.6);
    },

    tik() {
      const c = hazir(); if (!c) return;
      nota(1250, c.currentTime, 0.02, 'square', 0.05);
    },

    dogru() {
      const c = hazir(); if (!c) return;
      const t = c.currentTime;
      nota(660, t, 0.08, 'triangle', 0.18);
      nota(990, t + 0.09, 0.14, 'triangle', 0.18);
    },

    yanlis() {
      const c = hazir(); if (!c) return;
      const t = c.currentTime;
      nota(330, t, 0.1, 'triangle', 0.16);
      nota(247, t + 0.12, 0.18, 'triangle', 0.16);
    },

    tikla() {
      const c = hazir(); if (!c) return;
      nota(880, c.currentTime, 0.015, 'sine', 0.08);
    },

    yildiz(k) {
      const c = hazir(); if (!c) return;
      const t = c.currentTime;
      const f = [784, 988, 1175][k || 0] || 1175;
      nota(f, t, 0.12, 'triangle', 0.2);
      nota(f * 1.5, t + 0.06, 0.18, 'sine', 0.12);
    },

    kupa() {
      const c = hazir(); if (!c) return;
      const t = c.currentTime;
      [523, 659, 784, 1047].forEach((f, i) => nota(f, t + i * 0.12, 0.18, 'triangle', 0.18));
      nota(1047, t + 0.5, 0.6, 'sine', 0.15);
    },

    ugultuBasla() {
      const c = hazir(); if (!c || ugultu) return;
      const s = gurultu();
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 520;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.06, c.currentTime + 1.5);
      s.connect(f).connect(g).connect(ana);
      s.start();
      ugultu = { s, g };
    },

    ugultuDur() {
      if (!ugultu || !ctx) { ugultu = null; return; }
      const { s, g } = ugultu;
      g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      s.stop(ctx.currentTime + 0.7);
      ugultu = null;
    }
  };

  kok.Ses = Ses;
})(window);
