import { motion } from 'framer-motion'
import { Phone, MessageSquare, Trash2, Search, Clock, CalendarCheck, FileText } from 'lucide-react'
import type { Lead, LeadStatus } from '../../../features/crm/types'
import { GradientAvatar, StatusChip, getPriority, getLeadAge } from './LeadsUI'
import { cn } from '../../../lib/utils'

interface LeadCardsProps {
  filteredLeads: Lead[]
  updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void }
  handleMarkLost: (id: string) => void
  onLeadClick: (lead: Lead) => void
}

export const LeadCards = ({
  filteredLeads,
  updateMutation,
  handleMarkLost,
  onLeadClick,
}: LeadCardsProps) => {
  return (
    <div className="md:hidden">
      {filteredLeads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-20 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
            <Search size={28} className="text-primary opacity-40" />
          </div>
          <p className="mb-1 text-xs font-bold text-muted">لا توجد نتائج</p>
          <p className="text-xs text-muted">لا يوجد عملاء متطابقون مع معايير البحث</p>
        </motion.div>
      ) : (
        <div className="space-y-3 p-3">
          {filteredLeads.map((lead, idx) => {
            const priority = getPriority(lead.priority)
            const age = getLeadAge(lead.createdAt)
            return (
              <motion.article
                key={lead.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                onClick={() => onLeadClick(lead)}
                className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1 outline-none transition-transform duration-normal hover:shadow-elevation-2 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.99] dark:shadow-none"
              >
                {/* Identity */}
                <div className="flex items-start justify-between gap-2 px-3.5 pt-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <GradientAvatar name={lead.studentName || 'ع'} size="md" />
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-main">
                        {lead.studentName || 'عميل بدون اسم'}
                      </h4>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusChip status={lead.status as LeadStatus} size="sm" />
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold',
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
                  <span className="flex shrink-0 items-center gap-1 pt-1 text-[10px] font-medium text-muted">
                    <Clock size={10} />
                    {age.text}
                  </span>
                </div>

                {/* Phone */}
                <div className="mx-3.5 mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
                  <Phone size={13} className="shrink-0 text-muted" />
                  <span dir="ltr" className="text-xs font-bold tracking-wide text-main">
                    {lead.phone}
                  </span>
                </div>

                {/* Tags */}
                {(lead.subject || lead.curriculum || lead.source) && (
                  <div className="flex flex-wrap items-center gap-1.5 px-3.5 pt-2.5">
                    {lead.curriculum && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-1 text-[10px] font-bold text-muted">
                        <FileText size={9} />
                        {lead.curriculum}
                      </span>
                    )}
                    {lead.subject && (
                      <span className="rounded-full bg-primary-soft px-2 py-1 text-[10px] font-bold text-primary">
                        {lead.subject}
                      </span>
                    )}
                    {lead.source && (
                      <span className="rounded-full bg-info-soft px-2 py-1 text-[10px] font-bold text-info">
                        {lead.source}
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {lead.notes && (
                  <div className="mx-3.5 mt-2.5 rounded-xl bg-success-soft px-3 py-2.5">
                    <p className="line-clamp-2 text-[11px] font-medium leading-relaxed text-main">
                      "{lead.notes}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-3.5 flex items-center gap-2 border-t border-border bg-surface px-3.5 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`tel:${lead.phone}`)
                    }}
                    aria-label="اتصال مباشر"
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-main text-xs font-black text-background shadow-elevation-1 outline-none transition-all hover:opacity-90 focus-visible:ring-2 focus-visible:ring-focus active:scale-[0.97]"
                  >
                    <Phone size={14} />
                    اتصال مباشر
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`https://wa.me/${lead.phone}`, '_blank')
                    }}
                    aria-label="رسالة واتساب"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft text-success outline-none transition-all hover:bg-success-light focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                  >
                    <MessageSquare size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } })
                    }}
                    aria-label="تحويل إلى مشترك"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-soft text-info outline-none transition-all hover:bg-info-light focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                  >
                    <CalendarCheck size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkLost(lead.id)
                    }}
                    aria-label="نقل إلى المفقودين"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-soft text-error outline-none transition-all hover:bg-error-light focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.article>
            )
          })}
        </div>
      )}
    </div>
  )
}
