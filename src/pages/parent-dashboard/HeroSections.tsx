import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, Users, MessageSquare, LayoutDashboard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LiveClasses } from '../../components/dashboard/LiveClasses';

const glass = "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/[0.03]";

export const ParentHeroSection = ({ navigate: nav }: { navigate: ReturnType<typeof useNavigate> }) => (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-info to-blue-600 p-6 md:p-8 shadow-lg shadow-info/20">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative z-10 space-y-3">
            <h2 className="text-3xl md:text-4xl font-black leading-tight text-white">
                تعلّم بلا حدود{' '}
                <span className="inline-block border-s-4 border-current ps-1 animate-pulse">|</span>
            </h2>
            <p className="text-base font-bold text-white/80">من أي مكان في العالم</p>
            <p className="text-sm leading-relaxed text-white/70 max-w-md">
                حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.
            </p>
            <div className="flex gap-3 pt-3">
                <button onClick={() => nav('/chat')}
                    className="flex items-center gap-2 bg-white text-info text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-transform">
                    <Play size={14} fill="currentColor" />ابدأ الآن
                </button>
                <button onClick={() => nav('/courses')}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-bold px-5 py-2.5 rounded-xl border border-white/30 active:scale-95 transition-transform">
                    استكشف الدورات<ChevronLeft size={14} />
                </button>
            </div>
        </div>
    </div>
);

export const ParentMobileHeroSection = ({ navigate: nav }: { navigate: ReturnType<typeof useNavigate> }) => (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-info to-blue-600 p-5 shadow-lg shadow-info/20">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        <div className="relative z-10 space-y-2">
            <h2 className="text-2xl font-black leading-tight text-white">
                تعلّم بلا حدود{' '}
                <span className="inline-block border-s-4 border-current ps-0.5 animate-pulse">|</span>
            </h2>
            <p className="text-sm font-bold text-white/80">من أي مكان في العالم</p>
            <p className="text-xs leading-relaxed text-white/70 max-w-none">
                حصص تفاعلية مباشرة مع أفضل المعلمين، متابعة دورية، وتقارير مفصلة لأولياء الأمور.
            </p>
            <div className="flex flex-row gap-2 pt-2">
                <button onClick={() => nav('/chat')}
                    className="flex items-center gap-1.5 bg-white text-info text-xs font-bold px-4 py-2 rounded-xl shadow-lg active:scale-95 transition-transform">
                    <Play size={12} fill="currentColor" />ابدأ الآن
                </button>
                <button onClick={() => nav('/courses')}
                    className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/30 active:scale-95 transition-transform">
                    استكشف الدورات<ChevronLeft size={12} />
                </button>
            </div>
        </div>
    </div>
);

export const ParentQuickNav = ({ navigate: nav }: { navigate: ReturnType<typeof useNavigate> }) => (
    <section>
        <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-4 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
            <h2 className="text-main text-sm font-black">التنقل السريع</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => nav('/parent-students')}
                className={cn(glass, "p-3 flex flex-col items-center gap-1.5")}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20"><Users size={18} className="text-white" /></div>
                <span className="text-main text-micro font-bold">ملفات الأبناء</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => nav('/forum')}
                className={cn(glass, "p-3 flex flex-col items-center gap-1.5")}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-blue-500 flex items-center justify-center shadow-lg shadow-info/20"><LayoutDashboard size={18} className="text-white" /></div>
                <span className="text-main text-micro font-bold">المنتدى</span>
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => nav('/chat')}
                className={cn(glass, "p-3 flex flex-col items-center gap-1.5")}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-emerald-500 flex items-center justify-center shadow-lg shadow-success/20"><MessageSquare size={18} className="text-white" /></div>
                <span className="text-main text-micro font-bold">الدردشة</span>
            </motion.button>
        </div>
    </section>
);

export const ParentMobileLiveClasses = () => (
    <section>
        <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1 h-4 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
            <h2 className="text-main text-sm font-black">البث المباشر</h2>
        </div>
        <div className={cn(glass, "overflow-hidden")}>
            <div className="p-3.5"><LiveClasses /></div>
        </div>
    </section>
);