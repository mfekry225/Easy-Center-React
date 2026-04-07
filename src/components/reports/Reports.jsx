import { useMemo } from 'react';
import { useStudents } from '../../hooks/useStudents';
import { useEmployees } from '../../hooks/useEmployees';
import { useStorage } from '../../hooks/useStorage';
import { useFinance } from '../../hooks/useFinance';
import { useIEP } from '../../hooks/useIEP';
import Widget from '../ui/Widget';

function ProgressBar({ value, max, color = 'var(--pr)', label }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.79rem', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700 }}>{value} ({pct}%)</span>
      </div>
      <div style={{ height: 8, background: 'var(--g2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width .5s' }} />
      </div>
    </div>
  );
}

export default function Reports() {
  const { students, stats: stuStats } = useStudents();
  const { employees } = useEmployees();
  const { iep, stats: iepStats } = useIEP();
  const { stats: finStats } = useFinance();
  const [sessions]  = useStorage('sessions',  []);
  const [attStu]    = useStorage('att_stu',   []);
  const [leaves]    = useStorage('leaves',    []);

  const today    = new Date().toISOString().split('T')[0];
  const monthKey = today.slice(0, 7);

  // ── إحصاءات متقدمة ──
  const data = useMemo(() => {
    const activeStudents = students.filter(s => s.status === 'active');
    const totalActive    = activeStudents.length;

    // توزيع التشخيصات
    const diagMap = {};
    students.forEach(s => { if (s.diag) diagMap[s.diag] = (diagMap[s.diag] || 0) + 1; });
    const diagnoses = Object.entries(diagMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

    // توزيع البرامج
    const programs = {
      morning:  activeStudents.filter(s => s.progMorning?.enabled).length,
      evening:  activeStudents.filter(s => s.progEvening?.enabled).length,
      sessions: activeStudents.filter(s => s.progSessions?.enabled).length,
      online:   activeStudents.filter(s => s.progOnline?.enabled).length,
    };

    // نسبة حضور اليوم
    const todayPresent   = attStu.filter(a => a.date === today && a.status === 'present').length;
    const attendanceRate = totalActive ? Math.round(todayPresent / totalActive * 100) : 0;

    // جلسات هذا الشهر
    const monthSessions = sessions.filter(s => s.date?.startsWith(monthKey)).length;

    // نسبة تحقيق الأهداف
    const ratedSessions  = sessions.filter(s => s.result);
    const achievedSess   = ratedSessions.filter(s => s.result === 'achieved').length;
    const successRate    = ratedSessions.length ? Math.round(achievedSess / ratedSessions.length * 100) : 0;

    // إجازات معلقة
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

    // توزيع الجنس
    const males   = students.filter(s => s.gen === 'ذكر').length;
    const females = students.filter(s => s.gen === 'أنثى').length;

    // IEP progress
    const avgIepProgress = iep.length
      ? Math.round(iep.reduce((s, g) => s + (g.pct || 0), 0) / iep.length)
      : 0;

    return {
      totalActive, diagnoses, programs,
      attendanceRate, todayPresent,
      monthSessions, successRate,
      pendingLeaves, males, females,
      avgIepProgress,
    };
  }, [students, sessions, attStu, iep, leaves, today, monthKey]);

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>📊 التقارير والإحصاء</h2>
          <p>نظرة شاملة على أداء المركز</p>
        </div>
        <div className="ph-a">
          <button className="btn btn-s btn-sm" onClick={() => window.print()}>🖨️ طباعة</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats">
        <div className="stat-card ok">
          <div className="lb">نسبة الحضور اليوم</div>
          <div className="vl" style={{ color: data.attendanceRate >= 80 ? 'var(--ok)' : data.attendanceRate >= 60 ? 'var(--warn)' : 'var(--err)' }}>
            {data.attendanceRate}%
          </div>
          <div className="sb">{data.todayPresent} من {data.totalActive} طالب</div>
        </div>
        <div className="stat-card cyan">
          <div className="lb">جلسات هذا الشهر</div>
          <div className="vl">{data.monthSessions}</div>
          <div className="sb">جلسة علاجية</div>
        </div>
        <div className="stat-card pur">
          <div className="lb">نسبة تحقيق الأهداف</div>
          <div className="vl">{data.successRate}%</div>
          <div className="sb">من الجلسات المقيّمة</div>
        </div>
        <div className={`stat-card ${finStats.balance >= 0 ? 'ok' : 'err'}`}>
          <div className="lb">صافي الرصيد</div>
          <div className="vl" style={{ fontSize: '1.3rem' }}>{finStats.balance.toLocaleString('ar')}</div>
          <div className="sb">ريال</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Students breakdown */}
        <Widget title="👦 الطلاب">
          <ProgressBar label="نشطون"        value={stuStats.total}    max={students.length} color="var(--ok)" />
          <ProgressBar label="قائمة انتظار" value={stuStats.waitlist} max={students.length} color="var(--warn)" />
          <ProgressBar label="منقطعون"      value={stuStats.inactive} max={students.length} color="var(--g4)" />
          <ProgressBar label="متخرجون"      value={stuStats.graduated} max={students.length} color="var(--pr)" />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <span className="bdg b-bl">👦 ذكور: {data.males}</span>
            <span className="bdg b-pk">👧 إناث: {data.females}</span>
          </div>
        </Widget>

        {/* Programs */}
        <Widget title="📚 البرامج">
          <ProgressBar label="☀️ الصف الصباحي"  value={data.programs.morning}  max={data.totalActive} color="#d97706" />
          <ProgressBar label="🌙 الصف المسائي"  value={data.programs.evening}  max={data.totalActive} color="#7c3aed" />
          <ProgressBar label="🩺 جلسات فردية"   value={data.programs.sessions} max={data.totalActive} color="#0891b2" />
          <ProgressBar label="🌐 جلسات أونلاين" value={data.programs.online}   max={data.totalActive} color="#059669" />
        </Widget>

        {/* Diagnoses */}
        <Widget title="🧠 توزيع التشخيصات">
          {data.diagnoses.length === 0
            ? <div className="empty" style={{ padding: 16 }}><div className="et">لا توجد بيانات</div></div>
            : data.diagnoses.map(([diag, count], i) => {
              const colors = ['var(--pr)', 'var(--pur)', 'var(--ok)', 'var(--warn)', 'var(--cyan)', 'var(--pink)'];
              return <ProgressBar key={diag} label={diag} value={count} max={students.length} color={colors[i]} />;
            })
          }
        </Widget>

        {/* IEP + HR */}
        <Widget title="🎯 IEP والموظفون">
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '.78rem', color: 'var(--g5)', marginBottom: 6 }}>متوسط تقدم أهداف IEP</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ height: 10, flex: 1, background: 'var(--g2)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${data.avgIepProgress}%`, background: 'var(--pur)', borderRadius: 5 }} />
              </div>
              <span style={{ fontWeight: 900, color: 'var(--pur)' }}>{data.avgIepProgress}%</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            {[
              { label: 'إجمالي الموظفين', value: employees.length, color: 'var(--pr)' },
              { label: 'إجازات معلقة',    value: data.pendingLeaves, color: data.pendingLeaves ? 'var(--warn)' : 'var(--ok)' },
              { label: 'أهداف IEP',        value: iepStats.total,    color: 'var(--pur)' },
              { label: 'مكتملة 100%',       value: iepStats.done,     color: 'var(--ok)' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--g0)', borderRadius: 10 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--g5)', marginTop: 3 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      {/* Finance summary */}
      <Widget title="💰 المالية">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'إجمالي الإيرادات', value: finStats.totalIncome,  color: 'var(--ok)',   suffix: 'ر.س' },
            { label: 'إجمالي المصاريف', value: finStats.totalExpense,  color: 'var(--err)',  suffix: 'ر.س' },
            { label: 'صافي الرصيد',      value: finStats.balance,      color: finStats.balance >= 0 ? 'var(--ok)' : 'var(--err)', suffix: 'ر.س' },
            { label: 'رسوم غير مسددة',   value: finStats.unpaidFees,   color: 'var(--warn)', suffix: 'فاتورة' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', padding: '14px 10px', background: 'var(--g0)', borderRadius: 10 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: item.color }}>{typeof item.value === 'number' && item.suffix === 'ر.س' ? item.value.toLocaleString('ar') : item.value}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--g5)', marginTop: 2 }}>{item.label}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--g4)' }}>{item.suffix}</div>
            </div>
          ))}
        </div>
      </Widget>
    </div>
  );
}
