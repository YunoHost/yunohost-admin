/**
 * API module.
 * @module api
 */

import store from '@/store'
import { openWebSocket, getResponseData, getError } from './handlers'
import type { Obj } from '@/types/commons'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

type StoreUri = {
  uri: string
  storeKey?: string
  param?: string
}
type HumanKey = {
  key: string
  [propName: string]: any
}

type APIQueryOptions = {
  // Display the waiting modal
  wait?: boolean
  // Open a websocket connection
  websocket?: boolean
  // If an error occurs, the dismiss button will trigger a go back in history
  initial?: boolean
  // Send the data with a body encoded as `"multipart/form-data"` instead of `"x-www-form-urlencoded"`)
  asFormData?: boolean
}

export type APIQuery = [
  method: RequestMethod,
  uri: string | StoreUri,
  data?: Obj | null,
  humanKey?: string | HumanKey | null,
  options?: APIQueryOptions,
]

export type APIErrorData = {
  error: string
  error_key?: string
  log_ref?: string
  traceback?: string
  name?: string // FIXME name is field id right?
}

type RequestStatus = 'pending' | 'success' | 'warning' | 'error'

export type APIRequest = {
  method: RequestMethod
  uri: string
  humanRouteKey: HumanKey['key']
  humanRoute: string
  initial: APIQueryOptions['initial']
  status: RequestStatus
}

type WebsocketMessage = {
  text: string
  status: 'info' | 'success' | 'warning' | 'error'
}

export type APIRequestAction = APIRequest & {
  messages: WebsocketMessage[]
  date: number
  warning: number
  errors: number
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
    urlParams.append('locale', store.getters.locale)
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
   * @param method - a method in `'GET' | 'POST' | 'PUT' | 'DELETE'`
   * @param uri - URI to fetch
   * @param data - Data to send as body
   * @param options - {@link APIQueryOptions}

   * @returns Promise that resolve the api response data
   * @throws Throw an `APIError` or subclass depending on server response
   */
  async fetch(
    method: RequestMethod,
    uri: string,
    data: Obj | null | undefined = {},
    humanKey: string | HumanKey | null = null,
    {
      wait = true,
      websocket = true,
      initial = false,
      asFormData = true,
    }: APIQueryOptions = {},
  ): Promise<Obj | string> {
    // `await` because Vuex actions returns promises by default.
    const request: APIRequest | APIRequestAction = await store.dispatch(
      'INIT_REQUEST',
      {
        method,
        uri,
        humanKey,
        initial,
        wait,
        websocket,
      },
    )

    if (websocket) {
      await openWebSocket(request as APIRequestAction)
    }

    let options = this.options
    if (method === 'GET') {
      uri += `${uri.includes('?') ? '&' : '?'}locale=${store.getters.locale}`
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
    const responseData = await getResponseData(response)
    store.dispatch('END_REQUEST', { request, success: response.ok, wait })

    if (!response.ok) {
      throw getError(request, response, responseData as string | APIErrorData)
    }

    return responseData
  },

  /**
   * Api multiple queries helper.
   * Those calls will act as one (declare optional waiting for one but still create history entries for each)
   * Calls are synchronous since the API can't handle multiple calls.
   *
   * @param queries - Array of {@link APIQuery}
   * @param wait - Show the waiting modal until every queries have been resolved
   * @param initial - Inform that thoses queries are required for a view to be displayed
   * @returns Promise that resolves an array of server responses
   * @throws Throw an `APIError` or subclass depending on server response
   */
  async fetchAll(queries: APIQuery[], { wait = false, initial = false } = {}) {
    const results: Array<Obj | string> = []
    if (wait) store.commit('SET_WAITING', true)
    try {
      for (const [method, uri, data, humanKey, options = {}] of queries) {
        if (wait) options.wait = false
        if (initial) options.initial = true
        results.push(
          await this[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](
            uri,
            data,
            humanKey,
            options,
          ),
        )
      }
    } finally {
      // Stop waiting even if there is an error.
      if (wait) store.commit('SET_WAITING', false)
    }

    return results
  },

  /**
   * Api get helper function.
   *
   * @param uri - uri to fetch
   * @param data - for convenience in muliple calls, just pass null
   * @param humanKey - key and eventually some data to build the query's description
   * @param options - {@link APIQueryOptions}
   * @returns Promise that resolve the api response data or an error
   * @throws Throw an `APIError` or subclass depending on server response
   */
  get(
    uri: string | StoreUri,
    data: Obj | null = null,
    humanKey: string | HumanKey | null = null,
    options: APIQueryOptions = {},
  ): Promise<Obj | string> {
    options = { websocket: false, wait: false, ...options }
    if (typeof uri === 'string')
      return this.fetch('GET', uri, data, humanKey, options)
    return store.dispatch('GET', { ...uri, humanKey, options })
  },

  /**
   * Api post helper function.
   *
   * @param uri - uri to fetch
   * @param data - data to send as body
   * @param humanKey - key and eventually some data to build the query's description
   * @param options - {@link APIQueryOptions}
   * @returns Promise that resolve the api response data or an error
   * @throws Throw an `APIError` or subclass depending on server response
   */
  post(
    uri: string | StoreUri,
    data: Obj | null | undefined = {},
    humanKey: string | HumanKey | null = null,
    options: APIQueryOptions = {},
  ): Promise<Obj | string> {
    if (typeof uri === 'string')
      return this.fetch('POST', uri, data, humanKey, options)
    return store.dispatch('POST', { ...uri, data, humanKey, options })
  },

  /**
   * Api put helper function.
   *
   * @param uri - uri to fetch
   * @param data - data to send as body
   * @param humanKey - key and eventually some data to build the query's description
   * @param options - {@link APIQueryOptions}
   * @returns Promise that resolve the api response data or an error
   * @throws Throw an `APIError` or subclass depending on server response
   */
  put(
    uri: string | StoreUri,
    data: Obj | null | undefined = {},
    humanKey: string | HumanKey | null = null,
    options: APIQueryOptions = {},
  ): Promise<Obj | string> {
    if (typeof uri === 'string')
      return this.fetch('PUT', uri, data, humanKey, options)
    return store.dispatch('PUT', { ...uri, data, humanKey, options })
  },

  /**
   * Api delete helper function.
   *
   * @param uri - uri to fetch
   * @param data - data to send as body
   * @param humanKey - key and eventually some data to build the query's description
   * @param options - {@link APIQueryOptions}
   * @returns Promise that resolve the api response data or an error
   * @throws Throw an `APIError` or subclass depending on server response
   */
  delete(
    uri: string | StoreUri,
    data: Obj | null | undefined = {},
    humanKey: string | HumanKey | null = null,
    options: APIQueryOptions = {},
  ): Promise<Obj | string> {
    if (typeof uri === 'string')
      return this.fetch('DELETE', uri, data, humanKey, options)
    return store.dispatch('DELETE', { ...uri, data, humanKey, options })
  },

  /**
   * Api reconnection helper. Resolve when server is reachable or fail after n attemps
   *
   * @param attemps - Number of attemps before rejecting
   * @param delay - Delay between calls to the API in ms
   * @param initialDelay - Delay before calling the API for the first time in ms
   * @returns Promise that resolve yunohost version infos
   * @throws Throw an `APIError` or subclass depending on server response
   */
  tryToReconnect({ attemps = 5, delay = 2000, initialDelay = 0 } = {}) {
    return new Promise((resolve, reject) => {
      function reconnect(n: number) {
        store
          .dispatch('GET_YUNOHOST_INFOS')
          .then(resolve)
          .catch((err) => {
            if (err.name === 'APIUnauthorizedError') {
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
