# PLAN.md — Development Journal

Event Registration Wizard for **WebDev Summit 2028** — Vue 3.5 + Quasar 2.18 + UnoCSS.

This is a living document, written as I go rather than reconstructed at the end. It covers how I
broke the task down, the decisions I made and why, how I collaborated with AI tooling, and what I
would do differently with more time.

---

## 1. How I planned and broke down the task

Before writing any code I did three things: read the starter repo end to end, read the two mock
datasets closely enough to find their edge cases, and pull the Figma design through the Figma MCP
server. The goal was to surface every ambiguity _before_ implementation, because the expensive
mistakes in a wizard like this are architectural (where state lives, how validation is modelled),
not cosmetic.

**Phased breakdown**, ordered so that pure logic is settled and testable before any layout work:

| Phase | Scope                                                                                     | Est. |
| ----- | ----------------------------------------------------------------------------------------- | ---- |
| 0     | Environment (Node pin), Figma access, design recon                                        | 0.5h |
| 1     | Foundation — `utils/` (time, currency, validators), `useRegistration` state, wizard shell | 1h   |
| 2     | Step 1 — ticket cards, attendee form, `FormField`                                         | 1h   |
| 3     | Step 2 — day tabs, session grid, capacity, conflict detection                             | 1h   |
| 4     | Step 3 — category tabs, workshop conflicts, size/qty, shipping banner, order summary      | 1.5h |
| 5     | Step 4 — review cards, unified validation, error navigation, submit + success             | 1h   |
| 6     | Polish — interactive states, transitions, responsive, URL sync                            | 1h   |
| 7     | i18n pass + this document                                                                 | 1h   |

Design fidelity is 20% of the rubric, so Phase 0 was deliberately front-loaded: guessing at spacing
and then correcting it later is the most expensive way to lose those points.

---

## 2. Reading the data before writing code

The two mock files contain deliberate traps. I mapped them first rather than discovering them
during implementation.

**Time conflicts.** `sessions.js` has a header comment listing four overlapping pairs. Two of them
are unreachable in practice: `s2`&`s3` and `s8`&`s9` each involve a session that is already at
capacity (`s2` 120/120, `s9` 90/90) and therefore disabled. The genuinely reachable session↔session
conflicts are **`s4`&`s5`** (Nov 15) and **`s11`&`s12`** (Nov 16) — those are the two cases worth
demonstrating. For workshops, `ws1` (Nov 16 14:00–17:00) overlaps both `s11` and `s12`, and `ws2`
(Nov 15 15:30–18:30) overlaps `s6` — but `ws2` is itself sold out (25/25), so `ws1` is the live
demo case.

Taking the comment at face value would have meant building a demo around a conflict the user can
never trigger.

**Capacity applies to add-ons too.** The README only mentions capacity checks for sessions, but
workshops carry `capacity`/`registered` as well, and `ws2` is full. The design confirms this — it
renders "Sold Out" on that card. Handled for both.

**Timezone.** Every timestamp is UTC (`Z`). In UTC+8 local time, `ws2` runs 23:30 → 02:30 _the next
day_, so naive `Date#getDate()` grouping would file it under the wrong day and could produce
false negatives in overlap comparisons near midnight. **Decision: treat all times as UTC
everywhere** — grouping, comparison, and display — via `Intl.DateTimeFormat(..., { timeZone: 'UTC' })`.

The design independently confirms this is correct: it renders `ws1` as "Nov 16, 2:00 PM – 5:00 PM",
which is exactly its stored `14:00Z–17:00Z`. Had the intent been local time, that label would shift.

**Money.** All arithmetic in integer cents, formatted only at the display boundary. Floating-point
`0.1 * 149` is the classic way to end up one cent off in a total, and the totals here are visible in
three places at once (Step 3 sidebar, Step 4 summary, success screen), so any drift is obvious.

---

## 3. Reading the design

