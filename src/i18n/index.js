import enUS from './en-US.js'
import zhTW from './zh-TW.js'

export const DEFAULT_LOCALE = 'en-US'

/** Locales offered in the switcher, in display order. */
export const SUPPORTED_LOCALES = Object.freeze([
  { code: 'en-US', label: 'English' },
  { code: 'zh-TW', label: '繁體中文' },
])

export default {
  'en-US': enUS,
  'zh-TW': zhTW,
}
