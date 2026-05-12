import { useState } from "react"
import { Button } from "@cozystack/ui"
import { Modal } from "../Modal.tsx"
import { FormField, inputClass } from "../FormField.tsx"
import type { TemplateCategory } from "../../lib/types.ts"

const SLUG_RE = /^[a-z]([-a-z0-9]*[a-z0-9])?$/

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "cms", label: "CMS" },
  { value: "nodejs", label: "Node.js" },
  { value: "php", label: "PHP" },
  { value: "static", label: "Static" },
  { value: "game", label: "Games" },
]

const ICON_CHOICES = ["🌐", "🛒", "🎮", "📦", "📄", "⚡", "🚀", "🔧", "💾", "🧩"]

export interface PublishedTemplateDraft {
  slug: string
  displayName: string
  subtitle: string
  category: TemplateCategory
  icon: string
}

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPublish: (draft: PublishedTemplateDraft) => void
}

export function PublishDialog({ open, onOpenChange, onPublish }: PublishDialogProps) {
  const [slug, setSlug] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [category, setCategory] = useState<TemplateCategory>("cms")
  const [icon, setIcon] = useState("📦")
  const [slugError, setSlugError] = useState<string | undefined>(undefined)

  const submit = () => {
    if (!SLUG_RE.test(slug)) {
      setSlugError("Use lowercase letters, digits and dashes; start with a letter.")
      return
    }
    onPublish({
      slug,
      displayName: displayName || slug,
      subtitle: subtitle || "Custom application template",
      category,
      icon,
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Publish Template"
      description="The template will appear in the App Store for any tenant"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            Publish to Store
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField
          label="Slug"
          required
          hint="Identifier used in URLs and the CRD spec"
          error={slugError}
        >
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              if (slugError) setSlugError(undefined)
            }}
            placeholder="my-app"
            className={inputClass}
          />
        </FormField>
        <FormField label="Display name" hint="Shown in the catalog">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="My App"
            className={inputClass}
          />
        </FormField>
        <FormField label="Subtitle">
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="One-line description"
            className={inputClass}
          />
        </FormField>
        <FormField label="Category">
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as TemplateCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Icon">
          <div className="flex flex-wrap gap-1.5">
            {ICON_CHOICES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={
                  "flex size-9 items-center justify-center rounded-md border text-lg transition-colors " +
                  (icon === emoji
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300")
                }
              >
                {emoji}
              </button>
            ))}
          </div>
        </FormField>
      </div>
    </Modal>
  )
}
