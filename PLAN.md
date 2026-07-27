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

| Phase | Scope                                                                                | Est. | Status  |
| ----- | ------------------------------------------------------------------------------------ | ---- | ------- |
| 0     | Environment (Node pin), Figma access, design recon                                   | 0.5h | ✅ Done |
| 1     | Foundation — `utils/` (time, currency, validators), `useRegistration` state          | 1h   | ✅ Done |
| 2     | Wizard shell + stepper, Step 1 — ticket cards, attendee form, `FormField`            | 1.5h | ✅ Done |
| 3     | Step 2 — day tabs, session grid, capacity bars, conflict detection                   | 1h   | ✅ Done |
| 4     | Step 3 — category tabs, workshop conflicts, size/qty, shipping banner, order summary | 1.5h | ✅ Done |
| 5     | Step 4 — review cards, unified validation, error navigation, submit + success        | 1h   | ✅ Done |
| 6     | Polish — responsive layout, interactive states, entry motion                         | 1h   | ✅ Done |
| 7     | i18n pass, dead-code sweep, CSS duplication audit                                    | 1h   | ✅ Done |
| 8     | Acceptance pass — scenarios below, clean-checkout smoke test                         | 0.5h | ✅ Done |

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

**Phase 2 — Shell and Step 1** ✅ `8f6400c` `2ca6842` `2682696` `d7e9870` `6da5c0b`

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

_Sticky chrome._ The stepper pins to the top and the action bar to the bottom, so the forward
action stays reachable on the long steps and free navigation stays available while scrolling. The
design cannot settle this — its frames run 981px to 1309px tall, so scrolling is clearly expected,
but a static frame says nothing about sticky behaviour.

Implemented with `position: sticky` on the normal document scroll rather than an inner
`overflow-y: auto` region. A nested scroll container breaks find-in-page, makes `scrollIntoView`
unreliable — which Phase 5 needs to reach the first validation error — and creates the "scrolled the
wrong thing" problem, with noticeably worse momentum scrolling on iOS. The header is deliberately
left to scroll away: pinning it too would cost 153px of permanent chrome, 17% of a 900px viewport
before the action bar's 72px, and it carries only branding and the locale switcher.

**Phase 3 — Step 2** ✅ `643787c` `8816c8a` `39f27da`

Day tabs, the session grid, and capacity bars. Card geometry matches frame `1072:912` exactly —
592×162 with 16px gaps, child heights 20/20/16/14/28.

_Colour sampled, not guessed._ With the Figma MCP server disconnected mid-phase, the capacity
bands were recovered by serving the design PNG through the dev server and reading exact pixels off
a canvas. That produced hard values (41% → `#264D4F`, 58% → `#918108`, 78/81/97% → `#C94A03`, full
→ `#C71A1A`), placing the band cuts at 50 and 75. The same technique measured the tab corner radii
by fitting the arc: the inset profile `[7,4,3,2,1,1,1,0]` fits r=8, so the segmented tab uses an
8px literal like the logo tile, inside a 10px container.

_Card edges are inset shadows, not borders._ Figma strokes sit inside the frame, so a CSS border
measures outside the design's numbers: a bordered session card came out 164px against the design's
162px, and thickening the stroke to 2px for the selected state grew it again, making the card and
its whole grid row jump on selection. Both edges are now inset `box-shadow` layers
(`card-edge` / `card-edge-selected`), which cost no space. Session cards measure exactly 162px in
every state, with a measured selection delta of 0.

The elevation shadow belongs on session cards too — sampling below a card's bottom edge shows the
pixels ramping `235 → 240 → 244 → 248 → 250` over ~10px and only ~3px sideways, the signature of the
same `0 4px 16px` shadow the ticket cards use. Since `box-shadow` does not stack across utilities,
the edge and elevation layers are declared together in one shortcut shared by both card types.

The same jump existed on the ticket cards, where the "Selected" badge entered the flow on selection
and shunted the row by 32px. It is now always laid out and hidden until selected, holding the row
constant.

_Capacity label colours come from Figma's own inspector, not from the nearest semantic token._ The
labels are filled `orange/700` (`#A13B02`) and `text/brand/emphasis` (`#264D4F`). I had initially
snapped them to `text-accent-emphasis` (`#C94A03`) and `text-brand` to stay on semantic tokens,
which was wrong on both counts — and `#264D4F` is the name-shift trap again, since the starter's
`--text-brand-emphasis` is `#1E3C3E`. Neither value exists in the starter's semantic text scale, so
these two use palette utilities: still theme-backed, but honest about the value the design asks for.

_Open, unresolved:_ the ticket-card row renders 304px where the design frame is 288px. The card's
own children account for exactly 288, every ancestor in the chain is fully accounted for, and a
detached clone of the row at the same 1200px width measures exactly 288 — yet the live row is 16px
taller, and neither `flex-wrap: nowrap`, a zeroed row gap, `fit-content`, nor `align-items:
flex-start` changes it. It is cosmetic and stable across selections, so it is parked rather than
papered over with a hardcoded height. **Resolved in Phase 4** — see the `.flex` collision below.

---

**Phase 4 — Step 3** ✅ `d832858` `fab897a` `c5ae2f2`

Category tabs, add-on cards, workshop conflicts, merchandise controls, and the live order summary.
Geometry matches frame `1073:899` exactly: the 1200px content column splits 788 / 32 / 380, the
workshop cards are 120px, and the order summary is 380×211 rendering `$599.00 + $149.00 − $14.90 =
$733.10` — the design's own numbers, arrived at independently.

_Unavailability is derived, not enforced — mostly._ The README asks that a workshop overlapping a
selected session be marked unavailable. `unavailableAddonIds` is a `computed` over sold-out state
and schedule overlap, and both `selectedAddonLines` and `setAddonQuantity` respect it, so a workshop
a session choice puts out of reach stops counting toward the total without anything watching for it.

