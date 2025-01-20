import { v4 as uuid } from 'uuid'

import { useCache, type StorePath } from '@/composables/data'
import { useInfos } from '@/composables/useInfos'
import { useRequests } from '@/composables/useRequests'
import { useSettings } from '@/composables/useSettings'
import type { Obj } from '@/types/commons'
import { APIBadRequestError, APIErrorLog, APIUnauthorizedError } from './errors'
import { getError, getResponseData } from './handlers'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type HumanKey = {
  key: string
  [propName: string]: any
}

export type APIQuery = {
  uri: string
  method?: RequestMethod
  cachePath?: StorePath
  cacheForce?: boolean
  data?: Obj
  showModal?: boolean
  ignoreError?: boolean
  isAction?: boolean
  initial?: boolean
}

export type APIErrorData = {
  error: string
  error_key?: string
  log_ref?: string
  traceback?: string
  name?: string
}

/**
 * Converts an object literal into an `URLSearchParams` that can be turned into a
 * query string or used as a body in a `fetch` call.
 *
 * @param obj - An object literal to convert to `FormData` or `URLSearchParams`
 * @param addLocale - Append the locale to the returned object
 * @param formData - Returns a `FormData` instead of `URLSearchParams`
 */
export function objectToParams(obj: Obj, { formData = false } = {}) {
  const urlParams = formData ? new FormData() : new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      value.forEach((v) => urlParams.append(key, v))
    } else {
      urlParams.append(key, value)
    }
  }
  return urlParams
}

export default {
  options: {
    credentials: 'include',
    mode: 'cors',
    headers: {
      // FIXME is it important to keep this previous `Accept` header ?
      // 'Accept': 'application/json, text/javascript, */*; q=0.01',
      // Auto header is :
      // "Accept": "*/*",

      'X-Requested-With': 'XMLHttpRequest',
    },
  } as RequestInit,

  /**
   * Generic method to fetch the api.
   *
   * @param uri - URI to fetch
   * @param cachePath - Cache path to get or store data
   * @param cacheParams - Cache params to get or update data
   * @param method - An HTTP method in `'GET' | 'POST' | 'PUT' | 'DELETE'`
   * @param data - Data to send as body
   * @param showModal - Lock view and display the waiting modal
   * @param isAction - Expects to receive server messages
   * @param initial - If an error occurs, the dismiss button will trigger a go back in history
   *
   * @returns Promise that resolve the api response data
   * @throws Throw an `APIError` or subclass depending on server response
   */
  async fetch<T>({
    uri,
    method = 'GET',
    cachePath = undefined,
    cacheForce = false,
    data = undefined,
    showModal = method !== 'GET',
    ignoreError = false,
    isAction = method !== 'GET',
    initial = false,
  }: APIQuery): Promise<T> {
    const cache = cachePath ? useCache<T>(method, cachePath) : undefined
    if (!cacheForce && method === 'GET' && cache?.content.value !== undefined) {
      return cache.content.value
    }

    const { locale } = useSettings()
    const { startRequest, endRequest } = useRequests()

    // Try to find a description for an API route to display in history and modals

    const request = startRequest({
      id: uuid(),
      method,
      uri,
      date: Date.now(),
      initial,
      showModal,
      isAction,
    })

    let options = { ...this.options }
    Object.assign(options.headers!, {
      locale: locale.value,
      'ref-id': request.id,
    })

    if (method !== 'GET') {
      options = {
        ...options,
        method,
        body: data ? objectToParams(data, { formData: true }) : null,
      }
    }

    const response = await fetch('/yunohost/api/' + uri, options)

    if (!response.ok) {
      const errorData = await getResponseData<string | APIErrorData>(response)
      const err = getError(request, response, errorData)
      endRequest({
        request,
        success: false,
        showError: !(
          err instanceof APIBadRequestError ||
          err instanceof APIUnauthorizedError ||
          err instanceof APIErrorLog ||
          ignoreError
        ),
      })
      throw err
    }

    const responseData = await getResponseData<T>(response)
    cache?.update(responseData)
    endRequest({ request, success: true })

    if (cache) return cache.content.value as T
    return responseData
  },

  /**
   * Api multiple queries helper.
   * Those calls will act as one (declare optional waiting for one but still create history entries for each)
   * Calls are synchronous since the API can't handle multiple calls.
   *
   * @param queries - Array of {@link APIQuery}
   * @param showModal - Show the waiting modal until every queries have been resolved
   * @param initial - Inform that thoses queries are required for a view to be displayed
   *
   * @returns Promise that resolves an array of server responses
   * @throws Throw an `APIError` or subclass depending on server response
   */
  async fetchAll<T extends any[] = any[]>(
    queries: APIQuery[],
    { showModal = false, initial = true } = {},
  ): Promise<T> {
    const results = []
    for (const query of queries) {
      if (showModal) query.showModal = true
      if (initial) query.initial = true
      results.push(await this.fetch(query))
    }

    return results as T
  },

  /**
   * Api get helper function.
   *
   * @param query - a simple string for uri or complete APIQuery object {@link APIQuery}
   *
   * @returns Promise that resolve the api response data or an error
   * @throws Throw an `APIError` or subclass depending on server response
   */
  get<T>(query: string | Omit<APIQuery, 'method' | 'data'>): Promise<T> {
    return this.fetch(typeof query === 'string' ? { uri: query } : query)
  },

  /**
   * Api post helper function.
   *
   * @param query - {@link APIQuery}
   *
   * @returns Promise that resolve the api response data or an error
   * @throws Throw an `APIError` or subclass depending on server response
   */
  post<T>(query: Omit<APIQuery, 'method'>): Promise<T> {
    return this.fetch({ ...query, method: 'POST' })
  },

  /**
   * Api put helper function.
   *
   * @param query - {@link APIQuery}
   *
   * @returns Promise that resolve the api response data or an error
   * @throws Throw an `APIError` or subclass depending on server response
   */
  put<T>(query: Omit<APIQuery, 'method'>): Promise<T> {
    return this.fetch({ ...query, method: 'PUT' })
  },

  /**
   * Api delete helper function.
   *
   * @param query - {@link APIQuery}
   *
   * @returns Promise that resolve the api response data or an error
   * @throws Throw an `APIError` or subclass depending on server response
   */
  delete<T>(query: Omit<APIQuery, 'method'>): Promise<T> {
    return this.fetch({ ...query, method: 'DELETE' })
  },

  refetch() {
    // To force a view to reload and refetch initial data, we simply fake update
    // the router key
    const { updateRouterKey } = useInfos()
    updateRouterKey()
  },
}
