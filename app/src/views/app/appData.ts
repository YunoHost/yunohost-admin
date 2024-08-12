import type { AppLevel, AppState } from '@/types/core/api'

export function formatAppQuality(app: { state: AppState; level: AppLevel }) {
  const variants = {
    working: 'success',
    lowquality: 'warning',
    inprogress: 'danger',
    broken: 'danger',
    thirdparty: 'danger',
  } as const
  const working = app.state === 'working'
  const state: keyof typeof variants =
    working && app.level <= 0
      ? 'broken'
      : working && app.level <= 4
        ? 'lowquality'
        : app.state
  return { state, variant: variants[state] }
}
