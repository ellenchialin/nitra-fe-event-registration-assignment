import { createI18n } from 'vue-i18n'
import messages, { DEFAULT_LOCALE } from '../i18n/index.js'

export default ({ app }) => {
  const i18n = createI18n({
    legacy: false,
    locale: DEFAULT_LOCALE,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
  })

  app.use(i18n)
}
