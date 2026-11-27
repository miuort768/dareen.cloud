export type CountryCode = 'kw' | 'qa' | 'om' | 'sa' | 'ae' | 'jo' | 'bh'

export interface CountryConfig {
  code: CountryCode
  slug: string
  aliases: string[]
  nameAr: string
  demonymAr: string
  flag: string
  seoTitle: string
  seoDescription: string
  heroSubtitle: string
  curriculumNote: string
}

export const HOME_COUNTRIES: CountryConfig[] = [
  {
    code: 'kw',
    slug: 'kw',
    aliases: ['kuwait'],
    nameAr: 'الكويت',
    demonymAr: 'الكويتي',
    flag: '🇰🇼',
    seoTitle: 'منصة تعليم عن بعد في الكويت | دروس خصوصية وتأسيس للمنهج الكويتي',
    seoDescription:
      'تعليم عن بعد في الكويت للمنهج الكويتي. دروس خصوصية أونلاين، تأسيس، متابعة يومية، وتحفيظ قرآن مع نخبة المعلمين. احجز حصتك التجريبية المجانية الآن.',
    heroSubtitle: 'المنهج الكويتي • حصص مباشرة 1:1',
    curriculumNote: 'تأسيس ومتابعة شاملة للمنهج الكويتي في جميع المراحل الدراسية',
  },
  {
    code: 'qa',
    slug: 'qa',
    aliases: ['qatar'],
    nameAr: 'قطر',
    demonymAr: 'القطري',
    flag: '🇶🇦',
    seoTitle: 'منصة تعليم عن بعد في قطر | دروس خصوصية وتأسيس للمنهج القطري',
    seoDescription:
      'تعليم عن بعد في قطر للمنهج القطري. دروس خصوصية أونلاين، تأسيس، متابعة يومية، وتحفيظ قرآن مع نخبة المعلمين. احجز حصتك التجريبية المجانية الآن.',
    heroSubtitle: 'المنهج القطري • حصص مباشرة 1:1',
    curriculumNote: 'تأسيس ومتابعة شاملة للمنهج القطري في جميع المراحل الدراسية',
  },
  {
    code: 'om',
    slug: 'om',
    aliases: ['oman'],
    nameAr: 'عمان',
    demonymAr: 'العماني',
    flag: '🇴🇲',
    seoTitle: 'منصة تعليم عن بعد في عمان | دروس خصوصية وتأسيس للمنهج العماني',
    seoDescription:
      'تعليم عن بعد في سلطنة عمان للمنهج العماني. دروس خصوصية أونلاين، تأسيس، متابعة يومية، وتحفيظ قرآن مع نخبة المعلمين. احجز حصتك التجريبية المجانية الآن.',
    heroSubtitle: 'المنهج العماني • حصص مباشرة 1:1',
    curriculumNote: 'تأسيس ومتابعة شاملة للمنهج العماني في جميع المراحل الدراسية',
  },
  {
    code: 'sa',
    slug: 'sa',
    aliases: ['saudi'],
    nameAr: 'السعودية',
    demonymAr: 'السعودي',
    flag: '🇸🇦',
    seoTitle: 'منصة تعليم عن بعد في السعودية | دروس خصوصية وتأسيس للمنهج السعودي',
    seoDescription:
      'تعليم عن بعد في السعودية للمنهج السعودي. دروس خصوصية أونلاين، تأسيس، متابعة يومية، وتحفيظ قرآن مع نخبة المعلمين. احجز حصتك التجريبية المجانية الآن.',
    heroSubtitle: 'المنهج السعودي • حصص مباشرة 1:1',
    curriculumNote: 'تأسيس ومتابعة شاملة للمنهج السعودي في جميع المراحل الدراسية',
  },
  {
    code: 'ae',
    slug: 'ae',
    aliases: ['uae'],
    nameAr: 'الإمارات',
    demonymAr: 'الإماراتي',
    flag: '🇦🇪',
    seoTitle: 'منصة تعليم عن بعد في الإمارات | دروس خصوصية وتأسيس للمنهج الإماراتي',
    seoDescription:
      'تعليم عن بعد في الإمارات للمنهج الإماراتي. دروس خصوصية أونلاين، تأسيس، متابعة يومية، وتحفيظ قرآن مع نخبة المعلمين. احجز حصتك التجريبية المجانية الآن.',
    heroSubtitle: 'المنهج الإماراتي • حصص مباشرة 1:1',
    curriculumNote: 'تأسيس ومتابعة شاملة للمنهج الإماراتي في جميع المراحل الدراسية',
  },
  {
    code: 'jo',
    slug: 'jo',
    aliases: ['jordan'],
    nameAr: 'الأردن',
    demonymAr: 'الأردني',
    flag: '🇯🇴',
    seoTitle: 'منصة تعليم عن بعد في الأردن | دروس خصوصية وتأسيس للمنهج الأردني',
    seoDescription:
      'تعليم عن بعد في الأردن للمنهج الأردني. دروس خصوصية أونلاين، تأسيس، متابعة يومية، وتحفيظ قرآن مع نخبة المعلمين. احجز حصتك التجريبية المجانية الآن.',
    heroSubtitle: 'المنهج الأردني • حصص مباشرة 1:1',
    curriculumNote: 'تأسيس ومتابعة شاملة للمنهج الأردني في جميع المراحل الدراسية',
  },
  {
    code: 'bh',
    slug: 'bh',
    aliases: ['bahrain'],
    nameAr: 'البحرين',
    demonymAr: 'البحريني',
    flag: '🇧🇭',
    seoTitle: 'منصة تعليم عن بعد في البحرين | دروس خصوصية وتأسيس للمنهج البحريني',
    seoDescription:
      'تعليم عن بعد في البحرين للمنهج البحريني. دروس خصوصية أونلاين، تأسيس، متابعة يومية، وتحفيظ قرآن مع نخبة المعلمين. احجز حصتك التجريبية المجانية الآن.',
    heroSubtitle: 'المنهج البحريني • حصص مباشرة 1:1',
    curriculumNote: 'تأسيس ومتابعة شاملة للمنهج البحريني في جميع المراحل الدراسية',
  },
]

export const getCountryConfig = (code?: CountryCode): CountryConfig | undefined =>
  code ? HOME_COUNTRIES.find((c) => c.code === code) : undefined
