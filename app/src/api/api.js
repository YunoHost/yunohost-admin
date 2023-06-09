/**
 * API module.
 * @module api
 */

import store from '@/store'
import { openWebSocket, getResponseData, handleError } from './handlers'


/**
 * Options available for an API call.
 *
 * @typedef {Object} Options
 * @property {Boolean} wait - If `true`, will display the waiting modal.
 * @property {Boolean} websocket - if `true`, will open a websocket connection.
 * @property {Boolean} initial - if `true` and an error occurs, the dismiss button will trigger a go back in history.
 * @property {Boolean} asFormData - if `true`, will send the data with a body encoded as `"multipart/form-data"` instead of `"x-www-form-urlencoded"`).
 */


/**
 * Representation of an API call for `api.fetchAll`
 *
 * @typedef {Array} Query
 * @property {String} 0 - "method"
 * @property {String|Object} 1 - "uri", uri to call as string or as an object for cached uris.
 * @property {Object|null} 2 - "data"
 * @property {Options} 3 - "options"
*/


/**
 * Converts an object literal into an `URLSearchParams` that can be turned into a
 * query string or used as a body in a `fetch` call.
 *
 * @param {Object} obj - An object literal to convert.
 * @param {Object} options
 * @param {Boolean} [options.addLocale=false] - Option to append the locale to the query string.
 * @return {URLSearchParams}
 */
export function objectToParams (obj, { addLocale = false } = {}, formData = false) {
  const urlParams = (formData) ? new FormData() : new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      value.forEach(v => urlParams.append(key, v))
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

      'X-Requested-With': 'XMLHttpRequest'
    }
  },


  /**
   * Generic method to fetch the api without automatic response handling.
   *
   * @param {String} method - a method between 'GET', 'POST', 'PUT' and 'DELETE'.
   * @param {String} uri
   * @param {Object} [data={}] - data to send as body.
   * @param {Options} [options={ wait = true, websocket = true, initial = false, asFormData = false }]
   * @return {Promise<Object|Error>} Promise that resolve the api response data or an error.
   */
  async fetch (
    method,
    uri,
    data = {},
    humanKey = null,
    { wait = true, websocket = true, initial = false, asFormData = false } = {}
  ) {
    // FIXME remove websocket mentions
    // `await` because Vuex actions returns promises by default.
    const request = await store.dispatch('INIT_REQUEST', { method, uri, humanKey, initial, wait, websocket })

    let options = this.options
    if (method === 'GET') {
      uri += `${uri.includes('?') ? '&' : '?'}locale=${store.getters.locale}`
    } else {
      options = { ...options, method, body: objectToParams(data, { addLocale: true }, true) }
    }

    const response = await fetch('/yunohost/api/' + uri, options)
    const responseData = await getResponseData(response)
    store.dispatch('END_REQUEST', { request, success: response.ok, wait })

    return response.ok ? responseData : handleError(request, response, responseData)
  },


  /**
   * Api multiple queries helper.
   * Those calls will act as one (declare optional waiting for one but still create history entries for each)
   * Calls are synchronous since the API can't handle multiple calls.
   *
   * @param {Array<Query>} queries - An array of queries with special representation.
   * @param {Object} [options={}]
   * @param {Boolean}
   * @return {Promise<Array|Error>} Promise that resolve the api responses data or an error.
   */
  async fetchAll (queries, { wait, initial } = {}) {
    const results = []
    if (wait) store.commit('SET_WAITING', true)
    try {
      for (const [method, uri, data, humanKey, options = {}] of queries) {
        if (wait) options.wait = false
        if (initial) options.initial = true
        results.push(await this[method.toLowerCase()](uri, data, humanKey, options))
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
   * @param {String|Object} uri
   * @param {null} [data=null] - for convenience in muliple calls, just pass null.
   * @param {Options} [options={}] - options to apply to the call (default is `{ websocket: false, wait: false }`)
   * @return {Promise<Object|Error>} Promise that resolve the api response data or an error.
   */
  get (uri, data = null, humanKey = null, options = {}) {
    options = { websocket: false, wait: false, ...options }
    if (typeof uri === 'string') return this.fetch('GET', uri, null, humanKey, options)
    return store.dispatch('GET', { ...uri, humanKey, options })
  },


  /**
   * Api post helper function.
   *
   * @param {String|Object} uri
   * @param {String} [data={}] - data to send as body.
   * @param {Options} [options={}] - options to apply to the call
   * @return {Promise<Object|Error>} Promise that resolve the api response data or an error.
   */
  post (uri, data = {}, humanKey = null, options = {}) {
    if (typeof uri === 'string') return this.fetch('POST', uri, data, humanKey, options)
    return store.dispatch('POST', { ...uri, data, humanKey, options })
  },


  /**
   * Api put helper function.
   *
   * @param {String|Object} uri
   * @param {String} [data={}] - data to send as body.
   * @param {Options} [options={}] - options to apply to the call
   * @return {Promise<Object|Error>} Promise that resolve the api response data or an error.
   */
  put (uri, data = {}, humanKey = null, options = {}) {
    if (typeof uri === 'string') return this.fetch('PUT', uri, data, humanKey, options)
    return store.dispatch('PUT', { ...uri, data, humanKey, options })
  },


  /**
   * Api delete helper function.
   *
   * @param {String|Object} uri
   * @param {String} [data={}] - data to send as body.
   * @param {Options} [options={}] - options to apply to the call (default is `{ websocket: false, wait: false }`)
   * @return {Promise<Object|Error>} Promise that resolve the api response data or an error.
   */
  delete (uri, data = {}, humanKey = null, options = {}) {
    if (typeof uri === 'string') return this.fetch('DELETE', uri, data, humanKey, options)
    return store.dispatch('DELETE', { ...uri, data, humanKey, options })
  },

  /**
   * Api reconnection helper. Resolve when server is reachable or fail after n attemps
   *
   * @param {Number} attemps - number of attemps before rejecting
   * @param {Number} delay - delay between calls to the API in ms.
   * @param {Number} initialDelay - delay before calling the API for the first time in ms.
   * @return {Promise<undefined|Error>}
   */
  tryToReconnect ({ attemps = 5, delay = 2000, initialDelay = 0 } = {}) {
    return new Promise((resolve, reject) => {
      const api = this

      function reconnect (n) {
        api.get('logout', {}, { key: 'reconnecting' }).then(resolve).catch(err => {
          if (err.name === 'APIUnauthorizedError') {
            resolve()
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
  }
}
