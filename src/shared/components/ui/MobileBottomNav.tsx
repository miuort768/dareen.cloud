import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

export const MobileBottomNav = ({ items, activeTab, onTabChange, layoutId = 'bottom-nav-active-pill' }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return createPortal(
    <nav className="fixed bottom-0 end-0 start-0 z-50 md:hidden" aria-label="التنقل الرئيسي للهاتف">
      <div className="px-4 pt-1" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        {/* حاوية الشريط الخلفية الزجاجية الفاخرة */}
        <div className="relative rounded-[24px] bg-card/75 dark:bg-[#0e0e12]/70 backdrop-blur-xl border border-border/30 dark:border-white/[0.04] shadow-elevation-3">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/[0.05] pointer-events-none" />

          <div className="relative flex items-center justify-around h-[68px] px-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab
                ? activeTab === item.id
                : location.pathname === item.path;
              const isCenter = item.isCenter;

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    triggerHaptic('light');
                    if (onTabChange) {
                      onTabChange(item.id);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={cn(
                    "relative touch-manipulation outline-none flex items-center justify-center transition-all duration-300 focus-visible:ring-2 focus-visible:ring-focus rounded-full",
                    isCenter ? "w-[62px] h-[62px] -mt-5" : "flex-1 h-full py-1"
                  )}
                >
                  {isCenter ? (
                    <>
                      {/* الزر الدائري المركزي الخاص بالبث المباشر الفوري */}
                      <div className="absolute -top-1 inset-x-0 flex justify-center pointer-events-none">
                        <div className="w-[56px] h-[56px] rounded-full bg-primary/25 blur-lg scale-110" />
                      </div>
                      <div className="relative w-[50px] h-[50px] rounded-full bg-gradient-to-b from-primary to-primary-hover flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                        <Icon size={22} className="text-on-primary" strokeWidth={2.5} />
                      </div>
                    </>
                  ) : (
                    <div className="relative flex items-center justify-center h-full w-full">
                      <AnimatePresence initial={false}>
                        {isActive ? (
                          /* التبويب النشط: مستطيل دائري خفيف يحتوي الأيقونة والاسم */
                          <motion.div
                            layoutId={layoutId}
                            className="flex items-center gap-2 px-3.5 py-2 bg-primary/10 dark:bg-primary/15 text-primary rounded-[14px] border border-primary/10"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          >
                            <Icon size={18} strokeWidth={2.2} className="text-primary shrink-0" />
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-[10px] font-extrabold leading-none whitespace-nowrap text-primary"
                            >
                              {item.label}
                            </motion.span>
                          </motion.div>
                        ) : (
                          /* التبويب غير النشط: أيقونة فقط شفافة */
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.6 }}
                            className="p-2 text-muted"
                          >
                            <Icon size={20} strokeWidth={1.8} className="text-muted" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
