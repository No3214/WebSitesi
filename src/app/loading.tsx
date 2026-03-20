export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="skeleton skeleton-header" />
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="skeleton skeleton-text" style={{ width: '200px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '400px', margin: '0 auto 48px' }} />
        <div className="card-grid">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      </div>
    </div>
  );
}
