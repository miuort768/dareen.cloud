import React from 'react';
import { SectionCard } from './ClosingUI';

interface TeacherPerf {
    name: string;
    total: number;
    attendanceRate: number;
    documentationRate: number;
}

interface TeacherPerformanceProps {
    teacherPerformance: TeacherPerf[];
}

export const TeacherPerformance: React.FC<TeacherPerformanceProps> = ({ teacherPerformance }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherPerformance.map((perf, idx) => (
                <SectionCard key={idx} className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {perf.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white">{perf.name}</h3>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{perf.total} حصة</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase"><span>الحضور</span><span>{perf.attendanceRate.toFixed(0)}%</span></div>
                                <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${perf.attendanceRate}%` }} /></div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase"><span>التوثيق</span><span>{perf.documentationRate.toFixed(0)}%</span></div>
                                <div className="h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#5c59f2]" style={{ width: `${perf.documentationRate}%` }} /></div>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            ))}
        </div>
    );
};
