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

  const isChatPage = location.pathname.includes('/chat');
  const isDashboard = location.pathname.includes('/admin-dashboard') || location.pathname.includes('/teacher-dashboard') || location.pathname.includes('/parent-dashboard');
  const isSchedule = location.pathname.includes('/schedule');
  const isTasks = location.pathname.includes('/tasks');
  const isStudentDash = location.pathname.includes('/student-dashboard');

  if (isChatPage || isDashboard || isSchedule || isTasks || isStudentDash) return null;

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-card/90 backdrop-blur-2xl border-t border-border pb-[env(safe-area-inset-bottom)] shadow-2xl">
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
                isActive && "bg-primary-soft"
              )}>
                <Icon 
                  size={24} 
                  className={cn(
                    "transition-all duration-200",
                    isActive 
                      ? "text-primary stroke-[2.5]" 
                      : "text-muted stroke-[1.5]"
                  )} 
                />
              </div>
              <span className={cn(
                "text-micro font-medium tracking-tight transition-all duration-200",
                isActive ? "text-primary" : "text-muted"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 w-6 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
