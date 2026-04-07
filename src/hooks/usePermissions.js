import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';

// ══════════════════════════════════════════════════════════
//  usePermissions — يحل محل دوال الصلاحيات في الملف الأصلي:
//  canSeeHrNotifs(), canAddNotif(), إلخ
// ══════════════════════════════════════════════════════════

export function usePermissions() {
  const { currentUser } = useApp();
  const role = currentUser?.role;

  const is = (r) => role === r;
  const isAny = (...roles) => roles.includes(role);

  return {
    role,
    isManager:    is('manager'),
    isVice:       is('vice'),
    isSpecialist: is('specialist'),
    isReception:  is('reception'),
    isAccountant: is('accountant'),
    isViewer:     is('viewer'),

    // صلاحيات مجمّعة
    canManage:       isAny('manager', 'vice'),
    canSeeHR:        isAny('manager', 'vice'),
    canSeeFinance:   isAny('manager', 'vice', 'accountant'),
    canEditStudents: isAny('manager', 'vice', 'specialist', 'reception'),
    canEditSessions: isAny('manager', 'vice', 'specialist'),
    canAddNotif:     isAny('manager', 'vice'),
    canResetCenter:  is('manager'),
    isReadOnly:      is('viewer'),

    // تحقق ديناميكي
    can: (tabId) => ROLES[role]?.tabs.includes(tabId) ?? false,
  };
}
