export const BLOG_COUNTRIES = ['الكويت', 'السعودية', 'قطر', 'الإمارات', 'عمان'] as const;

export const normalizePhoneInput = (value: string): string =>
  value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());