The remote Figma MCP server rejected the original assignment file — it grants view access, and the
server requires edit rights. Duplicating the file into my own drafts made me the owner and unblocked
`get_metadata`, `get_screenshot`, and `get_variable_defs`. Worth recording because "the MCP is
broken" was the wrong diagnosis; it was a permissions issue with a 30-second fix.

The file contains 9 frames at 1440px: the four steps, a merchandise variant of Step 3, a success
state, a **validation error state**, a **design token reference**, and a **shipping-address
conditional-states** reference. The last three are effectively free specification — they answer
questions the README leaves open.

### What the design revealed that the README does not

1. **Steps 2 and 3 use tab switchers, not stacked sections.** The README says "group by date" and
   "group by category", which I had read as stacked day/category sections. The design uses a
   segmented control — `Nov 15 | Nov 16` on Step 2, `Workshops | Meal Packages | Merchandise` on
   Step 3 — showing one group at a time. Same grouping logic underneath, materially different
   component.

2. **Session cards have a capacity progress bar with threshold colours.** Not mentioned anywhere in
   the README. The bar fills to `registered / capacity` and shifts colour band as it fills — brand
   teal when quiet, warning yellow mid, accent orange when filling up, danger red at full — with the
   "N spots left" caption colour tracking it and switching to "Sold Out" at capacity. This is real
   derived business logic that a README-only reading would have missed entirely.

3. **The order summary sidebar appears on Step 3 only.** Steps 1, 2 and 4 have no sidebar; Step 4
   carries its own full-width "Pricing Summary" card instead.

4. **The VIP discount is a single line item, not per-item.** Step 3 shows `VIP Ticket $599.00` +
   `Hands-on Vue.js Testing $149.00` + `Workshop discount (VIP 10%) -$14.90` = `$733.10`. The
   discount line only renders when at least one workshop is selected (the merchandise variant has no
   discount row). This confirmed the pricing model I had planned.

5. **Error presentation is fully specified.** The errored step's stepper node turns into a red `!`
   circle with a red label; a danger-tinted panel lists errors prefixed by step (`Step 1: Phone
number is required`); the offending review card gets a danger border and its missing values
   render as `— (required)` in danger text; and the submit button sits in a disabled state.

6. **Shipping address has three distinct states**, given their own reference frame: optional
   (`Shipping Address (Optional)`, neutral border) → required-but-untouched (`Shipping Address *`,
   emphasised border) → required-and-empty (red label, red border, helper text). This is a clean
   way to reconcile the design with the README's "no inline validation on Step 1": the label and
   border react live to merchandise selection, but the _error_ styling only appears after a submit
   attempt.

### Design ↔ spec conflicts, and how I resolved them

The assignment states the official doc wins over the repo README, and both outrank a mockup. Where
the design and the written spec disagree I followed the spec and recorded the divergence:

- **Event name.** Every frame reads "WebDev Summit 2025"; the success copy says "TechConf 2025".
  The mock data and the official doc both say **WebDev Summit 2028**. The design is stale — all
  copy renders from `event.js` rather than being hardcoded, which makes the point moot.
- **Conflicting sessions shown as disabled.** In the Step 2 frame, `s5` is greyed out while `s4`
  (which it overlaps) is selected — but `s3`, which overlaps the selected `s2`, is left fully
  interactive. The frame is internally inconsistent, and the README is explicit that users "may
  freely select any available sessions" with conflict validation "deferred to Step 4". I follow the
  README: conflicts never block selection, they surface at submit. I still need the greyed
  treatment, since that is the disabled style for at-capacity sessions.
- **Sold-out card rendered as selected.** The same frame shows `s2` sold out _and_ checked. Treated
  as a mockup artefact; at-capacity sessions are disabled and unselectable.

### Token gaps found

The Figma variables mostly map cleanly onto `src/unocss/semantic.js`, with three gaps:

