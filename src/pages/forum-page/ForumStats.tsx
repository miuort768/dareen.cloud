import { Card, Text, Flex } from '@radix-ui/themes'
import { MessageSquare, ThumbsUp, MessageCircle, Users } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ForumStatsProps {
  postsCount: number
  likesCount: number
  commentsCount: number
  participantsCount: number
}

interface StatItem {
  label: string
  value: number
  icon: typeof MessageSquare
  tone: string
}

/** بطاقات الإحصائيات الأربع — 2×2 على الهاتف و4 على الديسكتوب */
export const ForumStats = ({
  postsCount,
  likesCount,
  commentsCount,
  participantsCount,
}: ForumStatsProps) => {
  const stats: StatItem[] = [
    {
      label: 'منشور',
      value: postsCount,
      icon: MessageSquare,
      tone: 'text-primary bg-primary-soft',
    },
    { label: 'إعجاب', value: likesCount, icon: ThumbsUp, tone: 'text-success bg-success-soft' },
    { label: 'تعليق', value: commentsCount, icon: MessageCircle, tone: 'text-info bg-info-soft' },
    {
      label: 'مشارك',
      value: participantsCount,
      icon: Users,
      tone: 'text-warning bg-warning-soft',
    },
  ]

  return (
    <div className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} size="1" className="!p-3.5 md:!p-4">
            <Flex align="center" gap="3">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  stat.tone,
                )}
              >
                <Icon size={15} strokeWidth={1.9} />
              </span>
              <Flex direction="column" gap="1" minWidth="0">
                <Text size="5" weight="bold" className="!text-main">
                  {stat.value}
                </Text>
                <Text size="1" weight="medium" color="gray">
                  {stat.label}
                </Text>
              </Flex>
            </Flex>
          </Card>
        )
      })}
    </div>
  )
}
