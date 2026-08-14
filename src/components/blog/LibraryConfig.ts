import { CheckCircle, FileText, AlignLeft, Building2, Anchor, Building, Palmtree, School, GraduationCap, Languages, Globe } from 'lucide-react';

export const gradeNames: Record<string, string> = {
  '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس',
  '6': 'السادس', '7': 'السابع', '8': 'الثامن', '9': 'التاسع',
  '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر',
};

export const types = [
  { id: 'foundation', name: 'تعلم اللغة', icon: Languages },
  { id: 'solutions', name: 'حل الكتب', icon: CheckCircle },
  { id: 'notes', name: 'المذكرات', icon: FileText },
  { id: 'more', name: 'المزيد', icon: AlignLeft },
];

export const curriculums = [
  { id: 'kuwait', name: 'منهج كويتي', icon: Building2 },
  { id: 'qatar', name: 'منهج قطري', icon: Anchor },
  { id: 'oman', name: 'منهج عماني', icon: Building },
  { id: 'jordan', name: 'منهج أردني', icon: Globe },
  { id: 'uae', name: 'منهج إماراتي', icon: Building },
  { id: 'saudi', name: 'منهج سعودي', icon: Palmtree },
];

export const gradesMap: Record<string, { id: string; name: string; sub: string; icon: React.ElementType }[]> = {
  kuwait: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', icon: School },
    { id: 'middle', name: 'متوسط', sub: 'الصف ٦ - ٩', icon: GraduationCap },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', icon: GraduationCap },
  ],
  qatar: [
    { id: 'basic', name: 'أساسي', sub: 'الصف ١ - ٩', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', icon: GraduationCap },
  ],
  oman: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٤', icon: School },
    { id: 'preparatory', name: 'إعدادي', sub: 'الصف ٥ - ١٠', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١١ - ١٢', icon: GraduationCap },
  ],
  jordan: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٦', icon: School },
    { id: 'preparatory', name: 'إعدادي', sub: 'الصف ٧ - ٩', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', icon: GraduationCap },
  ],
  uae: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', icon: School },
    { id: 'preparatory', name: 'إعدادي', sub: 'الصف ٦ - ٩', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', icon: GraduationCap },
  ],
  saudi: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٦', icon: School },
    { id: 'middle', name: 'متوسط', sub: 'الصف ٧ - ٩', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', icon: GraduationCap },
  ],
};

export const subjectsMap: Record<string, { id: string; name: string }[]> = {
  primary: [
    { id: 'islamic', name: 'إسلامية' },
    { id: 'arabic', name: 'عربي' },
    { id: 'math', name: 'رياضيات' },
    { id: 'science', name: 'علوم' },
    { id: 'english', name: 'إنجليزي' },
    { id: 'social', name: 'اجتماعيات' },
  ],
  middle: [
    { id: 'islamic', name: 'إسلامية' },
    { id: 'arabic', name: 'عربي' },
    { id: 'math', name: 'رياضيات' },
    { id: 'physics', name: 'فيزياء' },
    { id: 'chemistry', name: 'كيمياء' },
    { id: 'biology', name: 'أحياء' },
    { id: 'english', name: 'إنجليزي' },
    { id: 'history', name: 'تاريخ' },
    { id: 'geography', name: 'جغرافيا' },
  ],
  secondary: [
    { id: 'islamic', name: 'إسلامية' },
    { id: 'arabic', name: 'عربي' },
    { id: 'math', name: 'رياضيات' },
    { id: 'physics', name: 'فيزياء' },
    { id: 'chemistry', name: 'كيمياء' },
    { id: 'biology', name: 'أحياء' },
    { id: 'english', name: 'إنجليزي' },
    { id: 'computer', name: 'حاسب آلي' },
    { id: 'stats', name: 'إحصاء' },
    { id: 'history', name: 'تاريخ' },
    { id: 'geography', name: 'جغرافيا' },
  ],
  basic: [] as { id: string; name: string }[],
  preparatory: [] as { id: string; name: string }[],
};
subjectsMap.basic = subjectsMap.middle;
subjectsMap.preparatory = subjectsMap.middle;

export const languages = [
  { id: 'arabic', name: 'العربية', icon: Globe, sub: 'لغة القرآن والثقافة' },
  { id: 'english', name: 'الإنجليزية', icon: Globe, sub: 'English Language' },
  { id: 'french', name: 'الفرنسية', icon: Globe, sub: 'Langue Française' },
  { id: 'spanish', name: 'الإسبانية', icon: Globe, sub: 'Lengua Española' },
] as const;

export type LanguageId = typeof languages[number]['id'];

export const subjectNameMap: Record<string, string> = {};
Object.values(subjectsMap).forEach(arr => arr.forEach(s => {
  if (!subjectNameMap[s.id]) subjectNameMap[s.id] = s.name;
}));

export const classroomsMap: Record<string, Record<string, string[]>> = {
  kuwait: { primary: ['1', '2', '3', '4', '5'], middle: ['6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  qatar: { basic: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  oman: { primary: ['1', '2', '3', '4'], preparatory: ['5', '6', '7', '8', '9', '10'], secondary: ['11', '12'] },
  jordan: { primary: ['1', '2', '3', '4', '5', '6'], preparatory: ['7', '8', '9'], secondary: ['10', '11', '12'] },
  uae: { primary: ['1', '2', '3', '4', '5'], preparatory: ['6', '7', '8', '9'], secondary: ['10', '11', '12'] },
  saudi: { primary: ['1', '2', '3', '4', '5', '6'], middle: ['7', '8', '9'], secondary: ['10', '11', '12'] },
};

export const directTypes = ['foundation', 'more'];

export type ViewType = 'types' | 'curriculums' | 'grades' | 'classrooms' | 'terms' | 'subjects' | 'results' | 'languages' | 'language-sections';

export interface GridItem {
    id: string;
    name: string;
    sub?: string;
    icon: React.ElementType;
    [key: string]: unknown;
}
