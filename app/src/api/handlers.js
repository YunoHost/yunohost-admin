/**
 * API handlers.
 * @module api/handlers
 */

import store from '@/store'
import errors, { APIError } from './errors'


/**
 * Try to get response content as json and if it's not as text.
 *
 * @param {Response} response - A fetch `Response` object.
 * @return {(Object|String)} Parsed response's json or response's text.
 */
export async function getResponseData (response) {
  // FIXME the api should always return json as response
  const responseText = await response.text()
  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}


/**
 * Opens a WebSocket connection to the server in case it sends messages.
 * Currently, the connection is closed by the server right after an API call so
 * we have to open it for every calls.
 * Messages are dispatch to the store so it can handle them.
 *
 * @param {Object} request - Request info data.
 * @return {Promise<Event>} Promise that resolve on websocket 'open' or 'error' event.
 */
export function openWebSocket (request) {
  return new Promise(resolve => {
    const ws = new WebSocket(`wss://${store.getters.host}/yunohost/api/messages`)
    ws.onmessage = ({ data }) => {
      store.dispatch('DISPATCH_MESSAGE', { request, messages: JSON.parse(data) })
    }
    // ws.onclose = (e) => {}
    ws.onopen = resolve
    // Resolve also on error so the actual fetch may be called.
    ws.onerror = resolve
  })
}


/**
 * Handler for API errors.
 *
 * @param {Object} request - Request info data.
 * @param {Response} response - A consumed fetch `Response` object.
 * @param {Object|String} errorData - The response parsed json/text.
 * @throws Will throw a `APIError` with request and response data.
 */
export async function handleError (request, response, errorData) {
  let errorCode = response.status in errors ? response.status : undefined
  if (typeof errorData === 'string') {
    // FIXME API: Patching errors that are plain text or html.
    errorData = { error: errorData }
  }
  if ('log_ref' in errorData) {
    // Define a special error so it won't get caught as a `APIBadRequestError`.
    errorCode = 'log'
  }

  // This error can be catched by a view otherwise it will be catched by the `onUnhandledAPIError` handler.
  throw new errors[errorCode](request, response, errorData)
}


/**
 * If an APIError is not catched by a view it will be dispatched to the store so the
 * error can be displayed in the error modal.
 *
 * @param {APIError} error
 */
export function onUnhandledAPIError (error) {
  error.log()
  store.dispatch('HANDLE_ERROR', error)
}


/**
 * Global catching of unhandled promise's rejections.
 * Those errors (thrown or rejected from inside a promise) can't be catched by
 * `window.onerror`.
 */
export function registerGlobalErrorHandlers () {
  window.addEventListener('unhandledrejection', e => {
    const error = e.reason
    if (error instanceof APIError) {
      onUnhandledAPIError(error)
      // Seems like there's a bug in Firefox and the error logging in not prevented.
      e.preventDefault()
    }
  })

  // Keeping this in case it is needed.

  // Global catching of errors occuring inside vue components.
  // Vue.config.errorHandler = (err, vm, info) => {}

  // Global catching of regular js errors.
  // window.onerror = (message, source, lineno, colno, error) => {}
}
