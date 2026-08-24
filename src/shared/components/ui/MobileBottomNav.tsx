import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { cn } from '../../../lib/utils'
import { triggerHaptic } from '../../../lib/haptics'

export interface MobileBottomNavItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  path: string
  isCenter?: boolean
}

interface MobileBottomNavProps {
  items: MobileBottomNavItem[]
  activeTab?: string
  onTabChange?: (id: string) => void
  layoutId?: string
}

export const MobileBottomNav = ({
  items,
  activeTab,
  onTabChange,
  layoutId = 'bottom-nav-active-pill',
}: MobileBottomNavProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  return createPortal(
    <nav className="fixed bottom-0 end-0 start-0 z-50 md:hidden" aria-label="التنقل الرئيسي للهاتف">
      <div
        className="px-3 pt-1"
        style={{ paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))' }}
      >
        <div className="border-border/50 bg-card/90 dark:bg-background/90 relative rounded-[26px] border shadow-elevation-3 backdrop-blur-2xl dark:border-white/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

          <div className="relative flex h-[66px] items-center justify-around px-1.5">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab ? activeTab === item.id : location.pathname === item.path
              const isCenter = item.isCenter

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    triggerHaptic('light')
                    if (onTabChange) {
                      onTabChange(item.id)
                    } else {
                      navigate(item.path)
                    }
                  }}
                  className={cn(
                    'relative flex touch-manipulation items-center justify-center rounded-2xl outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-focus',
                    isCenter
                      ? '-mt-5 h-[54px] w-[54px]'
                      : 'min-h-[48px] flex-1 flex-col gap-1 py-1.5',
                  )}
                >
                  {isCenter ? (
                    <>
                      <div className="pointer-events-none absolute inset-0 -top-1 flex justify-center">
                        <div className="h-[52px] w-[52px] rounded-full bg-primary/20 blur-md" />
                      </div>
                      <div className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full bg-primary text-on-primary shadow-elevation-2 transition-transform active:scale-95">
                        <Icon size={22} strokeWidth={2.4} />
                      </div>
                    </>
                  ) : (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId={layoutId}
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                          className="bg-primary/12 absolute inset-x-1 inset-y-1 rounded-xl dark:bg-primary/20"
                        />
                      )}
                      <div className="relative z-10 flex items-center justify-center">
                        <Icon
                          size={19}
                          strokeWidth={isActive ? 2.3 : 1.7}
                          className={cn(
                            'transition-transform duration-300',
                            isActive ? 'scale-110 text-primary' : 'text-muted',
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          'relative z-10 text-[10px] font-bold leading-none tracking-tight transition-colors duration-300',
                          isActive ? 'font-black text-primary' : 'text-muted',
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>,
    document.body,
  )
}
