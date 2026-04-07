import { useStorage, generateId } from './useStorage';
import { useApp } from '../context/AppContext';

// ══════════════════════════════════════════════════════════
//  useStudents — يحل محل المتغير العالمي STUDENTS
//  وكل دوال: loadStudents, saveStudents, addStu, editStu...
// ══════════════════════════════════════════════════════════

export function useStudents() {
  const { toast } = useApp();
  const [students, setStudents] = useStorage('students', []);

  function addStudent(data) {
    const newStudent = { ...data, id: generateId(), _t: Date.now() };
    setStudents(prev => [newStudent, ...prev]);
    toast('✅ تم إضافة الطالب', 'ok');
    return newStudent;
  }

  function updateStudent(id, data) {
    setStudents(prev =>
      prev.map(s => s.id === id ? { ...s, ...data } : s)
    );
    toast('✅ تم تحديث البيانات', 'ok');
  }

  function deleteStudent(id) {
    setStudents(prev => prev.filter(s => s.id !== id));
    toast('🗑️ تم حذف الطالب', 'ok');
  }

  function getStudent(id) {
    return students.find(s => s.id === id);
  }

  // فلترة الطلاب النشطين فقط
  const activeStudents = students.filter(
    s => !['inactive', 'graduated', 'transferred', 'rejected'].includes(s.status)
  );

  // إحصاءات سريعة
  const stats = {
    total:     students.filter(s => s.status === 'active').length,
    waitlist:  students.filter(s => s.status === 'waitlist').length,
    inactive:  students.filter(s => s.status === 'inactive').length,
    graduated: students.filter(s => s.status === 'graduated').length,
    morning:   students.filter(s => s.progMorning?.enabled && s.status === 'active').length,
    evening:   students.filter(s => s.progEvening?.enabled && s.status === 'active').length,
    sessions:  students.filter(s => s.progSessions?.enabled && s.status === 'active').length,
    online:    students.filter(s => s.progOnline?.enabled && s.status === 'active').length,
  };

  return {
    students,
    activeStudents,
    stats,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudent,
  };
}
