export default function HikayemizLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="skeleton skeleton-header" />
      <div className="container" style={{ paddingTop: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton skeleton-text" style={{ width: '300px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '500px', margin: '0 auto 48px' }} />
        <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '12px', marginBottom: '32px' }} />
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton skeleton-text" style={{ width: i % 3 === 0 ? '80%' : '100%', marginBottom: '12px' }} />
        ))}
        <div style={{ height: '32px' }} />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton skeleton-text" style={{ width: i % 2 === 0 ? '90%' : '100%', marginBottom: '12px' }} />
        ))}
      </div>
    </div>
  );
}
