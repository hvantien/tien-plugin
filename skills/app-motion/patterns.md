# Inline motion recipes

Small effects that are a few props on an existing element, so they have no template file.
All use `import { motion, AnimatePresence } from 'motion/react'`.

## Contents

1. Answer feedback: shake on wrong, pop on right, dim the rest
2. Feedback panel sliding up from the bottom
3. Per-letter slots (spelling input)
4. Sliding active pill (tabs / nav) with `layoutId`
5. Shared element between list and detail (`layoutId`)
6. Accordion / expand row (height auto)
7. Swapping content in place (`mode="popLayout"`)
8. Counter badge that re-pops on change
9. Milestone flash with shine sweep (combo / streak)
10. Splash: bubbles bounce in, title letter by letter, loading dots
11. Result screen hero: trophy drops in and floats
12. Hint text that breathes
13. Call-to-action button that bounces while there is work
14. Horizontal card carousel entering
15. Hover lift / tilt on tiles
16. Listening button with expanding rings

---

## 1. Answer feedback

```tsx
const state = !done ? 'idle' : isAnswer ? 'right' : opt === picked ? 'wrong' : 'dim'
<motion.button
  initial={{ opacity: 0, y: 16 }}
  animate={
    state === 'wrong'
      ? { opacity: 1, y: 0, x: [0, -12, 12, -8, 8, -4, 0], transition: { duration: 0.45 } } // shake, decaying
      : state === 'right'
        ? { opacity: 1, y: 0, scale: [1, 1.05, 1], transition: { duration: 0.4 } }         // pop
        : { opacity: state === 'dim' ? 0.45 : 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 28, delay: 0.08 + i * 0.05 } } // staggered entry
  }
  whileTap={done ? undefined : { scale: 0.97 }}
  className="transition-colors …" // colors change via CSS transition, not Motion
/>
```

On pick: right → `sfx.correct()`, `haptic([8, 30, 8])`, `burstFrom(buttonEl, 36)`, auto-advance after ~1.1s. Wrong → `sfx.wrong()`, `haptic([30, 40, 30])`, wait for the user.

To shake a whole row again on every wrong attempt, change its `key` (`key={shakeCount}`) so the keyframes restart.

## 2. Feedback panel from the bottom

```tsx
<AnimatePresence>
  {done && (
    <motion.div
      initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className={`absolute inset-x-0 bottom-0 z-10 rounded-t-[32px] px-6 pt-5 pb-[max(env(safe-area-inset-bottom),12px)] ${correct ? 'bg-green-100' : 'bg-red-100'}`}
    >…</motion.div>
  )}
</AnimatePresence>
```

## 3. Per-letter slots

```tsx
<motion.span
  key={i}
  animate={result === 'right' ? { y: [0, -10, 0] } : got ? { scale: [1.25, 1] } : { scale: 1 }}
  transition={result === 'right' ? { delay: i * 0.04, duration: 0.4 } : { type: 'spring', stiffness: 600, damping: 15 }}
/>
```

Each typed letter pops (1.25 → 1). When the word is right, letters jump in a wave (delay by index).

## 4. Sliding active pill

```tsx
<button className="relative …">
  {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/12" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
  <motion.span animate={{ y: active ? -1 : 0, scale: active ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="relative">
    <Icon />
  </motion.span>
</button>
```

One `layoutId` per nav; use a different id for a second nav (e.g. `side-pill`) that can be mounted at the same time.

## 5. Shared element list → detail

Give the same `layoutId` to the icon in the list card and in the detail header: `layoutId={\`deck-icon-${id}\`}`. Motion morphs it across the route change. Works with AnimatedRoutes because both pages are mounted during the transition.

## 6. Accordion

```tsx
<motion.div layout="position">                {/* the row; siblings slide when it grows */}
  <Header onClick={toggle} />
  <AnimatePresence initial={false}>
    {open && (
      <motion.div
        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 36 }}
      >
        <div className="px-4 pb-4">…</div>   {/* padding inside, not on the animated div */}
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

The parent needs `overflow-hidden`.

## 7. Swap content in place

```tsx
<AnimatePresence mode="popLayout">
  <motion.span key={icon} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 40 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
    {icon}
  </motion.span>
</AnimatePresence>
```

For steps / slides that move forward: enter `{ opacity: 0, x: 60 }`, exit `{ opacity: 0, x: -60, transition: { duration: 0.2 } }`, with `initial={false}` on AnimatePresence so the first one does not animate.

## 8. Counter badge that re-pops

```tsx
<AnimatePresence mode="popLayout">
  {combo >= 2 ? (
    <motion.span key={combo} initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
      🔥x{combo}
    </motion.span>
  ) : (
    <motion.span key="count" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{pos}/{total}</motion.span>
  )}
