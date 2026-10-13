import { useEffect, useRef, useState, type ReactNode } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { sfx } from '../lib/sfx'
import { haptic } from '../lib/haptics'

export type Swipe = 'left' | 'right' | 'down'

/**
 * Wrap buttons that sit on the card (speaker, links…). Motion attaches drag/tap with native
 * addEventListener, so React's stopPropagation (runs at the root) is too late: a tap on the
 * button would also flip the card. A native pointerdown listener stops it in time.
 */
export function NoDrag({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    const stop = (e: Event) => e.stopPropagation()
    el?.addEventListener('pointerdown', stop)
    return () => el?.removeEventListener('pointerdown', stop)
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/**
 * Tinder-style card with a 3D flip. Tap / Space = flip, drag right = yes, drag left = no,
 * ArrowDown = middle answer (card drops). The further you drag, the more it tilts, tints and
 * shows the stamp; past the threshold it flies off screen, then `onSwipe` fires.
 * Re-mount with a new `key` for the next card.
 */
export function SwipeCard({
  front,
  back,
  onSwipe,
  yesLabel = 'YES',
  noLabel = 'NO',
}: {
  front: ReactNode
  back: ReactNode
  onSwipe: (dir: Swipe) => void
  yesLabel?: string
  noLabel?: string
}) {
  const [flipped, setFlipped] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-16, 16])
  const yesOpacity = useTransform(x, [24, 110], [0, 1])
  const noOpacity = useTransform(x, [-110, -24], [1, 0])
  const tint = useTransform(x, [-160, 0, 160], ['rgba(251,211,211,.55)', 'rgba(255,255,255,0)', 'rgba(201,242,212,.6)'])

  async function fly(dir: Swipe) {
    if (leaving) return
    setLeaving(true)
    haptic(dir === 'right' ? [8, 30, 8] : 14)
    if (dir === 'right') sfx.correct()
    else if (dir === 'left') sfx.wrong()
    else sfx.pop()
    const w = window.innerWidth
    // Accelerating ease (no spring): the card leaves, it should not bounce back.
    if (dir === 'down') await animate(y, 700, { duration: 0.35, ease: [0.4, 0, 1, 1] })
    else await animate(x, dir === 'right' ? w : -w, { duration: 0.32, ease: [0.4, 0, 1, 1] })
    onSwipe(dir)
  }

  function flip() {
    if (leaving) return
    sfx.flip()
    haptic(4)
    setFlipped((f) => !f)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        flip()
      } else if (e.key === 'ArrowRight') void fly('right')
      else if (e.key === 'ArrowLeft') void fly('left')
      else if (e.key === 'ArrowDown') void fly('down')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const face = 'backface-hidden absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[34px] p-6 text-center shadow-[0_24px_50px_-28px_rgba(0,0,0,.45)]'

  return (
    <div className="relative h-full min-h-[360px]" style={{ perspective: 1200 }}>
      <motion.div
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        style={{ x, y, rotate }}
        drag={leaving ? false : 'x'}
        dragElastic={0.9}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 110 || info.velocity.x > 650) void fly('right')
          else if (info.offset.x < -110 || info.velocity.x < -650) void fly('left')
        }}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onTap={flip}
      >
        <motion.div className="preserve-3d relative h-full w-full" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
          <div className={`${face} bg-white`}>
            <motion.div className="pointer-events-none absolute inset-0" style={{ background: tint }} />
            <div className="relative">{front}</div>
            <motion.span style={{ opacity: yesOpacity }} className="absolute left-6 top-8 -rotate-12 rounded-xl border-[3px] border-green-500 px-3 py-1 text-xl font-extrabold text-green-500">
              {yesLabel}
            </motion.span>
            <motion.span style={{ opacity: noOpacity }} className="absolute right-6 top-8 rotate-12 rounded-xl border-[3px] border-red-500 px-3 py-1 text-xl font-extrabold text-red-500">
              {noLabel}
            </motion.span>
          </div>
          <div className={`${face} bg-neutral-900 text-white`} style={{ transform: 'rotateY(180deg)' }}>
            <motion.div className="pointer-events-none absolute inset-0" style={{ background: tint }} />
            <div className="relative">{back}</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
