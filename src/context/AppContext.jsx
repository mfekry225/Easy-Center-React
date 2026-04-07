import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_CENTER, DEFAULT_FIREBASE, STORAGE_KEYS } from '../utils/constants';

// ══════════════════════════════════════════════════════════
//  AppContext — يحل محل المتغيرات العامة في الملف الأصلي:
//  CENTER, FB_CFG, CUR_USER, STUDENTS, EMPS, إلخ
// ══════════════════════════════════════════════════════════

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── إعدادات المركز ──
  const [center, setCenter]   = useState(DEFAULT_CENTER);
  const [fbCfg, setFbCfg]     = useState(DEFAULT_FIREBASE);
  const [isConfigured, setIsConfigured] = useState(false);

  // ── المستخدم الحالي ──
  const [currentUser, setCurrentUser] = useState(null);

  // ── الحالة العامة للتطبيق ──
  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Toast notifications ──
  const [toasts, setToasts] = useState([]);

  // ── Dark mode ──
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('scs_dark') === '1';
  });

  // ── تحميل الإعدادات من localStorage عند البدء ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.config);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.center?.configured) {
          setCenter(parsed.center);
          setFbCfg(parsed.firebase || DEFAULT_FIREBASE);
          setIsConfigured(true);
          applyTheme(parsed.center.color);
        }
      }
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  }, []);

  // ── تطبيق الثيم عند تغيير اللون ──
  useEffect(() => {
    if (center.color) applyTheme(center.color);
  }, [center.color]);

  // ── Dark mode effect ──
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('scs_dark', isDark ? '1' : '0');
  }, [isDark]);

  // ── prefix للبيانات (يعزل كل مركز) ──
  const prefix = useCallback(() => {
    return center.name ? `scs_${center.name}_` : 'scs_default_';
  }, [center.name]);

  // ── حفظ إعدادات المركز ──
  const saveConfig = useCallback((newCenter, newFb) => {
    localStorage.setItem(STORAGE_KEYS.config, JSON.stringify({
      center: newCenter,
      firebase: newFb,
    }));
    setCenter(newCenter);
    setFbCfg(newFb);
    setIsConfigured(true);
    applyTheme(newCenter.color);
  }, []);

  // ── إعادة ضبط المركز (للمدير فقط) ──
  const resetConfig = useCallback(() => {
    if (currentUser?.role !== 'manager') {
      toast('⚠️ إعادة الإعداد متاحة للمدير الرئيسي فقط', 'er');
      return;
    }
    if (!window.confirm('⚠️ تحذير: هل أنت متأكد من إعادة إعداد المركز؟\nسيتم مسح إعدادات المركز فقط — البيانات ستبقى في Firebase.')) return;
    if (!window.confirm('🔴 تأكيد نهائي: هل تريد المتابعة؟\nلا يمكن التراجع عن هذا الإجراء.')) return;
    localStorage.removeItem(STORAGE_KEYS.config);
    setCenter(DEFAULT_CENTER);
    setFbCfg(DEFAULT_FIREBASE);
    setIsConfigured(false);
    setCurrentUser(null);
  }, [currentUser]);

  // ── Toast helper ──
  const toast = useCallback((message, type = 'ok', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  // ── تسجيل الخروج ──
  const logout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  }, []);

  const value = {
    // المركز
    center, setCenter,
    fbCfg, setFbCfg,
    isConfigured,
    saveConfig,
    resetConfig,
    prefix,

    // المستخدم
    currentUser, setCurrentUser,
    logout,

    // Navigation
    activeTab, setActiveTab,

    // UI
    isDark, setIsDark,
    toast, toasts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ══ Hook مختصر للوصول للـ context ══
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

// ══ تطبيق لون المركز على CSS variables ══
function applyTheme(color) {
  if (!color) return;
  const root = document.documentElement;
  root.style.setProperty('--pr', color);
  const h = color.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  root.style.setProperty('--pr-d', `rgb(${Math.max(0,r-35)},${Math.max(0,g-35)},${Math.max(0,b-35)})`);
  root.style.setProperty('--pr-l', `rgba(${r},${g},${b},0.1)`);
}
