import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { PageLoader } from './components/ui/PageLoader'

import { Layout } from './components/layout/Layout'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  useCurrentUser,
  useIsAuthenticated,
  useIsLoading,
  useIsSettingsLoading,
  useMaintenanceMode,
} from './context/AppContext'
import { InstallPWA } from './components/ui/InstallPWA'
import { confirm } from './lib/confirmDialog'
const RouteErrorBoundary = lazy(() =>
  import('./components/RouteErrorBoundary').then((m) => ({ default: m.RouteErrorBoundary })),
)

// Lazy load pages for high performance
const Chat = lazy(() => import('./pages/Chat').then((m) => ({ default: m.Chat })))
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })))
const SocketInitLayer = lazy(() =>
  import('./components/ui/SocketInitLayer').then((m) => ({ default: m.SocketInitLayer })),
)
const Home = lazy(() => import('./pages/public/Home').then((m) => ({ default: m.Home })))
const NotFound = lazy(() =>
  import('./pages/public/NotFound').then((m) => ({ default: m.NotFound })),
)
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const ParentDashboard = lazy(() =>
  import('./pages/ParentDashboard').then((m) => ({ default: m.ParentDashboard })),
)
const StudentDashboard = lazy(() =>
  import('./pages/StudentDashboard').then((m) => ({ default: m.StudentDashboard })),
)
const TeacherDashboard = lazy(() =>
  import('./pages/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })),
)
const ParentStudents = lazy(() =>
  import('./pages/ParentStudents').then((m) => ({ default: m.ParentStudents })),
)
const ParentAnnouncements = lazy(() =>
  import('./pages/ParentAnnouncements').then((m) => ({ default: m.ParentAnnouncements })),
)
const Evaluations = lazy(() =>
  import('./pages/Evaluations').then((m) => ({ default: m.Evaluations })),
)
const Finance = lazy(() => import('./pages/Finance').then((m) => ({ default: m.Finance })))
const Reports = lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })))
const StudentInvoices = lazy(() =>
  import('./pages/StudentInvoices').then((m) => ({ default: m.StudentInvoices })),
)
const TeacherInvoices = lazy(() =>
  import('./pages/TeacherInvoices').then((m) => ({ default: m.TeacherInvoices })),
)
const Attendance = lazy(() => import('./pages/Attendance').then((m) => ({ default: m.Attendance })))
const Schedule = lazy(() => import('./pages/Schedule').then((m) => ({ default: m.Schedule })))
const Teachers = lazy(() => import('./pages/Teachers').then((m) => ({ default: m.Teachers })))
const Parents = lazy(() => import('./pages/Parents').then((m) => ({ default: m.Parents })))
const Students = lazy(() => import('./pages/Students').then((m) => ({ default: m.Students })))
const Tasks = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.Tasks })))

