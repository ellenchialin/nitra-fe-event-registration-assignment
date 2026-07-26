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
      // Sits inside a horizontally padded band so the gutter applies only below 1200px.
      'content-column': 'mx-auto w-full max-w-content',

      // Card edge and elevation in one declaration, since box-shadow does not stack across
      // utilities. The edge is an inset shadow rather than a border because Figma strokes sit
      // inside the frame: a bordered card measures 2px taller than the design and grows again
      // when selection thickens the stroke. Inset costs no space, so session cards hold the
      // design's 162px in every state.
      'card-edge':
        'shadow-[inset_0_0_0_1px_var(--border-neutral-muted),0px_4px_16px_0px_rgba(0,0,0,0.08),0px_1px_3px_0px_rgba(0,0,0,0.04)]',
      'card-edge-selected':
        'shadow-[inset_0_0_0_2px_var(--border-brand-emphasis),0px_4px_16px_0px_rgba(0,0,0,0.08),0px_1px_3px_0px_rgba(0,0,0,0.04)]',
    },
  ],
})
