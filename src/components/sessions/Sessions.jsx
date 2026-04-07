import { useState, useMemo } from 'react';
import { useSessions } from '../../hooks/useSessions';
import { useStudents } from '../../hooks/useStudents';
import { useEmployees } from '../../hooks/useEmployees';
import { usePermissions } from '../../hooks/usePermissions';
import Widget from '../ui/Widget';

const SESSION_TYPES = ['تخاطب ونطق','علاج وظيفي','علاج فيزيائي','تعديل سلوك','تطوير مهارات','متابعة','🌐 أونلاين','أخرى'];
const DURATIONS     = ['30 دقيقة','45 دقيقة','60 دقيقة','90 دقيقة'];
const RESULTS       = [
  { val: 'achieved', label: '✅ محقق',    cls: 'b-gr' },
  { val: 'partial',  label: '⚠️ جزئي',   cls: 'b-yw' },
  { val: 'notyet',   label: '❌ لم يتحقق', cls: 'b-rd' },
];
const REPEAT_OPTS = [
  { val: 'once',      label: 'مرة واحدة' },
  { val: 'weekly',    label: 'أسبوعياً (8 مواعيد)' },
  { val: 'biweekly',  label: 'كل أسبوعين (8 مواعيد)' },
];

export default function Sessions() {
  const { sessions, appts, addSession, updateSession, deleteSession, addAppt, updateApptStatus } = useSessions();
  const { activeStudents } = useStudents();
  const { specialists }    = useEmployees();
  const { canEditSessions } = usePermissions();

  const [tab, setTab]           = useState('sessions'); // sessions | appts
  const [filterStu, setFilterStu] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [formMode, setFormMode]   = useState('session'); // session | appt

  // ── فلتر الجلسات ──
  const filteredSessions = useMemo(() => {
    let list = [...sessions];
    if (filterStu) list = list.filter(s => s.stuId === filterStu);
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [sessions, filterStu]);

  // ── فلتر المواعيد ──
  const filteredAppts = useMemo(() => {
    let list = [...appts];
    if (filterStu) list = list.filter(a => a.stuId === filterStu);
    return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [appts, filterStu]);

  // إحصاءات
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today || s.nextDate === today).length;
  const pendingAppts  = appts.filter(a => a.status === 'scheduled' && a.date >= today).length;

  function openForm(mode, item = null) {
    setFormMode(mode);
    setEditItem(item);
    setShowForm(true);
  }

  function handleSave(data) {
    if (formMode === 'session') {
      editItem ? updateSession(editItem.id, data) : addSession(data);
    } else {
      addAppt(data);
    }
    setShowForm(false);
    setEditItem(null);
  }

  if (showForm) {
    return (
      <SessionForm
        mode={formMode}
        item={editItem}
        students={activeStudents}
        specialists={specialists}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditItem(null); }}
      />
    );
  }

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>🩺 الجلسات العلاجية</h2>
          <p>{sessions.length} جلسة مسجلة — {todaySessions} اليوم</p>
        </div>
        <div className="ph-a">
          {canEditSessions && (
            <>
              <button className="btn btn-p btn-sm" onClick={() => openForm('session')}>➕ جلسة جديدة</button>
              <button className="btn btn-c btn-sm" onClick={() => openForm('appt')}>📅 موعد جديد</button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card cyan"><div className="lb">إجمالي الجلسات</div><div className="vl">{sessions.length}</div></div>
        <div className="stat-card ok">  <div className="lb">جلسات اليوم</div>  <div className="vl">{todaySessions}</div></div>
        <div className="stat-card warn"><div className="lb">مواعيد قادمة</div> <div className="vl">{pendingAppts}</div></div>
        <div className="stat-card">    <div className="lb">إجمالي المواعيد</div><div className="vl">{appts.length}</div></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
        {[{ id: 'sessions', label: '🩺 الجلسات' }, { id: 'appts', label: '📅 المواعيد' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`btn ${tab === t.id ? 'btn-p' : 'btn-s'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Student filter */}
      <div style={{ marginBottom: 12 }}>
        <select value={filterStu} onChange={e => setFilterStu(e.target.value)}
          style={{ padding: '9px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%', maxWidth: 300 }}
        >
          <option value="">👦 كل الطلاب</option>
          {activeStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Sessions list */}
      {tab === 'sessions' && (
        <Widget noPadding>
          {filteredSessions.length === 0 ? (
            <div className="empty"><div className="ei">🩺</div><div className="et">لا توجد جلسات</div></div>
          ) : filteredSessions.map(sess => {
            const stu  = activeStudents.find(s => s.id === sess.stuId);
            const spec = specialists.find(e => e.id === sess.specId);
            const res  = RESULTS.find(r => r.val === sess.result);
            return (
              <div key={sess.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
                <div className="av purple" style={{ fontSize: '.82rem' }}>
                  {(stu?.name || '?').slice(0, 2)}
                </div>
                <div className="ci">
                  <div className="cn">{stu?.name || '—'} · {sess.type || '—'}</div>
                  <div className="cm">
                    {sess.date || '—'} · {sess.dur || ''} · {spec?.name || '—'}
                    {sess.num ? ` · جلسة #${sess.num}` : ''}
                  </div>
                  {sess.goal && <div className="cm">🎯 {sess.goal}</div>}
                  {sess.notes && <div className="cm" style={{ color: 'var(--g5)' }}>📝 {sess.notes.slice(0, 60)}</div>}
                  {sess.nextDate && <div className="cm" style={{ color: 'var(--pr)' }}>📅 القادمة: {sess.nextDate}</div>}
                </div>
                {res && <span className={`bdg ${res.cls}`}>{res.label}</span>}
                {canEditSessions && (
                  <div className="c-acts">
                    <button className="btn btn-s btn-xs" onClick={() => openForm('session', sess)}>✏️</button>
                    <button className="btn btn-d btn-xs" onClick={() => {
                      if (window.confirm('حذف هذه الجلسة؟')) deleteSession(sess.id);
                    }}>🗑️</button>
                  </div>
                )}
              </div>
            );
          })}
        </Widget>
      )}

      {/* Appointments list */}
      {tab === 'appts' && (
        <Widget noPadding>
          {filteredAppts.length === 0 ? (
            <div className="empty"><div className="ei">📅</div><div className="et">لا توجد مواعيد</div></div>
          ) : filteredAppts.map(appt => {
            const stu  = activeStudents.find(s => s.id === appt.stuId);
            const spec = specialists.find(e => e.id === appt.specId);
            const statusMap = {
              scheduled: { cls: 'b-bl', label: '📅 مجدول' },
              attended:  { cls: 'b-gr', label: '✅ حضر' },
              absent:    { cls: 'b-rd', label: '❌ غائب' },
              cancelled: { cls: 'b-gy', label: '🚫 ملغى' },
            };
            const st = statusMap[appt.status] || statusMap.scheduled;
            return (
              <div key={appt.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
                <div className="av cyan" style={{ fontSize: '1.2rem' }}>📅</div>
                <div className="ci">
                  <div className="cn">{stu?.name || '—'} · {appt.type || '—'}</div>
                  <div className="cm">
                    {appt.date || '—'} {appt.time ? `· ${appt.time}` : ''} · {spec?.name || '—'}
                    {appt.mode === 'online' ? ' 🌐' : ''}
                  </div>
                  {appt.link && <a href={appt.link} target="_blank" rel="noreferrer" className="cm" style={{ color: 'var(--pr)' }}>🔗 رابط الجلسة</a>}
                </div>
                <span className={`bdg ${st.cls}`}>{st.label}</span>
                {canEditSessions && appt.status === 'scheduled' && (
                  <div className="c-acts">
                    <button className="btn btn-g btn-xs" onClick={() => updateApptStatus(appt.id, 'attended')}>✅</button>
                    <button className="btn btn-d btn-xs" onClick={() => updateApptStatus(appt.id, 'absent')}>❌</button>
                  </div>
                )}
              </div>
            );
          })}
        </Widget>
      )}
    </div>
  );
}

