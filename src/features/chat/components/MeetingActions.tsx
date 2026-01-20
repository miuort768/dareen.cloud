import React from 'react';
import { Video } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Conversation } from '../../../types/chat.types';
import type { User } from '../../../types/auth';


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
    if (!selectedConv) return null;

    const isTeacherOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher';

    const handleAction = () => {
        // Allow entering waiting room at any time
        onStartMeeting();
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleAction}
                className={cn(
                    "relative flex items-center gap-2 px-3 py-2 lg:px-6 lg:py-2.5 text-white font-black text-[10px] lg:text-[11px] uppercase tracking-wider transition-all active:scale-95 shadow-xl rounded-md lg:rounded-xl overflow-hidden group border-none outline-none",
                    isTeacherOrAdmin
                        ? "bg-gradient-to-br from-primary-600 to-primary-800 hover:from-primary-500 hover:to-primary-700 shadow-primary-600/30"
                        : isMeetingActive
                            ? "bg-gradient-to-br from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 shadow-rose-600/40 animate-pulse border-2 border-white/20"
                            : "bg-gray-600 hover:bg-gray-700 cursor-pointer" // Always clickable now
                )}
                title={isTeacherOrAdmin ? "بدء بث مباشر للحصة" : "انضمام للحصة"}
            >
                {/* Visual indicator for active meeting */}
                {(isMeetingActive || isTeacherOrAdmin) && (
                    <span className={cn(
                        "w-1.5 h-1.5 rounded-full absolute top-1 right-1",
                        isMeetingActive ? "bg-white animate-pulse" : "bg-primary-300 opacity-50"
                    )} />
                )}

                <Video size={16} className={cn("transition-transform lg:size-5 group-hover:scale-110", isMeetingActive && "animate-pulse")} />

                <span className="hidden lg:inline relative z-10">
                    {isTeacherOrAdmin
                        ? "بدء الاجتماع"
                        : isMeetingActive
                            ? "الحصة بدأت - اضغط للدخول"
                            : "دخول لغرفة الانتظار"
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
