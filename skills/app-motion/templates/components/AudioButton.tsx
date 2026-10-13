import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { haptic } from '../lib/haptics'

/** Four bars that bounce like an equalizer while `active`; settle to a static wave otherwise. */
export function SoundBars({ active, className = 'bg-current' }: { active: boolean; className?: string }) {
  return (
    <span className="flex h-4 items-center gap-[3px]" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className={`w-[3px] rounded-full ${className}`}
          animate={active ? { height: ['30%', '100%', '45%', '85%', '30%'] } : { height: ['40%', '70%', '55%', '90%'][i] }}
          transition={active ? { duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' } : { duration: 0.3 }}
        />
      ))}
    </span>
  )
}

/**
 * Round play button: while `playing`, a ring pulses outward and the icon becomes SoundBars.
 * The app owns the audio; pass `playing` from its player state.
 */
export function AudioButton({
  playing,
  onPlay,
  size = 40,
  className = 'bg-black text-white',
  label = 'Play',
  icon,
}: {
  playing: boolean
  onPlay: () => void
  size?: number
  className?: string
  label?: string
  icon?: ReactNode
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.86 }}
      onClick={(e) => {
        e.stopPropagation()
        haptic(6)
        onPlay()
      }}
      className={`relative grid shrink-0 place-items-center rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {playing && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-current"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {playing ? <SoundBars active /> : (icon ?? '🔊')}
    </motion.button>
  )
}
