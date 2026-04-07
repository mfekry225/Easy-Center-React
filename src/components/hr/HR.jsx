import { useState, useMemo } from 'react';
import { useEmployees } from '../../hooks/useEmployees';
import { usePermissions } from '../../hooks/usePermissions';
import Widget from '../ui/Widget';

const JOB_ROLES = [
  { val: 'specialist_speech',       label: 'أخصائي تخاطب ونطق' },
  { val: 'specialist_physio',       label: 'أخصائي علاج فيزيائي' },
  { val: 'specialist_behavior',     label: 'أخصائي تعديل سلوك' },
  { val: 'specialist_occupational', label: 'أخصائي علاج وظيفي' },
  { val: 'specialist',              label: 'أخصائي (عام)' },
  { val: 'admin',                   label: 'إداري' },
  { val: 'reception',               label: 'استقبال' },
  { val: 'accountant',              label: 'محاسب' },
  { val: 'worker',                  label: 'عامل' },
  { val: 'other',                   label: 'أخرى' },
];

const HR_TABS = [
  { id: 'all',        label: 'الكل' },
  { id: 'specialist', label: '🩺 أخصائيون' },
  { id: 'admin',      label: '📋 إداريون' },
  { id: 'reception',  label: '🗂️ استقبال' },
  { id: 'worker',     label: '🔧 عمال' },
];

function roleLabel(role) {
  return JOB_ROLES.find(r => r.val === role)?.label || role || '—';
}

