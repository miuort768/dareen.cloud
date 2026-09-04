import React, { useMemo } from 'react'
import { RefreshCw, CheckCircle2 } from 'lucide-react'
import { SectionCard, SectionTitle } from './ClosingUI'
import { Table, EmptyState } from '../../../shared/components/ui'
import type { Column } from '../../../shared/components/ui'

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

interface CompensationRow {
  id: string
  studentName: string
  teacherName: string
  date: string
}

export const CompensationTable: React.FC<CompensationTableProps> = ({ filteredSessions }) => {
  const rows = useMemo<CompensationRow[]>(
    () =>
      filteredSessions
        .filter((s) => s.needsCompensation && s.status === 'cancelled')
        .map((s, i) => ({ id: `${s.date}-${s.studentName}-${i}`, ...s })),
    [filteredSessions],
  )

  const columns = useMemo<Column<CompensationRow>[]>(
    () => [
      {
        key: 'studentName',
        header: 'الطالب',
        mobileLabel: 'الطالب',
        render: (row) => <span className="text-xs font-bold text-main">{row.studentName}</span>,
      },
      {
        key: 'teacherName',
        header: 'المعلمة',
        mobileLabel: 'المعلمة',
        render: (row) => <span className="text-xs font-bold text-muted">{row.teacherName}</span>,
      },
      {
        key: 'date',
        header: 'التاريخ',
        align: 'center',
        mobileLabel: 'التاريخ',
        render: (row) => <span className="font-mono text-micro text-error">{row.date}</span>,
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        mobileLabel: 'الحالة',
        render: () => (
          <div className="inline-block rounded-lg bg-error-soft px-2 py-0.5 text-micro font-bold text-error">
            تعويض معلق
          </div>
        ),
      },
    ],
    [],
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
      <div className="p-4">
        {rows.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            iconClassName="text-success"
            title="لا توجد تعويضات معلقة"
            subtitle="جميع الإلغاءات تمت إعادة جدولتها"
          />
        ) : (
          <Table<CompensationRow>
            data={rows}
            columns={columns}
            headerVariant="surface"
            getId={(row) => row.id}
          />
        )}
      </div>
    </SectionCard>
  )
}
