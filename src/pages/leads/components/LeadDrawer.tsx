import { useState, useEffect, useRef } from 'react'
import {
  X,
  Phone,
  CheckCircle2,
  UserPlus,
  Tag,
  Calendar,
  Save,
  Edit,
  MessageSquare,
} from 'lucide-react'
import { cn } from '../../../lib/utils'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../../../shared/components/ui/Button'
import type { Lead, LeadStatus, LeadPriority } from '../../../features/crm/types'
import { GradientAvatar, getLeadAge, statusColors, getPriority } from './LeadsUI'

interface LeadDrawerProps {
  lead: Lead | null
  onClose: () => void
  updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void }
}

const formatRelativeTime = (dateStr: string) => {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} أيام`
  return date.toLocaleDateString('ar-SA')
}

interface TimelineEvent {
  id: string
  type: 'created' | 'status_changed' | 'note_added' | 'called' | 'whatsapp' | 'converted'
  label: string
  date: string
  icon: LucideIcon
  color: string
  bg: string
}

type LeadWithTimestamps = Lead & { updatedAt?: string }

const getTimelineEvents = (lead: LeadWithTimestamps): TimelineEvent[] => {
  const events: TimelineEvent[] = []
  events.push({
    id: '1',
    type: 'created',
    label: 'تم تسجيل العميل',
    date: lead.createdAt,
    icon: UserPlus,
    color: 'text-info',
    bg: 'bg-info-soft',
  })
  if (lead.status === 'contacted')
    events.push({
      id: '2',
      type: 'called',
      label: 'تم الاتصال بالعميل',
      date: lead.updatedAt || lead.createdAt,
      icon: Phone,
      color: 'text-warning',
      bg: 'bg-warning-soft',
    })
  if (lead.status === 'interested')
    events.push({
      id: '3',
      type: 'note_added',
      label: 'أبدى اهتمام',
      date: lead.updatedAt || lead.createdAt,
      icon: Tag,
      color: 'text-success',
      bg: 'bg-success-soft',
    })
  if (lead.status === 'trial')
    events.push({
      id: '4',
      type: 'note_added',
      label: 'حصة تجريبية',
      date: lead.updatedAt || lead.createdAt,
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary-soft',
    })
  if (lead.status === 'converted')
    events.push({
      id: '5',
      type: 'converted',
      label: 'تم التحويل إلى مشترك',
      date: lead.updatedAt || lead.createdAt,
      icon: CheckCircle2,
      color: 'text-info',
      bg: 'bg-info-soft',
    })
  return events
}

const statusRingColor: Record<LeadStatus, string> = {
  new: 'ring-info',
  contacted: 'ring-warning',
  interested: 'ring-success',
  trial: 'ring-primary',
  converted: 'ring-info',
  lost: 'ring-error',
}

export const LeadDrawer = ({ lead, onClose, updateMutation }: LeadDrawerProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ phone: '', subject: '', curriculum: '', notes: '' })
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (lead) {
      setEditData({
        phone: lead.phone,
        subject: lead.subject,
        curriculum: lead.curriculum || '',
        notes: lead.notes || '',
      })
    }
    setIsEditing(false)
  }, [lead])

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  if (!lead) return null

  const age = getLeadAge(lead.createdAt)
  const timeline = getTimelineEvents(lead)
  const priority = getPriority(lead.priority as LeadPriority)
  const cfg = statusColors[lead.status as LeadStatus]

  const handleSave = () => {
    updateMutation.mutate({
      id: lead.id,
      updates: {
        phone: editData.phone,
        subject: editData.subject,
        curriculum: editData.curriculum,
        notes: editData.notes,
      },
    })
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="p-2.5 sm:p-4"
      dir="rtl"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 dark:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-l from-primary to-primary-deep px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  'rounded-full ring-2 ring-offset-2 ring-offset-transparent',
                  statusRingColor[lead.status as LeadStatus],
                )}
              >
                <GradientAvatar name={lead.studentName || 'ع'} size="md" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-primary">
                {lead.studentName || 'عميل بدون اسم'}
              </h3>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold',
                    cfg.bg,
                    cfg.color,
                    cfg.darkBg,
                    cfg.darkText,
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                  {cfg.label}
                </span>
                <span
                  className={cn(
                    'rounded-lg px-2 py-0.5 text-[9px] font-bold',
                    age.color,
                    'bg-white/15 text-white/80',
                  )}
                >
                  {age.text}
                </span>
              </div>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 transition-all hover:bg-white/25"
            aria-label="إغلاق"
          >
            <X size={14} className="text-on-primary" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          <div className="mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-primary-soft bg-primary-soft p-3">
                <div className="mb-1 text-[10px] font-bold text-primary">الهاتف</div>
                {isEditing ? (
                  <input
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-2 py-1 text-sm font-bold text-main outline-none focus:border-primary"
                    dir="ltr"
                    style={{ textAlign: 'right' }}
                  />
                ) : (
                  <p className="font-mono text-sm font-bold text-main" dir="ltr">
                    {lead.phone}
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-success-soft bg-success-soft p-3">
                <div className="mb-1 text-[10px] font-bold text-success">المادة</div>
                {isEditing ? (
                  <input
                    value={editData.subject}
                    onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-2 py-1 text-sm font-bold text-main outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-sm font-bold text-main">{lead.subject || '—'}</p>
                )}
              </div>
              <div className="rounded-xl border border-info-soft bg-info-soft p-3">
                <div className="mb-1 text-[10px] font-bold text-info">المنهج</div>
                {isEditing ? (
                  <input
                    value={editData.curriculum}
                    onChange={(e) => setEditData({ ...editData, curriculum: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-2 py-1 text-sm font-bold text-main outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-sm font-bold text-main">{lead.curriculum || '—'}</p>
                )}
              </div>
              <div className="rounded-xl bg-surface p-3">
                <div className="mb-1 text-[10px] text-muted">الأولوية</div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded-lg px-2 py-0.5 text-[10px] font-bold',
                      priority.bg,
                      priority.color,
                      priority.darkBg,
                      priority.darkText,
                    )}
                  >
                    {priority.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-warning-soft bg-warning-soft p-3">
              <div className="mb-1 text-[10px] font-bold text-warning">ملاحظات</div>
              {isEditing ? (
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-card px-2 py-1 text-sm font-bold text-main outline-none focus:border-primary"
                />
              ) : (
                <p className="text-sm leading-relaxed text-main">
                  {lead.notes || 'لا توجد ملاحظات'}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} variant="primary" size="sm" className="flex-1">
                  <Save size={12} /> حفظ
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => window.open(`tel:${lead.phone}`)}
                  variant="primary"
                  size="sm"
                >
                  <Phone size={12} /> اتصال
                </Button>
                <Button
                  onClick={() =>
                    window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`, '_blank')
                  }
                  variant="success"
                  size="sm"
                >
                  <MessageSquare size={12} /> واتساب
                </Button>
                <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">
                  <Edit size={12} /> تعديل
                </Button>
                {lead.status !== 'converted' && (
                  <Button
                    onClick={() =>
                      updateMutation.mutate({
                        id: lead.id,
                        updates: { status: 'converted' as LeadStatus },
                      })
                    }
                    variant="premium"
                    size="sm"
                  >
                    <CheckCircle2 size={12} /> تحويل
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="px-4 pb-4">
          <h4 className="mb-2 text-[11px] font-bold text-muted">النشاطات</h4>
          <div className="space-y-2">
            {timeline.map((event) => {
              const Icon = event.icon
              return (
                <div key={event.id} className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                      event.bg,
                    )}
                  >
                    <Icon size={12} className={event.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-main">{event.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {formatRelativeTime(event.date)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
