import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const COLORS = ['#1a56db','#059669','#7c3aed','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];

export default function SetupWizard() {
  const { saveConfig, toast } = useApp();
  const [step, setStep]  = useState(0); // 0=المركز, 1=Firebase (اختياري)
  const [logo, setLogo]  = useState('');
  const [form, setForm]  = useState({
    name: '', color: '#1a56db',
    address: '', phone: '', email: '',
  });
  const [fb, setFb] = useState({
    apiKey: '', projectId: '', authDomain: '',
    storageBucket: '', messagingSenderId: '', appId: '',
  });
  const [error, setError] = useState('');

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  }

  function validateStep0() {
    if (!form.name.trim()) { setError('اسم المركز مطلوب'); return false; }
    setError(''); return true;
  }

  function handleFinish() {
    saveConfig(
      { ...form, logo, configured: true },
      fb
    );
    toast('✅ تم إعداد المركز بنجاح', 'ok');
  }

  return (
    <div id="sw" style={{ display: 'flex' }}>
      <div className="sw-box">
        {/* Header */}
        <div className="sw-hd">
          <div className="icon">🏫</div>
          <h1>إعداد المركز المتكامل</h1>
          <p>أدخل بيانات مركزك لبدء الاستخدام</p>
          {/* Steps dots */}
          <div className="sw-steps" style={{ marginTop: 14 }}>
            {[0, 1].map(i => (
              <div key={i} className={`sw-dot ${step === i ? 'on' : ''}`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="sw-body">
          {step === 0 && (
            <>
              {/* Logo */}
              <div className="sw-sec">
                <div className="sw-sec-t">🏫 هوية المركز</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                  <label className="sw-logo-box" title="اضغط لرفع الشعار">
                    {logo
                      ? <img src={logo} alt="شعار" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : '📷'
                    }
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                  </label>
                  <div style={{ flex: 1 }}>
                    <div className="sw-f">
                      <label>اسم المركز <span className="req">*</span></label>
                      <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="مثال: مركز الأمل للتعليم الخاص"
                      />
                    </div>
                  </div>
                </div>

                {/* Color picker */}
                <div className="sw-f">
                  <label>لون المركز</label>
                  <div className="sw-colors">
                    {COLORS.map(c => (
                      <div
                        key={c}
                        className={`sw-chip ${form.color === c ? 'sel' : ''}`}
                        style={{ background: c }}
                        onClick={() => setForm(p => ({ ...p, color: c }))}
                      />
                    ))}
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                      style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer' }}
                      title="لون مخصص"
                    />
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="sw-sec">
                <div className="sw-sec-t">📞 بيانات التواصل (اختياري)</div>
                <div className="sw-g c3">
                  <div className="sw-f">
                    <label>رقم الهاتف</label>
                    <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+966..." />
                  </div>
                  <div className="sw-f">
                    <label>البريد الإلكتروني</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="sw-f">
                    <label>العنوان</label>
                    <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                  </div>
                </div>
              </div>

              {error && <div className="sw-err" style={{ display: 'block' }}>{error}</div>}
            </>
          )}

          {step === 1 && (
            <>
              <div className="sw-note">
                💡 Firebase اختياري — النظام يعمل بدونه باستخدام التخزين المحلي. أضفه فقط إذا أردت مزامنة البيانات بين أجهزة متعددة.
              </div>
              <div className="sw-sec">
                <div className="sw-sec-t">🔥 إعدادات Firebase (اختياري)</div>
                <div className="sw-g">
                  {Object.keys(fb).map(key => (
                    <div key={key} className="sw-f">
                      <label>{key}</label>
                      <input
                        value={fb[key]}
                        onChange={e => setFb(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={`أدخل ${key}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sw-footer">
          {step > 0 && (
            <button className="sw-btn sw-btn-s" onClick={() => setStep(s => s - 1)}>
              السابق
            </button>
          )}
          {step === 0 && (
            <>
              <button
                className="sw-btn sw-btn-s"
                onClick={() => {
                  if (!validateStep0()) return;
                  setStep(1);
                }}
              >
                التالي: Firebase →
              </button>
              <button
                className="sw-btn sw-btn-g"
                onClick={() => {
                  if (!validateStep0()) return;
                  handleFinish();
                }}
              >
                ✅ بدء بدون Firebase
              </button>
            </>
          )}
          {step === 1 && (
            <button className="sw-btn sw-btn-p" onClick={handleFinish}>
              🚀 بدء استخدام النظام
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
