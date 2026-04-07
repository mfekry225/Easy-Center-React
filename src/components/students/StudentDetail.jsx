import { useStorage } from '../../hooks/useStorage';

const STATUS_MAP = {
  active:      { cls: 'b-gr', label: '✅ نشط' },
  inactive:    { cls: 'b-gy', label: '⏸️ منقطع' },
  graduated:   { cls: 'b-bl', label: '🎓 متخرج' },
  transferred: { cls: 'b-pu', label: '🔄 محوّل' },
  waitlist:    { cls: 'b-yw', label: '⏳ انتظار' },
  rejected:    { cls: 'b-rd', label: '❌ غير مناسب' },
};

export default function StudentDetail({ student: s, specialists, onBack, onEdit, onDelete, canEdit }) {
  const [sessions]  = useStorage('sessions',  []);
  const [iep]       = useStorage('iep',       []);
  const [appts]     = useStorage('appts',     []);
  const [attStu]    = useStorage('att_stu',   []);

  const specialist  = specialists.find(e => e.id === s.specId);
  const status      = STATUS_MAP[s.status] || STATUS_MAP.active;
  const waPhone     = (s.parentPhone || '').replace(/[^0-9+]/g, '').replace(/^0/, '966');

  // إحصاءات الطالب
  const stuSessions = sessions.filter(x => x.stuId === s.id);
  const stuIep      = iep.filter(x => x.stuId === s.id);
  const stuAppts    = appts.filter(x => x.stuId === s.id);
  const attRecords  = attStu.filter(x => x.kidId === s.id);
  const presentDays = attRecords.filter(x => x.status === 'present').length;

  // حساب العمر
  function calcAge(dob) {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const years = Math.floor(diff / (365.25 * 864e5));
    const months = Math.floor((diff % (365.25 * 864e5)) / (30.44 * 864e5));
    return years > 0 ? `${years} سنة ${months} شهر` : `${months} شهر`;
  }

  // البرامج المفعّلة
  const programs = [
    s.progMorning?.enabled  && { icon: '☀️', label: 'صباحي',  color: '#d97706' },
    s.progEvening?.enabled  && { icon: '🌙', label: 'مسائي',  color: '#7c3aed' },
    s.progSessions?.enabled && { icon: '🩺', label: 'جلسات',  color: '#0891b2' },
    s.progOnline?.enabled   && { icon: '🌐', label: 'أونلاين', color: '#059669' },
  ].filter(Boolean);

  // آخر 3 جلسات
  const recentSessions = [...stuSessions]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);

  // أهداف IEP
  const iepByDomain = stuIep.reduce((acc, g) => {
    if (!acc[g.domain]) acc[g.domain] = [];
    acc[g.domain].push(g);
    return acc;
  }, {});

  return (
    <div className="page">
      {/* Header */}
      <div className="ph">
        <div className="ph-t">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--pr)' }}
            >
              ← رجوع
            </button>
            {s.name}
          </h2>
          <p>{s.diag || '—'} · {specialist?.name || '—'}</p>
        </div>
        <div className="ph-a">
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-g btn-sm"
            >
              💬 واتساب
            </a>
          )}
          {canEdit && (
            <>
              <button className="btn btn-s btn-sm" onClick={onEdit}>✏️ تعديل</button>
              <button className="btn btn-d btn-sm" onClick={onDelete}>🗑️</button>
            </>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="wg" style={{ marginBottom: 14 }}>
        <div className="wg-b">
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Photo */}
            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: 'var(--pur-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', fontWeight: 900, color: 'var(--pur)', flexShrink: 0 }}>
              {s.photo
                ? <img src={s.photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (s.name || '?').slice(0, 2)
              }
            </div>

            {/* Info grid */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className={`bdg ${status.cls}`} style={{ fontSize: '.82rem' }}>{status.label}</span>
                {programs.map(p => (
                  <span key={p.label} className="bdg b-bl">{p.icon} {p.label}</span>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 16px' }}>
                {[
                  { label: 'الجنس',      val: s.gen },
                  { label: 'العمر',       val: calcAge(s.dob) },
                  { label: 'تاريخ الميلاد', val: s.dob ? new Date(s.dob).toLocaleDateString('ar') : null },
                  { label: 'العنوان',    val: s.address },
                  { label: 'الأخصائي',  val: specialist?.name },
                  { label: 'رقم الهوية', val: s.nationalId },
                ].filter(x => x.val).map(({ label, val }) => (
                  <div key={label}>
                    <span style={{ fontSize: '.72rem', color: 'var(--g5)' }}>{label}: </span>
                    <span style={{ fontSize: '.84rem', fontWeight: 700 }}>{val}</span>
                  </div>
                ))}
              </div>
              {s.notes && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--g1)', borderRadius: 8, fontSize: '.82rem', color: 'var(--g6)' }}>
                  📝 {s.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card cyan"><div className="lb">الجلسات</div><div className="vl">{stuSessions.length}</div></div>
        <div className="stat-card ok">  <div className="lb">أيام الحضور</div><div className="vl">{presentDays}</div></div>
        <div className="stat-card pur"> <div className="lb">أهداف IEP</div><div className="vl">{stuIep.length}</div></div>
        <div className="stat-card warn"><div className="lb">المواعيد</div><div className="vl">{stuAppts.length}</div></div>
      </div>

      {/* Parent info */}
      <div className="wg" style={{ marginBottom: 14 }}>
        <div className="wg-h"><h3>👨‍👩‍👦 ولي الأمر</h3></div>
        <div className="wg-b">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px 16px' }}>
            {[
              { label: 'الاسم',   val: s.parentName },
              { label: 'الصفة',   val: s.parentRel },
              { label: 'الجوال',  val: s.parentPhone },
              { label: 'جوال 2',  val: s.parentPhone2 },
              { label: 'البريد',  val: s.parentEmail },
              { label: 'المهنة',  val: s.parentJob },
            ].filter(x => x.val).map(({ label, val }) => (
              <div key={label}>
                <span style={{ fontSize: '.72rem', color: 'var(--g5)' }}>{label}: </span>
                <span style={{ fontSize: '.85rem', fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
          {waPhone && (
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-g btn-sm"
              style={{ marginTop: 12, display: 'inline-flex', textDecoration: 'none' }}
            >
              💬 تواصل عبر واتساب
            </a>
          )}
        </div>
      </div>

      {/* Programs detail */}
      {programs.length > 0 && (
        <div className="wg" style={{ marginBottom: 14 }}>
          <div className="wg-h"><h3>📚 البرامج المفعّلة</h3></div>
          <div className="wg-b">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              {[
                s.progMorning?.enabled  && { icon: '☀️', label: 'الصف الصباحي',  data: s.progMorning },
                s.progEvening?.enabled  && { icon: '🌙', label: 'الصف المسائي',  data: s.progEvening },
                s.progSessions?.enabled && { icon: '🩺', label: 'جلسات فردية',   data: s.progSessions },
                s.progOnline?.enabled   && { icon: '🌐', label: 'جلسات أونلاين', data: s.progOnline },
              ].filter(Boolean).map(prog => (
                <div key={prog.label} style={{ padding: '12px 14px', background: 'var(--g0)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>{prog.icon} {prog.label}</div>
                  {prog.data.sessionType && <div style={{ fontSize: '.78rem', color: 'var(--g5)' }}>النوع: {prog.data.sessionType}</div>}
                  {prog.data.dur         && <div style={{ fontSize: '.78rem', color: 'var(--g5)' }}>المدة: {prog.data.dur}</div>}
                  {prog.data.fee         && <div style={{ fontSize: '.78rem', color: 'var(--g5)' }}>الرسوم: {prog.data.fee} ر.س</div>}
                  {prog.data.days        && <div style={{ fontSize: '.78rem', color: 'var(--g5)' }}>الأيام: {prog.data.days}</div>}
                  {prog.data.link && (
                    <a href={prog.data.link} target="_blank" rel="noreferrer" style={{ fontSize: '.76rem', color: 'var(--pr)' }}>🔗 رابط الجلسة</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="wg" style={{ marginBottom: 14 }}>
          <div className="wg-h"><h3>🩺 آخر الجلسات</h3></div>
          <div className="wg-b p0">
            {recentSessions.map(sess => {
              const spec = specialists.find(e => e.id === sess.specId);
              return (
                <div key={sess.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.84rem', fontWeight: 700 }}>{sess.type || 'جلسة'} · {sess.date || '—'}</div>
                    <div style={{ fontSize: '.74rem', color: 'var(--g5)' }}>{spec?.name || '—'}</div>
                  </div>
                  <span className={`bdg ${sess.status === 'done' ? 'b-gr' : sess.status === 'cancelled' ? 'b-rd' : 'b-yw'}`}>
                    {sess.status === 'done' ? '✅' : sess.status === 'cancelled' ? '❌' : '⏳'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* IEP Goals */}
      {stuIep.length > 0 && (
        <div className="wg">
          <div className="wg-h"><h3>🎯 أهداف IEP ({stuIep.length})</h3></div>
          <div className="wg-b">
            {Object.entries(iepByDomain).map(([domain, goals]) => (
              <div key={domain} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: '.84rem', color: 'var(--pr)', marginBottom: 8 }}>📌 {domain}</div>
                {goals.map(g => (
                  <div key={g.id} style={{ padding: '10px 12px', background: 'var(--g0)', borderRadius: 8, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: '.84rem', marginBottom: 4 }}>{g.goal}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="prog" style={{ flex: 1 }}>
                        <div className={`prog-f ${(g.pct || 0) >= 80 ? 'ok' : ''}`} style={{ width: `${g.pct || 0}%` }} />
                      </div>
                      <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--pr)' }}>{g.pct || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
