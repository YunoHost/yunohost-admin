/**
 * api module.
 * @module api
 */

import store from '@/store'

/**
 * Allow to set a timeout on a `Promise` expected response.
 * The returned Promise will be rejected if the original Promise is not resolved or
 * rejected before the delay.
 *
 * @param {Promise} promise - A promise (like a fetch call).
 * @param {number} delay - delay after which the promise is rejected
 * @return {Promise}
 */
export function timeout (promise, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (reject(new Error('api_not_responding'))), delay)
    promise.then(resolve, reject)
  })
}

/**
 * Converts an object literal into an `URLSearchParams` that can be turned into a
 * query string or used as a body in a `fetch` call.
 *
 * @param {Object} object - An object literal to convert.
 * @param {Object} options
 * @param {boolean} [options.addLocale=false] - Option to append the locale to the query string.
 * @return {URLSearchParams}
 */
export function objectToParams (object, { addLocale = false } = {}) {
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(object)) {
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

/**
 * Handler for api responses.
 *
 * @param {Response} response - A fetch `Response` object.
 * @return {DigestedResponse} Parsed response's json, response's text or an error.
 */
export async function handleResponse (response) {
  store.commit('UPDATE_WAITING', false)
  if (!response.ok) return handleErrors(response)
  // FIXME the api should always return json objects
  const responseText = await response.text()
  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

/**
 * Handler for API errors.
 *
 * @param {Response} response - A fetch `Response` object.
 * @throws Will throw an error with the API response text or custom message.
 */
export async function handleErrors (response) {
  if (response.status === 401) {
    store.dispatch('DISCONNECT')
    throw new Error('Unauthorized')
  } else if (response.status === 400) {
    const message = await response.text()
    throw new Error(message)
  }
}

/**
 * A digested fetch response as an object, a string or an error.
 * @typedef {(Object|string|Error)} DigestedResponse
 */

/**
 * Actual api module.
 * @module api/default
 */
export default {
  options: {
    credentials: 'include',
    mode: 'cors',
    headers: {
      // FIXME is it important to keep this previous `Accept` header ?
      // 'Accept': 'application/json, text/javascript, */*; q=0.01',
      // Auto header is :
      // "Accept": "*/*",

      // Also is this still important ? (needed by back-end)
      'X-Requested-With': 'XMLHttpRequest'
    }
  },

  /**
   * Generic method to fetch the api without automatic response handling.
   *
   * @param {string} method - a method between 'GET', 'POST', 'PUT' and 'DELETE'.
   * @param {string} uri
   * @param {string} [data={}] - data to send as body for 'POST', 'PUT' and 'DELETE' methods.
   * @return {Promise<Response>} Promise that resolve a fetch `Response`.
   */
  fetch (method, uri, data = {}) {
    if (method === 'GET') {
      const localeQs = `${uri.includes('?') ? '&' : '?'}locale=${store.getters.locale}`
      return fetch('/api/' + uri + localeQs, this.options)
    }
    return fetch('/api/' + uri, {
      ...this.options,
      method,
      body: objectToParams(data, { addLocale: true })
    })
  },

  /**
   * Api get helper function.
   *
   * @param {string} uri - the uri to call.
   * @return {Promise<module:api~DigestedResponse>} Promise that resolve the api response as an object, a string or as an error.
   */
  get (uri) {
    return this.fetch('GET', uri).then(handleResponse)
  },

  /**
   * Api get helper function for multiple queries.
   *
   * @param {string} uri - the uri to call.
   * @return {Promise<module:api~DigestedResponse[]>} Promise that resolve the api responses as an array.
   */
  getAll (uris) {
    return Promise.all(uris.map(uri => this.get(uri)))
  },

  /**
   * Api post helper function.
   *
   * @param {string} uri - the uri to call.
   * @param {string} [data={}] - data to send as body.
   * @return {Promise<module:api~DigestedResponse>} Promise that resolve the api responses as an array.
   */
  post (uri, data = {}) {
    store.commit('UPDATE_WAITING', true)
    return this.fetch('POST', uri, data).then(handleResponse)
  },

  /**
   * Api put helper function.
   *
   * @param {string} uri - the uri to call.
   * @param {string} [data={}] - data to send as body.
   * @return {Promise<module:api~DigestedResponse>} Promise that resolve the api responses as an array.
   */
  put (uri, data = {}) {
    store.commit('UPDATE_WAITING', true)
    return this.fetch('PUT', uri, data).then(handleResponse)
  },

  /**
   * Api delete helper function.
   *
   * @param {string} uri - the uri to call.
   * @param {string} [data={}] - data to send as body.
   * @return {Promise<('ok'|Error)>} Promise that resolve the api responses as an array.
   */
  delete (uri, data = {}) {
    store.commit('UPDATE_WAITING', true)
    return this.fetch('DELETE', uri, data).then(response => {
      store.commit('UPDATE_WAITING', false)
      return response.ok ? 'ok' : handleErrors(response)
    })
  }
}
