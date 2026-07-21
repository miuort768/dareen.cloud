import { useState, useMemo } from 'react';
import { AlertTriangle, UserCircle, Plus, Clock, CheckCircle2, X } from 'lucide-react';
import { api } from '../../../lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FocusStudent {
    id: string;
    name: string;
    reason: string;
    type: 'attendance' | 'performance' | 'engagement';
}

interface TeacherFocusListProps {
    students: FocusStudent[];
    onStudentClick?: (student: FocusStudent) => void;
}

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
        "rounded-3xl p-6",
        "bg-card/70 backdrop-blur-xl",
        "border border-white/20 dark:border-white/10",
        "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.04)]",
        "font-dash",
        className
    )}>
        {children}
    </div>
);

const typeLabels: Record<string, string> = {
    all: 'الكل',
    attendance: 'حضور',
    performance: 'أداء',
    engagement: 'تفاعل',
};

const typeStyles: Record<string, { gradient: string; badge: string; inactive: string }> = {
    attendance: {
        gradient: 'from-error to-rose-500',
        badge: 'bg-error/10 text-error border-error/20',
        inactive: 'bg-white/40 dark:bg-white/5 text-muted hover:text-main'
    },
    performance: {
        gradient: 'from-warning to-amber-500',
        badge: 'bg-warning/10 text-warning border-warning/20',
        inactive: 'bg-white/40 dark:bg-white/5 text-muted hover:text-main'
    },
    engagement: {
        gradient: 'from-info to-cyan-500',
        badge: 'bg-info/10 text-info border-info/20',
        inactive: 'bg-white/40 dark:bg-white/5 text-muted hover:text-main'
    },
};

