export default function GaleriLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px' }}>
      <div className="container">
        <div className="skeleton skeleton-text" style={{ width: '200px', margin: '0 auto 16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '400px', margin: '0 auto 48px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <div key={i} className="skeleton" style={{ width: '100%', height: '240px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
