import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  MessageSquare, 
  User, 
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useApp();

  const handleNav = (path: string) => {
    // Basic Haptic Feedback simulation or native call if available
    if (window.navigator && (window.navigator as any).vibrate) {
        window.navigator.vibrate(10);
    }
    navigate(path);
  };

  const navItems = [
    {
      label: 'الرئيسية',
      icon: LayoutDashboard,
      path: currentUser?.role === 'parent' ? '/parent-dashboard' : 
            currentUser?.role === 'student' ? '/student-dashboard' : '/admin-dashboard',
    },
    {
      label: 'الجدول',
      icon: Calendar,
      path: '/schedule',
    },
    {
      label: 'المهام',
      icon: ClipboardList,
      path: '/tasks',
    },
    {
      label: 'الدردشة',
      icon: MessageSquare,
      path: '/chat',
    },
    {
      label: 'حسابي',
      icon: User,
      path: '/settings',
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300",
                isActive 
                  ? "text-red-600 dark:text-teal-400" 
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all duration-300",
                isActive && "bg-red-50 dark:bg-teal-400/10 scale-110"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold tracking-tight">
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-red-600 dark:bg-teal-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
