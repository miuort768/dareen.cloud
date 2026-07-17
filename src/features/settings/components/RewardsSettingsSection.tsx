import { useState } from 'react';
import { Award, Star, Trophy, Gift } from 'lucide-react';
import { SectionCard, SectionTitle, FieldLabel, InputField, ToggleRow, PrimaryBtn } from './SettingsUI';
import { settingsService } from '../services/settingsService';

export const RewardsSettingsSection = ({ showNotify }: { showNotify: (msg: string) => void }) => {
    const [pointsPerSession, setPointsPerSession] = useState('10');
    const [bonusPerRating, setBonusPerRating] = useState('5');
    const [badgeThreshold1, setBadgeThreshold1] = useState('100');
    const [badgeThreshold2, setBadgeThreshold2] = useState('500');
    const [badgeThreshold3, setBadgeThreshold3] = useState('1000');
    const [autoBadgeAward, setAutoBadgeAward] = useState(true);
    const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await settingsService.saveSettingsBatch([
                { key: 'rewards_points_per_session', value: pointsPerSession },
                { key: 'rewards_bonus_per_rating', value: bonusPerRating },
                { key: 'rewards_badge_threshold_1', value: badgeThreshold1 },
                { key: 'rewards_badge_threshold_2', value: badgeThreshold2 },
                { key: 'rewards_badge_threshold_3', value: badgeThreshold3 },
                { key: 'rewards_auto_badge', value: String(autoBadgeAward) },
                { key: 'rewards_leaderboard_enabled', value: String(leaderboardEnabled) },
            ]);
            showNotify('تم حفظ إعدادات النقاط والمكافآت');
        } catch (e) { console.error(e); alert('خطأ في الحفظ'); }
        finally { setIsSaving(false); }
    };

    return (
        <SectionCard>
            <SectionTitle icon={Award} label="النقاط والمكافآت" sub="إعدادات نظام النقاط والشارات والتكريم" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <FieldLabel>نقاط لكل جلسة</FieldLabel>
                    <InputField type="number" value={pointsPerSession} onChange={e => setPointsPerSession(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>مكافأة التقييم</FieldLabel>
                    <InputField type="number" value={bonusPerRating} onChange={e => setBonusPerRating(e.target.value)} />
                </div>
            </div>

            <div className="mb-6">
                <FieldLabel>حدود الشارات</FieldLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                    <div className="p-3 bg-warning-soft rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Star size={14} className="text-warning" />
                            <span className="text-xs font-bold text-warning-dark">الشارة البرونزية</span>
                        </div>
                        <InputField type="number" value={badgeThreshold1} onChange={e => setBadgeThreshold1(e.target.value)} />
                    </div>
                    <div className="p-3 bg-surface rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy size={14} className="text-muted" />
                            <span className="text-xs font-bold text-main">الشارة الفضية</span>
                        </div>
                        <InputField type="number" value={badgeThreshold2} onChange={e => setBadgeThreshold2(e.target.value)} />
                    </div>
                    <div className="p-3 bg-warning-soft rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Award size={14} className="text-warning-dark" />
                            <span className="text-xs font-bold text-warning-dark">الشارة الذهبية</span>
                        </div>
                        <InputField type="number" value={badgeThreshold3} onChange={e => setBadgeThreshold3(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <ToggleRow icon={Gift} label="منح الشارات تلقائياً" checked={autoBadgeAward} onChange={() => setAutoBadgeAward(!autoBadgeAward)} />
                <ToggleRow icon={Trophy} label="تفعيل لوحة الشرف" sub="عرض قائمة الطلاب المتميزين" checked={leaderboardEnabled} onChange={() => setLeaderboardEnabled(!leaderboardEnabled)} />
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <PrimaryBtn onClick={handleSave} loading={isSaving}>حفظ إعدادات المكافآت</PrimaryBtn>
            </div>
        </SectionCard>
    );
};
