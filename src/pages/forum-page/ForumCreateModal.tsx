import { useState } from 'react'
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextArea,
  SegmentedControl,
  Spinner,
  Badge,
} from '@radix-ui/themes'
import { Send, ShieldCheck } from 'lucide-react'
import type { ForumPostType } from '../../features/forum/types'

interface ForumCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (content: string, type: ForumPostType) => void
  isPosting: boolean
  isModerated: boolean
}

const TYPE_OPTIONS: { value: ForumPostType; label: string; emoji: string }[] = [
  { value: 'question', label: 'سؤال', emoji: '❓' },
  { value: 'discussion', label: 'مناقشة', emoji: '💬' },
  { value: 'tip', label: 'نصيحة', emoji: '💡' },
  { value: 'announcement', label: 'إعلان', emoji: '📢' },
]

/** نافذة إنشاء منشور — نوع + محتوى + نشر */
export const ForumCreateModal = ({
  open,
  onOpenChange,
  onCreate,
  isPosting,
  isModerated,
}: ForumCreateModalProps) => {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<ForumPostType>('discussion')

  const handleClose = (next: boolean) => {
    if (!next) {
      setContent('')
      setPostType('discussion')
    }
    onOpenChange(next)
  }

  const handlePublish = () => {
    if (!content.trim() || isPosting) return
    onCreate(content, postType)
    setContent('')
    setPostType('discussion')
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content maxWidth="480px" className="!p-5">
        <Dialog.Title size="4" weight="bold" className="!text-main">
          إنشاء منشور
        </Dialog.Title>
        <Dialog.Description size="1" color="gray" mb="3">
          شارك سؤالاً أو فكرة مع مجتمع دارين التعليمي
        </Dialog.Description>

        <Flex direction="column" gap="4">
          {/* نوع المنشور */}
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" className="!text-[var(--gray-11)]">
              نوع المنشور
            </Text>
            <SegmentedControl.Root
              value={postType}
              onValueChange={(v) => setPostType(v as ForumPostType)}
              aria-label="نوع المنشور"
            >
              {TYPE_OPTIONS.map((opt) => (
                <SegmentedControl.Item key={opt.value} value={opt.value}>
                  <span aria-hidden="true">{opt.emoji}</span> {opt.label}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </Flex>

          {/* المحتوى */}
          <Flex direction="column" gap="2">
            <Text size="1" weight="bold" className="!text-[var(--gray-11)]">
              المحتوى
            </Text>
            <TextArea
              placeholder="ماذا تريد أن تشارك مع مجتمع دارين؟"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              aria-label="محتوى المنشور"
              resize="vertical"
              minLength={0}
              maxLength={5000}
              rows={5}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePublish()
              }}
            />
          </Flex>

          {/* ملاحظة الاعتدال */}
          {isModerated && (
            <Flex align="center" gap="2" className="rounded-xl bg-[var(--amber-a2)] p-2.5">
              <ShieldCheck size={13} className="shrink-0 text-[var(--amber-11)]" />
              <Text size="1" weight="medium" className="!text-[var(--amber-11)]">
                سيظهر منشورك بعد مراجعة الإدارة
              </Text>
            </Flex>
          )}

          <Flex justify="end" align="center" gap="2">
            <Badge size="1" variant="surface" className="me-auto">
              {content.length}/5000
            </Badge>
            <Button
              variant="soft"
              color="gray"
              onClick={() => handleClose(false)}
              disabled={isPosting}
            >
              إلغاء
            </Button>
            <Button onClick={handlePublish} disabled={!content.trim() || isPosting}>
              {isPosting ? <Spinner size="1" /> : <Send size={13} />} نشر المنشور
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
