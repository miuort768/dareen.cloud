import { useState, useEffect } from 'react'
import { Award, Star, Trophy, Gift } from 'lucide-react'
import {
  SectionCard,
  SectionTitle,
  FieldLabel,
  InputField,
  ToggleRow,
  PrimaryBtn,
} from './SettingsUI'
import { settingsService } from '../services/settingsService'
import { safeGet } from '../../../lib/api'

export const RewardsSettingsSection = ({ showNotify }: { showNotify: (msg: string) => void }) => {
  const [pointsPerSession, setPointsPerSession] = useState('10')
  const [bonusPerRating, setBonusPerRating] = useState('5')
  const [badgeThreshold1, setBadgeThreshold1] = useState('100')
  const [badgeThreshold2, setBadgeThreshold2] = useState('500')
  const [badgeThreshold3, setBadgeThreshold3] = useState('1000')
  const [autoBadgeAward, setAutoBadgeAward] = useState(true)
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    settingsService
      .getSettingsBatch()
      .then((data) => {
        const sys = safeGet<Record<string, string>>(data, 'system') || {}
        if (sys.rewards_points_per_session) setPointsPerSession(sys.rewards_points_per_session)
        if (sys.rewards_bonus_per_rating) setBonusPerRating(sys.rewards_bonus_per_rating)
        if (sys.rewards_badge_threshold_1) setBadgeThreshold1(sys.rewards_badge_threshold_1)
        if (sys.rewards_badge_threshold_2) setBadgeThreshold2(sys.rewards_badge_threshold_2)
        if (sys.rewards_badge_threshold_3) setBadgeThreshold3(sys.rewards_badge_threshold_3)
        if (sys.rewards_auto_badge) setAutoBadgeAward(sys.rewards_auto_badge !== 'false')
        if (sys.rewards_leaderboard_enabled)
          setLeaderboardEnabled(sys.rewards_leaderboard_enabled !== 'false')
      })
      .catch((e) => console.warn(e))
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await settingsService.saveSettingsBatch([
        { key: 'rewards_points_per_session', value: pointsPerSession },
        { key: 'rewards_bonus_per_rating', value: bonusPerRating },
        { key: 'rewards_badge_threshold_1', value: badgeThreshold1 },
        { key: 'rewards_badge_threshold_2', value: badgeThreshold2 },
        { key: 'rewards_badge_threshold_3', value: badgeThreshold3 },
        { key: 'rewards_auto_badge', value: String(autoBadgeAward) },
        { key: 'rewards_leaderboard_enabled', value: String(leaderboardEnabled) },
      ])
      showNotify('تم حفظ إعدادات النقاط والمكافآت')
    } catch (e) {
      console.error(e)
      showNotify('خطأ في الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SectionCard>
      <SectionTitle
        icon={Award}
        label="النقاط والمكافآت"
        sub="إعدادات نظام النقاط والشارات والتكريم"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>نقاط لكل جلسة</FieldLabel>
          <InputField
            type="number"
            aria-label="نقاط لكل جلسة"
            value={pointsPerSession}
            onChange={(e) => setPointsPerSession(e.target.value)}
          />
        </div>
        <div className="rounded-xl border border-divider bg-background p-4">
          <FieldLabel>مكافأة التقييم</FieldLabel>
          <InputField
            type="number"
            aria-label="مكافأة التقييم"
            value={bonusPerRating}
            onChange={(e) => setBonusPerRating(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <FieldLabel>حدود الشارات</FieldLabel>
        <div className="mt-1 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-divider bg-background p-4">
            <div className="mb-2 flex items-center gap-2">
              <Star size={14} className="text-warning" />
              <span className="text-xs font-bold text-main">الشارة البرونزية</span>
            </div>
            <InputField
              type="number"
              aria-label="الشارة البرونزية"
              value={badgeThreshold1}
              onChange={(e) => setBadgeThreshold1(e.target.value)}
            />
          </div>
          <div className="rounded-xl border border-divider bg-background p-4">
            <div className="mb-2 flex items-center gap-2">
              <Trophy size={14} className="text-info" />
              <span className="text-xs font-bold text-main">الشارة الفضية</span>
            </div>
            <InputField
              type="number"
              aria-label="الشارة الفضية"
              value={badgeThreshold2}
              onChange={(e) => setBadgeThreshold2(e.target.value)}
            />
          </div>
          <div className="rounded-xl border border-divider bg-background p-4">
            <div className="mb-2 flex items-center gap-2">
              <Award size={14} className="text-primary" />
              <span className="text-xs font-bold text-main">الشارة الذهبية</span>
            </div>
            <InputField
              type="number"
              aria-label="الشارة الذهبية"
              value={badgeThreshold3}
              onChange={(e) => setBadgeThreshold3(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <ToggleRow
          icon={Gift}
          label="منح الشارات تلقائياً"
          checked={autoBadgeAward}
          onChange={() => setAutoBadgeAward(!autoBadgeAward)}
        />
        <ToggleRow
          icon={Trophy}
          label="تفعيل لوحة الشرف"
          sub="عرض قائمة الطلاب المتميزين"
          checked={leaderboardEnabled}
          onChange={() => setLeaderboardEnabled(!leaderboardEnabled)}
        />
      </div>

      <div className="mt-6 flex justify-end border-t border-divider pt-5">
        <PrimaryBtn onClick={handleSave} loading={isSaving}>
          حفظ إعدادات المكافآت
        </PrimaryBtn>
      </div>
    </SectionCard>
  )
}
