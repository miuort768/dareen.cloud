import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { AppProvider } from './context/AppContext.tsx'
import { ChatProvider } from './context/ChatContext.tsx'

import { HelmetProvider } from 'react-helmet-async'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Router>
            <AppProvider>
              <ChatProvider>
                <App />
              </ChatProvider>
            </AppProvider>
          </Router>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// ===== Standalone Theme Toggle (independent of React tree) =====
function mountThemeToggle() {
  // Check if internal dashboard page
  const internalPaths = ['/admin-dashboard', '/parent-dashboard', '/student-dashboard', '/dashboard',
    '/students', '/parents', '/teachers', '/finance', '/attendance', '/schedule',
    '/chat', '/settings', '/announcements', '/reports', '/agenda', '/appointments',
    '/monthly-closing', '/leads', '/student-invoices', '/teacher-invoices', '/tasks', '/evaluations'];

  const isInternal = () => internalPaths.some(p => window.location.pathname.startsWith(p));

  // Get saved theme
  const saved = localStorage.getItem('public-theme');
  let isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Apply initial theme
  if (isDark) document.documentElement.classList.add('dark');

  // Create button element
  const btn = document.createElement('button');
  btn.id = 'theme-toggle-btn';
  btn.title = isDark ? 'الوضع النهاري' : 'الوضع الليلي';

  const updateBtn = () => {
    btn.innerHTML = isDark ? '🌙' : '☀️';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      width: 54px;
      height: 54px;
      border-radius: 14px;
      border: 2px solid ${isDark ? 'rgba(99,102,241,0.4)' : 'rgba(0,0,0,0.1)'};
      cursor: pointer;
      font-size: 22px;
      line-height: 1;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      background: ${isDark ? 'linear-gradient(135deg,#1e293b,#0f172a)' : 'linear-gradient(135deg,#ffffff,#f1f5f9)'};
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: ${isInternal() ? 'none' : 'flex'};
      align-items: center;
      justify-content: center;
    `;
  };

  updateBtn();

  btn.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('public-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('public-theme', 'light');
    }
    updateBtn();
  });

  btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.1)'; });
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; });

  document.body.appendChild(btn);

  // Hide on internal pages, show on public pages
  // Watch for URL changes (SPA navigation)
  let lastPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      btn.style.display = isInternal() ? 'none' : 'flex';
    }
  }, 200);
}

mountThemeToggle();

// Register Service Worker for notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('SW registration failed: ', err);
    });
  });
}
