# Asal Golcü: Akif'in Kupa Yolu

Ürün gereksinim dokümanı (PRD) ve oyun senaryosu

- Sürüm: 0.1 (plan). Kod yazılmadı, onay bekliyor.
- Tarih: 11 Kasım 2026
- Oyuncu: Akif, 8. sınıf, LGS'ye hazırlanıyor, futbolu ve özellikle şut çekmeyi seviyor.
- Teslim biçimi: tek bir HTML dosyası, yerel sunucuda (localhost) açılır, internet gerektirmez.

---

## 1. Tek cümlede oyun

Topun üzerinde bir sayı gelir, kalenin bölgelerinde cevaplar yazar. Akif doğru cevabın yazdığı bölgeye şut çekerse gol olur, yanlış bölgeye çekerse kaleci topu tutar.

## 2. Amaç ve gerekçe

LGS'de çarpanlar ve katlar, üslü ifadeler, kareköklü ifadeler ve EBOB-EKOK sorularının hepsi aynı temele dayanır: 1'den 120'ye kadar bir sayıyı görür görmez tanımak. "91 asal mı?", "96 neye ayrılır?", "81 üçün kaçıncı kuvveti?" sorularına düşünmeden cevap veren öğrenci, soru başına 20-30 saniye kazanır ve işlem hatası yapmaz.

Bu tanıma ezber kâğıdıyla sıkıcıdır. Oyunun işi, aynı tekrarı Akif'in sevdiği bir şeyin içine gömmek: şut çekmek.

Tasarım ilkeleri:

1. **Sonucu matematik belirler, el becerisi değil.** Doğru cevap her zaman gol, yanlış cevap her zaman kurtarış. Şans yok, direk yok.
2. **Yanlış cezalandırılmaz, açıklanır.** Kaleci tutar, VAR ekranı doğrusunu gösterir, aynı sayı birkaç pozisyon sonra tekrar gelir.
3. **Kısa oturum.** Bir maç 2-3 dakika, günlük hedef 10 dakika.
4. **Zayıf sayı daha sık gelir.** Oyun hangi sayıda zorlandığını hatırlar.
5. **İlerleme görünür.** 120 sayının her biri albümde bir karttır, bronzdan altına yükselir.

## 3. Öğrenme hedefleri

Altı beceri var. Oyundaki her soru bunlardan birini ölçer.

| Kod | Beceri | Örnek soru | Doğru cevap |
|---|---|---|---|
| B1 | Asal mı, değil mi | 19 | ASAL |
| B2 | Kaç farklı asal çarpanı var | 84 | 3 (2, 3, 7) |
| B3 | Asal kuvvetleri tanıma (iki yönlü) | 81 = ? / 3⁴ = ? | 3⁴ / 81 |
| B4 | Asal çarpanlarına ayrılmış hali | 96 | 2⁵ · 3 |
| B5 | Üslü yazımdan sayıya (ters okuma) | 2³ · 3 · 5 | 120 |
| B6 | En büyük asal çarpan (bonus) | 84 | 7 |

Üç haftalık hedef (günde yaklaşık 10 dakika):

| Beceri | Doğruluk | Ortalama cevap süresi |
|---|---|---|
| B1 | en az %95 | en fazla 3 sn |
| B2 | en az %90 | en fazla 5 sn |
| B3 | en az %95 | en fazla 4 sn |
| B4 | en az %90 | en fazla 10 sn |

Nihai hedef: albümdeki 120 kartın tamamı altın.

## 4. Matematik içeriği

Bu bölümdeki listeler oyunun veri tabanıdır. Kodda elle yazılmaz, hesaplanır ve otomatik test edilir (bölüm 18).

### 4.1 Sayıların dökümü (1-120)

- 1: ne asal ne bileşik (özel kart).
- Asal sayılar, 30 adet: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113.
- Bileşik sayılar: 89 adet.

### 4.2 Tuzak sayılar

Asal gibi görünen ama asal olmayan sayılar. B1'de iki kat sık sorulur.

