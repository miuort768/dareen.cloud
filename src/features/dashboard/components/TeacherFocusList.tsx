import { AlertTriangle, UserCircle, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';

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
                    <div 
                        key={student.id} 
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
                        
                        <button className="p-2 bg-gray-950 text-white hover:bg-rose-600 transition-colors flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none">
                            <MessageSquare size={12} />
                            <span className="text-[9px] font-medium uppercase">تحفيز</span>
                        </button>
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
