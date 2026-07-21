import { useState, useMemo } from 'react';
import { AlertTriangle, UserCircle, Plus, Clock, CheckCircle2, X } from 'lucide-react';
import { api } from '../../../lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

const typeLabels: Record<string, string> = {
    all: 'الكل',
    attendance: 'حضور',
    performance: 'أداء',
    engagement: 'تفاعل',
};

const typeStyles: Record<string, { active: string; badge: string; inactive: string }> = {
    attendance: {
        active: 'bg-error text-on-error shadow-sm',
        badge: 'bg-error/10 text-error',
        inactive: 'bg-card text-muted hover:bg-accent/50'
    },
    performance: {
        active: 'bg-warning text-on-warning shadow-sm',
        badge: 'bg-warning/10 text-warning',
        inactive: 'bg-card text-muted hover:bg-accent/50'
    },
    engagement: {
        active: 'bg-info text-on-info shadow-sm',
        badge: 'bg-info/10 text-info',
        inactive: 'bg-card text-muted hover:bg-accent/50'
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
            <Card className="border-border/50 shadow-sm" dir="rtl">
                <CardContent className="p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-success/5 flex items-center justify-center ring-1 ring-success/20 mb-3">
                            <CheckCircle2 size={24} className="text-success" />
                        </div>
                        <h4 className="text-sm font-bold text-main mb-1">كل شيء ممتاز!</h4>
                        <p className="text-xs text-muted">جميع الطلاب ملتزمون بالخطط والمواعيد حالياً.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 shadow-sm" dir="rtl">
            <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-error/10 text-error ring-1 ring-error/20">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-main leading-tight">قائمة التركيز</CardTitle>
                        <CardDescription className="text-[11px] text-muted">طلاب يحتاجون لاهتمامك</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
                    {['all', 'attendance', 'performance', 'engagement'].map(key => {
                        const isActive = activeFilter === key;
                        const style = key === 'all'
                            ? { active: 'bg-primary text-on-primary shadow-sm', badge: 'bg-primary/10 text-primary' }
                            : typeStyles[key];

                        return (
                            <button
                                key={key}
                                onClick={() => setActiveFilter(key)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all",
                                    isActive ? style.active : 'bg-card text-muted hover:bg-accent/50 border border-border/50'
                                )}
                            >
                                {typeLabels[key]}
                                <span className={cn("me-1.5 opacity-70", isActive ? '' : 'text-muted')}>
                                    {counts[key as keyof typeof counts]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Student List */}
                <div className="space-y-2">
                    {filteredStudents.map((student) => (
                        <div key={student.id}>
                            <div
                                onClick={() => onStudentClick?.(student)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStudentClick?.(student); } }}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors cursor-pointer border border-transparent hover:border-border/50"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 shrink-0 rounded-xl bg-card border border-border/50 flex items-center justify-center">
                                        <UserCircle size={20} className="text-muted" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs font-semibold text-main truncate">{student.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[9px] font-semibold",
                                                typeStyles[student.type]?.badge || 'bg-primary/10 text-primary'
                                            )}>
                                                {typeLabels[student.type]}
                                            </span>
                                            <span className="text-[10px] text-muted truncate">{student.reason}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={(e) => { e.stopPropagation(); setAddingFor(addingFor === student.id ? null : student.id); setSubject(''); }}
                                    variant="default"
                                    size="sm"
                                    className="h-7 px-2.5 text-[10px] font-semibold gap-1 shrink-0"
                                    aria-expanded={addingFor === student.id}
                                >
                                    <Plus size={11} />
                                    إضافة حصة
                                </Button>
                            </div>

                            {addingFor === student.id && (
                                <div className="p-3 mt-2 me-12 bg-success/5 border border-success/20 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="المادة (مثال: رياضيات)"
                                            aria-label="المادة"
                                            className="h-8 text-xs"
                                            dir="rtl"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setAddingFor(null)}
                                            className="h-8 w-8 shrink-0"
                                            aria-label="إغلاق"
                                        >
                                            <X size={13} />
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
                                                className="flex-1 h-7 text-[10px] font-semibold"
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
                                            className="h-7 text-[10px] font-semibold"
                                        >
                                            مخصص
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-muted">
                    <Clock size={9} />
                    <span>يتم تحديث هذه القائمة دورياً بناءً على الحضور والتقييمات الأخيرة.</span>
                </div>
            </CardContent>
        </Card>
    );
};
