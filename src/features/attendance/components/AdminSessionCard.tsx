
import React from 'react';
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import type { Session } from '../types';

interface AdminSessionCardProps {
    session: Session;
    stats: {
        used: number;
        total: number;
    };
    onUpdateStatus: (id: string, status: Session['status']) => void;
}

export const AdminSessionCard: React.FC<AdminSessionCardProps> = ({ session, stats, onUpdateStatus }) => {
    const { used, total } = stats;
    const progress = total > 0 ? (used / total) * 100 : 0;

    return (
        <div className="group relative bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all rounded-xl overflow-hidden shadow-sm hover:shadow-lg">
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight mb-1">{session.studentName}</h4>
                        <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <BookOpen size={12} className="text-primary-500" />
                            {session.subject}
                        </p>
                    </div>
                    <div className="text-xs font-black bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 font-mono">
                        {session.time}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500">حصص منفذة</span>
                        <span className="text-gray-900 dark:text-white">{used} / {total}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${progress > 80 ? 'bg-emerald-500' : progress > 50 ? 'bg-primary-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                        onClick={() => onUpdateStatus(session.id, 'completed')}
                        className={`flex-1 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-colors ${session.status === 'completed'
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-lg'
                            : 'bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                            }`}
                    >
                        <CheckCircle2 size={14} /> حاضر
                    </button>
                    <button
                        onClick={() => onUpdateStatus(session.id, 'cancelled')}
                        className={`flex-1 py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 transition-colors ${session.status === 'cancelled'
                            ? 'bg-rose-600 text-white shadow-rose-500/20 shadow-lg'
                            : 'bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50'
                            }`}
                    >
                        <XCircle size={14} /> غائب
                    </button>
                </div>
            </div>
        </div>
    );
};
