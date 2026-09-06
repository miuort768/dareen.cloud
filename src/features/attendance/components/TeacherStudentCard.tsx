import React, { useState, useRef } from 'react'
import { BookOpen, TrendingUp, Activity, MessageSquare, Radio, Play } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { api } from '../../../lib/api'
import type { Student, Enrollment, ScheduleSlot } from '../types'

import { ProgressBar } from '../../../shared/components/ui'
import { StudentCardTimer } from './StudentCardTimer'
import { StudentScheduleEditor } from './StudentScheduleEditor'
import { StartLiveSessionDialog } from '../../dashboard/components/StartLiveSessionDialog'

interface TeacherStudentCardProps {
  student: Student
  enrollment: Enrollment
  actualSessionsUsed: number
  onUpdateSchedule: (student: Student, enrollmentIndex: number, newSchedule: ScheduleSlot[]) => void
  onLogAttendance: (student: Student, enrollment: Enrollment) => void
  onViewHistory: (
    studentId: string,
    studentName: string,
    grade: string,
    subject: string,
    curriculum?: string,
  ) => void
  onDeleteSlot: (student: Student, enrollment: Enrollment, index: number) => void
  onUpdateNotes?: (studentId: string, subject: string, notes: string) => void
  onReschedule?: (student: Student, enrollment: Enrollment) => void
  logDate: string
  onDateChange: (date: string) => void
  scheduleBusy?: boolean
}

