# نظام إدارة المركز المتكامل — React v1.0

## 🏗️ هيكل المشروع

```
src/
├── main.jsx              ← نقطة الدخول
├── App.jsx               ← المكوّن الجذر (Wizard → Login → App)
│
├── context/
│   └── AppContext.jsx    ← الحالة العامة (CENTER, CUR_USER, toast...)
│
├── hooks/
│   ├── useStorage.js     ← قراءة/كتابة localStorage
│   ├── usePermissions.js ← صلاحيات الأدوار
│   ├── useStudents.js    ← إدارة بيانات الطلاب
│   └── useEmployees.js   ← إدارة بيانات الموظفين
│
├── utils/
│   └── constants.js      ← ROLES, TABS, STORAGE_KEYS
│
├── styles/
│   ├── global.css        ← CSS Variables + كل التصميم الأساسي
│   └── screens.css       ← Login + SetupWizard styles
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx       ← شريط التنقل العلوي
│   │   ├── SetupWizard.jsx  ← إعداد المركز (أول مرة)
│   │   ├── LoginScreen.jsx  ← شاشة تسجيل الدخول
│   │   └── AppRouter.jsx    ← توجيه التبويبات للصفحات
│   └── ui/
│       ├── Toast.jsx         ← إشعارات الحالة
│       ├── Modal.jsx         ← النوافذ المنبثقة
│       ├── Widget.jsx        ← الصندوق الأساسي
│       ├── StatCard.jsx      ← بطاقات الإحصاء
│       └── PlaceholderPage.jsx ← صفحات مؤقتة
│
└── pages/
    ├── Dashboard.jsx   ✅ مكتمل
    ├── Settings.jsx    ✅ مكتمل
    └── [باقي الصفحات تُضاف تدريجياً]
```

## 🚀 التشغيل

```bash
npm install
npm run dev
```

## 🌐 النشر على Vercel

```bash
npm run build
# ارفع مجلد dist إلى Vercel
# أو اربط الـ GitHub repo مباشرة
```

## 📋 خارطة الطريق — الـ Modules القادمة

| Module | الملف | الأولوية |
|--------|-------|----------|
| الطلاب | `pages/Students.jsx` | 🔴 عالية |
| الجلسات | `pages/Sessions.jsx` | 🔴 عالية |
| الحضور | `pages/Attendance.jsx` | 🟡 متوسطة |
| IEP | `pages/IEP.jsx` | 🟡 متوسطة |
| الموظفون | `pages/HR.jsx` | 🟡 متوسطة |
| المالية | `pages/Finance.jsx` | 🟢 لاحقاً |
| الوثائق | `pages/Docs.jsx` | 🟢 لاحقاً |
| التقارير | `pages/Reports.jsx` | 🟢 لاحقاً |
| الأونلاين | `pages/Online.jsx` | 🟢 لاحقاً |
| المركز | `pages/Center.jsx` | 🟢 لاحقاً |

## 🔐 كلمات المرور (للتطوير فقط)

| الدور | كلمة المرور |
|-------|-------------|
| مدير | manager123 |
| نائب | vice123 |
| أخصائي | spec123 |
| استقبال | rec123 |
| محاسب | acc123 |
| مشاهد | view123 |

> ⚠️ في الإنتاج: استخدم Firebase Authentication

## 💾 التوافق مع البيانات الحالية

النظام يستخدم نفس مفاتيح localStorage الأصلية — لا يوجد فقدان في البيانات.
