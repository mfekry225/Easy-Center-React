import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

// ══════════════════════════════════════════════════════════
//  useStorage — hook يبسّط القراءة/الكتابة من localStorage
//  يحل محل كل دوال: loadStudents/saveStudents/loadSessions...
//
//  الاستخدام:
//  const [students, setStudents] = useStorage('students', []);
// ══════════════════════════════════════════════════════════

export function useStorage(key, defaultValue = []) {
  const { prefix } = useApp();
  const fullKey = `${prefix()}${key}`;

  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback((newValue) => {
    const resolved = typeof newValue === 'function' ? newValue(value) : newValue;
    setValue(resolved);
    try {
      localStorage.setItem(fullKey, JSON.stringify(resolved));
    } catch (e) {
      console.error('localStorage write error:', e);
    }
  }, [fullKey, value]);

  const reload = useCallback(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      const parsed = raw ? JSON.parse(raw) : defaultValue;
      setValue(parsed);
      return parsed;
    } catch {
      return defaultValue;
    }
  }, [fullKey, defaultValue]);

  return [value, set, reload];
}

// ══════════════════════════════════════════════════════════
//  generateId — يحل محل: Date.now().toString(36) + Math.random()...
// ══════════════════════════════════════════════════════════

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
