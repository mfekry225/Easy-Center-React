import { useStudents } from '../../hooks/useStudents';
import { useEmployees } from '../../hooks/useEmployees';
import { useStorage } from '../../hooks/useStorage';
import { usePermissions } from '../../hooks/usePermissions';
import { useApp } from '../../context/AppContext';
import StatCard from '../ui/StatCard';
import Widget from '../ui/Widget';

// ══════════════════════════════════════════════════════════
//  Dashboard — الصفحة الرئيسية
//  يحل محل: renderDash() في الملف الأصلي
// ══════════════════════════════════════════════════════════

export default function Dashboard() {
  const { currentUser, setActiveTab } = useApp();
  const { stats: stuStats } = useStudents();
  const { stats: empStats } = useEmployees();
  const { canSeeFinance, canSeeHR } = usePermissions();
  const [finance] = useStorage('finance', []);
  const [sessions] = useStorage('sessions', []);
  const [appts] = useStorage('appts', []);

  const today = new Date().toISOString().split('T')[0];

  // إحصاءات سريعة
  const todaySessions = sessions.filter(s => s.nextDate === today || s.date === today).length;
  const todayAppts    = appts.filter(a => a.date === today && a.status === 'scheduled').length;

  const totalIncome  = finance.filter(f => f.type === 'income').reduce((s, f) => s + (f.amount || 0), 0);
  const totalExpense = finance.filter(f => f.type === 'expense').reduce((s, f) => s + (f.amount || 0), 0);

  return (
    <div className="page">
      {/* Page Header */}
      <div className="ph">
        <div className="ph-t">
          <h2>🏠 لوحة التحكم</h2>
          <p>
            مرحباً {currentUser?.name} —{' '}
            {new Date().toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Students Stats */}
      <div className="stats">
        <StatCard label="الطلاب النشطون" value={stuStats.total} color="ok" sub={`قائمة الانتظار: ${stuStats.waitlist}`} />
        <StatCard label="برنامج الجلسات"  value={stuStats.sessions} color="cyan" />
        <StatCard label="برنامج الأونلاين" value={stuStats.online} color="pur" />
        <StatCard label="الصف الصباحي + المسائي" value={stuStats.morning + stuStats.evening} />
      </div>

      {/* Today's activity */}
      <div className="stats">
        <StatCard label="جلسات اليوم"   value={todaySessions} color="cyan" sub="جلسة علاجية مجدولة" />
        <StatCard label="مواعيد اليوم"  value={todayAppts}    color="warn" sub="موعد منتظر" />
        {canSeeHR && (
          <StatCard label="إجمالي الموظفين" value={empStats.total} sub={`نشطون: ${empStats.active}`} />
        )}
        {canSeeFinance && (
          <StatCard
            label="الرصيد الحالي"
            value={(totalIncome - totalExpense).toLocaleString('ar') + ' ر.س'}
            color={totalIncome >= totalExpense ? 'ok' : 'err'}
          />
        )}
      </div>

      {/* Quick actions */}
      <Widget title="⚡ وصول سريع">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-p" onClick={() => setActiveTab('students')}>
            👦 الطلاب
          </button>
          <button className="btn btn-c" onClick={() => setActiveTab('sessions')}>
            🩺 الجلسات
          </button>
          <button className="btn btn-v" onClick={() => setActiveTab('attendance')}>
            📋 تسجيل الحضور
          </button>
          <button className="btn btn-o" onClick={() => setActiveTab('iep')}>
            🎯 أهداف IEP
          </button>
          {canSeeHR && (
            <button className="btn btn-s" onClick={() => setActiveTab('hr')}>
              👥 الموظفون
            </button>
          )}
          {canSeeFinance && (
            <button className="btn btn-g" onClick={() => setActiveTab('finance')}>
              💰 المالية
            </button>
          )}
        </div>
      </Widget>

      {/* Programs breakdown */}
      <Widget title="📊 توزيع الطلاب على البرامج">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[
            { label: '☀️ الصف الصباحي', value: stuStats.morning, color: '#d97706' },
            { label: '🌙 الصف المسائي', value: stuStats.evening, color: '#7c3aed' },
            { label: '🩺 جلسات فردية',  value: stuStats.sessions, color: '#0891b2' },
            { label: '🌐 جلسات أونلاين', value: stuStats.online,  color: '#059669' },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ fontSize: '.84rem', flex: 1 }}>{p.label}</span>
              <strong style={{ fontSize: '1rem' }}>{p.value}</strong>
            </div>
          ))}
        </div>
      </Widget>
    </div>
  );
}
