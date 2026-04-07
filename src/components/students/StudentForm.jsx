import { useState } from 'react';

const DIAGNOSES = [
  'تأخر في النطق والكلام','اضطراب طيف التوحد','إعاقة ذهنية',
  'صعوبات تعلم','اضطراب فرط الحركة وتشتت الانتباه (ADHD)',
  'تأخر نمائي','شلل دماغي','إعاقة سمعية','إعاقة بصرية','أخرى',
];

const PROG_TYPES = [
  { key: 'progMorning',  icon: '☀️', label: 'الصف الصباحي',   fields: ['days', 'fee'] },
  { key: 'progEvening',  icon: '🌙', label: 'الصف المسائي',   fields: ['days', 'fee'] },
  { key: 'progSessions', icon: '🩺', label: 'جلسات فردية',    fields: ['sessionType', 'dur', 'fee', 'emp'] },
  { key: 'progOnline',   icon: '🌐', label: 'جلسات أونلاين',  fields: ['sessionType', 'dur', 'fee', 'emp', 'link'] },
];

const SESSION_TYPES = ['تخاطب ونطق','علاج وظيفي','علاج فيزيائي','تعديل سلوك','تطوير مهارات','متابعة','أخرى'];
const DURATIONS     = ['30 دقيقة','45 دقيقة','60 دقيقة','90 دقيقة'];

