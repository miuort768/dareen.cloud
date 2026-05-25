import foundationV2Img from '../assets/courses/foundation-v2.jpg';
import foundationNewImg from '../assets/courses/foundation-new.jpg';
import memorizeImg from '../assets/courses/memorize-curriculum.jpg';
import tajweedImg from '../assets/courses/tajweed-course.jpg';
import kuwaitiImg from '../assets/courses/kuwaiti-curriculum.jpg';
import saudiImg from '../assets/courses/saudi-curriculum.jpg';
import uaeImg from '../assets/courses/uae-curriculum.jpg';
import qatariImg from '../assets/courses/qatari-curriculum.jpg';
import omanImg from '../assets/courses/oman-curriculum.jpg';
import egyptImg from '../assets/courses/egypt-curriculum.jpg';
import jordanImg from '../assets/courses/jordan-curriculum.jpg';
import englishImg from '../assets/courses/english-course.jpg';
import arabicImg from '../assets/courses/arabic-course.jpg';
import frenchImg from '../assets/courses/french-course.jpg';
import skillsImg from '../assets/courses/skills-course.jpg';
import { LayoutGrid, GraduationCap, BookOpen, Globe, Languages, Target } from 'lucide-react';

export interface Course {
  id: number;
  category: 'foundation' | 'quran' | 'gulf' | 'english' | 'skills';
  title: string;
  desc: string;
  students: string;
  rating: number;
  price: string;
  image: string;
  color: string;
}

export const CATEGORIES = [
  { label: 'الكل', value: 'all', icon: LayoutGrid, color: 'text-slate-900 dark:text-slate-100' },
  { label: 'التأسيس', value: 'foundation', icon: GraduationCap, color: 'text-emerald-500' },
  { label: 'القرآن الكريم', value: 'quran', icon: BookOpen, color: 'text-amber-500' },
  { label: 'مناهج الخليج', value: 'gulf', icon: Globe, color: 'text-sky-500' },
  { label: 'اللغات', value: 'english', icon: Languages, color: 'text-violet-500' },
  { label: 'القدرات', value: 'skills', icon: Target, color: 'text-rose-500' },
];

export const COURSES: Course[] = [
  { id: 1, category: 'foundation', title: 'كورس التأسيس الشامل', desc: 'تأسيس شامل في اللغة العربية والإنجليزية والرياضيات بأساليب تفاعلية حديثة.', students: '5.2k', rating: 4.9, price: 'متاح الآن', image: foundationV2Img, color: 'from-emerald-500 to-teal-600' },
  { id: 2, category: 'quran', title: 'حفظ القرآن الكريم', desc: 'حلقات تحفيظ فردية وجماعية مع التركيز على التجويد والمراجعة المستمرة.', students: '8.4k', rating: 4.8, price: 'متاح الآن', image: foundationNewImg, color: 'from-amber-500 to-orange-600' },
  { id: 14, category: 'quran', title: 'حفظ مقرر دراسي', desc: 'تحفيظ المنهج الدراسي للتربية الإسلامية بدقة وإتقان لجميع المراحل الدراسية.', students: '4.3k', rating: 4.7, price: 'متاح الآن', image: memorizeImg, color: 'from-amber-500 to-orange-600' },
  { id: 15, category: 'quran', title: 'أحكام التجويد والتلاوة', desc: 'دراسة تطبيقية ونظرية لأحكام التجويد لتحسين جودة التلاوة وإتقان مخارج الحروف.', students: '3.6k', rating: 4.6, price: 'متاح الآن', image: tajweedImg, color: 'from-amber-500 to-orange-600' },
  { id: 3, category: 'gulf', title: 'المنهج الكويتي', desc: 'تغطية شاملة لجميع مواد المنهج الكويتي للمراحل الابتدائية والمتوسطة والثانوية.', students: '4.5k', rating: 4.7, price: 'متاح الآن', image: kuwaitiImg, color: 'from-sky-500 to-blue-600' },
  { id: 9, category: 'gulf', title: 'المنهج السعودي', desc: 'شرح متكامل للمنهج السعودي المطور لجميع المراحل مع نخبة من الأساتذة.', students: '4.1k', rating: 4.8, price: 'متاح الآن', image: saudiImg, color: 'from-sky-500 to-blue-600' },
  { id: 10, category: 'gulf', title: 'المنهج الإماراتي', desc: 'متابعة دقيقة وشرح وافٍ للمناهج الإماراتية الحديثة.', students: '3.2k', rating: 4.5, price: 'متاح الآن', image: uaeImg, color: 'from-sky-500 to-blue-600' },
  { id: 4, category: 'gulf', title: 'المنهج القطري', desc: 'دروس تقوية ومتابعة يومية لطلاب المنهج القطري مع نخبة من المعلمين المختصين.', students: '3.3k', rating: 4.6, price: 'متاح الآن', image: qatariImg, color: 'from-sky-500 to-blue-600' },
  { id: 5, category: 'gulf', title: 'منهج سلطنة عُمان', desc: 'شرح مبسط ووافٍ للمناهج العمانية.', students: '3.1k', rating: 4.4, price: 'متاح الآن', image: omanImg, color: 'from-sky-500 to-blue-600' },
  { id: 11, category: 'gulf', title: 'المنهج المصري', desc: 'دروس تقوية للمنهج المصري بأسلوب مبسط.', students: '4.8k', rating: 4.7, price: 'متاح الآن', image: egyptImg, color: 'from-sky-500 to-blue-600' },
  { id: 6, category: 'gulf', title: 'المنهج الأردني', desc: 'تعليم عالي الجودة يواكب المعايير الأردنية.', students: '2.8k', rating: 4.3, price: 'متاح الآن', image: jordanImg, color: 'from-sky-500 to-blue-600' },
  { id: 7, category: 'english', title: 'اللغة الإنجليزية', desc: 'تطوير مهارات التحدث والكتابة باللغة الإنجليزية باستخدام مناهج عالمية تفاعلية.', students: '3.9k', rating: 4.8, price: 'متاح الآن', image: englishImg, color: 'from-violet-500 to-purple-600' },
  { id: 12, category: 'english', title: 'اللغة العربية', desc: 'تحسين مهارات القراءة والكتابة والنحو العربي بأساليب مبسطة وشيقة.', students: '4.2k', rating: 4.7, price: 'متاح الآن', image: arabicImg, color: 'from-violet-500 to-purple-600' },
  { id: 13, category: 'english', title: 'اللغة الفرنسية', desc: 'تعلم أساسيات ومستويات اللغة الفرنسية مع نخبة من المتخصصين.', students: '2.9k', rating: 4.5, price: 'متاح الآن', image: frenchImg, color: 'from-violet-500 to-purple-600' },
  { id: 8, category: 'skills', title: 'كورس القدرات', desc: 'تجهيز الطلاب لاختبارات القدرات العامة (الكمي واللفظي) بأحدث الاستراتيجيات.', students: '3.5k', rating: 4.9, price: 'متاح الآن', image: skillsImg, color: 'from-rose-500 to-pink-600' },
];