| Sayı | Ayrılışı | Sayı | Ayrılışı |
|---|---|---|---|
| 39 | 3 · 13 | 87 | 3 · 29 |
| 49 | 7² | 91 | 7 · 13 |
| 51 | 3 · 17 | 93 | 3 · 31 |
| 57 | 3 · 19 | 111 | 3 · 37 |
| 69 | 3 · 23 | 117 | 3² · 13 |
| 77 | 7 · 11 | 119 | 7 · 17 |

### 4.3 Asal kuvvetler (B3'ün tamamı)

4 = 2², 8 = 2³, 16 = 2⁴, 32 = 2⁵, 64 = 2⁶, 9 = 3², 27 = 3³, 81 = 3⁴, 25 = 5², 49 = 7².

### 4.4 Farklı asal çarpan sayısı (B2)

120'ye kadar hiçbir sayının üçten fazla farklı asal çarpanı yoktur (2 · 3 · 5 · 7 = 210). Bu yüzden kale tam üç bölgeye ayrılır: 1, 2, 3.

- 1 farklı asal çarpan: 40 sayı (30 asal + 10 asal kuvvet).
- 2 farklı asal çarpan: 66 sayı.
- 3 farklı asal çarpan: 13 sayı: 30, 42, 60, 66, 70, 78, 84, 90, 102, 105, 110, 114, 120.

1 sayısı B2'de sorulmaz.

### 4.5 Akif'e öğretilecek ana taktik

**120'ye kadar bir sayı 2'ye, 3'e, 5'e ve 7'ye bölünmüyorsa asaldır** (sayının kendisi bunlardan biri değilse ve 1 değilse). Sebep: 11 · 11 = 121 > 120.

- 2: son basamak çift.
- 3: rakamları toplamı 3'ün katı.
- 5: son basamak 0 veya 5.
- 7: 2, 3, 5'e bölünmeyenlerde yalnız dört sayı kalır: 49, 77, 91, 119.

Bu kural oyunda "Taktik Tahtası" olarak yer alır.

## 5. Hikâye ve dünya

Akif mahalle takımının golcüsüdür. Hedefi LGS Kupası'nı kaldırmak. Kupa yolunda sekiz kaleci var, her birinin bir konusu ve bir repliği var. Kaleciler, takımlar ve turnuvalar tamamen hayal ürünüdür; gerçek kulüp, oyuncu veya marka adı kullanılmaz.

| Tur | Maç | Kaleci | Beceri | Sayılar | Şut saati |
|---|---|---|---|---|---|
| 1 | Mahalle Maçı | Uykucu Umut | B1 | 1-50 | yok |
| 2 | Okul Turnuvası | Duvar Davut | B1, tuzak ağırlıklı | 1-120 | 10 sn |
| 3 | İlçe Kupası | Ahtapot Orhan | B2 | 2-120 | 12 sn |
| 4 | İl Finali | Panter Polat | B3 | 10 asal kuvvet, iki yönlü | 10 sn |
| 5 | Bölge Kupası | Örümcek Ömer | B4 | 4-60 bileşikler | 15 sn |
| 6 | Türkiye Yarı Finali | Kartal Kaan | B4 | 61-120 bileşikler | 15 sn |
| 7 | Türkiye Finali | Robot Rıza | B5 + B6 | 2-120 | 12 sn |
| 8 | LGS Kupası Finali | Efsane Eldiven | Hepsi karışık | 1-120 | 8 sn |

Maç öncesi replikler (kalecinin konusunu ima eder):

- Uykucu Umut: "Esniyorum ama asal sayıyı kaçırmam."
- Duvar Davut: "51'i asal sanan çok golcü gördüm."
- Ahtapot Orhan: "Sekiz kolum var. Senin sayıların en fazla üç farklı asal çarpanı."
- Panter Polat: "Üsleri karıştıranın topu bende kalır."
- Örümcek Ömer: "Ağıma takılan her top bir çarpandır."
- Kartal Kaan: "Altmışın üstünde hava serttir."
- Robot Rıza: "2 üssü 3, çarpı 3, çarpı 5. Ben hesapladım. Sen?"
- Efsane Eldiven: "LGS'de süre de rakiptir."

## 6. Çekirdek döngü: bir pozisyonun anatomisi

Her pozisyon 6-12 saniye sürer.