export default function StudentForm({ student, specialists, onSave, onCancel, onDelete }) {
  const isEdit = !!student;

  const [form, setForm] = useState({
    name: '', gen: '', dob: '', diag: '', notes: '',
    parentName: '', parentPhone: '', parentPhone2: '',
    address: '', nationalId: '', status: 'active',
    specId: '', photo: '',
    progMorning:  { enabled: false, days: '', fee: '' },
    progEvening:  { enabled: false, days: '', fee: '' },
    progSessions: { enabled: false, sessionType: '', dur: '45 دقيقة', fee: '', empId: '' },
    progOnline:   { enabled: false, sessionType: '', dur: '45 دقيقة', fee: '', empId: '', link: '' },
    ...student,
  });

  const [tab, setTab] = useState('basic'); // basic | parent | programs

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setProg = (progKey, field, val) =>
    setForm(p => ({ ...p, [progKey]: { ...p[progKey], [field]: val } }));

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('photo', ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!form.name?.trim()) { alert('⚠️ اسم الطالب مطلوب'); return; }
    if (!form.parentName?.trim()) { alert('⚠️ اسم ولي الأمر مطلوب'); return; }
    if (!form.parentPhone?.trim()) { alert('⚠️ جوال ولي الأمر مطلوب'); return; }
    onSave(form);
  }

  const TAB_STYLE = (id) => ({
    padding: '9px 16px', border: 'none', background: 'transparent',
    borderBottom: tab === id ? '2px solid var(--pr)' : '2px solid transparent',
    color: tab === id ? 'var(--pr)' : 'var(--g5)',
    fontWeight: tab === id ? 800 : 600, fontSize: '.83rem',
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  });

  return (
    <div className="page">
      {/* Header */}
      <div className="ph">
        <div className="ph-t">
          <h2>{isEdit ? `✏️ تعديل: ${student.name}` : '➕ طالب جديد'}</h2>
        </div>
        <div className="ph-a">
          {onDelete && (
            <button className="btn btn-d btn-sm" onClick={onDelete}>🗑️ حذف</button>
          )}
          <button className="btn btn-s btn-sm" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-p" onClick={handleSubmit}>💾 حفظ</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
        <button style={TAB_STYLE('basic')}   onClick={() => setTab('basic')}>👤 البيانات الأساسية</button>
        <button style={TAB_STYLE('parent')}  onClick={() => setTab('parent')}>👨‍👩‍👦 ولي الأمر</button>
        <button style={TAB_STYLE('programs')}onClick={() => setTab('programs')}>📚 البرامج</button>
      </div>

      {/* ── TAB: Basic ── */}
      {tab === 'basic' && (
        <div className="wg">
          <div className="wg-b">
            {/* Photo + Name row */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap' }}>
              <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px dashed var(--g3)', background: 'var(--g1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: form.photo ? 0 : '1.8rem', overflow: 'hidden' }}>
                  {form.photo
                    ? <img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '📷'
                  }
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              </label>
              <div style={{ flex: 1 }}>
                <div className="fg c2">
                  <div className="fl">
                    <label>الاسم الكامل <span className="req">*</span></label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="اسم الطالب" />
                  </div>
                  <div className="fl">
                    <label>الجنس</label>
                    <select value={form.gen} onChange={e => set('gen', e.target.value)}>
                      <option value="">--</option>
                      <option>ذكر</option>
                      <option>أنثى</option>
                    </select>
                  </div>
                  <div className="fl">
                    <label>تاريخ الميلاد</label>
                    <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
                  </div>
                  <div className="fl">
                    <label>الحالة</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="active">✅ نشط</option>
                      <option value="waitlist">⏳ قائمة انتظار</option>
                      <option value="inactive">⏸️ منقطع</option>
                      <option value="graduated">🎓 متخرج</option>
                      <option value="transferred">🔄 محوّل</option>
                      <option value="rejected">❌ غير مناسب</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="fg c2">
              <div className="fl">
                <label>التشخيص</label>
                <select value={form.diag} onChange={e => set('diag', e.target.value)}>
                  <option value="">-- اختر --</option>
                  {DIAGNOSES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="fl">
                <label>الأخصائي المسؤول</label>
                <select value={form.specId} onChange={e => set('specId', e.target.value)}>
                  <option value="">-- اختر --</option>
                  {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="fl">
                <label>رقم الهوية (اختياري)</label>
                <input value={form.nationalId} onChange={e => set('nationalId', e.target.value)} placeholder="1xxxxxxxxx" />
              </div>
              <div className="fl">
                <label>العنوان</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="الحي / المدينة" />
              </div>
            </div>

            <div className="fl">
              <label>ملاحظات</label>
              <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="أي ملاحظات على الطالب..." style={{ padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Parent ── */}
      {tab === 'parent' && (
        <div className="wg">
          <div className="wg-h"><h3>👨‍👩‍👦 بيانات ولي الأمر</h3></div>
          <div className="wg-b">
            <div className="fg c2">
              <div className="fl">
                <label>اسم ولي الأمر <span className="req">*</span></label>
                <input value={form.parentName} onChange={e => set('parentName', e.target.value)} placeholder="الاسم الكامل" />
              </div>
              <div className="fl">
                <label>صفة ولي الأمر</label>
                <select value={form.parentRel} onChange={e => set('parentRel', e.target.value)}>
                  <option value="">--</option>
                  <option>الأب</option><option>الأم</option><option>الجد</option><option>الأخ</option><option>أخرى</option>
                </select>
              </div>
              <div className="fl">
                <label>الجوال الأساسي <span className="req">*</span></label>
                <input type="tel" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} placeholder="05xxxxxxxx" />
              </div>
              <div className="fl">
                <label>جوال بديل</label>
                <input type="tel" value={form.parentPhone2} onChange={e => set('parentPhone2', e.target.value)} placeholder="05xxxxxxxx" />
              </div>
              <div className="fl">
                <label>البريد الإلكتروني</label>
                <input type="email" value={form.parentEmail} onChange={e => set('parentEmail', e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="fl">
                <label>مهنة ولي الأمر</label>
                <input value={form.parentJob} onChange={e => set('parentJob', e.target.value)} placeholder="المهنة" />
              </div>
            </div>
            <div className="fl">
              <label>ملاحظات التواصل</label>
              <textarea rows={2} value={form.parentNotes} onChange={e => set('parentNotes', e.target.value)} placeholder="أوقات التواصل المفضلة، أي ملاحظات..." style={{ padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', resize: 'vertical' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Programs ── */}
      {tab === 'programs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PROG_TYPES.map(prog => {
            const p = form[prog.key] || {};
            return (
              <div className="wg" key={prog.key}>
                <div className="wg-h">
                  <h3>{prog.icon} {prog.label}</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!p.enabled}
                      onChange={e => setProg(prog.key, 'enabled', e.target.checked)}
                    />
                    <span style={{ fontSize: '.82rem', fontWeight: 700 }}>
                      {p.enabled ? '✅ مفعّل' : 'تفعيل'}
                    </span>
                  </label>
                </div>

                {p.enabled && (
                  <div className="wg-b">
                    <div className="fg c2">
                      {prog.fields.includes('emp') && (
                        <div className="fl">
                          <label>الأخصائي</label>
                          <select value={p.empId || ''} onChange={e => setProg(prog.key, 'empId', e.target.value)}>
                            <option value="">-- اختر --</option>
                            {specialists.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        </div>
                      )}
                      {prog.fields.includes('sessionType') && (
                        <div className="fl">
                          <label>نوع الجلسة</label>
                          <select value={p.sessionType || ''} onChange={e => setProg(prog.key, 'sessionType', e.target.value)}>
                            <option value="">-- اختر --</option>
                            {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                      )}
                      {prog.fields.includes('dur') && (
                        <div className="fl">
                          <label>مدة الجلسة</label>
                          <select value={p.dur || '45 دقيقة'} onChange={e => setProg(prog.key, 'dur', e.target.value)}>
                            {DURATIONS.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                      )}
                      {prog.fields.includes('fee') && (
                        <div className="fl">
                          <label>الرسوم الشهرية (ريال)</label>
                          <input type="number" min="0" value={p.fee || ''} onChange={e => setProg(prog.key, 'fee', e.target.value)} placeholder="0" />
                        </div>
                      )}
                      {prog.fields.includes('days') && (
                        <div className="fl">
                          <label>أيام الحضور</label>
                          <input value={p.days || ''} onChange={e => setProg(prog.key, 'days', e.target.value)} placeholder="مثال: الأحد والثلاثاء والخميس" />
                        </div>
                      )}
                      {prog.fields.includes('link') && (
                        <div className="fl">
                          <label>رابط الجلسة الأونلاين</label>
                          <input type="url" value={p.link || ''} onChange={e => setProg(prog.key, 'link', e.target.value)} placeholder="https://meet.google.com/..." />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom save */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn btn-s" onClick={onCancel}>إلغاء</button>
        <button className="btn btn-p" onClick={handleSubmit}>💾 حفظ الطالب</button>
      </div>
    </div>
  );
}
