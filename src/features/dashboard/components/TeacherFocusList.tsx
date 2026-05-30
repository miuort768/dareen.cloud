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
    attendance: '#EF4444',
    performance: '#F59E0B',
    engagement: '#3B82F6',
};

const typeBg: Record<string, string> = {
    attendance: 'bg-red-50 dark:bg-red-900/20',
    performance: 'bg-amber-50 dark:bg-amber-900/20',
    engagement: 'bg-blue-50 dark:bg-blue-900/20',
};

const typeBadge: Record<string, string> = {
    attendance: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    performance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    engagement: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
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
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50">
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">كل شيء ممتاز!</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">جميع طلابك ملتزمون بالخطط والمواعيد حالياً.</p>
            </div>
        </div>
    );

    return (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100/50 dark:border-slate-800/50 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-rose-50 dark:bg-rose-900/20">
                        <AlertTriangle size={20} className="text-rose-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">قائمة التركيز</h3>
                        <p className="text-[9px] font-medium text-[#64748B] dark:text-slate-400 mt-0.5">طلاب يحتاجون لاهتمامك</p>
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
                                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                                    : `${typeBg[key]} shadow-sm`
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                                    <UserCircle size={22} className="text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{student.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${typeBadge[student.type]}`}>
                                            {typeLabels[student.type]}
                                        </span>
                                        <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{student.reason}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); setAddingFor(addingFor === student.id ? null : student.id); setSubject(''); }}
                                className="p-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1 shrink-0 shadow-sm"
                            >
                                <Plus size={12} />
                                <span className="text-[8px] font-bold">إضافة حصة</span>
                            </button>
                        </div>

                        {addingFor === student.id && (
                            <div className="p-3 mt-2 mr-12 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="المادة (مثال: رياضيات)"
                                        className="flex-1 px-3 py-1.5 text-[10px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                        dir="rtl"
                                    />
                                    <button onClick={() => setAddingFor(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
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
                                            className="flex-1 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40"
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
                                        className="px-3 py-1.5 bg-slate-600 text-white text-[10px] font-bold rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40"
                                    >
                                        مخصص
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[8px] text-slate-400 dark:text-slate-500">
                <Clock size={10} />
                <span>يتم تحديث هذه القائمة دورياً بناءً على الحضور والتقييمات الأخيرة.</span>
            </div>
        </div>
    );
};
