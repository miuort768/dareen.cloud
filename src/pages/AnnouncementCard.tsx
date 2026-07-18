import { Megaphone, Calendar, Info, AlertTriangle, Edit3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';

type AnnouncementType = 'general' | 'urgent' | 'holiday' | 'event';

interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    date: string;
    isActive: boolean;
}

interface AnnouncementCardProps {
    announcement: Announcement;
    onEdit: (ann: Announcement) => void;
    onDelete: (id: string) => void;
}

const getTypeMeta = (type: string) => {
    switch (type) {
        case 'urgent': return { icon: AlertTriangle, label: 'عاجل' };
        case 'holiday': return { icon: Calendar, label: 'إجازة' };
        case 'event': return { icon: Megaphone, label: 'فعالية' };
        default: return { icon: Info, label: 'عام' };
    }
};

const typeColorClasses = (type: string, variant: 'bg' | 'text' | 'badge') => {
    switch (type) {
        case 'urgent': return variant === 'bg' ? 'bg-error-soft' : variant === 'text' ? 'text-error' : 'bg-error-soft text-error';
        case 'holiday': return variant === 'bg' ? 'bg-warning-soft' : variant === 'text' ? 'text-warning' : 'bg-warning-soft text-warning';
        case 'event': return variant === 'bg' ? 'bg-info-soft' : variant === 'text' ? 'text-info' : 'bg-info-soft text-info';
        default: return variant === 'bg' ? 'bg-background' : variant === 'text' ? 'text-muted' : 'bg-background text-muted';
    }
};

export const AnnouncementCard = ({ announcement: ann, onEdit, onDelete }: AnnouncementCardProps) => {
    const meta = getTypeMeta(ann.type);
    const Icon = meta.icon;
    return (
        <div className={cn("bg-card border border-border rounded-2xl p-4 md:p-5 transition-all duration-300 hover:shadow-sm relative flex flex-col", !ann.isActive && "opacity-60 grayscale border-dashed")}>
            <div className="flex-1 space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", typeColorClasses(ann.type, 'bg'))}>
                            <Icon size={18} className={typeColorClasses(ann.type, 'text')} />
                        </div>
                        <div>
                            <span className={cn("text-micro font-bold inline-flex items-center px-2 py-0.5 rounded-lg mb-0.5", typeColorClasses(ann.type, 'badge'))}>{meta.label}</span>
                            <p className="font-bold text-micro text-muted">{format(new Date(ann.date), 'dd MMMM yyyy', { locale: ar })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => onEdit(ann)} aria-label="تعديل الإعلان" className="w-7 h-7 bg-surface dark:bg-card text-muted flex items-center justify-center border border-border hover:bg-primary hover:text-on-primary transition-all shadow-sm rounded-xl active:scale-90">
                            <Edit3 size={12} />
                        </button>
                        <button onClick={() => onDelete(ann.id)} aria-label="حذف الإعلان" className="w-7 h-7 bg-surface dark:bg-card text-error flex items-center justify-center border border-border hover:bg-error hover:text-on-error transition-all shadow-sm rounded-xl active:scale-90">
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
                <div className="space-y-2 md:space-y-3">
                    <h3 className="text-sm md:text-base font-bold text-main leading-tight">{ann.title}</h3>
                    <p className="text-muted font-bold text-micro md:text-xs leading-relaxed line-clamp-4 border-s-2 border-border ps-2 md:ps-3">{ann.content}</p>
                </div>
            </div>
            {!ann.isActive && (
                <div className="mt-5 pt-3 border-t border-dashed border-border">
                    <span className="text-micro font-bold text-warning-dark dark:text-warning flex items-center gap-1.5">
                        <Info size={10} /> غير نشط
                    </span>
                </div>
            )}
        </div>
    );
};
