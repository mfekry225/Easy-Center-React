import { useState } from 'react';
import { useIEP } from '../../hooks/useIEP';
import { useStudents } from '../../hooks/useStudents';
import { usePermissions } from '../../hooks/usePermissions';
import { generateId } from '../../hooks/useStorage';
import Widget from '../ui/Widget';

const DOMAINS    = ['تواصل ولغة','مهارات اجتماعية','مهارات أكاديمية','مهارات حياة يومية','حركية','سلوكية','أخرى'];
const PRIORITIES = [{ val: 'high', label: '⚡ عالية' }, { val: 'medium', label: '🔵 متوسطة' }, { val: 'low', label: '⬇️ منخفضة' }];

export default function IEP() {
  const { iep, stats, upcomingReviews, addGoal, updateGoal, updateProgress, deleteGoal } = useIEP();
  const { activeStudents } = useStudents();
  const { canEditStudents } = usePermissions();

  const [selectedStu, setSelectedStu] = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editGoal, setEditGoal]       = useState(null);

  const stuGoals = selectedStu ? iep.filter(g => g.stuId === selectedStu) : iep;

  // تجميع حسب المجال
  const byDomain = stuGoals.reduce((acc, g) => {
    if (!acc[g.domain]) acc[g.domain] = [];
    acc[g.domain].push(g);
    return acc;
  }, {});

  function openForm(goal = null) {
    setEditGoal(goal);
    setShowForm(true);
  }

  function handleSave(data) {
    if (editGoal) {
      updateGoal(editGoal.id, data);
    } else {
      addGoal(data.stuId, data);
    }
    setShowForm(false);
    setEditGoal(null);
  }

  if (showForm) {
    return (
      <GoalForm
        goal={editGoal}
        students={activeStudents}
        defaultStuId={selectedStu}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditGoal(null); }}
      />
    );
  }

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>🎯 أهداف IEP</h2>
          <p>الخطط التعليمية الفردية — {stats.total} هدف</p>
        </div>
        <div className="ph-a">
          {canEditStudents && (
            <button className="btn btn-p" onClick={() => openForm()}>➕ هدف جديد</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">    <div className="lb">إجمالي الأهداف</div><div className="vl">{stats.total}</div></div>
        <div className="stat-card ok"> <div className="lb">مكتملة 100%</div>   <div className="vl">{stats.done}</div></div>
        <div className="stat-card warn"><div className="lb">مراجعة قريبة</div>  <div className="vl">{stats.reviews}</div></div>
        <div className="stat-card cyan"><div className="lb">الطلاب</div>         <div className="vl">{[...new Set(iep.map(g => g.stuId))].length}</div></div>
      </div>

      {/* Upcoming reviews alert */}
      {upcomingReviews.length > 0 && (
        <div style={{ background: 'var(--warn-l)', border: '1px solid var(--warn)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 14 }}>
          <div style={{ fontWeight: 800, color: 'var(--warn)', marginBottom: 6 }}>
            ⚠️ {upcomingReviews.length} هدف يحتاج مراجعة خلال 7 أيام
          </div>
          {upcomingReviews.slice(0, 3).map(g => {
            const stu = activeStudents.find(s => s.id === g.stuId);
            return (
              <div key={g.id} style={{ fontSize: '.8rem', color: 'var(--g7)', marginTop: 3 }}>
                • {stu?.name || '—'}: {g.goal?.slice(0, 40)}… ({g.reviewDate})
              </div>
            );
          })}
        </div>
      )}

      {/* Student filter */}
      <div style={{ marginBottom: 14 }}>
        <select
          value={selectedStu}
          onChange={e => setSelectedStu(e.target.value)}
          style={{ padding: '9px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%', maxWidth: 340 }}
        >
          <option value="">👦 كل الطلاب ({iep.length} هدف)</option>
          {activeStudents.filter(s => iep.some(g => g.stuId === s.id)).map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({iep.filter(g => g.stuId === s.id).length} هدف)
            </option>
          ))}
        </select>
      </div>

      {/* Goals by domain */}
      {Object.keys(byDomain).length === 0 ? (
        <Widget>
          <div className="empty">
            <div className="ei">🎯</div>
            <div className="et">لا توجد أهداف — اضغط "هدف جديد" للبدء</div>
          </div>
        </Widget>
      ) : Object.entries(byDomain).map(([domain, goals]) => (
        <Widget
          key={domain}
          title={`📌 ${domain}`}
          actions={<span className="bdg b-bl">{goals.length} هدف</span>}
        >
          {goals.map(g => {
            const stu = activeStudents.find(s => s.id === g.stuId);
            const pct = g.pct || 0;
            return (
              <div key={g.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    {/* Student + Priority */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                      {stu && <span className="bdg b-pu">{stu.name}</span>}
                      <span className={`bdg ${g.priority === 'high' ? 'b-rd' : g.priority === 'low' ? 'b-gy' : 'b-yw'}`}>
                        {PRIORITIES.find(p => p.val === g.priority)?.label || '🔵 متوسطة'}
                      </span>
                      {g.reviewDate && <span className="bdg b-cy">مراجعة: {g.reviewDate}</span>}
                    </div>

                    {/* Goal text */}
                    <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: 6 }}>{g.goal}</div>
                    {g.notes && <div style={{ fontSize: '.76rem', color: 'var(--g5)', marginBottom: 6 }}>{g.notes}</div>}

                    {/* Progress */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="prog" style={{ flex: 1 }}>
                        <div className={`prog-f ${pct >= 80 ? 'ok' : ''}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--pr)', minWidth: 36 }}>{pct}%</span>
                      {canEditStudents && (
                        <input
                          type="range" min="0" max="100" value={pct}
                          onChange={e => updateProgress(g.id, parseInt(e.target.value))}
                          style={{ width: 80, accentColor: 'var(--pr)' }}
                          title="اسحب لتحديث التقدم"
                        />
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {canEditStudents && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="btn btn-s btn-xs" onClick={() => openForm(g)}>✏️</button>
                      <button className="btn btn-d btn-xs" onClick={() => {
                        if (window.confirm('حذف هذا الهدف؟')) deleteGoal(g.id);
                      }}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Widget>
      ))}
    </div>
  );
}

// ── نموذج الهدف ──
function GoalForm({ goal, students, defaultStuId, onSave, onCancel }) {
  const [form, setForm] = useState({
    stuId:      defaultStuId || '',
    domain:     '',
    goal:       '',
    priority:   'medium',
    pct:        0,
    startDate:  '',
    reviewDate: '',
    notes:      '',
    ...goal,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handleSubmit() {
    if (!form.stuId) { alert('⚠️ اختر الطالب'); return; }
    if (!form.domain) { alert('⚠️ اختر المجال'); return; }
    if (!form.goal?.trim()) { alert('⚠️ أدخل الهدف'); return; }
    onSave(form);
  }

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>{goal ? '✏️ تعديل الهدف' : '➕ هدف IEP جديد'}</h2>
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
            <select value={form.stuId} onChange={e => set('stuId', e.target.value)}>
              <option value="">-- اختر --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>المجال <span className="req">*</span></label>
            <select value={form.domain} onChange={e => set('domain', e.target.value)}>
              <option value="">-- اختر --</option>
              {DOMAINS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>الأولوية</label>
            <select value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p.val} value={p.val}>{p.label}</option>)}
            </select>
          </div>
          <div className="fl">
            <label>نسبة التقدم: <b>{form.pct}%</b></label>
            <input type="range" min="0" max="100" value={form.pct}
              onChange={e => set('pct', parseInt(e.target.value))}
              style={{ accentColor: 'var(--pr)' }}
            />
          </div>
          <div className="fl">
            <label>تاريخ البداية</label>
            <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </div>
          <div className="fl">
            <label>تاريخ المراجعة</label>
            <input type="date" value={form.reviewDate} onChange={e => set('reviewDate', e.target.value)} />
          </div>
        </div>
        <div className="fl">
          <label>الهدف <span className="req">*</span></label>
          <textarea rows={3} value={form.goal} onChange={e => set('goal', e.target.value)}
            placeholder="وصف الهدف بوضوح..."
            style={{ padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', resize: 'vertical', width: '100%' }}
          />
        </div>
        <div className="fl">
          <label>ملاحظات</label>
          <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="إجراءات، استراتيجيات..."
            style={{ padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', resize: 'vertical', width: '100%' }}
          />
        </div>
      </Widget>
    </div>
  );
}
