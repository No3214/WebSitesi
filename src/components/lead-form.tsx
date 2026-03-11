'use client'

import { useState } from 'react'

export function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    // Honeypot check
    if (data.website) {
      setStatus('success') // Fake success for bots
      return
    }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setStatus('success')
        // Trigger Meta Pixel Lead Event
        const fbq = (window as any).fbq
        if (typeof window !== 'undefined' && fbq) {
          fbq('track', 'Lead', {
            content_name: data.type,
            value: 0,
            currency: 'TRY'
          })
        }
        // Trigger GTM Event
        const dataLayer = (window as any).dataLayer
        if (typeof window !== 'undefined' && dataLayer) {
            dataLayer.push({
                event: 'lead_submission',
                lead_type: data.type
            })
        }
      } else {
        setStatus('error')
      }
    } catch (err) {
      console.error('Lead submission failed:', err)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="feature-box" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 className="serif">Talebiniz Alındı</h3>
        <p>En kısa sürede sizinle iletişime geçeceğiz. Teşekkür ederiz.</p>
        <button className="button secondary" onClick={() => setStatus('idle')}>Yeni Talep Gönder</button>
      </div>
    )
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      {/* Honeypot field */}
      <div style={{ display: 'none' }}>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <input name="name" placeholder="Tam Adınız" required />
      <input name="phone" placeholder="Telefon Numaranız" required />
      <input name="email" placeholder="E-posta Adresiniz" type="email" />
      <input name="eventDate" placeholder="Etkinlik Tarihi (AA/GG/YYYY)" />
      <select name="type" required defaultValue="">
        <option value="" disabled>Organizasyon Tercihi</option>
        <option value="dugun">Butik Düğün</option>
        <option value="nisan">Nişan / Söz</option>
        <option value="kurumsal">Kurumsal Etkinlik</option>
        <option value="ozel-kutlama">Özel Kutlama</option>
      </select>
      <textarea
        name="message"
        placeholder="Özel talepleriniz, kişi sayısı ve diğer notlar..."
        required
      />
      <button 
        className="button primary" 
        type="submit" 
        style={{ width: '100%' }}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Gönderiliyor...' : 'Teklif Talebini Gönder'}
      </button>
      {status === 'error' && <p style={{ color: 'red', marginTop: '10px' }}>Bir hata oluştu. Lütfen tekrar deneyin.</p>}
    </form>
  )
}
