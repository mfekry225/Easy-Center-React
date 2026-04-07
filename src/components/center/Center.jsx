import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, CENTER_SUBTABS } from '../utils/constants';

// استورد صفحاتك هنا عند إنشائها:
// import Finance from './Finance';
// import Docs from './Docs';

export default function Center() {
  const { currentUser } = useApp();
  const role = ROLES[currentUser?.role];

  // تحديد التبويبات الفرعية المتاحة لهذا الدور
  // إذا كان الدور لديه centerSubTabs محددة → اعرضها فقط
  // وإلا → اعرض كل التبويبات (للمدير والنائب)
  const allowedSubTabs = role?.centerSubTabs
    ? CENTER_SUBTABS.filter(t => role.centerSubTabs.includes(t.id))
    : CENTER_SUBTABS;

  const [activeSubTab, setActiveSubTab] = useState(allowedSubTabs[0]?.id || 'finance');

  return (
    <div className="center-page">
      {/* رأس الصفحة */}
      <div className="center-header">
        <h2>🏛️ إدارة المركز</h2>
      </div>

      {/* التبويبات الفرعية */}
      <div className="center-subtabs">
        {allowedSubTabs.map(tab => (
          <button
            key={tab.id}
            className={`center-subtab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* محتوى التبويب النشط */}
      <div className="center-content">
        {activeSubTab === 'finance' && (
          <div className="placeholder">
            {/* <Finance /> */}
            <p>💰 صفحة المالية — ستُعرض هنا</p>
          </div>
        )}
        {activeSubTab === 'docs' && (
          <div className="placeholder">
            {/* <Docs /> */}
            <p>📁 صفحة الوثائق — ستُعرض هنا</p>
          </div>
        )}
        {activeSubTab === 'settings' && (
          <div className="placeholder">
            <p>⚙️ إعدادات المركز — ستُعرض هنا</p>
          </div>
        )}
      </div>
    </div>
  );
}
