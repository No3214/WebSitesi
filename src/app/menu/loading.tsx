export default function MenuLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container">
        <div className="skeleton skeleton-text" style={{ width: '200px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '400px', margin: '0 auto 48px' }} />
        {[1, 2, 3].map(section => (
          <div key={section} style={{ marginBottom: '48px' }}>
            <div className="skeleton skeleton-text" style={{ width: '180px', marginBottom: '24px' }} />
            {[1, 2, 3, 4].map(item => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text" style={{ width: '200px', marginBottom: '8px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '300px', height: '12px' }} />
                </div>
                <div className="skeleton skeleton-text" style={{ width: '60px' }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