const Announcements = lazy(() =>
  import('./pages/Announcements').then((m) => ({ default: m.Announcements })),
)
const Forum = lazy(() => import('./pages/Forum').then((m) => ({ default: m.Forum })))
const MonthlyClosing = lazy(() =>
  import('./pages/MonthlyClosing').then((m) => ({ default: m.MonthlyClosing })),
)
const Leads = lazy(() => import('./pages/Leads').then((m) => ({ default: m.Leads })))
const TrialSessions = lazy(() =>
  import('./pages/TrialSessions').then((m) => ({ default: m.TrialSessions })),
)
const Agenda = lazy(() => import('./pages/Agenda').then((m) => ({ default: m.Agenda })))
const Appointments = lazy(() =>
  import('./pages/Appointments').then((m) => ({ default: m.Appointments })),
)
const About = lazy(() => import('./pages/public/About').then((m) => ({ default: m.About })))
const Contact = lazy(() => import('./pages/public/Contact').then((m) => ({ default: m.Contact })))
const Courses = lazy(() => import('./pages/public/Courses').then((m) => ({ default: m.Courses })))
const Blog = lazy(() => import('./pages/public/Blog').then((m) => ({ default: m.Blog })))
const BlogPost = lazy(() =>
  import('./pages/public/BlogPost').then((m) => ({ default: m.BlogPost })),
)
const PrivacyPolicy = lazy(() =>
  import('./pages/public/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })),
)
const RefundPolicy = lazy(() =>
  import('./pages/public/RefundPolicy').then((m) => ({ default: m.RefundPolicy })),
)
const TermsOfService = lazy(() =>
  import('./pages/public/TermsOfService').then((m) => ({ default: m.TermsOfService })),
)
const TermsOfWork = lazy(() =>
  import('./pages/public/TermsOfWork').then((m) => ({ default: m.TermsOfWork })),
)
const AdminBlog = lazy(() => import('./pages/AdminBlog').then((m) => ({ default: m.AdminBlog })))
const RolesPage = lazy(() =>
  import('./features/roles/pages/RolesPage').then((m) => ({ default: m.RolesPage })),
)
const MonitoringPage = lazy(() =>
  import('./features/monitoring/pages/MonitoringPage').then((m) => ({ default: m.MonitoringPage })),
)
import ScrollToTop from './components/ScrollToTop'
const MaintenanceScreen = lazy(() =>
  import('./components/MaintenanceScreen').then((m) => ({ default: m.MaintenanceScreen })),
)
const FloatingActions = lazy(() =>
  import('./components/public/FloatingActions').then((m) => ({ default: m.FloatingActions })),
)
const Jobs = lazy(() => import('./pages/Jobs').then((m) => ({ default: m.Jobs })))
const AAbdullah = lazy(() => import('./pages/AAbdullah').then((m) => ({ default: m.AAbdullah })))
const AdminJobs = lazy(() => import('./pages/AdminJobs').then((m) => ({ default: m.AdminJobs })))
const AdminContacts = lazy(() =>
  import('./pages/AdminContacts').then((m) => ({ default: m.AdminContacts })),
)
const AdminBlogCustomers = lazy(() =>
  import('./pages/AdminBlogCustomers').then((m) => ({ default: m.AdminBlogCustomers })),
)
const DesignSystemPage = lazy(() =>
  import('./features/design-system/DesignSystemPage').then((m) => ({
    default: m.DesignSystemPage,
  })),
)
const StudentProfilePage = lazy(() =>
  import('./pages/profile/StudentProfilePage').then((m) => ({ default: m.StudentProfilePage })),
)
const TeacherProfilePage = lazy(() =>
  import('./pages/profile/TeacherProfilePage').then((m) => ({ default: m.TeacherProfilePage })),
)
const ParentProfilePage = lazy(() =>
  import('./pages/profile/ParentProfilePage').then((m) => ({ default: m.ParentProfilePage })),
)
const TeacherPaymentHistory = lazy(() =>
  import('./pages/TeacherPaymentHistory').then((m) => ({ default: m.TeacherPaymentHistory })),
)
const ParentPaymentHistory = lazy(() =>
  import('./pages/ParentPaymentHistory').then((m) => ({ default: m.ParentPaymentHistory })),
)

// Protected Route Component
const ProtectedRoute = ({
  children,
  permission,
}: {
  children: React.ReactElement
  permission?: string
}) => {
  const isAuthenticated = useIsAuthenticated()
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (
      isAuthenticated &&
      currentUser?.role === 'chat_user' &&
      !location.pathname.includes('chat')
    ) {
      navigate('/chat', { replace: true })
    }
  }, [isAuthenticated, currentUser, location, navigate])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (permission && currentUser) {
    const isAdmin = currentUser.role === 'admin'
    const hasExplicitPermission =
      isAdmin ||
      currentUser.permissions?.includes('*') ||
      currentUser.permissions?.includes(permission)

    const isCommonAccess = [
      'schedule',
      'announcements',
      'parent_announcements',
      'appointments',
      'forum',
    ].includes(permission)

    const isParentAccess =
      currentUser.role === 'parent' && (permission.startsWith('parent_') || isCommonAccess)

    const isStudentAccess = currentUser.role === 'student' && permission === 'student_dashboard'

    const isTeacherAccess =
      currentUser.role === 'teacher' &&
      [
        'dashboard',
        'evaluations',
        'schedule',
        'attendance',
        'announcements',
        'appointments',
        'forum',
      ].includes(permission)

    if (!hasExplicitPermission && !isParentAccess && !isStudentAccess && !isTeacherAccess) {
      return <Navigate to="/" replace />
    }
  }

  return children
}

