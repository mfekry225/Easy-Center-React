// ══════════════════════════════════════════════
//  🔐 الأدوار وصلاحياتها
// ══════════════════════════════════════════════

export const ROLES = {
  manager: {
    id: 'manager',
    label: 'المدير الرئيسي',
    icon: '👑',
    desc: 'صلاحيات كاملة',
    password: 'manager123',
    tabs: ['dashboard', 'students', 'sessions', 'online', 'attendance', 'iep', 'hr', 'reports', 'center', 'settings'],
  },
  vice: {
    id: 'vice',
    label: 'نائب المدير',
    icon: '🏅',
    desc: 'إدارة وإشراف',
    password: 'vice123',
    tabs: ['dashboard', 'students', 'sessions', 'online', 'attendance', 'iep', 'hr', 'reports', 'center'],
  },
  specialist: {
    id: 'specialist',
    label: 'أخصائي',
    icon: '🩺',
    desc: 'الطلاب والجلسات',
    password: 'spec123',
    tabs: ['dashboard', 'students', 'sessions', 'online', 'attendance', 'iep'],
  },
  reception: {
    id: 'reception',
    label: 'موظف استقبال',
    icon: '🗂️',
    desc: 'الاستقبال والحضور',
    password: 'rec123',
    tabs: ['dashboard', 'students', 'attendance'],
  },
  accountant: {
    id: 'accountant',
    label: 'المحاسب',
    icon: '💰',
    desc: 'المالية والرواتب',
    password: 'acc123',
    // المحاسب يصل لإدارة المركز ليرى تبويب المالية بداخلها
    tabs: ['dashboard', 'students', 'center'],
    // تحديد التبويبات الفرعية المتاحة له داخل إدارة المركز
    centerSubTabs: ['finance'],
  },
  viewer: {
    id: 'viewer',
    label: 'مشاهد',
    icon: '👁️',
    desc: 'عرض فقط',
    password: 'view123',
    tabs: ['dashboard', 'students', 'reports'],
  },
};

// ══════════════════════════════════════════════
//  📑 تعريف التبويبات / الصفحات
//  ملاحظة: finance و docs أُزيلا من هنا لأنهما
//  أصبحا تبويبات فرعية داخل صفحة إدارة المركز
// ══════════════════════════════════════════════

export const TABS = [
  { id: 'dashboard',  label: 'الرئيسية',      icon: '🏠' },
  { id: 'students',   label: 'الطلاب',         icon: '👦' },
  { id: 'sessions',   label: 'الجلسات',        icon: '🩺' },
  { id: 'online',     label: 'الأونلاين',      icon: '🌐' },
  { id: 'attendance', label: 'الحضور',         icon: '📋' },
  { id: 'iep',        label: 'IEP',            icon: '🎯' },
  { id: 'hr',         label: 'الموظفون',       icon: '👥' },
  { id: 'reports',    label: 'التقارير',       icon: '📊' },
  { id: 'center',     label: 'إدارة المركز',   icon: '🏛️' },
  { id: 'settings',   label: 'الإعدادات',      icon: '⚙️' },
];

// ══════════════════════════════════════════════
//  🏛️ التبويبات الفرعية داخل صفحة إدارة المركز
// ══════════════════════════════════════════════

export const CENTER_SUBTABS = [
  { id: 'finance',  label: 'المالية',        icon: '💰' },
  { id: 'docs',     label: 'الوثائق',        icon: '📁' },
  { id: 'settings', label: 'إعدادات المركز', icon: '⚙️' },
];

// ══════════════════════════════════════════════
//  🗄️ مفاتيح localStorage
// ══════════════════════════════════════════════

export const STORAGE_KEYS = {
  config:    'scs_v2_config',
  students:  (pfx) => `${pfx}students`,
  employees: (pfx) => `${pfx}employees`,
  sessions:  (pfx) => `${pfx}sessions`,
  online:    (pfx) => `${pfx}online`,
  iep:       (pfx) => `${pfx}iep`,
  finance:   (pfx) => `${pfx}finance`,
  salaries:  (pfx) => `${pfx}salaries`,
  att_stu:   (pfx) => `${pfx}att_stu`,
  att_emp:   (pfx) => `${pfx}att_emp`,
  appts:     (pfx) => `${pfx}appts`,
  leaves:    (pfx) => `${pfx}leaves`,
  docs:      (pfx) => `${pfx}docs`,
  assets:    (pfx) => `${pfx}assets`,
  notifs:    (pfx) => `${pfx}notifs`,
};

// ══════════════════════════════════════════════
//  🎨 ثيم المركز الافتراضي
// ══════════════════════════════════════════════

export const DEFAULT_CENTER = {
  name: '',
  logo: '',
  color: '#1a56db',
  configured: false,
};

export const DEFAULT_FIREBASE = {
  apiKey: '', projectId: '', authDomain: '',
  storageBucket: '', messagingSenderId: '', appId: '',
};
