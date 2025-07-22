// Modrinth API integration
const MODRINTH_API_BASE_URL = "https://api.modrinth.com/v2"

export interface ModrinthProject {
  slug: string
  title: string
  description: string
  categories: string[]
  project_type: "mod" | "modpack" | "resourcepack" | "shader"
  downloads: number
  icon_url: string | null
  gallery: string[]
  date_created: string
  date_modified: string
  versions: string[]
  follows: number
  author: string
}

export interface ModrinthSearchResponse {
  hits: ModrinthProject[]
  offset: number
  limit: number
  total_hits: number
}

export type ProjectType = "mod" | "modpack" | "resourcepack" | "shader" | "all"
export type SortIndex = "relevance" | "downloads" | "follows" | "newest" | "updated"

export interface SearchParams {
  query?: string
  projectType?: ProjectType
  categories?: string[]
  versions?: string[]
  index?: SortIndex
  offset?: number
  limit?: number
}

export const searchProjects = async (params: SearchParams = {}): Promise<ModrinthSearchResponse> => {
  const {
    query = "",
    projectType = "all",
    categories = [],
    versions = [],
    index = "relevance",
    offset = 0,
    limit = 20,
  } = params

  // Build facets array
  const facets: string[][] = []

  if (projectType !== "all") {
    facets.push([`project_type:${projectType}`])
  }

  if (categories.length > 0) {
    facets.push(categories.map((cat) => `categories:${cat}`))
  }

  if (versions.length > 0) {
    facets.push(versions.map((ver) => `versions:${ver}`))
  }

  const searchParams = new URLSearchParams({
    query,
    index,
    offset: offset.toString(),
    limit: limit.toString(),
  })

  if (facets.length > 0) {
    searchParams.append("facets", JSON.stringify(facets))
  }

  const response = await fetch(`${MODRINTH_API_BASE_URL}/search?${searchParams}`, {
    headers: {
      "User-Agent": "forum-website/1.0 (contact@forum.com)",
    },
  })

  if (!response.ok) {
    throw new Error(`Modrinth API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch a list of projects (convenience wrapper used by ResourceCenter).
 * Falls back to `getRandomProjects` if the search API returns nothing or fails.
 */
export const getProjects = async (params: SearchParams = {}): Promise<ModrinthProject[]> => {
  try {
    const { hits } = await searchProjects(params)
    if (Array.isArray(hits) && hits.length > 0) {
      return hits
    }
  } catch {
    /* ignore — we’ll fall back below */
  }

  // Fallback: return popular/random projects so UI always has data
  return getRandomProjects(params.limit ?? 20)
}

export const getRandomProjects = async (count = 8): Promise<ModrinthProject[]> => {
  // 1. First try the official random-projects endpoint.
  try {
    const res = await fetch(`${MODRINTH_API_BASE_URL}/projects/random?count=${count}`, {
      headers: {
        "User-Agent": "forum-website/1.0 (contact@forum.com)",
      },
      // A short timeout ensures we don’t block the UI for too long.
      next: { revalidate: 60 },
    })

    if (res.ok) {
      const json = (await res.json()) as ModrinthProject[]
      // Some older deployments of the API return an empty array → treat as failure
      if (Array.isArray(json) && json.length > 0) return json
    }
  } catch {
    /* swallow – we’ll fall back to the search endpoint below */
  }

  // 2. Fallback: use the search API (sorted by downloads) to simulate a “popular resources” list.
  //    This guarantees the Resource Center always has featured content.
  try {
    const fallback = await searchProjects({
      index: "downloads",
      limit: count,
    })
    return fallback.hits
  } catch {
    // If even the search fails propagate the error up so it’s handled by the caller.
    throw new Error("无法获取 Modrinth 随机项目，也无法从搜索端点获取备选数据")
  }
}

// Popular categories for different project types
export const CATEGORIES = {
  mod: ["technology", "adventure", "magic", "utility", "decoration", "food", "library"],
  modpack: ["adventure", "tech", "magic", "kitchen-sink", "lightweight", "hardcore"],
  resourcepack: ["realistic", "cartoon", "medieval", "modern", "simplistic", "photo-realistic"],
  shader: ["atmospheric", "realistic", "fantasy", "performance", "cinematic"],
}

// Common Minecraft versions
export const MINECRAFT_VERSIONS = [
  "1.20.4",
  "1.20.3",
  "1.20.2",
  "1.20.1",
  "1.20",
  "1.19.4",
  "1.19.3",
  "1.19.2",
  "1.19.1",
  "1.19",
  "1.18.2",
  "1.18.1",
  "1.18",
  "1.17.1",
  "1.17",
  "1.16.5",
  "1.16.4",
]
