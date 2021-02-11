/**
 * API module.
 * @module api
 */

import store from '@/store'
import { handleResponse } from './handlers'
import { objectToParams } from '@/helpers/commons'

/**
 * A digested fetch response as an object, a string or an error.
 * @typedef {(Object|string|Error)} DigestedResponse
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
   * Opens a WebSocket connection to the server in case it sends messages.
   * Currently, the connection is closed by the server right after an API call so
   * we have to open it for every calls.
   * Messages are dispatch to the store so it can handle them.
   *
   * @return {Promise<Event>} Promise that resolve on websocket 'open' or 'error' event.
   */
  openWebSocket () {
    return new Promise(resolve => {
      const ws = new WebSocket(`wss://${store.getters.host}/yunohost/api/messages`)
      ws.onmessage = ({ data }) => store.dispatch('DISPATCH_MESSAGE', JSON.parse(data))
      // ws.onclose = (e) => {}
      ws.onopen = resolve
      // Resolve also on error so the actual fetch may be called.
      ws.onerror = resolve
    })
  },

  /**
   * Generic method to fetch the api without automatic response handling.
   *
   * @param {string} method - a method between 'GET', 'POST', 'PUT' and 'DELETE'.
   * @param {string} uri
   * @param {Object} [data={}] - data to send as body for 'POST', 'PUT' and 'DELETE' methods.
   * @param {Object} [options={}]
   * @param {Boolean} [options.websocket=true] - Open a websocket before this request.
   * @return {Promise<Response>} Promise that resolve a fetch `Response`.
   */
  async fetch (method, uri, data = {}, { websocket = true } = {}) {
    // Open a websocket connection that will dispatch messages received.
    if (websocket) {
      await this.openWebSocket()
      store.dispatch('WAITING_FOR_RESPONSE', [uri, method])
    }

    if (method === 'GET') {
      const localeQs = `${uri.includes('?') ? '&' : '?'}locale=${store.getters.locale}`
      return fetch('/yunohost/api/' + uri + localeQs, this.options)
    }

    return fetch('/yunohost/api/' + uri, {
      ...this.options,
      method,
      body: objectToParams(data, { addLocale: true })
    })
  },

  /**
   * Api get helper function.
   *
   * @param {string} uri - the uri to call.
   * @param {Object} [options={}]
   * @param {Boolean} [options.websocket=false] - Open a websocket before this request.
   * @return {Promise<module:api~DigestedResponse>} Promise that resolve the api response as an object, a string or as an error.
   */
  get (uri, { websocket = false } = {}) {
    return this.fetch('GET', uri, null, { websocket }).then(response => handleResponse(response, 'GET'))
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
    return this.fetch('POST', uri, data).then(response => handleResponse(response, 'POST'))
  },

  /**
   * Api put helper function.
   *
   * @param {string} uri - the uri to call.
   * @param {string} [data={}] - data to send as body.
   * @return {Promise<module:api~DigestedResponse>} Promise that resolve the api responses as an array.
   */
  put (uri, data = {}) {
    return this.fetch('PUT', uri, data).then(response => handleResponse(response, 'PUT'))
  },

  /**
   * Api delete helper function.
   *
   * @param {string} uri - the uri to call.
   * @param {string} [data={}] - data to send as body.
   * @return {Promise<('ok'|Error)>} Promise that resolve the api responses as an array.
   */
  delete (uri, data = {}) {
    return this.fetch('DELETE', uri, data).then(response => handleResponse(response, 'DELETE'))
  }
}
