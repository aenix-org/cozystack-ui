export function iconFor(slug: string): string {
  switch (slug) {
    case "wordpress":
      return "🌐"
    case "minecraft":
      return "🎮"
    case "cs2":
      return "🎯"
    case "static":
      return "📄"
    case "nodejs":
    case "nextjs":
      return "🟢"
    case "drupal":
      return "🟣"
    case "ghost":
      return "👻"
    default:
      return "📦"
  }
}

export function iconBg(slug: string): string {
  switch (slug) {
    case "wordpress":
      return "rgb(241 245 249)"
    case "minecraft":
    case "cs2":
      return "rgba(248,113,113,0.10)"
    case "nodejs":
    case "nextjs":
      return "rgba(62,207,142,0.10)"
    case "drupal":
      return "rgba(144,97,249,0.10)"
    default:
      return "rgb(241 245 249)"
  }
}

const TIER_BAR: Record<string, string> = {
  production: "bg-violet-500",
  staging: "bg-amber-500",
}

export function tierBarClass(envName: string): string {
  return TIER_BAR[envName] ?? "bg-slate-300"
}
