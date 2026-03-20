export default function OdemeLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="skeleton skeleton-text" style={{ width: '200px', margin: '0 auto 48px' }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ marginBottom: '24px' }}>
            <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '8px', height: '14px' }} />
            <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
          </div>
        ))}
        <div style={{ height: '16px' }} />
        <div className="skeleton" style={{ width: '100%', height: '52px', borderRadius: '8px' }} />
      </div>
    </div>
  );
}