export default function HR() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { canManage } = usePermissions();

  const [tab, setTab]         = useState('all');
  const [query, setQuery]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editEmp, setEditEmp]   = useState(null);
  const [detail, setDetail]     = useState(null);

  const filtered = useMemo(() => {
    let list = [...employees];
    if (tab !== 'all') list = list.filter(e => (e.role || '').includes(tab));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e => (e.name || '').toLowerCase().includes(q) || (e.phone || '').includes(q));
    }
    return list;
  }, [employees, tab, query]);

  function openForm(emp = null) { setEditEmp(emp); setShowForm(true); }

  function handleSave(data) {
    editEmp ? updateEmployee(editEmp.id, data) : addEmployee(data);
    setShowForm(false); setEditEmp(null);
  }

  function handleDelete(id) {
    const e = employees.find(x => x.id === id);
    if (!window.confirm(`⚠️ حذف الموظف "${e?.name}"؟`)) return;
    if (!window.confirm('🔴 تأكيد نهائي — لا يمكن التراجع')) return;
    deleteEmployee(id); setDetail(null); setShowForm(false);
  }

  // ── Detail view ──
  if (detail) {
    const emp = employees.find(e => e.id === detail) || {};
    return (
      <div className="page">
        <div className="ph">
          <div className="ph-t">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--pr)' }}>← رجوع</button>
              {emp.name}
            </h2>
            <p>{roleLabel(emp.role)}</p>
          </div>
          <div className="ph-a">
            {emp.phone && (
              <a href={`https://wa.me/${(emp.phone).replace(/[^0-9+]/g,'').replace(/^0/,'966')}`} target="_blank" rel="noreferrer" className="btn btn-g btn-sm">💬</a>
            )}
            {canManage && (
              <>
                <button className="btn btn-s btn-sm" onClick={() => { openForm(emp); setDetail(null); }}>✏️ تعديل</button>
                <button className="btn btn-d btn-sm" onClick={() => handleDelete(emp.id)}>🗑️</button>
              </>
            )}
          </div>
        </div>
        <Widget>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px 20px' }}>
            {[
              ['المسمى الوظيفي', roleLabel(emp.role)],
              ['رقم الجوال',     emp.phone],
              ['البريد',         emp.email],
              ['الجنسية',        emp.nationality],
              ['تاريخ الميلاد',  emp.dob],
              ['رقم الهوية',     emp.nationalId],
              ['تاريخ التعيين',  emp.hireDate],
              ['نوع العقد',      emp.contractType],
              ['انتهاء العقد',   emp.contractEnd],
              ['الراتب الأساسي', emp.salary ? `${emp.salary} ر.س` : null],
              ['بدل السكن',      emp.housingAllowance ? `${emp.housingAllowance} ر.س` : null],
              ['بدل النقل',      emp.transportAllowance ? `${emp.transportAllowance} ر.س` : null],
              ['IBAN',            emp.iban],
              ['العنوان',        emp.address],
            ].filter(([, v]) => v).map(([label, val]) => (
              <div key={label}>
                <span style={{ fontSize: '.72rem', color: 'var(--g5)' }}>{label}: </span>
                <span style={{ fontSize: '.85rem', fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
          {emp.notes && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--g1)', borderRadius: 8, fontSize: '.82rem', color: 'var(--g6)' }}>
              📝 {emp.notes}
            </div>
          )}
        </Widget>
      </div>
    );
  }

  // ── Form view ──
  if (showForm) {
    return (
      <EmpForm emp={editEmp} onSave={handleSave} onCancel={() => { setShowForm(false); setEditEmp(null); }}
        onDelete={editEmp ? () => handleDelete(editEmp.id) : null}
      />
    );
  }

  // ── List view ──
  const stats = {
    total:  employees.length,
    active: employees.filter(e => e.status !== 'inactive').length,
    expiring: employees.filter(e => {
      if (!e.contractEnd) return false;
      return Math.round((new Date(e.contractEnd) - new Date()) / 864e5) <= 30;
    }).length,
  };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>👥 الموظفون</h2>
          <p>{stats.total} موظف — {stats.active} نشط</p>
        </div>
        <div className="ph-a">
          {canManage && (
            <button className="btn btn-p" onClick={() => openForm()}>➕ موظف جديد</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card"><div className="lb">إجمالي الموظفين</div><div className="vl">{stats.total}</div></div>
        <div className="stat-card ok"><div className="lb">نشطون</div><div className="vl">{stats.active}</div></div>
        <div className="stat-card warn"><div className="lb">عقود تنتهي قريباً</div><div className="vl">{stats.expiring}</div></div>
        <div className="stat-card cyan"><div className="lb">أخصائيون</div>
          <div className="vl">{employees.filter(e => (e.role || '').includes('specialist')).length}</div>
        </div>
      </div>

      {/* Tabs + Search */}
      <Widget noPadding>
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', padding: '0 4px', gap: 2 }}>
          {HR_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '10px 14px', border: 'none', background: 'transparent', borderBottom: tab === t.id ? '2px solid var(--pr)' : '2px solid transparent', color: tab === t.id ? 'var(--pr)' : 'var(--g5)', fontWeight: tab === t.id ? 800 : 600, fontSize: '.82rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
            >{t.label}</button>
          ))}
        </div>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)' }}>
          <input type="text" placeholder="🔍 ابحث بالاسم أو الجوال..." value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', padding: '9px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none' }}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty"><div className="ei">👥</div><div className="et">لا يوجد موظفون</div></div>
        ) : filtered.map(e => (
          <div key={e.id} className="card clickable" onClick={() => setDetail(e.id)}
            style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}
          >
            <div className="av blue" style={{ fontSize: e.photo ? 0 : '.82rem', overflow: 'hidden' }}>
              {e.photo ? <img src={e.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (e.name || '?').slice(0, 2)}
            </div>
            <div className="ci">
              <div className="cn">{e.name}</div>
              <div className="cm">{roleLabel(e.role)} {e.phone ? `· ${e.phone}` : ''}</div>
              {e.contractEnd && (
                <div className="cm" style={{ color: Math.round((new Date(e.contractEnd) - new Date()) / 864e5) <= 30 ? 'var(--warn)' : 'var(--g5)' }}>
                  📃 ينتهي: {e.contractEnd}
                </div>
              )}
            </div>
            <div className="c-badges">
              <span className={`bdg ${e.status === 'inactive' ? 'b-gy' : 'b-gr'}`}>
                {e.status === 'inactive' ? '⏸️ غير نشط' : '✅ نشط'}
              </span>
            </div>
          </div>
        ))}
      </Widget>
    </div>
  );
}

