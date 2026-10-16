---
name: app-motion
description: Playful, game-like motion kit for React + Tailwind v4 web apps, built on the `motion` library (Framer Motion) plus canvas-confetti, Web Audio sound effects and vibration. Includes spring presets, press-and-ripple buttons, bottom sheet with drag-to-close, drop-down toasts, directional page transitions for react-router, a swipe-and-flip card, count-up numbers, progress ring and bar, floating decorative dots, staggered lists, shake/pop answer feedback, combo flash, splash screen and result screen celebration. Use when the user wants to add animations, micro-interactions or transitions to a project, make an app feel alive, playful, bouncy or native, animate buttons, modals, toasts, page changes, lists, cards or quizzes, or add confetti, sound effects or haptics.
---

# App motion

A motion kit for mobile-first web apps. The feel: everything moves on **springs**, every press gives **motion + sound + vibration** together, success is **celebrated** (pop, confetti, chime), mistakes **shake**, and idle decoration **floats** slowly in CSS.

Stack of the templates: React 19, Tailwind v4, `motion` (import from `motion/react`), `canvas-confetti`. Everything needed is in this skill's folder (`templates/`, `patterns.md`); nothing outside it is required.

## Steps

0. **Preflight.** Read the target project's `package.json` and main CSS before writing anything:
   - React version, Tailwind version (v4 uses `@theme` in CSS; v3 uses `tailwind.config.js`), router (react-router or other).
   - Whether `motion` or `framer-motion` is already installed (do not install both).
   - How the project handles dark mode and its color tokens.
   - Whether the app has sound/vibration settings.
   Do not assume; report what was found in one or two lines.
1. **Agree on scope.** List the screens/components the user asked about. If the request is vague ("make it feel alive"), propose which elements to animate and which effect from the Catalog, and confirm before editing.
   If the user can't answer, apply only the **core set**: primary buttons (`Pressable`), list entry (stagger), and answer feedback if the app has a quiz or form result. Put everything else you would suggest (page transitions, sheet, toast, splash, result screen) under "Suggested next" in the report instead of in code. Why: a vague request is permission to polish what exists, not to redesign the app.
2. **Install only what the chosen pieces need:**
   ```bash
   npm i motion canvas-confetti && npm i -D @types/canvas-confetti
   ```
   (skip `canvas-confetti` if no confetti is used.)
3. **Copy only the needed files** from `templates/` into the project (e.g. `src/lib/`, `src/components/`) and fix import paths. Copy their dependencies too: `motion-ui.tsx`, `SwipeCard.tsx` and `AudioButton.tsx` import `lib/sfx.ts` and/or `lib/haptics.ts`, which both import `lib/feedback-prefs.ts`. Paste only the used parts of `templates/motion.css` into the main CSS.
4. **Wire once at the app root:** `<Toaster />` if toasts are used, and `sfx.unlock()` in a one-time `pointerdown` listener (iOS only allows audio after a user gesture). If the app has sound/vibration settings, call `setFeedbackPrefs()` when they change.
5. **Match the project's design.** Replace colors (confetti `COLORS`, dots, tint rgba in SwipeCard, Tailwind classes), radii and fonts with the project's tokens. The template colors are a placeholder pastel palette.
6. **Respect reduced motion.** CSS loops are neutralized by `motion.css`; confetti checks it; for large Motion loops add `motion-safe:` or `useReducedMotion()`.
7. **Verify** (see "Definition of done").

Other stacks (Vue, Svelte, plain CSS, Tailwind v3): do not copy the TSX. Keep the numbers (spring stiffness/damping, durations, keyframes, thresholds) and port the pattern; `motion` also has a vanilla JS `animate()`.

## Catalog

| Effect | File | Notes |
|---|---|---|
| Spring presets, `stagger` variants | `templates/components/motion-ui.tsx` | `spring.press / enter / sheet / pop / fill` |
| Press button: spring shrink + ripple + click sound + vibration | `motion-ui.tsx` → `Pressable` | Use for primary buttons |
| Floating dots on dark headers, bobbing icon | `motion-ui.tsx` → `FloatingDots`, `Float` | Loop in CSS (`animate-drift`, `animate-bob`) |
| Count-up number, progress ring, progress bar | `motion-ui.tsx` → `CountUp`, `ProgressRing`, `ProgressBar` | CountUp writes textContent, no re-render per frame |
| Bottom sheet (phone, drag handle to close) / dialog (desktop) | `templates/components/Sheet.tsx` | Close on offset > 110px or velocity > 600 |
| Toasts dropping from top, swipe up to dismiss | `templates/components/Toaster.tsx` | `toast({ icon, title, body, action })` |
| Directional page transitions (tabs, push/pop, desktop) | `templates/components/AnimatedRoutes.tsx` | react-router; animates one `transform` string |
| Swipe card: 3D flip, tilt, tint, YES/NO stamps, fly-out | `templates/components/SwipeCard.tsx` | Threshold 110px or 650px/s; keyboard ← → ↓ Space |
| Play button with pulse ring + equalizer bars | `templates/components/AudioButton.tsx` | |
| Synth sound effects: tap, pop, flip, correct, wrong, combo, complete | `templates/lib/sfx.ts` | No audio files |
| Vibration | `templates/lib/haptics.ts` | Android only; iOS silently no-op |
| Confetti burst from an element / two-side celebration | `templates/lib/confetti.ts` | |
| Shimmer skeleton, bob, drift keyframes, flip utilities, reduced motion | `templates/motion.css` | Tailwind v4 `@theme` / `@utility` |
| Shake / pop answer feedback, feedback panel, letter slots, sliding nav pill (`layoutId`), shared element, accordion, content swap, re-popping badge, combo flash, splash, result hero, breathing hint, bouncing CTA, carousel entry, hover tilt, listening rings | [patterns.md](patterns.md) | Inline recipes |

