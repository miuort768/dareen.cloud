import React, { useState } from 'react';
import { Target, BarChart3, ChevronLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { CommitmentRate } from './CommitmentRate';
import { SubjectStats } from './SubjectStats';

interface DashboardAnalyticsProps {
    commitmentData: any;
    subjectStats: any;
}

export const DashboardAnalytics = ({ commitmentData, subjectStats }: DashboardAnalyticsProps) => {
    const [activeTab, setActiveTab] = useState<'commitment' | 'stats'>('commitment');

    return (
        <div className="w-full space-y-6">
            {/* --- DESKTOP VIEW --- */}
            <div className="hidden lg:grid grid-cols-12 gap-8 items-stretch pt-4">
                {/* 1. Commitment Rate (Side Card) */}
                <div className="col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Target size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">معدل الالتزام</h3>
                    </div>
                    <CommitmentRate rates={commitmentData} />
                </div>

                {/* 2. Subject Stats (Main Card) */}
                <div className="col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm p-8">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center">
                                <BarChart3 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">إحصائيات قاعدة البيانات</h3>
                        </div>
                        <button className="text-slate-400 hover:text-[#5c59f2] transition-colors flex items-center gap-1 font-bold text-sm">
                            عرض التفاصيل
                            <ChevronLeft size={16} />
                        </button>
                    </div>
                    <SubjectStats stats={subjectStats} />
                </div>
            </div>

            {/* --- MOBILE VIEW (Tabs Style) --- */}
            <div className="lg:hidden space-y-4">
                {/* Mobile Navigation Tabs */}
                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl flex gap-2 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('commitment')}
                        className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                            activeTab === 'commitment' ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-slate-400"
                        )}
                    >
                        <Target size={16} />
                        الالتزام
                    </button>
                    <button 
                        onClick={() => setActiveTab('stats')}
                        className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                            activeTab === 'stats' ? "bg-amber-50 text-amber-600 shadow-sm" : "text-slate-400"
                        )}
                    >
                        <BarChart3 size={16} />
                        الإحصائيات
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    {activeTab === 'commitment' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="flex items-center gap-3 mb-6">
                                <h3 className="font-bold text-slate-800 dark:text-white">معدل التزام الطلاب</h3>
                            </div>
                            <CommitmentRate rates={commitmentData} />
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="flex items-center gap-3 mb-6">
                                <h3 className="font-bold text-slate-800 dark:text-white">إحصائيات المواد والبيانات</h3>
                            </div>
                            <SubjectStats stats={subjectStats} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
