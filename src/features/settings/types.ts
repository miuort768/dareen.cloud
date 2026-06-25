export interface Permission {
    id: string;
    label: string;
}

export interface ThemePreset {
    id: string;
    color: string;
    label: string;
}

export const AVAILABLE_PERMISSIONS: Permission[] = [
    { id: 'dashboard', label: 'الرئيسية' },
    { id: 'students', label: 'الطلاب' },
    { id: 'attendance', label: 'الحضور والغياب' },
    { id: 'finance', label: 'المالية العامة' },
    { id: 'student_invoices', label: 'فواتير الطلاب' },
    { id: 'teacher_invoices', label: 'فواتير المعلمين' },
    { id: 'reports', label: 'التقارير' },
    { id: 'schedule', label: 'الجدول الدراسي' },
    { id: 'teachers', label: 'المعلمين' },
    { id: 'parents', label: 'أولياء الأمور' },
    { id: 'appointments', label: 'المواعيد' },
    { id: 'settings', label: 'الإعدادات' },
    { id: 'tasks', label: 'المهام' },
    { id: 'evaluations', label: 'التقييمات والنقاط' },
    { id: 'trial_sessions', label: 'جلسات المراجعة' },
    { id: 'announcements', label: 'إدارة الإعلانات' },
];

export const THEME_PRESETS: ThemePreset[] = [
    { id: 'indigo', color: '#4f46e5', label: 'نيلي' },
    { id: 'blue', color: '#2563eb', label: 'أزرق' },
    { id: 'emerald', color: '#10b981', label: 'زمردي' },
    { id: 'rose', color: '#e11d48', label: 'وردي' },
    { id: 'amber', color: '#d97706', label: 'عسلي' },
    { id: 'purple', color: '#7c3aed', label: 'بنفسجي' },
    { id: 'cyan', color: '#0891b2', label: 'سماوي' },
    { id: 'teal', color: '#0d9488', label: 'فيروزي' },
    { id: 'orange', color: '#ea580c', label: 'برتقالي' },
    { id: 'slate', color: '#475569', label: 'صخري' },
    { id: 'pink', color: '#db2777', label: 'زهري' },
    { id: 'lime', color: '#65a30d', label: 'ليموني' },
    { id: 'sky', color: '#0284c7', label: 'سماوي فاتح' },
    { id: 'fuchsia', color: '#c026d3', label: 'أرجواني' },
];

export interface SettingsState {
    academyName: string;
    adminPhone: string;
    themeColor: string;
    notificationsEnabled: boolean;
    autoBackup: boolean;
}
