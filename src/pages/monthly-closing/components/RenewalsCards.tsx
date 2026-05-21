import React from 'react';
import { MessageCircle, Phone, CheckCircle2 } from 'lucide-react';
import { SectionCard } from './ClosingUI';

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
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{item.studentName}</h3>
                                <p className="text-[10px] font-bold text-[#5c59f2] mt-0.5">{item.subject}</p>
                            </div>
                            <div className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-md text-[9px] font-bold">رصيد منخفض</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between mb-4 border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400">الحصص المتبقية</span>
                            <span className="text-lg font-black text-slate-800 dark:text-white font-mono">{item.remaining}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => window.open(item.waLink, '_blank')} className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-700 transition-all"><MessageCircle size={14} /> واتساب</button>
                        <a href={`tel:${item.phone}`} className="flex items-center justify-center gap-1.5 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-black transition-all"><Phone size={14} /> اتصال</a>
                    </div>
                </SectionCard>
            ))}
            {renewalsData.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="mx-auto mb-3 text-slate-100 dark:text-slate-800" size={48} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">لا توجد تجديدات مطلوبة</p>
                </div>
            )}
        </div>
    );
};
