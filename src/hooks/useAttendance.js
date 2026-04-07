import { useStorage, generateId } from './useStorage';
import { useApp } from '../context/AppContext';

export function useAttendance() {
  const { toast } = useApp();
  const [attStu, setAttStu] = useStorage('att_stu', []);
  const [attEmp, setAttEmp] = useStorage('att_emp', []);

  const today = new Date().toISOString().split('T')[0];

  // ── تسجيل حضور طالب ──
  function markStudent(kidId, date, session, status, times = {}) {
    const existing = attStu.find(a => a.kidId === kidId && a.date === date && a.session === session);
    const data = { kidId, date, session, status, ...times };
    if (existing) {
      setAttStu(prev => prev.map(a => a.id === existing.id ? { ...a, ...data } : a));
    } else {
      setAttStu(prev => [...prev, { ...data, id: generateId() }]);
    }
    toast(`${status === 'present' ? '✅' : '❌'} تم التسجيل`, 'ok');
  }

  // ── تسجيل حضور موظف ──
  function markEmployee(empId, date, status, times = {}) {
    const existing = attEmp.find(a => a.empId === empId && a.date === date);
    const data = { empId, date, status, ...times };
    if (existing) {
      setAttEmp(prev => prev.map(a => a.id === existing.id ? { ...a, ...data } : a));
    } else {
      setAttEmp(prev => [...prev, { ...data, id: generateId() }]);
    }
    toast('✅ تم تسجيل الحضور', 'ok');
  }

  function getStudentAtt(kidId, session, date = today) {
    return attStu.find(a => a.kidId === kidId && a.date === date && a.session === session);
  }

  function getEmployeeAtt(empId, date = today) {
    return attEmp.find(a => a.empId === empId && a.date === date);
  }

  // إحصاءات اليوم
  function todayStats(studentList, session) {
    const list = session ? studentList.filter(s => s[`prog${capitalize(session)}`]?.enabled) : studentList;
    const present = attStu.filter(a => a.date === today && a.status === 'present' && a.session === session && list.find(s => s.id === a.kidId)).length;
    const absent  = attStu.filter(a => a.date === today && a.status === 'absent'  && a.session === session && list.find(s => s.id === a.kidId)).length;
    return { total: list.length, present, absent, unrecorded: list.length - present - absent };
  }

  return { attStu, attEmp, markStudent, markEmployee, getStudentAtt, getEmployeeAtt, todayStats };
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
