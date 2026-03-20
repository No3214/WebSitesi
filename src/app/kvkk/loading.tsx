export default function KVKKLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton skeleton-text" style={{ width: '320px', margin: '0 auto 48px', height: '28px' }} />
        {[1, 2, 3, 4].map(section => (
          <div key={section} style={{ marginBottom: '32px' }}>
            <div className="skeleton skeleton-text" style={{ width: '200px', marginBottom: '16px', height: '20px' }} />
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton skeleton-text" style={{ width: i % 3 === 0 ? '85%' : '100%', marginBottom: '10px' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