That held until a later bug report showed the gap: a workshop dropped out of reach this way still
read as selected in state, so the card and the order summary disagreed, and it silently returned to
the total if the clash cleared. `a1f80a8` (Phase 7) added `dropAddonsClashingWith`, called from
`toggleSession` — the one place selection is genuinely destructive in this app, and deliberately so:
it fires from the click that caused the clash, not from a watcher polling for it, which keeps the
"derived state is computed, never watch" rule intact. The trade is that the workshop does not come
back if the clashing session is later removed; re-adding it is a second, explicit action.

_A shared card, until it stopped being shared._ Workshops and meal packages are the same card with
optional rows, so one `AddonCard` renders both — a meal simply has no schedule or capacity line.
Merchandise is a different component: its card is not a button, because it contains its own
controls, and selection is expressed by quantity rather than by clicking the card. The design backs
this up, giving merchandise the "✓ Added to order" line that workshops do not have.

I did briefly extract a shared `CapacityLabel` for the session and workshop cards, then reverted
it. The two surfaces disagree on both wording ("spots left" vs "spots remaining") and colour
(banded against the bar vs a flat `text/neutral/quiet`), so the shared component was two components
wearing a trench coat.

_The `.flex` collision — and the 16px._ Quasar ships `.row, .column, .flex { display: flex;
flex-wrap: wrap }`, while UnoCSS's `.flex` sets `display` only. Quasar's stylesheet loads first but
nothing later restores the default, so **every `flex` in this app silently wrapped**. It surfaced on
the shipping banner, whose icon and text block broke onto separate lines, and the fix is a preflight
in `uno.config.js` — the same place, and the same reasoning, as the border reset already there. The
`flex-wrap-*` utilities are emitted after preflights, so deliberate wrapping still works.

This also closes the Phase 3 mystery: the ticket-card row was wrapping, and the extra line box was
the 16px. It now measures exactly 288. Worth recording that the earlier `flex-wrap: nowrap` probe
was run as an inline style on the row rather than on the wrapping ancestor, which is why it came
back negative and sent the investigation down a dead end.

_Groundwork for V3._ A size only matters once the item is actually in the order, so
`merchandiseMissingSize` reads the priced lines rather than every sized product — a t-shirt sized
"M" and then decremented to zero is not an error. Phase 5's rule array consumes it directly.

_Where the design and the platform disagree._ The size control was a native `<select>`, which sizes
itself to its widest option — 74px against the design's 45px for a chosen "M". Matching the design
exactly means a custom listbox: a popup, focus management, and type-ahead, all to save 29px on a
control that already had correct keyboard and mobile behaviour. I judged that not worth it, and
flagged it rather than hiding it.

**That verdict was later overturned — see the note at the end of §5.** The reasoning was sound but
rested on an unexamined premise: that the listbox would have to be hand-built. Quasar was already in
the dependency tree.

The merchandise frame (`1149:565`) also draws its text at 19/15/13px line boxes where the workshop
frame uses 20/16/14 — so merchandise cards render 134px against the frame's 131. The typography
tokens match the primary frame exactly; the secondary frame is the inconsistency §3 warns about.

**Phase 5 — Step 4 and submission** ✅ `4e86d5d` `c611c6f` `695ea09`

Review sections with Edit links, the unified rule set, error navigation, submit and the success
screen. Geometry matches frame `1074:897`: review cards at 20px padding with 12px rows (228 / 144 /
88 for six, three and one row), the pricing card at 8px rows, and a 48px submit button in an 80px
action bar against 40px in 72px on every other step.

_A row appears when it has a value, or when it is required._ That rule is what decides the attendee
section, and it explains why the normal frame shows Shipping Address only when merchandise is in
the order.

I originally reached further and claimed it also reconciled the two frames' treatment of Job Title —
present in one, absent from the other — on the grounds that Job Title was optional. **It is not.**
The README's field table lists it as required, which I missed on the first pass and which the error
frame contradicts by omitting it entirely. So the frames really are inconsistent here, the rule does
not rescue them, and source precedence settles it: the README wins and Job Title is validated. The
neat explanation was the appealing one rather than the correct one, which is worth recording as its
own lesson — a rule that explains away an inconsistency deserves more suspicion than one that merely
describes behaviour.

_Validation is one array, and nothing maintains a second copy._ `VALIDATION_RULES` is nine entries
of `{ step, field, messageKey, validate }`, and the stepper's red badges, the error banner, the
`— (required)` review placeholders, the inline field errors on Step 1 and the danger borders on
Step 2 all reduce from it. Step 1's bespoke shipping-address check, written in Phase 2 before the
rule set existed, was deleted in favour of the rule — it was the exact duplication CLAUDE.md warns
against.

Two details worth stating. `validate` takes a flat snapshot rather than the reactive state, so each
rule is a pure predicate that can be exercised without mounting anything. And a rule that can fail
several times over — overlapping sessions, unsized merchandise — stays one rule and interpolates
the offenders into its message, rather than becoming an error factory that would break the "array
of independent booleans" shape.

_Gating, precisely._ `isValid` is ungated, because submit must consult it before there has been an
attempt. Everything the user sees waits for `submitAttempted`. The review's `— (required)`
placeholder is the one deliberate split: the text always shows, because an empty required field
genuinely has no value and saying so is information rather than an accusation, but its danger
colour waits for the submit attempt.

_The conflict borders land where they were asked for._ Overlapping sessions are not flagged on Step
2 during selection; they surface as a Step 4 error, and only then do the offending Step 2 cards take
`card-edge-danger`. Because that edge is an inset shadow like the others, a conflicted card still
measures exactly 162px — the error state shifts nothing.

_The success screen follows the mockup, not my reading of the README._ The README asks for a
confirmation screen "with a summary" and the design's frame has none, so I first built an itemised
recap of ticket, sessions, add-ons and total paid, on the grounds that source precedence puts the
README above the mockup. Reviewed and reversed: the frame is the intended design, and the screen
already carries the substance of a summary — the confirmation code, and a body line naming the
ticket type, the event and the destination email. The itemised breakdown belongs on Step 4, which
the user reaches immediately before this and can return to. Precedence resolves conflicts of fact;
it does not license padding a deliberately spare screen.

