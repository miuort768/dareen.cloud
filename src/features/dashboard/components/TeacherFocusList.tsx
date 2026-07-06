import { useState, useMemo } from 'react';
import { AlertTriangle, UserCircle, Plus, Clock, CheckCircle2, X, Filter } from 'lucide-react';
import { api } from '../../../lib/api';

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

const typeColors: Record<string, string> = {
    attendance: 'var(--bg-error)',
    performance: 'var(--bg-warning)',
    engagement: 'var(--bg-info)',
};

const typeBg: Record<string, string> = {
    attendance: 'bg-error-light dark:bg-error/20',
    performance: 'bg-warning-light dark:bg-warning/20',
    engagement: 'bg-info-light dark:bg-info/20',
};

const typeBadge: Record<string, string> = {
    attendance: 'bg-error-light text-error dark:bg-error/40 dark:text-error',
    performance: 'bg-warning-light text-warning dark:bg-warning/40 dark:text-warning',
    engagement: 'bg-info-light text-info dark:bg-info/40 dark:text-info',
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

    if (!students || students.length === 0) return (
        <div className="p-6 bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50">
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-xl bg-success-light dark:bg-success/20 flex items-center justify-center mb-4">
                    <CheckCircle2 size={28} className="text-success" />
                </div>
                <h4 className="text-sm font-bold text-main dark:text-on-primary mb-1">كل شيء ممتاز!</h4>
                <p className="text-[10px] text-muted dark:text-muted">جميع طلابك ملتزمون بالخطط والمواعيد حالياً.</p>
            </div>
        </div>
    );

    return (
        <div className="p-5 bg-white dark:bg-primary-active rounded-2xl shadow-sm border border-border/50 dark:border-border/50 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-error-light dark:bg-error/20">
                        <AlertTriangle size={20} className="text-error" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-main dark:text-on-primary leading-tight">قائمة التركيز</h3>
                        <p className="text-[9px] font-medium text-muted dark:text-muted mt-0.5">طلاب يحتاجون لاهتمامك</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
                {['all', 'attendance', 'performance', 'engagement'].map(key => (
                    <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                            activeFilter === key
                                ? key === 'all'
                                    ? 'bg-primary-active dark:bg-surface text-on-primary dark:text-main shadow-sm'
                                    : `${typeBg[key]} shadow-sm`
                                : 'bg-surface dark:bg-primary-active text-muted dark:text-muted hover:bg-surface dark:hover:bg-primary-active'
                        }`}
                    >
                        {typeLabels[key]}
                        <span className={`mr-1.5 text-[8px] ${activeFilter === key ? 'opacity-80' : 'opacity-50'}`}>
                            {counts[key as keyof typeof counts]}
                        </span>
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {filteredStudents.map((student) => (
                    <div key={student.id}>
                        <div
                            onClick={() => onStudentClick?.(student)}
                            className="flex items-center justify-between p-3 bg-background dark:bg-primary-active/50 rounded-xl hover:bg-surface dark:hover:bg-primary-active transition-colors cursor-pointer border border-transparent hover:border-border dark:hover:border-border"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-primary-active border border-border dark:border-border flex items-center justify-center shadow-sm">
                                    <UserCircle size={22} className="text-muted" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-main dark:text-on-primary truncate">{student.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${typeBadge[student.type]}`}>
                                            {typeLabels[student.type]}
                                        </span>
                                        <span className="text-[9px] text-muted dark:text-muted truncate">{student.reason}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); setAddingFor(addingFor === student.id ? null : student.id); setSubject(''); }}
                                className="p-2 rounded-lg bg-primary-active dark:bg-surface text-on-primary dark:text-main hover:bg-success dark:hover:bg-success hover:text-on-primary transition-all flex items-center gap-1 shrink-0 shadow-sm"
                            >
                                <Plus size={12} />
                                <span className="text-[8px] font-bold">إضافة حصة</span>
                            </button>
                        </div>

                        {addingFor === student.id && (
                            <div className="p-3 mt-2 mr-12 bg-success-light dark:bg-success/10 border border-success dark:border-success rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="المادة (مثال: رياضيات)"
                                        className="flex-1 px-3 py-1.5 text-[10px] border border-border dark:border-border bg-white dark:bg-primary-active rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
                                        dir="rtl"
                                    />
                                    <button onClick={() => setAddingFor(null)} className="p-1.5 text-muted hover:text-muted dark:hover:text-dim rounded-lg hover:bg-surface dark:hover:bg-primary-active">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="flex gap-1.5">
                                    {[1, 2, 4, 8].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => {
                                                for (let i = 0; i < num; i++) addSession(student.id, student.name);
                                            }}
                                            disabled={!subject.trim()}
                                            className="flex-1 py-1.5 bg-success text-on-primary text-[10px] font-bold rounded-lg hover:bg-success transition-colors disabled:opacity-40"
                                        >
                                            +{num} {num === 1 ? 'حصة' : 'حصص'}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const val = prompt('أدخل عدد الحصص:');
                                            if (val && !isNaN(Number(val)) && Number(val) > 0) {
                                                for (let i = 0; i < Number(val); i++) addSession(student.id, student.name);
                                            }
                                        }}
                                        disabled={!subject.trim()}
                                        className="px-3 py-1.5 bg-card text-on-primary text-[10px] font-bold rounded-lg hover:bg-primary-active transition-colors disabled:opacity-40"
                                    >
                                        مخصص
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[8px] text-muted dark:text-muted">
                <Clock size={10} />
                <span>يتم تحديث هذه القائمة دورياً بناءً على الحضور والتقييمات الأخيرة.</span>
            </div>
        </div>
    );
};
