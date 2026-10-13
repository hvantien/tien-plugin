import { useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls } from 'motion/react'

const mq = matchMedia('(min-width: 768px)')
const useIsDesktop = () =>
  useSyncExternalStore(
    (cb) => {
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => mq.matches,
  )

/**
 * Phone: bottom sheet that springs up; drag the handle down (or tap the backdrop) to close.
 * Desktop: centered dialog that rises and scales in slightly.
 *
 * Portaled to `container` (default document.body): if pages animate with transforms, a
 * z-index inside them can never cover the nav bar, so overlays must live outside.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  container,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  container?: Element | null
}) {
  const drag = useDragControls()
  const desktop = useIsDesktop()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center md:p-6" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="relative max-h-[88dvh] w-full overflow-hidden rounded-t-[32px] bg-white shadow-2xl md:max-h-[86dvh] md:max-w-[560px] md:rounded-[32px]"
            initial={desktop ? { y: 40, scale: 0.94, opacity: 0 } : { y: '100%' }}
            animate={desktop ? { y: 0, scale: 1, opacity: 1 } : { y: 0 }}
            exit={desktop ? { y: 24, scale: 0.96, opacity: 0, transition: { duration: 0.18 } } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: desktop ? 30 : 36 }}
            drag={desktop ? false : 'y'}
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose()
            }}
          >
            {/* Drag starts only from the handle / title, so the content can still scroll. */}
            <div className="flex cursor-grab touch-none justify-center pb-1 pt-3 md:hidden" onPointerDown={(e) => drag.start(e)}>
              <span className="h-1.5 w-11 rounded-full bg-black/12" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-6 pb-2 pt-1 md:px-7 md:pt-6" onPointerDown={(e) => !desktop && drag.start(e)}>
                <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                <button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-black/5">
                  ✕
                </button>
              </div>
            )}
            <div className="max-h-[calc(88dvh-80px)] overflow-y-auto overscroll-contain px-6 pb-[max(env(safe-area-inset-bottom),12px)] md:max-h-[calc(86dvh-90px)] md:px-7 md:pb-3">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    container ?? document.body,
  )
}
