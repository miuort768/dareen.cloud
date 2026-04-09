import { Trophy, Star, Award, TrendingUp } from 'lucide-react';
import { getRankByPoints, STUDENT_RANKS } from '../../../shared/utils/ranks';
import { cn } from '../../../lib/utils';

interface TeacherLeaderboardProps {
    students: any[];
    onStudentClick?: (student: any) => void;
}

export const TeacherLeaderboard = ({ students, onStudentClick }: TeacherLeaderboardProps) => {
    if (!students || students.length === 0) return null;

    return (
        <div className="bg-white border-4 border-gray-950 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6 text-gray-950 dark:text-white">
                <Trophy size={20} className="text-yellow-500 fill-current" />
                <h3 className="font-black text-xs uppercase tracking-tighter">أبطال مجموعتك (أعلى النقاط)</h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {students.map((student, index) => {
                    const rank = getRankByPoints(student.totalPoints || 0, STUDENT_RANKS);
                    
                    return (
                        <div 
                            key={student.id} 
                            onClick={() => onStudentClick?.(student)}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-950 group/item hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 flex items-center justify-center font-black text-xs border-2 border-gray-950 shadow-[2px_2px_0px_0px_black]",
                                    index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-orange-400' : 'bg-white text-gray-400'
                                )}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                                        {student.name}
                                        <span title={rank.name}>{rank.icon}</span>
                                    </h4>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{student.grade} • {rank.name}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 text-yellow-600">
                                        <Star size={10} className="fill-current" />
                                        <span className="text-sm font-black tracking-tighter">{student.totalPoints || 0}</span>
                                    </div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase leading-none">نقطة</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t-2 border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-gray-400">نشاط المجموعة مرتفع هذا الأسبوع</span>
                </div>
            </div>
        </div>
    );
};
