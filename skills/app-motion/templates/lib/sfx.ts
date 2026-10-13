import { feedbackPrefs } from './feedback-prefs'

/**
 * Sound effects synthesized with Web Audio: no audio files, tiny, works offline.
 * iOS needs the AudioContext unlocked inside the first user gesture: call `sfx.unlock()`
 * from a one-time pointerdown listener on the app root.
 */
let ctx: AudioContext | null = null
function audio() {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, opts: { type?: OscillatorType; gain?: number; to?: number } = {}) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + start
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(freq, t)
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.18, t + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function noise(start: number, dur: number, gain = 0.08) {
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + start
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = ac.createBufferSource()
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(1800, t)
  filter.frequency.exponentialRampToValueAtTime(600, t + dur)
  const g = ac.createGain()
  g.gain.setValueAtTime(gain, t)
  src.buffer = buf
  src.connect(filter).connect(g).connect(ac.destination)
  src.start(t)
}

const guard = (fn: () => void) => () => {
  if (feedbackPrefs.sfx) fn()
}

export const sfx = {
  /** Soft click for every button press. */
  tap: guard(() => tone(1100, 0, 0.05, { gain: 0.05, to: 700 })),
  /** Rising blip: something appeared / neutral answer. */
  pop: guard(() => tone(520, 0, 0.12, { gain: 0.12, to: 1040 })),
  /** Paper swish: card flip, page turn. */
  flip: guard(() => noise(0, 0.14, 0.06)),
  correct: guard(() => {
    tone(659, 0, 0.14, { type: 'triangle', gain: 0.2 })
    tone(988, 0.09, 0.24, { type: 'triangle', gain: 0.2 })
  }),
  wrong: guard(() => {
    tone(220, 0, 0.16, { type: 'square', gain: 0.05 })
    tone(175, 0.12, 0.22, { type: 'square', gain: 0.05 })
  }),
  /** Three-note arpeggio: streak / combo milestone. */
  combo: guard(() => [784, 988, 1175].forEach((f, i) => tone(f, i * 0.06, 0.12, { type: 'triangle', gain: 0.14 }))),
  /** Five-note fanfare: session finished. */
  complete: guard(() => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.3, { type: 'triangle', gain: 0.16 }))),
  unlock: () => audio(),
}
