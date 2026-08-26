import React from 'react'
import { RefreshCw, CheckCircle2 } from 'lucide-react'
import { SectionCard, SectionTitle } from './ClosingUI'

interface CompensationSession {
  needsCompensation?: boolean
  status: string
  studentName: string
  teacherName: string
  date: string
}

interface CompensationTableProps {
  filteredSessions: CompensationSession[]
}

export const CompensationTable: React.FC<CompensationTableProps> = ({ filteredSessions }) => {
  const cancelledNeedingComp = filteredSessions.filter(
    (s) => s.needsCompensation && s.status === 'cancelled',
  )

  return (
    <SectionCard>
      <div className="border-b border-border p-4">
        <SectionTitle
          icon={RefreshCw}
          label="سجل حصص التعويض المعلقة"
          sub="الإلغاءات التي تتطلب إعادة جدولة"
        />
      </div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-start">
          <thead className="bg-primary">
            <tr>
              <th className="px-4 py-3 text-micro font-bold uppercase tracking-wider text-on-primary">
                الطالب
              </th>
              <th className="px-4 py-3 text-micro font-bold text-on-primary">المعلمة</th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">
                التاريخ
              </th>
              <th className="px-4 py-3 text-center text-micro font-bold text-on-primary">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cancelledNeedingComp.map((session, idx) => (
              <tr key={idx} className="transition-colors hover:bg-surface">
                <td className="px-4 py-4 text-xs font-bold text-main">{session.studentName}</td>
                <td className="px-4 py-4 text-xs font-bold text-muted">{session.teacherName}</td>
                <td className="px-4 py-4 text-center font-mono text-micro text-error">
                  {session.date}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="inline-block rounded-lg bg-error-soft px-2 py-0.5 text-micro font-bold text-error">
                    تعويض معلق
                  </div>
                </td>
              </tr>
            ))}
            {cancelledNeedingComp.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <CheckCircle2 className="text-success/[0.13] mx-auto mb-3" size={48} />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    لا توجد تعويضات معلقة
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="space-y-3 p-4 md:hidden">
        {cancelledNeedingComp.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="text-success/[0.13] mx-auto mb-3" size={48} />
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              لا توجد تعويضات معلقة
            </p>
          </div>
        ) : (
          cancelledNeedingComp.map((session, idx) => (
            <div key={idx} className="space-y-2 rounded-xl bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold leading-tight text-main">
                  {session.studentName}
                </span>
                <div className="inline-block rounded-lg bg-error-soft px-2 py-0.5 text-micro font-bold text-error">
                  تعويض معلق
                </div>
              </div>
              <div className="flex items-center justify-between text-micro text-muted">
                <span>{session.teacherName}</span>
                <span className="font-mono text-error">{session.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}
