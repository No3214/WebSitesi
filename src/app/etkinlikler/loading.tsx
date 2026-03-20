export default function EtkinliklerLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container">
        <div className="skeleton skeleton-text" style={{ width: '250px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '450px', margin: '0 auto 48px' }} />
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      </div>
    </div>
  );
}
