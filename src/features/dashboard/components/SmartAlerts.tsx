import { useState, useMemo } from 'react';
import { Bell, Zap, AlertTriangle, Info, Flame, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { sendWhatsAppReminder } from '../../../shared/utils/reminders';
import { useAdminPhone } from '../../../context/AppContext';
import type { DashboardTask, LowBalanceStudent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartAlertsProps {
  tasks: DashboardTask[];
  lowBalanceStudents: LowBalanceStudent[];
  students: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  studentInvoices: Record<string, unknown>[];
}

type AlertPriority = 'urgent' | 'followup' | 'info';

interface AlertItem {
  id: string;
  priority: AlertPriority;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action?: () => void;
  link?: string;
  actionLabel?: string;
}

export const SmartAlerts = ({ tasks, lowBalanceStudents, students, sessions, studentInvoices }: SmartAlertsProps) => {
  const adminPhone = useAdminPhone();
  const navigate = useNavigate();
  const [activePriority, setActivePriority] = useState<AlertPriority>('urgent');

  const alerts = useMemo(() => {
    const result: AlertItem[] = [];

    lowBalanceStudents.forEach(s => {
      if (s.remainingSessions <= 1) {
        result.push({
          id: `urgent-${s.id}`,
          priority: 'urgent',
          title: s.studentName,
          description: `${s.subject} — باقي ${s.remainingSessions === 0 ? 'صفر جلسة' : 'جلسة واحدة'}`,
          icon: Flame,
          action: () => sendWhatsAppReminder(s, undefined, adminPhone),
          actionLabel: 'واتساب'
        });
      }
    });

    lowBalanceStudents.filter(s => s.remainingSessions === 2).forEach(s => {
      result.push({
        id: `follow-${s.id}`,
        priority: 'followup',
        title: s.studentName,
        description: `${s.subject} — ${s.remainingSessions} جلسات متبقية`,
        icon: AlertTriangle,
        action: () => sendWhatsAppReminder(s, undefined, adminPhone),
        actionLabel: 'واتساب'
      });
    });

    students.forEach(s => {
      const studentSessions = sessions.filter(ss => ss.studentId === s.id);
      if (studentSessions.length < 3) return;
      const absent = studentSessions.filter(ss => ss.status === 'cancelled').length;
      const rate = (absent / studentSessions.length) * 100;
      if (rate > 30) {
        result.push({
          id: `absent-${s.id}`,
          priority: 'followup',
          title: s.name as string,
          description: `نسبة غياب ${Math.round(rate)}%`,
          icon: AlertTriangle,
          action: () => navigate('/attendance'),
          actionLabel: 'عرض'
        });
      }
    });

    const overdueCount = studentInvoices.filter(inv => {
      if (!['unpaid', 'pending', 'overdue'].includes((inv.status as string)?.toLowerCase())) return false;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const created = new Date((inv.date || inv.created_at || 0) as string).getTime();
      return (Date.now() - created) > sevenDays;
    }).length;

    if (overdueCount > 0) {
      result.push({
        id: 'overdue-invoices',
        priority: 'info',
        title: `${overdueCount} فواتير متأخرة`,
        description: 'مطلوب تحصيل مالي عاجل',
        icon: Info,
        link: '/student-invoices'
      });
    }

    tasks.filter(t => ['high', 'عالية', 'urgent', 'عاجل'].includes(t.priority?.toLowerCase())).forEach(t => {
      result.push({
        id: `task-${t.id}`,
        priority: 'urgent',
        title: t.title,
        description: `تاريخ: ${t.dueDate}`,
        icon: Zap,
        link: '/tasks'
      });
    });

    return result.sort((a) => (a.priority === 'urgent' ? -1 : a.priority === 'followup' ? 0 : 1));
  }, [tasks, lowBalanceStudents, students, sessions, studentInvoices, navigate, adminPhone]);

  const filteredAlerts = alerts.filter(a => a.priority === activePriority);

  const priorityMeta: Record<AlertPriority, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; borderColor: string; dotColor: string; count: number }> = {
    urgent: {
      label: 'عاجل',
      icon: Flame,
      borderColor: 'border-r-rose-400 dark:border-r-rose-500',
      dotColor: 'bg-rose-500',
      count: alerts.filter(a => a.priority === 'urgent').length
    },
    followup: {
      label: 'متابعة',
      icon: AlertTriangle,
      borderColor: 'border-r-amber-400 dark:border-r-amber-500',
      dotColor: 'bg-amber-500',
      count: alerts.filter(a => a.priority === 'followup').length
    },
    info: {
      label: 'معلومات',
      icon: Info,
      borderColor: 'border-r-blue-400 dark:border-r-blue-500',
      dotColor: 'bg-blue-500',
      count: alerts.filter(a => a.priority === 'info').length
    }
  };

  const tabs: { key: AlertPriority }[] = [
    { key: 'urgent' },
    { key: 'followup' },
    { key: 'info' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden" dir="rtl">
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center">
            <Bell size={16} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">التنبيهات الذكية</h3>
            <p className="text-[9px] font-medium text-slate-400">أهم ما يحتاج انتباهك</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-3">
        <div className="flex gap-1.5 border-b border-slate-100 dark:border-slate-800">
          {tabs.map(({ key }) => {
            const meta = priorityMeta[key];
            const isActive = activePriority === key;
            return (
              <button
                key={key}
                onClick={() => setActivePriority(key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-semibold transition-all relative",
                  isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full", meta.dotColor)} />
                {meta.label}
                {meta.count > 0 && (
                  <span className={cn(
                    "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                    key === 'urgent' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                    key === 'followup' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  )}>
                    {meta.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="alert-indicator"
                    className="absolute bottom-0 right-0 left-0 h-0.5 bg-slate-900 dark:bg-white rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePriority}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 min-h-[120px]"
          >
            {filteredAlerts.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 mx-auto bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-2">
                  <Bell size={18} className="text-slate-300" strokeWidth={1.5} />
                </div>
                <p className="text-xs font-medium text-slate-400">لا توجد تنبيهات</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center justify-between py-3 px-4 border-r-4 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-xl",
                    priorityMeta[alert.priority].borderColor
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      alert.priority === 'urgent' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' :
                      alert.priority === 'followup' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' :
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                    )}>
                      <alert.icon size={14} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{alert.title}</div>
                      <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">{alert.description}</div>
                    </div>
                  </div>
                  {alert.actionLabel === 'واتساب' ? (
                    <button onClick={alert.action} className="h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded-xl transition-all whitespace-nowrap shrink-0">
                      واتساب
                    </button>
                  ) : alert.link ? (
                    <Link to={alert.link} className="h-7 px-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[9px] font-bold rounded-xl transition-all flex items-center gap-1 shrink-0">
                      عرض
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
