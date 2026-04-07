import { useStorage, generateId } from './useStorage';
import { useApp } from '../context/AppContext';

export function useSessions() {
  const { toast } = useApp();
  const [sessions, setSessions] = useStorage('sessions', []);
  const [appts, setAppts]       = useStorage('appts', []);

  // ── الجلسات العلاجية ──
  function addSession(data) {
    const s = { ...data, id: generateId(), _t: Date.now() };
    setSessions(prev => [s, ...prev]);
    toast('✅ تم تسجيل الجلسة', 'ok');
    return s;
  }

  function updateSession(id, data) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    toast('✅ تم التحديث', 'ok');
  }

  function deleteSession(id) {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast('🗑️ تم الحذف', 'ok');
  }

  // ── المواعيد ──
  function addAppt(data) {
    const a = { ...data, id: generateId(), status: 'scheduled', _t: Date.now() };
    setAppts(prev => [a, ...prev]);
    toast('✅ تم تسجيل الموعد', 'ok');
    return a;
  }

  function updateApptStatus(id, status) {
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  // إحصاءات
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    total:   sessions.length,
    today:   sessions.filter(s => s.nextDate === today || s.date === today).length,
    pending: appts.filter(a => a.status === 'scheduled').length,
    done:    sessions.filter(s => s.status === 'done').length,
  };

  return { sessions, appts, stats, addSession, updateSession, deleteSession, addAppt, updateApptStatus };
}
