import { defineConfig, presetWind3, presetAttributify, transformerDirectives } from 'unocss'
import { semanticColors } from './src/unocss/semantic.js'
import { uiTheme, uiShortcuts, uiExtendTheme } from './src/unocss/index.js'

function flattenToCssVars(obj, prefix = []) {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = [...prefix, key]
    if (value !== null && typeof value === 'object') {
      Object.assign(result, flattenToCssVars(value, path))
    } else if (!String(value).startsWith('var(')) {
      result[`--${path.join('-')}`] = value
    }
  }
  return result
}

export default defineConfig({
  presets: [presetWind3(), presetAttributify()],
  transformers: [transformerDirectives()],
  preflights: [
    {
      getCSS: () => {
        const cssVars = flattenToCssVars(semanticColors)
        const body = Object.entries(cssVars)
          .map(([k, v]) => `  ${k}: ${v};`)
          .join('\n')
        return `:root {\n${body}\n}\n`
      },
    },
    {
      // No CSS reset is imported, so border-style defaults to `none` and forces computed
      // border width to 0 — every semantic border-*/divider-* shortcut sets colour only and
      // would render nothing. Width 0 must accompany style solid, or unspecified sides fall
      // back to the initial `medium` width and draw unwanted borders.
      getCSS: () => '*,::before,::after{border-width:0;border-style:solid;}',
    },
  ],
  theme: uiTheme,
  extendTheme: [uiExtendTheme],
  shortcuts: [
    ...uiShortcuts,
    {
      // The 1200px column shared by the stepper, step content and action bar. Sits inside a
      // horizontally padded band, so the padding applies only once the viewport drops below
      // the column width rather than eating into it.
      'content-column': 'mx-auto w-full max-w-content',
    },
  ],
})
