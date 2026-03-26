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

  // Create container and toggle elements
  const container = document.createElement('div');
  container.id = 'theme-toggle-container';
  
  const updateBtn = () => {
    // Injecting the raw HTML structure for the switch
    container.innerHTML = `
      <div style="
        position: relative;
        width: 100px;
        height: 44px;
        border-radius: 40px;
        background: ${isDark ? '#212436' : '#e2e8f0'};
        box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
        border: 2px solid transparent;
        background-image: linear-gradient(${isDark ? '#212436,#212436' : '#e2e8f0,#e2e8f0'}), linear-gradient(90deg, #9333ea, #06b6d4);
        background-origin: border-box;
        background-clip: padding-box, border-box;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0 4px;
        transition: all 0.3s ease;
      ">
        <span style="
          position: absolute;
          ${isDark ? 'left: 14px;' : 'right: 14px;'}
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
          color: ${isDark ? '#3b4369' : '#94a3b8'};
          transition: all 0.3s ease;
        ">${isDark ? 'ON' : 'OFF'}</span>
        
        <div style="
          position: absolute;
          left: ${isDark ? '54px' : '4px'};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${isDark ? '#282b3d' : '#ffffff'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          border: 2px solid transparent;
          background-image: linear-gradient(${isDark ? '#282b3d,#282b3d' : '#ffffff,#ffffff'}), linear-gradient(135deg, #3b82f6, #8b5cf6);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        ">
          ${isDark ? '🌙' : '☀️'}
        </div>
      </div>
    `;

    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999999;
      display: ${isInternal() ? 'none' : 'block'};
      transition: transform 0.2s ease;
    `;
  };

  updateBtn();

  container.addEventListener('click', () => {
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

  container.addEventListener('mouseenter', () => { container.style.transform = 'scale(1.05)'; });
  container.addEventListener('mouseleave', () => { container.style.transform = 'scale(1)'; });

  document.body.appendChild(container);

  // Hide on internal pages, show on public pages
  // Watch for URL changes (SPA navigation)
  let lastPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      container.style.display = isInternal() ? 'none' : 'block';
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
