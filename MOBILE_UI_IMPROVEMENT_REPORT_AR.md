# تقرير تحسين تصميم الشريط السفلي وقائمة الوصول السريع للهواتف

تم تحديث التقرير بناءً على تفضيلاتكم التصميمية المحددة للوصول إلى أفضل تجربة مستخدم (UX) وتصميم عصري متناسق:

1. **قائمة الوصول السريع (Quick Actions):** عرض الأزرار كشبكة ثنائية الأعمدة (كل زرين بجوار بعضهما البعض) بتناسق تام.
2. **شريط التنقل السفلي (Mobile Bottom Navigation):** تطبيق نمط "الكبسولة الحركية الشفتنج" (Shifting Capsule Pattern)، بحيث يظهر التبويب المفتوح فقط داخل مستطيل دائري الأطراف (كبسولة) يحتوي على الأيقونة واسم الصفحة معاً، بينما تظهر التبويبات الأخرى المغلقة كأيقونة فقط بدون نصوص لضمان مساحة واسعة وتصميم راقٍ جداً.

---

## 1. شريط التنقل السفلي للهواتف (Mobile Bottom Navigation)

### **الملف المعني**
[MobileBottomNav.tsx](file:///d:/dar-edu/دارين%20لتعليم%20و%20التدريب/dareen-app/new-kk/src/shared/components/ui/MobileBottomNav.tsx)

### **فكرة التصميم الجديد**
* **التبويب النشط (Active):** يرتدي خلفية خفيفة ملونة بأطراف دائرية (مستطيل كبسولة دائري الأطراف `rounded-[14px] px-3 py-1.5`) ويظهر فيه الأيقونة بجانبها اسم الصفحة.
* **التبويب غير النشط (Inactive):** تنكمش لتظهر **الأيقونة فقط** دون نصوص وتكون شفافة بنسبة 60% لتعطي عمقاً بصرياً وتمنع تماماً أي تكدس أو التفاف للنصوص على الشاشات الصغيرة.
* **الحركة (Animation):** ينساب المستطيل الدائري من زر إلى آخر بسلاسة فائقة بفضل تقنية `layoutId` من مكتبة *Framer Motion*.

### **كود المكون المحسن بالكامل:**

```tsx
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
    <nav className="fixed bottom-0 end-0 start-0 z-50 md:hidden pb-safe" aria-label="التنقل الرئيسي للهاتف">
      <div className="px-4 pb-3 pt-1">
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
                    "relative touch-manipulation outline-none flex items-center justify-center transition-all duration-300",
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
```

---

## 2. قائمة الإجراءات والوصول السريع (Quick Actions)

### **الملف المعني**
[QuickActions.tsx](file:///d:/dar-edu/دارين%20لتعليم%20و%20التدريب/dareen-app/new-kk/src/features/dashboard/components/QuickActions.tsx)

### **فكرة التصميم الجديد**
* **كل زرين بجوار بعضهما البعض (2-Column Grid):** تم ترتيب شبكة الخيارات بطريقة الـ Grid بنظام `grid-cols-2` لتعرض الأزرار في صفوف متوازنة ثنائية تماماً لتناسب شاشات الهواتف.
* **البطاقات المنبثقة السفلية (Bottom Sheet):** يفتح كـ Bottom Sheet بارتفاع متناسق تلقائي، ومزود بمقبض علوي ناعم لإغلاقه بالسحب للأسفل ليعطي إحساساً طبيعياً بالمرونة.

### **كود المكون المحسن بالكامل:**

```tsx
import { useState } from 'react';
import { UserPlus, FileText, CalendarDays, Megaphone, Play, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/lib/haptics';

interface QuickActionsProps {
    onStartSession?: () => void;
    sessionAvailable?: boolean;
}

const actions = [
    {
        title: 'إضافة طالب',
        subtitle: 'تسجيل طالب جديد',
        icon: UserPlus,
        href: '/students?action=new',
        color: 'text-primary',
        iconBg: 'bg-primary-soft',
    },
    {
        title: 'إصدار فاتورة',
        subtitle: 'إنشاء فاتورة مالية',
        icon: FileText,
        href: '/student-invoices?action=new',
        color: 'text-success',
        iconBg: 'bg-success-soft',
    },
    {
        title: 'الجدول الأسبوعي',
        subtitle: 'عرض الحصص القادمة',
        icon: CalendarDays,
        href: '/schedule',
        color: 'text-info',
        iconBg: 'bg-info-soft',
    },
    {
        title: 'إعلان عام',
        subtitle: 'إرسال إعلان للجميع',
        icon: Megaphone,
        href: '/announcements',
        color: 'text-warning',
        iconBg: 'bg-warning-soft',
    },
];

export const QuickActions = ({ onStartSession, sessionAvailable }: QuickActionsProps) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const openSheet = () => {
        triggerHaptic('medium');
        setIsOpen(true);
    };

    const closeSheet = () => {
        triggerHaptic('light');
        setIsOpen(false);
    };

    return (
        <>
            {/* زر تشغيل الحصة الفوري */}
            <button
                onClick={openSheet}
                className={cn(
                    "w-full p-4 rounded-[20px] bg-primary text-on-primary font-bold text-sm",
                    "active:scale-[0.97] active:bg-primary-hover",
                    "transition-all duration-200",
                    "flex items-center justify-center gap-3 shadow-md shadow-primary/10"
                )}
            >
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-on-primary/15">
                    <Play size={14} fill="currentColor" />
                </span>
                <span className="text-sm font-bold">بدء الحصة الآن</span>
                {sessionAvailable && (
                    <span className="px-2 py-0.5 rounded-lg bg-success text-on-success text-[9px] font-bold animate-pulse">
                        متاح
                    </span>
                )}
            </button>

            {/* الورقة المنبثقة السفلية المتناسقة */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[1000] flex flex-col justify-end">
                        {/* الخلفية المظلمة المعتمة خلف النافذة */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={closeSheet}
                        />

                        {/* جسم الورقة السفلية */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="relative w-full max-h-[85vh] bg-card border-t border-border rounded-t-[28px] overflow-hidden flex flex-col z-10 pb-8"
                            onClick={(e) => e.stopPropagation()}
                            dir="rtl"
                        >
                            {/* مقبض السحب العلوي المنسق */}
                            <div className="flex flex-col items-center py-2" onClick={closeSheet}>
                                <div className="w-12 h-1.5 rounded-full bg-border opacity-70 cursor-pointer" />
                            </div>

                            {/* ترويسة الورقة */}
                            <div className="flex items-center justify-between px-6 pb-4 border-b border-border/30">
                                <div>
                                    <h2 className="text-base font-bold text-main">الوصول السريع والإجراءات</h2>
                                    <p className="text-[10px] text-muted mt-0.5">اختر الإجراء الذي تريد القيام به</p>
                                </div>
                                <button
                                    onClick={closeSheet}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-hover active:scale-90 transition-all"
                                >
                                    <X size={14} className="text-muted" />
                                </button>
                            </div>

                            {/* المحتوى الداخلي والأزرار ثنائية التقسيم */}
                            <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
                                {/* زر البث المباشر بالقمة */}
                                <button
                                    onClick={() => {
                                        closeSheet();
                                        if (onStartSession) onStartSession();
                                        else navigate('/schedule');
                                    }}
                                    className="w-full p-4 rounded-2xl bg-primary text-on-primary flex items-center gap-4 active:scale-[0.98] transition-all shadow-lg shadow-primary/10"
                                >
                                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-on-primary/15">
                                        <Play size={18} fill="currentColor" />
                                    </span>
                                    <div className="flex-1 text-right">
                                        <span className="text-xs font-bold block">بدء البث المباشر الفوري</span>
                                        <span className="text-[9px] text-on-primary/70 block mt-0.5">الدخول إلى الصف الأكاديمي مباشرة</span>
                                    </div>
                                </button>

                                {/* شبكة أزرار العمليات (كل زرين بجوار بعضهما البعض بالتساوي) */}
                                <div className="grid grid-cols-2 gap-3">
                                    {actions.map((action, i) => {
                                        const Icon = action.icon;
                                        return (
                                            <Link
                                                key={`action-${i}`}
                                                to={action.href}
                                                onClick={closeSheet}
                                                className="block"
                                            >
                                                <div
                                                    className={cn(
                                                        "flex flex-col items-center gap-3 p-4 rounded-2xl text-center h-full border border-border/40 bg-surface",
                                                        "active:scale-[0.95] active:border-primary/20",
                                                        "transition-all duration-150"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                                        action.iconBg
                                                    )}>
                                                        <Icon size={18} className={action.color} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-[12px] text-main leading-tight">{action.title}</h3>
                                                        <p className="text-[9px] text-muted mt-1 leading-normal">{action.subtitle}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
```
