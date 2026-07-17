import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Library, MoreHorizontal } from 'lucide-react';

interface MobileBottomNavProps {
    activeNav: string;
    setActiveNav: (v: string) => void;
}

const navItems = [
    { id: 'more', label: 'المزيد', icon: MoreHorizontal, path: '/forum' },
    { id: 'profile', label: 'الملف الشخصي', icon: User, path: '/student-dashboard' },
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/student-dashboard', isCenter: true },
    { id: 'library', label: 'مكتبة الدورات', icon: Library, path: '/schedule' },
    { id: 'main', label: 'الرئيسية', icon: Home, path: '/' },
];

export const MobileBottomNav = ({ activeNav, setActiveNav }: MobileBottomNavProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 end-0 start-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)] shadow-soft">
            <div className="flex items-center justify-around h-[68px] px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.id === 'home' && location.pathname.includes('student-dashboard'));
                    const isCenter = item.isCenter;
                    return (
                        <button key={item.id} onClick={() => { setActiveNav(item.id); navigate(item.path); }}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 touch-manipulation relative ${isCenter ? 'w-14 h-14 -mt-6' : 'w-full h-full'}`}>
                            {isCenter ? (
                                <div className="w-14 h-14 bg-primary rounded-card flex items-center justify-center shadow-soft">
                                    <Icon size={26} className="text-on-primary" />
                                </div>
                            ) : (
                                <>
                                    <Icon size={22}
                                        className={`transition-all duration-200 ${isActive ? 'text-primary' : 'text-dim'}`}
                                        strokeWidth={isActive ? 2.5 : 1.5} />
                                    <span className={`text-micro font-semibold transition-all duration-200 ${isActive ? 'text-primary' : 'text-dim'}`}>
                                        {item.label}
                                    </span>
                                    {isActive && <div className="absolute top-0 end-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-card" />}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
