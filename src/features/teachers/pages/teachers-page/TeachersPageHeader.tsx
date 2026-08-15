import { motion } from 'framer-motion';
import { Plus, X, Users, BookOpen, DollarSign } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface TeachersPageHeaderProps {
  totalTeachers: number;
  uniqueSubjects: number;
  averagePrice: number;
  showAddForm: boolean;
  onToggleForm: () => void;
}

export const TeachersPageHeader = ({ totalTeachers, uniqueSubjects, averagePrice, showAddForm, onToggleForm }: TeachersPageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-soft dark:via-card dark:to-primary-soft p-5 md:p-6"
  >
    <div className="absolute inset-0 opacity-[0.06]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tch-hero-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
            <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tch-hero-grid)" />
      </svg>
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 dark:bg-accent flex items-center justify-center ring-2 ring-white/30 dark:ring-accent-light">
            <Users size={18} className="text-white dark:text-on-accent" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-on-primary dark:text-main">إدارة المعلمات</h1>
            <p className="text-[11px] text-white/70 dark:text-muted">{totalTeachers} معلمة نشطة</p>
          </div>
        </div>
        <button
          onClick={onToggleForm}
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.97] shadow-lg",
            showAddForm
              ? "bg-white/20 text-white hover:bg-white/30 dark:bg-white/20 dark:text-white dark:hover:bg-white/30"
              : "bg-white text-primary hover:bg-white/90 dark:bg-white dark:text-on-primary dark:hover:bg-white/80"
          )}
        >
          {showAddForm ? <X size={13} /> : <Plus size={13} />}
          {showAddForm ? 'إلغاء' : 'إضافة معلمة'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Users, value: totalTeachers, label: 'عدد المعلمات' },
          { icon: BookOpen, value: uniqueSubjects, label: 'عدد التخصصات' },
          { icon: DollarSign, value: `${averagePrice.toLocaleString()} ج.م`, label: 'متوسط السعر' },
        ].map((item, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 dark:bg-accent-light dark:border-accent">
            <div className="flex items-center gap-1.5 mb-0.5">
              <item.icon size={12} className="text-white/70 dark:text-accent" />
              <span className="text-sm font-bold text-white tabular-nums dark:text-accent">{item.value}</span>
            </div>
            <p className="text-[9px] text-white/60 dark:text-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);
