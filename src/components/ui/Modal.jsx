// مكوّن المودال — يحل محل showModal/closeModal في الملف الأصلي

export default function Modal({ title, subtitle, onClose, children, footer, maxWidth = 640 }) {
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose?.();
  }

  return (
    <div className="mbg" onClick={handleBackdrop}>
      <div className="mb" style={{ maxWidth }}>
        {/* Header */}
        <div className="fhd">
          <h2>{title}</h2>
          {subtitle && <p style={{ opacity: .8, fontSize: '.78rem', marginTop: 3 }}>{subtitle}</p>}
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="fa">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
