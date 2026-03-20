export default function GrowthLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container">
        <div className="skeleton skeleton-hero" style={{ height: '60px', maxWidth: '400px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '500px', maxWidth: '100%', margin: '0 auto 48px' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '200px', marginBottom: '24px' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '200px', marginBottom: '24px' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '200px' }} />
      </div>
    </div>
  );
}
