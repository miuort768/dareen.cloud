import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Trash2, Phone, MessageCircle, GraduationCap, Calendar, Award, Globe, BookOpen, Search, CheckCircle2, BookMarked } from 'lucide-react';
import { EmptyState } from '../shared/components/ui/EmptyState';
import { api, safeArray } from '../lib/api';
import { confirm } from '../lib/confirmDialog';
import { SUBJECTS } from '../data/subjects';

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


export const AdminJobs = () => {
    useEffect(() => { document.title = 'الوظائف | دارين السابعة للتعليم والتدريب'; }, []);
    const queryClient = useQueryClient();
    const { data: apps = [], isLoading: loading } = useQuery<JobApp[]>({
        queryKey: ['jobs'],
        queryFn: () => api.get('/jobs'),
        select: (data) => safeArray<JobApp>(data).map(a => ({ ...a, contacted: a.contacted ? 1 : 0 })),
    });
    const [search, setSearch] = useState('');
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

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="mx-4 md:mx-6 mb-6 bg-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex flex-col items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-primary-soft flex items-center justify-center">
                        <Briefcase size={26} className="text-primary" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-main">طلبات التوظيف</h1>
                        <p className="text-sm font-bold text-muted mt-1">{apps.length} طلب</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                        <div className="relative flex-1">
                            <BookMarked className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            <select
                                value={subjectFilter}
                                onChange={e => setSubjectFilter(e.target.value)}
                                aria-label="تصفية حسب المادة"
                                className="w-full bg-background border border-border rounded-xl py-3.5 ps-12 pe-4 text-sm font-bold text-main focus:outline-none focus:ring-2 focus:ring-focus appearance-none cursor-pointer"
                            >
                                <option value="" className="text-main">كل المواد</option>
                                {SUBJECTS.map(s => (
                                    <option key={s} value={s} className="text-main">{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            <input
                                type="text"
                                aria-label="بحث بالاسم أو الهاتف"
                                placeholder="ابحث بالاسم أو الهاتف..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl py-3.5 ps-12 pe-4 text-sm font-bold text-main focus:outline-none focus:ring-2 focus:ring-focus placeholder:text-muted"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">{[1,2,3].map(i => <div key={`skel-${i}`} className="bg-card h-32 animate-pulse border border-border rounded-2xl" />)}</div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon={Briefcase}
                        title="لا توجد طلبات"
                        className="bg-card border-2 border-dashed border-border rounded-2xl p-6 md:p-16"
                    />
                ) : (
                    filtered.map(app => (
                        <div key={app.id} className={`bg-card rounded-2xl border border-border relative overflow-hidden group transition-all duration-300 ${
                            app.contacted ? 'opacity-40 grayscale saturate-0' : ''
                        }`}>
                            {/* Top accent bar */}
                            <div className={`h-1.5 w-full transition-colors duration-300 ${
                                app.contacted ? 'bg-card' : 'bg-primary'
                            }`}></div>

                            {/* Decorative pattern */}
                            {!app.contacted && <div className="absolute top-0 end-0 w-24 h-24 bg-primary/5 -me-6 -mt-6 rotate-45 pointer-events-none border border-primary/10"></div>}

                            <div className={`p-6 relative z-10 transition-all duration-300 ${
                                app.contacted ? 'line-through decoration-1 decoration-muted/50' : ''
                            }`}>
                                {/* Academy branding */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2">
                                        <Award size={14} className={app.contacted ? 'text-muted' : 'text-primary'} />
                                        <span className="font-semibold text-sm uppercase tracking-label text-muted">أكاديمية دارين السابعة</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleContacted(app.id)}
                                            className={`p-2 border-2 rounded-xl transition-all ${
                                                app.contacted
                                                    ? 'text-success border-success bg-success-light'
                                                    : 'text-success border-success bg-success/10 hover:bg-success-light'
                                            }`}
                                            title="تم التواصل"
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                        <button onClick={() => handleDelete(app.id)} className="p-2 border-2 border-error rounded-xl text-error bg-error/10 hover:bg-error-light transition-all" aria-label="حذف الطلب">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Avatar + Name Section */}
                                <div className={`flex items-center gap-4 mb-6 p-4 rounded-lg ${
                                    app.contacted
                                        ? 'bg-surface'
                                        : 'bg-primary'
                                }`}>
                                    <div className="w-12 h-14 bg-primary-soft rounded-xl flex items-center justify-center shrink-0">
                                        <span className="text-base font-bold text-primary">{app.name[0]}</span>
                                    </div>
                                    <div className="text-start">
                                        <h3 className={`text-sm font-bold ${
                                            app.contacted ? 'text-muted' : 'text-on-primary'
                                        }`}>{app.name}</h3>
                                        <p className={`text-micro font-bold uppercase tracking-tighter mt-0.5 ${
                                            app.contacted ? 'text-muted' : 'text-on-primary'
                                        }`}>{app.position}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-xs border-t border-border pt-4">
                                    <DetailRow icon={Phone} label="الهاتف" value={app.phone} contacted={!!app.contacted} />
                                    <DetailRow icon={MessageCircle} label="واتساب" value={app.whatsapp || '-'} contacted={!!app.contacted} />
                                    <DetailRow icon={GraduationCap} label="المؤهل" value={app.qualification} contacted={!!app.contacted} />
                                    <DetailRow icon={Award} label="التقدير" value={app.grade || '-'} contacted={!!app.contacted} />
                                    {app.subject && <DetailRow icon={BookMarked} label="المادة" value={app.subject} contacted={!!app.contacted} />}
                                    <DetailRow icon={Calendar} label="سنة التخرج" value={app.graduationYear || '-'} contacted={!!app.contacted} />
                                    <DetailRow icon={Globe} label="خبرة أون لاين" value={`${app.onlineYears || '0'} سنة`} contacted={!!app.contacted} />
                                    <div className="col-span-2 md:col-span-4 flex items-start gap-2 pt-3 border-t border-border mt-1">
                                        <div className={`w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 bg-primary-soft rounded-xl ${
                                            app.contacted ? 'opacity-30' : ''
                                        }`}>
                                            <BookOpen size={10} className={app.contacted ? 'text-muted' : 'text-primary'} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-micro font-bold text-muted uppercase tracking-widest mb-0.5">المناهج</p>
                                            <span className={`text-micro font-bold ${
                                                app.contacted ? 'text-muted' : 'text-muted'
                                            }`}>{app.curriculums || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

const DetailRow = ({ icon: Icon, label, value, contacted }: { icon: React.FC<{ size?: number; className?: string }>; label: string; value: string; contacted?: boolean }) => (
    <div className={`flex items-center gap-2 ${contacted ? 'opacity-40' : ''}`}>
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 bg-primary-soft rounded-xl">
                        <Icon size={10} className={contacted ? 'text-muted' : 'text-primary'} />
        </div>
        <div className="min-w-0">
            <p className="text-micro font-bold text-muted uppercase tracking-widest">{label}</p>
            <span className={`text-micro font-bold truncate block ${contacted ? 'text-muted' : 'text-main'}`}>{value}</span>
        </div>
    </div>
);