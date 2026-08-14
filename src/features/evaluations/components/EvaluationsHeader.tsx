import { Award, Plus, X, Search, Users, Star, TrendingUp, UserCheck, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface Stats {
    totalStudents: number;
    evaluatedCount: number;
    notEvaluatedCount: number;
    avgRating: string;
    totalXP: number;
}

interface EvaluationsHeaderProps {
    stats: Stats;
    showAddButton: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: string;
    onFilterStatusChange: (value: string) => void;
    onAddClick: () => void;
}

const filters = [
    { value: '', label: 'الكل' },
    { value: 'evaluated', label: 'تم تقييمهم' },
    { value: 'not-evaluated', label: 'غير مقيمين' },
    { value: 'highest-xp', label: 'الأعلى XP' },
    { value: 'lowest-xp', label: 'الأقل XP' },
];

export const EvaluationsHeader = ({ stats, showAddButton, searchTerm, onSearchChange, filterStatus, onFilterStatusChange, onAddClick }: EvaluationsHeaderProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-light dark:via-primary-deep dark:to-primary-soft"
        >
            <div className="absolute inset-0 opacity-[0.06]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="eval-hero-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="white" />
                            <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#eval-hero-grid)" />
                </svg>
            </div>
            <div className="relative z-10 p-4 md:p-5 space-y-4">
                {/* Title Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                            <Award size={16} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-sm md:text-base font-bold text-on-primary">تقييم الطلاب</h1>
                            <p className="text-[10px] md:text-[11px] text-white/70">{stats.totalStudents} طالب</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg">
                            <Award size={11} className="text-warning" />
                            <span className="text-[10px] font-bold text-white tabular-nums">{stats.totalXP.toLocaleString()}</span>
                            <span className="text-[8px] text-white/50">XP</span>
                        </div>
                        {showAddButton && (
                            <button onClick={onAddClick} className="flex items-center gap-1.5 h-8 px-3 bg-white/20 text-white text-[10px] font-bold rounded-lg hover:bg-white/30 transition-all active:scale-95">
                                <Plus size={11} /> تقييم
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                        { icon: Users, value: stats.totalStudents, label: 'إجمالي الطلاب' },
                        { icon: UserCheck, value: stats.evaluatedCount, label: 'تم تقييمهم' },
                        { icon: UserX, value: stats.notEvaluatedCount, label: 'غير مقيمين' },
                        { icon: Star, value: stats.avgRating, label: 'متوسط التقييم' },
                        { icon: TrendingUp, value: `${stats.totalXP.toLocaleString()}`, label: 'إجمالي XP' },
                    ].map((item, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <item.icon size={10} className="text-white/70" />
                                <span className="text-xs md:text-sm font-bold text-white tabular-nums">{item.value}</span>
                            </div>
                            <p className="text-[8px] md:text-[9px] text-white/60">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Search + Filters */}
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            aria-label="بحث عن طالب"
                            placeholder="ابحث بالاسم أو الصف..."
                            value={searchTerm}
                            onChange={e => onSearchChange(e.target.value)}
                            className="w-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[11px] font-bold ps-9 pe-3 py-2.5 outline-none focus:bg-white/20 focus:border-white/40 rounded-xl transition-all placeholder:text-white/40"
                        />
                        {searchTerm && (
                            <button aria-label="مسح البحث" onClick={() => onSearchChange('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {filters.map(f => (
                            <button
                                key={f.value}
                                onClick={() => onFilterStatusChange(f.value)}
                                className={cn(
                                    "px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap shrink-0",
                                    filterStatus === f.value
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};