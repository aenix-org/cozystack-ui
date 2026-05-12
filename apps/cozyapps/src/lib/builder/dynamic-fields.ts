import type { ParamDef } from "../types.ts"
import type { PortType } from "./port-types.ts"
import type { PortDef } from "./atoms.ts"

/**
 * Surface type seen by the launching user. Drives both the form input widget
 * and the port type the field emits on the User Input node in the builder.
 */
export type UserInputFieldType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "image"
  | "host"

export interface UserInputField {
  key: string
  label: string
  type: UserInputFieldType
  required?: boolean
  defaultValue?: string | number | boolean
  hint?: string
  options?: string[]
  placeholder?: string
}

export const FIELD_TYPE_OPTIONS: { value: UserInputFieldType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "enum", label: "Enum (one of)" },
  { value: "image", label: "Image reference" },
  { value: "host", label: "Hostname / domain" },
]

export function fieldToPort(field: UserInputField): PortDef {
  return { key: field.key, label: field.label, type: fieldPortType(field.type) }
}

export function fieldPortType(type: UserInputFieldType): PortType {
  switch (type) {
    case "number":
      return "number"
    case "boolean":
      return "boolean"
    case "image":
      return "image-ref"
    case "host":
      return "ingress-host"
    case "enum":
    case "string":
    default:
      return "string"
  }
}

export function fieldToParam(field: UserInputField): ParamDef {
  const paramType: ParamDef["type"] =
    field.type === "enum"
      ? "enum"
      : field.type === "number"
        ? "number"
        : field.type === "boolean"
          ? "boolean"
          : "string"
  return {
    key: field.key,
    label: field.label,
    type: paramType,
    required: field.required,
    defaultValue: field.defaultValue,
    hint: field.hint,
    options: field.options,
    placeholder: field.placeholder,
  }
}

const DEFAULT_KEYS_BASE = "field"

export function newField(existing: UserInputField[]): UserInputField {
  let counter = existing.length + 1
  let key = `${DEFAULT_KEYS_BASE}${counter}`
  while (existing.some((f) => f.key === key)) {
    counter += 1
    key = `${DEFAULT_KEYS_BASE}${counter}`
  }
  return {
    key,
    label: `Field ${counter}`,
    type: "string",
  }
}

export const DEFAULT_USER_INPUT_FIELDS: UserInputField[] = [
  {
    key: "host",
    label: "Public host",
    type: "host",
    required: true,
    placeholder: "app.example.com",
    hint: "DNS name the app will be served from",
  },
  {
    key: "name",
    label: "App name",
    type: "string",
    required: true,
    placeholder: "my-app",
  },
  {
    key: "image",
    label: "Container image",
    type: "image",
    placeholder: "wordpress:6.4",
  },
]
