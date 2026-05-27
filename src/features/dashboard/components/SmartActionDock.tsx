import { UserPlus, FilePlus, Calendar, Megaphone, Command } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const actions = [
  { title: 'إضافة طالب', icon: UserPlus, href: '/students?action=new', color: '#1D4ED8' },
  { title: 'إصدار فاتورة', icon: FilePlus, href: '/student-invoices?action=new', color: '#059669' },
  { title: 'الجدول', icon: Calendar, href: '/schedule', color: '#0284C7' },
  { title: 'إعلان', icon: Megaphone, href: '/announcements?action=new', color: '#D97706' },
];

export const SmartActionDock = () => {
  const handleCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] px-3 py-2" dir="rtl">
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-1">
          {actions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all",
                "text-slate-600 dark:text-slate-300",
                "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                "active:scale-[0.97]"
              )}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}12`, color: action.color }}>
                <action.icon size={15} strokeWidth={1.5} />
              </div>
              <span className="hidden sm:inline">{action.title}</span>
            </Link>
          ))}
        </div>

        <button
          onClick={handleCommandPalette}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
            "text-slate-400 dark:text-slate-500",
            "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300",
            "active:scale-[0.97]",
            "border border-dashed border-slate-200 dark:border-slate-700"
          )}
        >
          <Command size={14} strokeWidth={1.5} />
          <span className="hidden sm:inline">البحث السريع</span>
          <kbd className="hidden md:inline-flex text-[8px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 mr-1">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
};
