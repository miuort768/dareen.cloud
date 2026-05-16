import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PageLoader } from './components/ui/PageLoader';

import { Layout } from './components/layout/Layout';
import { useApp } from './context/AppContext';
import { InstallPWA } from './components/ui/InstallPWA';

// Lazy load pages for high performance
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Home = lazy(() => import('./pages/public/Home').then(m => ({ default: m.Home })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Settings = lazy(() => import('./pages/Settings'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard').then(m => ({ default: m.ParentDashboard })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const ParentStudents = lazy(() => import('./pages/ParentStudents').then(m => ({ default: m.ParentStudents })));
const ParentAnnouncements = lazy(() => import('./pages/ParentAnnouncements').then(m => ({ default: m.ParentAnnouncements })));
const Evaluations = lazy(() => import('./pages/Evaluations').then(m => ({ default: m.Evaluations })));
const Finance = lazy(() => import('./pages/Finance').then(m => ({ default: m.Finance })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const StudentInvoices = lazy(() => import('./pages/StudentInvoices').then(m => ({ default: m.StudentInvoices })));
const TeacherInvoices = lazy(() => import('./pages/TeacherInvoices').then(m => ({ default: m.TeacherInvoices })));
const Attendance = lazy(() => import('./pages/Attendance').then(m => ({ default: m.Attendance })));
const Schedule = lazy(() => import('./pages/Schedule').then(m => ({ default: m.Schedule })));
const Teachers = lazy(() => import('./pages/Teachers').then(m => ({ default: m.Teachers })));
const Parents = lazy(() => import('./pages/Parents').then(m => ({ default: m.Parents })));
const Students = lazy(() => import('./pages/Students').then(m => ({ default: m.Students })));
const Tasks = lazy(() => import('./pages/Tasks').then(m => ({ default: m.Tasks })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Announcements = lazy(() => import('./pages/Announcements').then(m => ({ default: m.Announcements })));
const Forum = lazy(() => import('./pages/Forum').then(m => ({ default: m.Forum })));
const MonthlyClosing = lazy(() => import('./pages/MonthlyClosing').then(m => ({ default: m.MonthlyClosing })));
const Leads = lazy(() => import('./pages/Leads').then(m => ({ default: m.Leads })));
const Agenda = lazy(() => import('./pages/Agenda').then(m => ({ default: m.Agenda })));
const Appointments = lazy(() => import('./pages/Appointments').then(m => ({ default: m.Appointments })));
const About = lazy(() => import('./pages/public/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/public/Contact').then(m => ({ default: m.Contact })));
const Courses = lazy(() => import('./pages/public/Courses').then(m => ({ default: m.Courses })));
const Blog = lazy(() => import('./pages/public/Blog').then(m => ({ default: m.Blog })));
const BlogPost = lazy(() => import('./pages/public/BlogPost').then(m => ({ default: m.BlogPost })));
const PrivacyPolicy = lazy(() => import('./pages/public/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const RefundPolicy = lazy(() => import('./pages/public/RefundPolicy').then(m => ({ default: m.RefundPolicy })));
const AdminBlog = lazy(() => import('./pages/AdminBlog').then(m => ({ default: m.AdminBlog })));
import ScrollToTop from './components/ScrollToTop';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { FloatingActions } from './components/public/FloatingActions';
const Classroom = lazy(() => import('./pages/Classroom').then(m => ({ default: m.Classroom })));




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
    const isStudentAccess = currentUser.role === 'student' && (permission.startsWith('student_') || permission === 'parent_announcements');
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
  if (currentUser?.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
  if (currentUser?.role === 'chat_user') return <Navigate to="/chat" replace />;
  return <Navigate to="/admin-dashboard" replace />;
};


function App() {
  const { isLoading, isSettingsLoading, maintenanceMode, currentUser, isAuthenticated } = useApp();
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('theme') || localStorage.getItem('public-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, [location.pathname]);

  if (isLoading || isSettingsLoading) {
    return <PageLoader />;
  }


  // Maintenance Gate: Show screen if mode is active and user is NOT admin
  const isAdmin = isAuthenticated && currentUser?.role === 'admin';
  const isLoginPage = window.location.pathname.startsWith('/login');
  if (maintenanceMode && !isAdmin && !isLoginPage) {
    return <MaintenanceScreen />;
  }

  return (
    <>



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
      {location.pathname === '/' && <InstallPWA />}
      {/* Public Facing Actions - Only show on specific public pages */}


      {['/', '/courses', '/about', '/contact', '/books'].includes(location.pathname) || location.pathname.startsWith('/books/') ? (
        <FloatingActions />
      ) : null}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/books" element={<Blog />} />
          <Route path="/books/:slug" element={<BlogPost />} />
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
            <Route path="teacher-dashboard" element={<ProtectedRoute permission="dashboard"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="parent-dashboard" element={<ProtectedRoute permission="parent_dashboard"><ParentDashboard /></ProtectedRoute>} />
            <Route path="student-dashboard" element={<ProtectedRoute permission="student_dashboard"><StudentDashboard /></ProtectedRoute>} />
            <Route path="parent-students" element={<ProtectedRoute permission="parent_students"><ParentStudents /></ProtectedRoute>} />
            <Route path="parent-announcements" element={<ProtectedRoute permission="parent_announcements"><ParentAnnouncements /></ProtectedRoute>} />
            <Route path="teachers" element={<ProtectedRoute permission="teachers"><Teachers /></ProtectedRoute>} />
            <Route path="students" element={<ProtectedRoute permission="students"><Students /></ProtectedRoute>} />
            <Route path="evaluations" element={<ProtectedRoute permission="dashboard"><Evaluations /></ProtectedRoute>} />
            <Route path="parents" element={<ProtectedRoute permission="parents"><Parents /></ProtectedRoute>} />
            <Route path="monthly-closing" element={<ProtectedRoute permission="monthly_closing"><MonthlyClosing /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute permission="attendance"><Attendance /></ProtectedRoute>} />
            <Route path="schedule" element={<ProtectedRoute permission="schedule"><Schedule /></ProtectedRoute>} />
            <Route path="agenda" element={<ProtectedRoute permission="schedule"><Agenda /></ProtectedRoute>} />
            <Route path="appointments" element={<ProtectedRoute permission="appointments"><Appointments /></ProtectedRoute>} />
            <Route path="finance" element={<ProtectedRoute permission="finance"><Finance /></ProtectedRoute>} />
            <Route path="leads" element={<ProtectedRoute permission="leads"><Leads /></ProtectedRoute>} />
            <Route path="student-invoices" element={<ProtectedRoute permission="student-invoices"><StudentInvoices /></ProtectedRoute>} />
            <Route path="teacher-invoices" element={<ProtectedRoute permission="teacher-invoices"><TeacherInvoices /></ProtectedRoute>} />
            <Route path="tasks" element={<ProtectedRoute permission="tasks"><Tasks /></ProtectedRoute>} />
            <Route path="chat" element={<ProtectedRoute permission="chat"><Chat /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute permission="reports"><Reports /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute permission="settings"><Settings /></ProtectedRoute>} />

            {/* New Announcements Admin Route */}
            <Route path="announcements" element={<ProtectedRoute permission="*"><Announcements /></ProtectedRoute>} />

            <Route path="forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            
            {/* Admin Blog Management */}
            <Route path="admin/blog" element={<ProtectedRoute permission="admin"><AdminBlog /></ProtectedRoute>} />
          </Route>

          <Route path="/classroom/:id" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
