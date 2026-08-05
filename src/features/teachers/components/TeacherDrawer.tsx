import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MessageSquare, BookOpen, Users, DollarSign, Calendar, Clock, GraduationCap, Star, MessageCircle, ChevronLeft, Edit, Trash2, Bell } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CURRENCY_SYMBOL } from '../../../config/constants';
import type { Teacher } from '../../../types';

interface TeacherDrawerProps {
  teacher: Teacher | null;
  onClose: () => void;
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (id: string) => void;
  onNotify?: (teacher: Teacher) => void;
  onChat?: (id: string) => void;
  onCall?: (phone: string) => void;
  onWhatsApp?: (phone: string) => void;
  studentCount?: number;
  totalRevenue?: number;
  recentSessions?: { date: string; status: string }[];
}

const avatarGradients = [
  'from-primary to-primary-hover',
  'from-success to-success-hover',
  'from-info to-info-hover',
  'from-warning to-warning-hover',
  'from-error to-error-hover',
  'from-accent to-accent-hover',
];

const getAvatarGradient = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const subjectColorMap: Record<string, string> = {
  رياضيات: 'text-primary bg-primary/10 ring-primary/20',
  عربي: 'text-success bg-success/10 ring-success/20',
  علوم: 'text-info bg-info-soft ring-info/20',
  إنجليزي: 'text-warning bg-warning/10 ring-warning/20',
  فيزياء: 'text-accent bg-accent/10 ring-accent/20',
  كيمياء: 'text-error bg-error/10 ring-error/20',
  لغات: 'text-accent bg-accent/10 ring-accent/20',
  أدبي: 'text-warning bg-warning/10 ring-warning/20',
  دراسات: 'text-success bg-success/10 ring-success/20',
  قرآن: 'text-primary bg-primary/10 ring-primary/20',
};

const getSubjectStyle = (subject?: string) => {
  if (!subject) return 'text-muted bg-surface ring-border';
  const key = Object.keys(subjectColorMap).find(k => subject.includes(k) || k.includes(subject));
  return key ? subjectColorMap[key] : 'text-info bg-info-soft ring-info/20';
};

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  completed: { label: 'تمت', dot: 'bg-success', bg: 'bg-success/10', text: 'text-success' },
  cancelled: { label: 'ملغية', dot: 'bg-error', bg: 'bg-error/10', text: 'text-error' },
  scheduled: { label: 'مجدولة', dot: 'bg-warning', bg: 'bg-warning/10', text: 'text-warning' },
};

