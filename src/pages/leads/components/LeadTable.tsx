import { memo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { Phone, MessageSquare, CheckCircle2, Trash2, Search } from 'lucide-react'
import type { Lead, LeadStatus } from '../../../features/crm/types'
import { GradientAvatar, getPriority, ActionBtn, statusColors } from './LeadsUI'
import { cn } from '../../../lib/utils'

interface LeadTableProps {
  filteredLeads: Lead[]
  updateMutation: { mutate: (args: { id: string; updates: Partial<Lead> }) => void }
  handleMarkLost: (id: string) => void
  onLeadClick: (lead: Lead) => void
}

export const LeadTable = memo(
  ({ filteredLeads, updateMutation, handleMarkLost, onLeadClick }: LeadTableProps) => {
    if (filteredLeads.length === 0) {
      return (
        <div className="hidden md:block">
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft">
              <Search size={28} className="text-primary opacity-40" />
            </div>
            <p className="text-xs font-bold text-muted">لا توجد نتائج</p>
            <p className="mt-1 text-xs text-muted">لا يوجد عملاء متطابقون مع معايير البحث</p>
          </div>
        </div>
      )
    }

    return (
      <div className="hidden md:block">
        <Virtuoso
          style={{ height: Math.min(filteredLeads.length * 56 + 60, 600) }}
          data={filteredLeads}
          itemContent={(_index, lead) => {
            const priority = getPriority(lead.priority)
            return (
              <div
                onClick={() => onLeadClick(lead)}
                className="group flex cursor-pointer items-center border-b border-border px-5 py-3.5 transition-all duration-normal hover:bg-hover"
              >
                <div className="flex w-[22%] min-w-0 items-center gap-3 px-2">
                  <GradientAvatar name={lead.studentName || 'ع'} size="sm" />
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-main">
                      {lead.studentName || 'عميل بدون اسم'}
                    </h4>
                    {lead.source && (
                      <span className="mt-0.5 inline-block rounded bg-info-soft px-1.5 py-px text-[10px] font-medium text-info">
                        {lead.source}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-[13%] px-2">
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`https://wa.me/${lead.phone}`, '_blank')
                    }}
                    className="cursor-pointer font-mono text-xs text-muted transition-colors hover:text-success"
                  >
                    {lead.phone}
                  </span>
                </div>
                <div className="w-[13%] px-2">
                  <span className="rounded-lg bg-surface px-2 py-1 text-[11px] text-muted">
                    {lead.subject}
                  </span>
                </div>
                <div className="w-[14%] px-2">
                  <select
                    className="cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[10px] font-bold text-main outline-none transition-all"
                    value={lead.status}
                    aria-label="حالة العميل"
                    onChange={(e) =>
                      updateMutation.mutate({
                        id: lead.id,
                        updates: { status: e.target.value as LeadStatus },
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(
                      [
                        'new',
                        'contacted',
                        'interested',
                        'trial',
                        'converted',
                        'lost',
                      ] as LeadStatus[]
                    ).map((key) => (
                      <option key={key} value={key} className="bg-card text-main">
                        {statusColors[key].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-[10%] px-1 text-center">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold',
                      priority.bg,
                      priority.color,
                      priority.darkBg,
                      priority.darkText,
                    )}
                  >
                    {priority.label}
                  </span>
                </div>
                <div className="flex w-[28%] items-center justify-end gap-1.5 opacity-0 transition-opacity duration-normal group-hover:opacity-100">
                  <ActionBtn
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`tel:${lead.phone}`)
                    }}
                    icon={<Phone size={14} />}
                    label="اتصال"
                    color="success"
                    title="اتصال"
                  />
                  <ActionBtn
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`https://wa.me/${lead.phone}`, '_blank')
                    }}
                    icon={<MessageSquare size={14} />}
                    label="واتساب"
                    color="success"
                    title="واتساب"
                  />
                  <ActionBtn
                    onClick={(e) => {
                      e.stopPropagation()
                      updateMutation.mutate({ id: lead.id, updates: { status: 'converted' } })
                    }}
                    icon={<CheckCircle2 size={14} />}
                    label="تم"
                    color="info"
                    title="تم التحويل"
                  />
                  <ActionBtn
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkLost(lead.id)
                    }}
                    icon={<Trash2 size={14} />}
                    label="حذف"
                    color="error"
                    title="حذف العميل"
                  />
                </div>
              </div>
            )
          }}
        />
      </div>
    )
  },
)
