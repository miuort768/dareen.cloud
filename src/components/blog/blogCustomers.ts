export const BLOG_COUNTRIES = ['الكويت', 'السعودية', 'قطر', 'الإمارات', 'عمان'] as const;

export const COUNTRY_CURRICULUM: Record<string, string> = {
  'الكويت': 'منهج كويتي',
  'السعودية': 'منهج سعودي',
  'قطر': 'منهج قطري',
  'الإمارات': 'منهج إماراتي',
  'عمان': 'منهج عماني',
};

export interface BlogCustomer {
  id: string;
  country: string;
  phone: string;
  createdAt: string;
}
