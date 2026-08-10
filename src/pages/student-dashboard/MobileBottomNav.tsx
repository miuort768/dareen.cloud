import { Home, User, Library, MessageCircle } from 'lucide-react';
import { MobileBottomNav as SharedBottomNav } from '../../shared/components/ui/MobileBottomNav';

const navItems = [
    { id: 'chat', label: 'الرسائل', icon: MessageCircle, path: '/chat' },
    { id: 'profile', label: 'حسابي', icon: User, path: '/student-profile' },
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/student-dashboard', isCenter: true },
    { id: 'library', label: 'المكتبة', icon: Library, path: '/schedule' },
];

export const MobileBottomNav = () => (
    <SharedBottomNav items={navItems} layoutId="student-tab-dot" />
);
