import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PublicThemeToggle } from './components/PublicThemeToggle';
import { Layout } from './components/layout/Layout';
import { useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Home } from './pages/public/Home';
import { Dashboard } from './pages/Dashboard';
import Settings from './pages/Settings';
import { ParentDashboard } from './pages/ParentDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ParentStudents } from './pages/ParentStudents';
import { ParentAnnouncements } from './pages/ParentAnnouncements';
import { Evaluations } from './pages/Evaluations';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { StudentInvoices } from './pages/StudentInvoices';
import { TeacherInvoices } from './pages/TeacherInvoices';
import { Attendance } from './pages/Attendance';
import { Schedule } from './pages/Schedule';
import { Teachers } from './pages/Teachers';
import { Parents } from './pages/Parents';
import { Students } from './pages/Students';
import { Tasks } from './pages/Tasks';
import { Chat } from './pages/Chat';
import { Announcements } from './pages/Announcements';
import { MonthlyClosing } from './pages/MonthlyClosing';
import { Leads } from './pages/Leads';
import { Agenda } from './pages/Agenda';
import { Appointments } from './pages/Appointments';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { Courses } from './pages/public/Courses';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { RefundPolicy } from './pages/public/RefundPolicy';
import ScrollToTop from './components/ScrollToTop';
import { MaintenanceScreen } from './components/MaintenanceScreen';

// Protected Route Component
const ProtectedRoute = ({ children, permission }: { children: React.ReactElement, permission?: string }) => {
  const { isAuthenticated, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'chat_user' && !location.pathname.includes('chat')) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, currentUser, location, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && currentUser) {
    const hasExplicitPermission = currentUser.permissions?.includes('*') || currentUser.permissions?.includes(permission);
    const isParentAccess = currentUser.role === 'parent' && (permission.startsWith('parent_') || permission === 'parent_announcements');
    const isStudentAccess = currentUser.role === 'student' && permission.startsWith('student_');
    const isTeacherDashboard = currentUser.role === 'teacher' && permission === 'dashboard';

    if (!hasExplicitPermission && !isParentAccess && !isStudentAccess && !isTeacherDashboard) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Component to handle initial dashboard redirect
const DashboardRedirect = () => {
  const { currentUser } = useApp();
  if (currentUser?.role === 'parent') return <Navigate to="/parent-dashboard" replace />;
  if (currentUser?.role === 'student') return <Navigate to="/student-dashboard" replace />;
  if (currentUser?.role === 'teacher') return <Navigate to="/admin-dashboard" replace />;
  if (currentUser?.role === 'chat_user') return <Navigate to="/chat" replace />;
  return <Navigate to="/admin-dashboard" replace />;
};

function App() {
  const { isLoading, isSettingsLoading, maintenanceMode, currentUser, isAuthenticated } = useApp();
  const location = useLocation();

  const isInternalPath = location.pathname.startsWith('/admin-dashboard') || 
                         location.pathname.startsWith('/parent-dashboard') ||
                         location.pathname.startsWith('/student-dashboard') ||
                         location.pathname.startsWith('/dashboard') ||
                         ['/students', '/parents', '/teachers', '/finance', '/attendance', '/schedule', '/chat', '/settings', '/announcements', '/reports', '/agenda', '/appointments', '/monthly-closing', '/leads', '/student-invoices', '/teacher-invoices', '/tasks', '/evaluations'].some(p => location.pathname.startsWith(p));

  useEffect(() => {
    if (isInternalPath) {
      document.documentElement.classList.remove('dark');
    } else {
      const saved = localStorage.getItem('public-theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, [location.pathname, isInternalPath]);

  if (isLoading || isSettingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Maintenance Gate: Show screen if mode is active and user is NOT admin
  const isAdmin = isAuthenticated && currentUser?.role === 'admin';
  const isLoginPage = window.location.pathname.startsWith('/login');
  if (maintenanceMode && !isAdmin && !isLoginPage) {
    return <MaintenanceScreen />;
  }

  return (
    <>
      {/* Dark/Light Toggle for All Pages (Testing mode) */}
      <PublicThemeToggle />

      {/* Maintenance Indicator for Admins */}
      {maintenanceMode && isAdmin && (
        <div className="fixed top-0 inset-x-0 z-[9999] bg-amber-600 text-white text-[10px] font-black py-0.5 text-center flex items-center justify-center gap-2 shadow-lg">
          <span className="animate-pulse">⚠️ وضع الصيانة مفعل (يراه الجميع عداك)</span>
          <button
            onClick={() => window.location.href = '/settings'}
            className="underline hover:no-underline"
          >
            انقر هنا للإلغاء
          </button>
        </div>
      )}
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-q8" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms-of-service" element={<RefundPolicy />} />

        {/* Protected App Routes */}
        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route path="admin-dashboard" element={<ProtectedRoute permission="dashboard"><Dashboard /></ProtectedRoute>} />

          {/* Parent Routes */}
          <Route path="parent-dashboard" element={<ProtectedRoute permission="parent_dashboard"><ParentDashboard /></ProtectedRoute>} />
          <Route path="parent-students" element={<ProtectedRoute permission="parent_students"><ParentStudents /></ProtectedRoute>} />
          <Route path="parent-announcements" element={<ProtectedRoute permission="parent_announcements"><ParentAnnouncements /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="student-dashboard" element={<ProtectedRoute permission="student_dashboard"><StudentDashboard /></ProtectedRoute>} />

          {/* Admin/Teacher Routes */}
          <Route path="students" element={<ProtectedRoute permission="students"><Students /></ProtectedRoute>} />
          <Route path="parents" element={<ProtectedRoute permission="parents"><Parents /></ProtectedRoute>} />
          <Route path="evaluations" element={<ProtectedRoute permission="dashboard"><Evaluations /></ProtectedRoute>} />
          <Route path="teachers" element={<ProtectedRoute permission="teachers"><Teachers /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute permission="attendance"><Attendance /></ProtectedRoute>} />
          <Route path="schedule" element={<ProtectedRoute permission="schedule"><Schedule /></ProtectedRoute>} />
          <Route path="agenda" element={<ProtectedRoute permission="schedule"><Agenda /></ProtectedRoute>} />
          <Route path="appointments" element={<ProtectedRoute permission="appointments"><Appointments /></ProtectedRoute>} />
          <Route path="finance" element={<ProtectedRoute permission="finance"><Finance /></ProtectedRoute>} />
          <Route path="monthly-closing" element={<ProtectedRoute permission="finance"><MonthlyClosing /></ProtectedRoute>} />
          <Route path="leads" element={<ProtectedRoute permission="leads"><Leads /></ProtectedRoute>} />
          <Route path="student-invoices" element={<ProtectedRoute permission="student-invoices"><StudentInvoices /></ProtectedRoute>} />
          <Route path="teacher-invoices" element={<ProtectedRoute permission="teacher-invoices"><TeacherInvoices /></ProtectedRoute>} />
          <Route path="tasks" element={<ProtectedRoute permission="tasks"><Tasks /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute permission="chat"><Chat /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute permission="reports"><Reports /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute permission="settings"><Settings /></ProtectedRoute>} />

          {/* New Announcements Admin Route */}
          <Route path="announcements" element={<ProtectedRoute permission="*"><Announcements /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </>
  );
}

export default App;