export const TeacherDrawer = ({ teacher, onClose, onEdit, onDelete, onNotify, onChat, onCall, onWhatsApp, studentCount = 0, totalRevenue = 0, recentSessions = [] }: TeacherDrawerProps) => {
  if (!teacher) return null;

  const gradient = getAvatarGradient(teacher.name);
  const domain = teacher.subject;
  const subjectStyle = getSubjectStyle(domain);
  const avgRating = teacher.points ? Math.min(5, Math.round((teacher.points / 20) * 10) / 10) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className="absolute end-0 top-0 bottom-0 w-full max-w-md bg-card border-s border-border shadow-elevation-3 overflow-y-auto"
          dir="rtl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border">
            <div className="flex items-center justify-between p-4">
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-surface transition-colors" aria-label="إغلاق">
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-bold text-muted">بيانات المعلمة</span>
              <div className="flex gap-1">
                {onEdit && (
                  <button onClick={() => { onEdit(teacher); onClose(); }} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-success-soft hover:text-success transition-colors" aria-label="تعديل">
                    <Edit size={14} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => { onDelete(teacher.id); onClose(); }} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-error-soft hover:text-error transition-colors" aria-label="حذف">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-4">
              <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md", gradient)}>
                <span className="text-xl font-bold text-white">{teacher.name?.charAt(0) || 'م'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-main truncate">{teacher.name}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ring-1", subjectStyle)}>
                    <BookOpen size={10} />
                    {domain}
                  </span>
                  {avgRating > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-warning/10 text-warning ring-1 ring-warning/20">
                      <Star size={10} />
                      {avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-5 border-b border-border">
            <h3 className="text-[11px] font-bold text-muted mb-3">نظرة سريعة</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Users, value: studentCount, label: 'الطلاب', color: 'text-success bg-success-soft ring-success/20' },
                { icon: DollarSign, value: `${totalRevenue.toLocaleString()}`, label: 'الإيرادات', color: 'text-warning bg-warning-soft ring-warning/20' },
                { icon: Star, value: `${avgRating.toFixed(1)}`, label: 'التقييم', color: 'text-warning bg-warning/10 ring-warning/20' },
              ].map((item, i) => (
                <div key={i} className={cn("p-3 rounded-xl ring-1 text-center", item.color)}>
                  <item.icon size={14} className="mx-auto mb-1" />
                  <p className="text-xs font-bold">{item.value}</p>
                  <p className="text-[9px] opacity-70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="p-5 border-b border-border">
            <h3 className="text-[11px] font-bold text-muted mb-3">معلومات التواصل</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface">
                <span className="text-[11px] text-muted">رقم الهاتف</span>
                <span className="text-xs font-bold text-main font-mono" dir="ltr">{teacher.phone1}</span>
              </div>
              {teacher.phone2 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface">
                  <span className="text-[11px] text-muted">هاتف آخر</span>
                  <span className="text-xs font-bold text-main font-mono" dir="ltr">{teacher.phone2}</span>
                </div>
              )}
              {teacher.email && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface">
                  <span className="text-[11px] text-muted">البريد</span>
                  <span className="text-xs font-bold text-main">{teacher.email}</span>
                </div>
              )}
              {teacher.price > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface">
                  <span className="text-[11px] text-muted">سعر الحصة</span>
                  <span className="text-xs font-bold text-success">{teacher.price} {teacher.currency || CURRENCY_SYMBOL}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 border-b border-border">
            <h3 className="text-[11px] font-bold text-muted mb-3">إجراءات سريعة</h3>
            <div className="grid grid-cols-2 gap-2">
              {onCall && (
                <button onClick={() => onCall(teacher.phone1)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-bold hover:bg-success/20 transition-all active:scale-[0.98]">
                  <Phone size={14} /> اتصال
                </button>
              )}
              {onWhatsApp && (
                <button onClick={() => onWhatsApp(teacher.phone1)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-bold hover:bg-success/20 transition-all active:scale-[0.98]">
                  <MessageSquare size={14} /> واتساب
                </button>
              )}
              {onChat && (
                <button onClick={() => { onChat(teacher.id); onClose(); }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-info-soft border border-info/20 text-info text-xs font-bold hover:bg-info/20 transition-all active:scale-[0.98]">
                  <MessageCircle size={14} /> محادثة
                </button>
              )}
              {onNotify && (
                <button onClick={() => { onNotify(teacher); onClose(); }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-warning-soft border border-warning/20 text-warning text-xs font-bold hover:bg-warning/20 transition-all active:scale-[0.98]">
                  <Bell size={14} /> إشعار
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          {recentSessions.length > 0 && (
            <div className="p-5 border-b border-border">
              <h3 className="text-[11px] font-bold text-muted mb-3">آخر النشاطات</h3>
              <div className="space-y-2">
                {recentSessions.slice(0, 5).map((sess, idx) => {
                  const sc = statusConfig[sess.status as keyof typeof statusConfig] || statusConfig.scheduled;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", sc.dot)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-main">{sc.label}</p>
                        <p className="text-[9px] text-muted">{sess.date}</p>
                      </div>
                      <Calendar size={12} className="text-muted shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Access Info */}
          {(teacher.username || teacher.password) && (
            <div className="p-5">
              <h3 className="text-[11px] font-bold text-muted mb-3">بيانات الدخول</h3>
              <div className="space-y-2">
                {teacher.username && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface">
                    <span className="text-[11px] text-muted">اسم المستخدم</span>
                    <span className="text-xs font-bold text-main font-mono">{teacher.username}</span>
                  </div>
                )}
                {teacher.password && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface">
                    <span className="text-[11px] text-muted">كلمة المرور</span>
                    <span className="text-xs font-bold text-main font-mono">{teacher.password}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};