</AnimatePresence>
```

Changing `key` to the value makes it pop on every increment.

## 9. Milestone flash with shine

Fire at 3, 6, 9, then every 5: `if (n >= 3 && n % (n >= 10 ? 5 : 3) === 0) { sfx.combo(); setFlash(n) }`.

```tsx
<AnimatePresence>
  {flash > 0 && (
    <motion.div
      key={flash}
      className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center"
      initial={{ scale: 0.4, opacity: 0, y: -28 }} animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: -16, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 520, damping: 16 }}
      onAnimationComplete={() => setTimeout(() => setFlash(0), 700)}
    >
      <span className="relative flex items-center gap-1.5 overflow-hidden rounded-full bg-black py-1.5 pl-2 pr-4 font-extrabold text-white">
        <motion.span initial={{ rotate: -25, scale: 0.6 }} animate={{ rotate: [-25, 14, -8, 0], scale: [0.6, 1.3, 1] }} transition={{ duration: 0.6, ease: 'easeOut' }}>🔥</motion.span>
        Combo x{flash}!
        <motion.span aria-hidden className="absolute inset-y-0 w-10 -skew-x-12 bg-white/25"
          initial={{ left: '-20%' }} animate={{ left: '120%' }} transition={{ duration: 0.7, delay: 0.15, ease: 'easeInOut' }} />
      </span>
    </motion.div>
  )}
</AnimatePresence>
```

## 10. Splash

```tsx
// Wrapper: <AnimatePresence>{showSplash && <Splash key="splash" />}</AnimatePresence>
<motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black"
  exit={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }} transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}>
  <FloatingDots />
  {/* bubbles: spring in with rotation, then bob forever (different props get different transitions) */}
  {BUBBLES.map((b, i) => (
    <motion.span key={b.name}
      initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0, y: [0, -8, 0] }}
      transition={{
        scale: { type: 'spring', stiffness: 260, damping: 12, delay: 0.08 + i * 0.12 },
        rotate: { type: 'spring', stiffness: 200, damping: 12, delay: 0.08 + i * 0.12 },
        y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 + i * 0.2 },
      }} />
  ))}
  {/* title letter by letter */}
  <div className="flex text-4xl font-extrabold" aria-label={name}>
    {name.split('').map((ch, i) => (
      <motion.span key={i} initial={{ y: 30, opacity: 0, rotate: 8 }} animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.35 + i * 0.045 }}>{ch}</motion.span>
    ))}
  </div>
  {/* loading dots */}
  {[0, 1, 2].map((i) => (
    <motion.span key={i} className="h-2 w-2 rounded-full bg-white/70"
      animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
  ))}
</motion.div>
```

## 11. Result hero

```tsx
useEffect(() => { sfx.complete(); if (accuracy >= 0.5) celebrate() }, [])
<motion.div initial={{ scale: 0, rotate: -30, y: 40 }} animate={{ scale: 1, rotate: 0, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 11, delay: 0.1 }}>
  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>🏆</motion.div>
</motion.div>
<motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Great!</motion.h1>
{/* stat cards: stagger.parent / stagger.child, numbers with <CountUp>, accuracy with <ProgressRing> */}
```

The outer element does the entry, the inner one the loop: never put a spring entry and an infinite loop on the same prop of one element.

## 12. Breathing hint

```tsx
<motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>Tap to flip</motion.p>
```

## 13. CTA that bounces while there is work

```tsx
<motion.button whileTap={{ scale: 0.88, rotate: -8 }}
  animate={pending > 0 ? { y: [0, -3, 0] } : undefined}
  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
  {pending > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 …">{pending > 99 ? '99+' : pending}</motion.span>}
</motion.button>
```

## 14. Horizontal carousel entering

```tsx
<motion.button initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }}
  transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.08 + index * 0.07 }}
  whileTap={{ scale: 0.96 }} whileHover={{ y: -4 }} className="snap-start transition-shadow hover:shadow-xl" />
```

Grid tiles: `initial={{ opacity: 0, y: 24, scale: 0.94 }}`, delay `Math.min(index, 10) * 0.05` (cap so long lists do not wait), add `layout` so tiles slide when one is removed.

## 15. Hover lift / tilt

`whileHover={{ y: -5, rotate: -1 }}` on tiles, `whileHover={{ rotate: -12, scale: 1.1 }}` on a logo, plus a CSS `transition-shadow hover:shadow-…` for the shadow (cheaper than animating box-shadow in Motion).

## 16. Listening button with rings

```tsx
<motion.button whileTap={{ scale: 0.9 }} className="relative grid h-28 w-28 place-items-center rounded-full bg-sky-200">
  {[0, 1].map((i) => (
    <motion.span key={i} className="absolute inset-0 rounded-full bg-sky-200"
      animate={playing ? { scale: [1, 1.6], opacity: [0.7, 0] } : { scale: 1, opacity: 0 }}
      transition={{ duration: 1.3, repeat: playing ? Infinity : 0, delay: i * 0.45 }} />
  ))}
  <span className="relative grid h-20 w-20 place-items-center rounded-full bg-black text-white">🔊</span>
</motion.button>
```
