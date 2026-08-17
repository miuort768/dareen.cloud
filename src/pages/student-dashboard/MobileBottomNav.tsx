import { Home, User, Library, MessageCircle, MessageSquare } from 'lucide-react'
import { MobileBottomNav as SharedBottomNav } from '../../shared/components/ui/MobileBottomNav'

const navItems = [
  { id: 'chat', label: 'الرسائل', icon: MessageCircle, path: '/chat' },
  { id: 'forum', label: 'المنتدى', icon: MessageSquare, path: '/forum' },
  { id: 'home', label: 'الرئيسية', icon: Home, path: '/student-dashboard', isCenter: true },
  { id: 'library', label: 'المكتبة', icon: Library, path: '/schedule' },
  { id: 'profile', label: 'حسابي', icon: User, path: '/student-profile' },
]

export const MobileBottomNav = () => <SharedBottomNav items={navItems} layoutId="student-tab-dot" />
