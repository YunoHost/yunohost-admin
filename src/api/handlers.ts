/**
 * API handlers.
 * @module api/handlers
 */

import errors from '@/api/errors'
import type { APIRequest } from '@/composables/useRequests'
import type { APIErrorData } from './api'

/**
 * Try to get response content as json and if it's not as text.
 *
 * @param response - A fetch `Response` object.
 * @returns Parsed response's json or response's text.
 */
export async function getResponseData<T>(response: Response): Promise<T> {
  // FIXME the api should always return json as response
  const responseText = await response.text()
  try {
    return JSON.parse(responseText)
  } catch {
    return responseText as T
  }
}

/**
 * Handler for API errors.
 *
 * @param request - Request info data.
 * @param response - A consumed fetch `Response` object.
 * @param errorData - The response parsed json/text.
 * @returns an `APIError` or subclass with request and response data.
 */
export function getError(
  request: APIRequest,
  response: Response,
  errorData: string | APIErrorData,
) {
  let errorCode = (
    response.status in errors ? response.status : 'default'
  ) as keyof typeof errors
  if (typeof errorData === 'string') {
    // FIXME API: Patching errors that are plain text or html.
    errorData = { error: errorData }
  }
  if ('log_ref' in errorData) {
    // Define a special error so it won't get caught as a `APIBadRequestError`.
    errorCode = 'log'
  }

  // This error can be catched by a view otherwise it will be catched by the global error handler.
  return new errors[errorCode](request, response, errorData)
}
