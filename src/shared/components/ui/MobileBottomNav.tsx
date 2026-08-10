import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
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

  return (
    <nav className="fixed bottom-0 end-0 start-0 z-50" aria-label="التنقل الرئيسي">
      <div className="relative">
        {/* Glow effect behind bar */}
        <div className="absolute inset-x-0 -top-4 h-8 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />

        <div className="relative bg-card/95 dark:bg-surface/95 backdrop-blur-2xl border-t border-border/50 dark:border-primary/10 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.3)] pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-end justify-around h-[72px] px-2 pt-2 pb-1.5">
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
                    "flex flex-col items-center justify-center relative touch-manipulation",
                    isCenter ? "w-[72px] h-[72px] -mt-6" : "flex-1 h-full pt-1 pb-0.5"
                  )}
                >
                  {isCenter ? (
                    <>
                      {/* Center button glow */}
                      <div className="absolute inset-0 bg-primary/15 dark:bg-primary/20 rounded-[22px] blur-lg scale-110" />
                      <div className="absolute inset-1 bg-primary/5 dark:bg-primary/10 rounded-[20px] blur-md" />

                      {/* Center button */}
                      <div className="relative w-[56px] h-[56px] rounded-[20px] bg-gradient-to-b from-primary via-primary to-primary-deep dark:from-primary dark:via-primary dark:to-warning flex items-center justify-center shadow-[0_4px_20px_rgba(var(--primary-rgb,212,175,55),0.35)] dark:shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all duration-300 active:scale-95">
                        <Icon size={26} className="text-on-primary dark:text-on-primary" strokeWidth={2.4} />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Active indicator pill */}
                      {isActive && (
                        <motion.div
                          layoutId={layoutId}
                          className="absolute top-0 inset-x-2 h-[3px] bg-primary dark:bg-primary rounded-full"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Icon container */}
                      <div className={cn(
                        "relative rounded-2xl p-2 transition-all duration-300",
                        isActive
                          ? "bg-primary/10 dark:bg-primary/15"
                          : "bg-transparent"
                      )}>
                        <Icon
                          size={22}
                          className={cn(
                            "transition-all duration-300",
                            isActive
                              ? "text-primary dark:text-primary scale-110"
                              : "text-muted dark:text-dim"
                          )}
                          strokeWidth={isActive ? 2.4 : 1.6}
                        />
                      </div>

                      {/* Label */}
                      <span className={cn(
                        "text-[10px] font-bold transition-all duration-300 mt-0.5 leading-none",
                        isActive
                          ? "text-primary dark:text-primary"
                          : "text-muted dark:text-dim"
                      )}>
                        {item.label}
                      </span>
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
