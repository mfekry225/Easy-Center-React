import { useState, useMemo } from 'react';
import { useStudents } from '../../hooks/useStudents';
import { useEmployees } from '../../hooks/useEmployees';
import { useAttendance } from '../../hooks/useAttendance';
import { usePermissions } from '../../hooks/usePermissions';

// ── ثوابت ──
const SECTIONS = [
  { id: 'emp',      icon: '👥', label: 'الموظفون' },
  { id: 'morning',  icon: '☀️', label: 'الصباحي' },
  { id: 'evening',  icon: '🌙', label: 'المسائي' },
  { id: 'sessions', icon: '🩺', label: 'الجلسات' },
  { id: 'online',   icon: '🌐', label: 'الأونلاين' },
];

const STATUS_MAP = {
  present: { cls: 'b-gr', label: '✅ حاضر' },
  absent:  { cls: 'b-rd', label: '❌ غائب'  },
  late:    { cls: 'b-yw', label: '⚠️ متأخر' },
  leave:   { cls: 'b-pu', label: '🌴 إجازة' },
};

// ── مساعد التاريخ ──
function dateStr(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function dateLabel(d) {
  return d.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function waLink(phone, name, dateAr) {
  const cleaned = (phone || '').replace(/[^0-9+]/g, '').replace(/^0/, '966');
  if (!cleaned) return null;
  const msg = encodeURIComponent(
    `السلام عليكم ورحمة الله وبركاته\nولي أمر الطالب/ة: ${name}\nنُود إبلاغكم بأن ${name} لم يسجل حضوره اليوم ${dateAr}.\nيرجى التواصل مع المركز للتأكيد.\nشكراً لتعاونكم 🙏`
  );
  return `https://wa.me/${cleaned}?text=${msg}`;
}

// ══════════════════════════════════════════════════════════
//  Attendance — صفحة الحضور السريع
// ══════════════════════════════════════════════════════════
export default function Attendance() {
  const { students }           = useStudents();
  const { employees }          = useEmployees();
  const { attStu, attEmp, markStudent, markEmployee } = useAttendance();
  const { isManager, isVice, isSpecialist, canManage } = usePermissions();

  const [date, setDate]       = useState(new Date());
  const [section, setSection] = useState('morning');

  const ds      = dateStr(date);
  const dateAr  = dateLabel(date);
  const isToday = ds === dateStr(new Date());

  // ── التنقل بين الأيام ──
  function moveDate(delta) {
    setDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta));
  }

  // ── قوائم الطلاب حسب القسم ──
  const activeStudents = useMemo(() =>
    students.filter(s => !['inactive', 'transferred', 'rejected'].includes(s.status)),
    [students]
  );

  const sectionStudents = useMemo(() => {
    const progKey = {
      morning:  'progMorning',
      evening:  'progEvening',
      sessions: 'progSessions',
      online:   'progOnline',
    }[section];
    if (!progKey) return [];
    return activeStudents.filter(s => s[progKey]?.enabled);
  }, [activeStudents, section]);

  // ── إحصاءات سريعة ──
  const stats = useMemo(() => {
    const empPresent = employees.filter(e => attEmp.find(a => a.empId === e.id && a.date === ds && a.status === 'present')).length;
    const empAbsent  = employees.filter(e => attEmp.find(a => a.empId === e.id && a.date === ds && a.status === 'absent')).length;

    const getStuStat = (progKey, sess) => {
      const list = activeStudents.filter(s => s[progKey]?.enabled);
      const present = list.filter(s => attStu.find(a => a.kidId === s.id && a.date === ds && a.session === sess && a.status === 'present')).length;
      const absent  = list.filter(s => attStu.find(a => a.kidId === s.id && a.date === ds && a.session === sess && a.status === 'absent')).length;
      return { total: list.length, present, absent };
    };

    const morning  = getStuStat('progMorning', 'morning');
    const evening  = getStuStat('progEvening', 'evening');
    const sessions = getStuStat('progSessions', 'sessions');

    return { empPresent, empAbsent, empTotal: employees.length, morning, evening, sessions };
  }, [employees, activeStudents, attEmp, attStu, ds]);

  return (
    <div className="page">
      {/* ── Header ── */}
      <div className="ph">
        <div className="ph-t">
          <h2>📋 الحضور السريع</h2>
          <p>{dateAr}</p>
        </div>
        <div className="ph-a">
          <button className="btn btn-s btn-sm" onClick={() => moveDate(-1)}>← السابق</button>
          {!isToday && (
            <button className="btn btn-p btn-sm" onClick={() => setDate(new Date())}>اليوم</button>
          )}
          <button className="btn btn-s btn-sm" onClick={() => moveDate(1)}>التالي →</button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        <SummaryCard icon="👥" label="الموظفون" present={stats.empPresent} total={stats.empTotal} color="var(--pr)" />
        <SummaryCard icon="☀️" label="الصباحي"  present={stats.morning.present}  total={stats.morning.total}  color="#d97706" />
        <SummaryCard icon="🌙" label="المسائي"  present={stats.evening.present}  total={stats.evening.total}  color="#7c3aed" />
        <SummaryCard icon="🩺" label="الجلسات"  present={stats.sessions.present} total={stats.sessions.total} color="#0891b2" />
      </div>

      {/* ── Section tabs ── */}
      <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 'var(--r)', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: 14 }}>
        {SECTIONS.filter(s => canManage || s.id !== 'emp').map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              flex: 1, padding: '11px 8px', border: 'none',
              borderBottom: section === s.id ? '3px solid var(--pr)' : '3px solid transparent',
              background: section === s.id ? 'var(--pr-l)' : 'transparent',
              color: section === s.id ? 'var(--pr)' : 'var(--g5)',
              fontWeight: section === s.id ? 800 : 600,
              fontSize: '.78rem', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className="wg">
        <div className="wg-h">
          <h3>
            {SECTIONS.find(s => s.id === section)?.icon}{' '}
            {SECTIONS.find(s => s.id === section)?.label}
          </h3>
          <span className="bdg b-bl">
            {section === 'emp' ? employees.length : sectionStudents.length} عنصر
          </span>
        </div>
        <div className="wg-b p0">
          {section === 'emp'
            ? <EmpList employees={employees} attEmp={attEmp} ds={ds} markEmployee={markEmployee} canManage={canManage} />
            : <StuList students={sectionStudents} attStu={attStu} ds={ds} session={section} markStudent={markStudent} dateAr={dateAr} />
          }
        </div>
      </div>
    </div>
  );
}