// ── نموذج الجلسة / الموعد ──
function SessionForm({ mode, item, students, specialists, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const isSession = mode === 'session';

  const [form, setForm] = useState(item ? { ...item } : {
    stuId: '', specId: '', date: today, time: '',
    type: '', dur: '45 دقيقة', num: '',
    goal: '', notes: '', result: '', hw: '', nextDate: '',
    // appt fields
    mode: 'inperson', link: '', repeat: 'once', status: 'scheduled',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handleSubmit() {
    if (!form.stuId) { alert('⚠️ اختر الطالب'); return; }
    if (!form.date)  { alert('⚠️ أدخل التاريخ'); return; }
    if (!form.type)  { alert('⚠️ اختر نوع الجلسة'); return; }
    onSave(form);
  }

  const inputStyle = { padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%' };

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>{item ? '✏️ تعديل' : isSession ? '➕ جلسة جديدة' : '📅 موعد جديد'}</h2>
        </div>
        <div className="ph-a">
          <button className="btn btn-s btn-sm" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-p" onClick={handleSubmit}>💾 حفظ</button>
        </div>
      </div>
      <Widget>
        <div className="fg c2">
          <div className="fl">
            <label>الطالب <span className="req">*</span></label>
            <select value={form.stuId} onChange={e => set('stuId', e.target.value)} style={inputStyle}>
              <option value="">-- اختر --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>الأخصائي</label>
            <select value={form.specId} onChange={e => set('specId', e.target.value)} style={inputStyle}>
              <option value="">-- اختر --</option>
              {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>نوع الجلسة <span className="req">*</span></label>
            <select value={form.type} onChange={e => set('type', e.target.value)} style={inputStyle}>
              <option value="">-- اختر --</option>
              {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>المدة</label>
            <select value={form.dur} onChange={e => set('dur', e.target.value)} style={inputStyle}>
              {DURATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>التاريخ <span className="req">*</span></label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
          </div>
          <div className="fl">
            <label>الوقت</label>
            <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={inputStyle} />
          </div>

          {!isSession && (
            <>
              <div className="fl">
                <label>نوع الحضور</label>
                <select value={form.mode} onChange={e => set('mode', e.target.value)} style={inputStyle}>
                  <option value="inperson">🏥 حضوري</option>
                  <option value="online">🌐 أونلاين</option>
                </select>
              </div>
              <div className="fl">
                <label>التكرار</label>
                <select value={form.repeat} onChange={e => set('repeat', e.target.value)} style={inputStyle}>
                  {REPEAT_OPTS.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
                </select>
              </div>
              {form.mode === 'online' && (
                <div className="fl full">
                  <label>رابط الجلسة</label>
                  <input type="url" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://meet.google.com/..." style={inputStyle} />
                </div>
              )}
            </>
          )}

          {isSession && (
            <>
              <div className="fl">
                <label>رقم الجلسة</label>
                <input type="number" value={form.num} onChange={e => set('num', e.target.value)} placeholder="1" style={inputStyle} />
              </div>
              <div className="fl">
                <label>النتيجة</label>
                <select value={form.result} onChange={e => set('result', e.target.value)} style={inputStyle}>
                  <option value="">-- اختر --</option>
                  {RESULTS.map(r => <option key={r.val} value={r.val}>{r.label}</option>)}
                </select>
              </div>
              <div className="fl">
                <label>الموعد القادم</label>
                <input type="date" value={form.nextDate} onChange={e => set('nextDate', e.target.value)} style={inputStyle} />
              </div>
            </>
          )}
        </div>

        {isSession && (
          <>
            <div className="fl">
              <label>هدف الجلسة</label>
              <input value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="ما الهدف من هذه الجلسة..." style={inputStyle} />
            </div>
            <div className="fl">
              <label>ملخص الجلسة</label>
              <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="ما تم إنجازه..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div className="fl">
              <label>الواجب المنزلي / التوصيات</label>
              <textarea rows={2} value={form.hw} onChange={e => set('hw', e.target.value)} placeholder="ما يجب على الأسرة تطبيقه..." style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </>
        )}

        {!isSession && form.notes !== undefined && (
          <div className="fl">
            <label>ملاحظات</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="أي ملاحظات..." style={inputStyle} />
          </div>
        )}
      </Widget>
    </div>
  );
}