| Adım | Süre | Ne olur |
|---|---|---|
| 1. Hazırlık | 0,6 sn | Top penaltı noktasına yuvarlanır, üzerinde sayı belirir. Spiker şeridi: "Akif topun başında." |
| 2. Soru | anında | Kalenin bölgelerinde cevaplar yanar. Topun üstünde tek satır soru metni. Kaleci çizgide sağa sola salınır. Şut saati başlar (varsa). |
| 3. Nişan | Akif'in hızı | Akif bir bölgeye dokunur, tıklar veya tuşa basar. |
| 4. Vuruş | 0,7 sn | Kısa koşu, vuruş sesi, top seçilen bölgeye kavisle gider. |
| 5a. Gol | 1,2 sn | Kaleci başka yöne uçar veya yetişemez. Ağ havalanır, tribün coşar, konfeti. Tabelada sayının ayrılışı 1 saniye görünür (96 = 2⁵ · 3). |
| 5b. Kurtarış | 1,0 sn | Kaleci seçilen bölgeye uçar, topu tutar. Spiker: "Kaleci köşeyi bildi, VAR'a bakalım." VAR ekranı açılır (bölüm 12). |
| 5c. Süre doldu | 1,0 sn | Hakem düdüğü, top yavaşça kaleciye gider. Kurtarış sayılır, VAR açılır. |
| 6. Geçiş | 0,5 sn | Skor güncellenir, sıradaki top gelir. |

Değişmez kurallar:

- Doğru cevap her zaman gol, yanlış cevap her zaman kurtarış.
- Golde de doğru ayrılış gösterilir; Akif her pozisyonda sayının çarpanlarını bir kez daha görür.
- VAR ekranı açıkken şut saati durur.

## 7. Soru tipleri ve kale düzeni

Üç kale düzeni var. B1 ve B2'de bölgelerin yeri sabittir (refleks oluşsun), dört köşeli düzende şıklar her soruda karışır.

### 7.1 İki bölge (B1)

```
+---------------------------+---------------------------+
|                           |                           |
|           ASAL            |        ASAL DEĞİL         |
|                           |                           |
+---------------------------+---------------------------+
                        ( 91 )
```

- 1 sayısı "ASAL DEĞİL" bölgesindedir. VAR açıklaması: "1 asal değildir. Asal sayının tam iki böleni olur, 1'in tek böleni var."
- Soru dağılımı dengelenir: yaklaşık %45 asal, %55 bileşik. Bileşiklerde tek sayılar ve tuzak sayılar ağırlıklıdır; çift sayılar ve 5'in katları seyrek gelir.

### 7.2 Üç bölge (B2)

```
+-----------------+-----------------+-----------------+
|                 |                 |                 |
|        1        |        2        |        3        |
|                 |                 |                 |
+-----------------+-----------------+-----------------+
            Kaç farklı asal çarpanı var?
                      ( 84 )
```

Hocanın tarif ettiği mekanik budur: 19 gelirse "1" bölgesine şut.

### 7.3 Dört köşe (B3, B4, B5, B6)

```
+---------------------------+---------------------------+
|          2⁴ · 6           |          2⁵ · 3           |
+---------------------------+---------------------------+
|          2⁶ · 3           |          2⁴ · 3²          |
+---------------------------+---------------------------+
          Asal çarpanlarına ayrılmış hali hangisi?
                        ( 96 )
```

Soru metinleri:

| Beceri | Soru metni | Topun üstünde | Köşelerde |
|---|---|---|---|
| B3 ileri | "Üslü yazımı hangisi?" (taban asal) | 81 | 3⁴, 3³, 9², 3⁵ |
| B3 ters | "Hangi sayı?" | 3⁴ | 81, 27, 64, 243 |
| B4 | "Asal çarpanlarına ayrılmış hali hangisi?" | 96 | 2⁵ · 3 ve üç çeldirici |
| B5 | "Hangi sayı?" | 2³ · 3 · 5 | 120, 60, 90, 150 |
| B6 | "En büyük asal çarpanı kaç?" | 84 | 7, 3, 21, 2 |

## 8. Çeldirici kuralları

Çeldiriciler rastgele değil, bilinen hatalara göre üretilir. Her çeldiricinin bir hata etiketi vardır; VAR ekranı bu etikete göre açıklama yazar.

