import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  Phone,
  CalendarDays,
  ShieldCheck,
  BookOpen,
  Wallet,
  KeyRound,
  Award,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { api } from '../../lib/api'
import { useCurrentUser, useShowNotification, useLogout } from '../../context/AppContext'
import {
  AccountHero,
  SectionCard,
  InfoRow,
  ProfileSkeleton,
  ErrorBlock,
  AccountActions,
  formatJoinDate,
} from './shared'
import { EditNameModal } from './EditNameModal'
import { PaymentMethodsSection } from './PaymentMethodsSection'
import {
  TEACHER_RANKS,
  getRankByPoints,
  getNextRank,
  RANK_ICON_MAP,
} from '../../shared/utils/ranks'
import { ProgressBar } from '../../shared/components/ui'

interface TeacherData {
  id?: string
  name: string
  phone1?: string
  phone2?: string
  subject?: string
  price?: number
  currency?: string
  points?: number
  username?: string
  createdAt?: string
}

export const TeacherAccountPage = () => {
  const currentUser = useCurrentUser()
  const showNotification = useShowNotification()
  const logout = useLogout()
  const [editOpen, setEditOpen] = useState(false)
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    document.title = 'ط­ط³ط§ط¨ظٹ | ط¯ط§ط±ظٹظ† ط§ظ„ط³ط§ط¨ط¹ط© ظ„ظ„طھط¹ظ„ظٹظ… ظˆط§ظ„طھط¯ط±ظٹط¨'
  }, [])

  // ظ†ظپط³ ظ†ط¯ط§ط، ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط­ط§ظ„ظٹ: GET /teachers/me
  const {
    data: teacher,
    isLoading,
    isError,
    refetch,
  } = useQuery<TeacherData>({
    queryKey: ['teachers-me'],
    queryFn: async () => {
      const res = await api.get<TeacherData>('/teachers/me')
      return res ?? ({ name: '' } as TeacherData)
    },
    enabled: !!currentUser,
  })

  const displayName = teacher?.name || currentUser?.teacherName || currentUser?.name || ''
  const points = teacher?.points || 0
  const rank = getRankByPoints(points, TEACHER_RANKS)
  const { next: nextRank, pointsNeeded } = getNextRank(points, TEACHER_RANKS)
  const RankIcon = RANK_ICON_MAP[rank.icon] ?? Award

  // نسبة التقدم نحو الرتبة التالية من نظام الرتب المشترك
  const rankProgress = useMemo(() => {
    if (!nextRank) return 100
    return Math.min(
      100,
      Math.round(((points - rank.minPoints) / (nextRank.minPoints - rank.minPoints)) * 100),
    )
  }, [points, rank, nextRank])

  /* ط­ظپط¸ ط§ظ„ط§ط³ظ… â€” ظ†ظپط³ endpoint ط§ظ„ظ†ط¸ط§ظ… ط§ظ„ط­ط§ظ„ظٹ */
  const handleSaveName = async (newName: string) => {
    setSavingName(true)
    try {
      await api.put('/teachers/me', { name: newName })
      showNotification('طھظ… طھط­ط¯ظٹط« ط§ظ„ط§ط³ظ… ط¨ظ†ط¬ط§ط­', 'success')
      setEditOpen(false)
      await refetch()
    } catch (err) {
      console.error('Failed updating name', err)
      showNotification('طھط¹ط°ط± طھط­ط¯ظٹط« ط§ظ„ط§ط³ظ…طŒ ط­ط§ظˆظ„ ظ…ط¬ط¯ط¯ظ‹ط§', 'error')
    } finally {
      setSavingName(false)
    }
  }

  if (isLoading)
    return (
      <PageShell>
        <ProfileSkeleton />
      </PageShell>
    )

  return (
    <PageShell>
      {isError ? (
        <ErrorBlock onRetry={() => refetch()} />
      ) : (
        <div className="space-y-4">
          <AccountHero
            name={displayName}
            roleLabel="ظ…ط¹ظ„ظ…ط©"
            subtitle={teacher?.subject || undefined}
            metaChips={[
              teacher?.price != null ? `ط³ط¹ط± ط§ظ„ط­طµط© ${teacher.price} ط¬.ظ…` : '',
            ].filter(Boolean)}
            onEdit={() => setEditOpen(true)}
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط£ط³ط§ط³ظٹط© */}
            <SectionCard title="ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„ط£ط³ط§ط³ظٹط©" icon={User} delay={0.1}>
              <InfoRow label="ط§ظ„ط§ط³ظ…" value={displayName} icon={User} />
              <InfoRow label="ط±ظ‚ظ… ط§ظ„ط¬ظˆط§ظ„" value={teacher?.phone1} icon={Phone} mono />
              {teacher?.phone2 && (
                <InfoRow label="ط±ظ‚ظ… ط¥ط¶ط§ظپظٹ" value={teacher.phone2} icon={Phone} mono />
              )}
              <InfoRow
                label="ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ…"
                value={teacher?.username}
                icon={KeyRound}
                mono
              />
              <InfoRow label="ظ†ظˆط¹ ط§ظ„ط­ط³ط§ط¨" value="ظ…ط¹ظ„ظ…ط©" />
              <InfoRow
                label="ط­ط§ظ„ط© ط§ظ„ط­ط³ط§ط¨"
                value={
                  <span className="inline-flex items-center gap-1 rounded-md bg-success-soft px-1.5 py-0.5 text-success-strong">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                    ظ†ط´ط·
                  </span>
                }
                icon={ShieldCheck}
              />
              <InfoRow
                label="طھط§ط±ظٹط® ط§ظ„ط§ظ†ط¶ظ…ط§ظ…"
                value={formatJoinDate(teacher?.createdAt) || undefined}
                icon={CalendarDays}
              />
            </SectionCard>

            {/* ط¨ظٹط§ظ†ط§طھ ط§ظ„طھط¯ط±ظٹط³ */}
            <div className="space-y-4 lg:col-span-2">
              <SectionCard
                title="ط¨ظٹط§ظ†ط§طھ ط§ظ„طھط¯ط±ظٹط³"
                icon={BookOpen}
                description="ظ…ط¹ظ„ظˆظ…ط§طھظƒ ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ظپظٹ ط§ظ„ظ…ظ†طµط©"
                delay={0.15}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <MiniTile
                    label="ط§ظ„ظ…ط§ط¯ط©"
                    value={teacher?.subject || 'â€”'}
                    icon={BookOpen}
                  />
                  <MiniTile
                    label="ط³ط¹ط± ط§ظ„ط­طµط©"
                    value={teacher?.price != null ? `${teacher.price} ط¬.ظ…` : 'â€”'}
                    icon={Wallet}
                  />
                  <MiniTile label="ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ†ظ‚ط§ط·" value={String(points)} icon={Award} />
                </div>

                {/* ط§ظ„ط±طھط¨ط© ظˆط§ظ„طھظ‚ط¯ظ… â€” ظ…ظ† ظ†ط¸ط§ظ… ط§ظ„ط±طھط¨ ط§ظ„ظ…ظˆط­ط¯ */}
                <div className="mt-4 rounded-xl border border-border bg-surface p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-main">
                      <RankIcon size={14} className="text-primary" />
                      ط§ظ„ط±طھط¨ط© ط§ظ„ط­ط§ظ„ظٹط©: <span className="text-primary">{rank.name}</span>
                    </span>
                    {nextRank && (
                      <span className="flex items-center gap-1 text-micro font-bold text-muted">
                        <TrendingUp size={11} />
                        التالية: {nextRank.name}
                      </span>
                    )}
                  </div>
                  <ProgressBar value={rankProgress} variant="primary" />
                  <p className="mt-1.5 text-micro text-muted">
                    {nextRank
                      ? `تحتاج ${pointsNeeded} نقطة للوصول إلى «${nextRank.name}»`
                      : 'وصلتِ لأعلى رتبة — أحسنت!'}
                  </p>
                </div>
              </SectionCard>

              {/* ط·ط±ظ‚ ط§ظ„ط¯ظپط¹ â€” ظ‚ط³ظ… ط±ط¦ظٹط³ظٹ */}
              <PaymentMethodsSection />
            </div>
          </div>

          <AccountActions onLogoutStore={logout} />
        </div>
      )}

      <EditNameModal
        isOpen={editOpen}
        initialName={displayName}
        saving={savingName}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSaveName}
      />
    </PageShell>
  )
}

/* ---------- ط؛ظ„ط§ظپ ط§ظ„طµظپط­ط© ط§ظ„ظ…ظˆط­ط¯ ---------- */

import type { ReactNode } from 'react'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" className="min-h-full overflow-x-hidden bg-background pb-28 md:pb-10">
      <div className="mx-auto max-w-page space-y-4 p-3 pt-4 md:p-5 md:pt-6">{children}</div>
    </div>
  )
}

/* ---------- ط¨ط·ط§ظ‚ط© ظ…ط¹ظ„ظˆظ…ط© طµط؛ظٹط±ط© ---------- */

export function MiniTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: ReactNode
  icon: LucideIcon
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <Icon size={14} className="mx-auto mb-1 text-primary" />
      <p className="truncate text-xs font-bold text-main">{value}</p>
      <p className="mt-0.5 text-micro text-muted">{label}</p>
    </div>
  )
}
