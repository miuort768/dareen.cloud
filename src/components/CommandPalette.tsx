import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Plus, UserPlus, FilePlus, Megaphone, Calendar, ArrowLeft, ArrowUpRight, Users, BookOpen, DollarSign, BarChart3, Settings, MessageSquare, ClipboardList, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  category: 'نقل' | 'أمر سريع' | 'بحث';
  shortcut?: string;
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const commands: CommandItem[] = [
    { id: 'add-student', label: 'إضافة طالب جديد', description: 'تسجيل طالب في النظام', icon: UserPlus, action: () => { setOpen(false); navigate('/students?action=new'); }, category: 'أمر سريع', shortcut: '⌘N' },
    { id: 'add-invoice', label: 'إصدار فاتورة', description: 'فاتورة مالية جديدة', icon: FilePlus, action: () => { setOpen(false); navigate('/student-invoices?action=new'); }, category: 'أمر سريع' },
    { id: 'add-announcement', label: 'إنشاء إعلان', description: 'بث إعلان عام', icon: Megaphone, action: () => { setOpen(false); navigate('/announcements?action=new'); }, category: 'أمر سريع' },
    { id: 'open-schedule', label: 'فتح الجدول', description: 'الجدول الأسبوعي', icon: Calendar, action: () => { setOpen(false); navigate('/schedule'); }, category: 'أمر سريع' },
    { id: 'nav-students', label: 'الطلاب', description: 'إدارة بيانات الطلاب', icon: Users, action: () => { setOpen(false); navigate('/students'); }, category: 'نقل' },
    { id: 'nav-teachers', label: 'المعلمين', description: 'إدارة بيانات المعلمات', icon: Users, action: () => { setOpen(false); navigate('/teachers'); }, category: 'نقل' },
    { id: 'nav-finance', label: 'المالية', description: 'الإيرادات والمصروفات', icon: DollarSign, action: () => { setOpen(false); navigate('/finance'); }, category: 'نقل' },
    { id: 'nav-reports', label: 'التقارير', description: 'التقارير والإحصائيات', icon: BarChart3, action: () => { setOpen(false); navigate('/reports'); }, category: 'نقل' },
    { id: 'nav-attendance', label: 'الحضور', description: 'سجل الحضور والغياب', icon: ClipboardList, action: () => { setOpen(false); navigate('/attendance'); }, category: 'نقل' },
    { id: 'nav-chat', label: 'الدردشة', description: 'مراسلة فورية', icon: MessageSquare, action: () => { setOpen(false); navigate('/chat'); }, category: 'نقل' },
    { id: 'nav-settings', label: 'الإعدادات', description: 'إعدادات النظام', icon: Settings, action: () => { setOpen(false); navigate('/settings'); }, category: 'نقل' },
    { id: 'nav-tasks', label: 'المهام', description: 'إدارة المهام والطلبات', icon: ClipboardList, action: () => { setOpen(false); navigate('/tasks'); }, category: 'نقل' },
  ];

  const filtered = query.trim()
    ? commands.filter(c => c.label.includes(query) || c.description?.includes(query))
    : commands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[activeIndex]) { filtered[activeIndex].action(); }
  };

  const getFilterIcon = (q: string) => {
    if (q.includes('طالب') || q.includes('student')) return UserPlus;
    if (q.includes('فاتورة') || q.includes('invoice') || q.includes('مال')) return FilePlus;
    if (q.includes('حصة') || q.includes('session') || q.includes('جدول')) return Calendar;
    if (q.includes('معلم') || q.includes('teacher')) return Users;
    if (q.includes('إعلان') || q.includes('اعلان') || q.includes('announce')) return Megaphone;
    return null;
  };

  const SuggestIcon = getFilterIcon(query);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden rounded-3xl"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <Search size={18} className="text-slate-400 shrink-0" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="ابحث عن طالب، فاتورة، حصة، أو أمر..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none border-none"
              />
              <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-[9px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <Command size={11} strokeWidth={1.5} />K
              </kbd>
            </div>

            <div className="max-h-[360px] overflow-y-auto py-2 px-2 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                    <Search size={20} className="text-slate-400" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-slate-500">لا توجد نتائج</p>
                  <p className="text-[10px] text-slate-400 mt-1">حاول بكلمة بحث مختلفة</p>
                </div>
              ) : (
                <div>
                  {(['أمر سريع', 'نقل'] as const).map(cat => {
                    const items = filtered.filter(c => c.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat}>
                        <div className="px-3 py-2 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {cat}
                        </div>
                        {items.map((cmd, idx) => {
                          const realIndex = filtered.indexOf(cmd);
                          return (
                            <button
                              key={cmd.id}
                              onClick={cmd.action}
                              onMouseEnter={() => setActiveIndex(realIndex)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-right transition-all",
                                activeIndex === realIndex
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              )}
                            >
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                activeIndex === realIndex
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              )}>
                                {SuggestIcon && query ? <SuggestIcon size={16} strokeWidth={1.5} /> : <cmd.icon size={16} strokeWidth={1.5} />}
                              </div>
                              <div className="flex-1 text-right min-w-0">
                                <div className="text-sm font-semibold leading-tight truncate">{cmd.label}</div>
                                {cmd.description && (
                                  <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                    {cmd.description}
                                  </div>
                                )}
                              </div>
                              <ArrowUpRight size={14} className={cn(
                                "shrink-0 transition-all",
                                activeIndex === realIndex ? 'text-blue-500 opacity-100' : 'text-slate-300 opacity-0'
                              )} strokeWidth={1.5} />
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[8px] font-medium">↑↓</kbd>
                <span>للتنقل</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[8px] font-medium">↵</kbd>
                <span>لاختيار</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mr-auto">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[8px] font-medium">Esc</kbd>
                <span>إغلاق</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
