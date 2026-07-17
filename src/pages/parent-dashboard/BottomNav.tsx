import { useNavigate } from 'react-router-dom';
import {
    User, Star, LayoutDashboard, BookOpen, MoreHorizontal
} from 'lucide-react';

export const ParentBottomNav = () => {
    const navigate = useNavigate();
    return (
        <div className="block md:hidden fixed bottom-0 end-0 start-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] shadow-soft">
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
                        <button key={item.id} onClick={() => {
                            if (item.id === 'home') { navigate('/parent-dashboard') }
                            else if (item.id === 'profile') { navigate('/parent-dashboard') }
                            else if (item.id === 'favorites') { navigate('/schedule') }
                            else if (item.id === 'files') { navigate('/parent-students') }
                            else if (item.id === 'more') { navigate('/forum') }
                        }}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation relative ${isCenter ? 'w-14 h-14 -mt-6' : 'w-full h-full'}`}>
                            {isCenter ? (
                                <div className="w-14 h-14 bg-primary rounded-card flex items-center justify-center shadow-soft">
                                    <Icon size={26} className="text-on-primary" />
                                </div>
                            ) : (
                                <>
                                    <Icon size={22}
                                        className={`transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted'}`}
                                        strokeWidth={isActive ? 2.5 : 1.5} />
                                    <span className={`text-micro font-semibold transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted'}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
