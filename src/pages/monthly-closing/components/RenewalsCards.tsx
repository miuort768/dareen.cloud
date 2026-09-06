import React from 'react'
import { MessageCircle, Phone, CheckCircle2 } from 'lucide-react'
import { SectionCard } from './ClosingUI'
import { Badge } from '../../../shared/components/ui'

interface RenewalItem {
  studentName: string
  subject: string
  remaining: number
  waLink: string
  phone: string
}

interface RenewalsCardsProps {
  renewalsData: RenewalItem[]
}

export const RenewalsCards: React.FC<RenewalsCardsProps> = ({ renewalsData }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {renewalsData.map((item, idx) => (
        <SectionCard key={idx} className="flex h-full flex-col justify-between p-5">
          <div>
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold leading-tight text-main">{item.studentName}</h3>
                <p className="mt-0.5 text-micro font-bold text-primary">{item.subject}</p>
              </div>
              <Badge variant="warning" size="sm">
                رصيد منخفض
              </Badge>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface p-3">
              <span className="text-micro font-bold text-muted">الحصص المتبقية</span>
              <span className="font-mono text-lg font-bold text-main">{item.remaining}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.open(item.waLink, '_blank')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-success py-2.5 text-micro font-bold text-on-success outline-none transition-all hover:brightness-90 focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              <MessageCircle size={14} /> واتساب
            </button>
            <a
              href={`tel:${item.phone}`}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-micro font-bold text-on-primary outline-none transition-all hover:brightness-90 focus-visible:ring-2 focus-visible:ring-focus active:scale-95"
            >
              <Phone size={14} /> اتصال
            </a>
          </div>
        </SectionCard>
      ))}
      {renewalsData.length === 0 && (
        <div className="col-span-full rounded-xl border border-border bg-card py-20 text-center">
          <CheckCircle2 className="mx-auto mb-3 text-primary opacity-20" size={48} />
          <p className="text-xs font-bold text-muted">لا توجد تجديدات مطلوبة</p>
        </div>
      )}
    </div>
  )
}
