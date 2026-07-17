import {
    Settings, Building2, Calendar, Coins,
    Palette, Users, KeyRound, MessageSquare,
    Lock, Clock, UserCheck, FileText, Award, HardDrive,
    Shield, Activity
} from 'lucide-react';

export type TabId = 'general' | 'academy' | 'academic-year' | 'currencies' | 'appearance' | 'users' | 'permissions' | 'communications' | 'mobile' | 'policies' | 'working-hours' | 'attendance' | 'reports' | 'rewards' | 'backup' | 'advanced' | 'audit';

export const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'general', label: 'عام', icon: Settings },
    { id: 'academy', label: 'المعهد', icon: Building2 },
    { id: 'academic-year', label: 'السنة الدراسية', icon: Calendar },
    { id: 'currencies', label: 'المالية', icon: Coins },
    { id: 'appearance', label: 'الهوية', icon: Palette },
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'permissions', label: 'الصلاحيات', icon: KeyRound },
    { id: 'communications', label: 'الاتصالات', icon: MessageSquare },
    { id: 'mobile', label: 'واتساب', icon: MessageSquare },
    { id: 'policies', label: 'السياسات', icon: Lock },
    { id: 'working-hours', label: 'أوقات العمل', icon: Clock },
    { id: 'attendance', label: 'الحضور', icon: UserCheck },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'rewards', label: 'المكافآت', icon: Award },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: HardDrive },
    { id: 'advanced', label: 'الأرشيف', icon: Shield },
    { id: 'audit', label: 'السجلات', icon: Activity },
];
