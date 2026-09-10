import { Search, Plus, MessagesSquare } from 'lucide-react'
import { Heading, Text, Button, TextField, Flex } from '@radix-ui/themes'

interface ForumHeaderProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  onCreateClick: () => void
}

/** ترويسة المنتدى — عنوان + وصف + زر إنشاء + بحث */
export const ForumHeader = ({ searchTerm, onSearchChange, onCreateClick }: ForumHeaderProps) => (
  <Flex direction="column" gap="4" mb="4">
    <Flex align="center" gap="3">
      <Flex
        align="center"
        justify="center"
        className="h-11 w-11 shrink-0 rounded-2xl bg-primary-soft"
      >
        <MessagesSquare size={20} className="text-primary" />
      </Flex>
      <Flex direction="column" gap="1">
        <Heading size="5" className="!text-main">
          منتدى دارين
        </Heading>
        <Text size="1" color="gray" weight="medium">
          مجتمع تعليمي يجمع المعلمات والطلاب وأولياء الأمور لتبادل المعرفة والخبرات.
        </Text>
      </Flex>
    </Flex>

    <Flex gap="3" direction={{ initial: 'column', sm: 'row' }} align={{ sm: 'center' }}>
      <Button size="2" onClick={onCreateClick} className="!font-bold">
        <Plus size={15} /> إنشاء منشور
      </Button>

      <TextField.Root
        size="2"
        placeholder="البحث في المنتدى..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="البحث في المنتدى"
        className="flex-1"
      >
        <TextField.Slot>
          <Search size={14} />
        </TextField.Slot>
      </TextField.Root>
    </Flex>
  </Flex>
)
