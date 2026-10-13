import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

type Toast = { id: number; icon?: ReactNode; title: string; body?: ReactNode; action?: { label: string; run: () => void }; tone?: 'dark' | 'light' }

let push: (t: Omit<Toast, 'id'>) => void = () => {}

/** Call from anywhere: `toast({ icon: '🎉', title: 'Saved' })`. Mount <Toaster /> once at the app root. */
export function toast(t: Omit<Toast, 'id'>) {
  push(t)
}

/**
 * Pill notifications that drop from the top on a spring, icon spins in, swipe up to dismiss.
 * At most 3 on screen; `layout` makes the others slide when one leaves.
 */
export function Toaster() {
  const [list, setList] = useState<Toast[]>([])
  useEffect(() => {
    push = (t) => {
      const id = Date.now() + Math.random()
      setList((l) => [...l.slice(-2), { ...t, id }])
      setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4800)
    }
  }, [])
  const dismiss = (id: number) => setList((l) => l.filter((x) => x.id !== id))

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),14px)] md:items-end md:px-8 md:pt-8">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ y: -80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.8, bottom: 0.1 }}
            onDragEnd={(_, info) => info.offset.y < -30 && dismiss(t.id)}
            className={`pointer-events-auto flex w-full max-w-[400px] items-center gap-3 rounded-[24px] px-3 py-2.5 shadow-xl ${
              t.tone === 'light' ? 'bg-white text-black' : 'bg-neutral-900 text-white'
            }`}
            role="status"
          >
            {t.icon && (
              <motion.span
                className="grid h-[38px] w-[38px] shrink-0 place-items-center text-2xl"
                initial={{ rotate: -30, scale: 0.4 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12, delay: 0.1 }}
              >
                {t.icon}
              </motion.span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold">{t.title}</p>
              {t.body && <div className="truncate text-[12px] opacity-70">{t.body}</div>}
            </div>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.run()
                  dismiss(t.id)
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${t.tone === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