| Etiket | Hata | 96 için örnek | VAR açıklaması |
|---|---|---|---|
| asal-olmayan-taban | Değer doğru, taban asal değil | 2⁴ · 6 | "6 asal değil. 6 = 2 · 3, o yüzden 2⁵ · 3 olur." |
| us-fazla | Bir üs bir fazla | 2⁶ · 3 | "2⁶ · 3 = 192 eder." |
| us-eksik | Bir üs bir eksik | 2⁴ · 3 | "2⁴ · 3 = 48 eder." |
| us-yer-degisik | Üsler yer değiştirmiş | 2 · 3⁵ | "Üsleri karıştırdın: 2 beş kez, 3 bir kez." |
| yanlis-asal | Bir asal yanlış | 2⁵ · 5 | "96, 5'e bölünmez." |

Zorunlu kurallar:

- Her soruda tam bir doğru şık vardır.
- Dört şık birbirinden farklıdır (yazım olarak da değer olarak da; tek istisna "asal-olmayan-taban" çeldiricisidir, değeri doğru cevapla aynıdır ve bilerek yanlış sayılır).
- B3 ve B4'te soru metni her zaman "asal" kelimesini içerir, böylece 9² gibi şıkların neden yanlış olduğu tartışmasızdır.
- B5 ve B6'da sayı çeldiricileri yakın değerlerdir (bir çarpan eksik veya fazla).
- B6'da "en büyük çarpan ama asal değil" çeldiricisi mutlaka bulunur (84 için 21).

## 9. Oyun modları

### 9.1 Kupa Yolu (ana mod)

