import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Trash2, Phone, MessageCircle, GraduationCap, Calendar, Award, Globe, BookOpen, Search, CheckCircle2, BookMarked, BarChart3, Filter, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { SUBJECTS } from '../data/subjects';
import { cn } from '../lib/utils';

interface JobApp {
    id: string;
    name: string;
    phone: string;
    whatsapp: string;
    position: string;
    qualification: string;
    grade: string;
    graduationYear: string;
    onlineYears: string;
    curriculums: string;
    subject: string;
    contacted: number;
    created_at: string;
}

const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 5 + 2, duration: Math.random() * 6 + 4, delay: Math.random() * 3,
}));

export const AdminJobs = () => {
    useEffect(() => { document.title = 'الوظائف | دارين السابعة للتعليم والتدريب'; }, []);
    const queryClient = useQueryClient();
    const { data: apps = [], isLoading: loading } = useQuery<JobApp[]>({
        queryKey: ['jobs'],
        queryFn: () => api.get('/jobs'),
        select: (data) => safeArray<JobApp>(data).map(a => ({ ...a, contacted: a.contacted ? 1 : 0 })),
    });
    const [search, setSearch] = useState('');
    const [fabOpen, setFabOpen] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState('');

    const handleDelete = async (id: string) => {
        const confirmed = await confirm('هل أنت متأكد من حذف طلب التوظيف هذا؟ لا يمكن التراجع عن هذا الإجراء.', {
            title: 'حذف الطلب',
            confirmText: 'حذف',
            cancelText: 'تراجع',
            isDestructive: true,
            icon: <Trash2 size={28} />
        });
        if (!confirmed) return;
        try {
            await api.delete(`/jobs/${id}`);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        } catch (err) {
            console.error(err);
        }
    };

    const handleContacted = async (id: string) => {
        try {
            await api.patch<{ contacted: boolean }>(`/jobs/${id}/contacted`);
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = apps.filter(a => {
        const q = search.trim().toLowerCase();
        if (!q && !subjectFilter) return true;
        const matchesSearch = !q ||
            a.name.toLowerCase().includes(q) ||
            a.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            (a.whatsapp || '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            a.position.toLowerCase().includes(q);
        const matchesSubject = !subjectFilter || a.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    const pendingCount = useMemo(() => apps.filter(a => !a.contacted).length, [apps]);
    const contactedCount = useMemo(() => apps.filter(a => a.contacted).length, [apps]);

    const uniquePositions = useMemo(() => new Set(apps.map(a => a.position).filter(Boolean)).size, [apps]);

    const uniqueSubjects = useMemo(() => new Set(apps.map(a => a.subject).filter(Boolean)).size, [apps]);

    const kpiCards = useMemo(() => [
        { label: 'إجمالي الطلبات', value: apps.length, icon: Briefcase, gradient: 'from-primary/20 to-primary/5', iconBg: 'bg-primary/10 text-primary', accent: 'bg-primary' },
        { label: 'بانتظار التواصل', value: pendingCount, icon: Users, gradient: 'from-warning/20 to-warning/5', iconBg: 'bg-warning/10 text-warning', accent: 'bg-warning' },
        { label: 'تم التواصل', value: contactedCount, icon: CheckCircle2, gradient: 'from-success/20 to-success/5', iconBg: 'bg-success/10 text-success', accent: 'bg-success' },
        { label: 'المواد', value: uniqueSubjects, icon: BookOpen, gradient: 'from-info/20 to-info/5', iconBg: 'bg-info/10 text-info', accent: 'bg-info' },
    ], [apps, pendingCount, contactedCount, uniqueSubjects]);

    const fabActions = useMemo(() => [
        { icon: Filter, label: 'تصفية', onClick: () => document.querySelector('[data-filters]')?.scrollIntoView({ behavior: 'smooth' }) },
        { icon: BarChart3, label: 'إحصائيات', onClick: () => document.querySelector('[data-kpi]')?.scrollIntoView({ behavior: 'smooth' }) },
    ], []);

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="max-w-5xl mx-auto px-2">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-deep to-primary-hover p-6 md:p-8 mb-4">
                    {particles.map(p => (
                        <motion.div key={p.id} className="absolute rounded-full bg-white/10 pointer-events-none"
                            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
                            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
                    ))}
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm"><Briefcase className="text-white" size={20} /></div>
                                <span className="text-white/70 text-xs font-medium">الإدارة</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">طلبات التوظيف</h1>
                            <p className="text-white/70 text-sm">إدارة طلبات المتقدمين للوظائف</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">الإجمالي</p>
                                <p className="text-2xl font-bold text-white">{apps.length}</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center">
                                <p className="text-white/60 text-xs mb-1">بانتظار</p>
                                <p className="text-2xl font-bold text-white">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} data-kpi>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}
                                    whileHover={{ scale: 1.02, y: -2 }} className={cn("relative overflow-hidden rounded-xl bg-gradient-to-br border border-border/50 p-4", kpi.gradient)}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("p-2 rounded-lg", kpi.iconBg)}><Icon size={16} /></div>
                                        <div className={cn("h-1 w-12 rounded-full", kpi.accent)} />
                                    </div>
                                    <p className="text-xs text-muted mb-1">{kpi.label}</p>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} data-filters>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="relative">
                            <BookMarked className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}
                                aria-label="تصفية حسب المادة"
                                className="w-full bg-card border border-border rounded-xl py-3 ps-9 pe-3 text-xs font-bold text-main focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                                <option value="">كل المواد</option>
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                            <input type="text" aria-label="بحث" placeholder="ابحث بالاسم أو الهاتف..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="w-full bg-card border border-border rounded-xl py-3 ps-9 pe-3 text-xs font-bold text-main placeholder:text-muted focus:outline-none focus:border-primary transition-all" />
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={`skel-${i}`} className="bg-card h-32 animate-pulse border border-border rounded-2xl" />)}
                            </div>
                        ) : filtered.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto mb-3">
                                    <Briefcase size={22} className="text-primary" />
                                </div>
                                <p className="text-base font-bold text-main">لا توجد طلبات</p>
                                <p className="text-xs text-muted mt-1.5">سيتم عرض طلبات المتقدمين هنا</p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((app, index) => (
                                    <motion.div key={app.id} layout
                                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
                                        transition={{ duration: 0.2, delay: index * 0.03 }}
                                        className={cn("group bg-card border border-border/30 hover:border-primary/20 transition-all duration-200 overflow-hidden rounded-2xl shadow-sm hover:shadow-md relative",
                                            app.contacted && 'opacity-50')}>
                                        <div className={cn("h-0.5 w-full transition-colors duration-300", app.contacted ? 'bg-border' : 'bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20')} />
                                        {!app.contacted && (
                                            <div className="absolute top-0 end-0 w-32 h-32 bg-primary/5 -me-8 -mt-8 rotate-45 pointer-events-none border border-primary/10 rounded-3xl" />
                                        )}
                                        <div className={cn("p-4 md:p-5 relative z-10", app.contacted && 'opacity-60')}>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                        app.contacted ? 'bg-surface border border-border' : 'bg-primary')}>
                                                        <span className={cn("text-sm font-bold", app.contacted ? 'text-muted' : 'text-on-primary')}>
                                                            {app.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className={cn("text-sm font-bold truncate", app.contacted ? 'text-muted' : 'text-main')}>{app.name}</h3>
                                                        <p className={cn("text-[11px] font-bold truncate", app.contacted ? 'text-muted' : 'text-primary')}>{app.position}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button onClick={() => handleContacted(app.id)}
                                                        className={cn("p-2 rounded-xl border-2 transition-all", app.contacted
                                                            ? 'border-success bg-success-light text-success'
                                                            : 'border-success/30 bg-success/10 text-success hover:bg-success-light hover:border-success')}
                                                        title="تم التواصل" aria-label="تم التواصل">
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(app.id)}
                                                        className="p-2 rounded-xl border-2 border-error/30 bg-error/10 text-error hover:bg-error-light hover:border-error transition-all"
                                                        aria-label="حذف الطلب">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2.5 text-xs border-t border-border pt-3">
                                                <DetailRow icon={Phone} label="الهاتف" value={app.phone} contacted={!!app.contacted} />
                                                <DetailRow icon={MessageCircle} label="واتساب" value={app.whatsapp || '-'} contacted={!!app.contacted} />
                                                <DetailRow icon={GraduationCap} label="المؤهل" value={app.qualification} contacted={!!app.contacted} />
                                                <DetailRow icon={Award} label="التقدير" value={app.grade || '-'} contacted={!!app.contacted} />
                                                {app.subject && <DetailRow icon={BookMarked} label="المادة" value={app.subject} contacted={!!app.contacted} />}
                                                <DetailRow icon={Calendar} label="سنة التخرج" value={app.graduationYear || '-'} contacted={!!app.contacted} />
                                                <DetailRow icon={Globe} label="خبرة أون لاين" value={`${app.onlineYears || '0'} سنة`} contacted={!!app.contacted} />
                                                <div className="col-span-2 md:col-span-4 flex items-start gap-2.5 pt-3 border-t border-border mt-1">
                                                    <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 bg-primary-soft rounded-lg">
                                                        <BookOpen size={10} className={app.contacted ? 'text-muted' : 'text-primary'} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-muted mb-0.5">المناهج</p>
                                                        <span className="text-[10px] font-bold text-main">{app.curriculums || '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {fabOpen && fabActions.map((action, i) => (
                        <motion.div key={action.label} initial={{ opacity: 0, scale: 0.3, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.3, y: 20 }} transition={{ delay: 0.05 * (fabActions.length - 1 - i) }} className="flex items-center gap-2">
                            <span className="bg-card border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm whitespace-nowrap">{action.label}</span>
                            <button onClick={() => { action.onClick(); setFabOpen(false); }}
                                className="w-10 h-10 rounded-full bg-primary text-on-primary shadow-lg hover:shadow-xl hover:bg-primary-hover transition-all flex items-center justify-center">
                                <action.icon size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <motion.button onClick={() => setFabOpen(!fabOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={cn("w-12 h-12 rounded-full shadow-xl text-on-primary flex items-center justify-center transition-all", fabOpen ? "bg-error rotate-45" : "bg-primary")}>
                    <Briefcase size={22} />
                </motion.button>
            </div>
        </div>
    );
};

const DetailRow = ({ icon: Icon, label, value, contacted }: { icon: React.FC<{ size?: number; className?: string }>; label: string; value: string; contacted?: boolean }) => (
    <div className={cn("flex items-center gap-2", contacted && 'opacity-50')}>
        <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-primary-soft rounded-lg">
            <Icon size={10} className={contacted ? 'text-muted' : 'text-primary'} />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted">{label}</p>
            <span className={cn("text-[10px] font-bold truncate block", contacted ? 'text-muted' : 'text-main')}>{value}</span>
        </div>
    </div>
);
