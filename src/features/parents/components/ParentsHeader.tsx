import { Users, X, GraduationCap, TrendingUp, Download, FileSpreadsheet, FileText, Search, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface ParentsHeaderProps {
    totalParents: number;
    totalLinkedStudents: number;
    avgChildren: number;
    showAddForm: boolean;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    filterStatus: string;
    onFilterStatusChange: (val: string) => void;
    onToggleAddForm: () => void;
    onImport: () => void;
    onExportExcel: () => void;
    onExportPDF: () => void;
}

const statusFilters = [
    { value: '', label: 'الكل' },
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'غير نشط' },
    { value: 'overdue', label: 'متأخرات' },
];

export const ParentsHeader = ({
    totalParents,
    totalLinkedStudents,
    avgChildren,
    showAddForm,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterStatusChange,
    onToggleAddForm,
    onImport,
    onExportExcel,
    onExportPDF
}: ParentsHeaderProps) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover dark:from-primary-light dark:via-primary-deep dark:to-primary-soft"
    >
        <div className="absolute inset-0 opacity-[0.06]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="parent-hero-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="white" />
                        <circle cx="16" cy="16" r="0.8" fill="white" opacity="0.4" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#parent-hero-grid)" />
            </svg>
        </div>
        <div className="relative z-10 p-4 md:p-5 space-y-4">
            {/* Title Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                        <Users size={16} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm md:text-base font-bold text-on-primary">سجل أولياء الأمور</h1>
                        <p className="text-[10px] md:text-[11px] text-white/70">{totalParents} ولي أمر · {totalLinkedStudents} طالب مرتبط</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Export Icons */}
                    <div className="hidden md:flex items-center gap-1 p-0.5 bg-white/10 rounded-xl">
                        <button onClick={onImport} className="w-7 h-7 flex items-center justify-center hover:bg-white/20 text-white/70 hover:text-white transition-all rounded-lg" aria-label="استيراد">
                            <Download size={12} />
                        </button>
                        <div className="w-px h-3 bg-white/20" />
                        <button onClick={onExportExcel} className="w-7 h-7 flex items-center justify-center hover:bg-white/20 text-white/70 hover:text-white transition-all rounded-lg" aria-label="تصدير Excel">
                            <FileSpreadsheet size={12} />
                        </button>
                        <button onClick={onExportPDF} className="w-7 h-7 flex items-center justify-center hover:bg-white/20 text-white/70 hover:text-white transition-all rounded-lg" aria-label="تصدير PDF">
                            <FileText size={12} />
                        </button>
                    </div>
                    <button
                        onClick={onToggleAddForm}
                        className={cn(
                            "flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold px-3 md:px-4 h-8 md:h-9 rounded-xl transition-all active:scale-[0.97] shadow-lg",
                            showAddForm
                                ? "bg-error text-on-error"
                                : "bg-white/20 text-white hover:bg-white/30"
                        )}
                    >
                        {showAddForm ? <X size={12} /> : <UserPlus size={12} />}
                        <span className="hidden sm:inline">{showAddForm ? 'إلغاء' : 'إضافة ولي أمر'}</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { icon: Users, value: totalParents, label: 'إجمالي أولياء الأمور', change: '' },
                    { icon: GraduationCap, value: totalLinkedStudents, label: 'إجمالي الأبناء', change: '' },
                    { icon: TrendingUp, value: avgChildren, label: 'متوسط الأبناء', suffix: '/ ولي أمر', change: '' },
                    { icon: UserPlus, value: totalParents > 0 ? '—' : '—', label: 'آخر تسجيل', change: '' },
                ].map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                            <item.icon size={11} className="text-white/70" />
                            <span className="text-xs md:text-sm font-bold text-white tabular-nums">{item.value}{item.suffix || ''}</span>
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
                        aria-label="بحث عن ولي أمر"
                        placeholder="ابحث بالاسم أو الهاتف أو البريد..."
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[11px] font-bold ps-9 pe-3 py-2.5 outline-none focus:bg-white/20 focus:border-white/40 rounded-xl transition-all placeholder:text-white/40"
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    {statusFilters.map(f => (
                        <button
                            key={f.value}
                            onClick={() => onFilterStatusChange(f.value)}
                            className={cn(
                                "px-2.5 py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap",
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