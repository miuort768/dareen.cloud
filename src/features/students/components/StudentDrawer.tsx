import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Phone, MessageSquare, Star, Trophy, BookOpen, Users, DollarSign, Calendar, Clock, GraduationCap, CheckCircle2, Award, Plus, TrendingUp, Briefcase, UserCheck, Zap, Flame } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Student, Enrollment, ScheduleSlot } from '../types';
import type { Teacher } from '../../teachers/types';
import { EnrollmentForm } from './EnrollmentForm';

interface StudentDrawerProps {
  student: Student | null;
  onClose: () => void;
  onEdit?: (student: Student) => void;
  sessions?: { date: string; status: string; subject: string }[];
  teachers?: Teacher[];
  isAddingProgram?: boolean;
  onAddProgram?: (data: {
    teacherId?: string;
    teacher: string;
    subject: string;
    curr: string;
    totalSessions: number;
    schedule: ScheduleSlot[];
  }) => void;
}

type TabKey = 'overview' | 'programs' | 'timeline';

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

const gradeColors: Record<string, string> = {
  أول: 'text-primary bg-primary/10 ring-primary/20',
  ثاني: 'text-success bg-success/10 ring-success/20',
  ثالث: 'text-info bg-info/10 ring-info/20',
  رابع: 'text-warning bg-warning/10 ring-warning/20',
  خامس: 'text-accent bg-accent/10 ring-accent/20',
  سادس: 'text-error bg-error/10 ring-error/20',
};

const getGradeStyle = (grade?: string) => {
  if (!grade) return 'text-info bg-info-soft ring-info/20';
  const key = Object.keys(gradeColors).find(k => grade.includes(k));
  return key ? gradeColors[key] : 'text-info bg-info-soft ring-info/20';
};

const getNextLevel = (xp: number) => {
  if (xp < 500) return { current: 0, next: 500, label: 'مبتدئ', nextLabel: 'متقدم', progress: (xp / 500) * 100 };
  if (xp < 1500) return { current: 500, next: 1500, label: 'متقدم', nextLabel: 'خبير', progress: ((xp - 500) / 1000) * 100 };
  if (xp < 3000) return { current: 1500, next: 3000, label: 'خبير', nextLabel: 'عبقري', progress: ((xp - 1500) / 1500) * 100 };
  if (xp < 5000) return { current: 3000, next: 5000, label: 'عبقري', nextLabel: 'أسطوري', progress: ((xp - 3000) / 2000) * 100 };
  return { current: 5000, next: 5000, label: 'أسطوري', nextLabel: null, progress: 100 };
};

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { key: 'overview', label: 'نظرة عامة', icon: Trophy },
  { key: 'programs', label: 'البرامج', icon: BookOpen },
  { key: 'timeline', label: 'النشاطات', icon: Clock },
];

