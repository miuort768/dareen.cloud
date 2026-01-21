import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image = '/og-image.jpg',
    url = 'https://dareen-edu.com/'
}) => {
    const siteTitle = "معهد دارين | أكاديمية دارين لتعليم والتدريب";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const siteDescription = description || "معهد دارين وأكاديمية دارين للتعليم والتدريب - الخيار الأول للتعليم عن بعد. دروس خصوصية، لغات، تحفيظ قرآن، ومناهج دراسية مع نخبة من الخبراء.";
    const siteKeywords = keywords || "معهد دارين, أكاديمية دارين لتعليم, منصة دارين, دارين لتعليم و التدريب, التدريس اون لاين, منصة تعليمية, دروس خصوصية";

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

            {/* Canonical URL */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
};
