export interface Country {
  code: string;   // ISO 3166-1 alpha-2
  name: string;
  phonePrefix: string;
  flag: string;
  currency: string;
  defaultLanguage: string;
}

export const countries: Country[] = [
  { code: 'BF', name: 'Burkina Faso', phonePrefix: '+226', flag: '🇧🇫', currency: 'XOF', defaultLanguage: 'fr' },
  { code: 'CI', name: "Côte d'Ivoire", phonePrefix: '+225', flag: '🇨🇮', currency: 'XOF', defaultLanguage: 'fr' },
  { code: 'SN', name: 'Sénégal', phonePrefix: '+221', flag: '🇸🇳', currency: 'XOF', defaultLanguage: 'fr' },
  { code: 'ML', name: 'Mali', phonePrefix: '+223', flag: '🇲🇱', currency: 'XOF', defaultLanguage: 'fr' },
  { code: 'NE', name: 'Niger', phonePrefix: '+227', flag: '🇳🇪', currency: 'XOF', defaultLanguage: 'fr' },
  { code: 'TG', name: 'Togo', phonePrefix: '+228', flag: '🇹🇬', currency: 'XOF', defaultLanguage: 'fr' },
  { code: 'BJ', name: 'Bénin', phonePrefix: '+229', flag: '🇧🇯', currency: 'XOF', defaultLanguage: 'fr' },
  { code: 'GH', name: 'Ghana', phonePrefix: '+233', flag: '🇬🇭', currency: 'GHS', defaultLanguage: 'en' },
  { code: 'NG', name: 'Nigeria', phonePrefix: '+234', flag: '🇳🇬', currency: 'NGN', defaultLanguage: 'en' },
  { code: 'KE', name: 'Kenya', phonePrefix: '+254', flag: '🇰🇪', currency: 'KES', defaultLanguage: 'en' },
  { code: 'ZA', name: 'South Africa', phonePrefix: '+27', flag: '🇿🇦', currency: 'ZAR', defaultLanguage: 'en' },
  { code: 'FR', name: 'France', phonePrefix: '+33', flag: '🇫🇷', currency: 'EUR', defaultLanguage: 'fr' },
  { code: 'US', name: 'United States', phonePrefix: '+1', flag: '🇺🇸', currency: 'USD', defaultLanguage: 'en' },
  { code: 'GB', name: 'United Kingdom', phonePrefix: '+44', flag: '🇬🇧', currency: 'GBP', defaultLanguage: 'en' },
  { code: 'AE', name: 'UAE', phonePrefix: '+971', flag: '🇦🇪', currency: 'AED', defaultLanguage: 'en' },
];

export const defaultCountry = countries[0]; // Burkina Faso