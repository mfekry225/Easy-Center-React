import { useState, useMemo } from 'react';
import { useStudents } from '../../hooks/useStudents';
import { useEmployees } from '../../hooks/useEmployees';
import { usePermissions } from '../../hooks/usePermissions';
import { useApp } from '../../context/AppContext';
import Widget from '../ui/Widget';
import StatCard from '../ui/StatCard';
import StudentForm from './StudentForm';
import StudentDetail from './StudentDetail';

const STATUS_MAP = {
  active:      { cls: 'b-gr', label: '✅ نشط' },
  inactive:    { cls: 'b-gy', label: '⏸️ منقطع' },
  graduated:   { cls: 'b-bl', label: '🎓 متخرج' },
  transferred: { cls: 'b-pu', label: '🔄 محوّل' },
  waitlist:    { cls: 'b-yw', label: '⏳ انتظار' },
  rejected:    { cls: 'b-rd', label: '❌ غير مناسب' },
};

const TABS = [
  { id: 'all',      label: 'الكل' },
  { id: 'active',   label: '✅ نشطون' },
  { id: 'sessions', label: '🩺 جلسات' },
  { id: 'morning',  label: '☀️ صباحي' },
  { id: 'evening',  label: '🌙 مسائي' },
  { id: 'online',   label: '🌐 أونلاين' },
  { id: 'waitlist', label: '⏳ انتظار' },
  { id: 'inactive', label: '⏸️ منقطعون' },
];

export default function Students() {
  const { students, stats, addStudent, updateStudent, deleteStudent } = useStudents();
  const { specialists } = useEmployees();
  const { canEditStudents } = usePermissions();
  const { toast } = useApp();

  const [activeTab, setActiveTab]       = useState('all');
  const [query, setQuery]               = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [editStudent, setEditStudent]   = useState(null);   // null=new, obj=edit
  const [detailStudent, setDetailStudent] = useState(null); // student to view

  // ── فلترة الطلاب ──
  const filtered = useMemo(() => {
    let list = [...students];

    // فلتر التبويب
    if (activeTab === 'active')   list = list.filter(s => s.status === 'active');
    else if (activeTab === 'sessions') list = list.filter(s => s.progSessions?.enabled && s.status === 'active');
    else if (activeTab === 'morning')  list = list.filter(s => s.progMorning?.enabled && s.status === 'active');
    else if (activeTab === 'evening')  list = list.filter(s => s.progEvening?.enabled && s.status === 'active');
    else if (activeTab === 'online')   list = list.filter(s => s.progOnline?.enabled && s.status === 'active');
    else if (activeTab === 'waitlist') list = list.filter(s => s.status === 'waitlist');
    else if (activeTab === 'inactive') list = list.filter(s => s.status === 'inactive');

    // فلتر البحث
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.parentName || '').toLowerCase().includes(q) ||
        (s.diag || '').toLowerCase().includes(q) ||
        (s.parentPhone || '').includes(q)
      );
    }

    return list;
  }, [students, activeTab, query]);

  // ── فتح نموذج الإضافة/التعديل ──
  function openForm(student = null) {
    setEditStudent(student);
    setShowForm(true);
  }

  function handleSave(data) {
    if (editStudent) {
      updateStudent(editStudent.id, data);
    } else {
      addStudent(data);
    }
    setShowForm(false);
    setEditStudent(null);
  }

  function handleDelete(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    if (!window.confirm(`⚠️ تحذير:\nهل تريد حذف الطالب "${s.name}" نهائياً؟\nسيتم حذف جميع بياناته.`)) return;
    if (!window.confirm(`🔴 تأكيد نهائي:\nلا يمكن التراجع! هل أنت متأكد؟`)) return;
    deleteStudent(id);
    setDetailStudent(null);
    setShowForm(false);
  }

  // ── عرض التفصيل ──
  if (detailStudent) {
    const fresh = students.find(s => s.id === detailStudent.id);
    return (
      <StudentDetail
        student={fresh || detailStudent}
        specialists={specialists}
        onBack={() => setDetailStudent(null)}
        onEdit={() => { openForm(fresh || detailStudent); setDetailStudent(null); }}
        onDelete={() => handleDelete(detailStudent.id)}
        canEdit={canEditStudents}
      />
    );
  }

  // ── نموذج الإضافة/التعديل ──
  if (showForm) {
    return (
      <StudentForm
        student={editStudent}
        specialists={specialists}
        onSave={handleSave}
        onCancel={() => { setShowForm(false); setEditStudent(null); }}
        onDelete={editStudent ? () => handleDelete(editStudent.id) : null}
      />
    );
  }

  // ── القائمة الرئيسية ──
  return (
    <div className="page">
      {/* Page Header */}
      <div className="ph">
        <div className="ph-t">
          <h2>👦 الطلاب</h2>
          <p>إجمالي: {stats.total} نشط — {stats.waitlist} في الانتظار</p>
        </div>
        <div className="ph-a">
          {canEditStudents && (
            <button className="btn btn-p" onClick={() => openForm()}>
              ➕ طالب جديد
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <StatCard label="نشطون"       value={stats.total}    color="ok" />
        <StatCard label="جلسات"       value={stats.sessions} color="cyan" />
        <StatCard label="أونلاين"     value={stats.online}   color="pur" />
        <StatCard label="قائمة انتظار" value={stats.waitlist} color="warn" />
      </div>

      {/* Tabs + Search */}
      <Widget noPadding>
        {/* Tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', padding: '0 4px', gap: 2 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '10px 14px',
                border: 'none', background: 'transparent',
                borderBottom: activeTab === t.id ? '2px solid var(--pr)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--pr)' : 'var(--g5)',
                fontWeight: activeTab === t.id ? 800 : 600,
                fontSize: '.82rem', cursor: 'pointer',
                whiteSpace: 'nowrap', fontFamily: 'inherit',
                transition: 'all .15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-color)' }}>
          <input
            type="text"
            placeholder="🔍 ابحث بالاسم، ولي الأمر، التشخيص، الجوال..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', padding: '9px 13px',
              border: '1.5px solid var(--g2)', borderRadius: 9,
              fontFamily: 'inherit', fontSize: '.9rem',
              background: 'var(--bg-input)', color: 'var(--text-main)',
              outline: 'none',
            }}
          />
        </div>

        {/* List */}
        <div>
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="ei">👦</div>
              <div className="et">
                {query ? `لا توجد نتائج لـ "${query}"` : 'لا يوجد طلاب في هذه الفئة'}
              </div>
            </div>
          ) : filtered.map(s => (
            <StudentCard
              key={s.id}
              student={s}
              specialist={specialists.find(e => e.id === s.specId)}
              onClick={() => setDetailStudent(s)}
            />
          ))}
        </div>
      </Widget>
    </div>
  );
}

