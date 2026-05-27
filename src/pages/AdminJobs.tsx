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
        <div className="min-h-full pb-24 overflow-x-hidden relative" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm mx-4 md:mx-8 mb-6 p-4 md:p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F59E0B12' }}>
                            <Briefcase size={24} style={{ color: '#F59E0B' }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">طلبات التوظيف</h1>
                            <p className="text-[10px] font-bold text-slate-400">{apps.length} طلب</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 py-3 pr-12 pl-4 text-xs font-bold text-slate-700 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] rounded-xl"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white dark:bg-slate-900 h-32 animate-pulse border border-slate-100/50 dark:border-slate-800/50 rounded-2xl" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 p-16 text-center rounded-2xl">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F59E0B12' }}>
                            <Briefcase size={28} style={{ color: '#F59E0B' }} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">لا توجد طلبات</p>
                    </div>
                ) : (
                    filtered.map(app => (
                        <div key={app.id} className="bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/50 shadow-sm rounded-2xl">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#F59E0B12', color: '#F59E0B' }}>
                                            {app.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{app.name}</h3>
                                            <p className="text-[10px] font-bold" style={{ color: '#F59E0B' }}>{app.position}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(app.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-xl active:scale-90">
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
                                        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#F59E0B12' }}>
                                            <BookOpen size={10} style={{ color: '#F59E0B' }} />
                                        </div>
                                        <span className="truncate">{app.curriculums || '-'}</span>
                                    </div>
                                </div>

                                <p className="text-[9px] font-bold text-slate-400 mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-800/50">
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
        <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: '#F59E0B12' }}>
            <Icon size={10} style={{ color: '#F59E0B' }} />
        </div>
        <span className="truncate font-bold">{label}</span>
    </div>
);
