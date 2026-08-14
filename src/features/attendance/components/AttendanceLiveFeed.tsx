import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, BookOpen, GraduationCap, Zap } from 'lucide-react';
import type { Session } from '../types';

interface AttendanceLiveFeedProps {
    sessions: Session[];
}

const statusConfig: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string; label: string; dotColor: string }> = {
    completed: { icon: CheckCircle2, color: 'text-success', label: 'حضور', dotColor: 'bg-success' },
    cancelled: { icon: XCircle, color: 'text-error', label: 'غياب', dotColor: 'bg-error' },
    scheduled: { icon: Clock, color: 'text-warning', label: 'مجدولة', dotColor: 'bg-warning' },
};

export const AttendanceLiveFeed = ({ sessions }: AttendanceLiveFeedProps) => {
    const endRef = useRef<HTMLDivElement>(null);
    const sorted = [...sessions].sort((a, b) => a.time.localeCompare(b.time));

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [sessions.length]);

    if (!sessions.length) {
        return (
            <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center mx-auto mb-3">
                    <Zap size={20} className="text-muted" />
                </div>
                <p className="text-xs font-bold text-muted">لا توجد جلسات اليوم</p>
                <p className="text-[9px] text-muted mt-1">سيتم عرض الجلسات فور إضافتها</p>
            </div>
        );
    }

    const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-primary-soft text-primary">
                        <Zap size={12} />
                    </div>
                    <span className="text-xs font-bold text-main">البث المباشر</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                    <span className="text-[9px] font-bold text-success">{sorted.length} جلسة</span>
                    <span className="text-[9px] text-muted">•</span>
                    <span className="text-[9px] text-muted">{today}</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="px-4 py-3 max-h-80 overflow-y-auto space-y-0">
                {sorted.map((session, idx) => {
                    const cfg = statusConfig[session.status] || statusConfig.scheduled;
                    const Icon = cfg.icon;
                    return (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="relative flex gap-3 pb-3 last:pb-0"
                        >
                            {/* Timeline line + dot */}
                            <div className="flex flex-col items-center shrink-0">
                                <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-card ${cfg.dotColor} z-10`} />
                                {idx < sorted.length - 1 && <div className="w-px flex-1 bg-border mt-0.5" />}
                            </div>

                            {/* Content card */}
                            <div className={`flex-1 min-w-0 pb-2 ${idx < sorted.length - 1 ? 'border-b border-border/50' : ''}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-main truncate">{session.studentName}</span>
                                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold ${cfg.color} bg-surface`}>
                                                <Icon size={8} />
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-[9px] text-muted">
                                                <GraduationCap size={8} />
                                                {session.teacherName}
                                            </span>
                                            <span className="flex items-center gap-1 text-[9px] text-muted">
                                                <BookOpen size={8} />
                                                {session.subject}
                                            </span>
                                            <span className="flex items-center gap-1 text-[9px] text-muted">
                                                <Clock size={8} />
                                                {session.time}
                                            </span>
                                        </div>
                                        {session.topics && (
                                            <p className="text-[8px] text-muted mt-1.5 line-clamp-1">
                                                <span className="font-bold">الموضوع:</span> {session.topics}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={endRef} />
            </div>
        </motion.div>
    );
};