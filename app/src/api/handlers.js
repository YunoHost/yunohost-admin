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
async function _getResponseData (response) {
  // FIXME the api should always return json as response
  const responseText = await response.text()
  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}


/**
 * Handler for API responses.
 *
 * @param {Response} response - A fetch `Response` object.
 * @return {(Object|String)} Parsed response's json, response's text or an error.
 */
export async function handleResponse (response, method) {
  const responseData = await _getResponseData(response)
  store.dispatch('SERVER_RESPONDED', response.ok)
  return response.ok ? responseData : handleError(response, responseData, method)
}


/**
 * Handler for API errors.
 *
 * @param {Response} response - A fetch `Response` object.
 * @throws Will throw a custom error with response data.
 */
export async function handleError (response, errorData, method) {
  const errorCode = response.status in errors ? response.status : undefined
  // FIXME API: Patching errors that are plain text or html.
  if (typeof errorData === 'string') {
    errorData = { error: errorData }
  }

  // This error can be catched by a view otherwise it will be catched by the `onUnhandledAPIError` handler.
  throw new errors[errorCode](method, response, errorData)
}


export function onUnhandledAPIError (error) {
  // In 'development', Babel seems to also catch the error so there's no need to log it twice.
  if (process.env.NODE_ENV !== 'development') {
    error.log()
  }
  store.dispatch('HANDLE_ERROR', error)
}


export function registerGlobalErrorHandlers () {
  // Global catching of unhandled promise's rejections.
  // Those errors (thrown or rejected from inside a promise) can't be catched by `window.onerror`.
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