The confirmation prefix is `WDS2028` rather than the frame's `TC2025`, which is the same stale
TechConf branding as its "WebDev Summit 2025" header.

_A bug the wizard root has now hit twice._ `useValidation` initially injected the registration
state, which throws in `RegistrationWizard` — the component that provides it. `useStepper` already
carries the same optional-injection parameter for the same reason; the second occurrence suggests
any composable reading this state should take it, so Phase 6 should not rediscover this a third
time.

**Phase 6 — Polish** ✅ `2a8a7d8` `ba1d2dd` `e677e64` `cb90b79` `f9a1212`

Responsive layout, interactive states and entry motion. URL sync was scoped here and deliberately
cut — see §8.

_Responsive._ Every step had assumed the 1200px column. Step 3 was the worst: its two-column layout
could not stack, squeezing the add-on list until the heading broke one character per line. Worth
recording that the `.flex` preflight from Phase 4 is what exposed this — removing Quasar's
`flex-wrap: wrap` stopped rows from stacking by accident, so the fix made the missing breakpoints
visible rather than causing them.

The header gutter needed more than a breakpoint. Its padding is
`clamp(24px, calc((100% - 1200px) / 2), 48px)` — the content column's own gutter formula, floored at
the page gutter and capped at the design's 48px. No single breakpoint works: between 1248px and
1296px the column's gutter slides from 24 to 48, so a fixed padding drifts against it, and at 1280 —
a common laptop width — the header sat at 48 against content at 40. The percentage resolves against
the containing block rather than `100vw`, so a classic scrollbar cannot skew the alignment.

_Motion, and how it is verified._ The stepper's connector fill grows along its track, and the
success badge springs in with a ripple before the tick draws itself. Both are CSS animations rather
than Vue transitions, for a specific reason: `<Transition>` advances through `requestAnimationFrame`,
which a backgrounded tab suspends. A cross-fade I tried on the stepper's number-to-check swap
stranded the old glyph in `v-leave-from` indefinitely, so it was removed; CSS animations run on the
document timeline and have no such dependency.

This phase also corrected how I verify animation. Sampling geometry after a `setTimeout` produced
two wrong conclusions in a row, because the automation surface reports `document.hidden === true` —
transitions do not advance there, so every sample lands on the end state and looks like a snap. On
that evidence I wrote a confident comment blaming UnoCSS's `scale-x-*` custom properties, then
tested the claim directly and found it false. Inspecting `getAnimations()` is the reliable check: it
reports the transition object whether or not frames are being produced. The original diagnosis did
survive that test — `width: 0` to `width: 100%` registers no animation at all, which is why the fill
is a transform.

_Two things deleted rather than shipped._ A capture-phase click guard on the submit button, added to
avoid Quasar dimming the spinner via `[disabled] { opacity: .6 !important }` — the native `disabled`
attribute blocks mouse, keyboard and programmatic activation for free, and a dimmed busy button is
the conventional look. And an `aria-disabled` alongside it, which merely restates what the native
attribute already exposes.

**Phase 7 — i18n pass and cleanup**

_Dead code removed._ `conflictsFor` and `conflictingPairs` in `useSessions` had no consumers —
Step 4's conflict check went through `overlappingPairs` in `utils/time.js` instead, so a second
parallel conflict API was sitting there implying Step 2 flags conflicts, which was explicitly
decided against. `hasFieldError` in `useValidation` was superseded by `fieldError` and never
called. Both found by the branch review rather than by reading.

_i18n audited by script, not by eye._ Locale parity holds at 102 keys with no drift in either
direction. Two orphans removed: `fields.shippingAddress.requiredForMerchandise`, stranded when
Phase 5 moved that message into the rule set, and `fields.shippingAddress.label`, unreachable
because the field always resolves to `labelOptional` or `labelRequired`. Placeholder sets and
plural branch counts were compared across locales; the only flag was `step2.selectedCount`, where
English hardcodes "1 session" in its singular branch while Chinese interpolates — both correct, and
both carrying the three branches Vue I18n's default rule requires.

_The zh-TW success line was rewritten._ It read `您的 VIP 票 WebDev Summit 2028 報名已確認`, which
runs two noun phrases together without a particle. Now `您報名的 {event}（{ticket} 票）已確認`.
Parity checks prove a key exists, not that it reads well, so this part needed reading rather than
scripting.

_CSS duplication audit._ No duplicate keys in any shortcut map and no repeated custom properties in
the SCSS. It did surface something the notes had wrong, though: CLAUDE.md claimed the three colour
classes were "the only three collisions" with Quasar. They are not — `.text-h1` through `.text-h6`,
`.text-subtitle1` and `.text-subtitle2` are all defined twice. Ours win, because unlike the colour
classes Quasar declares typography without `!important` and the UnoCSS sheet loads later. Verified
rather than assumed: `text-subtitle1` renders 16/20 at weight 610, not Quasar's 16/28 at 400. No
fix needed, but the claim was false and is now corrected, with the caveat that a dynamically-built
typography class would fall through to Quasar's much larger scale.

---

**Phase 8 — Acceptance pass**

All 20 scenarios from §1a run against the live app (N3 stays dropped, per §1a). N1, N2, D1–D5, C1,
C2, C4, P1–P4, V1, V2, V4, V5, S1–S4 pass as specified, driven through the actual composable state
and DOM, not asserted from reading the code. C3, S3 and S5 are called out below because each one
surfaced something worth recording rather than a clean pass.

_C3 exposed a stale scenario, not a bug._ The scenario as written expected the workshop to survive
a retroactive conflict. `a1f80a8` (Phase 7) changed that on purpose — see the corrected Phase 4 note
above — and nobody had gone back to update the acceptance scenario or the narrative that motivated
it. Both are rewritten in this pass. Running the acceptance list is what surfaces this kind of drift;
reading the code in isolation would not have flagged it, because the code was internally consistent
with itself the whole time.

