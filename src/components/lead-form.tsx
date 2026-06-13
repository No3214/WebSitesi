"use client";

import { useEffect, useState } from 'react';

import { pushEvent, trackGenerateLead } from '@/lib/gtm';

type LeadStatus = 'idle' | 'loading' | 'success' | 'error';

type MarketingMeta = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
};

export function LeadForm() {
  const [status, setStatus] = useState<LeadStatus>('idle');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [meta, setMeta] = useState<MarketingMeta>({
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    referrer: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMeta({
      utmSource: params.get('utm_source') ?? '',
      utmMedium: params.get('utm_medium') ?? '',
      utmCampaign: params.get('utm_campaign') ?? '',
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Get Turnstile token (null -> undefined so the server schema omits it when widget is absent)
    const turnstileToken = formData.get('cf-turnstile-response') ?? undefined;

    // Honeypot check
    if (data.website) {
      setStatus('success');
      return;
    }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...meta, turnstileToken })
      });

      if (res.ok) {
        setStatus('success');
        setErrors({});

        // GA4 generate_lead + Meta Lead (ortak helper; rıza yoksa no-op)
        trackGenerateLead(String(data.type));
        pushEvent('lead_submission', {
          lead_type: data.type,
          guest_count: data.guestCount,
          budget_bucket: data.estimatedBudget
        });

        e.currentTarget.reset();
      } else {
        setStatus('error');
        if (res.status === 400) {
          const body = await res.json();
          if (body.errors?.fieldErrors) {
            setErrors(body.errors.fieldErrors);
          }
        }
      }
    } catch (err) {
      console.error('Lead submission failed:', err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="feature-box" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 className="serif">Talebiniz Alındı</h3>
        <p>Satış ekibimiz müsaitlik ve fiyat bilgisini kısa sürede paylaşacak. Teşekkür ederiz.</p>
        <button className="button secondary" onClick={() => setStatus('idle')}>Yeni Talep Gönder</button>
      </div>
    );
  }

  const renderError = (field: string) => {
    if (!errors[field]?.[0]) return null;
    return (
      <div style={{ color: "#b3925c", fontSize: "0.82rem", marginTop: "-18px", marginBottom: "16px", fontWeight: 500 }}>
        {errors[field][0]}
      </div>
    );
  };

  const getInputStyle = (field: string) => {
    if (errors[field]) {
      return { borderColor: "#c2410c", borderBottomWidth: "2px", marginBottom: "20px" };
    }
    return {};
  };

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div style={{ display: 'none' }}>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <input name="name" placeholder="Tam Adınız" required style={getInputStyle("name")} />
      {renderError("name")}

      <input name="phone" placeholder="Telefon Numaranız" required style={getInputStyle("phone")} />
      {renderError("phone")}

      <input name="email" placeholder="E-posta Adresiniz" type="email" style={getInputStyle("email")} />
      {renderError("email")}

      <input name="eventDate" placeholder="Etkinlik Tarihi" style={getInputStyle("eventDate")} />
      {renderError("eventDate")}

      <input name="guestCount" type="number" min={1} placeholder="Tahmini Kişi Sayısı" style={getInputStyle("guestCount")} />
      {renderError("guestCount")}
      
      <select
        name="estimatedBudget"
        aria-label="Tahmini bütçe"
        defaultValue=""
        style={getInputStyle("estimatedBudget")}
      >
        <option value="" disabled>Tahmini Bütçe</option>
        <option value="under-100k">100.000 TL altı</option>
        <option value="100k-250k">100.000 - 250.000 TL</option>
        <option value="250k-500k">250.000 - 500.000 TL</option>
        <option value="over-500k">500.000 TL üzeri</option>
      </select>
      {renderError("estimatedBudget")}

      <select
        name="type"
        aria-label="Organizasyon tercihi"
        required
        defaultValue=""
        style={getInputStyle("type")}
      >
        <option value="" disabled>Organizasyon Tercihi</option>
        <option value="dugun">Butik Düğün</option>
        <option value="nisan">Nişan / Söz</option>
        <option value="kurumsal">Kurumsal Etkinlik</option>
        <option value="ozel-kutlama">Özel Kutlama</option>
      </select>
      {renderError("type")}

      <textarea
        name="message"
        placeholder="Özel talepleriniz ve diğer notlar..."
        required
        style={getInputStyle("message")}
      />
      {renderError("message")}

      <label className="consent-row">
        <input type="checkbox" name="consent" required />
        <span>Kişisel verilerimin teklif ve bilgilendirme amacıyla işlenmesini kabul ediyorum.</span>
      </label>
      {renderError("consent")}

      {/* Cloudflare Turnstile Widget — only render when sitekey is configured */}
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          style={{ marginBottom: '16px' }}
        ></div>
      )}

      <button
        className="button primary"
        type="submit"
        style={{ width: '100%' }}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Gönderiliyor...' : 'Teklif Talebini Gönder'}
      </button>
      
      {status === 'error' && (
        <p style={{ color: '#c2410c', marginTop: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
          Talep gönderilemedi. Lütfen eksik/hatalı bilgileri kontrol edip tekrar deneyin.
        </p>
      )}
    </form>
  );
}
