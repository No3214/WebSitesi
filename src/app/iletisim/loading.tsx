export default function IletisimLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container">
        <div className="skeleton skeleton-text" style={{ width: '200px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '400px', margin: '0 auto 48px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          <div>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ marginBottom: '24px' }}>
                <div className="skeleton skeleton-text" style={{ width: '100px', marginBottom: '8px', height: '14px' }} />
                <div className="skeleton" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
              </div>
            ))}
            <div style={{ marginBottom: '24px' }}>
              <div className="skeleton skeleton-text" style={{ width: '100px', marginBottom: '8px', height: '14px' }} />
              <div className="skeleton" style={{ width: '100%', height: '120px', borderRadius: '8px' }} />
            </div>
            <div className="skeleton" style={{ width: '160px', height: '48px', borderRadius: '8px' }} />
          </div>
          <div>
            <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '12px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
