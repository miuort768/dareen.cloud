import { motion } from 'framer-motion';
import { Plus, Users, BookOpen, TrendingUp } from 'lucide-react';

interface StudentsPageHeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  totalStudents: number;
  totalEnrollments: number;
  completedSessions: number;
  onAdd: () => void;
}

export const StudentsPageHeader = ({ searchTerm, onSearchChange, totalStudents, totalEnrollments, completedSessions, onAdd }: StudentsPageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-light dark:via-primary-deep dark:to-primary-soft p-5 md:p-6"
  >
    <div className="absolute inset-0 opacity-[0.06]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="std-hero-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="white" />
            <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#std-hero-grid)" />
      </svg>
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-white/30">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold text-white">إدارة الطلاب</h1>
            <p className="text-[11px] text-white/70">{totalStudents} طالب نشط</p>
          </div>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 text-[11px] font-bold px-4 py-2.5 rounded-xl bg-white text-primary hover:bg-white/90 transition-all active:scale-[0.97] shadow-lg">
          <Plus size={13} /> إضافة طالب
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { icon: Users, value: totalStudents, label: 'عدد الطلاب' },
          { icon: BookOpen, value: totalEnrollments, label: 'إجمالي الاشتراكات' },
          { icon: TrendingUp, value: completedSessions, label: 'حصص مكتملة' },
        ].map((item, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-1.5 mb-0.5">
              <item.icon size={12} className="text-white/70" />
              <span className="text-sm font-bold text-white tabular-nums">{item.value}</span>
            </div>
            <p className="text-[9px] text-white/60">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          aria-label="بحث عن طالب"
          placeholder="ابحث بالاسم أو الهاتف أو المرحلة..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold ps-9 pe-3 py-2.5 outline-none focus:bg-white/20 focus:border-white/40 rounded-xl transition-all placeholder:text-white/40"
        />
      </div>
    </div>
  </motion.div>
);