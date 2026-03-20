export default function RoomDetailLoading() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
      <div className="skeleton" style={{ width: '100%', height: '500px', marginBottom: '40px' }} />
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          <div>
            <div className="skeleton skeleton-text" style={{ width: '300px', marginBottom: '16px', height: '28px' }} />
            <div className="skeleton skeleton-text" style={{ width: '150px', marginBottom: '32px' }} />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton skeleton-text" style={{ width: i % 3 === 0 ? '80%' : '100%', marginBottom: '12px' }} />
            ))}
            <div style={{ height: '32px' }} />
            <div className="skeleton skeleton-text" style={{ width: '180px', marginBottom: '16px', height: '22px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton skeleton-text" style={{ width: '100%', marginBottom: '8px' }} />
              ))}
            </div>
          </div>
          <div>
            <div className="skeleton" style={{ width: '100%', height: '300px', borderRadius: '12px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
