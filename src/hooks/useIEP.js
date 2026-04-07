import { useStorage, generateId } from './useStorage';
import { useApp } from '../context/AppContext';

export function useIEP() {
  const { toast } = useApp();
  const [iep, setIEP] = useStorage('iep', []);

  function addGoal(stuId, data) {
    const g = { ...data, stuId, id: generateId(), _t: Date.now() };
    setIEP(prev => [g, ...prev]);
    toast('✅ تم إضافة الهدف', 'ok');
    return g;
  }

  function updateGoal(id, data) {
    setIEP(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    toast('✅ تم التحديث', 'ok');
  }

  function updateProgress(id, pct) {
    setIEP(prev => prev.map(g => g.id === id ? { ...g, pct } : g));
  }

  function deleteGoal(id) {
    setIEP(prev => prev.filter(g => g.id !== id));
    toast('🗑️ تم حذف الهدف', 'ok');
  }

  function getStudentGoals(stuId) {
    return iep.filter(g => g.stuId === stuId);
  }

  // أهداف تحتاج مراجعة خلال 7 أيام
  const today = new Date();
  const upcomingReviews = iep.filter(g => {
    if (!g.reviewDate) return false;
    const diff = Math.round((new Date(g.reviewDate) - today) / 864e5);
    return diff >= 0 && diff <= 7;
  });

  const stats = {
    total:   iep.length,
    reviews: upcomingReviews.length,
    done:    iep.filter(g => (g.pct || 0) >= 100).length,
  };

  return { iep, stats, upcomingReviews, addGoal, updateGoal, updateProgress, deleteGoal, getStudentGoals };
}
