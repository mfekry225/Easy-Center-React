import { useApp } from '../../context/AppContext';
import { ROLES, TABS } from '../../utils/constants';

export default function Navbar() {
  const { center, currentUser, activeTab, setActiveTab, isDark, setIsDark, logout } = useApp();

  if (!currentUser) return null;

  const role = ROLES[currentUser.role];
  const visibleTabs = TABS.filter(tab => role?.tabs.includes(tab.id));

  return (
    <nav className="nav">
      {/* Brand */}
      <div className="nav-brand">
        {center.logo
          ? <img src={center.logo} alt={center.name} />
          : <div className="nav-brand-ph">🏫</div>
        }
        <div>
          <div className="nav-cname">{center.name || 'المركز'}</div>
          <div className="nav-uname">{role?.icon} {currentUser.name || role?.label}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {visibleTabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon} {tab.label}
        </button>
      ))}

      <div className="nav-spacer" />

      {/* Dark mode toggle */}
      <button
        className="nav-icon-btn dark-toggle"
        onClick={() => setIsDark(!isDark)}
        title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Logout */}
      <button className="nav-logout" onClick={logout}>
        خروج
      </button>
    </nav>
  );
}
