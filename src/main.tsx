import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import './index.css'
import './styles/tokens/index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { AppProvider } from './context/AppContext.tsx'
// ChatProvider has been removed and replaced by Zustand

import { HelmetProvider } from 'react-helmet-async'

import { PersistQueryClientProvider, type Persister } from '@tanstack/react-query-persist-client'
import { get, set, del } from 'idb-keyval'

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

// Custom async persister using IndexedDB
const persister: Persister = {
  persistClient: async (client) => {
    await set('react-query-cache', client)
  },
  restoreClient: async () => {
    return await get('react-query-cache')
  },
  removeClient: async () => {
    await del('react-query-cache')
  },
}

// Stale-bundle guard: after a new deploy, old chunks referenced by the loaded
// page no longer exist. Vite emits this event on preload failure — reload once
// to fetch the fresh index.html instead of crashing.
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault()
  const key = 'dareen_chunk_reload_at'
  const last = Number(sessionStorage.getItem(key) || 0)
  if (Date.now() - last > 10000) {
    sessionStorage.setItem(key, String(Date.now()))
    window.location.reload()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }} // Keep persister at 24h for offline
      >
        <HelmetProvider>
          <Router>
            <AppProvider>
              <App />
            </AppProvider>
          </Router>
        </HelmetProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// Apply initial theme from localStorage to prevent flash
const savedTheme = localStorage.getItem('theme') || localStorage.getItem('public-theme') || 'light'
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

// Global variable to catch PWA install prompt (stored for InstallPWA component)
;(window as unknown as { deferredPrompt: Event | null }).deferredPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
  ;(window as unknown as { deferredPrompt: Event | null }).deferredPrompt = e
})

// Register Service Worker for notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                window.location.reload()
              }
            })
          }
        })
      })
      .catch((err) => {
        console.error('SW registration failed: ', err)
      })
  })
}
