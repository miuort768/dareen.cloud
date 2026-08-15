export const CURRICULUM_OPTIONS = [
    'المنهج السعودي',
    'المنهج المصري',
    'المنهج القطري',
    'المنهج الكويتي',
    'المنهج الإماراتي',
    'المنهج البحريني',
    'منهج سلطنة عمان',
    'منهج أمريكي',
    'منهج بريطاني',
    'أخرى',
];

const LEGACY_CURRICULUM_MAP: Record<string, string> = {
    'المنهج السوري': 'المنهج القطري',
    'المنهج الفلسطيني': 'المنهج البحريني',
    'منهج دبلوما': 'منهج سلطنة عمان',
};

export const normalizeCurriculum = (value?: string): string => {
    if (!value) return '';
    return LEGACY_CURRICULUM_MAP[value] || value;
};
