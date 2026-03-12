"use client";

import { useEffect, useState } from 'react';

type LeadStatus = 'idle' | 'loading' | 'success' | 'error';

type MarketingMeta = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
};

// Define explicit types for marketing globals
interface MarketingWindow extends Window {
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
}

export function LeadForm() {
  const [status, setStatus] = useState<LeadStatus>('idle');
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

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Honeypot check
    if (data.website) {
      setStatus('success');
      return;
    }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...meta })
      });

      if (res.ok) {
        setStatus('success');
        
        // Trigger Marketing Events with typed window
        const mWindow = window as unknown as MarketingWindow;
        
        if (mWindow.fbq) {
          mWindow.fbq('track', 'Lead', {
            content_name: String(data.type),
            value: 0,
            currency: 'TRY'
          });
        }

        if (mWindow.dataLayer) {
          mWindow.dataLayer.push({
            event: 'lead_submission',
            lead_type: data.type,
            guest_count: data.guestCount,
            budget_bucket: data.estimatedBudget
          });
        }

        e.currentTarget.reset();
      } else {
        setStatus('error');
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

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div style={{ display: 'none' }}>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <input name="name" placeholder="Tam Adınız" required />
      <input name="phone" placeholder="Telefon Numaranız" required />
      <input name="email" placeholder="E-posta Adresiniz" type="email" />
      <input name="eventDate" placeholder="Etkinlik Tarihi" />
      <input name="guestCount" type="number" min={1} placeholder="Tahmini Kişi Sayısı" />
      
      <select name="estimatedBudget" defaultValue="">
        <option value="" disabled>Tahmini Bütçe</option>
        <option value="under-100k">100.000 TL altı</option>
        <option value="100k-250k">100.000 - 250.000 TL</option>
        <option value="250k-500k">250.000 - 500.000 TL</option>
        <option value="over-500k">500.000 TL üzeri</option>
      </select>

      <select name="type" required defaultValue="">
        <option value="" disabled>Organizasyon Tercihi</option>
        <option value="dugun">Butik Düğün</option>
        <option value="nisan">Nişan / Söz</option>
        <option value="kurumsal">Kurumsal Etkinlik</option>
        <option value="ozel-kutlama">Özel Kutlama</option>
      </select>

      <textarea
        name="message"
        placeholder="Özel talepleriniz ve diğer notlar..."
        required
      />

      <label className="consent-row">
        <input type="checkbox" name="consent" required />
        <span>Kişisel verilerimin teklif ve bilgilendirme amacıyla işlenmesini kabul ediyorum.</span>
      </label>

      <button
        className="button primary"
        type="submit"
        style={{ width: '100%' }}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Gönderiliyor...' : 'Teklif Talebini Gönder'}
      </button>
      
      {status === 'error' && (
        <p style={{ color: 'red', marginTop: '10px' }}>Bir hata oluştu. Lütfen tekrar deneyin.</p>
      )}
    </form>
  );
}
