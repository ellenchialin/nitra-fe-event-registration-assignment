import * as colors from './colors.js'
import { semanticShortcuts } from './semantic.js'

export const fontSize = {
  lg: ['var(--font-size-lg)', 'var(--line-height-lg)'],
  md: ['var(--font-size-md)', 'var(--line-height-md)'],
  sm: ['var(--font-size-sm)', 'var(--line-height-sm)'],
}

export const fontWeight = {
  bold: 'var(--font-weight-bold)',
  semibold: 'var(--font-weight-semibold)',
  medium: 'var(--font-weight-medium)',
  regular: 'var(--font-weight-regular)',
}

export const lineHeight = {
  lg: 'var(--line-height-lg)',
  md: 'var(--line-height-md)',
  sm: 'var(--line-height-sm)',
}

export const letterSpacing = {
  none: '0',
}

// Radius scale from Figma's `border-radius/*`. DEFAULT and 2xl intentionally override the
// preset so a bare `rounded` matches the design's 10px controls.
export const borderRadius = {
  xs: '2px',
  m: '6px',
  DEFAULT: '10px',
  '2xl': '12px',
  full: '9999px',
}

// The stepper, step content and action bar all sit in a 1200px column (x=120 at the design's
// 1440 frame). Expressed as a max-width rather than fixed padding so it stays 1200 above 1440.
export const maxWidth = {
  content: '1200px',
}

// Loaded via @fontsource-variable/inter in src/boot/fonts.js.
export const fontFamily = {
  sans: "'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}

export const typographyShortcuts = [
  {
    'text-h1': 'text-[length:var(--font-size-h1)] line-height-[var(--line-height-h1)] font-bold',
    'text-h2': 'text-[length:var(--font-size-h2)] line-height-[var(--line-height-h2)] font-bold',
    'text-h3': 'text-[length:var(--font-size-h3)] line-height-[var(--line-height-h3)] font-bold',
    'text-h4': 'text-[length:var(--font-size-h4)] line-height-[var(--line-height-h4)] font-bold',
    'text-subtitle1':
      'text-[length:var(--font-size-subtitle1)] line-height-[var(--line-height-subtitle1)] font-semibold',
    'text-subtitle2':
      'text-[length:var(--font-size-subtitle2)] line-height-[var(--line-height-subtitle2)] font-semibold',
  },
]

export const breakpoints = {
  tablet: '768px',
  desktop: '1024px',
}

export const uiTheme = {
  colors,
  fontSize,
  fontFamily,
  fontWeight,
  lineHeight,
  letterSpacing,
  borderRadius,
  maxWidth,
  zIndex: {
    banner: '1000',
    'banner-alert': '1001',
    toast: '2000',
  },
}

export const uiExtendTheme = (theme) => ({
  ...theme,
  breakpoints: {
    ...(theme?.breakpoints ?? {}),
    ...breakpoints,
  },
})

export const uiShortcuts = [...typographyShortcuts, ...semanticShortcuts]
