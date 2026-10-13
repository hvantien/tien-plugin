import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * Native-feeling page transitions for react-router.
 * - Between tabs: slide in the tab's direction.
 * - Into a sub-page: slide from the right; Back (POP): reverse.
 * - The old page only moves part of the way and fades, which gives depth.
 * - Desktop (vertical sidebar): tabs slide vertically, shorter distances.
 *
 * The parent must be `relative` with a fixed height; each page fills it (`absolute inset-0`)
 * and scrolls inside itself.
 */
type Move = { dir: number; desktop: boolean; tab: boolean }

// Animate one `transform` string (not separate x/y/scale) so Motion can run it with the
// Web Animations API on the compositor: while React is busy mounting the new page on the
// main thread, the slide still does not stutter.
const tf = (x: string, y: string, s: number) => `translate3d(${x}, ${y}, 0) scale(${s})`
const leave = { duration: 0.2, ease: [0.4, 0, 1, 1] as const }

const page: Variants = {
  enter: ({ dir, desktop, tab }: Move) =>
    !desktop
      ? { transform: tf(dir > 0 ? '38%' : '-38%', '0px', 0.985), opacity: 0 }
      : tab
        ? { transform: tf('0%', dir > 0 ? '64px' : '-64px', 0.99), opacity: 0 }
        : { transform: tf(dir > 0 ? '80px' : '-80px', '0px', 0.99), opacity: 0 },
  center: { transform: tf('0%', '0px', 1), opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 34, mass: 0.9 } },
  exit: ({ dir, desktop, tab }: Move) =>
    !desktop
      ? { transform: tf(dir > 0 ? '-22%' : '22%', '0px', 0.985), opacity: 0, transition: { ...leave, duration: 0.22 } }
      : tab
        ? { transform: tf('0%', dir > 0 ? '-32px' : '32px', 0.99), opacity: 0, transition: leave }
        : { transform: tf(dir > 0 ? '-40px' : '40px', '0px', 0.99), opacity: 0, transition: leave },
}

/**
 * Usage:
 *   <AnimatedRoutes tabs={['/', '/decks', '/me']} desktop={isDesktop}>
 *     {(location) => <Routes location={location}>…</Routes>}
 *   </AnimatedRoutes>
 * Passing `location` to <Routes> is required: the exiting page must keep rendering its old route.
 */
export function AnimatedRoutes({
  tabs,
  desktop = false,
  children,
}: {
  tabs: readonly string[]
  desktop?: boolean
  children: (location: ReturnType<typeof useLocation>) => ReactNode
}) {
  const location = useLocation()
  const navType = useNavigationType()
  const prev = useRef(location.pathname)

  const move = useMemo((): Move => {
    const a = tabs.indexOf(prev.current)
    const b = tabs.indexOf(location.pathname)
    if (a >= 0 && b >= 0) return { dir: b > a ? 1 : -1, desktop, tab: true }
    return { dir: navType === 'POP' ? -1 : 1, desktop, tab: false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, desktop])
  useEffect(() => {
    prev.current = location.pathname
  }, [location.pathname])

  return (
    <AnimatePresence custom={move} initial={false}>
      <motion.div key={location.pathname} custom={move} variants={page} initial="enter" animate="center" exit="exit" className="absolute inset-0 will-change-transform">
        {children(location)}
      </motion.div>
    </AnimatePresence>
  )
}
