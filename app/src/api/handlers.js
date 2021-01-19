/**
 * API handlers.
 * @module api/handlers
 */

import store from '@/store'
import errors from './errors'
import router from '@/router'

/**
 * Try to get response content as json and if it's not as text.
 *
 * @param {Response} response - A fetch `Response` object.
 * @return {(Object|String)} Parsed response's json or response's text.
 */

async function _getResponseContent (response) {
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
export function handleResponse (response, method) {
  if (method !== 'GET') {
    store.dispatch('SERVER_RESPONDED', response.ok)
  }
  if (!response.ok) return handleError(response, method)
  // FIXME the api should always return json objects
  return _getResponseContent(response)
}

/**
 * Handler for API errors.
 *
 * @param {Response} response - A fetch `Response` object.
 * @throws Will throw a custom error with response data.
 */
export async function handleError (response, method) {
  const message = await _getResponseContent(response)
  const errorCode = response.status in errors ? response.status : undefined
  const error = new errors[errorCode](method, response, message.error || message)

  if (error.code === 401) {
    store.dispatch('DISCONNECT')
  } else if (error.code === 400) {
    if (typeof message !== 'string' && 'log_ref' in message) {
      router.push({ name: 'tool-log', params: { name: message.log_ref } })
    }
    // Hide the waiting screen
    store.dispatch('SERVER_RESPONDED', true)
  } else {
    store.dispatch('DISPATCH_ERROR', error)
  }

  throw error
}