_S3 passed, including the part that is easy to skip._ Locale, date and currency all localise
correctly, and `<html lang>` follows — confirming the fix earlier in this session actually reaches
the DOM under real navigation, not just the isolated test that motivated it.

_S5 is verified structurally, not by a live keystroke._ Ticket cards, session cards and quantity
pickers are all native `<button>` elements with no custom keydown handler, so Enter/Space activation
is the browser's own default behaviour, not app logic that could be wrong. What I could not get was
a live keystroke round-trip: partway through this pass, this preview pane's input injection stopped
reaching the page at all, for both clicks and key presses, on elements that had worked minutes
earlier in the same tab (the same stepper button that satisfied N2). `elementFromPoint` found the
correct element with nothing overlapping it, and a JS-dispatched `.click()` on that same element
still worked — so the click handler was never in question, only the tool's ability to deliver a
trusted input event to the page. Recorded as a verification gap rather than papered over with the
`.click()` workaround, since that would prove the handler works without proving keyboard access
does.

_Release check._ A fresh `git clone` into a scratch directory, Node pinned to 22.17.0 via `nvm use`,
then `yarn install && yarn build && yarn dev`. Install succeeds with one pre-existing peer-dependency
warning (`unocss` wants `vite` directly; `@quasar/app-vite` supplies it transitively) unrelated to
anything changed this session. Build succeeds. Dev server boots on first try and serves `HTTP 200`
with no manual steps — the actual text of the submission requirement, not a paraphrase of it.

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
- N3 — _Dropped._ Browser Back leaves the app rather than stepping back, because URL sync was cut
  in Phase 6. Recorded as a known limitation in §8 rather than as a scenario that passes.

**Data rendering**

- D1 — Sessions group into Nov 15 / Nov 16, six per day, in schedule order.
- D2 — `s2` (120/120) and `s9` (90/90) render sold out and cannot be selected.
- D3 — `ws2` (25/25) renders sold out — capacity applies to add-ons, which the README omits.
- D4 — Capacity bars land in the right colour band; `s6` (41%) and `s5` (58%) differ visibly.
- D5 — Times render in UTC: `s1` as `9:00 AM – 10:00 AM`, `ws1` as `Nov 16, 2:00 PM – 5:00 PM`.

**Conflict detection**

- C1 — `s4` + `s5` selected → conflict surfaces at submit, not before.
- C2 — `s11` + `s12` selected → same.
- C3 — `ws1` selected, then `s11` added on Step 2 → `ws1` is dropped from the selection
  (`dropAddonsClashingWith`, `a1f80a8`) and no longer counted in the order summary. This scenario's
  wording changed after Phase 4 was written; see the Phase 4 note above for why the earlier
  non-destructive behaviour was replaced.
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

**One product name contradicts its own options.** `merch4` ships as `Laptop Sleeve (15")` while
offering `13"` / `15"` / `16"` — the name pins a size the selector then asks the user to choose,
and a cart line reading `Laptop Sleeve (15") — 13"` is simply wrong. The Figma frame reproduces the
same string, so this is an inconsistency in the source rather than one introduced here. I renamed
it to `Laptop Sleeve` in `mocks/addons.js`, which is the honest place to fix it: stripping a
parenthetical at the display boundary would be a frontend quietly rewriting product names, and
the regex would eventually eat a parenthetical that mattered. Recorded here because editing a
provided fixture should be a visible decision, not silent drift.

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

### Figma tokens must be translated by value, not by name

The most costly trap so far. Figma's generated CSS names a token for every colour, and the
starter defines tokens with the same names — but the brand ramp is shifted one step between
them. Figma's `bg/brand/muted/rest` is `#EEF6F7`; the starter's `--bg-brand-muted-rest` is
`#CBE5E6`, and `#EEF6F7` lives in `bg-brand-subtle-rest`. `text/brand/default` and
`text/brand/emphasis` disagree the same way.

Copying the token name out of Figma's output therefore produces a visibly wrong colour while
looking entirely correct in review — the selected ticket card came out two shades too dark this
way. The rule is to read the hex from Figma, find which starter token holds that value, and use
that. Recorded in `CLAUDE.md` so it survives into later phases.

### Quasar's colour helpers silently override the semantic tokens

