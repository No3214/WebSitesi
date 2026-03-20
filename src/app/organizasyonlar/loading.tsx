export default function OrganizasyonlarLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="skeleton skeleton-header" />
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="skeleton skeleton-text" style={{ width: '300px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '500px', margin: '0 auto 48px' }} />
        <div className="card-grid">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="skeleton" style={{ width: '100%', height: '220px' }} />
              <div style={{ padding: '24px' }}>
                <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '12px' }} />
                <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '8px' }} />
                <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '16px' }} />
                <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: '8px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
