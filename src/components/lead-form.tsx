"use client";

import { useEffect, useState } from 'react';

import { pushEvent, trackGenerateLead } from '@/lib/gtm';
import { publicEnv } from '@/lib/public-env';

type LeadStatus = 'idle' | 'loading' | 'success' | 'error';

type MarketingMeta = {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
};

type LeadFormLocale = "tr" | "en";

const leadFormCopy = {
  tr: {
    successTitle: "Talebiniz Alındı",
    successText: "Satış ekibimiz müsaitlik ve fiyat bilgisini kısa sürede paylaşacak. Teşekkür ederiz.",
    newRequest: "Yeni Talep Gönder",
    placeholders: {
      name: "Tam Adınız",
      phone: "Telefon Numaranız",
      email: "E-posta Adresiniz",
      eventDate: "Etkinlik Tarihi",
      guestCount: "Tahmini Kişi Sayısı",
      message: "Özel talepleriniz ve diğer notlar...",
    },
    labels: {
      name: "Tam adınız",
      phone: "Telefon numaranız",
      email: "E-posta adresiniz",
      eventDate: "Etkinlik tarihi",
      guestCount: "Tahmini kişi sayısı",
      estimatedBudget: "Tahmini bütçe",
      type: "Organizasyon tercihi",
      message: "Özel talepleriniz ve diğer notlar",
    },
    budget: {
      label: "Tahmini bütçe",
      placeholder: "Tahmini Bütçe",
      under100k: "100.000 TL altı",
      from100kTo250k: "100.000 - 250.000 TL",
      from250kTo500k: "250.000 - 500.000 TL",
      over500k: "500.000 TL üzeri",
    },
    eventType: {
      label: "Organizasyon tercihi",
      placeholder: "Organizasyon Tercihi",
      wedding: "Butik Düğün",
      engagement: "Nişan / Söz",
      corporate: "Kurumsal Etkinlik",
      privateCelebration: "Özel Kutlama",
    },
    consent: "Kişisel verilerimin teklif ve bilgilendirme amacıyla işlenmesini kabul ediyorum.",
    loading: "Gönderiliyor...",
    submit: "Teklif Talebini Gönder",
    error: "Talep gönderilemedi. Lütfen eksik/hatalı bilgileri kontrol edip tekrar deneyin.",
  },
  en: {
    successTitle: "Request Received",
    successText: "Our team will share availability and proposal details shortly. Thank you.",
    newRequest: "Send Another Request",
    placeholders: {
      name: "Full Name",
      phone: "Phone Number",
      email: "Email Address",
      eventDate: "Event Date",
      guestCount: "Estimated Guest Count",
      message: "Special requests and additional notes...",
    },
    labels: {
      name: "Full name",
      phone: "Phone number",
      email: "Email address",
      eventDate: "Event date",
      guestCount: "Estimated guest count",
      estimatedBudget: "Estimated budget",
      type: "Event preference",
      message: "Special requests and additional notes",
    },
    budget: {
      label: "Estimated budget",
      placeholder: "Estimated Budget",
      under100k: "Under 100,000 TL",
      from100kTo250k: "100,000 - 250,000 TL",
      from250kTo500k: "250,000 - 500,000 TL",
      over500k: "Over 500,000 TL",
    },
    eventType: {
      label: "Event preference",
      placeholder: "Event Preference",
      wedding: "Boutique Wedding",
      engagement: "Engagement / Promise Ceremony",
      corporate: "Corporate Event",
      privateCelebration: "Private Celebration",
    },
    consent: "I consent to the processing of my personal data for proposal and information purposes.",
    loading: "Sending...",
    submit: "Send Proposal Request",
    error: "The request could not be sent. Please check missing or incorrect details and try again.",
  },
} as const;

