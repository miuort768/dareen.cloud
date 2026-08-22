import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Users,
  BookOpen,
  Star,
  User,
  Heart,
  Trophy,
  Flame,
  ChevronLeft,
  Activity,
  Edit3
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser, useLogout, useAcademyName } from '../../context/AppContext';
import { getRankByPoints, STUDENT_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { ParentDashboardHeader } from '../parent-dashboard/ParentDashboardHeader';
import type { Student } from '../../types';

interface PointLog {
  id: string;
  points?: number;
  studentName?: string;
  reason?: string;
  createdAt?: string;
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

export const ParentProfilePage = () => {
  const academyName = useAcademyName();
  useEffect(() => {
    document.title = `الملف الشخصي | ${academyName}`;
  }, [academyName]);

  const currentUser = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Student[]>([]);
  const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameOverride, setNameOverride] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const students = await api.get<Student[]>('/parents/my-children');
        if (cancelled) return;
        setChildren(students);

        const logsPromises = students.map(async s => {
          try {
            const logs = await api.get<PointLog[]>(`/student-portal/me/points-log?studentId=${s.id}`);
            return (logs || []).map(l => ({ ...l, studentName: s.name }));
          } catch { return []; }
        });
        const allLogsResults = await Promise.all(logsPromises);
        if (cancelled) return;
        setPointLogs(allLogsResults.flat());
      } catch (e) {
        console.error('Error fetching parent profile:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    if (currentUser?.role === 'parent') fetchAll();
    return () => { cancelled = true; };
  }, [currentUser]);

  const totalPoints = useMemo(() => pointLogs.reduce((s, l) => s + (l.points || 0), 0), [pointLogs]);
  const rank = getRankByPoints(totalPoints, STUDENT_RANKS);
  const nextRankNeeded = totalPoints < 1000 ? 1000 - totalPoints : 0;
  
  const childrenStats = useMemo(() => {
    return children.map(child => {
      const enrollments = child.enrollments || [];
      const totalUsed = enrollments.reduce((s, en) => s + Number(en.sessionsUsed || 0), 0);
      const totalSessions = enrollments.reduce((s, en) => s + Number(en.sessionsTotal || 0), 0);
      const progress = totalSessions > 0 ? Math.round((totalUsed / totalSessions) * 100) : 0;
      return { ...child, progress, subjectCount: enrollments.length };
    });
  }, [children]);

  const totalSubjects = children.reduce((s, c) => s + (c.enrollments?.length || 0), 0);
  const name = nameOverride || currentUser?.name || currentUser?.username || 'ولي الأمر';

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || isSavingName) return;
    setIsSavingName(true);
    try {
      await api.put('/parents/me', { name: trimmed });
      setNameOverride(trimmed);
      setEditingName(false);
    } catch (e) {
      console.error('Error updating name:', e);
    } finally {
      setIsSavingName(false);
    }
  };

  const activities = useMemo(() => {
    return pointLogs.slice(0, 5).map((l, i) => ({
      id: l.id || `log-${i}`,
      icon: <Star size={14} className="text-warning fill-warning" />,
      title: `${l.studentName || 'طالب'} حصل على ${l.points || 0} نقطة`,
      description: l.reason || 'تقدم في التعلم',
      time: l.createdAt ? new Date(l.createdAt).toLocaleDateString('ar-EG') : `منذ ${i + 1} أيام`,
    }));
  }, [pointLogs]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="hidden md:block"><ParentDashboardHeader logout={logout} /></div>
        <div className="mx-auto max-w-page p-4 md:p-8 space-y-6">
          <Skeleton className="h-40 rounded-3xl" />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-2xl xl:col-span-1" />
            <Skeleton className="h-96 rounded-2xl xl:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-24" dir="rtl">
      <div className="hidden md:block">
        <ParentDashboardHeader logout={logout} />
      </div>

      <motion.div 
        initial="initial" 
        animate="animate" 
        variants={stagger}
        className="mx-auto max-w-page px-4 pt-6 md:p-8 space-y-6 md:space-y-8"
      >
        {/* Modern ID Header */}
        <motion.div variants={item} className="relative bg-card border border-border rounded-3xl p-6 md:p-8 overflow-hidden shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="absolute top-0 end-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center gap-5 z-10 w-full md:w-auto">
            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary text-3xl font-black relative group">
              {name.charAt(0)}
              <button 
                onClick={() => { setNameDraft(name); setEditingName(true); }}
                className="absolute -bottom-2 -end-2 w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-main shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 size={12} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-border bg-surface text-muted uppercase tracking-wider">ملف العائلة</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-warning/20 bg-warning/10 text-warning flex items-center gap-1">
                  <Star size={10} className="fill-warning" />
                  {rank?.name || 'عائلة مميزة'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-main truncate">{name}</h1>
              <p className="text-sm font-bold text-muted mt-1 flex items-center gap-1.5">
                <Users size={16} />
                {children.length} {children.length === 1 ? 'ابن مسجل' : 'أبناء مسجلين'}
              </p>
            </div>
          </div>

          <div className="hidden md:block flex-1" />

          {/* Core Metrics Strip */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 z-10 bg-surface/50 p-4 md:px-8 md:py-5 rounded-2xl border border-border/50 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">النقاط العائلية</span>
              <span className="text-xl md:text-2xl font-black text-main tabular-nums">{totalPoints}</span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">إجمالي المواد</span>
              <span className="text-xl md:text-2xl font-black text-main tabular-nums">{totalSubjects}</span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">الأبناء</span>
              <span className="text-xl md:text-2xl font-black text-main tabular-nums">{children.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Sidebar (1/3) */}
          <div className="space-y-6 md:space-y-8">
            
            {/* Rank Progress */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">الترتيب العائلي</h3>
                <Trophy size={14} className="text-warning" />
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-2xl font-black text-main tabular-nums leading-none mb-1">{totalPoints}</p>
                  <p className="text-[10px] font-bold text-muted">نقطة عائلية</p>
                </div>
                {nextRankNeeded > 0 && (
                  <div className="text-end">
                    <p className="text-sm font-bold text-main leading-none mb-1">العائلة الذهبية</p>
                    <p className="text-[10px] font-bold text-muted">الرتبة القادمة</p>
                  </div>
                )}
              </div>
              
              <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${nextRankNeeded > 0 ? Math.min((totalPoints / 1000) * 100, 100) : 100}%` }}
                />
              </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-5">بيانات الحساب</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">رقم الهاتف الأساسي</p>
                    <p className="text-xs font-bold text-main">{currentUser?.username || 'غير متوفر'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <User size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">الاسم المسجل</p>
                    <p className="text-xs font-bold text-main">{name}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Top Badges */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
               <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-5">أوسمة العائلة</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2">
                     <Users size={18} className={children.length >= 2 ? "text-primary" : "text-muted opacity-50"} />
                     <span className="text-[10px] font-bold text-main">أب/أم مثالي</span>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2">
                     <BookOpen size={18} className={totalSubjects >= 5 ? "text-info" : "text-muted opacity-50"} />
                     <span className="text-[10px] font-bold text-main">متابع مميز</span>
                  </div>
               </div>
            </motion.div>

          </div>

          {/* Main Content (2/3) */}
          <div className="xl:col-span-2 space-y-6 md:space-y-8">
            
            {/* Children Cards */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-main flex items-center gap-2">
                  <Heart size={16} className="text-error fill-error/20" />
                  متابعة الأبناء
                </h3>
                {childrenStats.length > 0 && (
                  <button onClick={() => navigate('/parent-students')} className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
                    عرض التفاصيل <ChevronLeft size={12} />
                  </button>
                )}
              </div>
              
              {childrenStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {childrenStats.map((child) => (
                    <div key={child.id} className="group bg-surface border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary font-black flex items-center justify-center shrink-0">
                          {(child.name || 'ط').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-main truncate">{child.name}</h4>
                          <p className="text-[11px] font-bold text-muted mt-0.5">
                            {child.grade && <span>{child.grade} • </span>}
                            <span>{child.subjectCount} {child.subjectCount === 1 ? 'مادة' : 'مواد'}</span>
                          </p>
                        </div>
                        <div className="text-[10px] font-bold text-main tabular-nums bg-card border border-border px-2 py-1 rounded-md">
                          {child.progress}%
                        </div>
                      </div>
                      <div className="relative w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 start-0 h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(child.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface rounded-xl border border-border/50 border-dashed">
                  <Users size={24} className="text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold text-main mb-1">لا يوجد أبناء مسجلين</p>
                  <p className="text-xs text-muted">قم بإضافة أبنائك لمتابعة تقدمهم</p>
                </div>
              )}
            </motion.div>

            {/* Recent Activity Timeline */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-main flex items-center gap-2">
                  <Activity size={16} className="text-info" />
                  النشاط العائلي
                </h3>
              </div>
              
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((act, i) => (
                    <div key={act.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center z-10 relative">
                          {act.icon}
                        </div>
                        {i !== activities.length - 1 && <div className="w-px h-full bg-border mt-2" />}
                      </div>
                      <div className="pb-4">
                        <h4 className="text-sm font-bold text-main">{act.title}</h4>
                        <p className="text-[11px] font-bold text-muted mt-0.5">{act.description}</p>
                        <p className="text-[9px] text-muted mt-1 opacity-70">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface rounded-xl border border-border/50 border-dashed">
                  <Activity size={24} className="text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold text-main mb-1">لا توجد نشاطات حديثة</p>
                  <p className="text-xs text-muted">ستظهر النشاطات والنقاط المكتسبة هنا</p>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Edit name modal */}
      {editingName && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setEditingName(false)}>
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-sm font-black text-main">تعديل الاسم</h3>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
              placeholder="أدخل الاسم الجديد"
              aria-label="الاسم"
              autoFocus
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setEditingName(false)}
                className="flex-1 rounded-xl bg-surface py-3 text-xs font-bold text-muted transition-all hover:bg-hover active:scale-95"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveName}
                disabled={!nameDraft.trim() || isSavingName}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-black text-on-primary transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
              >
                {isSavingName ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
