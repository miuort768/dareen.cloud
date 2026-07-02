import { Zap, CheckCircle, FileText, AlignLeft, Building2, Anchor, Building, Palmtree, School, GraduationCap } from 'lucide-react';

export const gradeNames: Record<string, string> = {
  '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس',
  '6': 'السادس', '7': 'السابع', '8': 'الثامن', '9': 'التاسع',
  '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر',
};

export const types = [
  { id: 'foundation', name: 'التأسيس', gradient: 'from--[var(--bg-warning)] to--[var(--bg-warning)]', icon: Zap },
  { id: 'solutions', name: 'حل الكتب', gradient: 'from-[var(--bg-success)] to--[var(--bg-info)]', icon: CheckCircle },
  { id: 'notes', name: 'المذكرات', gradient: 'from--[var(--bg-primary)] to-[var(--bg-primary)]', icon: FileText },
  { id: 'more', name: 'المزيد', gradient: 'from-[var(--bg-error)] to--[var(--bg-primary)]', icon: AlignLeft },
];

export const curriculums = [
  { id: 'kuwait', name: 'منهج كويتي', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]', icon: Building2 },
  { id: 'qatar', name: 'منهج قطري', gradient: 'from--[var(--bg-error)] to-[var(--bg-error)]', icon: Anchor },
  { id: 'uae', name: 'منهج إماراتي', gradient: 'from--[var(--bg-success)] to-[var(--bg-success)]', icon: Building },
  { id: 'saudi', name: 'منهج سعودي', gradient: 'from--[var(--bg-success)] to--[var(--bg-success)]', icon: Palmtree },
];

export const gradesMap: Record<string, { id: string; name: string; sub: string; gradient: string; icon: React.ElementType }[]> = {
  kuwait: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]', icon: School },
    { id: 'middle', name: 'متوسط', sub: 'الصف ٦ - ٩', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]', icon: GraduationCap },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from--[var(--bg-info)] to--[var(--bg-primary)]', icon: GraduationCap },
  ],
  qatar: [
    { id: 'basic', name: 'أساسي', sub: 'الصف ١ - ٩', gradient: 'from--[var(--bg-error)] to--[var(--bg-error)]', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from--[var(--bg-error)] to--[var(--bg-error)]', icon: GraduationCap },
  ],
  uae: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', gradient: 'from--[var(--bg-success)] to-[var(--bg-success)]', icon: School },
    { id: 'preparatory', name: 'إعدادي', sub: 'الصف ٦ - ٩', gradient: 'from--[var(--bg-success)] to--[var(--bg-success)]', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from--[var(--bg-success)] to--[var(--bg-info)]', icon: GraduationCap },
  ],
  saudi: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٦', gradient: 'from-[var(--bg-success)] to-[var(--bg-success)]', icon: School },
    { id: 'middle', name: 'متوسط', sub: 'الصف ٧ - ٩', gradient: 'from--[var(--bg-success)] to--[var(--bg-success)]', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from--[var(--bg-success)] to--[var(--bg-info)]', icon: GraduationCap },
  ],
};

export const subjectsMap: Record<string, { id: string; name: string; gradient: string }[]> = {
  primary: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]' },
    { id: 'arabic', name: 'عربي', gradient: 'from--[var(--bg-warning)] to--[var(--bg-warning)]' },
    { id: 'math', name: 'رياضيات', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]' },
    { id: 'science', name: 'علوم', gradient: 'from--[var(--bg-success)] to--[var(--bg-success)]' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'social', name: 'اجتماعيات', gradient: 'from--[var(--bg-warning)] to--[var(--bg-warning)]' },
  ],
  middle: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]' },
    { id: 'arabic', name: 'عربي', gradient: 'from--[var(--bg-warning)] to--[var(--bg-warning)]' },
    { id: 'math', name: 'رياضيات', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]' },
    { id: 'physics', name: 'فيزياء', gradient: 'from--[var(--bg-warning)] to--[var(--bg-warning)]' },
    { id: 'chemistry', name: 'كيمياء', gradient: 'from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'biology', name: 'أحياء', gradient: 'from--[var(--bg-success)] to--[var(--bg-success)]' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'history', name: 'تاريخ', gradient: 'from-[var(--bg-card)] to-[var(--bg-card)]' },
    { id: 'geography', name: 'جغرافيا', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]' },
  ],
  secondary: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]' },
    { id: 'arabic', name: 'عربي', gradient: 'from--[var(--bg-warning)] to--[var(--bg-warning)]' },
    { id: 'math', name: 'رياضيات', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]' },
    { id: 'physics', name: 'فيزياء', gradient: 'from--[var(--bg-warning)] to--[var(--bg-warning)]' },
    { id: 'chemistry', name: 'كيمياء', gradient: 'from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'biology', name: 'أحياء', gradient: 'from--[var(--bg-success)] to--[var(--bg-success)]' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-[var(--bg-primary)] to-[var(--bg-primary)]' },
    { id: 'computer', name: 'حاسب آلي', gradient: 'from-[var(--bg-background)]0 to-[var(--bg-primary-active)]' },
    { id: 'stats', name: 'إحصاء', gradient: 'from-[var(--bg-error)] to--[var(--bg-error)]' },
    { id: 'history', name: 'تاريخ', gradient: 'from-[var(--bg-card)] to-[var(--bg-card)]' },
    { id: 'geography', name: 'جغرافيا', gradient: 'from--[var(--bg-info)] to--[var(--bg-info)]' },
  ],
  basic: [] as { id: string; name: string; gradient: string }[],
  preparatory: [] as { id: string; name: string; gradient: string }[],
};
subjectsMap.basic = subjectsMap.middle;
subjectsMap.preparatory = subjectsMap.middle;

export const subjectNameMap: Record<string, string> = {};
Object.values(subjectsMap).forEach(arr => arr.forEach(s => {
  if (!subjectNameMap[s.id]) subjectNameMap[s.id] = s.name;
}));

export const classroomsMap: Record<string, Record<string, string[]>> = {
  kuwait: { primary: ['1', '2', '3', '4', '5'], middle: ['6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  qatar: { basic: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  uae: { primary: ['1', '2', '3', '4', '5'], preparatory: ['6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  saudi: { primary: ['1', '2', '3', '4', '5', '6'], middle: ['7', '8', '9'], secondary: ['10', '11', '12'] },
};

export const directTypes = ['foundation', 'more'];

export type ViewType = 'types' | 'curriculums' | 'grades' | 'classrooms' | 'terms' | 'subjects' | 'results';

export interface GridItem {
    id: string;
    name: string;
    gradient?: string;
    sub?: string;
    icon: React.ElementType;
    [key: string]: unknown;
}
