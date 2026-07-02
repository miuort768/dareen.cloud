import { Star, Award, TrendingUp, Heart } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ChildProfile {
    id: string;
    name: string;
    totalPoints: number;
    badges: string[];
    teacherName: string;
    lastEvaluation: string;
    adminPhone: string;
}

const getLevel = (points: number) => {
    if (points >= 3000) return { name: 'جوكر المعهد', color: 'text-warning', bg: 'bg-warning-light', border: 'border-warning', next: null };
    if (points >= 2000) return { name: 'بطل المعهد', color: 'text-primary', bg: 'bg-primary-soft', border: 'border-primary', next: 3000 };
    if (points >= 1000) return { name: 'العبقري / العبقرية', color: 'text-info', bg: 'bg-info-light', border: 'border-info', next: 2000 };
    return { name: 'شاطر ومجتهد', color: 'text-success', bg: 'bg-success-light', border: 'border-success', next: 1000 };
};

export const ParentChildVisualProgress = ({ childrenProfiles }: { childrenProfiles: ChildProfile[] }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {childrenProfiles.map((child) => {
                const level = getLevel(child.totalPoints || 0);
                const progress = level.next ? ((child.totalPoints || 0) / level.next) * 100 : 100;

                return (
                    <div key={child.id} className="bg-white border-4 border-border p-6 dark:bg-card dark:border-border shadow-[8px_8px_0px_0px_#000] relative group">
                        
                        {/* Header: Level & Points */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-medium text-muted uppercase tracking-widest leading-none">مستوى الطالب</p>
                                <h4 className={cn("text-sm font-medium uppercase tracking-tighter italic", level.color)}>{level.name}</h4>
                            </div>
                            <div className="text-right flex items-center gap-2">
                                <TrendingUp size={16} className="text-primary" />
                                <span className="text-2xl font-medium italic tracking-tighter">{child.totalPoints || 0}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2 mb-8">
                            <div className="h-4 bg-surface dark:bg-card border-2 border-border overflow-hidden shadow-inner">
                                <div 
                                    className={cn("h-full transition-all duration-1000 ease-out", 
                                        level.color.replace('text', 'bg')
                                    )} 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            {level.next && (
                                <p className="text-[9px] font-medium text-muted text-center uppercase tracking-widest">متبقي {level.next - child.totalPoints} نقطة للمستوى التالي!</p>
                            )}
                        </div>

                        {/* Badges Section (Suggestion 3) */}
                        <div className="space-y-4 mb-8">
                            <p className="text-[10px] font-medium text-muted uppercase tracking-widest border-b-2 border-border dark:border-border pb-2">معرض الأوسمة (Badge Wall)</p>
                            <div className="flex flex-wrap gap-3">
                                {child.badges && child.badges.length > 0 ? child.badges.map((badge, idx) => (
                                    <div key={idx} className="p-2 bg-card text-on-primary border-2 border-white/20 hover:scale-110 transition-transform cursor-help group/badge relative">
                                        <Award size={18} className="text-warning" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-card text-[8px] font-medium uppercase whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity">
                                            {badge}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-4 border-2 border-dashed border-border dark:border-border flex items-center justify-center w-full">
                                        <p className="text-[10px] font-medium text-dim uppercase tracking-widest italic">لا يوجد أوسمة بعد</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Teacher Gratitude (Suggestion 4) */}
                        <div className="pt-6 border-t-2 border-border dark:border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary border-2 border-border flex items-center justify-center text-on-primary">
                                    <Star size={18} className="fill-current" />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-medium text-main dark:text-on-primary leading-none mb-1 uppercase tracking-tighter">{child.teacherName}</h5>
                                    <p className="text-[9px] font-medium text-success uppercase tracking-widest leading-none">آخر تقييم: ممتاز</p>
                                </div>
                            </div>
                            <a 
                                href={`https://wa.me/${child.adminPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(`شكراً جزيلاً للمعلمة ${child.teacherName} على جهودها الرائعة مع ${child.name}. وجدنا تقريرها متميزاً جداً!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-success text-main border-2 border-border font-medium text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 group/btn"
                            >
                                <Heart size={14} className="group-hover/btn:scale-125 transition-transform text-error fill-current" />
                                شكراً معلمي
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
