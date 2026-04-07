// مكوّن الـ Widget — الصندوق المستخدم في كل الصفحات

export default function Widget({ title, actions, children, noPadding = false }) {
  return (
    <div className="wg">
      {title && (
        <div className="wg-h">
          <h3>{title}</h3>
          {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
        </div>
      )}
      <div className={`wg-b ${noPadding ? 'p0' : ''}`}>
        {children}
      </div>
    </div>
  );
}
