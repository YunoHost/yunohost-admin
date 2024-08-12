import type { Obj, Translation } from '@/types/commons'
import type { Permission } from '@/types/core/data'
import type { AnyOption } from '@/types/core/options'

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

export type AppManifest = AppMinManifest & {
  upstream: AppUpstream
  install: AnyOption[]
  doc: {
    DESCRIPTION?: Translation
    ADMIN?: Translation
  } & Obj<Translation>
  notifications: {
    PRE_INSTALL: Obj<Translation> | null
    POST_INSTALL: Obj<Translation> | null
    PRE_UPGRADE: Obj<Translation> | null
    POST_UPGRADE: Obj<Translation> | null
  }
  requirements: Record<
    'required_yunohost_version' | 'arch' | 'install' | 'disk' | 'ram',
    {
      pass: boolean
      values: { current: string; required: string }
    }
  >
  resources: Obj
  remote: { type: string; url: string; branch: string; revision: string }
  lastUpdate: number
  quality: { level: AppLevel; state: AppState }
  antifeatures: string[]
  potential_alternative_to: string[]
  screenshot: string | null
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

export type AppInfo = {
  id: string
  description: string
  label: string
  name: string
  version: string
  domain_path: string
  logo: string | null
  screenshot?: string
  upgradable: string
  settings: { domain?: string; path?: string } & Obj
  setting_path: string
  permissions: Obj<Permission & { sublabel: string }>
  manifest: AppMinManifest & {
    install: Obj<AnyOption>
    upstream: {
      license: string | null
      website: string | null
      demo: string | null
      admindoc: string | null
      userdoc: string | null
      code: string | null
    }
    resources: Obj
    doc: {
      DESCRIPTION?: Translation
      ADMIN?: Translation
    } & Obj<Translation>
    notifications: {
      PRE_INSTALL: Obj<Translation> | null
      POST_INSTALL: Obj<Translation> | null
      PRE_UPGRADE: Obj<Translation> | null
      POST_UPGRADE: Obj<Translation> | null
    }
  }
  from_catalog: CatalogApp
  is_webapp: boolean
  is_default: boolean
  supports_change_url: boolean
  supports_backup_restore: boolean
  supports_multi_instance: boolean
  supports_config_panel: boolean
  supports_purge: boolean
}

export type AppList = { apps: AppInfo[] }

// BACKUP

export type BackupHookDataKeys =
  | 'data_xmpp'
  | 'data_multimedia'
  | 'data_mail'
  | 'data_home'
export type BackupHookKeys =
  | BackupHookDataKeys
  | 'conf_ynh_settings'
  | 'conf_ldap'
  | 'conf_manually_modified_files'
  | 'conf_ynh_certs'

export type BackupHooksList = {
  hooks: BackupHookKeys[]
}

export type BackupAppList = {
  apps: Pick<
    AppInfo,
    'description' | 'name' | 'version' | 'domain_path' | 'id'
  >[]
}

export type BackupInfo = {
  path: string
  created_at: string
  description: string
  size: number
  // TODO as array like everywhere else?
  apps: Obj<
    Pick<AppInfo, 'description' | 'name' | 'version'> & { size: number }
  >
  system: Record<BackupHookKeys, { paths: string[]; size: number }>
  from_yunohost_version: string
}

export type BackupList = {
  archives: Obj<{
    path: string
    created_at: string
    description: string
    size: number
  }>
}

// SERVICES

export type ServiceInfo = {
  status: 'running' | 'stopped' | 'failed' | 'unknown'
  start_on_boot: 'enabled' | 'disabled' | 'unknown'
  last_state_change: string | 'unknown'
  description: string
  configuration: 'valid' | 'broken' | 'unknown'
}
export type ServiceLogs = Obj<string[]>
export type ServiceList = Obj<ServiceInfo>

// DIAGNOSIS

export type Diagnosis = {
  reports: {
    id: string
    cached_for: number
    items: {
      meta: Obj
      status: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
      data: Obj
      summary: string
      details?: string[]
      ignored: boolean
    }[]
    timestamp: number
    description: string
  }[]
}

// FIREWALL

type Protocols = { TCP: number[]; UDP: number[] }
export type Firewall = {
  ipv4: Protocols
  ipv6: Protocols
  uPnP: Protocols & {
    TCP_TO_CLOSE: number[]
    UDP_TO_CLOSE: number[]
    enabled: boolean
  }
}

// DOMAINS

export type DNSRecord = {
  name: string
  type: string
  managed_by_yunohost: boolean
  old_content: string
  content: string
  spaces: string // Added when formating
}
export type DNSCategories = Record<
  'create' | 'update' | 'delete' | 'unchanged',
  DNSRecord[]
>
