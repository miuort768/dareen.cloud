export const BLOG_COUNTRIES = ['الكويت', 'السعودية', 'قطر', 'الإمارات', 'عمان', 'الأردن'] as const;

export const COUNTRY_CURRICULUM: Record<string, string> = {
  'الكويت': 'منهج كويتي',
  'السعودية': 'منهج سعودي',
  'قطر': 'منهج قطري',
  'الإمارات': 'منهج إماراتي',
  'عمان': 'منهج عماني',
  'الأردن': 'منهج أردني',
};

export interface BlogCustomer {
  id: string;
  country: string;
  phone: string;
  createdAt: string;
}

export const normalizePhoneInput = (value: string): string =>
  value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

