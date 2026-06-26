/**
 * Route-seviyesi Suspense fallback'i. Navigasyon ve sunucu stream'i sırasında
 * anlık, markaya uygun bir yükleniyor durumu gösterir (boş ekran yerine).
 * Erişilebilir: role="status" + aria-live, ekran okuyucu için sr-only metin.
 */
export default function Loading() {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        textAlign: 'center',
      }}
    >
      <style>{`@keyframes kk-spin{to{transform:rotate(360deg)}}`}</style>
      <span
        aria-hidden="true"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '3px solid rgba(92,107,76,0.22)',
          borderTopColor: '#5c6b4c',
          animation: 'kk-spin 0.9s linear infinite',
        }}
      />
      <p
        style={{
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          fontSize: '0.74rem',
          color: '#7a7256',
        }}
      >
        Yükleniyor
      </p>
      <span className="sr-only">İçerik yükleniyor, lütfen bekleyin.</span>
    </main>
  );
}
