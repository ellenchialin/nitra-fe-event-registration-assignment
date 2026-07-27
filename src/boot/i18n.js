import { watchEffect } from 'vue'
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

  // The app's only watcher, and deliberately so: `<html lang>` is state outside Vue's graph, so a
  // computed cannot express it. Quasar's Lang plugin sets the attribute once from its own default
  // pack and never follows vue-i18n, which left the document claiming English while rendering
  // Chinese — a WCAG 3.1.1 failure, and the reason a screen reader would read zh-TW in an English
  // voice. The locale codes are already valid BCP 47 tags, so they map across directly.
  watchEffect(() => {
    document.documentElement.lang = i18n.global.locale.value
  })
}
