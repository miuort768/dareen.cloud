import { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { SEO } from '../../components/SEO';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { MasarSection } from '../../components/public/MasarSection';
import { HeroSection } from './components/HeroSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { QuranSection } from './components/QuranSection';
import { HowItWorks } from './components/HowItWorks';
import { Testimonials } from './components/Testimonials';
import { FAQSection } from './components/FAQSection';

export const Home = () => {
    const { adminPhone, heroBanners } = useSettingsStore();
    const whatsappNumber = adminPhone.replace(/\D/g, '');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [typewriterText, setTypewriterText] = useState("");

    let bannersArray = ["", "", "", ""];
    try {
        if (heroBanners) {
            bannersArray = JSON.parse(heroBanners);
        }
    } catch { /* ignore parse error */ }

    const reviews = [
        { name: "أم راشد", role: "ولية أمر", content: "مشكورين وايد على جهودكم، عيالي وايد تحسن مستواهم من عقب ما سجلوا معاكم. صراحة فرق كبير بالأداء المدرسي.", avatar: "/images/avatars/mom1.png" },
        { name: "أم ناصر", role: "ولية أمر", content: "المعهد يبيض الويه، والمدرسين ما يقصرون مع الطلبة. ولدي صار يحب يدرس ويشارك بالحصة بكل حماس.", avatar: "/images/avatars/mom2.png" },
        { name: "أم وضحة", role: "ولية أمر", content: "طريقة التدريس وايد حلوة وتشد الياهل، بنتي كانت تمل من الدراسة بس الحين صارت هي اللي تذكرني بموعد الحصة.", avatar: "/images/avatars/mom3.png" },
        { name: "أبو فهد", role: "ولي أمر", content: "والله يا جماعة دارين السابعة غير، عيالي استفادوا حيل وصاروا يحبون الحصة. الله يبيض وجيهكم وما قصرتوا صراحة على هالمجهود.", avatar: "/images/avatars/mom1.png" },
        { name: "أم جاسم", role: "ولية أمر", content: "الله يعطيكم العافية على المتابعة الدورية، صج تهتمون بأدق التفاصيل والتقارير اللي توصلنا تريح البال وتطمنا على عيالنا.", avatar: "/images/avatars/mom1.png" },
        { name: "أم دلال", role: "ولية أمر", content: "أحسن قرار خذيته إني سجلت عيالي بدارين السابعة. المدرسين قمة في الأخلاق والتعامل، ويوصلون المعلومة بسلاسة.", avatar: "/images/avatars/mom2.png" },
        { name: "أم ريم", role: "ولية أمر", content: "مشكورة وايد إدارة المعهد على هذا المستوى الراقي. التأسيس عندكم وايد قوي وساعد عيالي يتخطون وايد صعوبات.", avatar: "/images/avatars/mom3.png" }
    ];

    useEffect(() => {
        const fullText = "منصة دارين السابعة";
        let i = 0;
        let isDeleting = false;
        let typingSpeed = 150;

        const type = () => {
            const currentText = isDeleting
                ? fullText.substring(0, i - 1)
                : fullText.substring(0, i + 1);

            setTypewriterText(currentText);

            if (!isDeleting && i === fullText.length) {
                isDeleting = true;
                typingSpeed = 2000;
            } else if (isDeleting && i === 0) {
                isDeleting = false;
                typingSpeed = 500;
            } else {
                i += isDeleting ? -1 : 1;
                typingSpeed = isDeleting ? 75 : 150;
            }

            setTimeout(type, typingSpeed);
        };

        const timer = setTimeout(type, typingSpeed);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [reviews.length]);

    const reviewSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'دارين السابعة - منصة تعليم عن بعد',
        description: 'منصة تعليم عن بعد رائدة في الكويت والخليج. دروس خصوصية أونلاين، تحفيظ قرآن، وتأسيس للمناهج الخليجية.',
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

    return (
        <div className="min-h-full bg-[rgb(var(--bg-surface))] font-sans text-[rgb(var(--text-main))] relative overflow-x-hidden transition-colors duration-500">
            <SEO title="دارين السابعة | منصة تعليم عن بعد في الكويت والخليج" description="تعليم عن بعد في الكويت، السعودية، قطر، الإمارات، وعمان. دروس خصوصية أونلاين، تحفيظ قرآن، وتأسيس للمناهج الخليجية مع أفضل المعلمين. احجز حصة تجريبية مجانية الآن." url="https://dareen.cloud/" image="/hero-child.png" />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
            <PublicNavbar />
            <HeroSection typewriterText={typewriterText} whatsappNumber={whatsappNumber} bannersArray={bannersArray} />
            <div style={{ contentVisibility: 'auto' }}>
                <WhyChooseUs />
            </div>
            <div style={{ contentVisibility: 'auto' }}>
                <QuranSection whatsappNumber={whatsappNumber} />
            </div>
            <div style={{ contentVisibility: 'auto' }}>
                <HowItWorks whatsappNumber={whatsappNumber} />
            </div>
            <div style={{ contentVisibility: 'auto' }}>
                <Testimonials reviews={reviews} currentIndex={currentIndex} />
            </div>
            <div style={{ contentVisibility: 'auto' }}>
                <MasarSection />
            </div>
            <div style={{ contentVisibility: 'auto' }}>
                <FAQSection />
            </div>
            <PublicFooter />
        </div>
    );
};
