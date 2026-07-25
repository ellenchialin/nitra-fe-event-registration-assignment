# CLAUDE.md

Event Registration Wizard — Vue 3.5.17 + Quasar 2.18.5 + UnoCSS. Interview assignment.
Narrative rationale lives in `PLAN.md`; this file is operational rules only.

**Where the work stands: `PLAN.md` §1, phase table and progress log.** Update it when a phase
completes — status and the delivering commits, not elapsed hours. Deliberately not mirrored here;
duplicated progress goes stale on one side and then misleads.

## Commands

```bash
nvm use 22.17.0   # package.json pins this; do not develop on another major
yarn dev          # http://localhost:9001 (note: not 9000, see quasar.config.js)
yarn build
```

Run `yarn lint && yarn format` before each commit.

## Source precedence

When sources conflict: **official assignment doc > repo README > Figma mockup**.
The Figma file is internally inconsistent in places — see `PLAN.md` §3 before treating a frame as
specification.

## Hard rules

- **No hardcoded hex.** Use UnoCSS semantic shortcuts (`text-neutral`, `bg-surface-l1`,
  `border-danger-emphasis`). Full list in `src/unocss/semantic.js`. This is an explicit grading
  criterion.
- **No arbitrary radius values.** Use the theme radius scale (2 / 6 / 10 / 12 / full). Do not write
  `rounded-[10px]`.
- **All date handling is UTC.** Group, compare, and display with
  `Intl.DateTimeFormat(..., { timeZone: 'UTC' })`. Never `getDate()`/`getHours()` — mock timestamps
  are `Z` and local-time conversion shifts `ws2` across a day boundary.
- **Money is integer cents.** Format only at the display boundary via `utils/currency.js`.
- **Derived state is `computed`, never `watch`.** The single legitimate watcher is the URL step sync
  (external state); annotate it as such.
- **No user-facing string literals.** All copy goes through `vue-i18n` keys (`en`, `zh-TW`).
- **JSDoc on every exported function** — params, return, and non-obvious behaviour.
- Render all event copy from `src/mocks/event.js`. Never hardcode the event name (the design's
  "WebDev Summit 2025" / "TechConf 2025" strings are stale; data says 2028). The static
  `<title>` in `index.html` is the deliberate exception — document metadata, not rendered copy,
  and deriving it in JS would only trade duplication for a title flash. If a title ever needs to
  vary by step or locale, use Quasar's Meta plugin rather than assigning `document.title`.

## Gotchas

- **The primary CTA is orange, not brand teal.** Use `bg-accent-emphasis-rest` (`#FB7429`).
  `--q-primary` in `src/css/colors.scss` is bound to brand teal, so Quasar's `color="primary"`
  renders the wrong button.
- **Translate Figma tokens by value, never by name.** The brand ramp is shifted one step between
  the two: Figma's `bg/brand/muted/rest` is `#EEF6F7`, but the starter's `--bg-brand-muted-rest`
  is `#CBE5E6` — `#EEF6F7` lives in `bg-brand-subtle-rest`. `text/brand/default` and
  `text/brand/emphasis` disagree the same way. Copying the name out of Figma's generated CSS
  silently produces the wrong colour; look the hex up in `src/css/colors.scss` and use whichever
  token holds it.
- **Inter Variable must be loaded.** The starter ships no webfont; the design's weight tokens
  (630/610/570/485) are meaningless without it.
- The Figma variable `bg/disable` returns the string `"50"`, not a colour. Use the starter's
  `bg-disable` token.
- Capacity applies to add-ons as well as sessions (`ws2` is 25/25 and sold out), though the README
  only mentions sessions.

## Architecture

State is a `createRegistrationState()` factory provided at the wizard root under a `Symbol` key —
not a module-level singleton. Consume via `useRegistration()`.

```
src/
  composables/   useRegistration useStepper useSessions useAddons usePricing useValidation
  utils/         time.js currency.js validators.js      # pure, JSDoc'd, unit-testable
  components/    steps/ ui/
  i18n/          en.js zh-TW.js
```

Validation is one declarative rule array (`{ step, field, validate, message }`) reduced into
`errorsByStep`. Stepper badges, the error panel, danger card borders, and `— (required)`
placeholders all derive from it — never maintain those separately. Errors are gated behind
`submitAttempted`.

## Design reference

Figma file key `E60tE1WSZbpG4m8dO4qvfG` (duplicate — the original grants view access only, which the
MCP server rejects). Frame node IDs:

| Frame                          | Node       |
| ------------------------------ | ---------- |
| Step 1 — Attendee Info         | `1069:968` |
| Step 2 — Session Selection     | `1072:912` |
| Step 3 — Add-ons               | `1073:899` |
| Step 3 — Add-ons (Merchandise) | `1149:565` |
| Step 4 — Review & Submit       | `1074:897` |
| Success State                  | `1075:903` |
| Validation Error State         | `1076:904` |
| Design Token Reference         | `1077:896` |
| Shipping Address — States      | `1203:587` |

Load the `figma:figma-implement-design` skill before calling `get_design_context`.
