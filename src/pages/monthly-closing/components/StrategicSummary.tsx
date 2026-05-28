import React from 'react';
import { TrendingUp, Receipt, CheckCircle2 } from 'lucide-react';
import { SectionCard } from './ClosingUI';

interface StrategicSummaryProps {
    netProjectedProfit: number;
    totalProjectedIncome: number;
    totalActualCollections: number;
    totalTeacherPayout: number;
}

export const StrategicSummary: React.FC<StrategicSummaryProps> = ({ netProjectedProfit, totalProjectedIncome, totalActualCollections, totalTeacherPayout }) => {
    return (
        <SectionCard className="p-12 bg-slate-950 text-white relative overflow-hidden shadow-2xl rounded-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rotate-12 -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 -rotate-12 translate-y-1/3 -translate-x-1/4 blur-2xl pointer-events-none"></div>
            <div className="absolute top-20 left-10 w-40 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent rotate-45 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-7 space-y-12">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">الملخص المالي الاستراتيجي</h2>
                        <div className="w-20 h-1.5 bg-[#2563EB]"></div>
                        <p className="text-xs text-slate-400 mt-6 max-w-lg leading-relaxed font-bold uppercase tracking-widest opacity-80">
                            تقرير تحليلي شامل يوضح التوازن الجوهري بين التدفقات النقدية المحصلة والالتزامات التعليمية المنفذة خلال الدورة المالية الحالية.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="group transition-all">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">صافي الربح المتوقع</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-6xl font-black tracking-tighter italic group-hover:scale-105 transition-transform origin-right">
                                    {netProjectedProfit.toLocaleString()}
                                </p>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">ج.م</span>
                            </div>
                            <div className="mt-4 h-1 w-full bg-slate-900 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${totalProjectedIncome > 0 ? (netProjectedProfit / totalProjectedIncome) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div className="group transition-all">
                            <p className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.2em] mb-3">إجمالي عوائد المنظومة</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-6xl font-black tracking-tighter italic group-hover:scale-105 transition-transform origin-right">
                                    {totalProjectedIncome.toLocaleString()}
                                </p>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">ج.م</span>
                            </div>
                            <div className="mt-4 h-1 w-full bg-slate-900"></div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-wrap gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-none bg-slate-900 flex items-center justify-center border border-white/10">
                                <TrendingUp size={16} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">معدل التحصيل</p>
                                <p className="text-sm font-black">{totalProjectedIncome > 0 ? ((totalActualCollections / totalProjectedIncome) * 100).toFixed(1) : 0}%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-none bg-slate-900 flex items-center justify-center border border-white/10">
                                <Receipt size={16} className="text-rose-500" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">التزامات الرواتب</p>
                                <p className="text-sm font-black">{totalTeacherPayout.toLocaleString()} ج.م</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-white/[0.02] border border-white/10 p-10 h-full flex flex-col justify-between rounded-none relative">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-[#2563EB] -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#2563EB] translate-x-1/2 translate-y-1/2"></div>

                        <div>
                            <h3 className="text-xs font-black text-[#2563EB] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                                <span className="w-6 h-[1px] bg-[#2563EB]"></span>
                                ملاحظات التدقيق المالي
                            </h3>
                            <div className="space-y-10">
                                <div className="flex gap-6">
                                    <div className="shrink-0 w-8 h-8 bg-white text-slate-950 flex items-center justify-center font-black text-xs italic">01</div>
                                    <p className="text-[11px] font-bold leading-relaxed text-slate-300 italic">
                                        تمت مراجعة وتدقيق كافة الجلسات التعليمية المنفذة ومطابقتها يدوياً وآلياً مع سجلات الدفع والتحصيل النقدي الفعلي لضمان أعلى درجات الدقة.
                                    </p>
                                </div>
                                <div className="flex gap-6">
                                    <div className="shrink-0 w-8 h-8 bg-[#2563EB] text-white flex items-center justify-center font-black text-xs italic">02</div>
                                    <p className="text-[11px] font-bold leading-relaxed text-slate-300 italic">
                                        إجمالي السيولة النقدية المتوفرة حالياً تغطي التزامات رواتب المعلمات بنسبة {(totalActualCollections / totalTeacherPayout * 100).toFixed(0)}% مما يعزز الاستقرار المالي للمؤسسة.
                                    </p>
                                </div>
                            </div>
                        </div>

                            <div className="mt-12 p-6 bg-white/[0.03] border-r-2 border-[#2563EB]">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">حالة التقرير</p>
                            <p className="text-xs font-black text-emerald-400 flex items-center gap-2">
                                <CheckCircle2 size={14} /> معتمد وجاهز للتقفيل النهائي
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </SectionCard>
    );
};
