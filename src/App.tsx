import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppProvider, useApp } from './context/AppContext';
import { ChatProvider } from './context/ChatContext';
import { Loader2 } from 'lucide-react';
import { InstallPWA } from './components/InstallPWA';

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Students = lazy(() => import('./pages/Students').then(m => ({ default: m.Students })));
const Finance = lazy(() => import('./pages/Finance').then(m => ({ default: m.Finance })));
const Attendance = lazy(() => import('./pages/Attendance').then(m => ({ default: m.Attendance })));
const Schedule = lazy(() => import('./pages/Schedule').then(m => ({ default: m.Schedule })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Teachers = lazy(() => import('./pages/Teachers').then(m => ({ default: m.Teachers })));
const Parents = lazy(() => import('./pages/Parents').then(m => ({ default: m.Parents })));
const Appointments = lazy(() => import('./pages/Appointments').then(m => ({ default: m.Appointments })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const TeacherInvoices = lazy(() => import('./pages/TeacherInvoices').then(m => ({ default: m.TeacherInvoices })));
const StudentInvoices = lazy(() => import('./pages/StudentInvoices').then(m => ({ default: m.StudentInvoices })));
const Tasks = lazy(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const ParentStudents = lazy(() => import('./pages/ParentStudents').then(m => ({ default: m.ParentStudents })));
const ParentAttendance = lazy(() => import('./pages/ParentAttendance').then(m => ({ default: m.ParentAttendance })));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/public/TermsOfService').then(m => ({ default: m.TermsOfService })));


// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400 font-bold">جاري التحميل...</p>
    </div>
  </div>
);

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
    const isParentAccess = currentUser.role === 'parent' && permission.startsWith('parent_');

    if (!hasExplicitPermission && !isParentAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Public Pages
const Home = lazy(() => import('./pages/public/Home').then(m => ({ default: m.Home })));
const About = lazy(() => import('./pages/public/About').then(m => ({ default: m.About })));
const Courses = lazy(() => import('./pages/public/Courses').then(m => ({ default: m.Courses })));

// Specialized component to handle dashboard redirect after login
const DashboardRedirect = () => {
  const { currentUser } = useApp();
  if (currentUser?.role === 'chat_user') {
    return <Navigate to="/chat" replace />;
  }
  if (currentUser?.role === 'parent') {
    return <Navigate to="/parent-dashboard" replace />;
  }
  return <Dashboard />;
};

function AppContent() {
  return (
    <Suspense fallback={<PageLoader />}>
      <InstallPWA />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard/App Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<DashboardRedirect />} />
          <Route path="parent-dashboard" element={<ProtectedRoute permission="parent_dashboard"><ParentDashboard /></ProtectedRoute>} />
          <Route path="parent-students" element={<ProtectedRoute permission="parent_students"><ParentStudents /></ProtectedRoute>} />
          <Route path="parent-attendance" element={<ProtectedRoute permission="parent_attendance"><ParentAttendance /></ProtectedRoute>} />
          <Route path="students" element={<ProtectedRoute permission="students"><Students /></ProtectedRoute>} />
          <Route path="finance" element={<ProtectedRoute permission="finance"><Finance /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute permission="reports"><Reports /></ProtectedRoute>} />
          <Route path="student-invoices" element={<ProtectedRoute permission="student-invoices"><StudentInvoices /></ProtectedRoute>} />
          <Route path="teacher-invoices" element={<ProtectedRoute permission="teacher-invoices"><TeacherInvoices /></ProtectedRoute>} />
          <Route path="attendance" element={<ProtectedRoute permission="attendance"><Attendance /></ProtectedRoute>} />
          <Route path="schedule" element={<ProtectedRoute permission="schedule"><Schedule /></ProtectedRoute>} />
          <Route path="teachers" element={<ProtectedRoute permission="teachers"><Teachers /></ProtectedRoute>} />
          <Route path="parents" element={<ProtectedRoute permission="parents"><Parents /></ProtectedRoute>} />
          <Route path="appointments" element={<ProtectedRoute permission="appointments"><Appointments /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute permission="settings"><Settings /></ProtectedRoute>} />
          <Route path="tasks" element={<ProtectedRoute permission="tasks"><Tasks /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        </Route>

        {/* Catch all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AppProvider>
      <ChatProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ChatProvider>
    </AppProvider>
  );
}

export default App;
