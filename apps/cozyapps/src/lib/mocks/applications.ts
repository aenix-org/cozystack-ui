import type { Application } from "../types.ts"

export const INITIAL_APPLICATIONS: Application[] = [
  {
    name: "my-blog",
    template: "WordPress",
    templateSlug: "wordpress",
    status: "Running",
    domain: "my-blog.example.com",
    environment: "production",
    createdAt: "2024-01-10T14:32:00Z",
    config: {
      "Site title": "My Awesome Blog",
      "Admin email": "admin@example.com",
      "Storage size": "10 GB",
      "Enable cache": "Yes",
    },
  },
  {
    name: "shop",
    template: "WooCommerce",
    templateSlug: "wordpress",
    status: "Installing",
    domain: "shop.example.com",
    environment: "production",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    config: {
      "Site title": "ACME Shop",
      "Storage size": "20 GB",
    },
  },
  {
    name: "minecraft-server",
    template: "Minecraft",
    templateSlug: "minecraft",
    status: "Running",
    environment: "staging",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    config: {
      "Server name": "ACME Gaming",
      "Max players": "20",
      "Game mode": "Survival",
      "Enable whitelist": "No",
      "Storage size": "10 GB",
    },
  },
  {
    name: "landing",
    template: "Static Site",
    templateSlug: "static",
    status: "Stopped",
    domain: "landing.example.com",
    environment: "production",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    config: {
      "Git repository": "https://github.com/example/landing",
    },
  },
]
