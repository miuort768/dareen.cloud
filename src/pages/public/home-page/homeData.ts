import { Gift, Trophy, Video, Star } from 'lucide-react';
import { COURSES, CATEGORIES } from '../../../data/courses';



export type FeatureVariant = 'primary' | 'info' | 'success' | 'warning';

export const featureStyles: Record<FeatureVariant, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary-soft', text: 'text-primary' },
    info: { bg: 'bg-info-soft', text: 'text-info-dark' },
    success: { bg: 'bg-success-soft', text: 'text-success-dark' },
    warning: { bg: 'bg-warning-soft', text: 'text-warning-dark' },
};

export const quickFeatures: { icon: typeof Gift; label: string; desc: string; variant: FeatureVariant }[] = [
    { icon: Gift, label: 'حصة مجانية تجريبية', desc: 'لك حصة مجانية في كل مادة تريد تسجيلها', variant: 'primary' },
    { icon: Trophy, label: 'مناهج خليجية', desc: 'كويتي، سعودي، إماراتي، قطري وعماني', variant: 'info' },
    { icon: Video, label: 'تحفيظ قرآن', desc: 'تجويد وإتقان مع قراء مجازين وخبرة', variant: 'success' },
    { icon: Star, label: 'متابعة دورية', desc: 'تقارير أسبوعية و اختبارات لمتابعة المستوى', variant: 'warning' },
];

export const getFilteredCourses = (category: string) =>
    category === 'all' ? COURSES : COURSES.filter(c => c.category === category);

export const heroSlides = [
    { title: 'منصة دارين', subtitle: 'دروس خصوصية فردية اونلاين', desc: 'أفضل المعلمين وأحدث التقنيات لتفوق أبنائكم.', image: '/hero-child.png', alt: 'طفل يدرس على منصة دارين السابعة للتعليم عن بعد في الكويت' },
    { title: 'دورات تفاعلية', subtitle: 'تعلم بأحدث الأساليب', desc: 'دروس خصوصية تفاعلية في جميع المواد للمناهج الكويتية والخليجية.', image: '/teacher-foundation.webp', alt: 'معلم خصوصي يشرح درس أونلاين لطالب في الكويت' },
    { title: 'مستقبل مشرق', subtitle: 'مع نخبة المعلمين', desc: 'كوادر تعليمية متميزة لضمان أفضل النتائج في الرياضيات والعلوم واللغات.', image: '/dareen_books_portal_v3.png', alt: 'مكتبة دارين السابعة التعليمية - كتب ومواد دراسية للمناهج الخليجية' },
];

export const stages = CATEGORIES;

export const reviews = [
    { name: "أم راشد", role: "ولية أمر", content: "مشكورين وايد على جهودكم، عيالي وايد تحسن مستواهم من عقب ما سجلوا معاكم. صراحة فرق كبير بالأداء المدرسي.", avatar: "/images/avatars/mom1.webp" },
    { name: "أم ناصر", role: "ولية أمر", content: "المعهد يبيض الويه، والمدرسين ما يقصرون مع الطلبة. ولدي صار يحب يدرس ويشارك بالحصة بكل حماس.", avatar: "/images/avatars/mom2.webp" },
    { name: "أم وضحة", role: "ولية أمر", content: "طريقة التدريس وايد حلوة وتشد الياهل، بنتي كانت تمل من الدراسة بس الحين صارت هي اللي تذكرني بموعد الحصة.", avatar: "/images/avatars/mom3.webp" },
    { name: "أبو فهد", role: "ولي أمر", content: "والله يا جماعة دارين السابعة غير، عيالي استفادوا حيل وصاروا يحبون الحصة. الله يبيض وجيهكم وما قصرتوا صراحة على هالمجهود.", avatar: "/images/avatars/mom1.webp" },
    { name: "أم جاسم", role: "ولية أمر", content: "الله يعطيكم العافية على المتابعة الدورية، صج تهتمون بأدق التفاصيل والتقارير اللي توصلنا تريح البال وتطمنا على عيالنا.", avatar: "/images/avatars/mom1.webp" },
    { name: "أم دلال", role: "ولية أمر", content: "أحسن قرار خذيته إني سجلت عيالي بدارين السابعة. المدرسين قمة في الأخلاق والتعامل، ويوصلون المعلومة بسلاسة.", avatar: "/images/avatars/mom2.webp" },
    { name: "أم ريم", role: "ولية أمر", content: "مشكورة وايد إدارة المعهد على هذا المستوى الراقي. التأسيس عندكم وايد قوي وساعد عيالي يتخطون وايد صعوبات.", avatar: "/images/avatars/mom3.webp" }
];

export const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'دارين السابعة - منصة تعليم عن بعد',
    description: 'منصة تعليم عن بعد رائدة في الكويت والخليج. دروس خصوصية، تحفيظ قرآن، وتأسيس للمناهج الخليجية.',
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        bestRating: '5',
        ratingCount: '120',
        reviewCount: reviews.length.toString(),
    },
    review: reviews.map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.name },
        reviewBody: r.content,
        reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    })),
};
