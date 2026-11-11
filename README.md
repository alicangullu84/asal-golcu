# Asal Golcü

1'den 120'ye kadar sayıların asal çarpanlarını penaltı atarak öğreten oyun. Plan ve kurallar: [PRD.md](PRD.md).

## Çalıştırma

`baslat.bat` dosyasına çift tıklayın. Yerel sunucu açılır ve oyun tarayıcıda `http://localhost:5180` adresinde başlar. Pencereyi kapatınca sunucu da kapanır.

Elle başlatmak için:

```
node sunucu.js
```

Videolu şut sahneleri için oyunu sunucu üzerinden açın. `index.html` dosyasına çift tıklayarak da oynanır, ama o zaman bazı tarayıcılar videoları yüklemeyebilir; oyun bu durumda görsel animasyonla devam eder.

İlerleme tarayıcının yerel deposunda tutulur. Başka bilgisayara taşımak için Hoca Köşesi → Dışa aktar / İçe aktar. Hoca Köşesi şifresi: 7 · 13 = 91.

## Klasörler

| Klasör / dosya | İçerik |
|---|---|
| `index.html`, `stil.css` | Sayfa ve görünüm |
| `js/motor.js` | 1-120 verisi, soru ve çeldirici üretimi, öğrenme motoru (tarayıcı ve Node) |
| `js/oyun.js` | Ekranlar, maç akışı, sahne ve canlandırmalar |
| `js/klip.js`, `js/klipler.js` | Video klip oynatıcı ve kliplerin ölçüleri |
| `js/ses.js` | Ses efektleri (Web Audio, dosya yok) |
| `js/test.js` | Otomatik testler: `node js/test.js` ya da `index.html?test=1` |
| `gorseller/` | Google Flow ile üretilmiş görseller (dekupe PNG ve JPG) |
| `videolar/` | Google Flow ile üretilmiş, yeşil fonu silinmiş saydam WebM klipler |
| `gorseller/ham/`, `videolar/ham/` | Flow'dan inen özgün dosyalar (sunucu bunları yayınlamaz) |
| `araclar/` | Görsel ve video işleme araçları |

## Görsel ve videoların üretimi

Bütün görseller ve videolar Google Flow'daki "Asal Golcu oyun gorselleri" projesinde üretildi (görseller Nano Banana 2.1, videolar Omni 1.2 Flash). Karakterler düz yeşil (chroma) fon üzerinde üretilip sonra dekupe edildi.

- `araclar/gorsel-isle.ps1`: yeşil fonu siler, kırpar, küçültür.
- `araclar/klip-olc.js`: kliplerde ayak noktası, boy, topun giriş anı gibi ölçüleri çıkarır (ffmpeg gerekir).
- `araclar/klip-hazirla.ps1`: `videolar/ham/vNN.mp4` dosyalarını oyunun kullandığı saydam WebM'lere çevirir (ffmpeg gerekir).
- `araclar/sahne-onizle.ps1`: oyundaki yerleşimle tek bir sahne karesi üretir (kontrol için).

Kaleci klipleri: her kaleci için `kN-tut` (köşeye uçup yakalama), `kN-bos` (boşa uçma, gol), `kN-orta` (ortada yakalama). Sağ köşe için klip aynalanır. Golcünün vuruşu `golcu-vurus`. Bir kalecinin üç klibinden biri yoksa oyun o kaleci için görsel animasyon kullanır.
