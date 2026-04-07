import { useStorage, generateId } from './useStorage';
import { useApp } from '../context/AppContext';

export function useFinance() {
  const { toast } = useApp();
  const [fees,     setFees]     = useStorage('fees',     []);
  const [payments, setPayments] = useStorage('payments', []);
  const [expenses, setExpenses] = useStorage('expenses', []);
  const [salaries, setSalaries] = useStorage('salaries', []);

  const today   = new Date().toISOString().split('T')[0];
  const monthKey = today.slice(0, 7); // YYYY-MM

  function addFee(data) {
    const f = { ...data, id: generateId(), _t: Date.now() };
    setFees(prev => [f, ...prev]);
    toast('✅ تم إضافة الرسوم', 'ok');
    return f;
  }

  function addPayment(data) {
    const p = { ...data, id: generateId(), date: data.date || today, _t: Date.now() };
    setPayments(prev => [p, ...prev]);
    toast('✅ تم تسجيل الدفعة', 'ok');
    return p;
  }

  function addExpense(data) {
    const e = { ...data, id: generateId(), date: data.date || today, _t: Date.now() };
    setExpenses(prev => [e, ...prev]);
    toast('✅ تم تسجيل المصروف', 'ok');
    return e;
  }

  function saveSalary(empId, month, data) {
    const existing = salaries.find(s => s.empId === empId && s.month === month);
    if (existing) {
      setSalaries(prev => prev.map(s => s.id === existing.id ? { ...s, ...data } : s));
    } else {
      setSalaries(prev => [...prev, { ...data, id: generateId(), empId, month }]);
    }
    toast('✅ تم حفظ الراتب', 'ok');
  }

  // إحصاءات مالية
  const totalIncome  = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalExpense = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const balance      = totalIncome - totalExpense;

  const monthIncome  = payments.filter(p => p.date?.startsWith(monthKey)).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const monthExpense = expenses.filter(e => e.date?.startsWith(monthKey)).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const unpaidFees = fees.filter(f => f.status !== 'paid');

  const stats = { totalIncome, totalExpense, balance, monthIncome, monthExpense, unpaidFees: unpaidFees.length };

  return { fees, payments, expenses, salaries, stats, addFee, addPayment, addExpense, saveSalary };
}