export function LeadForm({ locale = "tr" }: { locale?: LeadFormLocale }) {
  const [status, setStatus] = useState<LeadStatus>('idle');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [meta, setMeta] = useState<MarketingMeta>({
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    referrer: ''
  });
  const t = leadFormCopy[locale];

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
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="feature-box" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 className="serif">{t.successTitle}</h3>
        <p>{t.successText}</p>
        <button className="button secondary" onClick={() => setStatus('idle')}>{t.newRequest}</button>
      </div>
    );
  }

  const renderError = (field: string) => {
    if (!errors[field]?.[0]) return null;
    return (
      <div
        id={errorId(field)}
        role="alert"
        style={{ color: "#c2410c", fontSize: "0.82rem", marginTop: "-18px", marginBottom: "16px", fontWeight: 500 }}
      >
        {errors[field][0]}
      </div>
    );
  };

  const fieldId = (field: string) => `lead-${locale}-${field}`;
  const errorId = (field: string) => `${fieldId(field)}-error`;
  const hasError = (field: string) => Boolean(errors[field]?.[0]);

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

      <label className="sr-only" htmlFor={fieldId("name")}>{t.labels.name}</label>
      <input
        id={fieldId("name")}
        name="name"
        placeholder={t.placeholders.name}
        required
        aria-invalid={hasError("name") || undefined}
        aria-describedby={hasError("name") ? errorId("name") : undefined}
        style={getInputStyle("name")}
      />
      {renderError("name")}

      <label className="sr-only" htmlFor={fieldId("phone")}>{t.labels.phone}</label>
      <input
        id={fieldId("phone")}
        name="phone"
        placeholder={t.placeholders.phone}
        required
        aria-invalid={hasError("phone") || undefined}
        aria-describedby={hasError("phone") ? errorId("phone") : undefined}
        style={getInputStyle("phone")}
      />
      {renderError("phone")}

      <label className="sr-only" htmlFor={fieldId("email")}>{t.labels.email}</label>
      <input
        id={fieldId("email")}
        name="email"
        placeholder={t.placeholders.email}
        type="email"
        aria-invalid={hasError("email") || undefined}
        aria-describedby={hasError("email") ? errorId("email") : undefined}
        style={getInputStyle("email")}
      />
      {renderError("email")}

      <label className="sr-only" htmlFor={fieldId("eventDate")}>{t.labels.eventDate}</label>
      <input
        id={fieldId("eventDate")}
        name="eventDate"
        placeholder={t.placeholders.eventDate}
        aria-invalid={hasError("eventDate") || undefined}
        aria-describedby={hasError("eventDate") ? errorId("eventDate") : undefined}
        style={getInputStyle("eventDate")}
      />
      {renderError("eventDate")}

      <label className="sr-only" htmlFor={fieldId("guestCount")}>{t.labels.guestCount}</label>
      <input
        id={fieldId("guestCount")}
        name="guestCount"
        type="number"
        min={1}
        placeholder={t.placeholders.guestCount}
        aria-invalid={hasError("guestCount") || undefined}
        aria-describedby={hasError("guestCount") ? errorId("guestCount") : undefined}
        style={getInputStyle("guestCount")}
      />
      {renderError("guestCount")}
      
      <label className="sr-only" htmlFor={fieldId("estimatedBudget")}>{t.labels.estimatedBudget}</label>
      <select
        id={fieldId("estimatedBudget")}
        name="estimatedBudget"
        defaultValue=""
        aria-invalid={hasError("estimatedBudget") || undefined}
        aria-describedby={hasError("estimatedBudget") ? errorId("estimatedBudget") : undefined}
        style={getInputStyle("estimatedBudget")}
      >
        <option value="" disabled>{t.budget.placeholder}</option>
        <option value="under-100k">{t.budget.under100k}</option>
        <option value="100k-250k">{t.budget.from100kTo250k}</option>
        <option value="250k-500k">{t.budget.from250kTo500k}</option>
        <option value="over-500k">{t.budget.over500k}</option>
      </select>
      {renderError("estimatedBudget")}

      <label className="sr-only" htmlFor={fieldId("type")}>{t.labels.type}</label>
      <select
        id={fieldId("type")}
        name="type"
        required
        defaultValue=""
        aria-invalid={hasError("type") || undefined}
        aria-describedby={hasError("type") ? errorId("type") : undefined}
        style={getInputStyle("type")}
      >
        <option value="" disabled>{t.eventType.placeholder}</option>
        <option value="dugun">{t.eventType.wedding}</option>
        <option value="nisan">{t.eventType.engagement}</option>
        <option value="kurumsal">{t.eventType.corporate}</option>
        <option value="ozel-kutlama">{t.eventType.privateCelebration}</option>
      </select>
      {renderError("type")}

      <label className="sr-only" htmlFor={fieldId("message")}>{t.labels.message}</label>
      <textarea
        id={fieldId("message")}
        name="message"
        placeholder={t.placeholders.message}
        required
        aria-invalid={hasError("message") || undefined}
        aria-describedby={hasError("message") ? errorId("message") : undefined}
        style={getInputStyle("message")}
      />
      {renderError("message")}

      <label className="consent-row">
        <input type="checkbox" name="consent" required />
        <span>{t.consent}</span>
      </label>
      {renderError("consent")}

      {/* Cloudflare Turnstile Widget — only render when sitekey is configured */}
      {publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div
          className="cf-turnstile"
          data-sitekey={publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          style={{ marginBottom: '16px' }}
        ></div>
      )}

      <button
        className="button primary"
        type="submit"
        style={{ width: '100%' }}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? t.loading : t.submit}
      </button>
      
      {status === 'error' && (
        <p style={{ color: '#c2410c', marginTop: '10px', fontSize: '0.9rem', fontWeight: 500 }}>
          {t.error}
        </p>
      )}
    </form>
  );
}
