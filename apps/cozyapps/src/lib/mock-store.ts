import { useSyncExternalStore } from "react"
import type { Action, Application, Environment } from "./types.ts"
import { INITIAL_APPLICATIONS } from "./mocks/applications.ts"
import { INITIAL_ENVIRONMENTS } from "./mocks/environments.ts"
import { INITIAL_ACTIONS } from "./mocks/actions.ts"

interface State {
  applications: Application[]
  environments: Environment[]
  actions: Action[]
}

const state: State = {
  applications: [...INITIAL_APPLICATIONS],
  environments: [...INITIAL_ENVIRONMENTS],
  actions: [...INITIAL_ACTIONS],
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emit() {
  listeners.forEach((l) => l())
}

const snapshots = {
  applications: state.applications,
  environments: state.environments,
  actions: state.actions,
}

function getApplications() {
  return snapshots.applications
}

function getEnvironments() {
  return snapshots.environments
}

function getActions() {
  return snapshots.actions
}

export function useApplications(): Application[] {
  return useSyncExternalStore(subscribe, getApplications)
}

export function useEnvironments(): Environment[] {
  return useSyncExternalStore(subscribe, getEnvironments)
}

export function useActions(): Action[] {
  return useSyncExternalStore(subscribe, getActions)
}

export function addApplication(app: Application) {
  state.applications = [...state.applications, app]
  snapshots.applications = state.applications
  emit()
}

export function addEnvironment(env: Environment) {
  state.environments = [...state.environments, env]
  snapshots.environments = state.environments
  emit()
}

export function addAction(action: Action) {
  state.actions = [...state.actions, action]
  snapshots.actions = state.actions
  emit()
}

export function findApplication(name: string): Application | undefined {
  return state.applications.find((a) => a.name === name)
}
