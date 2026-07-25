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

| Phase | Scope                                                                                | Est. | Status        |
| ----- | ------------------------------------------------------------------------------------ | ---- | ------------- |
| 0     | Environment (Node pin), Figma access, design recon                                   | 0.5h | ✅ Done       |
| 1     | Foundation — `utils/` (time, currency, validators), `useRegistration` state          | 1h   | ✅ Done       |
| 2     | Wizard shell + stepper, Step 1 — ticket cards, attendee form, `FormField`            | 1.5h | ◐ In progress |
| 3     | Step 2 — day tabs, session grid, capacity bars, conflict detection                   | 1h   | ▢ Not started |
| 4     | Step 3 — category tabs, workshop conflicts, size/qty, shipping banner, order summary | 1.5h | ▢ Not started |
| 5     | Step 4 — review cards, unified validation, error navigation, submit + success        | 1h   | ▢ Not started |
| 6     | Polish — interactive states, transitions, responsive, URL sync                       | 1h   | ▢ Not started |
| 7     | i18n pass + this document                                                            | 1h   | ▢ Not started |
| 8     | Acceptance pass — scenarios below, clean-checkout smoke test                         | 0.5h | ▢ Not started |

Design fidelity is 20% of the rubric, so Phase 0 was deliberately front-loaded: guessing at spacing
and then correcting it later is the most expensive way to lose those points.

Progress is tracked as status here rather than as elapsed hours, and the log below cites the commits
that delivered each phase — verifiable against `git log`, where a self-reported duration would not
be.

### Progress log

**Phase 0 — Environment and design recon** ✅ `8a74e7e` `b2f4405`

Pinned Node to 22.17.0 via `.nvmrc` to match the `engines` field. Unblocked the Figma MCP by
duplicating the file (see §3) and pulled all 9 frames, the variable definitions, and layout
metadata. The recon changed the plan materially — see §3 for the tab switchers, capacity bars, and
token gaps it surfaced, none of which are in the README.

**Phase 1 — Foundation** ✅ `bb03803` `46576f7` `69d772b` `28b7f47` `b394e27`

Added ESLint + Prettier with JSDoc scoped to `src/utils` and `src/composables`; the rule was
probe-tested rather than assumed active, since a silently inert lint rule is worse than none.
Closed the two design-system gaps (radius scale, self-hosted Inter). Built the pure utilities and
the shared state factory.

Every claim in §2 was verified by executing the utilities against the real mock data rather than by
inspection: the reachable-conflict set, the back-to-back and undated-add-on non-conflicts, and the
formatted output matching the design's own rendered strings (`9:00 AM – 10:00 AM`,
`Nov 16, 2:00 PM – 5:00 PM`, `$733.10`, `-$14.90`, `$670.00`).

_Scope change:_ the wizard shell was planned for Phase 1 but moved into Phase 2. The shell hosts the
stepper, the stepper needs per-step error badges, and those derive from `useValidation` — building
a stub first would have meant rewriting it a phase later. Phase 2's estimate absorbs the move.

_Bug caught by verifying early:_ booting the dev server before writing any UI surfaced that the app
was unreadable in dark mode. Nothing in the stack set a page background — Quasar applies
`body--light` but no background colour, and the UnoCSS reset does not add one — so on a machine
preferring dark, black text rendered on the user agent's dark canvas. Fixed by setting the body
background and colour from tokens and declaring `color-scheme: light`, since the design has no dark
variant and the token set defines light values only; the declaration also stops the browser
dark-styling native inputs and scrollbars, which matters for a form-heavy UI. This would have been
invisible to anyone developing in light mode and immediately obvious to a reviewer who is not.

**Phase 2 — Shell and Step 1** ◐ in progress

The app header is built and measured against frame `1069:969`: height 73 (72 plus the 1px
divider), logo at (48, 16) 40×40 on `bg-brand-emphasis-rest`, emblem 28×14.02 at (54, 28.99), title
at (100, 24) in `heading/h4`. The "N" emblem is inlined as a component filled with `currentColor`
rather than imported as an asset, so it takes colour from context and costs no extra request.

The header renders `event.name` from the mock data rather than the design's literal string, which
resolves the 2025/2028 conflict without a judgement call at the call site.

_Two latent bugs in the starter, both found by measuring rather than looking._ The design's 8px logo
radius is a literal in Figma too — `border-radius/*` defines 2/6/10/12/full with no 8 — so it stays
exact rather than snapped to a token that would visibly change the mark.

1. **No border would ever have rendered.** UnoCSS ships no Tailwind-style reset and the project
   imports none, so `border-style` sits at its default of `none`, which forces computed border
   width to 0 regardless of what `border-b` specifies. Every semantic `border-*` and `divider-*`
   shortcut sets only a colour, so all of them were inert — while the generated CSS looked
   perfectly correct, which is why reading the diff would never have caught it.

   My first fix was wrong in an instructive way: prepending `border-solid` to the shortcuts set the
   style on all four sides, and sides without an explicit width fall back to the initial `medium`,
   so the header grew 1.5px borders on three sides it never asked for. The correct fix is the one
   Tailwind's reset uses — pair `border-width: 0` with `border-style: solid` in a preflight, so a
   border stays invisible until a width utility opts in. The `*` selector carries zero specificity,
   so it supplies a default without overriding any Quasar component styling.

