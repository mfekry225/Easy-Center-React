import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLES } from '../../utils/constants';
import Widget from '../ui/Widget';

const COLORS = ['#1a56db','#059669','#7c3aed','#dc2626','#d97706','#0891b2','#db2777','#0f172a'];

// ══════════════════════════════════════════════════════════
//  Settings — يحل محل renderSettings() في الملف الأصلي
// ══════════════════════════════════════════════════════════

export default function Settings() {
  const { center, setCenter, saveConfig, fbCfg, resetConfig, toast, isDark, setIsDark } = useApp();
  const { isManager } = usePermissions();

  const [form, setForm] = useState({ ...center });
  const [logo, setLogo]  = useState(center.logo || '');

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.name?.trim()) { toast('⚠️ اسم المركز مطلوب', 'er'); return; }
    saveConfig({ ...form, logo, configured: true }, fbCfg);
    toast('✅ تم حفظ الإعدادات', 'ok');
  }

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>⚙️ الإعدادات</h2>
          <p>إعدادات المركز والنظام</p>
        </div>
      </div>

      {/* Center info */}
      <Widget title="🏫 بيانات المركز">
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Logo */}
          <label style={{ cursor: 'pointer' }}>
            <div className="sw-logo-box" style={{ width: 80, height: 80, borderRadius: '50%', border: '3px dashed var(--g3)', background: 'var(--g1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden' }}>
              {logo
                ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '📷'
              }
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
          </label>

          {/* Fields */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="fg c2">
              <div className="fl">
                <label>اسم المركز <span className="req">*</span></label>
                <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="fl">
                <label>رقم الهاتف</label>
                <input value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="fl">
                <label>البريد الإلكتروني</label>
                <input value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="fl">
                <label>العنوان</label>
                <input value={form.address || ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>

            {/* Color */}
            <div className="fl">
              <label>لون المركز</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {COLORS.map(c => (
                  <div
                    key={c}
                    onClick={() => setForm(p => ({ ...p, color: c }))}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: c, cursor: 'pointer',
                      border: form.color === c ? '3px solid var(--g9)' : '3px solid transparent',
                      transform: form.color === c ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all .15s',
                    }}
                  />
                ))}
                <input type="color" value={form.color || '#1a56db'} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer' }} />
              </div>
            </div>

            {isManager && (
              <button className="btn btn-p" onClick={handleSave}>💾 حفظ الإعدادات</button>
            )}
          </div>
        </div>
      </Widget>

      {/* Appearance */}
      <Widget title="🎨 المظهر">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.9rem' }}>الوضع الليلي</div>
            <div style={{ fontSize: '.76rem', color: 'var(--g5)', marginTop: 2 }}>تغيير مظهر النظام</div>
          </div>
          <button
            className={`btn ${isDark ? 'btn-p' : 'btn-s'}`}
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? '☀️ نهاري' : '🌙 ليلي'}
          </button>
        </div>
      </Widget>

      {/* Roles info */}
      <Widget title="🔐 كلمات مرور الأدوار">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.84rem' }}>
            <thead>
              <tr>
                {['الدور', 'الأيقونة', 'كلمة المرور', 'الصلاحيات'].map(h => (
                  <th key={h} style={{ textAlign: 'right', padding: '8px 12px', background: 'var(--g1)', borderBottom: '1px solid var(--border-color)', fontWeight: 800 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(ROLES).map(role => (
                <tr key={role.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '9px 12px', fontWeight: 700 }}>{role.label}</td>
                  <td style={{ padding: '9px 12px' }}>{role.icon}</td>
                  <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: 'var(--pr)' }}>{role.password}</td>
                  <td style={{ padding: '9px 12px', color: 'var(--g5)', fontSize: '.76rem' }}>{role.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '.72rem', color: 'var(--g4)', marginTop: 10 }}>
            * في الإنتاج، يجب تخزين كلمات المرور في Firebase Authentication أو قاعدة بيانات مشفّرة
          </p>
        </div>
      </Widget>

      {/* Danger zone */}
      {isManager && (
        <Widget title="⚠️ منطقة الخطر">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--err)' }}>إعادة إعداد المركز</div>
              <div style={{ fontSize: '.78rem', color: 'var(--g5)', marginTop: 3 }}>
                يمسح إعدادات المركز فقط — البيانات تبقى
              </div>
            </div>
            <button className="btn btn-d" onClick={resetConfig}>
              🔄 إعادة الإعداد
            </button>
          </div>
        </Widget>
      )}
    </div>
  );
}
