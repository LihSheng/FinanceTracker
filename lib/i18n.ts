import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideTranslations = async (
  locale: string,
  namespaces: string[] = ['common']
) => {
  return serverSideTranslations(locale, namespaces);
};

export const getI18nPaths = () => {
  return ['en', 'ms', 'zh'].map((locale) => ({
    params: { locale },
  }));
};
