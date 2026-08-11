import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { triggerHaptic } from '../../../lib/haptics';

export interface MobileBottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  path: string;
  isCenter?: boolean;
}

interface MobileBottomNavProps {
  items: MobileBottomNavItem[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  layoutId?: string;
}

export const MobileBottomNav = ({ items, activeTab, onTabChange, layoutId = 'bottom-nav-dot' }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return createPortal(
    <nav className="fixed bottom-0 end-0 start-0 z-50 md:hidden" aria-label="التنقل الرئيسي">
      <div className="relative px-3 pb-2 pt-0.5" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        <div className="relative rounded-[1.25rem] bg-card/80 dark:bg-[#0e0e12]/80 backdrop-blur-2xl border border-border/40 dark:border-white/[0.06] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/[0.08] pointer-events-none" />

          <div className="relative flex items-center justify-around h-[72px] px-2 pt-2 pb-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab
                ? activeTab === item.id
                : location.pathname === item.path;
              const isCenter = item.isCenter;

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => {
                    triggerHaptic('light');
                    if (onTabChange) {
                      onTabChange(item.id);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center relative touch-manipulation outline-none",
                    isCenter ? "w-[72px] h-[72px] -mt-6" : "flex-1 h-full"
                  )}
                >
                  {isCenter ? (
                    <>
                      <div className="absolute -top-1 inset-x-0 flex justify-center pointer-events-none">
                        <div className="w-[64px] h-[64px] rounded-[22px] bg-primary/20 dark:bg-primary/25 blur-xl scale-110" />
                      </div>
                      <div className="relative w-[56px] h-[56px] rounded-[18px] bg-gradient-to-b from-primary via-primary to-primary-deep dark:from-primary dark:via-[#b8962e] dark:to-[#8a6d1a] flex items-center justify-center shadow-[0_6px_24px_rgba(var(--primary-rgb,212,175,55),0.3)] dark:shadow-[0_6px_24px_rgba(212,175,55,0.25)] transition-transform duration-300 active:scale-95">
                        <div className="absolute inset-0 rounded-[18px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                        <Icon size={24} className="text-on-primary dark:text-on-primary relative z-10" strokeWidth={2.2} />
                      </div>
                    </>
                  ) : (
                    <motion.div
                      layoutId={layoutId}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all duration-300",
                        isActive
                          ? "bg-primary/10 dark:bg-primary/15"
                          : "bg-transparent"
                      )}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    >
                      <Icon
                        size={21}
                        className={cn(
                          "transition-all duration-300 shrink-0",
                          isActive
                            ? "text-primary dark:text-primary"
                            : "text-muted dark:text-white/40"
                        )}
                        strokeWidth={isActive ? 2.2 : 1.5}
                      />
                      <span className={cn(
                        "text-[11px] font-bold transition-all duration-300 leading-none whitespace-nowrap",
                        isActive
                          ? "text-primary dark:text-primary"
                          : "text-muted dark:text-white/40"
                      )}>
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>,
    document.body
  );
};
