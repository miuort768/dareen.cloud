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
    if (points >= 1000) return { name: 'المتقن المثالي - Perfect Master', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-500', next: null };
    if (points >= 500) return { name: 'البطل الذهبي - Golden Champion', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500', next: 1000 };
    if (points >= 200) return { name: 'المجتهد الطموح - Ambitious Student', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-500', next: 500 };
    return { name: 'القارئ المكتشف - Explorer Reader', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500', next: 200 };
};

export const ParentChildVisualProgress = ({ childrenProfiles }: { childrenProfiles: ChildProfile[] }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {childrenProfiles.map((child) => {
                const level = getLevel(child.totalPoints || 0);
                const progress = level.next ? ((child.totalPoints || 0) / level.next) * 100 : 100;

                return (
                    <div key={child.id} className="bg-white border-4 border-gray-950 p-6 dark:bg-gray-900 dark:border-gray-800 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group">
                        
                        {/* Header: Level & Points */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">مستوى الطالب</p>
                                <h4 className={cn("text-sm font-black uppercase tracking-tighter italic", level.color)}>{level.name}</h4>
                            </div>
                            <div className="text-right flex items-center gap-2">
                                <TrendingUp size={16} className="text-primary-600" />
                                <span className="text-2xl font-black italic tracking-tighter">{child.totalPoints || 0}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2 mb-8">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 border-2 border-gray-950 overflow-hidden shadow-inner">
                                <div 
                                    className={cn("h-full transition-all duration-1000 ease-out", 
                                        level.color.replace('text', 'bg')
                                    )} 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            {level.next && (
                                <p className="text-[9px] font-black text-gray-400 text-center uppercase tracking-widest">متبقي {level.next - child.totalPoints} نقطة للمستوى التالي!</p>
                            )}
                        </div>

                        {/* Badges Section (Suggestion 3) */}
                        <div className="space-y-4 mb-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b-2 border-gray-100 dark:border-gray-800 pb-2">معرض الأوسمة (Badge Wall)</p>
                            <div className="flex flex-wrap gap-3">
                                {child.badges && child.badges.length > 0 ? child.badges.map((badge, idx) => (
                                    <div key={idx} className="p-2 bg-gray-950 text-white border-2 border-white/20 hover:scale-110 transition-transform cursor-help group/badge relative">
                                        <Award size={18} className="text-yellow-400" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-950 text-[8px] font-black uppercase whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity">
                                            {badge}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center w-full">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">لا يوجد أوسمة بعد</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Teacher Gratitude (Suggestion 4) */}
                        <div className="pt-6 border-t-2 border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-600 border-2 border-gray-950 flex items-center justify-center text-white">
                                    <Star size={18} className="fill-current" />
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-gray-900 dark:text-white leading-none mb-1 uppercase tracking-tighter">{child.teacherName}</h5>
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">آخر تقييم: ممتاز</p>
                                </div>
                            </div>
                            <a 
                                href={`https://wa.me/${child.adminPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(`شكراً جزيلاً للمعلمة ${child.teacherName} على جهودها الرائعة مع ${child.name}. وجدنا تقريرها متميزاً جداً!`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-emerald-500 text-gray-950 border-2 border-gray-950 font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 group/btn"
                            >
                                <Heart size={14} className="group-hover/btn:scale-125 transition-transform text-rose-600 fill-current" />
                                شكراً معلمي
                            </a>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
