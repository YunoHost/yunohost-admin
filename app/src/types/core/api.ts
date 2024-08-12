import type { Obj, Translation } from '@/types/commons'

// APPS

export type AppLevel = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type AppState = 'working' | 'inprogress' | 'thirdparty'
export type AppUpstream = {
  license?: string | null
  website?: string | null
  demo?: string | null
  admindoc?: string | null
  userdoc?: string | null
  code?: string | null
  cpe?: string | null
}
export type AppMinManifest = {
  packaging_format: 1 | 2
  id: string
  name: string
  description: Translation
  version: string
  maintainers: string[]
  integration: {
    architectures: string | string[]
    ldap: 'not_relevant' | boolean
    sso: 'not_relevant' | boolean
    multi_instance: boolean
    disk: string
    ram: { build: string; runtime: string }
    yunohost: string
  }
  upstream: AppUpstream
}
type CatalogApp = {
  added_in_catalog: number
  antifeatures: string[]
  category: string
  featured: boolean
  git: {
    branch: string
    revision: string
    url: string | null
  } | null
  high_quality: boolean
  id: string
  lastUpdate: number
  level: AppLevel
  logo_hash: string | null
  maintained: boolean
  manifest: AppMinManifest
  potential_alternative_to: string[]
  state: AppState
  subtags: string[]
  repository: string
  installed: boolean
}

export type Catalog = {
  apps: Obj<CatalogApp>
  categories: {
    description: string
    icon: string
    id: string
    subtags: { id: string; title: string }[]
    title: string
  }[]
  antifeatures: {
    description: string
    icon: string
    id: string
    title: string
  }[]
}
