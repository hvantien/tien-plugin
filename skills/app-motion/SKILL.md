---
name: app-motion
description: Playful, game-like motion kit for React + Tailwind v4 web apps, taken from the Wordpop (learn-english) app, built on the `motion` library (Framer Motion) plus canvas-confetti, Web Audio sound effects and vibration. Includes spring presets, press-and-ripple buttons, bottom sheet with drag-to-close, drop-down toasts, directional page transitions for react-router, a swipe-and-flip card, count-up numbers, progress ring and bar, floating decorative dots, staggered lists, shake/pop answer feedback, combo flash, splash screen and result screen celebration. Use when the user wants to add animations, micro-interactions, transitions or "the animations from learn-english / Wordpop" to another project, make an app feel alive, playful, bouncy or native, animate buttons, modals, toasts, page changes, lists, cards or quizzes, or add confetti, sound effects or haptics.
---

# App motion (from Wordpop)

Motion kit from `~/Documents/code/learn-english` (Wordpop, a vocabulary PWA). The feel: everything moves on **springs**, every press gives **motion + sound + vibration** together, success is **celebrated** (pop, confetti, chime), mistakes **shake**, and idle decoration **floats** slowly in CSS.

Stack: React 19, Tailwind v4, `motion` (import from `motion/react`), `canvas-confetti`. The templates are decoupled from Wordpop (no app imports); colors are its pastel palette, swap for the target project's.

## How to apply to a project

1. Check the target stack. React + Tailwind v4 → copy templates. Other stacks (Vue, Svelte, plain CSS, Tailwind v3) → keep the numbers (spring stiffness/damping, durations, keyframes, thresholds) and port the pattern; `motion` also has a vanilla JS `animate()`.
2. Install what the chosen pieces need:
   ```bash
   npm i motion canvas-confetti && npm i -D @types/canvas-confetti
   ```
3. Copy only the files needed from `templates/` into the project (e.g. `src/lib/`, `src/components/`) and fix import paths. Paste the parts of `templates/motion.css` you use into the main CSS.
4. Wire once at the app root: `<Toaster />`, and `sfx.unlock()` in a one-time `pointerdown` listener (iOS requires the AudioContext to start inside a gesture). If the app has sound/vibration settings, call `setFeedbackPrefs()`.
5. Match the project's design: replace colors (confetti `COLORS`, dots, tint rgba in SwipeCard, Tailwind classes), radii and fonts. Keep the spring numbers unless the user wants a different feel.
6. Respect reduced motion: CSS loops are already neutralized by `motion.css`; confetti checks it; for large Motion loops add `motion-safe:` or `useReducedMotion()`.

## Catalog

| Effect | File | Notes |
|---|---|---|
| Spring presets, `stagger` variants | `templates/components/motion-ui.tsx` | `spring.press / enter / sheet / pop / fill` |
| Press button: spring shrink + ripple + click sound + vibration | `motion-ui.tsx` → `Pressable` | Use for all primary buttons |
| Floating dots on dark headers, bobbing icon | `motion-ui.tsx` → `FloatingDots`, `Float` | Loop in CSS (`animate-drift`, `animate-bob`) |
| Count-up number, progress ring, progress bar | `motion-ui.tsx` → `CountUp`, `ProgressRing`, `ProgressBar` | CountUp writes textContent, no re-render per frame |
| Bottom sheet (phone, drag handle to close) / dialog (desktop) | `templates/components/Sheet.tsx` | Close on offset > 110px or velocity > 600 |
| Toasts dropping from top, swipe up to dismiss | `templates/components/Toaster.tsx` | `toast({ icon, title, body, action })` |
| Directional page transitions (tabs, push/pop, desktop) | `templates/components/AnimatedRoutes.tsx` | react-router; animates one `transform` string for compositor |
| Swipe card: 3D flip, tilt, tint, YES/NO stamps, fly-out | `templates/components/SwipeCard.tsx` | Threshold 110px or 650px/s; keyboard ← → ↓ Space |
| Play button with pulse ring + equalizer bars | `templates/components/AudioButton.tsx` | |
| Synth sound effects: tap, pop, flip, correct, wrong, combo, complete | `templates/lib/sfx.ts` | No audio files |
| Vibration | `templates/lib/haptics.ts` | Android only; iOS silently no-op |
| Confetti burst from an element / two-side celebration | `templates/lib/confetti.ts` | |
| Shimmer skeleton, bob, drift keyframes, flip utilities, reduced motion | `templates/motion.css` | Tailwind v4 `@theme` / `@utility` |
| Shake / pop answer feedback, feedback panel, letter slots, sliding nav pill (`layoutId`), shared element, accordion, content swap, re-popping badge, combo flash with shine, splash, result hero, breathing hint, bouncing CTA, carousel entry, hover tilt, listening rings | [patterns.md](patterns.md) | Inline recipes, a few props each |

## Rules that make it feel right

- **Springs for things that arrive or respond, eased tweens for things that leave.** Entries and presses use springs; exits use a short accelerating ease (`duration 0.2–0.35, ease [0.4, 0, 1, 1]`) so nothing bounces on its way out.
- **Feedback is triple:** visual + `sfx.*` + `haptic()`. Taps: `sfx.tap()` + `haptic(6)`. Correct: `sfx.correct()` + `haptic([8,30,8])` + `burstFrom(el)`. Wrong: `sfx.wrong()` + `haptic([30,40,30])` + shake.
- **Infinite loops go in CSS** (`animate-bob`, `animate-drift`, `skeleton`) so they run on the compositor. Motion `repeat: Infinity` is fine only for small, temporary things (playing indicator, loading dots).
- **Animate transform and opacity.** Colors change via Tailwind `transition-colors`; shadows via `transition-shadow`. `height: auto` only for accordions.
- **Stagger with a cap:** `delay: Math.min(index, 10) * 0.05` so long lists do not wait.
- **Entry and loop on different elements:** wrapper springs in, inner element floats.
- **Restart keyframes by changing `key`** (shake again on each wrong try, re-pop a counter).
- **Overlays outside transformed pages:** portal sheets/toasts to `body` (or an overlay root), otherwise page transition transforms trap their z-index.
- **Drag on cards with buttons:** wrap inner buttons in `NoDrag` (native `pointerdown` stopPropagation), React's is too late for Motion's listeners.
- **Keyboard parity on desktop:** swipe ← →, Space to flip, 1–4 to pick, Enter to continue, Escape closes sheets.

## Source in learn-english

For details not covered here, read the original: `src/components/ui.tsx`, `Sheet.tsx`, `Toaster.tsx`, `Splash.tsx`, `BottomNav.tsx`, `SideNav.tsx`, `DeckCard.tsx`, `WordRow.tsx`, `SpeakButton.tsx`, `study/FlashCard.tsx`, `study/Choice.tsx`, `study/Spell.tsx`, `study/Result.tsx`, `pages/Study.tsx` (combo), `App.tsx` (page transitions), `src/lib/{sfx,haptics,confetti}.ts`, `src/styles.css`.
