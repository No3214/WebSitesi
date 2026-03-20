export default function KurumsalLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="skeleton skeleton-text" style={{ width: '250px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '450px', margin: '0 auto 48px' }} />
        {[1, 2, 3].map(section => (
          <div key={section} style={{ marginBottom: '40px' }}>
            <div className="skeleton skeleton-text" style={{ width: '200px', marginBottom: '16px' }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton skeleton-text" style={{ width: i % 3 === 0 ? '85%' : '100%', marginBottom: '10px' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
