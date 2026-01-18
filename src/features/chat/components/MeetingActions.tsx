import React from 'react';
import { Video } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Conversation } from '../../../types/chat.types';
import type { User } from '../../../types/auth';
import { useApp } from '../../../context/AppContext';

interface MeetingActionsProps {
    selectedConv: Conversation | null;
    currentUser: User | null;
    onStartMeeting: () => void;
    isMeetingActive?: boolean;
}

export const MeetingActions: React.FC<MeetingActionsProps> = ({
    selectedConv,
    currentUser,
    onStartMeeting,
    isMeetingActive = false
}) => {
    const { showNotification } = useApp();
    if (!selectedConv) return null;

    const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    const handleAction = () => {
        if (!isTeacherOrAdmin && !isMeetingActive) {
            showNotification('لم تبدأ الحصة بعد، يرجى الانتظار حتى تقوم المعلمة ببث الاجتماع.', 'warning');
            return;
        }
        onStartMeeting();
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleAction}
                className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 lg:px-6 text-white font-black text-[11px] uppercase tracking-[0.15em] transition-all active:scale-95 shadow-2xl rounded-xl overflow-hidden group border-none outline-none",
                    isTeacherOrAdmin
                        ? "bg-gradient-to-br from-primary-600 to-primary-800 hover:from-primary-500 hover:to-primary-700 shadow-primary-600/30"
                        : isMeetingActive
                            ? "bg-gradient-to-br from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 shadow-rose-600/40 animate-pulse border-2 border-white/20"
                            : "bg-gray-400 dark:bg-gray-800 opacity-60 grayscale cursor-not-allowed"
                )}
                title={isTeacherOrAdmin ? "بدء بث مباشر للحصة" : isMeetingActive ? "انضمام للبث المباشر" : "الحصة لم تبدأ بعد"}
            >
                {/* Visual indicator for active meeting */}
                {(isMeetingActive || isTeacherOrAdmin) && (
                    <span className={cn(
                        "w-2 h-2 rounded-full absolute top-2 right-2",
                        isMeetingActive ? "bg-white animate-pulse" : "bg-primary-300 opacity-50"
                    )} />
                )}

                <Video size={18} className={cn("transition-transform group-hover:scale-110", isMeetingActive && "animate-pulse")} />

                <span className="hidden lg:inline relative z-10">
                    {isTeacherOrAdmin
                        ? "بدء الاجتماع"
                        : isMeetingActive
                            ? "الحصة بدأت - اضغط للدخول"
                            : "الحصة لم تبدأ بعد"
                    }
                </span>

                {/* Glass effect on hover if clickable */}
                {(isTeacherOrAdmin || isMeetingActive) && (
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
            </button>
        </div>
    );
};