Quasar ships 596 `.text-*` / `.bg-*` helper classes, all with `!important`. Three of them collide
exactly with the starter's semantic shortcut names — `text-accent`, `text-info`, `text-warning` —
and win, substituting a Quasar palette colour for the design token. `text-warning` rendered
`#FADD00` (Quasar's `--q-warning`) instead of the design's `#918108`.

This is nastier than a normal specificity bug because the markup, the shortcut definition and the
generated CSS are all correct; only the cascade is wrong, and only for three names out of dozens.

My first fix re-asserted those three in `app.scss` with `!important`. That works but commits the
project to fighting the cascade permanently, so it was replaced. Quasar exposes no config to
exclude its helper CSS — `framework.cssAddon` only adds classes — and specificity cannot help,
since `!important` outranks any selector weight. UnoCSS's `!` prefix or global `important: true`
would only relocate the `!important`.

The collision is sidestepped instead, by using the design system's own canonical names. Figma's
token reference frame lists these as `text/warning/default` and `text/info/default`, matching the
CSS variables — the starter's bare `text-warning` is shorthand, and it is only the shorthand that
Quasar defines. Adding `text-accent-default`, `text-info-default` and `text-warning-default` to
`semantic.js` therefore is not a workaround name at all: it is the more correct one, and would have
been the better choice with or without the collision. Quasar's palette stops at `-14`, so the
`-default` suffix is permanently safe, and the codebase now contains no `!important` anywhere.

Worth recording that I had the token reference frame from Phase 0 and still framed these as
invented aliases; the canonical naming was sitting in a screenshot I had already read.

Quasar also styles `[disabled]` with `opacity: 0.6 !important`, which quietly washed out the
sold-out session card. Replacing the `disabled` attribute with `aria-disabled` plus a guarded
click handler both restores the design's contrast and keeps the card focusable — a `disabled`
button leaves the tab order entirely, so a keyboard or screen-reader user could not discover the
session exists, which matters when "Sold Out" is the information being conveyed.

### The design never defines a sold-out card

Step 2's frame contains a sold-out data rendering and an unavailable card treatment, but never on
the same card:

- `s2` is genuinely at capacity (120/120) and renders correctly as data — red full bar, "Sold Out"
  label — but its card is styled as **selected**: brand border, `#EEF6F7` surface, checked box.
  Selected and sold out is not a state that can exist.
- `s5` is the greyed card — muted surface, muted text, and no checkbox drawn at all (sampling that
  corner returns `#EBEEEF`, its own background, where an available card returns `#5C6970`). But
  `s5` has 38 spots left, so its data does not justify the treatment.

The greyed `s5` is most likely demonstrating a _time conflict_: `s4` Modern CSS (13:00–14:30) is
selected and `s5` (13:30–15:00) overlaps it, while `s6` overlaps nothing selected and is not
greyed. Two of three cards fit; the exception is `s3`, which overlaps the checked `s2` and is not
greyed — plausibly an oversight, given `s2` is the sold-out card the designer also drew as checked.

Even so, conflicts do not grey out sessions here. The README is explicit that "users may freely
select any available sessions" with conflict validation "deferred to Step 4 submit time", and the
assignment doc ranks above the mockup. Blocking selection would also make the Step 4 session
conflict validation unreachable — you could never assemble a conflicting pair to submit — deleting
a graded requirement, and it would break the retroactive workshop-conflict case, which depends on a
conflict being created after the fact.

Conflicts are therefore detected in `useSessions` but surfaced only at Step 4, where the offending
sessions get a danger border. Step 2 stays visually silent. I briefly built a non-blocking "time
conflict" chip on the card as a middle ground and removed it: it duplicated feedback that Step 4
already owns, and two places reporting the same rule is how they drift apart.

The greyed treatment goes to sold-out sessions instead. It is the only "unavailable" visual the
design provides, `s2`'s selected-and-sold-out rendering cannot be the intended answer, and a
sold-out card that looks identical to a selectable one is poor UX regardless of the mockup.

### One deliberate addition to the design

The header carries a locale switcher that appears in no frame. The design documents the four
steps plus success, error, token and shipping-state references, but never depicts i18n — it is
silent on the feature rather than opposed to it, while the assignment doc lists i18n as a
nice-to-have, and the doc outranks the mockup.

The practical argument is the stronger one: without a switcher the `zh-TW` translations are
unreachable from the UI, and a reviewer would have to open a console to discover the feature
exists at all.

It is scoped so nothing designed moves: all header content in the design is left-aligned (logo at
x=48, title at x=100), so the switcher sits `ml-auto` with its right edge at 1392 — exactly the
header's 48px padding. It uses only existing tokens (`border-neutral-muted`, `bg-surface-l0`,
`text-neutral-muted`, `rounded-m`) and a native `<select>`, so it inherits correct keyboard and
screen-reader behaviour rather than reimplementing a dropdown.

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

**Currency format: scoped to where the README asks.** README §Step 3.6 requires all prices as
`$X,XXX.XX`, and the add-on cards were rendering `$149` — the design's short form, which
`formatPriceShort` exists to produce. Precedence puts the README above the mockup, so the add-on
cards now render `$149.00`.

Deliberately **not** applied site-wide, despite "all prices" reading absolute. The requirement sits
inside the Step 3 list, and the README's own ticket table writes `$299`, `$599`, `$99` without
decimals — so a global reading would breach one part of the README to satisfy another. Ticket cards
keep the short form, which both the README's table and the design agree on, and Step 4's row values
keep it too since that section states no format requirement. The Step 3 screen gains coherence
either way: its cards and its order summary now print the same figure the same way.

---

## 4. Key decisions

**Cross-step state: factory + `provide`/`inject`, not a module singleton.** A module-scoped
`reactive()` is the quickest path but makes state global and awkward to reset or test in isolation.
A `createRegistrationState()` factory provided at the wizard root with a `Symbol` injection key
keeps ownership explicit, allows a clean reset after submission, and satisfies the rubric's
"composable or provide/inject" from both directions.

**Derived state is `computed`, never watched.** Conflicts, availability, totals, capacity bands and
the error map are all pure functions of `(mock data, selections)`, so none of them is watched.

There is exactly **one `watch` in the codebase**, and it is the shape the rule allows: a
`watchEffect` in `src/boot/i18n.js` writing `document.documentElement.lang` from the active locale.
The target is a DOM attribute — state outside Vue's reactivity graph, which no `computed` can
express. It is annotated in place as such. The other candidate, syncing the step to the URL, was
cut in Phase 6 precisely because that state _was_ derivable.

**Validation as a declarative rule set.** An array of `{ step, field, validate, message }` rather
than imperative checks scattered across components. `errorsByStep` becomes one `computed` reduction,
which is what makes the stepper badges, the error panel, the per-card danger borders and the
`— (required)` placeholders all fall out of a single source of truth instead of being maintained in
four places.

Errors are gated behind a `submitAttempted` flag so Step 1 stays inline-error-free as specified,
then correct live once the user has submitted once — matching the disabled-submit state in the
error frame.

**Retroactive workshop conflicts.** A user can select `ws1` on Step 3, navigate back to Step 2, and
add `s11` — which now conflicts with an already-selected workshop. My first answer was to keep the
selection and flag the card inline, on the reasoning that silently de-selecting destroys user input.
That was wrong in a way only testing surfaced: the workshop stayed in state but was filtered out of
`selectedAddonLines`, so the card and the order summary disagreed about whether it was selected, and
it would silently reappear in the total if the clash later cleared. `a1f80a8` replaced it with
`dropAddonsClashingWith`, called from `toggleSession` — the removal is attributable to the click
that caused it, rather than to a watcher observing state after the fact. The cost is that dropping
the clashing session does not bring the workshop back; re-adding it is a second, explicit action.

