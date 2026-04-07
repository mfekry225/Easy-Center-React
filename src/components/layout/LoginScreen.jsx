import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROLES } from '../../utils/constants';

export default function LoginScreen() {
  const { center, setCurrentUser, toast } = useApp();
  const [selectedRole, setSelectedRole] = useState('');
  const [name, setName]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');

  function handleLogin() {
    if (!selectedRole) { setError('الرجاء اختيار الدور'); return; }
    const role = ROLES[selectedRole];
    if (!role) return;

    // تحقق من كلمة المرور
    if (password !== role.password) {
      setError('كلمة المرور غير صحيحة');
      return;
    }

    setCurrentUser({ role: selectedRole, name: name.trim() || role.label });
    toast(`مرحباً ${name.trim() || role.label} 👋`, 'ok');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div id="login-screen" style={{ display: 'flex' }}>
      <div className="login-box">
        {/* Header */}
        <div className="login-hd">
          {center.logo
            ? <img src={center.logo} className="login-logo" alt={center.name} />
            : <div className="login-logo-ph">🏫</div>
          }
          <h2>{center.name || 'نظام إدارة المركز'}</h2>
          <p>تسجيل الدخول للمتابعة</p>
        </div>

        {/* Body */}
        <div className="login-body">
          {/* Role selection */}
          <div className="role-grid">
            {Object.values(ROLES).map(role => (
              <button
                key={role.id}
                className={`role-btn ${selectedRole === role.id ? 'sel' : ''}`}
                onClick={() => { setSelectedRole(role.id); setError(''); }}
              >
                <div className="ri">{role.icon}</div>
                <div className="rn">{role.label}</div>
                <div className="rd">{role.desc}</div>
              </button>
            ))}
          </div>

          {/* Name (optional) */}
          <div className="lf">
            <label>الاسم (اختياري)</label>
            <input
              type="text"
              placeholder="اسمك..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Password */}
          <div className="lf">
            <label>كلمة المرور</label>
            <input
              type="password"
              placeholder="أدخل كلمة المرور..."
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="login-err" style={{ display: 'block' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Login button */}
          <button className="login-btn" onClick={handleLogin}>
            تسجيل الدخول
          </button>

          <div className="login-footer">
            <p>نظام إدارة المركز المتكامل v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
