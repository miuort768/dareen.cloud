import { useState, useEffect } from 'react';
import { Clock, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { NextSession as NextSessionType } from './types';
import { EmptyState } from '../../shared/components/ui';

interface NextSessionCardProps {
    nextSession: NextSessionType | null;
}

export const NextSessionCard = ({ nextSession }: NextSessionCardProps) => {
    const navigate = useNavigate();

    if (!nextSession) {
        return (
            <div className="bg-card border border-border rounded-2xl p-5">
                <EmptyState
                    icon={Clock}
                    title="لا توجد حصص اليوم"
                    subtitle="استرح وتابع أنشطتك الأخرى"
                    compact
                />
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                    <Clock size={16} className="text-on-primary" />
                </div>
                <div>
                    <p className="text-micro text-muted font-bold">الحصة القادمة</p>
                    <p className="text-xs font-bold text-main">{nextSession.time}</p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={14} className="text-primary shrink-0" />
                        <h3 className="text-sm font-bold text-main truncate">{nextSession.subject}</h3>
                    </div>
                    {nextSession.teacher && (
                        <p className="text-micro text-muted">{nextSession.teacher}</p>
                    )}
                </div>
                <button
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-1.5 bg-primary text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-transform shrink-0"
                    aria-label={`دخول حصة ${nextSession.subject}`}
                >
                    دخول <ArrowLeft size={12} />
                </button>
            </div>
        </div>
    );
};
