import type { ApplicationStatus, EnvironmentStatus } from "./types.ts"

type Tone = "ok" | "info" | "warn" | "error" | "muted"

const APP_STATUS_TONE: Record<ApplicationStatus, Tone> = {
  Running: "ok",
  Installing: "info",
  Upgrading: "info",
  Starting: "warn",
  Stopped: "muted",
  Failed: "error",
  Removing: "error",
}

const ENV_STATUS_TONE: Record<EnvironmentStatus, Tone> = {
  Ready: "ok",
  Provisioning: "info",
  Degraded: "warn",
  Deleting: "error",
}

export function applicationStatusTone(status: ApplicationStatus): Tone {
  return APP_STATUS_TONE[status]
}

export function environmentStatusTone(status: EnvironmentStatus): Tone {
  return ENV_STATUS_TONE[status]
}
