import confetti from 'canvas-confetti'

// Pastel palette plus one dark color so pieces stay visible on light backgrounds.
const COLORS = ['#c9f2d4', '#e4f5a1', '#fbe8a6', '#cdedfb', '#fbd3d3', '#0d0d0d']

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Small burst from an element's center (the button that was just answered correctly). */
export function burstFrom(el: Element | null, amount = 40) {
  if (reduced()) return
  const r = el?.getBoundingClientRect()
  const x = r ? (r.left + r.width / 2) / innerWidth : 0.5
  const y = r ? (r.top + r.height / 2) / innerHeight : 0.5
  void confetti({ particleCount: amount, spread: 70, startVelocity: 32, scalar: 0.9, ticks: 120, origin: { x, y }, colors: COLORS, disableForReducedMotion: true })
}

/** Result screen: two streams from the left and right edges for ~0.9s. */
export function celebrate() {
  if (reduced()) return
  const end = Date.now() + 900
  const frame = () => {
    void confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS })
    void confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}
