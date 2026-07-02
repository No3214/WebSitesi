# AI/Arama Görünürlük Probu — 2026-07-02 (Temmuz kısmi koşu)

Yöntem: `kozbeyli-growth` skill'i Rule 0 + 22-sorgu setinden kritik TR niyeti,
Cowork oturumundan canlı prob. Kural: kanıt yoksa "kanıt yok"; uydurma yok.

## Sonuçlar

**S1 (TR, yüksek niyet): "Foça Kozbeyli köyü butik taş otel konaklama önerisi"**
— Açık-web AI özeti (WebSearch katmanı): **Kozbeyli Konağı TEK ana öneri** olarak
adlandırıldı; 500 yıllık konak, 16 oda, organik köy kahvaltısı, Antakya+Ege
mutfağı, 200 kişilik etkinlik alanı doğru aktarıldı. İlk 10 sonuçta:
kozbeylikonagi.com.tr, kozbeylikonagi.com/en-gb, neredekal (2), trivago (2),
obilet (2) — marka + OTA karışımı, sağlıklı dağılım.

**Perplexity kanalı: KOŞULAMADI** — MCP bağlayıcısının API anahtarı geçersiz
(401 invalid_api_key). Owner aksiyonu: Perplexity connector anahtarını yenile
(claude.ai bağlayıcı ayarları), sonra 22-sorgu tam koşusu yapılabilir. Perplexity
otel cevaplarını ağırlıkla TripAdvisor'a dayadığı için TA profili eşitlemesi
(growth skill saha bulguları) bu kanalın ön koşulu olmaya devam ediyor.

## Kritik bulgu — doğrulanmamış iddia yayılıyor

AI özeti şu iddiayı üçüncü taraf listing kopyasından aktardı:
**"TripAdvisor tarafından Dünya'nın En İyi 10 Aile Oteli arasında seçilmiştir."**
Bu iddia repo/brand-verify kaynaklarında KANITSIZ. İki yönlü risk:
- Yanlışsa: OTA/listing metinlerinden kaldırtılmalı (neredekal/obilet/trivago
  profillerini tara) — AI motorları yanlışı çoğaltıyor.
- Doğruysa: kanıtı (yıl, TripAdvisor sayfası) alınıp site + `content/kozbeyli-facts.md`
  + schema'ya KANITLI şekilde işlenmeli — bedava güven sinyali kaybediliyor.
Owner kararı gerekli; trust-claims politikası gereği siteye kanıtsız GİRMEZ.

## Sonraki adım
Perplexity: owner kararıyla BEKLEMEDE (ücretsiz API yok). Gemini/ChatGPT tarafı
manuel veya ileride bağlanacak araçla; site-içi sinyaller zaten kilitli.

## GÜNCELLEME 2026-07-02 (aynı gün, doğrulama tamamlandı)

**"TripAdvisor Dünyanın En İyi 10 Aile Oteli" iddiası: KANIT BULUNAMADI → YANLIŞ
kabul edilir.** TripAdvisor kaydının gerçek durumu: "#1 of 1 villa in Kozbeyli",
3.7/5 puan, 60 yorum — Travelers' Choice/Best-of-the-Best rozeti YOK. Küresel
top-10 aile oteli ödülüyle bağdaşan hiçbir iz yok (TA sayfası + açık web taraması).

Aksiyonlar:
1. İddianın kaynağı OTA/listing kopyası (obilet/neredekal/trivago açıklamaları)
   → owner bu profillerdeki metinden ödül cümlesini KALDIRTMALI; AI motorları
   yanlışı çoğaltıyor (bu dosyanın ilk bulgusu).
2. Siteye/schema'ya bu iddia ASLA girmez (trust-claims politikası zaten engelliyor).
3. Yan bulgu: TA profili 3.7/60 yorum — growth planındaki review-velocity hedefi
   (90 günde +30 Google yorumu) ve TA profil bakımı önceliği bu veriyle doğrulandı.
   Perplexity'nin TA-ağırlıklı atıf davranışı düşünülünce TA yorum/puan iyileştirme
   AI görünürlüğünün de ön koşulu.