- **The primary CTA is orange, not brand teal.** `components/button/primary/bg/emphasis/rest` is
  `#FB7429`, which is `orange[400]` → `bg-accent-emphasis-rest`. Worth noting because `--q-primary`
  in `colors.scss` is bound to brand teal, so reaching for Quasar's `color="primary"` on the CTA
  would produce the wrong button.
- **Border radii are not in the UnoCSS theme.** Figma defines `xs:2 / m:6 / default:10 / 2xl:12 /
Full:9999`; the starter's `uiTheme` defines colours and typography but no radius scale. I will
  extend the theme with these rather than scatter `rounded-[10px]` arbitrary values.
- **The design is set in Inter**, at variable weights (630/610/570/485 — matching the starter's
  `fontWeight` tokens exactly). The starter loads no webfont at all, so without adding Inter
  Variable the whole thing renders in a fallback and every weight token is a lie.

`bg/disable` comes back as the string `"50"` rather than a colour — a broken variable in the source
file. I use `bg-disable` from the starter tokens instead.

---

## 4. Key decisions

**Cross-step state: factory + `provide`/`inject`, not a module singleton.** A module-scoped
`reactive()` is the quickest path but makes state global and awkward to reset or test in isolation.
A `createRegistrationState()` factory provided at the wizard root with a `Symbol` injection key
keeps ownership explicit, allows a clean reset after submission, and satisfies the rubric's
"composable or provide/inject" from both directions.

**Derived state is `computed`, never watched.** Conflicts, availability, totals, capacity bands and
the error map are all pure functions of `(mock data, selections)`. The only `watch` in the codebase
is the URL sync, where the target is genuinely external state — a case where a watcher is correct
rather than lazy. I annotate that one so the distinction is visible.

**Validation as a declarative rule set.** An array of `{ step, field, validate, message }` rather
than imperative checks scattered across components. `errorsByStep` becomes one `computed` reduction,
which is what makes the stepper badges, the error panel, the per-card danger borders and the
`— (required)` placeholders all fall out of a single source of truth instead of being maintained in
four places.

Errors are gated behind a `submitAttempted` flag so Step 1 stays inline-error-free as specified,
then correct live once the user has submitted once — matching the disabled-submit state in the
error frame.

**Retroactive workshop conflicts.** A user can select `ws1` on Step 3, navigate back to Step 2, and
add `s11` — which now conflicts with an already-selected workshop. Silently de-selecting the
workshop destroys user input without explanation. I keep the selection, flag the card inline, and
count it toward Step 3's error badge. Same principle as the README's own choice to defer session
conflicts rather than block them.

**Rounding.** The VIP discount is 10% of the workshop subtotal computed once on the summed total,
not per line item, so the itemised breakdown always reconciles against the grand total.

---

## 5. Dependencies

The starter ships Vue, Quasar, vue-router and UnoCSS. My default position was to add nothing and
justify each exception.

