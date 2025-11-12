'use client';

import { useI18nContext } from '@/contexts/I18nContext';

export function LanguageSwitcher() {
  const { locale, changeLocale } = useI18nContext();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'zh', name: '中文' },
  ];

  return (
    <select
      value={locale}
      onChange={(e) => changeLocale(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
