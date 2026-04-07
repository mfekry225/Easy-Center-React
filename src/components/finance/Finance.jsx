import { useState, useMemo } from 'react';
import { useFinance } from '../../hooks/useFinance';
import { useStudents } from '../../hooks/useStudents';
import { usePermissions } from '../../hooks/usePermissions';
import Widget from '../ui/Widget';

const FEE_TYPES = ['رسوم شهرية','رسوم فصلية','رسوم سنوية','رسوم جلسة','أخرى'];
const EXP_CATS  = ['رواتب','إيجار','مستلزمات','صيانة','مصاريف إدارية','أخرى'];

export default function Finance() {
  const { fees, payments, expenses, stats, addFee, addPayment, addExpense } = useFinance();
  const { activeStudents } = useStudents();
  const { canSeeFinance } = usePermissions();

  const [tab, setTab]     = useState('overview');
  const [showForm, setShowForm] = useState(null); // 'fee'|'payment'|'expense'

  if (!canSeeFinance) {
    return (
      <div className="page">
        <div className="empty" style={{ padding: '80px 20px' }}>
          <div className="ei">🔐</div>
          <div className="et">ليس لديك صلاحية لعرض المالية</div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <FinanceForm
        type={showForm}
        students={activeStudents}
        onSave={data => {
          if (showForm === 'fee')     addFee(data);
          if (showForm === 'payment') addPayment(data);
          if (showForm === 'expense') addExpense(data);
          setShowForm(null);
        }}
        onCancel={() => setShowForm(null)}
      />
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const monthKey = today.slice(0, 7);

  const recentPayments = [...payments].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 10);
  const recentExpenses = [...expenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 10);
  const unpaidFees = fees.filter(f => f.status !== 'paid').sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t">
          <h2>💰 المالية</h2>
          <p>الرصيد: {stats.balance.toLocaleString('ar')} ر.س</p>
        </div>
        <div className="ph-a">
          <button className="btn btn-p btn-sm" onClick={() => setShowForm('fee')}>➕ رسوم</button>
          <button className="btn btn-g btn-sm" onClick={() => setShowForm('payment')}>💵 دفعة</button>
          <button className="btn btn-o btn-sm" onClick={() => setShowForm('expense')}>🧾 مصروف</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card ok">
          <div className="lb">إجمالي الإيرادات</div>
          <div className="vl" style={{ fontSize: '1.3rem' }}>{stats.totalIncome.toLocaleString('ar')}</div>
          <div className="sb">ر.س</div>
        </div>
        <div className="stat-card err">
          <div className="lb">إجمالي المصروفات</div>
          <div className="vl" style={{ fontSize: '1.3rem' }}>{stats.totalExpense.toLocaleString('ar')}</div>
          <div className="sb">ر.س</div>
        </div>
        <div className={`stat-card ${stats.balance >= 0 ? 'ok' : 'err'}`}>
          <div className="lb">صافي الرصيد</div>
          <div className="vl" style={{ fontSize: '1.3rem' }}>{stats.balance.toLocaleString('ar')}</div>
          <div className="sb">ر.س</div>
        </div>
        <div className="stat-card warn">
          <div className="lb">رسوم متأخرة</div>
          <div className="vl">{stats.unpaidFees}</div>
          <div className="sb">فاتورة غير مسددة</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '📊 نظرة عامة' },
          { id: 'fees',     label: '📋 الرسوم' },
          { id: 'payments', label: '💵 المدفوعات' },
          { id: 'expenses', label: '🧾 المصاريف' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`btn btn-sm ${tab === t.id ? 'btn-p' : 'btn-s'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <Widget title="📅 هذا الشهر">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--ok-l)', borderRadius: 10 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ok)' }}>{stats.monthIncome.toLocaleString('ar')}</div>
                <div style={{ fontSize: '.76rem', color: 'var(--g5)', marginTop: 4 }}>إيرادات الشهر (ر.س)</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 12px', background: 'var(--err-l)', borderRadius: 10 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--err)' }}>{stats.monthExpense.toLocaleString('ar')}</div>
                <div style={{ fontSize: '.76rem', color: 'var(--g5)', marginTop: 4 }}>مصروفات الشهر (ر.س)</div>
              </div>
            </div>
          </Widget>

          {unpaidFees.length > 0 && (
            <Widget title={`⚠️ رسوم غير مسددة (${unpaidFees.length})`}>
              {unpaidFees.slice(0, 5).map(f => {
                const stu = activeStudents.find(s => s.id === f.stuId);
                const overdue = f.dueDate && f.dueDate < today;
                return (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{stu?.name || '—'}</div>
                      <div style={{ fontSize: '.74rem', color: overdue ? 'var(--err)' : 'var(--g5)' }}>
                        {f.type} · استحقاق: {f.dueDate || '—'}
                        {overdue && ' ⚠️ متأخر'}
                      </div>
                    </div>
                    <span style={{ fontWeight: 900, color: 'var(--err)', fontSize: '.95rem' }}>{Number(f.amount).toLocaleString('ar')} ر.س</span>
                  </div>
                );
              })}
            </Widget>
          )}
        </div>
      )}

      {/* Fees */}
      {tab === 'fees' && (
        <Widget title="📋 الرسوم" noPadding>
          {fees.length === 0 ? (
            <div className="empty"><div className="ei">📋</div><div className="et">لا توجد رسوم مسجلة</div></div>
          ) : [...fees].sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || '')).map(f => {
            const stu = activeStudents.find(s => s.id === f.stuId);
            return (
              <div key={f.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
                <div className="av orange" style={{ fontSize: '1.2rem' }}>📋</div>
                <div className="ci">
                  <div className="cn">{stu?.name || '—'} · {f.type || '—'}</div>
                  <div className="cm">استحقاق: {f.dueDate || '—'} · {Number(f.amount || 0).toLocaleString('ar')} ر.س</div>
                </div>
                <span className={`bdg ${f.status === 'paid' ? 'b-gr' : f.dueDate < today ? 'b-rd' : 'b-yw'}`}>
                  {f.status === 'paid' ? '✅ مسدد' : f.dueDate < today ? '⚠️ متأخر' : '⏳ معلق'}
                </span>
              </div>
            );
          })}
        </Widget>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <Widget title="💵 المدفوعات" noPadding>
          {recentPayments.length === 0 ? (
            <div className="empty"><div className="ei">💵</div><div className="et">لا توجد مدفوعات</div></div>
          ) : recentPayments.map(p => {
            const stu = activeStudents.find(s => s.id === p.stuId);
            return (
              <div key={p.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
                <div className="av green" style={{ fontSize: '1.2rem' }}>💵</div>
                <div className="ci">
                  <div className="cn">{stu?.name || '—'}</div>
                  <div className="cm">{p.date || '—'} · {p.method || 'نقداً'}</div>
                  {p.notes && <div className="cm">{p.notes}</div>}
                </div>
                <span style={{ fontWeight: 900, color: 'var(--ok)', fontSize: '.95rem', flexShrink: 0 }}>
                  +{Number(p.amount || 0).toLocaleString('ar')} ر.س
                </span>
              </div>
            );
          })}
        </Widget>
      )}

      {/* Expenses */}
      {tab === 'expenses' && (
        <Widget title="🧾 المصاريف" noPadding>
          {recentExpenses.length === 0 ? (
            <div className="empty"><div className="ei">🧾</div><div className="et">لا توجد مصاريف</div></div>
          ) : recentExpenses.map(e => (
            <div key={e.id} className="card" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-color)', margin: 0 }}>
              <div className="av red" style={{ fontSize: '1.2rem' }}>🧾</div>
              <div className="ci">
                <div className="cn">{e.category || '—'}</div>
                <div className="cm">{e.date || '—'} {e.description ? `· ${e.description}` : ''}</div>
              </div>
              <span style={{ fontWeight: 900, color: 'var(--err)', fontSize: '.95rem', flexShrink: 0 }}>
                -{Number(e.amount || 0).toLocaleString('ar')} ر.س
              </span>
            </div>
          ))}
        </Widget>
      )}
    </div>
  );
}

// ── نموذج مالي موحّد ──
function FinanceForm({ type, students, onSave, onCancel }) {
  const today = new Date().toISOString().split('T')[0];
  const TITLES = { fee: '➕ رسوم جديدة', payment: '💵 تسجيل دفعة', expense: '🧾 مصروف جديد' };

  const [form, setForm] = useState({ stuId: '', amount: '', date: today, notes: '', type: '', category: '', method: 'نقداً', dueDate: today });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { padding: '10px 13px', border: '1.5px solid var(--g2)', borderRadius: 9, fontFamily: 'inherit', fontSize: '.9rem', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none', width: '100%' };

  function handleSubmit() {
    if (!form.amount) { alert('⚠️ المبلغ مطلوب'); return; }
    if (type !== 'expense' && !form.stuId) { alert('⚠️ اختر الطالب'); return; }
    onSave({ ...form, amount: parseFloat(form.amount) });
  }

  return (
    <div className="page">
      <div className="ph">
        <div className="ph-t"><h2>{TITLES[type]}</h2></div>
        <div className="ph-a">
          <button className="btn btn-s btn-sm" onClick={onCancel}>إلغاء</button>
          <button className="btn btn-p" onClick={handleSubmit}>💾 حفظ</button>
        </div>
      </div>
      <Widget>
        <div className="fg c2">
          {type !== 'expense' && (
            <div className="fl">
              <label>الطالب <span className="req">*</span></label>
              <select value={form.stuId} onChange={e => set('stuId', e.target.value)} style={inp}>
                <option value="">-- اختر --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
          {type === 'fee' && (
            <div className="fl">
              <label>نوع الرسوم</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} style={inp}>
                <option value="">-- اختر --</option>
                {FEE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          )}
          {type === 'expense' && (
            <div className="fl">
              <label>الفئة</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                <option value="">-- اختر --</option>
                {EXP_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}
          {type === 'payment' && (
            <div className="fl">
              <label>طريقة الدفع</label>
              <select value={form.method} onChange={e => set('method', e.target.value)} style={inp}>
                {['نقداً','تحويل بنكي','بطاقة ائتمان','شيك'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          )}
          <div className="fl">
            <label>المبلغ (ريال) <span className="req">*</span></label>
            <input type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} style={inp} />
          </div>
          <div className="fl">
            <label>التاريخ</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} />
          </div>
          {type === 'fee' && (
            <div className="fl">
              <label>تاريخ الاستحقاق</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} style={inp} />
            </div>
          )}
        </div>
        <div className="fl">
          <label>ملاحظات</label>
          <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="أي تفاصيل إضافية..." style={inp} />
        </div>
      </Widget>
    </div>
  );
}
