// صفحة placeholder — تُستبدل لاحقاً بالمحتوى الحقيقي لكل module

export default function PlaceholderPage({ title, icon, description }) {
  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>{icon} {title}</h2>
          <p>{description || 'هذا الـ module قيد التطوير'}</p>
        </div>
      </div>
      <div className="wg">
        <div className="wg-b" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--g4)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>{icon}</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: '.82rem' }}>
            سيتم نقل هذا القسم من الملف الأصلي قريباً
          </div>
        </div>
      </div>
    </div>
  );
}
