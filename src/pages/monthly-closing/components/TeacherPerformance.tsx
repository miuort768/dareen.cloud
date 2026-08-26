import React from 'react'
import { SectionCard } from './ClosingUI'
import { ProgressBar } from '../../../shared/components/ui'

interface TeacherPerf {
  name: string
  total: number
  attendanceRate: number
  documentationRate: number
}

interface TeacherPerformanceProps {
  teacherPerformance: TeacherPerf[]
}

export const TeacherPerformance: React.FC<TeacherPerformanceProps> = ({ teacherPerformance }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {teacherPerformance.map((perf, idx) => (
        <SectionCard key={idx} className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-lg font-bold text-primary">
            {perf.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-sm font-bold text-main">{perf.name}</h3>
              <span className="text-micro font-bold uppercase text-muted">{perf.total} حصة</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-micro font-bold uppercase text-muted">
                  <span>الحضور</span>
                  <span>{perf.attendanceRate.toFixed(0)}%</span>
                </div>
                <ProgressBar
                  value={perf.attendanceRate}
                  variant="success"
                  size="sm"
                  trackClassName="bg-surface"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-micro font-bold uppercase text-muted">
                  <span>التوثيق</span>
                  <span>{perf.documentationRate.toFixed(0)}%</span>
                </div>
                <ProgressBar
                  value={perf.documentationRate}
                  variant="primary"
                  size="sm"
                  trackClassName="bg-surface"
                />
              </div>
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  )
}
