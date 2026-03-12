const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  tr: () => import('@/dictionaries/tr.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'en' | 'tr') => {
  return dictionaries[locale] ? dictionaries[locale]() : dictionaries.tr();
};
