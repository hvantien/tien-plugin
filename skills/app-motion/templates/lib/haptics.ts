import { feedbackPrefs } from './feedback-prefs'

/**
 * Light vibration on Android. iOS Safari has no Vibration API, so it silently does nothing.
 * Patterns used: 4–6 tap/flip, 14 neutral answer, [8, 30, 8] correct, [30, 40, 30] wrong.
 */
export function haptic(pattern: number | number[] = 8) {
  if (!feedbackPrefs.haptics) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // not supported
  }
}
