export default function GastronomiLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="skeleton skeleton-header" />
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="skeleton skeleton-text" style={{ width: '280px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '500px', margin: '0 auto 48px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i}>
              <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '12px', marginBottom: '16px' }} />
              <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '8px' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
