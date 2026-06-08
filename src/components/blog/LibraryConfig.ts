import { Zap, CheckCircle, FileText, AlignLeft, Building2, Anchor, Building, Palmtree, School, GraduationCap } from 'lucide-react';

export const gradeNames: Record<string, string> = {
  '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس',
  '6': 'السادس', '7': 'السابع', '8': 'الثامن', '9': 'التاسع',
  '10': 'العاشر', '11': 'الحادي عشر', '12': 'الثاني عشر',
};

export const types = [
  { id: 'foundation', name: 'التأسيس', gradient: 'from-amber-500 to-orange-600', icon: Zap },
  { id: 'solutions', name: 'حل الكتب', gradient: 'from-emerald-500 to-teal-600', icon: CheckCircle },
  { id: 'notes', name: 'المذكرات', gradient: 'from-violet-500 to-purple-600', icon: FileText },
  { id: 'more', name: 'المزيد', gradient: 'from-rose-500 to-pink-600', icon: AlignLeft },
];

export const curriculums = [
  { id: 'kuwait', name: 'منهج كويتي', gradient: 'from-sky-500 to-blue-600', icon: Building2 },
  { id: 'qatar', name: 'منهج قطري', gradient: 'from-red-500 to-rose-600', icon: Anchor },
  { id: 'uae', name: 'منهج إماراتي', gradient: 'from-green-500 to-emerald-600', icon: Building },
  { id: 'saudi', name: 'منهج سعودي', gradient: 'from-emerald-600 to-green-700', icon: Palmtree },
];

export const gradesMap: Record<string, { id: string; name: string; sub: string; gradient: string; icon: React.ElementType }[]> = {
  kuwait: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', gradient: 'from-sky-400 to-sky-600', icon: School },
    { id: 'middle', name: 'متوسط', sub: 'الصف ٦ - ٩', gradient: 'from-sky-600 to-blue-700', icon: GraduationCap },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from-blue-700 to-indigo-800', icon: GraduationCap },
  ],
  qatar: [
    { id: 'basic', name: 'أساسي', sub: 'الصف ١ - ٩', gradient: 'from-red-400 to-red-600', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from-red-700 to-rose-800', icon: GraduationCap },
  ],
  uae: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٥', gradient: 'from-green-400 to-emerald-600', icon: School },
    { id: 'preparatory', name: 'إعدادي', sub: 'الصف ٦ - ٩', gradient: 'from-emerald-600 to-green-700', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from-green-700 to-teal-800', icon: GraduationCap },
  ],
  saudi: [
    { id: 'primary', name: 'ابتدائي', sub: 'الصف ١ - ٦', gradient: 'from-emerald-400 to-emerald-600', icon: School },
    { id: 'middle', name: 'متوسط', sub: 'الصف ٧ - ٩', gradient: 'from-emerald-600 to-green-700', icon: School },
    { id: 'secondary', name: 'ثانوي', sub: 'الصف ١٠ - ١٢', gradient: 'from-green-700 to-teal-800', icon: GraduationCap },
  ],
};

export const subjectsMap: Record<string, { id: string; name: string; gradient: string }[]> = {
  primary: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from-teal-500 to-teal-700' },
    { id: 'arabic', name: 'عربي', gradient: 'from-amber-500 to-amber-700' },
    { id: 'math', name: 'رياضيات', gradient: 'from-blue-500 to-blue-700' },
    { id: 'science', name: 'علوم', gradient: 'from-green-500 to-green-700' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-indigo-500 to-indigo-700' },
    { id: 'social', name: 'اجتماعيات', gradient: 'from-orange-500 to-orange-700' },
  ],
  middle: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from-teal-500 to-teal-700' },
    { id: 'arabic', name: 'عربي', gradient: 'from-amber-500 to-amber-700' },
    { id: 'math', name: 'رياضيات', gradient: 'from-blue-500 to-blue-700' },
    { id: 'physics', name: 'فيزياء', gradient: 'from-yellow-500 to-yellow-700' },
    { id: 'chemistry', name: 'كيمياء', gradient: 'from-purple-500 to-purple-700' },
    { id: 'biology', name: 'أحياء', gradient: 'from-green-600 to-green-800' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-indigo-500 to-indigo-700' },
    { id: 'history', name: 'تاريخ', gradient: 'from-stone-500 to-stone-700' },
    { id: 'geography', name: 'جغرافيا', gradient: 'from-cyan-500 to-cyan-700' },
  ],
  secondary: [
    { id: 'islamic', name: 'إسلامية', gradient: 'from-teal-500 to-teal-700' },
    { id: 'arabic', name: 'عربي', gradient: 'from-amber-500 to-amber-700' },
    { id: 'math', name: 'رياضيات', gradient: 'from-blue-500 to-blue-700' },
    { id: 'physics', name: 'فيزياء', gradient: 'from-yellow-500 to-yellow-700' },
    { id: 'chemistry', name: 'كيمياء', gradient: 'from-purple-500 to-purple-700' },
    { id: 'biology', name: 'أحياء', gradient: 'from-green-600 to-green-800' },
    { id: 'english', name: 'إنجليزي', gradient: 'from-indigo-500 to-indigo-700' },
    { id: 'computer', name: 'حاسب آلي', gradient: 'from-slate-500 to-slate-700' },
    { id: 'stats', name: 'إحصاء', gradient: 'from-rose-500 to-rose-700' },
    { id: 'history', name: 'تاريخ', gradient: 'from-stone-500 to-stone-700' },
    { id: 'geography', name: 'جغرافيا', gradient: 'from-cyan-500 to-cyan-700' },
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
