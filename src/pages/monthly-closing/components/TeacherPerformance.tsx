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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: 'rgba(108,75,255,0.07)', color: 'var(--bg-primary)' }}>
                        {perf.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-bold text-main dark:text-on-primary">{perf.name}</h3>
                            <span className="text-[9px] font-bold text-muted uppercase">{perf.total} حصة</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-bold text-muted uppercase"><span>الحضور</span><span>{perf.attendanceRate.toFixed(0)}%</span></div>
                                <div className="h-1 bg-background dark:bg-primary-active overflow-hidden rounded-full"><div className="h-full bg-success" style={{ width: `${perf.attendanceRate}%` }} /></div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-bold text-muted uppercase"><span>التوثيق</span><span>{perf.documentationRate.toFixed(0)}%</span></div>
                                <div className="h-1 bg-background dark:bg-primary-active overflow-hidden rounded-full"><div className="h-full bg-primary" style={{ width: `${perf.documentationRate}%` }} /></div>
                            </div>
                        </div>
                    </div>
                </SectionCard>
            ))}
        </div>
    );
};