**Rounding.** The VIP discount is 10% of the workshop subtotal computed once on the summed total,
not per line item, so the itemised breakdown always reconciles against the grand total.

**The ticket radiogroup keeps every card tabbable, deviating from the ARIA pattern on purpose.**
`TicketCard` is a `<button role="radio">` inside a `role="radiogroup"`, which conveys something
plain buttons cannot: three mutually exclusive options, exactly one selected. The WAI-ARIA Authoring
Practices pattern for that role also expects roving tabindex — one tab stop for the whole group,
arrow keys moving focus and selection together.

I built that, verified it worked, and reverted it. The pattern assumes the user knows to press arrow
keys, which is true for screen reader users who are told so and false for sighted keyboard users who
are not. Adopting it meant Tab silently skipping two of the three cards with no visual cue — trading
a correct-by-spec implementation for a worse experience for the larger group. Keeping all three
tabbable is the deviation; dropping `role="radio"` to make the keyboard behaviour "honest" would
have been the bigger loss, since it discards the exclusivity semantics entirely.

Worth being precise that this is not a conformance failure: SC 2.1.1 (Keyboard) is met — every card
is reachable and operable via Tab and Enter/Space — and SC 4.1.2 (Name, Role, Value) is met through
`role` and `aria-checked`. The APG is guidance, not a requirement, and this is a trade a number of
shipped design systems make for the same reason. The remaining gap is that I have not verified what
a screen reader actually announces here, so the deviation is reasoned rather than measured.

---

## 5. Dependencies

The starter ships Vue, Quasar, vue-router and UnoCSS. My default position was to add nothing and
justify each exception.

| Dependency                   | Verdict                            | Reasoning                                                                                                                                                                                                                                                               |
| ---------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vue-i18n`                   | **Added**                          | i18n is a listed nice-to-have. It only stays cheap if strings are keyed from the first commit; retrofitting an extraction pass across 15 components is where this turns into hours. Also routes date/currency formatting through one locale-aware layer instead of two. |
| Inter Variable (self-hosted) | **Added**                          | The design is set in Inter at variable weights and the starter loads no font. Self-hosted rather than a Google Fonts CDN link so a clean checkout works offline and there is no render-blocking third-party request.                                                    |
| `date-fns` / `dayjs`         | **Rejected**                       | `Intl.DateTimeFormat` with `timeZone: 'UTC'` covers every formatting case here, and overlap detection is a two-line numeric comparison on epoch millis. A date library would add weight to avoid roughly 20 lines of standard-library code.                             |
| `lodash-es`                  | **Rejected**                       | Grouping is a four-line `reduce`. Not worth a dependency.                                                                                                                                                                                                               |
| Pinia                        | **Rejected**                       | The rubric explicitly asks for composable or `provide`/`inject` state. A store library would sidestep the thing being assessed, for a single-screen wizard that never needs cross-route persistence.                                                                    |
| `quasar`                     | **Kept — tooling, plus `QSelect`** | Audited in Phase 6 as tooling-only. Revisited after Phase 7 when the audit's own framing was questioned: `QSelect` now backs the merchandise size control and the locale switcher. See below.                                                                           |
| `vitest`                     | **Considered**                     | Test coverage is explicitly not evaluated. If time allows I would add a small suite over `rangesOverlap` and the pricing reducer — the two functions where an off-by-one is both plausible and invisible in the UI.                                                     |

_What Quasar actually earns its place doing._ The Phase 6 audit was stark: **27 bespoke components,
zero Quasar ones.** Nothing imported from the `quasar` package, no `q-` utility class appeared in
any template, and no plugins were enabled. What the framework provided was `@quasar/app-vite` — the
build, the dev server, the boot-file convention — plus the `--q-*` colour aliases the starter wired
into `colors.scss`.

Its components went unused because the design is a specific token system with exact values, and
Quasar's are opinionated: matching `162px` session cards, a `48px` submit in an `80px` bar, and
Figma's own `#3A7679` link colour means overriding a Q-component's internals until little of it
remains. Writing a small component against the token set is less code than defeating one.

That reasoning still holds for most of the app. It did not hold everywhere, and the audit did not
notice — because it asked "which Quasar components did I use?" rather than "where is a control
costing me fidelity that Quasar already solves?" Those are different questions, and only the second
one finds anything. It took an outside prompt to ask it: _the assignment specifies Quasar, but we
are not using it at all — does that make sense?_

Re-reading the brief settled the framing. The stack clause reads "Use Vue 3.5.17 with Quasar
Framework v2.18.5 (the starter repo is preconfigured for you)" — a constraint on the stack, not a
quota of components; and none of the five evaluation criteria mention Quasar. So tooling-only was
defensible. But the question sent me back through the flagged fidelity gaps, and the size control
was sitting there: rejected at Phase 4 because a listbox is expensive to build, when `QSelect` is a
listbox that was already installed. The cost side of that trade had been wrong for three phases.

That is not a free ride. Quasar's global stylesheet caused five bugs, each found by measuring
rather than reading:

1. `border-style` defaulting to `none`, so every semantic `border-*` shortcut was inert (Phase 2)
2. `p { margin: 0 0 16px }`, adding spacing the auto-layout design does not have (Phase 2)
3. `.text-accent` / `.text-info` / `.text-warning` defined with `!important`, silently rendering
   Quasar's palette instead of the design's (Phase 3)
4. `.row, .column, .flex { flex-wrap: wrap }`, which made every flex row in the app wrap (Phase 4)
5. `.disabled, [disabled] { opacity: .6 !important }`, dimming the submit button's spinner (Phase 6)

