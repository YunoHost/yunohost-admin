// When adding a new locale, check in date-fns (time/date i18n) if this locale
// is available or if an appropriate fallback is available.
// date-fns locales can be found here : https://github.com/date-fns/date-fns/tree/master/src/locale
// If a new locale or a new date-fns locale is added, add it to the supported
// locales list in `app/vue.config.js`

const supportedLocales = {
  ar: {
    name: 'عربي',
  },
  bn_BD: {
    name: 'বাংলা',
    dateFnsLocale: 'bn',
  },
  br: {
    name: 'Brezhoneg',
    dateFnsLocale: 'fr',
  },
  ca: {
    name: 'Català',
  },
  ckb: {
    name: 'کوردی',
    dateFnsLocale: 'fa-IR',
    // FIXME fallback to Farsi (`fa-IR`) is arbitrary, some would probably prefer Arabic (`ar`)...
  },
  cs: {
    name: 'Čeština',
  },
  da: {
    name: 'Dansk',
  },
  de: {
    name: 'Deutsch',
  },
  el: {
    name: 'Eλληνικά',
  },
  en: {
    name: 'English',
    dateFnsLocale: 'en-GB',
  },
  eo: {
    name: 'Esperanto',
  },
  es: {
    name: 'Español',
  },
  eu: {
    name: 'Euskara',
  },
  fa: {
    name: 'فارسی',
    dateFnsLocale: 'fa-IR',
  },
  fi: {
    name: 'Suomi',
  },
  fr: {
    name: 'Français',
  },
  gl: {
    name: 'Galego',
  },
  he: {
    name: 'עברית',
  },
  hi: {
    name: 'हिन्दी',
  },
  hu: {
    name: 'Magyar',
  },
  id: {
    name: 'Bahasa Indonesia',
  },
  it: {
    name: 'Italiano',
  },
  kab: {
    name: 'Taqbaylit',
    dateFnsLocale: 'ar-DZ',
  },
  lt: {
    name: 'Lietuvių',
  },
  mk: {
    name: 'македонски',
  },
  nb_NO: {
    name: 'Norsk bokmål',
    dateFnsLocale: 'nb',
  },
  ne: {
    name: 'नेपाली',
    dateFnsLocale: 'en-GB',
  },
  nl: {
    name: 'Nederlands',
  },
  oc: {
    name: 'Occitan',
    dateFnsLocale: 'ca',
  },
  pl: {
    name: 'Polski',
  },
  pt: {
    name: 'Português',
  },
  pt_BR: {
    name: 'Português brasileiro',
    dateFnsLocale: 'pt-BR',
  },
  ru: {
    name: 'Русский',
  },
  sk: {
    name: 'Slovak',
  },
  sl: {
    name: 'Slovenščina',
  },
  sv: {
    name: 'Svenska',
  },
  te: {
    name: 'Telugu',
  },
  tr: {
    name: 'Türkçe',
  },
  uk: {
    name: 'Українська',
  },
  zh_Hans: {
    name: '简化字',
    dateFnsLocale: 'zh-CN',
  },
} as const

type SL = typeof supportedLocales
export type SupportedLocales = keyof SL
export type SupportedDateFnsLocales = keyof {
  [k in SupportedLocales as SL[k] extends { dateFnsLocale: string }
    ? SL[k]['dateFnsLocale']
    : k]: never
}

export function isSupportedLocale(locale: string): locale is SupportedLocales {
  return Object.keys(supportedLocales).includes(locale)
}

export default supportedLocales as Record<
  SupportedLocales,
  { name: string; dateFnsLocale?: SupportedDateFnsLocales }
>