| Dependency                   | Verdict        | Reasoning                                                                                                                                                                                                                                                               |
| ---------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vue-i18n`                   | **Added**      | i18n is a listed nice-to-have. It only stays cheap if strings are keyed from the first commit; retrofitting an extraction pass across 15 components is where this turns into hours. Also routes date/currency formatting through one locale-aware layer instead of two. |
| Inter Variable (self-hosted) | **Added**      | The design is set in Inter at variable weights and the starter loads no font. Self-hosted rather than a Google Fonts CDN link so a clean checkout works offline and there is no render-blocking third-party request.                                                    |
| `date-fns` / `dayjs`         | **Rejected**   | `Intl.DateTimeFormat` with `timeZone: 'UTC'` covers every formatting case here, and overlap detection is a two-line numeric comparison on epoch millis. A date library would add weight to avoid roughly 20 lines of standard-library code.                             |
| `lodash-es`                  | **Rejected**   | Grouping is a four-line `reduce`. Not worth a dependency.                                                                                                                                                                                                               |
| Pinia                        | **Rejected**   | The rubric explicitly asks for composable or `provide`/`inject` state. A store library would sidestep the thing being assessed, for a single-screen wizard that never needs cross-route persistence.                                                                    |
| `vitest`                     | **Considered** | Test coverage is explicitly not evaluated. If time allows I would add a small suite over `rangesOverlap` and the pricing reducer — the two functions where an off-by-one is both plausible and invisible in the UI.                                                     |

---

## 6. Working with AI tools

I used Claude Code (Opus) as the primary tool, driving it through the Figma MCP server for design
context. Rather than list prompts, the useful record is where it helped and where it needed
correcting.

**What worked well**

- _Data reconnaissance._ Asking it to verify the overlap comment in `sessions.js` against the actual
  timestamps — instead of trusting the comment — surfaced that half the documented conflict pairs
  are unreachable because the sessions are at capacity. That reframed which cases were worth
  building a demo around.
- _Design recon at volume._ Pulling 9 frames plus the variable definitions and cross-checking them
  against `semantic.js` found the orange-CTA mismatch, the missing radius scale, and the missing
  webfont in one pass. Reading the token-reference frame by eye would have taken far longer and
  probably missed the `--q-primary` trap.
- _Naming the timezone risk before it bit._ The UTC-vs-local boundary problem with `ws2` was flagged
  during planning rather than discovered as a mysterious grouping bug at 11pm.

**Where it fell short, and what I did about it**

- _It defaulted to the conventional answer on URL sync._ Asked whether to sync the wizard step to the
  URL, it initially said no — reasonable-sounding, and wrong. When I pushed for the senior-engineer
  reasoning it reconsidered and identified the actual stake: on a single route, the browser Back
  button silently discards the entire form. It also caught the failure mode most implementations
  hit, where `router.replace` produces a correct-looking URL and a Back button that still exits the
  app. The reversal only happened because I asked it to justify the recommendation rather than
  accepting the first answer.
- _It over-trusted the mockup as specification._ Early reads treated the Step 2 frame as
  authoritative, which would have meant blocking conflicting sessions — directly contrary to the
  README. The frame is internally inconsistent (one conflicting session greyed, another not; a
  sold-out card rendered as selected). Resolving design-vs-spec conflicts needed the documented
  precedence order applied by hand; the model had no way to know which artefact wins.
- _It initially proposed stacked day/category sections_ for Steps 2 and 3, reading only the README's
  "group by". The design says tabs. A plan built from written specs alone would have produced the
  wrong components for two of the four steps — the argument for doing design recon before
  implementation rather than after.

The general pattern: it is strong at exhaustive cross-referencing across many files, and weak at
knowing which of two conflicting sources is authoritative. The second is where the review effort
belongs.

---

## 7. Challenges

- **Figma MCP access.** Diagnosed as a permissions issue rather than a broken server; duplicating
  the file to my own drafts resolved it.
- **Conflicting sources of truth.** Official doc > README > mockup, applied consistently and
  documented above.
- **A mockup that is not internally consistent.** Required deciding which parts are specification
  (states, tokens, layout) and which are illustrative filler (which specific card is greyed out).

---

## 8. What I would improve with more time

- **Persist state to `sessionStorage`.** It pairs naturally with URL sync — a hard refresh on
  `?step=3` currently clamps back to Step 1. I left it out deliberately: it drags in rehydration and
  schema-versioning concerns for a case (refresh mid-registration) that is unlikely to be exercised,
  and a half-working persistence layer is worse than none.
- **Unit tests** over `rangesOverlap`, the capacity-band thresholds, and the pricing reducer.
- **Virtualise the session grid** if the dataset grew — irrelevant at 12 sessions, relevant at 200.
- **Fuller a11y pass** — the cards are checkbox/radio groups and want proper roving focus and
  `aria-describedby` wiring to their error messages, beyond the keyboard and contrast basics.
- **Confirm the capacity threshold values with the designer.** I derived the colour bands by reading
  fill percentages off the mockup; the exact cut-points are inferred, not specified.