Each is now fixed by a preflight in `uno.config.js` or recorded in CLAUDE.md so it does not recur.

_The one place Quasar wins: `QSelect` for the merchandise size._ Swapping the native `<select>`
closed the gap flagged in Phase 4. Chosen-state widths now measure S 45.9 / M 49.1 / L 44.9 /
XL 53.4 / XXL 61.9, against a flat 74px before and a 45px design reference — and the control sizes
to its content rather than to its widest option, which was the actual defect. Height (28px), radius
(6px) and every colour token are unchanged. No new dependency: `QSelect` auto-imports through
`@quasar/app-vite`, so `framework.plugins` stays empty.

It is not free, and the costs are worth recording honestly:

- The empty state is still 74px, because "Select" is simply a wide word. The win is in the chosen
  state, which is the common one.
- `QSelect` puts `role="combobox"` on an inner focus target and routes `aria-label` to a
  presentational div, so the control shipped **unnamed** until I checked. The fix leans on the root
  being a `<label for>`: text anywhere inside names the target, and the visible value is marked
  `aria-hidden` so it does not leak into the name.
- There was no focus styling at all. Now `focus-within:border-brand-emphasis`, matching `FormField`.
- The popup anchors to `.q-field__control`, so padding on the outer label pushed the menu 12px right
  and aligned it to the text instead of the button. Padding moved onto the anchor; alignment set
  explicitly via `menu-anchor` / `menu-self` rather than left to defaults.
- One `<style scoped>` block with `:deep()` — the only third-party styling in the app — because
  Quasar sizes the field skeleton for a 40px dense control.
- On touch devices this is Quasar's popup, not the OS picker wheel. More consistent with the design,
  but a genuine trade rather than a pure win.

The first two were regressions **I introduced**, and both were invisible from the closed control.
That is the same failure mode as the favicon and the stepper labels in §7: verifying the thing I was
thinking about instead of the surface the change actually touched. The habit that caught them was
checking the accessibility tree and the focus state because I had changed the control, not because I
suspected anything.

Verifying the popup at all needed a workaround. This preview pane runs with `document.hidden`, so
rAF never fires and the menu stays pinned in `q-transition--fade-enter-from` (`visibility: collapse`,
0×0) with its options unmounted. Patching `requestAnimationFrame` onto `setTimeout` in the page
releases it. Before finding that, I could measure the closed control and nothing else — and said so
rather than calling the change done.

_And a second: the locale switcher._ Once the pattern existed, the header's bare `<select>` was the
obvious next candidate — it was the last native dropdown in the app, and a full-width word ("English"
/ "繁體中文") where the design has room for an icon. It is now a 32×32 icon button that opens the same
menu, right-aligned under itself, 48px from the header edge on desktop and 24px on mobile, with the
header still measuring 73px.

The icon is an inlined SVG rather than `<q-icon name="translate">`. `extras: ['material-icons']` is
configured in `quasar.config.js` and its CSS is fetched on every load, but the app renders no glyphs
from it, so the woff2 itself never is — reaching for `QIcon` here would have pulled a ~100KB webfont
for a single symbol. Inlining matches what `BrandMark` and `CircleCheckIcon` already do, and takes
`currentColor`. **That config entry is now dead weight and should be dropped.**

One pre-existing gap this surfaced, unrelated to the swap: nothing ever updated `<html lang>`.
Quasar's Lang plugin does `el.setAttribute('lang', lang.isoName)` from its default `en-US` pack and
never follows `vue-i18n`, so the document claimed English while rendering Chinese. The old
`<select>` had the same hole, so it was not a regression — but it is a **WCAG 3.1.1 (Level A)**
failure, and the practical effect is that a screen reader hands `選擇加購項目` to an English voice,
which makes the whole zh-TW locale unusable non-visually. Shipping i18n as a nice-to-have and then
leaving one locale unreadable is half the feature.

Fixed with the `watchEffect` described in §4. The ordering mattered and was worth proving rather
than assuming: Quasar sets the attribute during framework init, so a boot-file write only survives
if boot runs afterwards. A cold load with `DEFAULT_LOCALE` temporarily flipped to `zh-TW` settled it
— the attribute came up `zh-TW`, so boot wins. Verified `en-US` → `zh-TW` → `en-US` through the real
control.

The Han-unification argument for `lang` — that CJK glyph shapes differ by language tag — I could not
substantiate here: flipping the attribute changed neither the rendering nor the measured width
(327px both ways), because macOS resolves both cases to the same fallback face. It may well matter
on Windows. The case rests on the screen-reader failure, which is verified.

Would I choose this stack greenfield? No — plain Vite + Vue + UnoCSS gives the same tooling without
a second CSS baseline to fight. But the starter is the starting point the brief specifies, and
removing Quasar at Phase 6 would rewrite the build config, the boot files and the documented
commands in order to delete bugs that are already fixed and documented. The cost is behind us; the
risk of the swap would not be.

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
- _Being asked the question the audit forgot to ask._ Phase 6 audited Quasar usage, found zero
  components, and concluded that was fine. The reasoning was sound and I did not think to question
  it. One prompt did — _the assignment specifies Quasar, but we are not using it at all; does that
  make sense?_ — and reframed the audit from "which components did I use?" to "where is a control
  costing me fidelity that Quasar already solves?" Only the second question finds anything. It found
  the size control, flagged and accepted in Phase 4 on a cost estimate that had stopped being true
  the moment Quasar counted as available rather than as scenery.

**Where it fell short, and what I did about it**

- _It defaulted to the conventional answer on URL sync._ Asked whether to sync the wizard step to the
  URL, it initially said no — reasonable-sounding, and wrong. When I pushed for the senior-engineer
  reasoning it reconsidered and identified the actual stake: on a single route, the browser Back
  button silently discards the entire form. It also caught the failure mode most implementations
  hit, where `router.replace` produces a correct-looking URL and a Back button that still exits the
  app. The reversal only happened because I asked it to justify the recommendation rather than
  accepting the first answer. The postscript matters too: when I later asked it to argue the case
  properly, it conceded that most of what it had cited — deep linking, refresh resilience — did not
  hold for an app that persists nothing, leaving one real argument. The feature was cut on that
  narrowed basis. Both the reversal and the retraction came from asking for reasoning rather than a
  verdict.
