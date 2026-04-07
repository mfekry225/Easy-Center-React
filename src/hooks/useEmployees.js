import { useStorage, generateId } from './useStorage';
import { useApp } from '../context/AppContext';

// ══════════════════════════════════════════════════════════
//  useEmployees — يحل محل المتغير العالمي EMPS
// ══════════════════════════════════════════════════════════

export function useEmployees() {
  const { toast } = useApp();
  const [employees, setEmployees] = useStorage('employees', []);

  function addEmployee(data) {
    const newEmp = { ...data, id: generateId(), _t: Date.now() };
    setEmployees(prev => [newEmp, ...prev]);
    toast('✅ تم إضافة الموظف', 'ok');
    return newEmp;
  }

  function updateEmployee(id, data) {
    setEmployees(prev =>
      prev.map(e => e.id === id ? { ...e, ...data } : e)
    );
    toast('✅ تم تحديث بيانات الموظف', 'ok');
  }

  function deleteEmployee(id) {
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast('🗑️ تم حذف الموظف', 'ok');
  }

  function getEmployee(id) {
    return employees.find(e => e.id === id);
  }

  const activeEmployees = employees.filter(e => e.status !== 'inactive');

  const specialists = employees.filter(
    e => ['specialist', 'therapist', 'teacher'].includes(e.jobType)
  );

  const stats = {
    total:    employees.length,
    active:   activeEmployees.length,
    specialists: specialists.length,
    expiring: employees.filter(e => {
      if (!e.contractEnd) return false;
      const diff = Math.round((new Date(e.contractEnd) - new Date()) / 864e5);
      return diff >= 0 && diff <= 30;
    }).length,
  };

  return {
    employees,
    activeEmployees,
    specialists,
    stats,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
  };
}
