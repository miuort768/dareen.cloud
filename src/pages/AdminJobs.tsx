import { useState, useEffect } from 'react';
import { Briefcase, Trash2, Phone, MessageCircle, GraduationCap, Calendar, Award, Globe, BookOpen, User, Sparkles, Search } from 'lucide-react';
import { api } from '../lib/api';
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
    created_at: string;
}

export const AdminJobs = () => {
    const [apps, setApps] = useState<JobApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchApps = async () => {
        try {
            setLoading(true);
            const data = await api.get<JobApp[]>('/jobs');
            setApps(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApps(); }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('حذف هذا الطلب؟')) return;
        try {
            await api.delete(`/jobs/${id}`);
            setApps(apps.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = apps.filter(a =>
        a.name.includes(search) || a.phone.includes(search) || a.position.includes(search)
    );

    return (
        <div className="min-h-full pb-24 overflow-x-hidden relative bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-[#020617] dark:via-slate-950 dark:to-amber-950/20 font-sans" dir="rtl">
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-800 via-amber-700 to-slate-900 dark:from-slate-950 dark:via-amber-950 dark:to-slate-950 px-6 md:px-8 py-6 mb-6 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 flex items-center justify-center border border-white/10 rounded-xl">
                            <Briefcase size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-medium text-white uppercase tracking-tighter">طلبات التوظيف</h1>
                            <p className="text-[10px] text-white/70 font-normal uppercase tracking-widest">{apps.length} طلب</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 py-3 pr-12 pl-4 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 rounded-xl"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white dark:bg-slate-900 h-32 animate-pulse border border-slate-200 dark:border-slate-800 rounded-2xl" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-16 text-center rounded-2xl">
                        <Briefcase size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">لا توجد طلبات</p>
                    </div>
                ) : (
                    filtered.map(app => (
                        <div key={app.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-900 transition-colors rounded-2xl">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 flex items-center justify-center font-medium text-amber-700 text-sm rounded-xl">
                                            {app.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-slate-900 dark:text-white text-sm">{app.name}</h3>
                                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider">{app.position}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(app.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
                                    <InfoBadge icon={Phone} label={app.phone} />
                                    <InfoBadge icon={MessageCircle} label={app.whatsapp || '-'} />
                                    <InfoBadge icon={GraduationCap} label={app.qualification} />
                                    <InfoBadge icon={Award} label={app.grade || '-'} />
                                    <InfoBadge icon={Calendar} label={app.graduationYear || '-'} />
                                    <InfoBadge icon={Globe} label={`${app.onlineYears || '0'} سنة`} />
                                    <div className="col-span-2 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <BookOpen size={12} className="shrink-0 text-amber-500" />
                                        <span className="truncate">{app.curriculums || '-'}</span>
                                    </div>
                                </div>

                                <p className="text-[9px] text-slate-400 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800">
                                    {new Date(app.created_at).toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const InfoBadge = ({ icon: Icon, label }: { icon: React.FC<{ size?: number; className?: string }>; label: string }) => (
    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
        <Icon size={12} className="shrink-0 text-amber-500" />
        <span className="truncate">{label}</span>
    </div>
);
