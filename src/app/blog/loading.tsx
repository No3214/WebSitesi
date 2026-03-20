export default function BlogLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container">
        <div className="skeleton skeleton-text" style={{ width: '200px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '400px', margin: '0 auto 48px' }} />
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="skeleton" style={{ width: '100%', height: '200px' }} />
              <div style={{ padding: '20px' }}>
                <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '8px', height: '12px' }} />
                <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '12px' }} />
                <div className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '6px', height: '12px' }} />
                <div className="skeleton skeleton-text" style={{ width: '70%', height: '12px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