- _It over-trusted the mockup as specification._ Early reads treated the Step 2 frame as
  authoritative, which would have meant blocking conflicting sessions — directly contrary to the
  README. The frame is internally inconsistent (one conflicting session greyed, another not; a
  sold-out card rendered as selected). Resolving design-vs-spec conflicts needed the documented
  precedence order applied by hand; the model had no way to know which artefact wins.
- _It initially proposed stacked day/category sections_ for Steps 2 and 3, reading only the README's
  "group by". The design says tabs. A plan built from written specs alone would have produced the
  wrong components for two of the four steps — the argument for doing design recon before
  implementation rather than after.
- _It verified the signal it was thinking about, not the one that would have answered the question._
  This recurred often enough to be the single most useful thing in this section:

  | Change             | What was verified                | What actually decided it                                                                                                                          |
  | ------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Favicon            | `HTTP 200`, correct content-type | Whether it _parsed_ — a `--` inside an XML comment made the SVG unparseable                                                                       |
  | Stepper labels     | The `aria-label` being fixed     | The display mechanism swapped in the same commit; Quasar's `.hidden{display:none!important}` hid the labels at every width                        |
  | Required fields    | The Figma frames                 | The README's field table, which lists Job Title                                                                                                   |
  | `<html lang>` sync | A cold load reading `en-US`      | That Quasar's default and the new watcher _agree_ on `en-US`; only flipping `DEFAULT_LOCALE` to `zh-TW` made them disagree and settled which wins |

  Serving, naming and defaulting are all easy to confirm and none of them were the question. The
  correction is not "verify more" — it is "verify the surface the change actually touched." Applying
  that deliberately is what caught the `QSelect` swap shipping a combobox with no accessible name.

- _A living journal goes stale where the code moves fastest._ Five claims in this document became
  false without anyone noticing: "no watchers at all" (three copies, after the `lang` watcher),
  "the only three Quasar collisions" (typography collides too), and the retroactive-workshop
  behaviour (three copies, after `a1f80a8` replaced flag-in-place with drop-on-clash). Every one was
  true when written. The acceptance pass is what surfaced the last set, because running a scenario
  compares the document against the app, whereas re-reading code only proves the code agrees with
  itself.

The general pattern: strong at exhaustive cross-referencing across many files, weak at knowing which
of two conflicting sources is authoritative — and weakest at noticing that the question it is
confidently answering is not the question that matters. All three are where review effort belongs.

---

## 7. Challenges

- **Figma MCP access.** Diagnosed as a permissions issue rather than a broken server; duplicating
  the file to my own drafts resolved it.
- **Conflicting sources of truth.** Official doc > README > mockup, applied consistently and
  documented above.
- **A mockup that is not internally consistent.** Required deciding which parts are specification
  (states, tokens, layout) and which are illustrative filler (which specific card is greyed out).
- **Quasar's global stylesheet.** Five bugs, listed in §5, each found by measuring rather than
  reading. The recurring shape is a class that exists in both Quasar and UnoCSS where the winner
  depends on `!important` and sheet order, so the generated CSS looks correct in the diff and
  renders wrong in the browser.
- **A preview pane that silently lies about motion.** It runs with `document.hidden === true`, so
  `requestAnimationFrame` never fires and CSS transitions never advance. Two consequences worth
  recording: `getComputedStyle` during a stalled transition returns the _start_ value forever, which
  once produced a confidently wrong conclusion about a focus style that was in fact working — the
  reliable read is `getAnimations()`, which reports the intended `from`/`to`. And Quasar's `QMenu`
  stays pinned in `q-transition--fade-enter-from` with its options never mounted, so the `QSelect`
  popups could not be inspected at all until patching `requestAnimationFrame` onto `setTimeout` in
  the page released them. Before finding that, the honest position was that the closed control
  measured correctly and the open one was unverified — which is what I reported rather than
  inferring the rest.
- **Verification tooling failing mid-session.** During the acceptance pass the preview's synthetic
  input stopped reaching the page for both clicks and key presses, on elements that had worked
  minutes earlier. `elementFromPoint` returned the right element with nothing overlapping it and a
  JS-dispatched `.click()` still worked, which isolated it to input delivery rather than the app. It
  leaves S5's keyboard traversal verified structurally — native `<button>`s, no custom key handling,
  so activation is browser default — but not by a live keystroke. Recorded as a gap rather than
  closed with a `.click()` that would have proven the handler and not the keyboard path.

---

## 8. What I would improve with more time

- **Sync the step to the URL.** Cut from Phase 6: the wizard has a stepper and a Back button that
  imply navigable steps, but the browser has only ever seen one location — so pressing Back exits
  the app and discards a filled form. Real gap, but responsive layout and the acceptance pass
  outweighed it against the rubric.
- **Persist state to `sessionStorage`.** Pairs with the above — doesn't stop Back from leaving, but
  makes it non-destructive. Left out to avoid rehydration/versioning concerns for a case unlikely to
  come up in review.
- **Unit tests** over `rangesOverlap`, the capacity-band thresholds, and the pricing reducer. Not
  evaluated per the brief, but the two functions where an off-by-one would be invisible in the UI.
- **Virtualise the session grid if the dataset grows.** DOM windowing (e.g. `vue-virtual-scroller`),
  not pagination — there's no backend here, so data is always loaded in full; this is only about
  not mounting 200 `SessionCard`s at once. No-op at today's 12.
- **Confirm the capacity threshold values with the designer.** I derived the colour bands by reading
  fill percentages off the mockup; the exact cut-points are inferred, not specified.
