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

            {/* Geographic Targeting for Gulf */}
            <meta name="geo.region" content="SA, KW, AE, QA, BH, OM" />
            <meta name="geo.placename" content="Middle East, Riyadh, Kuwait City, Dubai" />

            {/* Structured Data for Google (Schema.org) */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "EducationalOrganization",
                    "name": "أكاديمية دارين للتعليم والتدريب",
                    "url": "https://dareen-edu.com/",
                    "logo": "https://dareen-edu.com/logo.png",
                    "description": siteDescription,
                    "address": {
                        "@type": "PostalAddress",
                        "addressRegion": "GCC",
                        "addressCountry": "SA"
                    },
                    "sameAs": [
                        "https://www.facebook.com/dareen.edu",
                        "https://www.instagram.com/dareen.edu"
                    ],
                    "offers": {
                        "@type": "Offer",
                        "category": "Online Education",
                        "areaServed": ["SA", "KW", "AE", "QA", "OM", "BH"]
                    }
                })}
            </script>

            {/* Canonical URL */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
};
