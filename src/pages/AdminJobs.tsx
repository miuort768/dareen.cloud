import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Trash2, Phone, MessageCircle, GraduationCap, Calendar, Award, Globe, BookOpen, Search, CheckCircle2, BookMarked, Download, ChevronDown, Inbox, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { SUBJECTS } from '../data/subjects';
import { useAcademyName, useIsLoading } from '../context/AppContext';
import { cn } from '../lib/utils';
import { socketService } from '../lib/socket';
import { SOCKET_EVENTS } from '../lib/socket-events';

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
    createdAt: string;
}

function formatDateNumeric(dateStr: string) {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function exportToCsv(apps: JobApp[]) {
    const headers = ['الاسم', 'رقم الهاتف', 'المناهج', 'سنوات الخبرة'];
    const rows = apps.map(a => [
        a.name || '',
        a.phone || '',
        a.curriculums || '-',
        a.onlineYears || '0',
    ]);
    const bom = '\uFEFF';
    const csv = bom + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-applications.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export const AdminJobs = () => {
    const academyName = useAcademyName();
    useEffect(() => { document.title = `الوظائف | ${academyName}`; }, [academyName]);
    const queryClient = useQueryClient();
    const authLoading = useIsLoading();

    const { data: apps = [], isLoading: loading } = useQuery<JobApp[]>({
        queryKey: ['jobs'],
        queryFn: () => api.get('/jobs'),
        select: (data) => safeArray<JobApp>(data).map(a => ({ ...a, contacted: a.contacted ? 1 : 0 })),
        enabled: !authLoading,
        retry: 1,
        refetchInterval: 30000,
    });

    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');

    useEffect(() => {
        const socket = socketService.connect();
        if (!socket) return;
        const handleNewJob = () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        };
        socket.on(SOCKET_EVENTS.JOB_APPLICATION_RECEIVED, handleNewJob);
        return () => { socket.off(SOCKET_EVENTS.JOB_APPLICATION_RECEIVED, handleNewJob); };
    }, [queryClient]);

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

    const handleDeleteAll = async () => {
        const confirmed = await confirm('هل أنت متأكد من حذف جميع الطلبات؟ لا يمكن التراجع عن هذا الإجراء.', {
            title: 'حذف جميع الطلبات',
            confirmText: 'حذف الكل',
            cancelText: 'تراجع',
            isDestructive: true,
            icon: <Trash2 size={28} />
        });
        if (!confirmed) return;
        try {
            for (const app of filtered) {
                await api.delete(`/jobs/${app.id}`);
            }
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

    const filtered = useMemo(() => {
        return apps.filter(a => {
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
    }, [apps, search, subjectFilter]);

    const pendingCount = useMemo(() => apps.filter(a => !a.contacted).length, [apps]);
    const contactedCount = useMemo(() => apps.filter(a => a.contacted).length, [apps]);
    const uniqueSubjects = useMemo(() => new Set(apps.map(a => a.subject).filter(Boolean)).size, [apps]);

    const kpiCards = useMemo(() => [
        { label: 'إجمالي الطلبات', value: apps.length, icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'بانتظار التواصل', value: pendingCount, icon: Inbox, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'تم التواصل', value: contactedCount, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
        { label: 'المواد', value: uniqueSubjects, icon: BookOpen, color: 'text-info', bg: 'bg-info/10' },
    ], [apps, pendingCount, contactedCount, uniqueSubjects]);

    const subjectPills = useMemo(() => [
        { key: '', label: 'الكل' },
        ...SUBJECTS.map(s => ({ key: s, label: s })),
    ], []);

    const emptySearch = !loading && filtered.length === 0 && apps.length > 0;

    return (
        <div className="min-h-full pb-8" dir="rtl">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">

                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Briefcase size={20} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-main">طلبات التوظيف</h1>
                                <p className="text-xs text-muted mt-0.5">إدارة طلبات المتقدمين للوظائف</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => exportToCsv(filtered)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-bold text-muted hover:bg-hover hover:border-primary/20 transition-all duration-200 active:scale-[0.98]">
                                <Download size={14} />
                                <span className="hidden sm:inline">تصدير</span>
                            </button>
                            <button onClick={handleDeleteAll}
                                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-bold text-error hover:bg-error/5 hover:border-error/30 transition-all duration-200 active:scale-[0.98]">
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">حذف الكل</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                        {kpiCards.map((kpi, i) => {
                            const Icon = kpi.icon;
                            return (
                                <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.04 }}
                                    whileHover={{ y: -2 }} className="bg-card border border-border rounded-xl p-4 hover:shadow-elevation-1 transition-all duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", kpi.bg)}>
                                            <Icon size={16} className={kpi.color} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-main">{kpi.value}</p>
                                    <p className="text-[11px] text-muted mt-1">{kpi.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                        {subjectPills.map(pill => (
                            <button key={pill.key} onClick={() => setSubjectFilter(pill.key)}
                                className={cn("shrink-0 px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 active:scale-[0.97]",
                                    subjectFilter === pill.key
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'bg-card border border-border text-muted hover:border-primary/30 hover:text-main')}>
                                {pill.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-5">
                    <div className="relative">
                        <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted" size={15} />
                        <input type="text" aria-label="بحث" placeholder="ابحث بالاسم أو الهاتف أو المنصب..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl py-3 ps-10 pe-4 text-xs font-bold text-main placeholder:text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200" />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors" aria-label="مسح البحث">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={`skel-${i}`} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-surface" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-3 bg-surface rounded-lg w-1/3" />
                                                <div className="h-2.5 bg-surface rounded-lg w-1/4" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[1, 2, 3, 4].map(j => <div key={j} className="h-8 bg-surface rounded-lg" />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : apps.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Briefcase size={24} className="text-primary" />
                                </div>
                                <p className="text-sm font-bold text-main mb-1">لا توجد طلبات</p>
                                <p className="text-xs text-muted">سيتم عرض طلبات المتقدمين هنا</p>
                            </motion.div>
                        ) : emptySearch ? (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Search size={24} className="text-primary" />
                                </div>
                                <p className="text-sm font-bold text-main mb-1">لا توجد نتائج</p>
                                <p className="text-xs text-muted">جرّب تغيير كلمات البحث أو الفلتر</p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {filtered.map((app, index) => (
                                    <motion.div key={app.id} layout
                                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                                        transition={{ duration: 0.2, delay: index * 0.02 }}
                                        className={cn("bg-card border border-border rounded-xl overflow-hidden hover:shadow-elevation-1 transition-all duration-200",
                                            app.contacted && 'opacity-50')}>
                                        <div className="p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                        app.contacted ? 'bg-surface border border-border' : 'bg-primary/10')}>
                                                        <span className={cn("text-sm font-bold", app.contacted ? 'text-muted' : 'text-primary')}>
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
                                                        className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95",
                                                            app.contacted
                                                                ? 'bg-success/10 text-success'
                                                                : 'bg-success/10 text-success hover:bg-success/20')}
                                                        title="تم التواصل" aria-label="تم التواصل">
                                                        <CheckCircle2 size={15} />
                                                    </button>
                                                    <button onClick={() => handleDelete(app.id)}
                                                        className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-all duration-200 active:scale-95"
                                                        aria-label="حذف الطلب">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2.5 text-xs border-t border-border pt-3">
                                                <DetailRow icon={Phone} label="الهاتف" value={app.phone} contacted={!!app.contacted} phoneLink />
                                                <DetailRow icon={MessageCircle} label="واتساب" value={app.whatsapp || '-'} contacted={!!app.contacted} phoneLink={!!app.whatsapp} whatsappLink />
                                                <DetailRow icon={GraduationCap} label="المؤهل" value={app.qualification} contacted={!!app.contacted} />
                                                <DetailRow icon={Award} label="التقدير" value={app.grade || '-'} contacted={!!app.contacted} />
                                                {app.subject && <DetailRow icon={BookMarked} label="المادة" value={app.subject} contacted={!!app.contacted} />}
                                                <DetailRow icon={Calendar} label="سنة التخرج" value={app.graduationYear || '-'} contacted={!!app.contacted} />
                                                <DetailRow icon={Globe} label="خبرة أون لاين" value={`${app.onlineYears || '0'} سنة`} contacted={!!app.contacted} />
                                                <DetailRow icon={Calendar} label="التاريخ" value={formatDateNumeric(app.createdAt)} contacted={!!app.contacted} />
                                                <div className="col-span-2 sm:col-span-4 flex items-start gap-2.5 pt-3 border-t border-border mt-1">
                                                    <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 rounded-lg">
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
        </div>
    );
};

const DetailRow = ({ icon: Icon, label, value, contacted, phoneLink, whatsappLink }: {
    icon: React.FC<{ size?: number; className?: string }>;
    label: string;
    value: string;
    contacted?: boolean;
    phoneLink?: boolean;
    whatsappLink?: boolean;
}) => {
    const cleanPhone = value.replace(/\s/g, '');
    const content = (
        <div className={cn("flex items-center gap-2", contacted && 'opacity-50')}>
            <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-primary/10 rounded-lg">
                <Icon size={10} className={contacted ? 'text-muted' : 'text-primary'} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted">{label}</p>
                <span className={cn("text-[10px] font-bold truncate block", contacted ? 'text-muted' : 'text-main')}>{value}</span>
            </div>
        </div>
    );

    if (whatsappLink && value && value !== '-') {
        return (
            <div className="flex items-center gap-1.5">
                <a href={`https://wa.me/${cleanPhone.replace(/^\+/, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-success hover:underline">
                    {content}
                </a>
            </div>
        );
    }

    if (phoneLink && value && value !== '-') {
        return (
            <a href={`tel:${cleanPhone}`} className="flex items-center gap-1">
                {content}
            </a>
        );
    }

    return content;
};
