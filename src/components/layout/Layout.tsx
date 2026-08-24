import React, { useRef, Suspense } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useCurrentUser, useSidebarCollapsed } from '../../context/AppContext'
import { cn } from '../../lib/utils'
import { PageLoader } from '../ui/PageLoader'
import { ErrorBoundary } from '../ErrorBoundary'
import { triggerHaptic } from '../../lib/haptics'
import { AppTabBar } from '../../shared/components/mobile'

export const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const sidebarCollapsed = useSidebarCollapsed()
  const isChatOnly = currentUser?.role === 'chat_user'
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Swipe-back gesture
  const touchStartX = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (location.pathname !== '/') {
      touchStartX.current = e.touches[0]?.clientX ?? 0
    }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const endTouch = e.changedTouches[0]
    if (!endTouch) return
    const diff = endTouch.clientX - touchStartX.current
    if (diff > 80 && location.pathname !== '/') {
      triggerHaptic('light')
      navigate(-1)
    }
    touchStartX.current = 0
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex min-h-screen bg-background font-sans text-main transition-colors duration-300"
      dir="rtl"
    >
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {!isChatOnly && (
        <div
          className={cn(
            'hidden shrink-0 transition-all duration-300 lg:block',
            isChatOnly ? 'w-0' : sidebarCollapsed ? 'w-16' : 'w-56',
          )}
        >
          <div
            className={cn(
              'transition-all duration-300',
              isChatOnly ? 'w-0' : sidebarCollapsed ? 'w-16' : 'w-56',
            )}
          />
        </div>
      )}
      {!isChatOnly && (
        <Sidebar mobileMenuOpen={mobileMenuOpen} onSetMobileMenuOpen={setMobileMenuOpen} />
      )}

      <div className="flex min-w-0 max-w-full flex-1 flex-col transition-all duration-300">
        {!isChatOnly && !location.pathname.includes('/chat') && <Header />}

        <main
          className={cn(
            'custom-scrollbar relative w-full min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden',
            isChatOnly || location.pathname.includes('/chat')
              ? 'p-0'
              : 'z-10 px-2 pb-24 pt-2 md:px-5 md:pb-8 md:pt-4 lg:px-8',
          )}
        >
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <div key={location.pathname} className="animate-page-enter h-full w-full">
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {!isChatOnly && !location.pathname.includes('/chat') && (
        <AppTabBar onMore={() => setMobileMenuOpen(true)} />
      )}
    </div>
  )
}
