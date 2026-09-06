import { useState, useEffect, useRef } from 'react'
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react'
import { useLocation } from 'react-router-dom'

type Platform =
  'android-chrome' | 'ios-safari' | 'windows-edge' | 'mac-safari' | 'desktop-chrome' | 'other'

const detectPlatform = (): Platform => {
  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
  const isAndroid = /Android/.test(ua)
  const isMac = /Macintosh/.test(ua) && !isIOS
  const isWindows = /Windows/.test(ua)
  const isChrome = /Chrome/.test(ua) && !/Edge|Edg/.test(ua)
  const isEdge = /Edg/.test(ua)
  const isSafari = /Safari/.test(ua) && !isChrome && !isEdge

  if (isIOS) return 'ios-safari'
  if (isAndroid && isChrome) return 'android-chrome'
  if (isWindows && isEdge) return 'windows-edge'
  if (isWindows && isChrome) return 'desktop-chrome'
  if (isMac && isSafari) return 'mac-safari'
  if (isMac && isChrome) return 'desktop-chrome'
  return 'other'
}

const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
  document.referrer.includes('android-app://')

export const InstallPWA = () => {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const deferredPromptRef = useRef<Event | null>(null)

  const isDashboard =
    /^\/(admin-dashboard|teacher-dashboard|student-dashboard|parent-dashboard|students|teachers|parents|finance|attendance|schedule|appointments|tasks|announcements|forum|settings|evaluations|monthly-closing|reports|leads|trial-sessions|student-invoices|teacher-invoices|teacher-payment-history|parent-payment-history|admin-blog|admin-contacts|admin-jobs|parent-students|parent-announcements|chat)/.test(
      location.pathname,
    )

  useEffect(() => {
    if (isDashboard) return
    if (isStandaloneMode()) return
    if (localStorage.getItem('pwa_dismissed_permanent')) return

    const detectedPlatform = detectPlatform()
    setPlatform(detectedPlatform)

    const globalPrompt = (window as unknown as { deferredPrompt?: Event }).deferredPrompt
    if (globalPrompt) {
      deferredPromptRef.current = globalPrompt
      setIsVisible(true)
    }

    const handleBeforeInstall = (e: Event) => {
      deferredPromptRef.current = e
      ;(window as unknown as { deferredPrompt: Event }).deferredPrompt = e
      setIsVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener)
      deferredPromptRef.current = null
    }
  }, [isDashboard])

  const handleInstall = async () => {
    if (platform === 'ios-safari' || platform === 'mac-safari') {
      setShowIOSGuide(true)
      return
    }

    const globalPrompt2 = (window as unknown as { deferredPrompt?: Event }).deferredPrompt
    if (globalPrompt2) {
      deferredPromptRef.current = globalPrompt2
    }

    if (deferredPromptRef.current) {
      try {
        const promptEvent = deferredPromptRef.current as Event & {
          prompt: () => Promise<void>
          userChoice: Promise<{ outcome: string }>
        }
        await promptEvent.prompt()
        const { outcome } = await promptEvent.userChoice

        if (outcome === 'accepted') {
          setIsVisible(false)
          localStorage.setItem('pwa_dismissed_permanent', 'true')
          ;(window as unknown as { deferredPrompt: null }).deferredPrompt = null
        }
      } catch (e) {
        console.warn(e)
        setShowIOSGuide(true)
      } finally {
        deferredPromptRef.current = null
      }
      return
    }

    setShowIOSGuide(true)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setShowIOSGuide(false)
    sessionStorage.setItem('pwa_dismissed_session', 'true')
  }

  const handleDismissPermanent = () => {
    setIsVisible(false)
    setShowIOSGuide(false)
    localStorage.setItem('pwa_dismissed_permanent', 'true')
  }

  if (!isVisible || isDashboard) return null

  const isDesktop = platform === 'desktop-chrome' || platform === 'windows-edge'
  const isIOS = platform === 'ios-safari'

  if (showIOSGuide) {
    return (
      <div
        className="fixed inset-0 z-[150] flex items-end justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleDismiss()
        }}
      >
        <div className="w-full max-w-sm border-2 border-border bg-card shadow-elevation-3 duration-300 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b-2 border-border bg-warning px-4 py-3">
            <div className="flex items-center gap-2">
              <Smartphone size={18} className="text-main" />
              <h2 className="text-start text-sm font-medium uppercase tracking-tighter text-main">
                ثبتي التطبيق
              </h2>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 transition-colors hover:bg-hover"
              aria-label="إغلاق"
            >
              <X size={16} className="text-main" />
            </button>
          </div>

          <div className="space-y-3 bg-surface p-4 text-start">
            {isIOS ? (
              <>
                <p className="mb-3 text-xs font-normal text-muted">اتبعي هذه الخطوات في Safari:</p>
                <div className="flex items-start gap-3 border border-border bg-background p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-warning text-micro font-medium">
                    1
                  </span>
                  <div>
                    <p className="flex items-center gap-1 text-xs font-medium text-main">
                      اضغطي على زر المشاركة <Share size={12} className="text-info" />
                    </p>
                    <p className="text-micro text-muted">في أسفل شاشة المتصفح</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border border-border bg-background p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-warning text-micro font-medium">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-medium text-main">مرري للأسفل</p>
                    <p className="text-micro text-muted">في قائمة المشاركة</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border border-border bg-background p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-warning text-micro font-medium">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-medium text-main">اضغطي"Add to Home Screen"</p>
                    <p className="text-micro text-muted">ثم اضغطي"Add"للتأكيد</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-xs font-normal text-muted">اتبع هذا الدليل للتثبيت:</p>
                <div className="flex items-start gap-3 border border-border bg-background p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-border bg-warning text-micro font-medium">
                    1
                  </span>
                  <p className="text-xs font-medium text-main">
                    اضغط على القائمة ثم"Add to Home Screen"
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex border-t-2 border-border">
            <button
              onClick={handleDismissPermanent}
              className="flex-1 border-s border-border py-3 text-micro font-medium text-muted transition-colors hover:bg-surface"
            >
              عدم التذكير مجدداً
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-warning py-3 text-micro font-medium text-main transition-colors hover:bg-warning"
            >
              فهمت، شكراً
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed z-[120] duration-500 animate-in fade-in slide-in-from-bottom-5 ${
        isDesktop ? 'bottom-4 start-4' : 'bottom-4 end-3 start-3'
      }`}
    >
      <div
        className={`flex items-center gap-3 rounded-[20px] border border-white/10 bg-success p-2.5 ${
          isDesktop ? 'me-auto max-w-[280px]' : ''
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/10 text-on-success">
          {isDesktop ? <Monitor size={18} /> : <Smartphone size={18} />}
        </div>

        <div className="min-w-0 flex-1 text-start">
          <h2 className="text-micro font-medium uppercase leading-tight text-on-success">
            ثبتي التطبيق
          </h2>
          <p className="mt-0.5 truncate text-micro font-medium text-white/90">
            {isIOS ? 'اضغطي Share ← Add to Home Screen' : 'أسرع وأسهل — يعمل بدون إنترنت'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 rounded-lg bg-warning px-3 py-1.5 text-micro font-medium uppercase text-main outline-none transition-all hover:bg-warning focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
          >
            {isIOS ? <Share size={10} /> : <Download size={10} />}
            {isIOS ? 'كيف؟' : 'تثبيت'}
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-full bg-white/10 p-1.5 text-on-success transition-colors hover:bg-error hover:text-on-error"
            aria-label="إغلاق"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}
