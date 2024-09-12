import { useCache, type StorePath } from '@/composables/data'
import { useInfos } from '@/composables/useInfos'
import {
  useRequests,
  type APIRequestAction,
  type ReconnectingArgs,
} from '@/composables/useRequests'
import { useSettings } from '@/composables/useSettings'
import type { Obj } from '@/types/commons'
import {
  APIBadRequestError,
  APIErrorLog,
  APIUnauthorizedError,
  type APIError,
} from './errors'
import { getError, getResponseData, openWebSocket } from './handlers'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type HumanKey = {
  key: string
  [propName: string]: any
}

export type APIQuery = {
  method?: RequestMethod
  uri: string
  cachePath?: StorePath
  data?: Obj
  humanKey?: string | HumanKey
  showModal?: boolean
  ignoreError?: boolean
  websocket?: boolean
  initial?: boolean
  asFormData?: boolean
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
export function objectToParams(
  obj: Obj,
  { addLocale = false, formData = false } = {},
) {
  const urlParams = formData ? new FormData() : new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      value.forEach((v) => urlParams.append(key, v))
    } else {
      urlParams.append(key, value)
    }
  }
  if (addLocale) {
    const { locale } = useSettings()
    urlParams.append('locale', locale.value)
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
   * @param humanKey - Key and eventually some data to build the query's description
   * @param showModal - Lock view and display the waiting modal
   * @param websocket - Open a websocket connection to receive server messages
   * @param initial - If an error occurs, the dismiss button will trigger a go back in history
   * @param asFormData - Send the data with a body encoded as `"multipart/form-data"` instead of `"x-www-form-urlencoded"`)
   *
   * @returns Promise that resolve the api response data
   * @throws Throw an `APIError` or subclass depending on server response
   */
  async fetch<T extends any = any>({
    uri,
    method = 'GET',
    cachePath = undefined,
    data = undefined,
    humanKey = undefined,
    showModal = method !== 'GET',
    ignoreError = false,
    websocket = method !== 'GET',
    initial = false,
    asFormData = true,
  }: APIQuery): Promise<T> {
    const cache = cachePath ? useCache<T>(method, cachePath) : undefined
    if (method === 'GET' && cache?.content.value !== undefined) {
      return cache.content.value
    }

    const { locale } = useSettings()
    const { startRequest, endRequest } = useRequests()

    const request = startRequest({
      method,
      uri,
      humanKey,
      initial,
      showModal,
      websocket,
    })
    if (websocket) {
      await openWebSocket(request as APIRequestAction)
    }

    let options = { ...this.options }
    if (method === 'GET') {
      uri += `${uri.includes('?') ? '&' : '?'}locale=${locale.value}`
    } else {
      options = {
        ...options,
        method,
        body: data
          ? objectToParams(data, { addLocale: true, formData: asFormData })
          : null,
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
  get<T extends any = any>(
    query: string | Omit<APIQuery, 'method' | 'data'>,
  ): Promise<T> {
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
  post<T extends any = any>(query: Omit<APIQuery, 'method'>): Promise<T> {
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
  put<T extends any = any>(query: Omit<APIQuery, 'method'>): Promise<T> {
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
  delete<T extends any = any>(query: Omit<APIQuery, 'method'>): Promise<T> {
    return this.fetch({ ...query, method: 'DELETE' })
  },

  refetch() {
    // To force a view to reload and refetch initial data, we simply fake update
    // the router key
    const { updateRouterKey } = useInfos()
    updateRouterKey()
  },

  /**
   * Api reconnection helper. Resolve when server is reachable or fail after n attemps
   *
   * @param attemps - Number of attemps before rejecting
   * @param delay - Delay between calls to the API in ms
   * @param initialDelay - Delay before calling the API for the first time in ms
   *
   * @returns Promise that resolve yunohost version infos
   * @throws Throw an `APIError` or subclass depending on server response
   */
  tryToReconnect({
    attemps = 5,
    delay = 2000,
    initialDelay = 0,
  }: ReconnectingArgs = {}) {
    const { getYunoHostVersion } = useInfos()
    return new Promise((resolve, reject) => {
      function reconnect(n: number) {
        getYunoHostVersion()
          .then(resolve)
          .catch((err: APIError) => {
            if (err instanceof APIUnauthorizedError) {
              reject(err)
            } else if (n < 1) {
              reject(err)
            } else {
              setTimeout(() => reconnect(n - 1), delay)
            }
          })
      }
      if (initialDelay > 0) setTimeout(() => reconnect(attemps), initialDelay)
      else reconnect(attemps)
    })
  },
}
