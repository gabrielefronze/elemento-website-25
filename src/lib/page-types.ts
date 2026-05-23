export interface PageEntry {
  stem: string;
  legacyPath: string;
  group: string;
  slug: string;
  title: string;
  description: string;
  robots: string;
  ogType: string;
  extraCss: string[];
  extraScripts: string[];
  type: 'legacy' | 'solution';
  locales: ('en' | 'it' | 'fr')[];
}
