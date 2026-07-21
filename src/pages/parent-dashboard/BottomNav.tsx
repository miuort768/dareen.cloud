import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Star, LayoutDashboard, BookOpen, MoreHorizontal
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ParentBottomNav = () => {
    const navigate = useNavigate();
    return (
        <div className="block md:hidden fixed bottom-0 end-0 start-0 z-50">
            <div className="h-2 bg-white dark:bg-black" />
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 shadow-2xl shadow-black/5 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-around h-[68px] px-2">
                    {[
                        { id: 'profile', label: 'حسابي', icon: User },
                        { id: 'favorites', label: 'المفضلة', icon: Star },
                        { id: 'home', label: 'الرئيسية', icon: LayoutDashboard, isCenter: true },
                        { id: 'files', label: 'ملفاتي', icon: BookOpen },
                        { id: 'more', label: 'المزيد', icon: MoreHorizontal },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === 'home';
                        const isCenter = item.isCenter;
                        return (
                            <motion.button key={item.id} whileTap={{ scale: 0.9 }} onClick={() => {
                                if (item.id === 'home') { navigate('/parent-dashboard') }
                                else if (item.id === 'profile') { navigate('/parent-dashboard') }
                                else if (item.id === 'favorites') { navigate('/schedule') }
                                else if (item.id === 'files') { navigate('/parent-students') }
                                else if (item.id === 'more') { navigate('/forum') }
                            }}
                                className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation relative ${isCenter ? 'w-14 h-14 -mt-6' : 'w-full h-full'}`}>
                                {isCenter ? (
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Icon size={26} className="text-white" />
                                    </div>
                                ) : (
                                    <>
                                        <div className={cn("rounded-xl p-1.5 transition-all duration-300", isActive && "bg-gradient-to-br from-primary/10 to-purple-500/10")}>
                                            <Icon size={20}
                                                className={cn("transition-colors duration-300", isActive ? "text-primary" : "text-muted")}
                                                strokeWidth={isActive ? 2.5 : 1.5} />
                                        </div>
                                        <span className={cn("text-[10px] font-bold transition-all duration-300", isActive ? "text-primary" : "text-muted")}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
