import { createGlobalState } from '@vueuse/core'
import { computed, reactive, ref, toValue, type MaybeRefOrGetter } from 'vue'

import type { RequestMethod } from '@/api/api'
import { isEmptyValue, isObjectLiteral } from '@/helpers/commons'
import { stratify } from '@/helpers/data/tree'
import type { Obj } from '@/types/commons'
import type {
  DomainDetail,
  Group,
  Permission,
  UserDetails,
  UserItem,
} from '@/types/core/data'
import { useSettings } from './useSettings'

function getNoDataMessage(key: DataKeys) {
  return `No data in cache: you should query '${key}' before.`
}

const useData = createGlobalState(() => {
  const users = ref<Obj<UserItem>>({})
  const userDetails = ref<Obj<UserDetails>>({})
  const groups = ref<Obj<Group>>({})
  const permissions = ref<Obj<Permission>>({})
  const mainDomain = ref<string | undefined>()
  const domains = ref<string[] | undefined>()
  const domainDetails = ref<Obj<DomainDetail>>({})

  function update(
    method: RequestMethod,
    payload: any,
    key: DataKeys,
    param?: string,
  ) {
    if (key === 'users') {
      if (method === 'GET') users.value = payload.users
      else if (method === 'POST')
        users.value[payload.username] = {
          ...payload,
          'mailbox-quota': 'Pas de quota',
          groups: [],
        }
    } else if (key === 'userDetails' && param) {
      if (method === 'GET' || method === 'PUT') {
        userDetails.value[param] = payload
      } else if (method === 'DELETE') {
        delete userDetails.value[param]
        delete users.value[param]
      }
    } else if (key === 'permissions') {
      if (method === 'GET') {
        permissions.value = payload.permissions
      } else if (method === 'PUT' && param) {
        permissions.value[param] = payload
      }
    } else if (key === 'groups') {
      if (method === 'GET') {
        groups.value = payload.groups
      } else if (method === 'POST') {
        groups.value[payload.name] = { members: [], permissions: [] }
      } else if (method === 'PUT' && param) {
        groups.value[param] = payload
      } else if (method === 'DELETE' && param) {
        delete groups.value[param]
      }
    } else if (key === 'domains') {
      if (method === 'GET') {
        domains.value = payload.domains
        mainDomain.value = payload.main
      } else if (param) {
        if (method === 'POST') {
          // FIXME api should at least return the domain name on
          domains.value?.push(param)
        } else if (method === 'PUT') {
          mainDomain.value = param
        } else if (method === 'DELETE') {
          domains.value?.splice(domains.value.indexOf(param), 1)
          delete domainDetails.value[param]
        }
      }
    } else if (key === 'mainDomain' && method === 'PUT' && param) {
      mainDomain.value = param
    } else if (key === 'domainDetails' && param && method === 'GET') {
      domainDetails.value[param] = payload
    } else {
      console.warn(
        `couldn't update the cache, key: ${key}, method: ${method}, param: ${param}`,
      )
    }
  }

  return {
    users,
    userDetails,
    groups,
    permissions,

    mainDomain,
    domains,
    domainDetails,

    update,
  }
})

export function useUsersAndGroups(username?: MaybeRefOrGetter<string>) {
  const { users, userDetails } = useData()
  return {
    users: computed(() => {
      const users_ = Object.values(users.value)
      if (!users_.length) throw new Error(getNoDataMessage('users'))
      return users_
    }),
    usernames: computed(() => {
      const usersnames = Object.keys(users.value)
      if (!usersnames.length) throw new Error(getNoDataMessage('users'))
      return usersnames
    }),
    user: computed(() => {
      if (!username)
        throw new Error(
          'You should pass a username to `useUsersAndGroups` to get its details',
        )
      return userDetails.value[toValue(username)]
    }),
  }
}

