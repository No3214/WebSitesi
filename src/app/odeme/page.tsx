"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShieldCheck } from "lucide-react";

export default function PaymentPage() {
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
            {status === "form" && (
              <>
                <h2 className="serif">Güvenli Ödeme</h2>
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
      <SiteFooter />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