2. **Stray typographic margins.** Quasar's base stylesheet gives `p` a `margin: 0 0 16px`, and with
   no reset every heading and paragraph inherits margins the design does not have — it is built
   entirely from auto-layout with explicit gaps. This alone put the header at 74.5px instead of 73.

Both would have been near-invisible individually and compounding across every subsequent component.

---

## 1a. How this is verified

"Ensure core functionality is working" is the assignment's first requirement, so verification is
part of each phase rather than a pass at the end. Every phase closes by driving the running app in
a browser — not by reading the diff and assuming — and comparing it side by side against the
corresponding Figma frame. Bugs found one phase later are cheap; bugs found in Phase 8 are not.

Test coverage is explicitly not evaluated, so this is a manual acceptance list rather than a suite.
The scenarios are drawn from the actual mock data, using the reachable cases identified in §2 —
testing `s2`&`s3` would prove nothing, since `s2` can never be selected.

**Navigation and persistence**

- N1 — Walk 1 → 2 → 3 → 4, then back to 1. Every field, ticket, session and add-on survives.
- N2 — Jump between steps via the stepper, not just the footer buttons.
- N3 — Browser Back moves a step rather than leaving the app (once URL sync lands, Phase 6).

**Data rendering**

- D1 — Sessions group into Nov 15 / Nov 16, six per day, in schedule order.
- D2 — `s2` (120/120) and `s9` (90/90) render sold out and cannot be selected.
- D3 — `ws2` (25/25) renders sold out — capacity applies to add-ons, which the README omits.
- D4 — Capacity bars land in the right colour band; `s6` (41%) and `s5` (58%) differ visibly.
- D5 — Times render in UTC: `s1` as `9:00 AM – 10:00 AM`, `ws1` as `Nov 16, 2:00 PM – 5:00 PM`.

**Conflict detection**

- C1 — `s4` + `s5` selected → conflict surfaces at submit, not before.
- C2 — `s11` + `s12` selected → same.
- C3 — `ws1` selected, then `s11` added on Step 2 → the retroactive conflict is flagged on Step 3
  and the workshop is _not_ silently de-selected.
- C4 — Back-to-back sessions (`s1` 09:00–10:00 with a 10:00 start) are never flagged.

**Pricing**

- P1 — VIP + `ws1` → `$599.00`, `$149.00`, `-$14.90`, total `$733.10` (the design's own figures).
- P2 — VIP + t-shirt ×1 + stickers ×3 → `$670.00`, with no discount row rendered.
- P3 — Switching VIP → General removes the discount line live.
- P4 — Quantity clamps at `maxQuantity` (t-shirt 3, sleeve 1) and the summary tracks it.

**Validation**

- V1 — Submit with empty required fields → panel lists them prefixed `Step 1:`, the stepper node
  turns into a red `!`, and clicking it lands on Step 1.
- V2 — Merchandise selected + empty shipping address → required, with the three-state field
  behaviour from the design.
- V3 — Sized merchandise with no size chosen → blocked.
- V4 — Invalid email and phone formats → blocked; `+1 (555) 123-4567` accepted.
- V5 — No inline errors on Step 1 _before_ a submit attempt; live correction after one.

**Submission and polish**

- S1 — Valid submit → loading state, disabled button, then the success screen with a code.
- S2 — "Back to Home" resets to a blank Step 1.
- S3 — Locale switch translates copy, dates and currency.
- S4 — Renders at mobile width without horizontal scroll.
- S5 — Keyboard-only traversal of ticket cards, session cards and quantity pickers.

**Release check** — fresh clone into a clean directory, `yarn && yarn dev`, confirm it boots with no
manual steps. This is an explicit submission requirement and the failure mode (a file that works
locally but was never committed) is invisible from inside the working tree.

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
- **The design is set in Inter**, at variable weights. The starter loads no webfont at all, so
  without adding Inter Variable the whole thing renders in a fallback and every weight token is a
  lie. Confirmed against Figma's own codegen, which emits
  `font-[family-name:var(--family/inter,'Inter:630')]`.

**A note on font weights.** Figma's text styles resolve to weights that do not match the
`font-weight/*` variables they are bound to: `heading/h1` renders at 700 and `h2`–`h4` at 680 while
binding `font-weight/bold` (630); `body/md semi-bold` renders 640 against `semibold` 610; but
`subtitle1` renders 600 (_below_ `semibold` 610), `body/sm/medium` renders 550 (below `medium` 570),
and the button labels and `body/xs/medium` land exactly on their tokens.

Deviations running in both directions, with several exact matches, is the signature of text styles
hand-authored at arbitrary weights rather than a deliberate second scale — and Figma's generated CSS
itself emits `var(--font-weight/bold)`, meaning its codegen expects the token, not the resolved
number. I follow the token scale: chasing 680/700 would mean hardcoding weights that contradict the
documented design system for a difference that is marginal at 24px, and correct token usage is its
own graded criterion.

Doing this surfaced a real gap in the starter: the weight scale existed only as JavaScript literals
in the UnoCSS theme, while font sizes were CSS variables. Nothing set a default body weight, so all
unstyled text rendered at the browser's 400 instead of the design's 485. The scale is now declared
in `typography.scss` and referenced from both the theme and `body`, giving it one source of truth.

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
