import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { animate, motion, useInView, type HTMLMotionProps } from 'motion/react'
import { sfx } from '../lib/sfx'
import { haptic } from '../lib/haptics'

/* ------------------------------------------------------------------ spring presets */

/** Named springs so every component feels the same. Higher stiffness = snappier, lower damping = more bounce. */
export const spring = {
  /** Button press / tab pill: instant, almost no overshoot. */
  press: { type: 'spring', stiffness: 500, damping: 26 },
  /** Cards / list items entering. */
  enter: { type: 'spring', stiffness: 320, damping: 26 },
  /** Sheets / panels sliding. */
  sheet: { type: 'spring', stiffness: 380, damping: 36 },
  /** Playful pop with visible overshoot: badges, icons, trophies. */
  pop: { type: 'spring', stiffness: 300, damping: 12 },
  /** Slow fill: progress ring / bar. */
  fill: { type: 'spring', stiffness: 90, damping: 18 },
} as const

/** Children appear one after another. Usage: parent `variants={stagger.parent} initial="hidden" animate="show"`, child `variants={stagger.child}`. */
export const stagger = {
  parent: { hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } } },
  child: {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 380, damping: 30 } },
  },
}

/* ------------------------------------------------------------------ button */

type Ripple = { id: number; x: number; y: number; size: number }

/**
 * Button with press feedback: spring shrink, ripple from the touch point, a soft click and a
 * light vibration. Use it for every primary button so presses feel consistent.
 */
export function Pressable({
  children,
  className = '',
  ripple = true,
  sound = true,
  rippleColor = 'rgba(255,255,255,.35)',
  onPointerDown,
  onClick,
  ...rest
}: HTMLMotionProps<'button'> & { ripple?: boolean; sound?: boolean; rippleColor?: string }) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={spring.press}
      className={`relative overflow-hidden ${className}`}
      onPointerDown={(e) => {
        if (ripple) {
          const r = e.currentTarget.getBoundingClientRect()
          const size = Math.max(r.width, r.height) * 2.2
          const id = performance.now()
          setRipples((list) => [...list, { id, x: e.clientX - r.left - size / 2, y: e.clientY - r.top - size / 2, size }])
          setTimeout(() => setRipples((list) => list.filter((x) => x.id !== id)), 600)
        }
        onPointerDown?.(e)
      }}
      onClick={(e) => {
        if (sound) sfx.tap()
        haptic(6)
        onClick?.(e)
      }}
      {...rest}
    >
      {children as ReactNode}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute rounded-full"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size, background: rippleColor }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      ))}
    </motion.button>
  )
}

/* ------------------------------------------------------------------ decoration */

export type Dot = { c: string; s: number; x: string; y: string }

const DEFAULT_DOTS: Dot[] = [
  { c: '#c9f2d4', s: 46, x: '88%', y: '18%' },
  { c: '#e4f5a1', s: 30, x: '-3%', y: '30%' },
  { c: '#ffffff', s: 9, x: '62%', y: '30%' },
  { c: '#c9f2d4', s: 10, x: '72%', y: '55%' },
  { c: '#fbe8a6', s: 9, x: '92%', y: '70%' },
  { c: '#ffffff', s: 12, x: '14%', y: '62%' },
]

/**
 * Colored dots that pop in one by one, then drift forever. Put inside a `relative` dark header.
 * The drift is CSS (`animate-drift`, compositor), the pop-in is a one-off Motion spring.
 */
export function FloatingDots({ dots = DEFAULT_DOTS }: { dots?: Dot[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute motion-safe:animate-drift"
          style={{ left: d.x, top: d.y, '--drift-x': `${i % 3 ? -5 : 5}px`, '--drift-y': `${i % 2 ? 8 : -8}px`, '--drift-t': `${4.5 + i}s` } as CSSProperties}
        >
          <motion.span
            className="block rounded-full"
            style={{ background: d.c, width: d.s, height: d.s }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 + i * 0.06 }}
          />
        </span>
      ))}
    </div>
  )
}

/** Wraps an image / icon so it bobs up and down (CSS loop). Stagger several with `delay`. */
export function Float({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <span className={`inline-block motion-safe:animate-bob ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ numbers & progress */

const fmt = new Intl.NumberFormat()

/**
 * Counts from the previous value to `value` once it scrolls into view. Writes textContent
 * directly instead of setState, so it does not re-render React 60 times a second.
 */
export function CountUp({ value, className = '', grouped = true, duration = 1.1 }: { value: number; className?: string; grouped?: boolean; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const from = useRef(0)
  const show = (v: number) => (grouped ? fmt.format(Math.round(v)) : String(Math.round(v)))
  useEffect(() => {
    if (!inView || !ref.current) return
    const node = ref.current
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = show(v)
      },
    })
    from.current = value
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, grouped, duration])
  return (
    <span ref={ref} className={`tnum ${className}`}>
      {show(0)}
    </span>
  )
}

/** Circular progress (0..1) that fills with a slow spring. Content goes in the middle. */
export function ProgressRing({
  value,
  size = 64,
  stroke = 7,
  track = 'rgba(255,255,255,.15)',
  color = '#c9f2d4',
  children,
}: { value: number; size?: number; stroke?: number; track?: string; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - v) }}
          transition={{ type: 'spring', stiffness: 60, damping: 16, delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export function ProgressBar({ value, className = '', color = 'bg-black' }: { value: number; className?: string; color?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-black/8 ${className}`}>
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={spring.fill}
      />
    </div>
  )
}

/** Fade + rise for empty states and one-off blocks. */
export function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className={className}>
      {children}
    </motion.div>
  )
}
