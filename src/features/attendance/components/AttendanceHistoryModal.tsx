import { createPortal } from 'react-dom'
import { useDialogFocus } from '../../../shared/hooks/useDialogFocus'
import { X, Clock } from 'lucide-react'
import { AttendanceHistoryList } from './AttendanceHistoryList'

interface AttendanceHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  studentName: string
  studentId: string
  teacherName: string
  studentGrade?: string
  studentSubject?: string
  studentCurriculum?: string
  canDelete?: boolean
  onSessionChange?: () => void
}

export const AttendanceHistoryModal = ({
  isOpen,
  onClose,
  studentName,
  studentId,
  studentGrade,
  studentSubject,
  studentCurriculum,
  canDelete = true,
  onSessionChange,
}: AttendanceHistoryModalProps) => {
  const { containerRef, handleKeyDown } = useDialogFocus(isOpen, onClose)

  if (!isOpen) return null

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[150] flex items-end justify-center md:items-center md:p-3"
      role="dialog"
      aria-modal="true"
      aria-label={studentName}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative flex max-h-[75vh] w-full max-w-xs flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2 md:max-w-3xl">
        {/* Compact Header */}
        <div className="flex items-center justify-between bg-primary px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Clock size={14} className="text-on-primary" />
            <div className="min-w-0">
              <h3 className="truncate text-xs font-bold text-on-primary">سجل الحضور</h3>
              <p className="truncate text-[10px] text-white/90">{studentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-2xl bg-white/15 text-on-primary outline-none transition-colors hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="إغلاق"
          >
            <X size={14} />
          </button>
        </div>

        <AttendanceHistoryList
          studentId={studentId}
          studentGrade={studentGrade}
          studentSubject={studentSubject}
          studentCurriculum={studentCurriculum}
          canDelete={canDelete}
          onSessionChange={onSessionChange}
          className="min-h-0 flex-1"
        />

        {/* Footer */}
        <div className="border-t border-border px-3 py-2">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-surface py-2 text-[10px] font-bold text-main outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
