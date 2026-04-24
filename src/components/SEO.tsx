import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    preloadImages?: string[];
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = '/og-image.jpg',
    url = 'https://dareen-edu.com/',
    preloadImages = []
}) => {
    const siteTitle = "معهد دارين | أكاديمية دارين لتعليم والتدريب";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const siteDescription = description || "أكاديمية دارين - المنصة الأولى للتعليم عن بعد في الخليج. دروس خصوصية، مراجعات نهائية، تحفيظ قرآن، وتأسيس لغات. نغطي المنهج السعودي، الكويتي، والإماراتي مع نخبة من الأساتذة المبدعين.";
    const siteKeywords = keywords || "تعليم عن بعد، حصص أون لاين، دروس خصوصية، قدرات وتحصيلي، المنهج السعودي، المنهج الكويتي، مدرس خصوصي الرياض، مدرس خصوصي الكويت، مدرس خصوصي دبي، تأسيس لغة عربية، تحفيظ قرآن عن بعد، منصة دارين التعليمية، دروس تقوية الخليج، تدريس مناهج انترناشونال";

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
                        "name": "أكاديمية دارين للتعليم والتدريب",
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
                                "name": "ما هي أفضل منصة تعليم أون لاين في دول الخليج؟",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "أكاديمية دارين هي المنصة الرائدة والمتخصصة في تقديم الدروس الخصوصية الأون لاين والمتابعات الدراسية للمناهج الخليجية والإنترناشونال بأعلى معايير الجودة."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "هل تقدمون دروساً لاختبارات القدرات والتحصيلي؟",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "نعم، نقدم دورات متخصصة ومكثفة لاختبارات القدرات والتحصيلي في السعودية، واختبارات القبول الجامعي في الكويت."
                                }
                            }
                        ]
                    }
                ])}
            </script>

            {/* Canonical URL */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
};
