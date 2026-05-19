import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  User, 
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useChatStore } from '../../store/chatStore';
import { cn } from '../../lib/utils';
import { triggerHaptic } from '../../lib/haptics';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useApp();
  const activeConversationId = useChatStore(s => s.activeConversationId);

  const isChatActive = location.pathname.includes('/chat') && activeConversationId !== null;

  if (isChatActive) {
    return null;
  }

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
      <div className="flex justify-around items-center h-[82px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-2 transition-all duration-300 touch-manipulation",
                isActive 
                  ? "text-red-600 dark:text-teal-400" 
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive && "bg-red-50 dark:bg-teal-400/10 scale-110"
              )}>
                <Icon size={32} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[11px] font-black tracking-tight">
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
