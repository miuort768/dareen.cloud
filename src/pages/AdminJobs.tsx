import { useState, useEffect } from 'react';
import { Briefcase, Trash2, Phone, MessageCircle, GraduationCap, Calendar, Award, Globe, BookOpen, Search, CheckCircle2, BookMarked } from 'lucide-react';
import { api } from '../lib/api';
import { ConfirmModal } from '../shared/components/ConfirmModal';

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

const allSubjects = [
    'القرآن الكريم', 'المواد الشرعية', 'اللغة العربية',
    'اللغة الإنجليزية', 'اللغة الفرنسية', 'الرياضيات',
    'الدراسات الاجتماعية', 'العلوم أو فروعها',
];

export const AdminJobs = () => {
    const [apps, setApps] = useState<JobApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const fetchApps = async () => {
        try {
            setLoading(true);
            const data = await api.get<JobApp[]>('/jobs');
            setApps(data.map(a => ({ ...a, contacted: a.contacted ? 1 : 0 })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApps(); }, []);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/jobs/${id}`);
            setApps(apps.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
        }
        setDeleteTarget(null);
    };

    const handleContacted = async (id: string) => {
        try {
            const res = await api.patch<{ contacted: boolean }>(`/jobs/${id}/contacted`);
            setApps(apps.map(a => a.id === id ? { ...a, contacted: res.contacted ? 1 : 0 } : a));
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
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl" style={{ '--color-primary': '51 27 136' } as React.CSSProperties}>
            <div className="bg-primary-600 px-4 md:px-6 py-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            <Briefcase size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white">طلبات التوظيف</h1>
                            <p className="text-[10px] font-bold text-white/70">{apps.length} طلب</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-44">
                            <BookMarked className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" size={14} />
                            <select
                                value={subjectFilter}
                                onChange={e => setSubjectFilter(e.target.value)}
                                className="w-full bg-white/15 text-white py-3 pr-10 pl-3 text-xs font-bold focus:outline-none border border-white/20 appearance-none cursor-pointer"
                            >
                                <option value="" className="text-slate-700">كل المواد</option>
                                {allSubjects.map(s => (
                                    <option key={s} value={s} className="text-slate-700">{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-1 md:w-48">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                            <input
                                type="text"
                                placeholder="بحث..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/15 text-white placeholder:text-white/50 py-3 pr-12 pl-4 text-xs font-bold focus:outline-none border border-white/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white h-32 animate-pulse border border-slate-100/50" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white border border-dashed border-slate-200 p-16 text-center">
                        <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgb(var(--color-primary) / 0.07)' }}>
                            <Briefcase size={28} style={{ color: 'rgb(var(--color-primary))' }} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">لا توجد طلبات</p>
                    </div>
                ) : (
                    filtered.map(app => (
                        <div key={app.id} className={`bg-white border border-slate-100/50 shadow-sm relative overflow-hidden group transition-all duration-300 ${
                            app.contacted ? 'opacity-40 grayscale saturate-0' : ''
                        }`}>
                            {/* Top accent bar */}
                            <div className={`h-1.5 w-full transition-colors duration-300 ${
                                app.contacted ? 'bg-slate-300' : 'bg-[#4C1670]'
                            }`}></div>

                            {/* Decorative pattern */}
                            {!app.contacted && <div className="absolute top-0 left-0 w-24 h-24 bg-[#4C1670]/5 -ml-6 -mt-6 rotate-45 pointer-events-none border border-[#4C1670]/10"></div>}

                            <div className={`p-6 relative z-10 transition-all duration-300 ${
                                app.contacted ? 'line-through decoration-1 decoration-slate-400/50' : ''
                            }`}>
                                {/* Academy branding */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-2">
                                        <Award size={14} className={app.contacted ? 'text-slate-300' : 'text-primary-500'} />
                                        <span className="font-medium text-[8px] uppercase tracking-[0.2em] text-slate-400">DAREEN ACADEMY</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleContacted(app.id)}
                                            className={`p-1.5 transition-all ${
                                                app.contacted
                                                    ? 'text-emerald-500 bg-emerald-50'
                                                    : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50:bg-emerald-500/10'
                                            }`}
                                            title="تم التواصل"
                                        >
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <button onClick={() => setDeleteTarget(app.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50:bg-rose-500/10 transition-all" aria-label="حذف الطلب">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Avatar + Name Section */}
                                <div className={`flex items-center gap-4 mb-6 p-4 rounded-lg ${
                                    app.contacted
                                        ? 'bg-slate-100'
                                        : 'bg-primary-600'
                                }`}>
                                    <div className="w-12 h-14 bg-white/20 border-2 border-white/30 flex items-center justify-center relative overflow-hidden shrink-0">
                                        <span className="text-base font-bold text-white">{app.name[0]}</span>
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/50"></div>
                                    </div>
                                    <div className="text-right">
                                        <h3 className={`text-sm font-bold ${
                                            app.contacted ? 'text-slate-500' : 'text-white'
                                        }`}>{app.name}</h3>
                                        <p className={`text-[10px] font-bold uppercase tracking-tighter mt-0.5 ${
                                            app.contacted ? 'text-slate-400' : 'text-white/80'
                                        }`}>{app.position}</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-[11px] border-t border-slate-50 pt-4">
                                    <DetailRow icon={Phone} label="الهاتف" value={app.phone} contacted={!!app.contacted} />
                                    <DetailRow icon={MessageCircle} label="واتساب" value={app.whatsapp || '-'} contacted={!!app.contacted} />
                                    <DetailRow icon={GraduationCap} label="المؤهل" value={app.qualification} contacted={!!app.contacted} />
                                    <DetailRow icon={Award} label="التقدير" value={app.grade || '-'} contacted={!!app.contacted} />
                                    {app.subject && <DetailRow icon={BookMarked} label="المادة" value={app.subject} contacted={!!app.contacted} />}
                                    <DetailRow icon={Calendar} label="سنة التخرج" value={app.graduationYear || '-'} contacted={!!app.contacted} />
                                    <DetailRow icon={Globe} label="خبرة أون لاين" value={`${app.onlineYears || '0'} سنة`} contacted={!!app.contacted} />
                                    <div className="col-span-2 md:col-span-4 flex items-start gap-2 pt-3 border-t border-slate-50 mt-1">
                                        <div className={`w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 ${
                                            app.contacted ? 'opacity-30' : ''
                                        }`} style={{ backgroundColor: 'rgb(var(--color-primary) / 0.07)' }}>
                                            <BookOpen size={10} style={{ color: app.contacted ? '#94A3B8' : 'rgb(var(--color-primary))' }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">المناهج</p>
                                            <span className={`text-[10px] font-bold ${
                                                app.contacted ? 'text-slate-300' : 'text-slate-600'
                                            }`}>{app.curriculums || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
                title="حذف الطلب"
                message="هل أنت متأكد من حذف طلب التوظيف هذا؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                cancelText="تراجع"
                isDestructive
            />
        </div>
    );
};

const DetailRow = ({ icon: Icon, label, value, contacted }: { icon: React.FC<{ size?: number; className?: string }>; label: string; value: string; contacted?: boolean }) => (
    <div className={`flex items-center gap-2 ${contacted ? 'opacity-40' : ''}`}>
        <div className="w-5 h-5 flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgb(var(--color-primary) / 0.07)' }}>
            <Icon size={10} style={{ color: contacted ? '#94A3B8' : 'rgb(var(--color-primary))' }} />
        </div>
        <div className="min-w-0">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <span className={`text-[10px] font-bold truncate block ${contacted ? 'text-slate-300' : 'text-slate-700'}`}>{value}</span>
        </div>
    </div>
);