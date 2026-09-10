import { Card, Text, Flex } from '@radix-ui/themes'
import { Flame, Heart, MessageSquare } from 'lucide-react'
import type { Post } from '../../features/forum/types'

interface ForumTopEngagedProps {
  posts: Post[]
  onView: (postId: string) => void
}

const engagementScore = (p: Post) =>
  (Array.isArray(p.upvotes) ? p.upvotes.length : 0) + (p.commentCount || 0)

/** «الأكثر تفاعلًا» — أفضل 3 منشورات بمجموع الإعجابات والتعليقات */
export const ForumTopEngaged = ({ posts, onView }: ForumTopEngagedProps) => {
  const top = [...posts].sort((a, b) => engagementScore(b) - engagementScore(a)).slice(0, 3)

  if (top.length === 0 || engagementScore(top[0]) === 0) return null

  return (
    <Card size="2">
      <Flex align="center" gap="2" mb="3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-error-soft text-error">
          <Flame size={16} />
        </span>
        <Text size="2" weight="bold" className="!text-main">
          الأكثر تفاعلًا
        </Text>
      </Flex>

      <Flex direction="column" gap="2">
        {top.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onView(p.id)}
            className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-[var(--gray-a4)] p-2.5 text-start outline-none transition-all duration-150 hover:border-[var(--accent-a6)] hover:bg-[var(--gray-a2)] focus-visible:ring-2 focus-visible:ring-[var(--accent-8)]"
          >
            <Flex align="center" gap="2.5" minWidth="0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-[10px] font-black text-primary">
                {i + 1}
              </span>
              <Text size="1" weight="medium" className="truncate !text-main">
                {p.content}
              </Text>
            </Flex>
            <Flex align="center" gap="2" shrink="0">
              <Flex align="center" gap="1" className="text-[var(--gray-10)]">
                <Heart size={11} className="text-error" />
                <Text size="1">{Array.isArray(p.upvotes) ? p.upvotes.length : 0}</Text>
              </Flex>
              <Flex align="center" gap="1" className="text-[var(--gray-10)]">
                <MessageSquare size={11} className="text-info" />
                <Text size="1">{p.commentCount || 0}</Text>
              </Flex>
            </Flex>
          </button>
        ))}
      </Flex>
    </Card>
  )
}
