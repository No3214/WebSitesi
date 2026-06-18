# Real User Monitoring (RUM)

Kozbeyli Konağı sitesi, sentetik Lighthouse ölçümlerine ek olarak gerçek tarayıcı
Core Web Vitals verisini PostHog'a gönderebilir. Entegrasyon varsayılan olarak
kapalıdır ve yalnızca ziyaretçi **analytics** çerez kategorisine açıkça izin
verdikten sonra çalışır.

## Aktivasyon

Vercel Production ortamına şu iki public env değişkenini ekleyin:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

`NEXT_PUBLIC_POSTHOG_KEY` boşsa hem sayfa görüntüleme hem de RUM olayları no-op
olarak kalır. Env değişikliğinden sonra yeni production deployment gerekir.

PostHog production projesinde **Settings > Project > Privacy > IP data capture**
ayarını ayrıca kapatın. Bu ayar SDK kodundan yönetilmez; canlı doğrulama kanıtına
ayar ekranının tarihli görüntüsünü ekleyin.

## Veri minimizasyonu

`src/components/analytics-provider.tsx` aşağıdaki sınırları uygular:

- PostHog yalnız analytics rızasından sonra başlatılır; rıza geri çekilince capture
  opt-out edilir.
- `autocapture`, otomatik page-leave ölçümü ve session recording kapalıdır.
- Sayfa görüntüleme ve ürün olayları yalnız uygulamanın açıkça çağırdığı
  `posthog.capture` üzerinden gönderilir.
- `before_send`, tam URL/referrer alanlarını, UTM alanlarını ve reklam tıklama
  kimliklerini hem ana properties hem `$set` / `$set_once` içinden siler.
- Uygulama rota için yalnız `path` değerini gönderir; query string ve hash eklemez.

PostHog'un tarayıcı, işletim sistemi ve cihaz sınıfı gibi standart teknik
özellikleri olaylarda kalabilir. Bunlar RUM segmentasyonu için kullanılır; form
verisi, e-posta, telefon, rezervasyon kodu veya serbest metin event property olarak
gönderilmemelidir.

## Gönderilen olay

`src/components/web-vitals-reporter.tsx`, Next.js `useReportWebVitals` kancasından
şu ölçümleri tek bir `web_vital` olayıyla gönderir:

- `CLS`, `FCP`, `INP`, `LCP`, `TTFB`
- `metric_id`, `metric_name`, `metric_value`, `metric_delta`
- `metric_rating`, `navigation_type`
- yalnızca `path` (ör. `/odalar`)

`trackEvent()` mevcut consent kontrolünü yeniden kullandığı için rıza yokken
PostHog başlatılmaz ve ölçüm gönderilmez.

## Canlı doğrulama

1. Production env değerlerini tanımlayın, IP data capture ayarını kapatın ve
   yeniden deploy edin.
2. Gizli pencerede siteyi açın; analytics rızası vermeden PostHog isteği
   oluşmadığını kontrol edin.
3. Analytics rızasını kabul edin ve birkaç public rotayı gezin.
4. PostHog Live Events içinde `$pageview` ve `web_vital` olaylarını doğrulayın.
5. Olaylarda `path` bulunduğunu; `$current_url`, referrer, UTM, query/hash, reklam
   click ID veya PII alanı bulunmadığını kontrol edin.
6. Rızayı analytics=false olarak değiştirip sonraki gezinmelerde yeni event
   oluşmadığını doğrulayın.

## Dashboard önerisi

Ortalama yerine rota ve cihaz sınıfı bazında p75 kullanın. Ana panoda en az LCP,
INP ve CLS tutulmalı; örnek sayısı düşük rotalar ayrı işaretlenmelidir. Projenin
mevcut hedefleri `docs/launch-readiness.md` içindedir: LCP ≤ 2.5s, INP ≤ 200ms,
CLS ≤ 0.1.

RUM verisi gelmeye başladıktan sonra Lighthouse CI eşiği tek başına performans
kararı vermek için kullanılmamalıdır; sentetik ölçüm regresyon kapısı, RUM ise
sahadaki gerçek cihaz ve ağ koşullarının kanıtıdır.
