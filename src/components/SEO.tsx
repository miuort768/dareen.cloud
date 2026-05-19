import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    preloadImages?: string[];
    breadcrumbs?: { name: string; item: string }[];
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = '/logo.png',
    url = 'https://dareen-edu.com/',
    preloadImages = [],
    breadcrumbs
}) => {
    const siteTitle = "دارين السابعة | دارين السابعة لتعليم والتدريب";
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
            <link rel="icon" type="image/png" href="/logo.png?v=2" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={siteDescription} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={siteDescription} />
            <meta property="twitter:image" content={image} />

            {/* Preload Critical Assets */}
            {preloadImages.map((src, idx) => (
                <link key={idx} rel="preload" href={src} as="image" />
            ))}

            {/* Geographic & Regional Domination Meta Tags */}
            <meta name="geo.region" content="SA, KW, AE, QA, BH, OM" />
            <meta name="geo.placename" content="Middle East, GCC, الرياض، جدة، الكويت، دبي، الدوحة، مسقط" />
            <meta name="geo.position" content="24.7136;46.6753" />
            <meta name="ICBM" content="24.7136, 46.6753" />

            <link rel="alternate" href="https://dareen-edu.com/" hrefLang="ar" />
            <link rel="alternate" href="https://dareen-edu.com/" hrefLang="ar-sa" />
            <link rel="alternate" href="https://dareen-edu.com/" hrefLang="ar-kw" />
            <link rel="alternate" href="https://dareen-edu.com/" hrefLang="ar-ae" />
            <link rel="alternate" href="https://dareen-edu.com/" hrefLang="x-default" />

            {/* Advanced Multi-Schema for Rich Snippets (Google Star Ratings, FAQs, and Courses) */}
            <script type="application/ld+json">
                {JSON.stringify([
                    {
                        "@context": "https://schema.org",
                        "@type": "EducationalOrganization",
                        "name": "دارين السابعة للتعليم والتدريب",
                        "url": "https://dareen-edu.com/",
                        "logo": "https://dareen-edu.com/logo.png",
                        "description": siteDescription,
                        "telephone": "+965XXXXXXXX",
                        "areaServed": ["Saudi Arabia", "Kuwait", "United Arab Emirates", "Qatar", "Oman", "Bahrain"],
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.9",
                            "bestRating": "5",
                            "ratingCount": "3450"
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
                            "item": crumb.item.startsWith('http') ? crumb.item : `https://dareen-edu.com${crumb.item}`
                        }))
                    })}
                </script>
            )}

            {/* Canonical URL */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
};
