import { Home, Users, MessageSquare, User, MoreHorizontal } from 'lucide-react';
import { MobileBottomNav } from '../../shared/components/ui/MobileBottomNav';

const navItems = [
    { id: 'more', label: 'المزيد', icon: MoreHorizontal, path: '/parent-announcements' },
    { id: 'profile', label: 'حسابي', icon: User, path: '/parent-profile' },
    { id: 'home', label: 'الرئيسية', icon: Home, path: '/parent-dashboard', isCenter: true },
    { id: 'children', label: 'الأبناء', icon: Users, path: '/parent-students' },
    { id: 'chat', label: 'المحادثة', icon: MessageSquare, path: '/chat' },
];

export const MobileBottomNav = () => (
    <MobileBottomNav items={navItems} layoutId="parent-tab-dot" />
);
