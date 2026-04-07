import { useState, useMemo } from 'react';
import { useStorage, generateId } from '../../hooks/useStorage';
import { useStudents } from '../../hooks/useStudents';
import { useEmployees } from '../../hooks/useEmployees';
import { usePermissions } from '../../hooks/usePermissions';
import { useApp } from '../../context/AppContext';
import Widget from '../ui/Widget';

export default function Online() {
  const { toast } = useApp();
  const { students, activeStudents } = useStudents();
  const { specialists } = useEmployees();
  const { canEditSessions } = usePermissions();

  const [online, setOnline]   = useStorage('online', []);
  const [appts]               = useStorage('appts',  []);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailStu, setDetailStu] = useState(null);

  // طلاب الأونلاين
  const onlineStudents = useMemo(() =>
    activeStudents.filter(s => s.progOnline?.enabled),
    [activeStudents]
  );

  const stats = {
    total:    onlineStudents.length,
    sessions: online.length,
    done:     online.filter(s => s.status === 'done').length,
    pending:  appts.filter(a => a.mode === 'online' && a.status === 'scheduled').length,
  };

  function addSession(data) {
    const s = { ...data, id: generateId(), _t: Date.now() };
    setOnline(prev => [s, ...prev]);
    toast('✅ تم تسجيل الجلسة', 'ok');
    setShowForm(false);
  }

  function deleteSession(id) {
    if (!window.confirm('حذف هذه الجلسة؟')) return;
    setOnline(prev => prev.filter(s => s.id !== id));
    toast('🗑️ تم الحذف', 'ok');
  }

  // ── تفصيل طالب ──
  if (detailStu) {
    const s = students.find(x => x.id === detailStu);
    if (!s) { setDetailStu(null); return null; }
    const stuSessions = online.filter(o => o.stuId === detailStu).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const stuAppts    = appts.filter(a => a.stuId === detailStu).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const spec = specialists.find(e => e.id === s.specId);
    const waPhone = (s.parentPhone || '').replace(/[^0-9+]/g, '').replace(/^0/, '966');

    return (
      <div className="page">
        <div className="ph">
          <div className="ph-t">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setDetailStu(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--pr)' }}>← رجوع</button>
              🌐 {s.name}
            </h2>
            <p>{s.diag || '—'} · {spec?.name || '—'}</p>
          </div>
          <div className="ph-a">
            {waPhone && <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className="btn btn-g btn-sm">💬</a>}
            {s.progOnline?.link && <a href={s.progOnline.link} target="_blank" rel="noreferrer" className="btn btn-c btn-sm">🔗 رابط الجلسة</a>}
            {canEditSessions && <button className="btn btn-p btn-sm" onClick={() => { setEditItem({ stuId: detailStu }); setShowForm(true); }}>➕ جلسة</button>}
          </div>
        </div>

        <div className="stats">
          <div className="stat-card cyan"><div className="lb">الجلسات</div><div className="vl">{stuSessions.length}</div></div>
          <div className="stat-card ok">  <div className="lb">منتهية</div>   <div className="vl">{stuSessions.filter(x => x.status === 'done').length}</div></div>
          <div className="stat-card warn"><div className="lb">المواعيد</div>  <div className="vl">{stuAppts.length}</div></div>
        </div>

        <Widget title="🩺 الجلسات" noPadding>
          {stuSessions.length === 0
            ? <div className="empty"><div className="et">لا توجد جلسات بعد</div></div>
            : stuSessions.map(sess => (
              <SessionRow key={sess.id} sess={sess} specialists={specialists} onDelete={deleteSession} canEdit={canEditSessions} />
            ))
          }
        </Widget>
      </div>
    );
  }

  // ── نموذج إضافة جلسة ──
  if (showForm) {
    return (
      <OnlineForm
        item={editItem}
        students={onlineStudents}
        specialists={specialists}
        onSave={addSession}
        onCancel={() => { setShowForm(false); setEditItem(null); }}
      />
    );
  }

  // ── القائمة الرئيسية ──
  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>🌐 الأونلاين</h2>
          <p>{stats.total} طالب · {stats.sessions} جلسة مسجلة</p>
        </div>
        <div className="ph-a">
          {canEditSessions && (
            <button className="btn btn-p" onClick={() => { setEditItem(null); setShowForm(true); }}>➕ جلسة جديدة</button>
          )}
        </div>
      </div>

      <div className="stats">
        <div className="stat-card cyan"><div className="lb">طلاب الأونلاين</div><div className="vl">{stats.total}</div></div>
        <div className="stat-card ok">  <div className="lb">جلسات منتهية</div><div className="vl">{stats.done}</div></div>
        <div className="stat-card">    <div className="lb">إجمالي الجلسات</div><div className="vl">{stats.sessions}</div></div>
        <div className="stat-card warn"><div className="lb">مواعيد معلقة</div><div className="vl">{stats.pending}</div></div>
      </div>

      <Widget noPadding>
        {onlineStudents.length === 0
          ? <div className="empty"><div className="ei">🌐</div><div className="et">لا يوجد طلاب أونلاين — فعّل برنامج الأونلاين في ملف الطالب</div></div>
          : onlineStudents.map(s => {
            const spec = specialists.find(e => e.id === s.specId);
            const stuSess = online.filter(o => o.stuId === s.id);
            const lastSess = [...stuSess].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
            const waPhone = (s.parentPhone || '').replace(/[^0-9+]/g, '').replace(/^0/, '966');

            return (
              <div key={s.id} className="card clickable" onClick={() => setDetailStu(s.id)}
                style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}
              >
                <div className="av cyan">🌐</div>
                <div className="ci">
                  <div className="cn">{s.name}</div>
                  <div className="cm">{s.diag || '—'} · {spec?.name || '—'}</div>
                  {lastSess && <div className="cm">آخر جلسة: {lastSess.date}</div>}
                </div>
                <div className="c-badges">
                  <span className="bdg b-cy">{stuSess.length} جلسة</span>
                  {s.progOnline?.link && (
                    <a href={s.progOnline.link} target="_blank" rel="noreferrer"
                      className="bdg b-bl" onClick={e => e.stopPropagation()} style={{ textDecoration: 'none' }}>🔗</a>
                  )}
                  {waPhone && (
                    <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer"
                      className="bdg b-gr" onClick={e => e.stopPropagation()} style={{ textDecoration: 'none' }}>💬</a>
                  )}
                </div>
              </div>
            );
          })
        }
      </Widget>
    </div>
  );
}

