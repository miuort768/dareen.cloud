import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useApp } from './context/AppContext';
import { Login } from './pages/Login';
import { Home } from './pages/public/Home';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { ParentDashboard } from './pages/ParentDashboard';
import { ParentStudents } from './pages/ParentStudents';
import { ParentAnnouncements } from './pages/ParentAnnouncements';
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
import { Agenda } from './pages/Agenda';
import { Appointments } from './pages/Appointments';
import { About } from './pages/public/About';
import { Courses } from './pages/public/Courses';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { TermsOfService } from './pages/public/TermsOfService';
import { InstallPWA } from './components/InstallPWA';

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
    const isTeacherDashboard = currentUser.role === 'teacher' && permission === 'dashboard';

    if (!hasExplicitPermission && !isParentAccess && !isTeacherDashboard) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Component to handle initial dashboard redirect
const DashboardRedirect = () => {
  const { currentUser } = useApp();
  if (currentUser?.role === 'parent') return <Navigate to="/parent-dashboard" replace />;
  if (currentUser?.role === 'teacher') return <Navigate to="/attendance" replace />;
  if (currentUser?.role === 'chat_user') return <Navigate to="/chat" replace />;
  return <Navigate to="/admin-dashboard" replace />;
};

function App() {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

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

          {/* Admin/Teacher Routes */}
          <Route path="students" element={<ProtectedRoute permission="students"><Students /></ProtectedRoute>} />
          <Route path="parents" element={<ProtectedRoute permission="parents"><Parents /></ProtectedRoute>} />
          <Route path="teachers" element={<ProtectedRoute permission="teachers"><Teachers /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute permission="attendance"><Attendance /></ProtectedRoute>} />
          <Route path="schedule" element={<ProtectedRoute permission="schedule"><Schedule /></ProtectedRoute>} />
          <Route path="agenda" element={<ProtectedRoute permission="schedule"><Agenda /></ProtectedRoute>} />
          <Route path="appointments" element={<ProtectedRoute permission="appointments"><Appointments /></ProtectedRoute>} />
          <Route path="finance" element={<ProtectedRoute permission="finance"><Finance /></ProtectedRoute>} />
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

      {/* Global PWA Install Trigger */}
      <InstallPWA />
    </>
  );
}

export default App;
