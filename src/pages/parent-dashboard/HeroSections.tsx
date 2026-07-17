import { useNavigate } from 'react-router-dom';
import { Play, ChevronLeft, Users, MessageSquare, LayoutDashboard } from 'lucide-react';
import { LiveClasses } from '../../components/dashboard/LiveClasses';

export const ParentHeroSection = ({ navigate: nav }: { navigate: ReturnType<typeof useNavigate> }) => (
    <div className="bg-info-light rounded-card p-6 md:p-8">
        <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-info-dark">
                تعلّم بلا حدود{' '}
                <span className="inline-block border-s-4 border-current ps-1 animate-pulse">|</span>
            </h2>
            <p className="text-base font-bold text-info-dark opacity-80">من أي مكان في العالم</p>
            <p className="text-sm leading-relaxed text-info-dark opacity-70 max-w-md">
                حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.
            </p>
            <div className="flex gap-3 pt-3">
                <button onClick={() => nav('/chat')}
                    className="flex items-center gap-2 bg-primary text-on-primary text-sm font-bold px-5 py-2.5 rounded-card shadow-sm active:scale-95 transition-transform">
                    <Play size={14} fill="currentColor" />ابدأ الآن
                </button>
                <button onClick={() => nav('/courses')}
                    className="flex items-center gap-2 bg-card text-primary text-sm font-bold px-5 py-2.5 rounded-card border border-primary active:scale-95 transition-transform">
                    استكشف الدورات<ChevronLeft size={14} />
                </button>
            </div>
        </div>
    </div>
);

export const ParentMobileHeroSection = ({ navigate: nav }: { navigate: ReturnType<typeof useNavigate> }) => (
    <div className="bg-info-light rounded-card p-5">
        <div className="space-y-2">
            <h2 className="text-2xl font-black leading-tight text-info-dark">
                تعلّم بلا حدود{' '}
                <span className="inline-block border-s-4 border-current ps-0.5 animate-pulse">|</span>
            </h2>
            <p className="text-sm font-bold text-info-dark opacity-80">من أي مكان في العالم</p>
            <p className="text-xs leading-relaxed text-info-dark opacity-70 max-w-none">
                حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.
            </p>
            <div className="flex flex-row gap-2 pt-2">
                <button onClick={() => nav('/chat')}
                    className="flex items-center gap-1.5 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-card shadow-sm active:scale-95 transition-transform">
                    <Play size={12} fill="currentColor" />ابدأ الآن
                </button>
                <button onClick={() => nav('/courses')}
                    className="flex items-center gap-1.5 bg-card text-primary text-xs font-bold px-4 py-2 rounded-card border border-primary active:scale-95 transition-transform">
                    استكشف الدورات<ChevronLeft size={12} />
                </button>
            </div>
        </div>
    </div>
);

export const ParentQuickNav = ({ navigate: nav }: { navigate: ReturnType<typeof useNavigate> }) => (
    <section>
        <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h2 className="text-main text-sm font-black">التنقل السريع</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button onClick={() => nav('/parent-students')}
                className="bg-card rounded-card shadow-md p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
                <div className="w-10 h-10 bg-primary rounded-card flex items-center justify-center text-on-primary shadow-soft"><Users size={18} /></div>
                <span className="text-main text-micro font-bold">ملفات الأبناء</span>
            </button>
            <button onClick={() => nav('/forum')}
                className="bg-card rounded-card shadow-md p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
                <div className="w-10 h-10 bg-info rounded-card flex items-center justify-center text-on-info shadow-soft"><LayoutDashboard size={18} /></div>
                <span className="text-main text-micro font-bold">المنتدى</span>
            </button>
            <button onClick={() => nav('/chat')}
                className="bg-card rounded-card shadow-md p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
                <div className="w-10 h-10 bg-success rounded-card flex items-center justify-center text-on-success shadow-soft"><MessageSquare size={18} /></div>
                <span className="text-main text-micro font-bold">الدردشة</span>
            </button>
        </div>
    </section>
);

export const ParentMobileLiveClasses = () => (
    <section>
        <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h2 className="text-main text-sm font-black">البث المباشر</h2>
        </div>
        <div className="bg-card rounded-card shadow-md overflow-hidden">
            <div className="p-3.5"><LiveClasses /></div>
        </div>
    </section>
);
