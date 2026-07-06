import React from 'react';
import { MessageCircle, Phone, CheckCircle2 } from 'lucide-react';
import { SectionCard } from './ClosingUI';
import { Badge } from '../../../shared/components/ui';

interface RenewalItem {
    studentName: string;
    subject: string;
    remaining: number;
    waLink: string;
    phone: string;
}

interface RenewalsCardsProps {
    renewalsData: RenewalItem[];
}

export const RenewalsCards: React.FC<RenewalsCardsProps> = ({ renewalsData }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renewalsData.map((item, idx) => (
                <SectionCard key={idx} className="p-5 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="text-sm font-bold text-main leading-tight">{item.studentName}</h3>
                                <p className="text-micro font-bold text-primary mt-0.5">{item.subject}</p>
                            </div>
                            <Badge variant="warning" size="sm">رصيد منخفض</Badge>
                        </div>
                        <div className="bg-surface dark:bg-card p-3 flex items-center justify-between mb-4 border border-border rounded-xl">
                            <span className="text-micro font-bold text-muted">الحصص المتبقية</span>
                            <span className="text-lg font-black text-main font-mono">{item.remaining}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => window.open(item.waLink, '_blank')} className="flex items-center justify-center gap-1.5 py-2.5 bg-success hover:brightness-90 text-on-success text-micro font-bold transition-all shadow-sm active:scale-95 rounded-xl"><MessageCircle size={14} /> واتساب</button>
                        <a href={`tel:${item.phone}`} className="flex items-center justify-center gap-1.5 py-2.5 bg-primary hover:brightness-90 text-on-primary text-micro font-bold transition-all shadow-sm active:scale-95 rounded-xl"><Phone size={14} /> اتصال</a>
                    </div>
                </SectionCard>
            ))}
            {renewalsData.length === 0 && (
                <div className="col-span-full py-20 text-center bg-card border border-border rounded-xl shadow-sm">
                    <CheckCircle2 className="mx-auto mb-3 text-primary opacity-20" size={48} />
                    <p className="text-xs font-bold text-muted">لا توجد تجديدات مطلوبة</p>
                </div>
            )}
        </div>
    );
};
