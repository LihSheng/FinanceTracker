import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import commonEN from '@/public/locales/en/common.json';
import goalsEN from '@/public/locales/en/goals.json';
import portfolioEN from '@/public/locales/en/portfolio.json';
import transactionsEN from '@/public/locales/en/transactions.json';
import budgetsEN from '@/public/locales/en/budgets.json';
import alertsEN from '@/public/locales/en/alerts.json';
import notificationsEN from '@/public/locales/en/notifications.json';
import journalEN from '@/public/locales/en/journal.json';

const resources = {
  en: {
    common: commonEN,
    goals: goalsEN,
    portfolio: portfolioEN,
    transactions: transactionsEN,
    budgets: budgetsEN,
    alerts: alertsEN,
    notifications: notificationsEN,
    journal: journalEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
