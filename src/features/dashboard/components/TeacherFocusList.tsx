import { useState } from 'react';
import { AlertTriangle, UserCircle, Plus, Clock, CheckCircle2, X } from 'lucide-react';
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

export const TeacherFocusList = ({ students, onStudentClick }: TeacherFocusListProps) => {
    const [addingFor, setAddingFor] = useState<string | null>(null);
    const [subject, setSubject] = useState('');

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
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border-4 border-gray-950 p-8 flex items-center justify-center gap-6 shadow-[10px_10px_0px_0px_rgba(16,185,129,0.2)] dark:shadow-none animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-emerald-500 border-4 border-gray-950 flex items-center justify-center text-white shadow-[4px_4px_0px_0px_black] transform rotate-3">
                <CheckCircle2 size={32} />
            </div>
            <div className="text-center">
                <h4 className="font-medium text-lg text-emerald-950 dark:text-emerald-400 uppercase tracking-tighter mb-1">خلي كل شيء ممتاز!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium uppercase tracking-widest">جميع طلابك ملتزمون بالخطط والمواعيد حالياً. عمل مذهل!</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white border-4 border-gray-950 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group h-full">
            <div className="flex items-center gap-2 mb-6 text-rose-600">
                <AlertTriangle size={20} className="animate-pulse" />
                <h3 className="font-medium text-xs uppercase tracking-tighter text-gray-950 dark:text-white">طلاب يحتاجون لاهتمامك (Focus List)</h3>
            </div>

            <div className="space-y-3">
                {students.map((student) => (
                    <div key={student.id}>
                        <div 
                            onClick={() => onStudentClick?.(student)}
                            className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/10 border-2 border-gray-950 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex-shrink-0 bg-white dark:bg-gray-950 border-2 border-gray-950 flex items-center justify-center text-rose-500 shadow-[2px_2px_0px_0px_rgba(244,63,94,1)]">
                                    <UserCircle size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-medium text-gray-900 dark:text-white truncate">{student.name}</h4>
                                    <p className="text-[9px] font-normal text-rose-700 dark:text-rose-400 uppercase tracking-widest">{student.reason}</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={(e) => { e.stopPropagation(); setAddingFor(addingFor === student.id ? null : student.id); setSubject(''); }}
                                className="p-2 bg-gray-950 text-white hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none"
                            >
                                <Plus size={12} />
                                <span className="text-[9px] font-medium uppercase">إضافة حصة</span>
                            </button>
                        </div>

                        {addingFor === student.id && (
                            <div className="p-3 mt-2 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500">
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="المادة (مثال: رياضيات)"
                                        className="flex-1 px-2 py-1 text-[10px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded"
                                        dir="rtl"
                                    />
                                    <button onClick={() => setAddingFor(null)} className="p-1 text-gray-400 hover:text-gray-600">
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
                                            className="flex-1 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-700 transition-colors disabled:opacity-40"
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
                                        className="px-2 py-1.5 bg-gray-700 text-white text-[10px] font-bold rounded hover:bg-gray-800 transition-colors disabled:opacity-40"
                                    >
                                        مخصص
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="mt-6 flex items-center gap-2 text-[9px] font-medium text-gray-400 italic">
                <Clock size={12} />
                <span>يتم تحديث هذه القائمة دورياً بناءً على الحضور والتقييمات الأخيرة.</span>
            </div>
        </div>
    );
};
