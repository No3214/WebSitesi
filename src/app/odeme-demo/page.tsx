"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function PaymentDemoPage() {
  const [status, setStatus] = useState<"form" | "processing" | "success">("form");

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");
    // Simulate 3D Secure / Payment Gateway processing
    setTimeout(() => {
      setStatus("success");
    }, 2000);
  };

  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="detail-box" style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--soft)', border: '1px solid var(--gold)', padding: '12px', borderRadius: '4px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
              <AlertTriangle color="var(--gold)" size={24} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                <strong>DİKKAT:</strong> Bu bir ödeme simülasyonudur. Gerçek bir işlem yapılmaz.
              </p>
            </div>
            {status === "form" && (
              <>
                <h2 className="serif">Rezervasyon Simülasyonu (Demo)</h2>
                <p style={{ color: '#666', marginBottom: '32px' }}>
                  Rezervasyonunuzu tamamlamak için lütfen ödeme detaylarını giriniz.
                </p>
                <form onSubmit={handlePayment} className="lead-form" style={{ padding: 0, boxShadow: 'none' }}>
                  <input type="text" placeholder="Kart Üzerindeki İsim" required />
                  <input type="text" placeholder="Kart Numarası" required />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="AA / YY" required />
                    <input type="text" placeholder="CVC" required />
                  </div>
                  <div style={{ padding: '16px', background: 'var(--soft)', borderRadius: '4px', marginBottom: '24px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="var(--olive)" />
                    <span>Ödemeniz 256-bit SSL ile korunmaktadır.</span>
                  </div>
                  <button type="submit" className="button primary" style={{ width: '100%' }}>
                    GÜVENLİ ÖDE (3D SECURE)
                  </button>
                </form>
              </>
            )}

            {status === "processing" && (
              <div style={{ padding: '60px 0' }}>
                 <div className="loading-spinner" style={{ border: '4px solid var(--soft)', borderTop: '4px solid var(--gold)', borderRadius: '50%', width: '40px', height: '40px', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                 <p className="serif">Bankanıza Yönlendiriliyorsunuz...</p>
                 <p style={{ fontSize: '0.8rem', color: '#999' }}>Lütfen sayfayı kapatmayınız.</p>
              </div>
            )}

            {status === "success" && (
              <div style={{ padding: '60px 0' }}>
                 <div style={{ background: 'var(--olive)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <ShieldCheck color="white" size={32} />
                 </div>
                 <h2 className="serif">İşlem Başarılı!</h2>
                 <p>Rezervasyonunuz onaylandı. Onay detayları e-posta adresinize gönderilmiştir.</p>
                 <Link href="/" className="button secondary" style={{ marginTop: '32px' }}>ANASAYFAYA DÖN</Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
