import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../hooks/usePermissions';
import Dashboard  from '../../pages/Dashboard';
import Settings   from '../../pages/Settings';
import Students   from '../students/Students';
import Attendance from '../attendance/Attendance';
import IEP        from '../iep/IEP';
import Sessions   from '../sessions/Sessions';
import HR         from '../hr/HR';
import Finance    from '../finance/Finance';
import Online     from '../online/Online';
import Reports    from '../reports/Reports';
import Center     from '../center/Center';
import Docs       from '../docs/Docs';

const PAGE_MAP = {
  dashboard:  () => <Dashboard />,
  students:   () => <Students />,
  sessions:   () => <Sessions />,
  online:     () => <Online />,
  attendance: () => <Attendance />,
  iep:        () => <IEP />,
  hr:         () => <HR />,
  finance:    () => <Finance />,
  docs:       () => <Docs />,
  reports:    () => <Reports />,
  center:     () => <Center />,
  settings:   () => <Settings />,
};

export default function AppRouter() {
  const { activeTab } = useApp();
  const { can } = usePermissions();

  if (!can(activeTab)) {
    return (
      <div className="page">
        <div className="empty" style={{ padding: '80px 20px' }}>
          <div className="ei">🔐</div>
          <div className="et">ليس لديك صلاحية للوصول لهذا القسم</div>
        </div>
      </div>
    );
  }

  const PageComponent = PAGE_MAP[activeTab];
  return PageComponent ? <PageComponent /> : null;
}