- Sekiz maç, sırayla açılır.
- Her maç 10 pozisyondur (5 + devre arası + 5).
- Tabela: "AKİF 7 - 3 Ahtapot Orhan" (goller - kurtarışlar).
- Geçme barajı 7 gol. Yıldız: 7 gol bir yıldız, 8-9 gol iki yıldız, 10 gol üç yıldız.
- Her maçta bir kez "Hoca Taktiği" hakkı: iki yanlış bölge kapanır (iki bölgeli B1'de bunun yerine Taktik Tahtası açılır).
- Devre arasında tek cümlelik ipucu: o yarıda yanlış yapılan sayının doğrusu.
- Kazanılan maç tekrar oynanabilir (daha fazla yıldız için).

### 9.2 Penaltı Atışları (hızlı oyun, 1 dakika)

- Beş şut, açılmış kalecilerin konularından karışık.
- Rakip takımın atışları canlandırılmaz, tabelada sonuç olarak görünür ("Rakip attı: gol" veya "Rakip kaçırdı"). Rakibin isabet oranı %60-80, kazanılan kupa turuna göre artar.
- Beraberlikte seri penaltı.

### 9.3 Antrenman

- Akif veya hoca beceriyi ve sayı aralığını seçer.
- Süre yok, Taktik Tahtası hep açık, yıldız yok.
- Cevaplar öğrenme motoruna işlenir; Taktik Tahtası açılarak verilen doğru cevap seviye yükseltmez.

### 9.4 Hocanın Özel Antrenmanı

- Tek tuş: oyun en zayıf 10 sayıdan bir maç kurar.
- Hoca Köşesi'nden de başlatılabilir.

### 9.5 Sonraki sürüme bırakılanlar (v1.1)

- **Pas Pas Gol:** Bölen merdiveni oynanır. 96 için Akif sırayla asal bölen seçer (2, 2, 2, 2, 2, 3), her doğru bölen bir pas, top 1'e inince şut. Asal çarpanlara ayırma algoritmasının kendisini çalıştırır.
- **Frikik:** Barajdaki dört oyuncunun formasında sayılar yazar, "asal olanın üstünden aşırt".
- **EBOB-EKOK ve aralarında asal** soruları.

## 10. Puan, seri, ödül

| Olay | Karşılığı |
|---|---|
| Gol | 100 puan |
| Füze Şut (altın sürede doğru cevap) | +50 puan, top alevli gider |
| Seri | Her ardışık gol için +10 puan (en fazla +100) |
| 3 seri | "Hat-trick" yazısı, tribün tezahüratı |
| 5 seri | Tribünde dalga |
| 10/10 | "Kusursuz maç" kutlaması |
| Tuzak sayıyı bilmek | Spiker: "91'in çalımını yemedi." |

Altın süreler: B1 3 sn, B2 5 sn, B3 4 sn, B4-B6 8 sn.

Yıldızı yalnız gol sayısı belirler. Puan sadece rekor içindir; hız, doğruluğun önüne geçmez.

Açılan ödüller (yalnız görsel): top desenleri, krampon renkleri, gol sevinçleri. Her kupa turunda bir tane.

Günlük seri: Akif bir günde en az bir maç bitirirse "antrenman günü" sayacı bir artar. Ana menüde görünür.

## 11. Öğrenme motoru (uyarlamalı tekrar)

Birim: (sayı, beceri) çifti. Her çiftin bir seviyesi vardır.

| Seviye | Ad | Geçiş |
|---|---|---|
| 0 | Yeni | Doğru cevap bir üst seviyeye çıkarır |
| 1 | Bronz | Doğru cevap bir üst seviyeye çıkarır |
| 2 | Gümüş | Altına çıkmak için doğru cevabın **başka bir günde** verilmesi gerekir |
| 3 | Altın | Arada bir kontrol sorusu gelir |

- Yanlış cevap veya süre dolması: bir seviye düşer (en az 0) ve aynı sayı aynı maçta 3-5 pozisyon sonra tekrar sorulur.
- Bir maçtaki 10 pozisyonun seçimi: yaklaşık yarısı zayıf çiftler (seviye 0-1 ve daha önce yanlış yapılanlar), üçte biri hiç sorulmamışlar, kalanı pekişmişlerin kontrolü.
- Aynı sayı bir maçta, tekrar sorusu dışında, iki kez gelmez.
- Her cevabın süresi kaydedilir (son 5 cevap).

Albüm kartının rengi:

- 1 ve asal sayılar (31 kart): B1 seviyesi.
- Bileşik sayılar (89 kart): B1, B2 ve B4 seviyelerinin en düşüğü.
- B3, B5, B6 çeşitlilik ve pekiştirme içindir, kart rengini etkilemez.

Tahmini yük: 298 çift, her biri üç doğru cevap, yaklaşık 900 doğru şut. Günde 10 dakikada 15-20 gün.

## 12. VAR ekranı (yanlış cevabın açıklaması)

Kurtarıştan sonra ekranın ortasına "VAR incelemesi" paneli gelir. Üç parça:

1. **Bölen merdiveni**, okulda öğretilen biçimde, satır satır canlanır:

```
96 | 2
48 | 2
24 | 2
12 | 2
 6 | 2
 3 | 3
 1 |
```

2. **Sonuç satırı:** 96 = 2⁵ · 3
3. **Senin şutun:** seçilen çeldiricinin hata etiketine göre tek cümle (bölüm 8).

B1 için VAR daha kısadır:

- Bileşik sayıya ASAL denmişse: "91 asal değil: 7 · 13 = 91."
- Asal sayıya ASAL DEĞİL denmişse: "97 asal: 2'ye, 3'e, 5'e, 7'ye bölünmüyor."

Panel "Devam" tuşuyla kapanır. Otomatik kapanmaz, Akif okumadan geçemesin diye tuş 1,5 saniye sonra etkinleşir.

## 13. Akif'in ilk on dakikası (senaryo)

| Dakika | Ekran | Ne olur |
|---|---|---|
| 0:00 | Açılış | Stat ışıkları yanar. "Adın?" kutusunda Akif yazılıdır. Forma numarası seçer (1-120). Seçtiği sayının kartı döner: "10 = 2 · 5". |
| 0:30 | Isınma | Puansız üç şut. İlkinde top 7, "ASAL" bölgesi yanıp söner: "Buraya vur." İkincisinde top 10, yardım yok. Üçüncüsünde top 9, bilerek tuzak; yanlış yaparsa VAR ekranını tanımış olur. |
| 1:30 | Kupa haritası | Sekiz durak görünür, yalnız ilki açık. |
| 1:40 | Maç öncesi | Uykucu Umut tanıtılır, repliğini söyler. 10 saniyelik taktik: "Asal sayının tam iki böleni vardır." |
| 2:00 | Maç 1 | 10 pozisyon, süre yok. Beşinci pozisyondan sonra devre arası. |
| 4:15 | Maç sonu | Tabela, yıldızlar, albüme giren kartlar, "zorlandığın sayılar: 9, 49". |
| 4:40 | Maç 2 | Duvar Davut, şut saati ilk kez devrede, tuzak sayılar. |
| 7:00 | Maç sonu | Yeni top deseni açılır. |
| 7:20 | Maç 3 | Ahtapot Orhan, üç bölgeli kale. |
| 9:40 | Gün sonu | "Bugün 24 gol, 6 kurtarış. Yarın tekrar: 51, 57, 91." Antrenman günü sayacı 1 olur. |

## 14. Ekranlar

1. **Açılış:** ad, forma numarası.
2. **Ana menü:** Kupa Yolu, Penaltı Atışları, Antrenman, Albüm, Hoca Köşesi, Ayarlar. Köşede günlük seri ve toplam yıldız.
3. **Kupa haritası:** sekiz durak, yıldızlar, kilitler.
4. **Maç öncesi:** kaleci, replik, konu ipucu, "Maça başla".
5. **Maç ekranı:** aşağıdaki yerleşim.
6. **VAR paneli:** maç ekranının üstüne açılır.
7. **Maç sonu:** tabela, yıldız, kazanılan kartlar, zorlanılan sayılar, "Tekrar oyna" ve "Devam".
8. **Albüm:** 12 x 10 ızgarada 120 kart. Karta dokununca sayının kimliği açılır: asal mı, ayrılışı, farklı asal çarpan sayısı, doğruluk oranı.
9. **Hoca Köşesi:** rapor ve ayarlar (bölüm 17).
10. **Ayarlar:** ses, spiker sesi, hareketi azalt, ilerlemeyi sıfırla.

Maç ekranı yerleşimi:

```
+------------------------------------------------------------------+
| AKİF 3 - 1 Ahtapot Orhan      Pozisyon 5/10      Süre 09   Seri 3 |
+------------------------------------------------------------------+
|                          t r i b ü n                              |
|        +----------------+----------------+----------------+       |
|        |                |                |                |       |
|        |       1        |       2        |       3        |       |
|        |                |    (kaleci)    |                |       |
|        +----------------+----------------+----------------+       |
|                                                                   |
|                  Kaç farklı asal çarpanı var?                     |
|                             ( 84 )                                |
|                              Akif                                 |
|                                                                   |
| [Taktik Tahtası]   Spiker: Akif topun başında.        [Duraklat]  |
+------------------------------------------------------------------+
```

## 15. Kontroller

| Cihaz | Nişan ve şut |
|---|---|
| Dokunmatik (tablet, telefon) | Kale bölgesine dokun. Alternatif: toptan bölgeye doğru parmağı kaydır ve bırak. |
| Fare | Bölgeye tıkla. Üzerine gelince nişangâh görünür. |
| Klavye | İki bölge: sol ve sağ ok. Üç bölge: 1, 2, 3 veya sol, aşağı, sağ ok. Dört köşe: Q, W, A, S veya 1-4. Boşluk: Devam. |

Dokunma alanları en az 64 piksel. Yanlışlıkla çift dokunma tek şut sayılır.

## 16. Görsel ve ses

- **Görünüm:** topun arkasından penaltı açısı. Düz renkli, çizgi film tarzı. Yeşil saha, beyaz kale ve ağ, arkada tribün. Kalecilerin her biri eldiven ve forma rengiyle ayrışır.
- **Top:** üzerindeki sayı büyük ve yüksek kontrastlıdır, her mesafeden okunur. Şutta döner.
- **Kale bölgeleri:** ince çizgiyle ayrılır, etiketler ağın önünde yarı saydam plakalarda durur. Üsler gerçek üst simge olarak yazılır.
- **Canlandırmalar:** koşu ve vuruş, topun kavisli uçuşu, kalecinin altı farklı uçuşu, ağın havalanması, konfeti, VAR merdiveni.
- **Sesler:** tarayıcının ses motoruyla üretilir, dış dosya yok. Düdük, vuruş, ağ, tribün uğultusu, gol tezahüratı, kurtarışta "ooo".
- **Spiker şeridi:** ekranın altında yazılı yorum. Havuzdan rastgele seçilir. Gol: "Ağlar havalandı.", "Kaleci sadece baktı.", "Doksana taktı.", "Akif affetmedi." Kurtarış: "Kaleci köşeyi bildi.", "Eldivenler bugün formda." İsteğe bağlı: cihazda Türkçe ses varsa sesli okuma.
- **Erişilebilirlik:** doğru ve yanlış yalnız renkle değil yazı ve simgeyle de belirtilir. "Hareketi azalt" ayarı canlandırmaları kısaltır. Ses kapatılabilir.

## 17. Hoca Köşesi

Ana menüden açılır. Akif'in yanlışlıkla girmemesi için basit bir kilit: "7 · 13 kaç eder?" sorusu.

Rapor:

- Beceri bazında doğruluk ve ortalama süre (B1-B6).
- En zayıf 10 sayı: sayı, beceri, doğru/yanlış, son hata.
- En yavaş 10 sayı.
- Albüm özeti: kaç altın, gümüş, bronz, yeni.
- Günlük çalışma: son 14 günün dakika ve şut sayısı.

Araçlar:

- "Zayıf sayılardan maç kur."
- Şut saatini aç, kapat veya uzat.
- Sayı aralığını sınırla (örneğin yalnız 1-60).
- İlerlemeyi dosyaya aktar ve dosyadan yükle (başka cihaza taşımak için).
- İlerlemeyi sıfırla (onay ister).

## 18. Teknik plan

- **Dosyalar:** `asal-golcu\index.html` (HTML, CSS ve JavaScript tek dosyada), `asal-golcu\sunucu.js` (bağımlılıksız küçük Node sunucusu).
- **Çalıştırma:** `node asal-golcu\sunucu.js`, adres `http://localhost:5180`. Dosya çift tıklamayla da açılır; sunucu şart değil.
- **Bağımlılık:** yok. Kütüphane, dış yazı tipi, dış görsel, internet bağlantısı yok.
- **Sahne:** SVG ve tarayıcı canlandırmaları. Her ekran boyutunda keskin, dokunma alanları doğal.
- **Kayıt:** tarayıcının yerel deposu, sürümlü tek anahtar (`asalGolcu.v1`). İçerik: oyuncu, çift seviyeleri ve süreleri, kupa yıldızları, ayarlar, günlük kayıt.
- **Ekran:** 360 pikselden 1920 piksele, yatay ve dikey.

Kod bölümleri (tek dosya içinde):

| Bölüm | Görev |
|---|---|
| veri | 1-120 için asal mı, ayrılış, farklı asal sayısı, en büyük asal çarpan, tuzak işareti. Hesaplanır, elle yazılmaz. |
| soruMotoru | Altı beceri için soru ve çeldirici üretimi, hata etiketleri. |
| ogrenme | Seviyeler, tekrar kuyruğu, soru seçimi. |
| oyun | Durum makinesi: menü, maç öncesi, hazırlık, nişan, vuruş, sonuç, VAR, maç sonu. |
| sahne | Kale, kaleci, top, tribün çizimi ve canlandırmalar. |
| ses | Ses efektleri ve isteğe bağlı sesli spiker. |
| kayit | Okuma, yazma, sürüm geçişi, dışa ve içe aktarma. |
| ekranlar | Menü, harita, albüm, Hoca Köşesi, ayarlar. |

Otomatik test (`?test=1` adresiyle açılır, sonucu ekrana yazar):

1. 1-120 her sayı için asal çarpanların çarpımı sayının kendisine eşit.
2. Asal sayı listesi 30 adet ve bölüm 4.1 ile aynı.
3. Üç farklı asal çarpanlı sayılar 13 adet ve bölüm 4.4 ile aynı.
4. Her beceriden 2000 rastgele soru: tam bir doğru şık, şıklar birbirinden farklı, her çeldiricinin hata etiketi var.
5. Öğrenme motoru: yanlış yapılan sayı aynı maçta tekrar geliyor.

## 19. Kabul ölçütleri

1. Otomatik test sıfır hata verir.
2. Doğru cevap her zaman gol, yanlış cevap her zaman kurtarıştır.
3. Dokunuştan sonuca en fazla 2 saniye, pozisyonlar arası en fazla 1 saniye (VAR hariç).
4. On pozisyonluk maç 3 dakikayı geçmez.
5. Sayfa yenilenince veya tarayıcı kapanıp açılınca ilerleme durur.
6. Dokunmatik ekranda, fareyle ve yalnız klavyeyle baştan sona oynanır.
7. Her yanlışta VAR açıklaması doğrudur ve seçilen çeldiriciye özeldir.
8. Hoca Köşesi en zayıf 10 sayıyı doğru gösterir.
9. Gerçek kulüp, oyuncu, turnuva veya marka adı yoktur.
10. İnternet kapalıyken çalışır.

## 20. Kapsam dışı (v1)

- EBOB-EKOK, aralarında asal, bölen sayısı soruları.
- Pas Pas Gol ve Frikik modları.
- Çok oyunculu oyun, çevrim içi sıralama, hesap açma.
- Birden fazla öğrenci profili (v1'de tek oyuncu; ilerleme dosyayla taşınır).

## 21. Yapım aşamaları

| Aşama | İçerik | Bitti sayılır |
|---|---|---|
| A1 | veri, soruMotoru, otomatik test | Test sıfır hata |
| A2 | Maç ekranı, üç kale düzeni, şut ve kaleci canlandırmaları, VAR | Tek maç baştan sona oynanır |
| A3 | Kupa Yolu, sekiz kaleci, yıldızlar, Penaltı Atışları, Antrenman | Sekiz tur açılır ve kapanır |
| A4 | Öğrenme motoru, kayıt, Albüm, Hoca Köşesi | İlerleme kalıcı, rapor doğru |
| A5 | Ses, spiker, ödüller, tablet ve klavye denemesi, yerel sunucu | Kabul ölçütlerinin tamamı |

## 22. Açık kararlar

Kod başlamadan hocanın karar vermesi gerekenler. Karar gelmezse varsayılan uygulanır.

| # | Karar | Varsayılan |
|---|---|---|
| 1 | Akif hangi cihazda oynayacak: bilgisayar, tablet, telefon? | Hepsinde çalışır, öncelik bilgisayar ve tablet |
| 2 | Şut saati ikinci maçtan itibaren açık olsun mu? | Açık, Hoca Köşesi'nden kapatılabilir |
| 3 | Pas Pas Gol (bölen merdivenini oynama) ilk sürüme girsin mi? | Girmesin, v1.1 |
| 4 | EBOB-EKOK soruları eklensin mi? | Eklenmesin, v1.1 |
| 5 | Oyunun adı | Asal Golcü: Akif'in Kupa Yolu |

## 23. Bir not

Hocanın tarifindeki "96'nın asal çarpanlarına ayrılmadığını bilmeli" cümlesi, "96'nın asal çarpanlarına ayrılmış halini (2⁵ · 3) bilmeli" olarak anlaşıldı ve B4 becerisi buna göre tanımlandı.

## 24. Uygulanan sürüm (11 Kasım 2026)

Planın bölüm 16 ve 18'den farkları:

- **Görseller ve videolar Google Flow ile üretildi** (dış kaynak değil, oyunla birlikte yerelde duruyor; internet gerekmez). Stadyum, kapak, kupa ve top görselleri Nano Banana 2.1 ile; kalecilerin ve golcünün hareketleri Omni 1.2 Flash videolarıyla.
- **Şut sahnesi videolu:** golcü arkadan koşup vuruyor; kaleci köşeye uçup topu eldivenleriyle yakalıyor, ortada göğsüne alıyor ya da gol yediğinde ters köşeye boşa uçuyor. Sağ köşe için klip aynalanıyor. Yeşil fon önceden silinmiş saydam WebM klipler kullanılıyor.
- Zamanlama videonun kendi saatine bağlı: ayak topa değdiği anda top çıkıyor, kaleci topu tuttuğu anda "KURTARIŞ" geliyor.
- Ek efektler: kamera yaklaşması ve sarsıntısı, top gölgesi ve iz, ağın esnemesi, flaş, konfeti.
- Örümcek Ömer'in forması örümcek ağı yerine balık ağı desenli lacivert (Flow'un içerik filtresi nedeniyle).
- Dosyalar tek HTML yerine birkaç dosyaya bölündü; yapı README.md'de.
