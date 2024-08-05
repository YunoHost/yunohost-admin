export type UserItem = {
  username: string
  fullname: string
  mail: string
  'mailbox-quota': string
  groups: string[]
}
export type UserDetails = {
  username: string
  fullname: string
  mail: string
  'mail-aliases': string[]
  'mail-forward': string[]
  'mailbox-quota': { limit: string; use: string }
}
export type Permission = {
  allowed: string[]
  corresponding_users: string[]
  auth_header: boolean
  label: string
  show_tile: boolean
  protected: boolean
  url: string | null
  additional_urls: string[]
}
export type Group = {
  members: string[]
  permissions: string[]
}
export type DomainDetail = {
  certificate: {
    subject: string
    CA_name: string
    CA_type: string // enumlike
    validity: number
    style: string // enumlike
    summary: string // enum
    ACME_eligible: boolean
  }
  registrar: string // or null ?
  apps: { name: string; id: string; path: string }[]
  main: boolean
  topest_parent: string | null
}