export function useDomains(domain_?: MaybeRefOrGetter<string>) {
  const { mainDomain, domains: domains_, domainDetails } = useData()

  const domains = computed(() => {
    if (!domains_.value) throw new Error(getNoDataMessage('domains'))
    return domains_.value
  })

  const orderedDomains = computed(() => {
    const splittedDomains = Object.fromEntries(
      domains.value.map((domain) => {
        // Keep the main part of the domain and the extension together
        // eg: this.is.an.example.com -> ['example.com', 'an', 'is', 'this']
        const domainParts = domain.split('.')
        domainParts.push(domainParts.pop()! + domainParts.pop()!)
        return [domain, domainParts.reverse()]
      }),
    )

    return domains.value.sort((a, b) =>
      splittedDomains[a] > splittedDomains[b] ? 1 : -1,
    )
  })

  function getParentDomain(domain: string, domains: string[], highest = false) {
    const method = highest ? 'lastIndexOf' : 'indexOf'
    let i = domain[method]('.')
    while (i !== -1) {
      const dn = domain.slice(i + 1)
      if (domains.includes(dn)) return dn
      i = domain[method]('.', i + (highest ? -1 : 1))
    }

    return null
  }

  return {
    maybeMainDomain: mainDomain,
    mainDomain: computed(() => {
      if (!mainDomain.value) throw new Error(getNoDataMessage('mainDomain'))
      return mainDomain.value
    }),
    domain: computed(() => {
      if (!domain_)
        throw new Error(
          'You should pass a domain name to `useDomains` to get its details',
        )
      const domain = domainDetails.value[toValue(domain_)]
      if (!domain) throw new Error(getNoDataMessage('domainDetails'))
      return domain
    }),
    domains,
    domainsAsChoices: computed(() => {
      return domains.value.map((domain) => ({
        value: domain,
        text: domain === mainDomain.value ? domain + ' ★' : domain,
      }))
    }),
    orderedDomains,
    domainsTree: computed(() => {
      const domains = orderedDomains.value
      const dataset = reactive(
        domains.map((domain) => ({
          // data to build a hierarchy
          name: domain,
          parent: getParentDomain(domain, domains),
          // utility data that will be used by `RecursiveListGroup` component
          to: { name: 'domain-info', params: { name: domain } },
          opened: true,
        })),
      )
      return stratify(dataset)
    }),
  }
}

type StoreKeys = 'users' | 'permissions' | 'groups' | 'mainDomain' | 'domains'
type StoreKeysParam =
  | 'userDetails'
  | 'groups'
  | 'permissions'
  | 'mainDomain'
  | 'domainDetails'
  | 'domains'
type DataKeys = StoreKeys | StoreKeysParam
export type StorePath = `${StoreKeys}` | `${StoreKeysParam}.${string}`

export function useCache<T extends any = any>(
  method: RequestMethod,
  cachePath: StorePath,
) {
  const [key, param] = cachePath.split(/\.(.*)/s) as
    | [StoreKeys, undefined]
    | [StoreKeysParam, string]
  const data = useData()
  const { cache } = useSettings()

  return {
    content: computed(() => {
      if (!cache.value) return undefined
      if (!(key in data)) {
        throw new Error('Trying to get cache of inexistant data')
      }
      const d = data[key].value
      if (param) {
        if (isObjectLiteral(d) && !Array.isArray(d)) {
          return d[param] as T
        } else {
          return undefined as T
          console.warn('Trying to get param on non object data')
        }
      }
      return (isEmptyValue(d) ? undefined : d) as T
    }),
    update: (payload: T) => {
      if (method === 'DELETE') {
        // Update the cache with a delay to avoid current view to error out since there's no data anymore
        setTimeout(() => {
          data.update(method, payload, key, param)
        }, 100)
      } else {
        data.update(method, payload, key, param)
      }
    },
  }
}

export function resetCache(keys: DataKeys[]) {
  const data = useData()
  for (const key of keys) {
    if (['domains', 'mainDomain'].includes(key)) {
      data[key].value = undefined
    } else {
      data[key].value = {}
    }
  }
}
