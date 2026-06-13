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
  seoKeywords?: { short: string; long: string };
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
  { id: 1, category: 'foundation', title: 'كورس التأسيس الشامل', desc: 'تأسيس شامل في اللغة العربية والإنجليزية والرياضيات بأساليب تفاعلية حديثة.', students: '5.2k', rating: 4.9, price: 'متاح الآن', image: foundationV2Img, color: 'from-emerald-500 to-teal-600', seoKeywords: { short: 'تأسيس أطفال, كورس تأسيس, تأسيس قراءة وكتابة, تأسيس رياضيات, تأسيس لغة عربية, تأسيس انجليزي', long: 'أفضل كورس تأسيس شامل للأطفال في الكويت والسعودية, تأسيس أطفال قبل المدرسة أونلاين, كورس تأسيس لغة عربية للأطفال, تأسيس قراءة وكتابة المنهج الكويتي, تأسيس رياضيات للأطفال عن بعد, كورس تأسيس شامل للمناهج الخليجية' } },
  { id: 2, category: 'quran', title: 'حفظ القرآن الكريم', desc: 'حلقات تحفيظ فردية وجماعية مع التركيز على التجويد والمراجعة المستمرة.', students: '8.4k', rating: 4.8, price: 'متاح الآن', image: foundationNewImg, color: 'from-amber-500 to-orange-600', seoKeywords: { short: 'تحفيظ قرآن, حفظ القرآن, تحفيظ قرآن عن بعد, حلقات تحفيظ, تحفيظ أطفال', long: 'تحفيظ القرآن الكريم عن بعد للأطفال في الكويت, أفضل حلقات تحفيظ قرآن أونلاين, تحفيظ قرآن مع التجويد والتلاوة, حلقات تحفيظ قرآن للأطفال في السعودية, تحفيظ القرآن الكريم في الإمارات وقطر وعمان' } },
  { id: 14, category: 'quran', title: 'حفظ مقرر دراسي', desc: 'تحفيظ المنهج الدراسي للتربية الإسلامية بدقة وإتقان لجميع المراحل الدراسية.', students: '4.3k', rating: 4.7, price: 'متاح الآن', image: memorizeImg, color: 'from-amber-500 to-orange-600', seoKeywords: { short: 'حفظ مقرر دراسي, تحفيظ تربية اسلامية, حفظ منهج دراسي, تحفيظ مواد شرعية', long: 'حفظ المقرر الدراسي للتربية الإسلامية أونلاين, تحفيظ منهج التربية الإسلامية الكويتي, حفظ مواد التربية الإسلامية المنهج السعودي, تحفيظ المقرر الدراسي لجميع المراحل' } },
  { id: 15, category: 'quran', title: 'أحكام التجويد والتلاوة', desc: 'دراسة تطبيقية ونظرية لأحكام التجويد لتحسين جودة التلاوة وإتقان مخارج الحروف.', students: '3.6k', rating: 4.6, price: 'متاح الآن', image: tajweedImg, color: 'from-amber-500 to-orange-600', seoKeywords: { short: 'أحكام التجويد, تعلم التجويد, تحسين التلاوة, تجويد القرآن, مخارج الحروف', long: 'دورة أحكام التجويد والتلاوة أونلاين, أفضل كورس تجويد للمبتدئين, تعلم تجويد القرآن عن بعد في الكويت, تحسين تلاوة القرآن الكريم, إتقان مخارج الحروف وأحكام التجويد' } },
  { id: 3, category: 'gulf', title: 'المنهج الكويتي', desc: 'تغطية شاملة لجميع مواد المنهج الكويتي للمراحل الابتدائية والمتوسطة والثانوية.', students: '4.5k', rating: 4.7, price: 'متاح الآن', image: kuwaitiImg, color: 'from-sky-500 to-blue-600', seoKeywords: { short: 'منهج كويتي, مدرس خصوصي الكويت, دروس خصوصية الكويت, شرح المنهج الكويتي, حل كتب الكويت', long: 'أفضل مدرس خصوصي للمنهج الكويتي أونلاين, شرح المنهج الكويتي لجميع المراحل, دروس تقوية المنهج الكويتي, مذكرات منهج كويتي, معلم خصوصي المنهج الكويتي في الكويت' } },
  { id: 9, category: 'gulf', title: 'المنهج السعودي', desc: 'شرح متكامل للمنهج السعودي المطور لجميع المراحل مع نخبة من الأساتذة.', students: '4.1k', rating: 4.8, price: 'متاح الآن', image: saudiImg, color: 'from-sky-500 to-blue-600', seoKeywords: { short: 'منهج سعودي, مدرس خصوصي الرياض, دروس خصوصية السعودية, شرح المنهج السعودي, قدرات وتحصيلي', long: 'أفضل مدرس خصوصي للمنهج السعودي أونلاين, شرح المنهج السعودي المطور, دروس تقوية المنهج السعودي في الرياض وجدة, معلم خصوصي قدرات وتحصيلي المنهج السعودي' } },
  { id: 10, category: 'gulf', title: 'المنهج الإماراتي', desc: 'متابعة دقيقة وشرح وافٍ للمناهج الإماراتية الحديثة.', students: '3.2k', rating: 4.5, price: 'متاح الآن', image: uaeImg, color: 'from-sky-500 to-blue-600', seoKeywords: { short: 'منهج اماراتي, مدرس خصوصي دبي, دروس خصوصية الامارات, شرح المنهج الاماراتي', long: 'أفضل مدرس خصوصي للمنهج الإماراتي في دبي وأبوظبي, شرح المنهج الإماراتي أونلاين, دروس تقوية المنهج الإماراتي لجميع المراحل, معلم خصوصي المنهج الإماراتي في الشارقة' } },
  { id: 4, category: 'gulf', title: 'المنهج القطري', desc: 'دروس تقوية ومتابعة يومية لطلاب المنهج القطري مع نخبة من المعلمين المختصين.', students: '3.3k', rating: 4.6, price: 'متاح الآن', image: qatariImg, color: 'from-sky-500 to-blue-600', seoKeywords: { short: 'منهج قطري, مدرس خصوصي الدوحة, دروس خصوصية قطر, شرح المنهج القطري', long: 'أفضل مدرس خصوصي للمنهج القطري في الدوحة والريان, شرح المنهج القطري أونلاين, دروس تقوية المنهج القطري لجميع المراحل, معلم خصوصي المنهج القطري في الوكرة' } },
  { id: 5, category: 'gulf', title: 'منهج سلطنة عُمان', desc: 'شرح مبسط ووافٍ للمناهج العمانية.', students: '3.1k', rating: 4.4, price: 'متاح الآن', image: omanImg, color: 'from-sky-500 to-blue-600', seoKeywords: { short: 'منهج عماني, مدرس خصوصي مسقط, دروس خصوصية عمان, شرح المنهج العماني', long: 'أفضل مدرس خصوصي للمنهج العماني في مسقط وصلالة, شرح المنهج العماني أونلاين, دروس تقوية المنهج العماني, معلم خصوصي المنهج العماني في صحار والسيب' } },
  { id: 11, category: 'gulf', title: 'المنهج المصري', desc: 'دروس تقوية للمنهج المصري بأسلوب مبسط.', students: '4.8k', rating: 4.7, price: 'متاح الآن', image: egyptImg, color: 'from-sky-500 to-blue-600', seoKeywords: { short: 'منهج مصري, مدرس خصوصي مصر, دروس خصوصية المنهج المصري, شرح المنهج المصري', long: 'أفضل مدرس خصوصي للمنهج المصري أونلاين, شرح المنهج المصري الجديد, دروس تقوية المنهج المصري للمراحل الابتدائية والإعدادية والثانوية' } },
  { id: 6, category: 'gulf', title: 'المنهج الأردني', desc: 'تعليم عالي الجودة يواكب المعايير الأردنية.', students: '2.8k', rating: 4.3, price: 'متاح الآن', image: jordanImg, color: 'from-sky-500 to-blue-600', seoKeywords: { short: 'منهج أردني, مدرس خصوصي الأردن, دروس خصوصية المنهج الأردني, شرح المنهج الأردني', long: 'أفضل مدرس خصوصي للمنهج الأردني أونلاين, شرح المنهاج الأردني, دروس تقوية المنهج الأردني لجميع المراحل, مذكرات منهج أردني' } },
  { id: 16, category: 'gulf', title: 'شرح وحل شي معين', desc: 'إذا عندك جزئية معينة أو مسألة عاوز شرحها أو حلها، احنا هنا نساعدك في أي مادة.', students: '1.2k', rating: 4.9, price: 'متاح الآن', image: memorizeImg, color: 'from-sky-500 to-blue-600', seoKeywords: { short: 'شرح مسائل, حل واجبات, شرح دروس خصوصية, مساعدة دراسية, حل تمارين', long: 'شرح وحل مسائل الرياضيات أونلاين, حل واجبات مدرسية للمناهج الخليجية, شرح جزئية معينة في أي مادة, مساعدة دراسية فردية للطلاب, شرح مسائل العلوم والفيزياء والكيمياء' } },
  { id: 7, category: 'english', title: 'اللغة الإنجليزية', desc: 'تطوير مهارات التحدث والكتابة باللغة الإنجليزية باستخدام مناهج عالمية تفاعلية.', students: '3.9k', rating: 4.8, price: 'متاح الآن', image: englishImg, color: 'from-violet-500 to-purple-600', seoKeywords: { short: 'تعلم انجليزي, كورس انجليزي, مدرس انجليزي خصوصي, محادثة انجليزي, قواعد انجليزي', long: 'أفضل كورس لتعلم اللغة الإنجليزية أونلاين, مدرس انجليزي خصوصي للمناهج الخليجية, دورس تأسيس انجليزي للأطفال, محادثة انجليزي عن بعد, قواعد اللغة الإنجليزية لجميع المستويات' } },
  { id: 12, category: 'english', title: 'اللغة العربية', desc: 'تحسين مهارات القراءة والكتابة والنحو العربي بأساليب مبسطة وشيقة.', students: '4.2k', rating: 4.7, price: 'متاح الآن', image: arabicImg, color: 'from-violet-500 to-purple-600', seoKeywords: { short: 'تعلم لغة عربية, مدرس عربي خصوصي, قواعد نحوية, قراءة وكتابة, تأسيس لغة عربية', long: 'أفضل مدرس لغة عربية خصوصي أونلاين, دروس تقوية لغة عربية للمناهج الخليجية, تأسيس قراءة وكتابة للأطفال, شرح النحو العربي وقواعده, تحسين مهارات اللغة العربية' } },
  { id: 13, category: 'english', title: 'اللغة الفرنسية', desc: 'تعلم أساسيات ومستويات اللغة الفرنسية مع نخبة من المتخصصين.', students: '2.9k', rating: 4.5, price: 'متاح الآن', image: frenchImg, color: 'from-violet-500 to-purple-600', seoKeywords: { short: 'تعلم فرنسي, كورس فرنسي, مدرس فرنسي خصوصي, لغة فرنسية أونلاين', long: 'أفضل كورس لتعلم اللغة الفرنسية أونلاين, مدرس فرنسي خصوصي للمبتدئين, دروس فرنسي للمناهج الخليجية, تعلم الفرنسية من الصفر, محادثة فرنسية عن بعد' } },
  { id: 8, category: 'skills', title: 'كورس القدرات', desc: 'تجهيز الطلاب لاختبارات القدرات العامة (الكمي واللفظي) بأحدث الاستراتيجيات.', students: '3.5k', rating: 4.9, price: 'متاح الآن', image: skillsImg, color: 'from-rose-500 to-pink-600', seoKeywords: { short: 'قدرات, تحصيلي, اختبار القدرات, قدرات كمي, قدرات لفظي, تحصيلي رياضيات', long: 'أفضل كورس قدرات وتحصيلي أونلاين, تجهيز اختبار القدرات العامة في السعودية, شرح قدرات كمي ولفظي, اختبارات تجريبية قدرات وتحصيلي, مذكرات قدرات وتحصيلي المنهج السعودي' } },
];