// ── نموذج الموظف ──
function EmpForm({ emp, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState({
    name: '', role: '', phone: '', email: '', dob: '', gender: '',
    nationality: '', nationalId: '', address: '',
    hireDate: '', contractType: '', contractEnd: '',
    salary: '', housingAllowance: '', transportAllowance: '', iban: '',
    status: 'active', notes: '', photo: '',
    workDays: [], workStart: '08:00', workEnd: '16:00',
    ...emp,
  });
  const [tab, setTab] = useState('basic');
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handlePhoto(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = ev => set('photo', ev.target.result); r.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.name?.trim()) { alert('⚠️ الاسم مطلوب'); return; }
    if (!form.role)         { alert('⚠️ المسمى الوظيفي مطلوب'); return; }
    if (!form.phone?.trim()) { alert('⚠️ رقم الجوال مطلوب'); return; }
    onSave(form);
  }

  const inputStyle = { padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%' };
  const TAB_S = (id) => ({ padding: '9px 16px', border: 'none', background: 'transparent', borderBottom: tab === id ? '2px solid var(--pr)' : '2px solid transparent', color: tab === id ? 'var(--pr)' : 'var(--g5)', fontWeight: tab === id ? 800 : 600, fontSize: '.83rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' });

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t"><h2>{emp ? `✏️ تعديل: ${emp.name}` : '➕ موظف جديد'}</h2></div>
        <div className="ph-a">
          {onDelete && <button className="btn btn-d btn-sm" onClick={onDelete}>🗑️ حذف</button>}
          <button className="btn btn-s btn-sm" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-p" onClick={handleSubmit}>💾 حفظ</button>
        </div>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
        <button style={TAB_S('basic')}    onClick={() => setTab('basic')}>👤 أساسي</button>
        <button style={TAB_S('contract')} onClick={() => setTab('contract')}>💼 وظيفي</button>
      </div>

      {tab === 'basic' && (
        <Widget>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px dashed var(--g3)', background: 'var(--g1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: form.photo ? 0 : '1.6rem', overflow: 'hidden' }}>
                {form.photo ? <img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📷'}
              </div>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            </label>
            <div style={{ flex: 1 }}>
              <div className="fg c2">
                <div className="fl"><label>الاسم الكامل <span className="req">*</span></label><input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} /></div>
                <div className="fl"><label>المسمى الوظيفي <span className="req">*</span></label>
                  <select value={form.role} onChange={e => set('role', e.target.value)} style={inputStyle}>
                    <option value="">-- اختر --</option>
                    {JOB_ROLES.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
                  </select>
                </div>
                <div className="fl"><label>رقم الجوال <span className="req">*</span></label><input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="05xxxxxxxx" style={inputStyle} /></div>
                <div className="fl"><label>الجنس</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)} style={inputStyle}>
                    <option value="">--</option><option>ذكر</option><option>أنثى</option>
                  </select>
                </div>
                <div className="fl"><label>البريد الإلكتروني</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} /></div>
                <div className="fl"><label>الجنسية</label><input value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="سعودي" style={inputStyle} /></div>
                <div className="fl"><label>رقم الهوية / الإقامة</label><input value={form.nationalId} onChange={e => set('nationalId', e.target.value)} style={inputStyle} /></div>
                <div className="fl"><label>تاريخ الميلاد</label><input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} style={inputStyle} /></div>
                <div className="fl"><label>الحالة</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                    <option value="active">✅ نشط</option>
                    <option value="inactive">⏸️ غير نشط</option>
                  </select>
                </div>
                <div className="fl"><label>العنوان</label><input value={form.address} onChange={e => set('address', e.target.value)} style={inputStyle} /></div>
              </div>
              <div className="fl"><label>ملاحظات</label>
                <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>
          </div>
        </Widget>
      )}

      {tab === 'contract' && (
        <Widget>
          <div className="fg c2">
            <div className="fl"><label>تاريخ التعيين</label><input type="date" value={form.hireDate} onChange={e => set('hireDate', e.target.value)} style={inputStyle} /></div>
            <div className="fl"><label>نوع العقد</label>
              <select value={form.contractType} onChange={e => set('contractType', e.target.value)} style={inputStyle}>
                <option value="">--</option>
                <option>دوام كامل</option><option>دوام جزئي</option>
                <option>عقد محدد المدة</option><option>متعاقد</option>
              </select>
            </div>
            <div className="fl"><label>تاريخ انتهاء العقد</label><input type="date" value={form.contractEnd} onChange={e => set('contractEnd', e.target.value)} style={inputStyle} /></div>
            <div className="fl"><label>الراتب الأساسي (ريال)</label><input type="number" min="0" value={form.salary} onChange={e => set('salary', e.target.value)} style={inputStyle} /></div>
            <div className="fl"><label>بدل السكن</label><input type="number" min="0" value={form.housingAllowance} onChange={e => set('housingAllowance', e.target.value)} style={inputStyle} /></div>
            <div className="fl"><label>بدل النقل</label><input type="number" min="0" value={form.transportAllowance} onChange={e => set('transportAllowance', e.target.value)} style={inputStyle} /></div>
            <div className="fl"><label>رقم IBAN</label><input value={form.iban} onChange={e => set('iban', e.target.value)} placeholder="SA..." style={inputStyle} /></div>
          </div>
        </Widget>
      )}
    </div>
  );
}