export const TeacherStudentCard: React.FC<TeacherStudentCardProps> = ({
  student,
  enrollment: en,
  actualSessionsUsed,
  onUpdateSchedule,
  onLogAttendance,
  onViewHistory,
  onDeleteSlot,
  onUpdateNotes,
  onReschedule,
  logDate,
  onDateChange,
  scheduleBusy = false,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(en.nextSessionNotes || '')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setNotes(en.nextSessionNotes || '')
  }, [en.nextSessionNotes])

  const triggerSave = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (value.trim() !== (en.nextSessionNotes || '').trim()) {
        setIsSavingNotes(true)
        try {
          await onUpdateNotes?.(student.id, en.subject, value)
        } finally {
          setTimeout(() => setIsSavingNotes(false), 500)
        }
      }
    }, 1500)
  }

  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  React.useEffect(() => {
    const saved = localStorage.getItem(`active_timer_${student.id}`)
    if (saved) {
      try {
        const { startedAt, subject } = JSON.parse(saved)
        if (subject === en.subject) {
          const elapsed = Math.floor((Date.now() - startedAt) / 1000)
          setTimerSeconds(elapsed)
          setTimerRunning(true)
          timerIntervalRef.current = setInterval(() => {
            setTimerSeconds(Math.floor((Date.now() - startedAt) / 1000))
          }, 1000)
        }
      } catch (e) {
        console.error('Failed to restore timer', e)
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [student.id, en.subject])

  const toggleTimer = async () => {
    if (timerRunning) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      setTimerRunning(false)
      setTimerSeconds(0)
      localStorage.removeItem(`active_timer_${student.id}`)
      try {
        const res = await api.delete<{ success: boolean; deleted?: number }>('/active-sessions', {
          body: JSON.stringify({ studentId: student.id, subject: en.subject }),
        })
        if (res && res.deleted === 0) {
          console.warn('لم تُحذف أي جلسة نشطة في الخادم — قد تكون انتهت مسبقاً')
        }
      } catch {
        console.warn('فشل إنهاء الجلسة النشطة في الخادم')
      }
    } else {
      const start = Date.now()
      setTimerSeconds(0)
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(Math.floor((Date.now() - start) / 1000))
      }, 1000)
      setTimerRunning(true)
      localStorage.setItem(
        `active_timer_${student.id}`,
        JSON.stringify({
          startedAt: start,
          subject: en.subject,
        }),
      )
      try {
        await api.post('/active-sessions', { studentId: student.id, subject: en.subject })
      } catch {
        console.warn('فشل بدء الجلسة النشطة في الخادم')
      }
    }
  }

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const attendancePercent = en.sessionsTotal > 0 ? (actualSessionsUsed / en.sessionsTotal) * 100 : 0

  const [showLiveDialog, setShowLiveDialog] = useState(false)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 transition-all hover:shadow-elevation-2">
      {/* Header Accent */}
      <div
        className={cn(
          'h-1.5 w-full bg-surface transition-all',
          timerRunning && 'animate-pulse bg-error',
        )}
      ></div>

      <div className="flex flex-1 flex-col gap-y-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-micro font-semibold text-primary">
              {student.grade?.charAt(0) || student.name.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-normal leading-tight text-main">{student.name}</h4>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-micro font-normal uppercase text-muted">{student.grade}</span>
                <span className="h-1 w-1 rounded-full bg-surface"></span>
                <div className="flex items-center gap-1">
                  <BookOpen size={10} className="text-primary" />
                  <span className="text-micro font-normal text-muted">{en.subject}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-start">
            <span className="mb-0.5 block text-micro font-normal text-muted">التقدم</span>
            <div className="flex items-center justify-end gap-1">
              <TrendingUp
                size={12}
                className={cn(attendancePercent > 85 ? 'text-error' : 'text-primary')}
              />
              <span className="text-sm font-medium leading-none text-main">
                {Math.round(attendancePercent)}%
              </span>
            </div>
          </div>
        </div>

        <StudentCardTimer
          timerRunning={timerRunning}
          timerSeconds={timerSeconds}
          onToggle={toggleTimer}
          onReschedule={() => onReschedule?.(student, en)}
          formatTime={formatTime}
        />

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-micro font-normal uppercase text-muted">
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-primary" />
              <span>تغطية الحصص</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium text-primary">{actualSessionsUsed}</span>
              <span className="opacity-50">/ {en.sessionsTotal}</span>
            </div>
          </div>
          <ProgressBar value={Math.min(100, attendancePercent)} variant="attendance" />
        </div>

        <StudentScheduleEditor
          schedule={en.schedule || []}
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          onDeleteSlot={(i) => onDeleteSlot(student, en, i)}
          onSaveSlot={(slot, editIdx) => {
            const newSch = [...(en.schedule || [])]
            if (editIdx !== null) newSch[editIdx] = slot
            else newSch.push(slot)
            onUpdateSchedule(student, student.enrollments.indexOf(en), newSch)
          }}
          busy={scheduleBusy}
        />

        {/* Notes */}
        <div className="rounded-2xl border border-e-[3px] border-border border-e-primary bg-primary-soft p-3">
          <div className="mb-2 flex items-center justify-between">
            <h5 className="flex items-center gap-1.5 text-micro font-bold uppercase text-primary">
              <MessageSquare size={12} /> ملاحظات الحصة القادمة
            </h5>
            {isSavingNotes && (
              <span className="animate-pulse text-micro font-bold text-primary">جاري الحفظ...</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value)
              triggerSave(e.target.value)
            }}
            placeholder="وثقي ملاحظات الحصة القادمة..."
            className="min-h-[60px] w-full resize-none border-none bg-transparent p-0 text-micro font-bold text-main placeholder:text-primary/60 focus-visible:ring-0"
          />
        </div>

        {/* Live Session Quick Start */}
        <button
          onClick={() => setShowLiveDialog(true)}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-micro font-bold uppercase tracking-widest text-on-primary shadow-sm transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
        >
          <Radio size={14} className="animate-pulse" />
          <span>بدء الحصة مع {student.name.split(' ')[0]}</span>
          <Play
            size={10}
            className="fill-current opacity-50 transition-transform group-hover:translate-x-[-2px]"
          />
        </button>

        {/* Attendance Footer */}
        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h5 className="flex items-center gap-1.5 text-micro font-normal uppercase text-muted">
              <Activity size={12} className="text-success" /> التحضير والمتابعة
            </h5>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="date"
              aria-label="التاريخ"
              value={logDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-2 py-2 text-micro font-bold outline-none transition-all focus-visible:border-primary"
            />
            <button
              onClick={() =>
                onViewHistory(
                  student.id,
                  student.name,
                  student.grade,
                  en.subject,
                  student.curriculum,
                )
              }
              className="w-full rounded-2xl bg-error px-1 py-2 text-micro font-bold text-on-error shadow-sm transition-all hover:bg-error-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              السجل
            </button>
            <button
              onClick={() => onLogAttendance(student, en)}
              className="w-full rounded-2xl bg-success px-2 py-2 text-micro font-bold text-on-success shadow-sm transition-all hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              تسجيل
            </button>
          </div>
        </div>
      </div>

      <StartLiveSessionDialog
        open={showLiveDialog}
        onClose={() => setShowLiveDialog(false)}
        defaultStudentId={student.id}
        defaultSubject={en.subject}
      />
    </div>
  )
}
