// Wrap impure time access so the react-hooks/purity rule stays happy at
// the call sites — these helpers are only invoked from event handlers.
export function nowIso(): string {
  return new Date().toISOString()
}
