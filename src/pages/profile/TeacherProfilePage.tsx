import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  BookOpen,
  Users,
  Play,
  DollarSign,
  Star,
  Trophy,
  Target,
  Edit3,
  CalendarDays,
  Clock,
  UserCheck,
  FileText,
  CheckCircle2,
  BarChart3,
  UserPlus,
  Activity
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCurrentUser, useLogout, useAcademyName } from '../../context/AppContext';
import { CURRENCY_SYMBOL } from '../../config/constants';
import { getRankByPoints, TEACHER_RANKS } from '../../shared/utils/ranks';
import { Skeleton } from '../../shared/components/ui';
import { TeacherDashboardHeader } from '../TeacherDashboardHeader';
import { PaymentSettingsSection } from './PaymentSettingsSection';
import type { DashboardStats } from '../../features/dashboard/types';

interface TeacherData {
  id: string;
  name: string;
  phone1: string;
  phone2?: string;
  subject: string;
  price: number;
  email?: string;
  points?: number;
  city?: string;
  biography?: string;
  stage?: string;
}

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const item = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
};

export const TeacherProfilePage = () => {
  const academyName = useAcademyName();
  useEffect(() => {
    document.title = `الملف الشخصي | ${academyName}`;
  }, [academyName]);

  const currentUser = useCurrentUser();
  const logout = useLogout();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [dashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const me = await api.get<TeacherData>('/teachers/me');
        if (cancelled) return;
        setTeacherData(me);
      } catch (e) {
        console.error('Error fetching teacher profile:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    if (currentUser?.role === 'teacher') fetchAll();
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const points = teacherData?.points || dashboardStats?.teacherPoints || 0;
  const rank = getRankByPoints(points, TEACHER_RANKS);
  const nextRankNeeded = points < 1000 ? 1000 - points : 0;
  const nextRankName = 'المعلمة الذهبية';

  const handleSaveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || isSavingName) return;
    setIsSavingName(true);
    try {
      await api.put('/teachers/me', { name: trimmed });
      setTeacherData((prev) => (prev ? { ...prev, name: trimmed } : prev));
      setEditingName(false);
    } catch (e) {
      console.error('Error updating name:', e);
    } finally {
      setIsSavingName(false);
    }
  };

  const reviews = [
    { id: 'r1', studentName: 'سارة أحمد', rating: 5, text: 'معلمة ممتازة، أسلوبها في الشرح سهل ومبسط.', date: '١٥ يونيو ٢٠٢٦' },
    { id: 'r2', studentName: 'محمد علي', rating: 5, text: 'أفضل معلمة تعاملتها معها، صبورة ومخلصة.', date: '١٠ يونيو ٢٠٢٦' },
  ];

  const activities = [
    { id: 'a1', icon: <UserPlus size={14} className="text-success" />, title: 'طالب جديد', description: 'أحمد محمد', time: 'منذ ساعتين' },
    { id: 'a2', icon: <CheckCircle2 size={14} className="text-info" />, title: 'إنهاء حصة', description: 'مع محمد علي', time: 'منذ 4 ساعات' },
    { id: 'a3', icon: <Trophy size={14} className="text-warning" />, title: 'شارة جديدة', description: 'المعلمة الذهبية', time: 'منذ يومين' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        {currentUser?.role === 'teacher' && <div className="hidden md:block"><TeacherDashboardHeader logout={logout} /></div>}
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

  const name = teacherData?.name || currentUser?.name || 'المعلمة';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pb-24" dir="rtl">
      {currentUser?.role === 'teacher' && (
        <div className="hidden md:block">
          <TeacherDashboardHeader logout={logout} />
        </div>
      )}

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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-border bg-surface text-muted uppercase tracking-wider">ملف المعلم</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-warning/20 bg-warning/10 text-warning flex items-center gap-1">
                  <Star size={10} className="fill-warning" />
                  {rank?.name || 'معلم متميز'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-main truncate">{name}</h1>
              <p className="text-sm font-bold text-muted mt-1 flex items-center gap-1.5">
                <BookOpen size={16} />
                {teacherData?.subject || 'مادة غير محددة'}
              </p>
            </div>
          </div>

          <div className="hidden md:block flex-1" />

          {/* Core Metrics Strip */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 z-10 bg-surface/50 p-4 md:px-8 md:py-5 rounded-2xl border border-border/50 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">الطلاب</span>
              <span className="text-xl md:text-2xl font-black text-main tabular-nums">{dashboardStats?.studentsCount || 0}</span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">الحصص</span>
              <span className="text-xl md:text-2xl font-black text-main tabular-nums">{dashboardStats?.completedSessions || 0}</span>
            </div>
            <div className="flex flex-col border-s border-border ps-4 md:ps-8">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1">السعر</span>
              <span className="text-xl md:text-2xl font-black text-success tabular-nums flex items-end gap-1">
                {teacherData?.price || 0}
                <span className="text-[10px] font-bold text-muted mb-1">{CURRENCY_SYMBOL}</span>
              </span>
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
                  <p className="text-[10px] font-bold text-muted">النقاط الحالية</p>
                </div>
                {nextRankNeeded > 0 && (
                  <div className="text-end">
                    <p className="text-sm font-bold text-main leading-none mb-1">{nextRankName}</p>
                    <p className="text-[10px] font-bold text-muted">الرتبة القادمة</p>
                  </div>
                )}
              </div>
              
              <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${nextRankNeeded > 0 ? Math.min((points / 1000) * 100, 100) : 100}%` }}
                />
              </div>
            </motion.div>

            {/* Contact & Setup */}
            <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-5">بيانات الاتصال</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">رقم الهاتف الأساسي</p>
                    <p className="text-xs font-bold text-main">{teacherData?.phone1 || 'غير متوفر'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-main" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-0.5">البريد الإلكتروني</p>
                    <p className="text-xs font-bold text-main truncate max-w-[200px]">{teacherData?.email || 'غير متوفر'}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-5">الإعدادات المالية</h3>
                <PaymentSettingsSection />
              </div>
            </motion.div>
          </div>

          {/* Main Content (2/3) */}
          <div className="xl:col-span-2 space-y-6 md:space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Activity Timeline */}
              <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    <ActivityIcon />
                    النشاط الأخير
                  </h3>
                </div>
                
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
              </motion.div>

              {/* Reviews Overview */}
              <motion.div variants={item} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-main flex items-center gap-2">
                    <Star size={16} className="text-warning fill-warning" />
                    أحدث التقييمات
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-surface border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-main">{rev.studentName}</span>
                        <div className="flex items-center gap-0.5 text-warning">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} className={i < rev.rating ? "fill-warning" : "text-border fill-transparent"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed line-clamp-2">{rev.text}</p>
                      <span className="text-[9px] font-bold text-muted/50 mt-2 block">{rev.date}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            
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

const ActivityIcon = () => <Activity size={16} className="text-info" />;
