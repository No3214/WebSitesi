export default function BlogDetailLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton skeleton-text" style={{ width: '120px', marginBottom: '16px', height: '14px' }} />
        <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: '12px', height: '32px' }} />
        <div className="skeleton skeleton-text" style={{ width: '200px', marginBottom: '32px', height: '14px' }} />
        <div className="skeleton" style={{ width: '100%', height: '400px', borderRadius: '12px', marginBottom: '40px' }} />
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="skeleton skeleton-text" style={{ width: i % 4 === 0 ? '75%' : '100%', marginBottom: '12px' }} />
        ))}
        <div style={{ height: '24px' }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton skeleton-text" style={{ width: i % 3 === 0 ? '85%' : '100%', marginBottom: '12px' }} />
        ))}
      </div>
    </div>
  );
}