export const TeacherFocusList = ({ students, onStudentClick }: TeacherFocusListProps) => {
    const [addingFor, setAddingFor] = useState<string | null>(null);
    const [subject, setSubject] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const filteredStudents = useMemo(() =>
        activeFilter === 'all' ? students : students.filter(s => s.type === activeFilter),
        [students, activeFilter]
    );

    const counts = useMemo(() => ({
        all: students.length,
        attendance: students.filter(s => s.type === 'attendance').length,
        performance: students.filter(s => s.type === 'performance').length,
        engagement: students.filter(s => s.type === 'engagement').length,
    }), [students]);

    const addSession = async (studentId: string, studentName: string) => {
        if (!subject.trim()) return;
        try {
            const today = new Date();
            const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            await api.post('/sessions', {
                studentId,
                studentName,
                subject: subject.trim(),
                date: today.toISOString().split('T')[0],
                day: dayNames[today.getDay()],
                time: today.toTimeString().slice(0, 5),
                status: 'scheduled'
            });
            setAddingFor(null);
            setSubject('');
            window.location.reload();
        } catch (e) {
            console.error('Error adding session:', e);
        }
    };

    if (!students || students.length === 0) {
        return (
            <GlassCard dir="rtl">
                <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-14 h-14 mb-3 rounded-2xl bg-gradient-to-br from-success/10 to-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 size={26} className="text-success/40" />
                    </div>
                    <h4 className="text-sm font-bold text-main mb-1">كل شيء ممتاز!</h4>
                    <p className="text-xs text-muted">جميع الطلاب ملتزمون بالخطط والمواعيد حالياً.</p>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard dir="rtl">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-error to-rose-500 flex items-center justify-center shadow-lg shadow-error/20">
                    <AlertTriangle size={18} className="text-white" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-main leading-tight">قائمة التركيز</h3>
                    <p className="text-xs text-muted">طلاب يحتاجون لاهتمامك</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'attendance', 'performance', 'engagement'].map(key => {
                    const isActive = activeFilter === key;
                    const style = key === 'all'
                        ? { gradient: 'from-primary to-purple-500', badge: 'bg-primary/10 text-primary' }
                        : typeStyles[key];

                    return (
                        <button
                            key={key}
                            onClick={() => setActiveFilter(key)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                                isActive
                                    ? "bg-gradient-to-r text-white shadow-md border-0"
                                    : style.inactive + ' border-white/20 backdrop-blur-sm'
                            )}
                            style={isActive ? { backgroundImage: `linear-gradient(to left, ${style.gradient.replace('from-', '').replace('to-', '').split(' ').join(', ')})` } : undefined}
                        >
                            {typeLabels[key]}
                            <Badge variant={isActive ? "secondary" : "outline"} className={cn("me-1.5 px-1.5 py-0 rounded text-[9px] h-auto min-w-[18px] leading-none", isActive ? "bg-white/20 text-white border-0" : style.badge + ' border')}>
                                {counts[key as keyof typeof counts]}
                            </Badge>
                        </button>
                    );
                })}
            </div>

            {/* Student List */}
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar ps-1">
                {filteredStudents.map((student) => (
                    <div key={student.id}>
                        <div className={cn(
                            "flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border backdrop-blur-sm",
                            addingFor === student.id
                                ? "bg-white/60 dark:bg-white/10 border-primary/30 shadow-md"
                                : "bg-white/40 dark:bg-white/5 border-white/20 hover:border-white/30 hover:shadow-md"
                        )}>
                            <div
                                onClick={() => onStudentClick?.(student)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStudentClick?.(student); } }}
                                className="flex items-center gap-3 min-w-0 flex-1"
                            >
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-white/30 flex items-center justify-center">
                                    <UserCircle size={20} className="text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-main truncate">{student.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] h-5 px-2 rounded-lg border",
                                            typeStyles[student.type]?.badge || 'bg-primary/10 text-primary'
                                        )}>
                                            {typeLabels[student.type]}
                                        </Badge>
                                        <span className="text-[10px] text-muted truncate">{student.reason}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={(e) => { e.stopPropagation(); setAddingFor(addingFor === student.id ? null : student.id); setSubject(''); }}
                                variant="default"
                                size="sm"
                                className={cn(
                                    "h-8 px-3 text-[10px] font-bold gap-1 shrink-0 rounded-xl border-0",
                                    addingFor === student.id
                                        ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-md"
                                        : "bg-white/60 dark:bg-white/10 text-primary hover:bg-primary hover:text-on-primary border border-white/20"
                                )}
                                aria-expanded={addingFor === student.id}
                            >
                                <Plus size={11} />
                                إضافة حصة
                            </Button>
                        </div>

                        {addingFor === student.id && (
                            <div className="p-4 mt-2 me-14 rounded-2xl bg-gradient-to-br from-success/5 via-emerald-500/5 to-success/5 border border-success/20 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="المادة (مثال: رياضيات)"
                                        aria-label="المادة"
                                        className="h-9 text-xs rounded-xl border-white/20 bg-white/50 dark:bg-white/5"
                                        dir="rtl"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setAddingFor(null)}
                                        className="h-9 w-9 rounded-xl shrink-0"
                                        aria-label="إغلاق"
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                                <div className="flex gap-1.5">
                                    {[1, 2, 4, 8].map(num => (
                                        <Button
                                            key={num}
                                            onClick={() => {
                                                for (let i = 0; i < num; i++) addSession(student.id, student.name);
                                            }}
                                            disabled={!subject.trim()}
                                            variant="success"
                                            size="sm"
                                            className="flex-1 h-8 text-[10px] font-bold rounded-xl"
                                        >
                                            +{num} {num === 1 ? 'حصة' : 'حصص'}
                                        </Button>
                                    ))}
                                    <Button
                                        onClick={() => {
                                            const val = prompt('أدخل عدد الحصص:');
                                            if (val && !isNaN(Number(val)) && Number(val) > 0) {
                                                for (let i = 0; i < Number(val); i++) addSession(student.id, student.name);
                                            }
                                        }}
                                        disabled={!subject.trim()}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-[10px] font-bold rounded-xl border-white/20 bg-white/50 dark:bg-white/5"
                                    >
                                        مخصص
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-5 pt-4 border-t border-white/20 dark:border-white/10 flex items-center gap-1.5 text-[10px] text-muted">
                <Clock size={10} />
                <span>يتم تحديث هذه القائمة دورياً بناءً على الحضور والتقييمات الأخيرة.</span>
            </div>
        </GlassCard>
    );
};
