/**
 * Switches for sound effects and vibration, readable outside React. Wire them to the app's
 * settings: call `setFeedbackPrefs({ sfx: user.sfx, haptics: user.haptics })` when they change.
 */
export const feedbackPrefs = { sfx: true, haptics: true }

export function setFeedbackPrefs(next: Partial<typeof feedbackPrefs>) {
  Object.assign(feedbackPrefs, next)
}
