import { Trophy, Star, ChevronLeft } from 'lucide-react';

interface ChildAchievement {
    id: string;
    studentName: string;
    achievement: string;
    date: string;
    points: number;
}

interface ParentExcellenceRadarProps {
    achievements: ChildAchievement[];
}

export const ParentExcellenceRadar = ({ achievements }: ParentExcellenceRadarProps) => {
    if (!achievements || achievements.length === 0) return null;

    return (
        <div className="bg-gray-950 border-4 border-gray-950 p-6 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] text-white relative overflow-hidden group mb-8">
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <Trophy size={20} className="text-yellow-400 animate-pulse" />
                    <h3 className="font-medium text-xs uppercase tracking-[0.2em] italic">رادار التميز الأسبوعي (Excellence Radar)</h3>
                </div>

                <div className="space-y-6">
                    {achievements.map((ach) => (
                        <div key={ach.id} className="flex items-center justify-between group/ach">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 border-2 border-white/20 flex items-center justify-center rotate-3 group-hover/ach:rotate-0 transition-transform">
                                    <Star size={24} className="text-yellow-400 fill-current" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium uppercase tracking-tighter text-white/90">{ach.studentName}</h4>
                                    <p className="text-[10px] font-normal text-yellow-400 uppercase leading-none mt-1">{ach.achievement}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-medium italic tracking-tighter">+{ach.points}</span>
                                <p className="text-[8px] font-medium uppercase opacity-40 tracking-widest leading-none">نقطة ذكاء</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-white/10 flex items-center justify-between text-[9px] font-medium uppercase tracking-widest text-white/40">
                <span>تم التحديث: اليوم</span>
                <div className="flex items-center gap-1 group-hover:text-yellow-400 transition-colors cursor-pointer">
                    عرض كافة الإنجازات <ChevronLeft size={12} />
                </div>
            </div>
        </div>
    );
};