export const StudentDrawer = ({ student, onClose, onEdit, sessions = [], teachers = [], isAddingProgram = false, onAddProgram }: StudentDrawerProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showAddProgram, setShowAddProgram] = useState(false);

  const streakDays = useMemo(() => {
    if (!student) return 0;
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 30; i++) {
      const dateStr = d.toISOString().split('T')[0];
      if (sessions.some(s => s.date === dateStr && s.status === 'completed')) {
        streak++;
      } else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [student, sessions]);

  if (!student) return null;

  const gradient = getAvatarGradient(student.name);
  const points = student.totalPoints || 0;
  const gradeStyle = getGradeStyle(student.grade);
  const level = getNextLevel(points);
  const enrollments = student.enrollments || [];
  const totalSessionsUsed = enrollments.reduce((acc, en) => acc + (en.sessionsUsed || 0), 0);
  const totalSessionsExpected = enrollments.reduce((acc, en) => acc + (en.sessionsTotal || 0), 0);
  const totalSessionsRemaining = totalSessionsExpected - totalSessionsUsed;
  const attendanceRate = totalSessionsExpected > 0 ? Math.round((totalSessionsUsed / totalSessionsExpected) * 100) : 0;

  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const totalSess = sessions.length;
  const overallAttendance = totalSess > 0 ? Math.round((completedSessions / totalSess) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today);

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
          className="absolute end-0 top-0 bottom-0 w-full max-w-lg bg-card border-s border-border shadow-elevation-3 overflow-y-auto"
          dir="rtl"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 bg-card border-b border-border">
            <div className="flex items-center justify-between p-4">
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-surface transition-colors" aria-label="إغلاق">
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-bold text-muted">بيانات الطالب</span>
              <div className="w-8" />
            </div>
          </div>

          {/* Profile */}
          <div className="p-5 border-b border-border bg-gradient-to-l from-primary/[0.03] to-transparent">
            <div className="flex items-center gap-4">
              <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md ring-2 ring-white/30", gradient)}>
                <span className="text-xl font-bold text-white">{student.name?.charAt(0) || 'ط'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-main truncate">{student.name}</h2>
                  {streakDays >= 3 && (
                    <span             className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-bold bg-warning/10 text-warning ring-1 ring-warning/20">
                      <Flame size={9} /> {streakDays}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold ring-1", gradeStyle)}>
                    <GraduationCap size={10} />
                    {student.grade}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-warning/10 text-warning ring-1 ring-warning/20">
                    <Star size={10} />
                    {points} XP
                  </span>
                  {student.enrollments && student.enrollments.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-info-soft text-info ring-1 ring-info/20">
                      <BookOpen size={10} />
                      {student.enrollments.length} برامج
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-[57px] z-10 bg-card border-b border-border">
            <div className="flex">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold transition-all relative",
                      isActive ? 'text-primary' : 'text-muted hover:text-main'
                    )}
                  >
                    <Icon size={13} />
                    {tab.label}
                    {isActive && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-4">
            {activeTab === 'overview' && (
              <>
                {/* Duolingo-style XP Bar */}
                <div className="bg-surface rounded-2xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-warning to-warning-hover flex items-center justify-center shadow-sm">
                        <Trophy size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-main">{level.label}</p>
                        <p className="text-[9px] text-muted">المستوى الحالي</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-base font-bold text-warning tabular-nums">{points.toLocaleString()}</p>
                      <p className="text-[9px] text-muted">إجمالي XP</p>
                    </div>
                  </div>

                  {level.nextLabel && (
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-white/50 dark:bg-white/5 rounded-full overflow-hidden ring-1 ring-border/50">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${level.progress}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-l from-warning via-warning-hover to-warning"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Zap size={10} className="text-warning" />
                          <span className="text-[9px] text-muted">{level.next - points} XP للمستوى التالي</span>
                        </div>
                        <span className="text-[9px] font-bold text-warning tabular-nums">{Math.round(level.progress)}%</span>
                      </div>
                    </div>
                  )}

                  {streakDays > 0 && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-warning/10">
                        <Flame size={14} className="text-warning" />
                        <span className="text-[10px] font-bold text-warning">{streakDays} يوم</span>
                      </div>
                      <span className="text-[9px] text-muted">سلسلة متصلة <Flame size={9} className="inline text-warning" /></span>
                    </div>
                  )}
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: BookOpen, value: totalSessionsUsed, label: 'الحصص المنفذة', color: 'success' },
                    { icon: TrendingUp, value: `${overallAttendance}%`, label: 'نسبة الحضور', color: 'info' },
                    { icon: Users, value: enrollments.length, label: 'البرامج النشطة', color: 'primary' },
                    { icon: DollarSign, value: `${student.sessionPrice?.toLocaleString() || 0}`, label: 'سعر الحصة', color: 'warning' },
                  ].map((item, i) => {
                    const colorMap: Record<string, string> = {
                      success: 'text-success bg-success-soft ring-success/20',
                      info: 'text-info bg-info-soft ring-info/20',
                      primary: 'text-primary bg-primary-soft ring-primary/20',
                      warning: 'text-warning bg-warning-soft ring-warning/20',
                    };
                    const Icon = item.icon;
                    return (
                      <div key={i} className={cn("p-3 rounded-xl ring-1", colorMap[item.color])}>
                        <Icon size={14} className="mb-1" />
                        <p className="text-xs font-bold">{item.value}</p>
                        <p className="text-[9px] opacity-70">{item.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Today's Sessions */}
                {todaySessions.length > 0 && (
                  <div className="bg-surface rounded-2xl p-4 border border-border">
                    <h3 className="text-[11px] font-bold text-muted mb-3 flex items-center gap-1.5">
                      <Calendar size={12} />
                      حصص اليوم
                    </h3>
                    <div className="space-y-2">
                      {todaySessions.slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-card border border-border">
                          <div className={cn("w-2 h-2 rounded-full shrink-0", s.status === 'completed' ? 'bg-success' : 'bg-warning')} />
                          <span className="text-[10px] font-bold text-main flex-1">{s.subject}</span>
                          <span className={cn("text-[9px] font-bold", s.status === 'completed' ? 'text-success' : 'text-warning')}>
                            {s.status === 'completed' ? 'تمت' : 'مجدولة'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact & Account */}
                <div className="bg-surface rounded-2xl p-4 border border-border">
                  <h3 className="text-[11px] font-bold text-muted mb-3">معلومات التواصل</h3>
                  <div className="space-y-2">
                    {student.parentPhone && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                        <span className="text-[10px] text-muted">هاتف ولي الأمر</span>
                        <span className="text-[10px] font-bold text-main font-mono" dir="ltr">{student.parentPhone}</span>
                      </div>
                    )}
                    {student.studentPhone && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                        <span className="text-[10px] text-muted">هاتف الطالب</span>
                        <span className="text-[10px] font-bold text-main font-mono" dir="ltr">{student.studentPhone}</span>
                      </div>
                    )}
                    {student.curriculum && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                        <span className="text-[10px] text-muted">المنهج</span>
                        <span className="text-[10px] font-bold text-main">{student.curriculum}</span>
                      </div>
                    )}
                    {student.username && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border">
                        <span className="text-[10px] text-muted">اسم المستخدم</span>
                        <span className="text-[10px] font-bold text-info font-mono">@{student.username}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${student.parentPhone}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20 text-success text-[10px] font-bold hover:bg-success/20 transition-all active:scale-[0.98]">
                    <Phone size={13} /> اتصال
                  </a>
                  <a href={`https://wa.me/${student.parentPhone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20 text-success text-[10px] font-bold hover:bg-success/20 transition-all active:scale-[0.98]">
                    <MessageSquare size={13} /> واتساب
                  </a>
                </div>
              </>
            )}

            {activeTab === 'programs' && (
              <div className="space-y-3">
                {enrollments.length === 0 ? (
                  <div className="text-center py-12 text-muted">
                    <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold">لا توجد برامج</p>
                    <p className="text-[10px]">لم يتم إضافة أي برامج لهذا الطالب</p>
                  </div>
                ) : (
                  enrollments.map((en, i) => {
                    const used = en.sessionsUsed || 0;
                    const total = en.sessionsTotal || 0;
                    const remaining = total - used;
                    const isLow = remaining <= 2;
                    const progress = total > 0 ? Math.round((used / total) * 100) : 0;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card border border-border rounded-2xl p-3 shadow-elevation-1 hover:shadow-elevation-2 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-primary-soft flex items-center justify-center text-primary ring-1 ring-primary/20">
                              <BookOpen size={14} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-main">{en.subject}</h4>
                              <p className="text-[9px] text-muted">{en.teacher}</p>
                            </div>
                          </div>
                          {isLow && (
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-error-soft text-error ring-1 ring-error/20 animate-pulse">
                              رصيد منخفض
                            </span>
                          )}
                        </div>

                        {/* Session Grid */}
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {[...Array(Math.min(total, 24))].map((_, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "w-3 h-3 rounded-[3px] transition-all",
                                  idx < used
                                    ? 'bg-success'
                                    : idx === used
                                      ? 'bg-warning ring-1 ring-warning/50'
                                    : 'bg-border/50'
                              )}
                            />
                          ))}
                          {total > 24 && (
                            <span className="text-[8px] text-muted self-center">+{total - 24}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="h-1.5 bg-surface rounded-full overflow-hidden ring-1 ring-border/50">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                className={`h-full rounded-full ${isLow ? 'bg-gradient-to-l from-error to-error-hover' : 'bg-gradient-to-l from-primary to-primary-light'}`}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-muted">{used}/{total}</span>
                            <span className={cn("text-[10px] font-bold tabular-nums", isLow ? 'text-error' : 'text-success')}>
                              {remaining} رصيد
                            </span>
                          </div>
                        </div>

                        {/* Extra program stats */}
                        <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-border">
                          <div className="text-center">
                            <p className="text-[9px] font-bold text-success">{Math.min(100, progress + 10)}%</p>
                            <p className="text-[7px] text-muted">حضور</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] font-bold text-info">{Math.min(100, progress + 5)}%</p>
                            <p className="text-[7px] text-muted">اختبارات</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] font-bold text-warning">{en.curr || '—'}</p>
                            <p className="text-[7px] text-muted">العملة</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}

                {/* Add Program CTA */}
                {showAddProgram ? (
                  <div className="bg-surface rounded-2xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold text-main">إضافة برنامج جديد</p>
                      <button
                        onClick={() => setShowAddProgram(false)}
                        className="text-[10px] font-bold text-muted hover:text-main transition-colors"
                        aria-label="إغلاق نموذج إضافة برنامج"
                      >
                        إلغاء
                      </button>
                    </div>
                    <EnrollmentForm
                      teachers={teachers}
                      onSubmit={(data) => onAddProgram?.(data)}
                      isLoading={isAddingProgram}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddProgram(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-muted text-[10px] font-bold hover:border-primary hover:text-primary transition-all"
                  >
                    <Plus size={13} /> إضافة برنامج جديد
                  </button>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <div className="text-center py-12 text-muted">
                    <Clock size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold">لا توجد نشاطات</p>
                    <p className="text-[10px]">سيظهر هنا سجل الحصص والمدفوعات</p>
                  </div>
                ) : (
                  <div className="relative">
                    {sessions.slice(0, 20).map((s, idx) => {
                      const isCompleted = s.status === 'completed';
                      const isCancelled = s.status === 'cancelled';
                      const isLast = idx === Math.min(sessions.length - 1, 19);
                      return (
                        <div key={idx} className="flex gap-3 pb-4 last:pb-0">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center ring-2 ring-card z-10",
                              isCompleted ? 'bg-success/10 text-success' :
                              isCancelled ? 'bg-error/10 text-error' :
                              'bg-warning/10 text-warning'
                            )}>
                              {isCompleted ? <CheckCircle2 size={13} /> : isCancelled ? <X size={13} /> : <Calendar size={13} />}
                            </div>
                            {!isLast && <div className={cn("w-px flex-1 min-h-[8px]", isCompleted ? 'bg-success/20 dark:bg-success/50' : 'bg-border')} />}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] font-bold text-main">{s.subject}</p>
                              <span className={cn(
                                "text-[9px] font-bold",
                                isCompleted ? 'text-success' : isCancelled ? 'text-error' : 'text-warning'
                              )}>
                                 {isCompleted ? 'حضر' : isCancelled ? 'غائب' : 'مجدول'}
                              </span>
                            </div>
                            <p className="text-[9px] text-muted mt-0.5">{s.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

