import { useState } from 'react';
import { useStorage, generateId } from '../../hooks/useStorage';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import Widget from '../ui/Widget';

const VISIT_TYPES = {
  gov:           { icon: '🏛️', label: 'حكومية' },
  board:         { icon: '📋', label: 'مجلس الإدارة' },
  institutional: { icon: '🏢', label: 'مؤسسية' },
  community:     { icon: '🤝', label: 'مجتمعية' },
  private:       { icon: '👤', label: 'خاصة' },
  other:         { icon: '📌', label: 'أخرى' },
};

export default function Center() {
  const { toast, center } = useApp();
  const { canManage } = usePermissions();

  const [visits, setVisits] = useStorage('center_visits', []);
  const [tab, setTab]       = useState('visits');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editVisit, setEditVisit] = useState(null);

  const filteredVisits = [...visits]
    .filter(v => filter === 'all' || v.type === filter)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  function saveVisit(data) {
    if (editVisit) {
      setVisits(prev => prev.map(v => v.id === editVisit.id ? { ...v, ...data } : v));
      toast('✅ تم التحديث', 'ok');
    } else {
      setVisits(prev => [{ ...data, id: generateId() }, ...prev]);
      toast('✅ تم تسجيل الزيارة', 'ok');
    }
    setShowForm(false);
    setEditVisit(null);
  }

  function deleteVisit(id) {
    if (!window.confirm('حذف هذه الزيارة؟')) return;
    setVisits(prev => prev.filter(v => v.id !== id));
    toast('🗑️ تم الحذف', 'ok');
  }

  if (showForm) {
    return (
      <VisitForm
        visit={editVisit}
        onSave={saveVisit}
        onCancel={() => { setShowForm(false); setEditVisit(null); }}
      />
    );
  }

  // إحصاءات سريعة
  const thisYear = new Date().getFullYear().toString();
  const yearVisits = visits.filter(v => v.date?.startsWith(thisYear));
  const totalVisitors = visits.reduce((s, v) => s + (Number(v.count) || 1), 0);

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>🏛️ إدارة المركز</h2>
          <p>{visits.length} زيارة مسجلة · {yearVisits.length} هذا العام</p>
        </div>
        <div className="ph-a">
          {canManage && (
            <button className="btn btn-p" onClick={() => { setEditVisit(null); setShowForm(true); }}>➕ تسجيل زيارة</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card"><div className="lb">إجمالي الزيارات</div><div className="vl">{visits.length}</div></div>
        <div className="stat-card ok"><div className="lb">زيارات هذا العام</div><div className="vl">{yearVisits.length}</div></div>
        <div className="stat-card cyan"><div className="lb">إجمالي الزوار</div><div className="vl">{totalVisitors}</div></div>
        <div className="stat-card pur"><div className="lb">زيارات حكومية</div><div className="vl">{visits.filter(v => v.type === 'gov').length}</div></div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 2, marginBottom: 14, background: 'var(--bg-card)', borderRadius: 'var(--r)', border: '1px solid var(--border-color)', padding: '0 4px' }}>
        {[{ id: 'all', label: 'الكل' }, ...Object.entries(VISIT_TYPES).map(([id, v]) => ({ id, label: `${v.icon} ${v.label}` }))].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            style={{ padding: '10px 12px', border: 'none', background: 'transparent', borderBottom: filter === t.id ? '2px solid var(--pr)' : '2px solid transparent', color: filter === t.id ? 'var(--pr)' : 'var(--g5)', fontWeight: filter === t.id ? 800 : 600, fontSize: '.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
          >{t.label}</button>
        ))}
      </div>

      {/* Visits list */}
      <Widget noPadding>
        {filteredVisits.length === 0
          ? <div className="empty"><div className="ei">🏛️</div><div className="et">لا توجد زيارات — اضغط "تسجيل زيارة"</div></div>
          : filteredVisits.map(v => {
            const vt = VISIT_TYPES[v.type] || VISIT_TYPES.other;
            return (
              <div key={v.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
                <div className="av cyan" style={{ fontSize: '1.4rem' }}>{vt.icon}</div>
                <div className="ci">
                  <div className="cn">
                    {vt.label}{v.name ? ` — ${v.name}` : ''}
                    {v.count > 1 && <span className="bdg b-cy" style={{ marginRight: 8 }}>{v.count} زائر</span>}
                  </div>
                  <div className="cm">
                    {v.date ? new Date(v.date).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </div>
                  {v.notes && <div className="cm" style={{ color: 'var(--g6)' }}>{v.notes}</div>}
                </div>
                {canManage && (
                  <div className="c-acts">
                    <button className="btn btn-s btn-xs" onClick={() => { setEditVisit(v); setShowForm(true); }}>✏️</button>
                    <button className="btn btn-d btn-xs" onClick={() => deleteVisit(v.id)}>🗑️</button>
                  </div>
                )}
              </div>
            );
          })
        }
      </Widget>

      {/* Center info card */}
      <Widget title="ℹ️ معلومات المركز">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
          {[
            ['الاسم',  center.name],
            ['الهاتف', center.phone],
            ['البريد', center.email],
            ['العنوان', center.address],
          ].filter(([, v]) => v).map(([label, val]) => (
            <div key={label}>
              <span style={{ fontSize: '.72rem', color: 'var(--g5)' }}>{label}: </span>
              <span style={{ fontWeight: 700, fontSize: '.85rem' }}>{val}</span>
            </div>
          ))}
        </div>
        {!center.name && (
          <div style={{ color: 'var(--g4)', fontSize: '.84rem' }}>
            أكمل بيانات المركز من صفحة الإعدادات ⚙️
          </div>
        )}
      </Widget>
    </div>
  );
}

// ── نموذج تسجيل الزيارة ──
function VisitForm({ visit, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    type: 'gov', name: '', date: today,
    count: 1, notes: '',
    ...visit,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%' };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t"><h2>{visit ? '✏️ تعديل الزيارة' : '🏛️ تسجيل زيارة جديدة'}</h2></div>
        <div className="ph-a">
          <button className="btn btn-s btn-sm" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-p" onClick={() => { if (!form.date) { alert('⚠️ التاريخ مطلوب'); return; } onSave(form); }}>💾 حفظ</button>
        </div>
      </div>
      <Widget>
        <div className="fg c2">
          <div className="fl">
            <label>جهة الزيارة <span className="req">*</span></label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={inp}>
              {Object.entries(VISIT_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
          <div className="fl">
            <label>اسم الجهة / الوفد</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="مثال: وزارة التعليم" style={inp} />
          </div>
          <div className="fl">
            <label>التاريخ <span className="req">*</span></label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} />
          </div>
          <div className="fl">
            <label>عدد الزوار</label>
            <input type="number" min="1" value={form.count} onChange={e => set('count', parseInt(e.target.value) || 1)} style={inp} />
          </div>
        </div>
        <div className="fl">
          <label>ملاحظات</label>
          <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="تفاصيل الزيارة وأهدافها..." style={{ ...inp, resize: 'vertical' }} />
        </div>
      </Widget>
    </div>
  );
}
