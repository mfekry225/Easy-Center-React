import { useApp } from './context/AppContext';
import SetupWizard  from './components/layout/SetupWizard';
import LoginScreen  from './components/layout/LoginScreen';
import Navbar       from './components/layout/Navbar';
import AppRouter    from './components/layout/AppRouter';
import ToastContainer from './components/ui/Toast';

// ══════════════════════════════════════════════════════════
//  App — المكوّن الجذر
//  يحل محل منطق DOMContentLoaded في الملف الأصلي:
//    FIRST_RUN → showWizard
//    !CUR_USER → showLogin
//    CUR_USER  → showApp
// ══════════════════════════════════════════════════════════

export default function App() {
  const { isConfigured, currentUser } = useApp();

  // 1. أول مرة — إعداد المركز
  if (!isConfigured) {
    return (
      <>
        <SetupWizard />
        <ToastContainer />
      </>
    );
  }

  // 2. لم يسجل الدخول بعد
  if (!currentUser) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  // 3. التطبيق الكامل
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AppRouter />
      </main>
      <ToastContainer />
    </>
  );
}
