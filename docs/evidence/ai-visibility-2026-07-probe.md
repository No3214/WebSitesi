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
Perplexity anahtarı yenilenince: 22 sorgu × (Perplexity + Gemini + ChatGPT)
tam matris, `docs/aeo-ai-visibility-tracking.md` şablonuna aylık işlenir.