// ── بطاقة الطالب ──
function StudentCard({ student: s, specialist, onClick }) {
  const status = STATUS_MAP[s.status] || STATUS_MAP.active;
  const programs = [
    s.progMorning?.enabled  && '☀️',
    s.progEvening?.enabled  && '🌙',
    s.progSessions?.enabled && '🩺',
    s.progOnline?.enabled   && '🌐',
  ].filter(Boolean);

  const initials = (s.name || '?').slice(0, 2);
  const waPhone = (s.parentPhone || '').replace(/[^0-9+]/g, '').replace(/^0/, '966');

  return (
    <div
      className="card clickable"
      onClick={onClick}
      style={{ borderBottom: '1px solid var(--border-color)', borderRadius: 0, margin: 0 }}
    >
      {/* Avatar */}
      <div className="av purple" style={{ fontSize: s.photo ? '0' : '.82rem', overflow: 'hidden' }}>
        {s.photo
          ? <img src={s.photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : initials
        }
      </div>

      {/* Info */}
      <div className="ci">
        <div className="cn">
          {s.name}
          {s.gen === 'ذكر' ? ' 👦' : s.gen === 'أنثى' ? ' 👧' : ''}
        </div>
        <div className="cm">
          {s.diag || '—'} · {specialist?.name || '—'}
          {s.parentPhone && ` · ${s.parentPhone}`}
        </div>
        {programs.length > 0 && (
          <div className="cm">{programs.join(' ')}</div>
        )}
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span className={`bdg ${status.cls}`}>{status.label}</span>
        {waPhone && (
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="bdg b-gr"
            style={{ textDecoration: 'none' }}
          >
            💬
          </a>
        )}
      </div>
    </div>
  );
}
