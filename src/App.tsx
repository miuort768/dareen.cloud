import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppProvider, useApp } from './context/AppContext';
import { Loader2 } from 'lucide-react';

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && currentUser?.permissions) {
    const hasPermission = currentUser.permissions.includes('*') || currentUser.permissions.includes(permission);
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function AppContent() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
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
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}

export default App;
