import { safeJsonLd } from '../../shared/utils/jsonLd'
import { MobileHeader } from '../../components/public/MobileHeader'
import { PublicFooter } from '../../components/public/PublicFooter'
import { SEO } from '../../components/SEO'
import { AboutHero } from './AboutHero'
import { AboutStory } from './AboutStory'
import { AboutValues } from './AboutValues'
import { AboutBanner } from './AboutBanner'
import { AboutCTA } from './AboutCTA'

export const About = () => {
  return (
    <div className="relative min-h-full overflow-x-hidden bg-background font-sans text-main">
      <SEO
        title="من نحن"
        description="منصة دارين السابعة للتعليم عن بعد في الكويت، السعودية، قطر، الإمارات وعمان والبحرين. نوفر دروس خصوصية أونلاين في الدوحة والريان ومسقط وصلالة والمنامة والمحرق، تحفيظ قرآن، تأسيس أطفال، ومراجعات للمناهج الخليجية والبحرينية مع أفضل المعلمين المعتمدين. احجز حصة تجريبية مجانية."
        url="https://dareen.cloud/about"
        image="/dareen_logo_new.jpg"
        breadcrumbs={[
          { name: 'الرئيسية', item: '/' },
          { name: 'من نحن', item: '/about' },
        ]}
      />
      <script type="application/ld+json">
        {safeJsonLd({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'من نحن - دارين السابعة',
          description: 'منصة دارين السابعة للتعليم عن بعد في الكويت والخليج',
          mainEntity: {
            '@type': 'EducationalOrganization',
            name: 'دارين السابعة',
            url: 'https://dareen.cloud',
          },
        })}
      </script>
      <MobileHeader />

      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutBanner />
      <AboutCTA />

      <PublicFooter />
    </div>
  )
}