// Component to handle initial dashboard redirect
const DashboardRedirect = () => {
  const currentUser = useCurrentUser()
  if (currentUser?.role === 'parent') return <Navigate to="/parent-dashboard" replace />
  if (currentUser?.role === 'student') return <Navigate to="/student-dashboard" replace />
  if (currentUser?.role === 'teacher') return <Navigate to="/teacher-dashboard" replace />
  if (currentUser?.role === 'chat_user') return <Navigate to="/chat" replace />
  return <Navigate to="/admin-dashboard" replace />
}

function App() {
  const isLoading = useIsLoading()
  const isSettingsLoading = useIsSettingsLoading()
  const maintenanceMode = useMaintenanceMode()
  const currentUser = useCurrentUser()
  const isAuthenticated = useIsAuthenticated()
  const location = useLocation()
  const navigate = useNavigate()
  const [loadTimeout, setLoadTimeout] = useState(false)

  // Safety timeout: if loading takes > 30s, show a retry screen
  useEffect(() => {
    if (isLoading || isSettingsLoading) {
      const t = setTimeout(() => setLoadTimeout(true), 12000)
      return () => clearTimeout(t)
    }
    setLoadTimeout(false)
  }, [isLoading, isSettingsLoading])

  if (isLoading || isSettingsLoading) {
    if (loadTimeout) {
      return (
        <div
          className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background to-primary p-6"
          dir="rtl"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-white p-8 text-center shadow-2xl dark:bg-surface">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-light dark:bg-warning-soft">
              <Loader2 size={28} className="animate-spin text-warning" />
            </div>
            <h2 className="text-xl font-bold text-main">يستغرق التحميل وقتاً أطول من المعتاد</h2>
            <p className="text-sm text-muted">
              قد يكون الاتصال بالسيرفر بطيئاً. حاول مرة أخرى أو تواصل مع الدعم الفني.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-colors hover:bg-primary-hover"
              >
                إعادة التحميل
              </button>
              <button
                onClick={async () => {
                  if (
                    await confirm({
                      title: 'مسح التخزين',
                      description: 'هل أنت متأكد من مسح جميع البيانات المخزنة؟',
                      confirmText: 'مسح',
                      cancelText: 'إلغاء',
                    })
                  ) {
                    ;[
                      'auth_token',
                      'app_current_user',
                      'app_isAuthenticated',
                      'theme',
                      'public-theme',
                    ].forEach((k) => {
                      try {
                        localStorage.removeItem(k)
                      } catch (e) {
                        console.warn(e)
                      }
                    })
                    window.location.reload()
                  }
                }}
                className="rounded-xl bg-error px-6 py-2.5 text-sm font-bold text-on-error shadow-lg transition-colors hover:bg-error hover:text-on-error"
              >
                مسح التخزين وإعادة التحميل
              </button>
            </div>
          </div>
        </div>
      )
    }
    return <PageLoader />
  }

  // Maintenance Gate: Show screen if mode is active and user is NOT admin
  const isAdmin = isAuthenticated && currentUser?.role === 'admin'
  const isLoginPage = location.pathname.startsWith('/login')
  if (maintenanceMode && !isAdmin && !isLoginPage) {
    return (
      <Suspense fallback={<PageLoader />}>
        <MaintenanceScreen />
      </Suspense>
    )
  }

  return (
    <>
      {/* Maintenance Indicator for Admins */}
      {maintenanceMode && isAdmin && (
        <div className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center gap-2 bg-warning py-0.5 text-center text-micro font-semibold text-on-warning shadow-lg">
          <span className="flex animate-pulse items-center gap-1">
            <AlertTriangle size={14} /> وضع الصيانة مفعل (يراه الجميع عداك)
          </span>
          <button onClick={() => navigate('/settings')} className="underline hover:no-underline">
            انقر هنا للإلغاء
          </button>
        </div>
      )}
      <ScrollToTop />
      {[
        '/',
        '/courses',
        '/about',
        '/contact',
        '/books',
        '/privacy-policy',
        '/refund-policy',
        '/terms-of-service',
        '/terms-of-work',
        '/jobs',
        '/a.abdullah',
      ].includes(location.pathname) && <InstallPWA />}
      {/* Public Facing Actions - Only show on specific public pages */}

      {['/', '/courses', '/about', '/contact', '/books'].includes(location.pathname) ? (
        <Suspense fallback={null}>
          <FloatingActions />
        </Suspense>
      ) : null}
      <Suspense fallback={null}>
        <SocketInitLayer />
      </Suspense>
      <Suspense fallback={<PageLoader />}>
        <main id="main-content">
          <Routes>
            <Route errorElement={<RouteErrorBoundary />}>
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
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/terms-of-work" element={<TermsOfWork />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/a.abdullah" element={<AAbdullah />} />

              {/* Design System Playground — Dev Only */}
              {import.meta.env.DEV && (
                <Route path="/design-system" element={<DesignSystemPage />} />
              )}

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardRedirect />} />
                <Route
                  path="admin-dashboard"
                  element={
                    <ProtectedRoute permission="dashboard">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher-dashboard"
                  element={
                    <ProtectedRoute permission="dashboard">
                      <TeacherDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="parent-dashboard"
                  element={
                    <ProtectedRoute permission="parent_dashboard">
                      <ParentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student-dashboard"
                  element={
                    <ProtectedRoute permission="student_dashboard">
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="parent-students"
                  element={
                    <ProtectedRoute permission="parent_students">
                      <ParentStudents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="parent-announcements"
                  element={
                    <ProtectedRoute permission="parent_announcements">
                      <ParentAnnouncements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teachers"
                  element={
                    <ProtectedRoute permission="teachers">
                      <Teachers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="students"
                  element={
                    <ProtectedRoute permission="students">
                      <Students />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="evaluations"
                  element={
                    <ProtectedRoute permission="evaluations">
                      <Evaluations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="parents"
                  element={
                    <ProtectedRoute permission="parents">
                      <Parents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="monthly-closing"
                  element={
                    <ProtectedRoute permission="monthly_closing">
                      <MonthlyClosing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="attendance"
                  element={
                    <ProtectedRoute permission="attendance">
                      <Attendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="schedule"
                  element={
                    <ProtectedRoute permission="schedule">
                      <Schedule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="agenda"
                  element={
                    <ProtectedRoute permission="schedule">
                      <Agenda />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="appointments"
                  element={
                    <ProtectedRoute permission="appointments">
                      <Appointments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="finance"
                  element={
                    <ProtectedRoute permission="finance">
                      <Finance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="leads"
                  element={
                    <ProtectedRoute permission="leads">
                      <Leads />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="trial-sessions"
                  element={
                    <ProtectedRoute permission="trial_sessions">
                      <TrialSessions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="student-invoices"
                  element={
                    <ProtectedRoute permission="student_invoices">
                      <StudentInvoices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher-invoices"
                  element={
                    <ProtectedRoute permission="teacher_invoices">
                      <TeacherInvoices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tasks"
                  element={
                    <ProtectedRoute permission="tasks">
                      <Tasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="chat"
                  element={
                    <ProtectedRoute permission="chat">
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute permission="reports">
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute permission="settings">
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* New Announcements Admin Route */}
                <Route
                  path="announcements"
                  element={
                    <ProtectedRoute permission="announcements">
                      <Announcements />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="forum"
                  element={
                    <ProtectedRoute>
                      <Forum />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin-jobs"
                  element={
                    <ProtectedRoute permission="admin">
                      <AdminJobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin-contacts"
                  element={
                    <ProtectedRoute permission="admin">
                      <AdminContacts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="roles"
                  element={
                    <ProtectedRoute permission="admin">
                      <RolesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="monitoring"
                  element={
                    <ProtectedRoute permission="admin">
                      <MonitoringPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="student-profile"
                  element={
                    <ProtectedRoute permission="student_dashboard">
                      <StudentProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher-profile"
                  element={
                    <ProtectedRoute permission="dashboard">
                      <TeacherProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="parent-profile"
                  element={
                    <ProtectedRoute permission="parent_dashboard">
                      <ParentProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teacher-payment-history"
                  element={
                    <ProtectedRoute permission="admin">
                      <TeacherPaymentHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="parent-payment-history"
                  element={
                    <ProtectedRoute permission="parent_dashboard">
                      <ParentPaymentHistory />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Blog Management */}
                <Route
                  path="admin/blog"
                  element={
                    <ProtectedRoute permission="admin">
                      <AdminBlog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/blog-customers"
                  element={
                    <ProtectedRoute permission="admin">
                      <AdminBlogCustomers />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
    </>
  )
}

export default App
