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

const typeLabels: Record<string, string> = {
    all: 'الكل',
    attendance: 'حضور',
    performance: 'أداء',
    engagement: 'تفاعل',
};

const typeBadge: Record<string, string> = {
    attendance: 'bg-error-soft text-error border-error/20',
    performance: 'bg-warning-soft text-warning border-warning/20',
    engagement: 'bg-info-soft text-info border-info/20',
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
            <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
                <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-12 h-12 mb-2 rounded-xl bg-success-soft flex items-center justify-center">
                        <CheckCircle2 size={22} className="text-success/50" />
                    </div>
                    <h4 className="text-xs font-bold text-main mb-0.5">كل شيء ممتاز!</h4>
                    <p className="text-[10px] text-muted">جميع الطلاب ملتزمون بالخطط والمواعيد حالياً.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-card border border-border p-5 font-dash" dir="rtl">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-error-soft flex items-center justify-center">
                    <AlertTriangle size={16} className="text-error" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-main leading-tight">قائمة التركيز</h3>
                    <p className="text-[10px] text-muted">طلاب يحتاجون لاهتمامك</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'attendance', 'performance', 'engagement'].map(key => {
                    const isActive = activeFilter === key;
                    const badgeClass = key === 'all' ? 'bg-primary-soft text-primary' : (typeBadge[key] || 'bg-surface text-muted');

                    return (
                        <button
                            key={key}
                            onClick={() => setActiveFilter(key)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors flex items-center gap-1.5",
                                isActive
                                    ? "bg-primary text-on-primary"
                                    : "bg-surface text-muted hover:text-main"
                            )}
                        >
                            {typeLabels[key]}
                            <Badge variant={isActive ? "secondary" : "outline"} className={cn(
                                "px-1.5 py-0 rounded text-[9px] h-auto min-w-[16px] leading-none",
                                isActive ? "bg-white/20 text-on-primary border-0" : badgeClass
                            )}>
                                {counts[key as keyof typeof counts]}
                            </Badge>
                        </button>
                    );
                })}
            </div>

            {/* Student List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar ps-1">
                {filteredStudents.map((student) => (
                    <div key={student.id}>
                        <div className={cn(
                            "flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer border",
                            addingFor === student.id
                                ? "bg-primary-soft border-primary/20"
                                : "bg-surface border-border hover:bg-hover"
                        )}>
                            <div
                                onClick={() => onStudentClick?.(student)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStudentClick?.(student); } }}
                                className="flex items-center gap-2.5 min-w-0 flex-1"
                            >
                                <div className="w-9 h-9 shrink-0 rounded-xl bg-primary-soft flex items-center justify-center">
                                    <UserCircle size={18} className="text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-main truncate">{student.name}</h4>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] h-4 px-1.5 rounded border",
                                            typeBadge[student.type] || 'bg-surface text-muted'
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
                                    "h-7 px-2.5 text-[10px] font-bold gap-1 shrink-0 rounded-lg",
                                    addingFor === student.id
                                        ? "bg-primary text-on-primary"
                                        : "bg-surface text-primary border border-border hover:bg-primary hover:text-on-primary"
                                )}
                                aria-expanded={addingFor === student.id}
                            >
                                <Plus size={10} />
                                إضافة حصة
                            </Button>
                        </div>

                        {addingFor === student.id && (
                            <div className="p-3 mt-1.5 me-12 rounded-xl bg-success-soft border border-success/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="المادة (مثال: رياضيات)"
                                        aria-label="المادة"
                                        className="h-8 text-[11px] rounded-lg"
                                        dir="rtl"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setAddingFor(null)}
                                        className="h-8 w-8 rounded-lg shrink-0"
                                        aria-label="إغلاق"
                                    >
                                        <X size={13} />
                                    </Button>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 4, 8].map(num => (
                                        <Button
                                            key={num}
                                            onClick={() => {
                                                for (let i = 0; i < num; i++) addSession(student.id, student.name);
                                            }}
                                            disabled={!subject.trim()}
                                            variant="success"
                                            size="sm"
                                            className="flex-1 h-7 text-[10px] font-bold rounded-lg"
                                        >
                                            +{num}
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
                                        className="h-7 text-[10px] font-bold rounded-lg"
                                    >
                                        مخصص
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[10px] text-muted">
                <Clock size={9} />
                <span>يتم تحديث هذه القائمة دورياً بناءً على الحضور والتقييمات الأخيرة.</span>
            </div>
        </div>
    );
};