// ══ بطاقة الإحصاء العلوية ══
function SummaryCard({ icon, label, present, total, color }) {
  const pct = total ? Math.round(present / total * 100) : 0;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--r)', padding: '12px 14px', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 900, color, lineHeight: 1 }}>
        {present}<span style={{ fontSize: '.7rem', color: 'var(--g4)', fontWeight: 600 }}>/{total}</span>
      </div>
      <div style={{ fontSize: '.72rem', color: 'var(--g5)', marginTop: 3 }}>{label}</div>
      <div style={{ marginTop: 6, height: 4, background: 'var(--g2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: 4, width: `${pct}%`, background: color, borderRadius: 4, transition: 'width .4s' }} />
      </div>
    </div>
  );
}

// ══ قائمة الموظفين ══
function EmpList({ employees, attEmp, ds, markEmployee, canManage }) {
  if (!employees.length) return <EmptyState icon="👥" text="لا يوجد موظفون" />;

  return employees.map(e => {
    const rec = attEmp.find(a => a.empId === e.id && a.date === ds);
    const status = STATUS_MAP[rec?.status];

    return (
      <div key={e.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
        <div className="av blue" style={{ fontSize: '.82rem' }}>
          {e.photo
            ? <img src={e.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : (e.name || '?').slice(0, 2)
          }
        </div>
        <div className="ci">
          <div className="cn">{e.name}</div>
          <div className="cm">
            {e.role || '—'}
            {rec?.timeIn  && ` · دخول: ${rec.timeIn}`}
            {rec?.timeOut && ` · خروج: ${rec.timeOut}`}
          </div>
        </div>
        <span className={`bdg ${status?.cls || 'b-gy'}`}>
          {status?.label || '— غير مسجّل'}
        </span>
        {canManage && (
          <div className="c-acts">
            <MarkBtn color="var(--ok)"   title="حاضر"  onClick={() => markEmployee(e.id, ds, 'present')}>✅</MarkBtn>
            <MarkBtn color="var(--err)"  title="غائب"   onClick={() => markEmployee(e.id, ds, 'absent')}>❌</MarkBtn>
            <MarkBtn color="var(--warn)" title="متأخر"  onClick={() => markEmployee(e.id, ds, 'late')}>⚠️</MarkBtn>
            <MarkBtn color="var(--pur)"  title="إجازة"  onClick={() => markEmployee(e.id, ds, 'leave')}>🌴</MarkBtn>
          </div>
        )}
      </div>
    );
  });
}

// ══ قائمة الطلاب ══
function StuList({ students, attStu, ds, session, markStudent, dateAr }) {
  if (!students.length) return <EmptyState icon="👦" text="لا يوجد طلاب في هذا القسم" />;

  return students.map(s => {
    const rec    = attStu.find(a => a.kidId === s.id && a.date === ds && a.session === session);
    const status = STATUS_MAP[rec?.status];
    const wa     = s.status === 'absent' || !rec ? waLink(s.parentPhone, s.name, dateAr) : null;

    return (
      <div key={s.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
        <div className="av purple" style={{ fontSize: s.photo ? 0 : '.82rem', overflow: 'hidden' }}>
          {s.photo
            ? <img src={s.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : (s.name || '?').slice(0, 2)
          }
        </div>
        <div className="ci">
          <div className="cn">
            {s.name} {s.gen === 'ذكر' ? '👦' : s.gen === 'أنثى' ? '👧' : ''}
          </div>
          <div className="cm">
            {s.diag || '—'}
            {rec?.timeIn  && ` · وصل: ${rec.timeIn}`}
            {rec?.timeOut && ` · انصرف: ${rec.timeOut}`}
          </div>
        </div>
        <span className={`bdg ${status?.cls || 'b-gy'}`}>
          {status?.label || '— غير مسجّل'}
        </span>
        <div className="c-acts">
          <MarkBtn color="var(--ok)"   onClick={() => markStudent(s.id, ds, session, 'present')}>✅</MarkBtn>
          <MarkBtn color="var(--err)"  onClick={() => markStudent(s.id, ds, session, 'absent')}>❌</MarkBtn>
          <MarkBtn color="var(--warn)" onClick={() => markStudent(s.id, ds, session, 'late')}>⚠️</MarkBtn>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer"
              className="btn btn-xs"
              style={{ background: '#25d366', color: 'white', textDecoration: 'none' }}
              title="إرسال واتساب"
            >💬</a>
          )}
        </div>
      </div>
    );
  });
}

// ══ زر التسجيل ══
function MarkBtn({ color, onClick, children, title }) {
  return (
    <button
      className="btn btn-xs"
      style={{ background: color, color: 'white' }}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

// ══ حالة فارغة ══
function EmptyState({ icon, text }) {
  return (
    <div className="empty">
      <div className="ei">{icon}</div>
      <div className="et">{text}</div>
    </div>
  );
}
