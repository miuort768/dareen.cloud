import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE = 'https://dareen.cloud';

const toAbs = (src: string) => src.startsWith('http') ? src : `${BASE}${src}`;

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    preloadImages?: string[];
    breadcrumbs?: { name: string; item: string }[];
    noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = '/dareen_logo_new.jpg',
    url = 'https://dareen.cloud/',
    preloadImages = [],
    breadcrumbs,
    noindex = false
}) => {
    const absUrl = url.startsWith('http') ? url : `${BASE}${url}`;
    const absImage = toAbs(image);
    const siteTitle = 'دارين السابعة للتعليم والتدريب';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const siteDescription = description || "دارين السابعة لتعليم والتدريب - المنصة الأولى المعتمدة للتعليم عن بعد في الكويت، قطر، السعودية، الإمارات، وسلطنة عمان. نوفر أفضل المدرسين الخصوصيين، تحفيظ قرآن، وتأسيس ومراجعات للمناهج الخليجية والإنترناشونال.";
    const siteKeywords = keywords || "تعليم عن بعد, دارين السابعة, مدرس خصوصي الكويت, دروس خصوصية قطر, افضل منصة تعليمية السعودية, معلمين الامارات, دروس اونلاين سلطنة عمان, تحفيظ قرآن عن بعد, منهج كويتي, منهج سعودي, قدرات وتحصيلي, تأسيس لغة عربية, مراجعات نهائية, اكاديمية تعليمية";

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={siteDescription} />
            <meta name="keywords" content={siteKeywords} />
            <meta name="author" content="دارين السابعة للتعليم والتدريب" />
            <link rel="icon" type="image/png" href="/icons/icon-48x48.png" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={absUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={absImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="ar_AR" />
            <meta property="og:locale:alternate" content="en_US" />
            <meta property="og:site_name" content="دارين السابعة" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:site" content="@dareen_academy" />
            <meta property="twitter:url" content={absUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={siteDescription} />
            <meta property="twitter:image" content={absImage} />

            {/* Preload Critical Assets */}
            {preloadImages.map((src, idx) => (
                <link key={idx} rel="preload" href={toAbs(src)} as="image" />
            ))}

            {/* Geographic & Regional Domination Meta Tags */}
            <meta name="geo.region" content="SA, KW, AE, QA, BH, OM" />
            <meta name="geo.placename" content="Middle East, GCC, الرياض، جدة، الكويت، دبي، الدوحة، مسقط" />
            <meta name="geo.position" content="24.7136;46.6753" />
            <meta name="ICBM" content="24.7136, 46.6753" />

            <link rel="alternate" href={absUrl} hrefLang="ar" />
            <link rel="alternate" href={absUrl} hrefLang="ar-sa" />
            <link rel="alternate" href={absUrl} hrefLang="ar-kw" />
            <link rel="alternate" href={absUrl} hrefLang="ar-ae" />
            <link rel="alternate" href={absUrl} hrefLang="ar-qa" />
            <link rel="alternate" href={absUrl} hrefLang="ar-om" />
            <link rel="alternate" href={absUrl} hrefLang="ar-bh" />
            <link rel="alternate" href={absUrl} hrefLang="x-default" />

            {/* Advanced Multi-Schema for Rich Snippets (Sitelinks, Star Ratings, FAQs, Courses) */}
            <script type="application/ld+json">
                {JSON.stringify([
                    {
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "دارين السابعة للتعليم والتدريب",
                        "url": "https://dareen.cloud/",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": {
                                "@type": "EntryPoint",
                                "urlTemplate": "https://dareen.cloud/search?q={search_term_string}"
                            },
                            "query-input": "required name=search_term_string"
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "SiteNavigationElement",
                        "name": ["الرئيسية", "الدورات", "من نحن", "اتصل بنا", "تسجيل الدخول", "المكتبة"],
                        "url": [
                            "https://dareen.cloud/",
                            "https://dareen.cloud/courses",
                            "https://dareen.cloud/about",
                            "https://dareen.cloud/contact",
                            "https://dareen.cloud/login",
                            "https://dareen.cloud/books"
                        ]
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "EducationalOrganization",
                        "name": "دارين السابعة للتعليم والتدريب",
                        "url": "https://dareen.cloud/",
                        "logo": "https://dareen.cloud/logo.png",
                        "description": siteDescription,
                        "telephone": "+965XXXXXXXX",
                        "email": "info@dareen.cloud",
                        "areaServed": ["Saudi Arabia", "Kuwait", "United Arab Emirates", "Qatar", "Oman", "Bahrain"],
                        "address": {
                            "@type": "PostalAddress",
                            "addressRegion": "Kuwait",
                            "addressCountry": "KW"
                        },
                        "openingHoursSpecification": [
                            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"], "opens": "08:00", "closes": "20:00" },
                            { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday", "opens": "08:00", "closes": "16:00" }
                        ],
                        "sameAs": [
                            "https://wa.me/965XXXXXXXX",
                            "https://instagram.com/dareen.academy"
                        ],
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.9",
                            "bestRating": "5",
                            "ratingCount": "3450"
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        "name": "كيفية الاشتراك في دارين السابعة",
                        "description": "ثلاث خطوات بسيطة للبدء في رحلتك التعليمية مع دارين السابعة",
                        "step": [
                            { "@type": "HowToStep", "position": 1, "name": "اختر الخدمة", "text": "حدد النظام التعليمي المناسب لابنك أو ابنتك من بين دوراتنا المتنوعة." },
                            { "@type": "HowToStep", "position": 2, "name": "حصة مجانية", "text": "استمتع بحصة تجريبية مجانية للتعرف على أسلوب المعلمين والمنصة." },
                            { "@type": "HowToStep", "position": 3, "name": "اشترك الآن", "text": "تواصل معنا عبر الواتساب لحجز المقعد والبدء في رحلة التعلم." }
                        ]
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "Course",
                        "name": "دروس خصوصية أونلاين للمناهج الخليجية",
                        "description": "دروس خصوصية عن بعد في جميع المواد للمناهج الكويتية والسعودية والقطرية والإماراتية والعمانية مع نخبة من أفضل المعلمين.",
                        "provider": {
                            "@type": "EducationalOrganization",
                            "name": "دارين السابعة للتعليم والتدريب",
                            "url": "https://dareen.cloud/"
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "ما هي أفضل منصة تعليم أون لاين في دول الخليج (الكويت، قطر، السعودية، الامارات، عمان)؟",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "دارين السابعة هي المنصة الرائدة والأولى المتخصصة في تقديم الدروس الخصوصية الأون لاين والمتابعات الدراسية للمناهج الخليجية وتأسيس الطلاب وتحفيظ القرآن بأعلى معايير الجودة."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "هل يتوفر مدرس خصوصي للمناهج في الكويت والسعودية وقطر؟",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "نعم، نوفر نخبة من أفضل المعلمين والمدرسين الخصوصيين لتدريس المنهج الكويتي، السعودي، القطري، الإماراتي والعماني، وتجهيز الطلاب للاختبارات النهائية والقدرات."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "كم تكلفة الدروس الخصوصية الأونلاين في دارين السابعة؟",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "نقدم حصة تجريبية مجانية للتعرف على المنصة والمعلمين. بعد ذلك، لدينا باقات مرنة تناسب جميع الاحتياجات بأسعار تنافسية. يمكنكم التواصل معنا عبر الواتساب للحصول على عرض سعر مخصص."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "هل تقدمون تحفيظ قرآن عن بعد للأطفال؟",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "نعم، لدينا برنامج متكامل لتحفيظ القرآن الكريم عن بعد للأطفال والكبار مع معلمين متخصصين في التجويد والتلاوة، مع متابعة مستمرة وتقارير دورية للأهل."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "ما هي المناهج الدراسية التي تغطيها منصة دارين السابعة؟",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "نغطي المناهج الكويتية والسعودية والقطرية والإماراتية والعمانية لجميع المراحل الدراسية. نقدم تأسيساً في اللغة العربية والرياضيات والعلوم واللغة الإنجليزية والمواد الشرعية، بالإضافة إلى دورات قدرات وتحصيلي."
                                }
                            }
                        ]
                    }
                ])}
            </script>

            {/* Dynamic Breadcrumbs Schema */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": breadcrumbs.map((crumb, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "name": crumb.name,
                            "item": crumb.item.startsWith('http') ? crumb.item : `https://dareen.cloud${crumb.item}`
                        }))
                    })}
                </script>
            )}

            {/* Canonical URL */}
            <link rel="canonical" href={absUrl} />
            {noindex && <meta name="robots" content="noindex, follow" />}
        </Helmet>
    );
};
