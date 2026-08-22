import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Target,
  Star,
  Phone,
  User,
  CalendarDays,
  Play,
  Flame,
  CheckCircle2,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser, useLogout, useAcademyName } from '../../context/AppContext';
import { getRankByPoints, getNextRank, STUDENT_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { StudentDashboardHeader } from '../student-dashboard/StudentDashboardHeader';

interface StudentData {
  id?: string;
  name?: string;
  grade?: string;
  curriculum?: string;
  totalPoints?: number;
  parentPhone?: string;
  studentPhone?: string;
  email?: string;
  city?: string;
  enrollments?: {
    id?: string;
    subject?: string;
    teacherName?: string;
    teacher?: string;
    sessionsUsed?: number;
    sessionsTotal?: number;
  }[];
  [key: string]: unknown;
}

interface Session {
  id?: string;
  status: string;
  subject?: string;
  teacherName?: string;
  date?: string;
  duration?: number;
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
};
const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

export const StudentProfilePage = () => {
  const academyName = useAcademyName();
  useEffect(() => {
    document.title = `الملف الشخصي | ${academyName}`;
  }, [academyName]);
  
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [meRes, sessionsRes] = await Promise.all([
          api.get<StudentData>('/student-portal/me'),
          api.get<Session[]>('/student-portal/me/sessions'),
        ]);
        if (cancelled) return;
        setStudentData(meRes);
        setSessions(sessionsRes);
      } catch (e) {
        console.error('Error fetching profile:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    if (currentUser?.role === 'student') fetchAll();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const enrollments = useMemo(() => studentData?.enrollments || [], [studentData?.enrollments]);
  const points = studentData?.totalPoints || 0;
  const rank = getRankByPoints(points, STUDENT_RANKS);
  const nextRank = getNextRank(points, STUDENT_RANKS);

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'completed').length;
    const cancelled = sessions.filter((s) => s.status === 'cancelled').length;
    const totalRecorded = completed + cancelled;
    let sessionsUsed = 0, sessionsTotal = 0;
    enrollments.forEach((en) => {
      sessionsUsed += Number(en.sessionsUsed || 0);
      sessionsTotal += Number(en.sessionsTotal || 0);
    });
    return {
      attendanceRate: totalRecorded > 0 ? Math.round((completed / totalRecorded) * 100) : 0,
      curriculumProgress: sessionsTotal > 0 ? Math.round((sessionsUsed / sessionsTotal) * 100) : 0,
      totalSessions: totalRecorded,
      completedSessions: completed,
      totalSubjects: enrollments.length,
      sessionsUsed,
      sessionsTotal,
    };
  }, [sessions, enrollments]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="hidden md:block"><StudentDashboardHeader logout={logout} /></div>
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

  const name = studentData?.name || currentUser?.name || 'الطالب';
  const recentSessions = sessions.filter(s => s.status === 'completed').slice(0, 4);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-24" dir="rtl">
      <div className="hidden md:block">
        <StudentDashboardHeader logout={logout} />
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
            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl bg-primary-soft border border-primary/20 flex items-center justify-center text-primary text-3xl font-black">
              {name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-border bg-surface text-muted uppercase tracking-wider">الملف الشخصي</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-warning/20 bg-warning/10 text-warning flex items-center gap-1">
                  <Trophy size={10} />
                  {rank?.name}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-main truncate">{name}</h1>
              <p className="text-sm font-bold text-muted mt-1 flex items-center gap-1.5">
                <GraduationCap size={16} />
                {studentData?.grade || 'غير محدد'} {studentData?.curriculum ? `• ${studentData.curriculum}` : ''}
              </p>
            </div>
          </div>

          <div className="hidden md:block flex-1" />

          {/* Core Metrics Strip */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 z-10 bg-surface/50 p-4 md:px-8 md:py-5 rounded-2xl border border-border/50 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">النقاط</span>
              <span className="text-xl md:text-2xl font-black text-main tabular-nums">{points}</span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">المواد</span>
              <span className="text-xl md:text-2xl font-black text-main tabular-nums">{stats.totalSubjects}</span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">الالتزام</span>
              <span className="text-xl md:text-2xl font-black text-success tabular-nums">{stats.attendanceRate}%</span>
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
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider">تقدم الرتبة</h3>
                <Target size={14} className="text-muted" />
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-2xl font-black text-main tabular-nums leading-none mb-1">{points}</p>
                  <p className="text-[10px] font-bold text-muted">نقطة حالية</p>
                </div>
                {nextRank.next && (
                  <div className="text-end">
                    <p className="text-sm font-bold text-main leading-none mb-1">{nextRank.next.name}</p>
                    <p className="text-[10px] font-bold text-muted">الرتبة القادمة</p>
                  </div>
                )}
              </div>
              
              <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${nextRank.next ? Math.min((points / (points + (nextRank.pointsNeeded || 1))) * 100, 100) : 100}%` }}
                />
              </div>
              
              {nextRank.next && (
                <p className="text-[10px] font-bold text-primary mt-3 text-center bg-primary-soft py-1.5 rounded-lg">
                  تبقى {nextRank.pointsNeeded} نقطة للترقية
                </p>
              )}
            </motion.div>

            {/* Contact Details */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-5">بيانات الاتصال</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">رقم الطالب</p>
                    <p className="text-xs font-bold text-main">{studentData?.studentPhone || 'غير متوفر'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <User size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">رقم ولي الأمر</p>
                    <p className="text-xs font-bold text-main">{studentData?.parentPhone || 'غير متوفر'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">البريد الإلكتروني</p>
                    <p className="text-xs font-bold text-main truncate max-w-[200px]">{studentData?.email || 'غير متوفر'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">المدينة</p>
                    <p className="text-xs font-bold text-main">{studentData?.city || 'غير متوفر'}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Badges Overview */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
               <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-5">الأوسمة النشطة</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2">
                     <Flame size={18} className={stats.attendanceRate >= 95 ? "text-error" : "text-muted opacity-50"} />
                     <span className="text-[10px] font-bold text-main">أسبوع مثالي</span>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2">
                     <Play size={18} className={stats.completedSessions >= 50 ? "text-success" : "text-muted opacity-50"} />
                     <span className="text-[10px] font-bold text-main">50 حصة</span>
                  </div>
               </div>
            </motion.div>

          </div>

          {/* Main Content (2/3) */}
          <div className="xl:col-span-2 space-y-6 md:space-y-8">
            
            {/* Enrollments / Subjects */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-main flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  التقدم الدراسي
                </h3>
                <span className="text-xs font-bold text-muted">{enrollments.length} مواد مسجلة</span>
              </div>
              
              {enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrollments.map((en, idx) => {
                    const used = Number(en.sessionsUsed || 0);
                    const total = Number(en.sessionsTotal || 0);
                    const progress = total > 0 ? Math.round((used / total) * 100) : 0;
                    
                    return (
                      <div key={en.id || idx} className="group bg-surface border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-sm font-black text-main mb-1">{en.subject || 'مادة'}</h4>
                            <p className="text-[11px] font-bold text-muted">{en.teacherName || en.teacher || 'معلم غير محدد'}</p>
                          </div>
                          <div className="bg-card border border-border px-2 py-1 rounded-md">
                            <span className="text-[10px] font-bold text-main tabular-nums">{used} / {total} حصة</span>
                          </div>
                        </div>
                        
                        <div className="relative w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 start-0 h-full bg-primary rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface rounded-xl border border-border/50 border-dashed">
                  <BookOpen size={24} className="text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold text-main mb-1">لا توجد مواد مسجلة</p>
                  <p className="text-xs text-muted">لم تقم بالتسجيل في أي مواد بعد</p>
                </div>
              )}
            </motion.div>

            {/* Recent Sessions Timeline */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-main flex items-center gap-2">
                  <CalendarDays size={16} className="text-info" />
                  أحدث الحصص المنجزة
                </h3>
              </div>

              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.map((session, i) => (
                    <div key={session.id || i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface transition-colors border border-transparent hover:border-border">
                      <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-main truncate mb-0.5">{session.subject || 'حصة'}</h4>
                        <p className="text-[11px] font-bold text-muted">مع {session.teacherName || 'معلم'}</p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-xs font-bold text-main tabular-nums">{session.date ? new Date(session.date).toLocaleDateString('ar-EG') : 'حديثاً'}</p>
                        <p className="text-[10px] font-bold text-muted flex items-center justify-end gap-1 mt-0.5">
                          <Clock size={10} />
                          {session.duration || 60} دقيقة
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-surface rounded-xl border border-border/50 border-dashed">
                  <CalendarDays size={24} className="text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-bold text-main mb-1">لا يوجد سجل حصص</p>
                  <p className="text-xs text-muted">لم تنجز أي حصص حتى الآن</p>
                </div>
              )}
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
