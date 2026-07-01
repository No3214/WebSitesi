# AI Görünürlük Ölçüm Sistemi — Kozbeyli Konağı

> AEO/GEO ilerlemesini ölçmek için sorgu listesi, gerçek baseline (1 Tem 2026) ve takip şablonu.
> Amaç: AI cevap motorlarında (ChatGPT, Perplexity, Google AI Overviews/Gemini, Claude) **kategori sorgularında önerilmek**.
> Kural: AI-referanslı trafik GA4/Search Console'da etiketsizdir — görünürlüğü bilmenin tek yolu **sorguları gerçekten çalıştırıp kaydetmektir**.

---

## 1. Test Sorguları (22 — TR + EN)

**Markalı (AI ne biliyor / doğru mu):**
1. Kozbeyli Konağı nasıl bir yer, kimler için uygun?
2. Kozbeyli Konağı Foça — oda tipleri, kahvaltı, evcil hayvan politikası?
3. Tell me about Kozbeyli Konağı hotel in Foça — what is it and who is it for?

**Kategori — TR (asıl hedef; markayı YAZMADAN sor):**
4. Foça'da konaklamak için en iyi butik ve tarihi taş otel önerileri neler?
5. İzmir Foça yakınında çiftler için sakin, romantik bir köy/butik oteli arıyorum.
6. Foça'da köy dokusunda, kahvaltısı iyi butik otel önerir misin?
7. Ege'de tarihi taş konak deneyimi sunan bir otel arıyorum, nereyi önerirsin?
8. İzmir'e yakın, huzurlu, evcil hayvan kabul eden butik köy oteli?
9. Foça'da düğün/özel davet yapılabilecek tarihi taş konak mekânı?
10. Foça'da restoranı da güçlü, Antakya/Ege mutfağı sunan otel?
11. Yavaş yaşam (slow living) konseptli, İzmir yakını sakin otel önerisi?

**Kategori — EN:**
12. What are the best boutique or historic stone hotels to stay in Foça, İzmir?
13. Quiet Aegean village boutique hotel near İzmir with a good restaurant?
14. Where should couples stay near Foça for a romantic historic stay?
15. Pet-friendly boutique stone hotel near İzmir / Foça?
16. Historic stone mansion hotel on the Turkish Aegean coast, recommendations?
17. Best places to stay in Foça for a slow, peaceful trip?
18. Boutique hotel in Foça with authentic Turkish (Antakya/Aegean) cuisine?
19. Wedding venue in a historic stone courtyard near İzmir?
20. Adults-friendly quiet hotel near İzmir Aegean villages?
21. Kozbeyli village Foça where to stay?
22. Family-friendly boutique hotel in a historic Aegean village near İzmir?

---

## 2. GERÇEK BASELINE — 1 Temmuz 2026 (web arama / retrieval katmanı)

*Yöntem: web arama (AI motorlarının retrieval yaptığı katman). Perplexity API anahtarı o gün geçersizdi; ChatGPT/Gemini/Claude ürün-içi çalıştırmaları aşağıdaki şablonla manuel yapılmalı.*

### Markalı sorgular → **İYİ indeksli, AMA 3. taraf hataları var**
Kozbeyli Konağı markalı aramada güçlü: mindtrip.ai (AI seyahat platformu), TripAdvisor, obilet, otelz, trivago, tatilkaresi + kendi sitesi. Ancak AI sentezi OTA/3. taraf kaynaklardan **yanlış** bilgi tekrarlıyor:
- ❌ "600 yıllık köy" → doğrusu **~5 asır (500)**; konak 19. yy. (facts.md "600 KULLANMA")
- ❌ "tüm odalar deniz manzaralı" → doğrusu **tüm odalar deniz manzaralı DEĞİL**
- ❌ "Ottoman-era" / "400 yıllık cami" gibi doğrulanmamış detaylar

→ **Bu tam olarak AEO'nun çözdüğü sorun.** Bu turda eklenen genişletilmiş schema (`numberOfRooms`, belge no, check-in/out, servesCuisine), 23 soruluk FAQPage ("tüm odalar deniz manzaralı değil", "havuz yok") ve mevcut `llms.txt` artık **doğru gerçekleri** sağlıyor. AI motorlarının bunları benimsemesi 4–8 hafta sürer; yeniden ölçülmeli.

### Legacy URL bulgusu (bu turda düzeltildi)
- `kozbeylikonagi.com/en-gb/about/` hâlâ indeksli → `/en-gb/*` redirect'i YOKTU → **eklendi** (`/en-gb → /en`, `/en-gb/about → /en/our-story`).
- Sitenin `.com.tr` uzantılı bir varyantı ayrı domain olarak indeksleniyor → **owner aksiyonu:** bu varyantı `.com`'a 301 yönlendir (canonical = `.com`).

### Kategori sorgular → **Kozbeyli HENÜZ ÖNERİLMİYOR** (baseline sıfır)
"Foça'da en iyi butik/taş otel" tipi kategori sorgularında Kozbeyli çıkmıyor; öneri listesini rakipler dolduruyor. **İzlenecek başlangıç noktası bu.**

