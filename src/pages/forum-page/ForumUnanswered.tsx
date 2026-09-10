import { Card, Text, Flex, Button, Badge } from '@radix-ui/themes'
import { HelpCircle, ChevronLeft } from 'lucide-react'
import { resolvePostType, roleLabel } from '../../features/forum/types'
import type { Post } from '../../features/forum/types'

interface ForumUnansweredProps {
  posts: Post[]
  onView: (postId: string) => void
}

/** «أسئلة تحتاج إجابة» — أسئلة بلا تعليقات، محدودة بـ 3 */
export const ForumUnanswered = ({ posts, onView }: ForumUnansweredProps) => {
  const unanswered = posts
    .filter((p) => resolvePostType(p.type) === 'question' && (p.commentCount || 0) === 0)
    .slice(0, 3)

  if (unanswered.length === 0) return null

  return (
    <Card size="2">
      <Flex align="center" gap="2" mb="3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning-soft text-warning">
          <HelpCircle size={16} />
        </span>
        <Text size="2" weight="bold" className="!text-main">
          أسئلة تحتاج إجابة
        </Text>
        <Badge size="1" color="amber" variant="soft" className="ms-auto">
          {unanswered.length}
        </Badge>
      </Flex>

      <Flex direction="column" gap="2">
        {unanswered.map((p) => (
          <button
            key={p.id}
            onClick={() => onView(p.id)}
            className="w-full rounded-xl border border-[var(--gray-a4)] p-2.5 text-start outline-none transition-all duration-150 hover:border-[var(--accent-a6)] hover:bg-[var(--gray-a2)] focus-visible:ring-2 focus-visible:ring-[var(--accent-8)]"
          >
            <Flex align="start" justify="between" gap="2">
              <Text size="1" weight="medium" className="line-clamp-2 leading-relaxed !text-main">
                {p.content}
              </Text>
              <ChevronLeft size={13} className="mt-0.5 shrink-0 text-[var(--gray-9)]" />
            </Flex>
            <Flex align="center" gap="2" mt="1.5">
              <Badge size="1" variant="soft" color={roleBadgeColorFor(p.authorRole)}>
                {roleLabel(p.authorRole)}
              </Badge>
              <Badge size="1" color="amber" variant="soft">
                0 إجابة
              </Badge>
            </Flex>
          </button>
        ))}
      </Flex>

      <Button
        size="1"
        variant="soft"
        className="mt-3 w-full !font-bold"
        onClick={() => onView(unanswered[0].id)}
      >
        عرض السؤال
      </Button>
    </Card>
  )
}

const roleBadgeColorFor = (role?: string): 'indigo' | 'green' | 'blue' | 'orange' | 'gray' => {
  switch (role) {
    case 'admin':
      return 'orange'
    case 'teacher':
      return 'green'
    case 'student':
      return 'blue'
    case 'parent':
      return 'indigo'
    default:
      return 'gray'
  }
}
