import React from 'react';
import { SectionCard } from './ClosingUI';
import { ProgressBar } from '../../../shared/components/ui';

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
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg bg-primary-soft text-primary">
                        {perf.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-bold text-main dark:text-on-primary">{perf.name}</h3>
                            <span className="text-micro font-bold text-muted uppercase">{perf.total} حصة</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-micro font-bold text-muted uppercase"><span>الحضور</span><span>{perf.attendanceRate.toFixed(0)}%</span></div>
                                <ProgressBar value={perf.attendanceRate} variant="success" size="sm" trackClassName="bg-background dark:bg-primary-active" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-micro font-bold text-muted uppercase"><span>التوثيق</span><span>{perf.documentationRate.toFixed(0)}%</span></div>
                                <ProgressBar value={perf.documentationRate} variant="primary" size="sm" trackClassName="bg-background dark:bg-primary-active" />
                            </div>
                        </div>
                    </div>
                </SectionCard>
            ))}
        </div>
    );
};