## Which element gets which effect

Use this to decide; an element not listed here gets no motion unless the user asks.

| Element | Effect |
|---|---|
| Primary button, card that is tapped | `Pressable` |
| Modal, picker, form on phone | `Sheet` |
| Success / error / info message | `toast()` |
| Route change | `AnimatedRoutes` |
| List or grid that loads | `stagger` entry, capped |
| Loading state | `skeleton` shimmer |
| Number that changes (score, streak, count) | `CountUp` or re-pop via `key` |
| Correct / wrong answer | pop + confetti / shake (triple feedback, below) |
| Secondary links, table rows, plain text | none (color transition only) |

## Rules, and why

- **Springs for things that arrive or respond, eased tweens for things that leave.** Exits use `duration 0.2–0.35, ease [0.4, 0, 1, 1]`. Why: a bounce on exit pulls the eye back to something the user is dismissing.
- **Feedback is triple:** visual + `sfx.*` + `haptic()`. Tap: `sfx.tap()` + `haptic(6)`. Correct: `sfx.correct()` + `haptic([8,30,8])` + `burstFrom(el)`. Wrong: `sfx.wrong()` + `haptic([30,40,30])` + shake. Why: one channel alone feels flat on a phone.
- **Infinite loops go in CSS** (`animate-bob`, `animate-drift`, `skeleton`). Motion `repeat: Infinity` only for small, temporary things (playing indicator, loading dots). Why: CSS loops run on the compositor and cost no JS per frame.
- **Animate only transform and opacity.** Colors via `transition-colors`, shadows via `transition-shadow`, `height: auto` only for accordions. Why: other properties trigger layout and stutter on low-end phones.
- **Stagger with a cap:** `delay: Math.min(index, 10) * 0.05`. Why: item 40 should not wait 2 seconds.
- **Entry and loop on different elements:** wrapper springs in, inner element floats. Why: they fight over the same `transform` otherwise.
- **Restart keyframes by changing `key`** (shake on each wrong try, re-pop a counter).
- **Portal overlays to `body`** (sheets, toasts). Why: transforms on a page create a new stacking context and trap their z-index.
- **Drag on cards with buttons:** wrap inner buttons in `NoDrag` (native `pointerdown` stopPropagation). Why: React's synthetic handler runs too late for Motion's listeners.
- **Keyboard parity on desktop:** ← → swipe, Space flip, 1–4 pick, Enter continue, Escape closes sheets.

## Don't

- Animate elements outside the agreed scope, or animate everything "to feel alive".
- Animate width, height, top, left, margin (accordion height is the only exception).
- Use a spring on exit.
- Use Motion `repeat: Infinity` for decoration that runs forever.
- Copy the whole `templates/` folder when one effect was asked for.
- Keep the template pastel colors, or hardcode `#fff` / `#000` / `bg-white` / `text-black`, in a project that has its own tokens or dark mode.
- Change spring numbers unless the user asks for a different feel.
- Change component logic, data flow or layout while adding motion.
- Add UI the app doesn't have (a toast where there was no message, a sheet replacing a modal that works) unless the user asked for it.
- Add page transitions without asking: they need a fixed-height shell where each page scrolls inside, which changes the layout.
- Play sound without `sfx.unlock()`, or ignore the app's mute / vibration settings.
- Install `motion` next to an existing `framer-motion`.
- Report done without running the checks below.

## Definition of done

1. Every element in scope is listed with the effect applied, or a reason it was skipped.
2. `npm run build` (or the project's build/typecheck script) passes with no new errors.
3. Light/dark and reduced motion checked with the bundled script. Start the app (`npm run dev`, or build + `npx vite preview`), then:
   ```bash
   node <this skill>/scripts/check-ui.mjs --url http://localhost:5173 --routes /,/quiz/1 \
     --click 'button:has-text("Correct answer text")' --out ./ui-check
   ```
   Add `--dark-class` when dark mode is a `dark` class instead of `prefers-color-scheme`. It screenshots each route in light and dark, measures text contrast (4.5:1, or 3:1 for large text), and confirms that with reduced motion no infinite animation or confetti canvas runs. Paste its table into the report and look at the screenshots. Fix every FAIL row on an element you touched, even if the problem was there before (e.g. answer feedback colors with no `dark:` variant): the user will judge your feedback by whether it can be read. FAIL rows on elements you didn't touch: report them with a suggested fix, don't change them. "check if inactive (faded)" lines are warnings: fine for dimmed options, worth a look for labels people must read.
   No Playwright available (`npm i -g playwright && npx playwright install chromium` fails): write "not checked" for this item. Do not write your own checker; one script keeps results comparable.
4. No hardcoded colors on animated elements (the script can't see these; read your diff).
5. Sound and vibration respect the app's settings (if it has them).

Finish with this report:

| Element | File | Effect | Notes |
|---|---|---|---|
| Save button | `src/pages/Edit.tsx` | `Pressable` | |
| Word list | `src/components/WordList.tsx` | stagger, cap 10 | |
| Footer link | `src/components/Footer.tsx` | skipped | secondary link |

Then: the build result, the `check-ui.mjs` table, and a short "Suggested next" list of effects you did not apply (needed when scope was the core set). Write "not checked" for anything that could not be run, never "OK".
