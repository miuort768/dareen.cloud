import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, MessageSquare, User, LayoutDashboard, ClipboardList
} from 'lucide-react';
import { useCurrentUser } from '../../context/AppContext';
import { useUnreadStore } from '../../store/unreadStore';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../lib/haptics';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
    const currentUser = useCurrentUser();
  const activeConversationId = useUnreadStore(s => s.activeConversationId);

  const isChatActive = location.pathname.includes('/chat') && activeConversationId !== null;
  const isDashboard = location.pathname.includes('/admin-dashboard') || location.pathname.includes('/teacher-dashboard') || location.pathname.includes('/student-dashboard') || location.pathname.includes('/parent-dashboard');

  if (isChatActive || isDashboard) return null;

  const handleNav = (path: string) => {
    triggerHaptic('light');
    navigate(path);
  };

  const navItems = [
    {
      label: 'الرئيسية',
      icon: LayoutDashboard,
      path: currentUser?.role === 'parent' ? '/parent-dashboard' : 
            currentUser?.role === 'student' ? '/student-dashboard' : '/admin-dashboard',
    },
    { label: 'الجدول', icon: Calendar, path: '/schedule' },
    { label: 'المهام', icon: ClipboardList, path: '/tasks' },
    { label: 'الدردشة', icon: MessageSquare, path: '/chat' },
    { label: 'حسابي', icon: User, path: '/settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 pb-[env(safe-area-inset-bottom)] shadow-2xl shadow-slate-900/10">
      <div className="flex justify-around items-center h-[72px] px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200 touch-manipulation relative",
              )}
            >
              <div className={cn(
                "p-1.5 rounded-2xl transition-all duration-200",
                isActive && "bg-indigo-50 dark:bg-indigo-950/40"
              )}>
                <Icon 
                  size={24} 
                  className={cn(
                    "transition-all duration-200",
                    isActive 
                      ? "text-indigo-600 dark:text-indigo-400 stroke-[2.5]" 
                      : "text-slate-400 dark:text-slate-500 stroke-[1.5]"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium tracking-tight transition-all duration-200",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 w-6 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