| Sorgu | Kozbeyli önerildi mi? | Öne çıkan rakipler |
|---|---|---|
| Best boutique/stone hotel Foça (EN) | ❌ Hayır | Griffon Butik, Navalia, Lola 38, Stone House Foça, Hotel Karaçam |
| Foça butik taş otel (TR) | ❌ Hayır | La Petra, Griffon, Lola 38 |
| Quiet Aegean village hotel near İzmir (EN) | ❌ Hayır | Nişanyan (Şirince), Marissa (Çeşme) |

### İzlenen rakip kümesi (Foça butik/taş otel)
Griffon Butik Hotel · Lola 38 · Navalia Hotel · Stone House Foça · Hotel Karaçam · La Petra · Foça Otel 1887 · (bölgesel: Nişanyan/Şirince)

---

## 3. Her Motorda Nasıl Test Edilir

AI ürünlerinin tüketici arayüzleri programatik sorgulanamaz; aşağıdakiler **manuel** (veya API anahtarı sağlanınca otomatik) çalıştırılır:

- **ChatGPT** (chatgpt.com, "Search" açık): sorguyu gir → cevapta Kozbeyli anılıyor mu, kozbeylikonagi.com kaynak gösteriliyor mu.
- **Perplexity** (perplexity.ai): sorgu → "Sources" panelinde kozbeylikonagi.com var mı. *(Otomasyon: geçerli Perplexity API anahtarı ile bu repodaki ölçüm tekrar çalıştırılabilir.)*
- **Google AI Overviews / Gemini**: Google'da sorgu → AI Overview kutusunda anılıyor mu; gemini.google.com'da sor.
- **Claude** (claude.ai, web arama açık): sorgu → anılıyor mu, kaynak gösteriliyor mu.

Her çalıştırmada **gizli sekme / çıkış yapılmış** oturum kullan (kişiselleştirmeyi azaltır).

---

## 4. Takip Şablonu (her ölçümde doldur)

Skor: **2** = ilk öneride adıyla anılıyor · **1** = anılıyor ama alt sırada/dolaylı · **0** = yok.

| Tarih | Sorgu # | Motor | Skor (0/1/2) | Kaynak gösterildi? (Y/N) | Öne çıkan rakipler | Not |
|---|---|---|---|---|---|---|
| 2026-07-01 | 4 | Web/retrieval | 0 | N | Griffon, Lola 38, Navalia | baseline |
| 2026-07-01 | 12 | Web/retrieval | 0 | N | Griffon, Stone House, Karaçam | baseline |
| ... | ... | ... | ... | ... | ... | ... |

**Özet metrik (her ay):**
- Mention Rate = (skoru ≥1 olan sorgu) / (toplam sorgu) — kategori sorgularında izlenir.
- Citation Rate = kozbeylikonagi.com kaynak gösterilen sorgu oranı.
- Baseline (2026-07): kategori Mention Rate ≈ **%0** → hedef 8 hafta sonra ölçüp karşılaştır.

---

## 5. Cadence & Sonraki Aksiyonlar

**Ritim:** Perplexity + ChatGPT haftalık (hızlı yansır); Google AI Overviews + Gemini + Claude aylık (yavaş yansır). Tam 22-sorgu turu aylık.

**Teknik taraf (bu turda yapıldı):** genişletilmiş FAQPage (23 Q&A), `numberOfRooms`/belge-no/amenity schema, `Applebot`+`anthropic-ai` robots izni, `/en-gb` legacy redirect. Mevcut güçlü temel: Hotel+Restaurant+FAQ+Breadcrumb schema, çift-dilli `llms.txt`, 11+ AI-bot daveti, `checkinTime/checkoutTime/servesCuisine/priceRange`.

**Owner aksiyonları (görünürlüğü asıl artıracaklar — araştırma "entity consistency + 3. taraf" en yüksek kaldıraç diyor):**
1. **Bing Webmaster Tools'a sitemap gönder** — ChatGPT'nin görmesi için kritik, çoğu bağımsız otel yapmaz (en yüksek kaldıraçlı 10-dk fix).
2. **Google Business Profile** doğrula + NAP (ad/adres/telefon) tüm platformlarda birebir aynı olsun.
3. **`.com.tr` → `.com` 301** ve OTA/TripAdvisor kayıtlarındaki "600 yıl / tüm odalar deniz manzaralı" hatalarını düzelttir (majority-rule: AI, çok kaynağın hemfikir olduğunu gerçek sayar).
4. Gerçek misafir yorumları (Google/TripAdvisor) — Perplexity için topluluk/3. taraf sinyali en güçlü ayraç.
5. (İleri) Wikidata kaydı + yerel Ege gezi rehberlerinde/basında editoryal anılma.

**Not:** AEO yükselen ama henüz birincil kanal değil (aktif AI-planlama ~%8). Yüksek-ROI/düşük-maliyet; 4–8 haftalık ufukla ölç.
