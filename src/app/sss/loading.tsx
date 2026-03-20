export default function SSSLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton skeleton-text" style={{ width: '280px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '450px', margin: '0 auto 48px' }} />
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="skeleton skeleton-text" style={{ width: `${60 + (i % 3) * 10}%`, marginBottom: '0' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