function SessionRow({ sess, specialists, onDelete, canEdit }) {
  const spec = specialists.find(e => e.id === sess.specId);
  const statusMap = { done: { cls: 'b-gr', label: '✅ منتهية' }, pending: { cls: 'b-yw', label: '⏳ قادمة' }, cancelled: { cls: 'b-rd', label: '❌ ملغاة' } };
  const st = statusMap[sess.status] || { cls: 'b-gy', label: '—' };

  return (
    <div className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
      <div className="ci">
        <div className="cn">{sess.type || 'جلسة'} · {sess.date || '—'} {sess.time ? `· ${sess.time}` : ''}</div>
        <div className="cm">{spec?.name || '—'}{sess.goal ? ` · ${sess.goal}` : ''}</div>
        {sess.link && <a href={sess.link} target="_blank" rel="noreferrer" style={{ fontSize: '.74rem', color: 'var(--pr)' }}>🔗 رابط الاجتماع</a>}
      </div>
      <span className={`bdg ${st.cls}`}>{st.label}</span>
      {canEdit && <button className="btn btn-d btn-xs" onClick={() => onDelete(sess.id)}>🗑️</button>}
    </div>
  );
}

function OnlineForm({ item, students, specialists, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ stuId: item?.stuId || '', specId: '', type: 'متابعة', date: today, time: '', dur: '45 دقيقة', link: '', goal: '', status: 'done' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%' };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t"><h2>🌐 تسجيل جلسة أونلاين</h2></div>
        <div className="ph-a">
          <button className="btn btn-s btn-sm" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-p" onClick={() => { if (!form.stuId || !form.date) { alert('⚠️ الطالب والتاريخ مطلوبان'); return; } onSave(form); }}>💾 حفظ</button>
        </div>
      </div>
      <Widget>
        <div className="fg c2">
          <div className="fl"><label>الطالب <span className="req">*</span></label>
            <select value={form.stuId} onChange={e => set('stuId', e.target.value)} style={inp}>
              <option value="">-- اختر --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="fl"><label>الأخصائي</label>
            <select value={form.specId} onChange={e => set('specId', e.target.value)} style={inp}>
              <option value="">-- اختر --</option>
              {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="fl"><label>نوع الجلسة</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={inp}>
              {['متابعة','تقييم','علاج','استشارة','أخرى'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="fl"><label>الحالة</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} style={inp}>
              <option value="done">✅ منتهية</option>
              <option value="pending">⏳ قادمة</option>
              <option value="cancelled">❌ ملغاة</option>
            </select>
          </div>
          <div className="fl"><label>التاريخ <span className="req">*</span></label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} /></div>
          <div className="fl"><label>الوقت</label><input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={inp} /></div>
          <div className="fl"><label>المدة</label>
            <select value={form.dur} onChange={e => set('dur', e.target.value)} style={inp}>
              {['30 دقيقة','45 دقيقة','60 دقيقة','90 دقيقة'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="fl"><label>رابط الاجتماع</label><input type="url" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://meet.google.com/..." style={inp} /></div>
        </div>
        <div className="fl"><label>هدف الجلسة</label><input value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="ما الهدف من هذه الجلسة..." style={inp} /></div>
      </Widget>
    </div>
  );
}
