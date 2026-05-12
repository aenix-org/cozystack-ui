export type ApplicationStatus =
  | "Running"
  | "Installing"
  | "Upgrading"
  | "Starting"
  | "Stopped"
  | "Failed"
  | "Removing"

export type EnvironmentStatus =
  | "Ready"
  | "Provisioning"
  | "Degraded"
  | "Deleting"

export type ActionStatus = "Pending" | "Running" | "Succeeded" | "Failed"

export type TemplateCategory = "cms" | "nodejs" | "php" | "static" | "game"

export interface Application {
  name: string
  template: string
  templateSlug: string
  status: ApplicationStatus
  domain?: string
  environment: string
  createdAt: string
  config: Record<string, unknown>
}

export type ParamType = "string" | "number" | "enum" | "boolean"

export interface ParamDef {
  key: string
  label: string
  type: ParamType
  section?: string
  placeholder?: string
  hint?: string
  required?: boolean
  options?: string[]
  defaultValue?: string | number | boolean
}

export interface TemplateAction {
  name: string
  description: string
}

export interface TemplateResources {
  cpu: number
  ramGb: number
  storageGb: number
}

export interface ApplicationTemplate {
  slug: string
  displayName: string
  version: string
  description: string
  subtitle: string
  categories: TemplateCategory[]
  icon: string
  iconBg: string
  maintainer: string
  lastUpdated: string
  resources: TemplateResources
  includedFeatures: string[]
  actions: TemplateAction[]
  parameters: ParamDef[]
}

export interface Environment {
  name: string
  status: EnvironmentStatus
  nodes: number
  cpu: number
  ramGb: number
  createdAt: string
}

export interface Action {
  id: string
  name: string
  applicationName: string
  status: ActionStatus
  createdAt: string
}
