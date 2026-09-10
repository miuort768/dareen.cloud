import { useState } from 'react'
import { Card, Text, Flex, Button, Badge, Dialog } from '@radix-ui/themes'
import { Scale, ShieldCheck, Heart, Sparkles, GraduationCap } from 'lucide-react'
import { useCurrentUser } from '../../context/AppContext'
import type { LucideIcon } from 'lucide-react'

interface RoleRules {
  roleTitle: string
  icon: LucideIcon
  rules: string[]
}

const useRoleRules = (): RoleRules => {
  const currentUser = useCurrentUser()
  const role = currentUser?.role || 'student'
  switch (role) {
    case 'parent':
      return {
        roleTitle: 'شريك النجاح (ولي الأمر)',
        icon: Heart,
        rules: [
          'متابعة الاستفسارات الخاصة بالتحصيل الأكاديمي للأبناء بأسلوب راقٍ ومباشر.',
          'التواصل الفعال والمحترم مع الكادر التعليمي في البيئة التعليمية.',
          'طرح الاقتراحات البناءة والحلول التي تساهم في تطوير بيئة التعلم.',
          'الالتزام بالخصوصية وعدم نشر أي بيانات شخصية تخص الطلاب أو المعلمات.',
        ],
      }
    case 'teacher':
      return {
        roleTitle: 'المعلمة',
        icon: ShieldCheck,
        rules: [
          'توجيه ونصح الطلاب برفق وإيجابية وتحفيزهم على التفاعل والمشاركة.',
          'مشاركة الوسائل والأفكار التعليمية المبتكرة والنافعة.',
          'الرد على استفسارات الطلاب وأولياء الأمور باحترافية وأسلوب تربوي.',
          'الحفاظ على بيئة مناقشة آمنة وإيجابية تشجع على الإبداع.',
        ],
      }
    case 'admin':
      return {
        roleTitle: 'مدير النظام',
        icon: Sparkles,
        rules: [
          'الإشراف العام على جودة المحتوى والمناقشات في المنتدى.',
          'مراجعة البلاغات والتأكد من ملاءمة المشاركات للسياسات العامة.',
          'تعديل وإدارة المحتوى والتعليقات لضمان انضباط المنتدى.',
          'تقديم الدعم الكامل لجميع أطراف العملية التعليمية.',
        ],
      }
    default:
      return {
        roleTitle: 'الطالب / الطالبة',
        icon: GraduationCap,
        rules: [
          'الالتزام بالأدب والاحترام في التعامل مع المعلمات والزملاء.',
          'طرح الأسئلة والاستفسارات الأكاديمية والتعليمية المفيدة.',
          'عدم مشاركة المعلومات الشخصية أو الحسابات الخارجية.',
          'المشاركة الإيجابية والمناقشة البناءة في الموضوعات المطروحة.',
        ],
      }
  }
}

/** بطاقة قواعد المنتدى — Card جانبية أنيقة مع نافذة القواعد حسب الدور */
export const ForumHelpCard = () => {
  const currentRules = useRoleRules()
  const [showModal, setShowModal] = useState(false)
  const Icon = currentRules.icon

  return (
    <Card size="2">
      <Flex align="start" gap="3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Scale size={19} />
        </span>
        <Flex direction="column" gap="2" minWidth="0">
          <Text size="2" weight="bold" className="!text-main">
            قواعد المنتدى
          </Text>
          <Badge size="1" variant="soft" color="indigo" className="w-fit">
            {currentRules.roleTitle}
          </Badge>
          <Text size="1" color="gray" weight="medium">
            قواعد مخصصة لدورك لضمان بيئة آمنة ومثمرة للجميع
          </Text>
          <Button
            size="1"
            variant="soft"
            onClick={() => setShowModal(true)}
            mt="2"
            className="w-fit !font-bold"
          >
            عرض القواعد والتعليمات
          </Button>
        </Flex>
      </Flex>

      {/* نافذة القواعد حسب الدور */}
      <Dialog.Root open={showModal} onOpenChange={setShowModal}>
        <Dialog.Content maxWidth="440px" className="!p-5">
          <Dialog.Title size="3" weight="bold" className="!text-main">
            <Flex align="center" gap="2">
              <Icon size={17} className="text-primary" /> إرشادات وقواعد {currentRules.roleTitle}
            </Flex>
          </Dialog.Title>
          <Dialog.Description size="1" color="gray" mb="3">
            نرجو الالتزام بالقواعد التالية لتجربة تعليمية راقية ومثمرة:
          </Dialog.Description>

          <Flex direction="column" gap="2" mb="4">
            {currentRules.rules.map((rule, index) => (
              <Flex
                key={index}
                align="start"
                gap="2"
                className="rounded-xl bg-[var(--gray-a2)] p-2.5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary-soft text-[10px] font-bold text-primary">
                  {index + 1}
                </span>
                <Text size="1" weight="medium" className="leading-relaxed !text-main">
                  {rule}
                </Text>
              </Flex>
            ))}
          </Flex>

          <Flex justify="end">
            <Button size="2" onClick={() => setShowModal(false)} className="!font-bold">
              فهمت وأوافق
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  )
}

/** توافق خلفي — الاسم القديم المستخدم في index.ts */
export const ForumHelpBanner = ForumHelpCard
