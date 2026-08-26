import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  Save,
  XSquare,
} from 'lucide-react'
import { api } from '../../../lib/api'
import { Skeleton } from '../../../shared/components/ui'
import { cn } from '../../../lib/utils'
import { useShowNotification } from '../../../context/AppContext'
import { confirm } from '../../../lib/confirmDialog'
import type { Session } from '../types'

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
  teacherName,
  studentGrade,
  studentSubject,
  studentCurriculum,
  canDelete = true,
  onSessionChange,
}: AttendanceHistoryModalProps) => {
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const showNotification = useShowNotification()
  const containerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: history = [], isLoading: loading } = useQuery({
    queryKey: ['attendance-history', studentId, teacherName, studentSubject],
    queryFn: async () => {
      const data = await api.get<Session[]>(
        `/sessions?studentId=${studentId}&q=${encodeURIComponent(teacherName)}`,
      )
      const sessions = Array.isArray(data) ? data : []
      return sessions
        .filter(
          (s) =>
            s.studentId === studentId &&
            s.teacherName === teacherName &&
            (studentSubject ? s.subject === studentSubject : true) &&
            (s.status === 'completed' || s.status === 'cancelled'),
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },
    enabled: isOpen && !!studentId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] })
      onSessionChange?.()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { date: string; status: string; day: string }
    }) => api.patch(`/sessions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] })
      onSessionChange?.()
      setEditingSession(null)
    },
  })

  const handleDelete = async (id: string) => {
    if (
      !(await confirm({
        title: 'حذف السجل',
        description: 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.',
        confirmText: 'حذف',
        cancelText: 'إلغاء',
      }))
    )
      return

    setDeletingId(id)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting session:', error)
      showNotification('حدث خطأ أثناء الحذف', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdate = async () => {
    if (!editingSession) return
    try {
      await updateMutation.mutateAsync({
        id: editingSession.id,
        data: {
          date: editingSession.date,
          status: editingSession.status,
          day: new Date(editingSession.date).toLocaleDateString('ar-EG', {
            weekday: 'long',
          }),
        },
      })
    } catch (error) {
      console.error('Error updating session:', error)
      showNotification('حدث خطأ أثناء التحديث', 'error')
    }
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    },
    [onClose],
  )

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[150] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label={studentName}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative flex max-h-[75vh] w-full max-w-xs flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-2">
        {/* Compact Header */}
        <div className="flex items-center justify-between bg-primary px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Clock size={14} className="text-on-primary" />
            <div className="min-w-0">
              <h3 className="truncate text-xs font-bold text-on-primary">سجل الحضور</h3>
              <p className="truncate text-[10px] text-white/70">{studentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-on-primary transition-colors hover:bg-white/25"
            aria-label="إغلاق"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 border-b border-border bg-surface px-4 py-2">
          {studentGrade && (
            <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold text-primary">
              الصف {studentGrade}
            </span>
          )}
          {studentSubject && (
            <span className="rounded bg-success-soft px-1.5 py-0.5 text-[9px] font-bold text-success">
              {studentSubject}
            </span>
          )}
          {studentCurriculum && (
            <span className="rounded bg-info-soft px-1.5 py-0.5 text-[9px] font-bold text-info">
              {studentCurriculum}
            </span>
          )}
          <span className="me-auto rounded bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold text-primary">
            {history.length} سجل
          </span>
        </div>

        {/* List */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={`skel-${i}`} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-2">
              {history.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'rounded-lg border bg-surface p-2.5',
                    session.status === 'completed' ? 'border-success-soft' : 'border-error-soft',
                  )}
                >
                  {editingSession?.id === session.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        aria-label="تاريخ الجلسة"
                        value={editingSession.date}
                        onChange={(e) =>
                          setEditingSession({
                            ...editingSession,
                            date: e.target.value,
                          })
                        }
                        className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10"
                      />
                      <select
                        value={editingSession.status}
                        onChange={(e) =>
                          setEditingSession({
                            ...editingSession,
                            status: e.target.value as 'completed' | 'cancelled',
                          })
                        }
                        aria-label="حالة الحضور"
                        className="rounded-lg border border-border bg-card px-2 py-1 text-[10px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/10"
                      >
                        <option value="completed">حضور</option>
                        <option value="cancelled">غياب</option>
                      </select>
                      <div className="me-auto flex gap-1">
                        <button
                          onClick={handleUpdate}
                          className="rounded-lg bg-success-soft p-1.5 text-success transition-all active:scale-95"
                          aria-label="حفظ"
                        >
                          <Save size={12} />
                        </button>
                        <button
                          onClick={() => setEditingSession(null)}
                          className="rounded-lg bg-surface p-1.5 text-muted transition-all"
                          aria-label="إلغاء"
                        >
                          <XSquare size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-lg',
                            session.status === 'completed' ? 'bg-success-soft' : 'bg-error-soft',
                          )}
                        >
                          {session.status === 'completed' ? (
                            <CheckCircle2 size={14} className="text-success" />
                          ) : (
                            <XCircle size={14} className="text-error" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={10} className="text-muted" />
                            <span className="text-[10px] font-bold text-main">{session.date}</span>
                            <span className="rounded bg-surface px-1 py-0.5 text-[8px] font-bold text-muted">
                              {session.day}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted">
                            {session.subject} - {session.time}
                          </p>
                          {session.topics && (
                            <p className="mt-0.5 line-clamp-1 text-[9px] text-muted">
                              {session.topics}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-bold',
                            session.status === 'completed'
                              ? 'bg-success-soft text-success'
                              : 'bg-error-soft text-error',
                          )}
                        >
                          {session.status === 'completed' ? 'حضور' : 'غياب'}
                        </span>
                        <button
                          onClick={() => setEditingSession(session)}
                          className="rounded p-1 text-muted transition-all hover:text-primary"
                          aria-label="تعديل"
                        >
                          <Edit2 size={10} />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="rounded p-1 text-muted transition-all hover:text-error"
                            aria-label="حذف"
                            disabled={deletingId === session.id}
                          >
                            {deletingId === session.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-error border-t-transparent" />
                            ) : (
                              <Trash2 size={10} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle size={20} className="mb-1.5 text-muted" />
              <p className="text-[10px] text-muted">لا يوجد سجلات حضور سابقة</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-3 py-2">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-surface py-2 text-[10px] font-bold text-main transition-colors hover:bg-hover"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
