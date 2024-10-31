/**
 * API handlers.
 * @module api/handlers
 */

import errors from '@/api/errors'
import { useInfos } from '@/composables/useInfos'
import type { APIRequest, APIRequestAction } from '@/composables/useRequests'
import { toEntries } from '@/helpers/commons'
import { STATUS_VARIANT, isOkStatus } from '@/helpers/yunohostArguments'
import type { StateStatus, Obj } from '@/types/commons'
import type { APIErrorData } from './api'

/**
 * Try to get response content as json and if it's not as text.
 *
 * @param response - A fetch `Response` object.
 * @returns Parsed response's json or response's text.
 */
export async function getResponseData<T extends any = any>(
  response: Response,
): Promise<T> {
  // FIXME the api should always return json as response
  const responseText = await response.text()
  try {
    return JSON.parse(responseText)
  } catch {
    return responseText as T
  }
}

/**
 * Opens a WebSocket connection to the server in case it sends messages.
 * Currently, the connection is closed by the server right after an API call so
 * we have to open it for every calls.
 * Messages are dispatch to the store so it can handle them.
 *
 * @param request - Request info data.
 * @returns Promise that resolve on websocket 'open' or 'error' event.
 */
export function openWebSocket(request: APIRequestAction): Promise<Event> {
  const { host } = useInfos()
  return new Promise((resolve) => {
    const ws = new WebSocket(`wss://${host.value}/yunohost/api/messages`)
    ws.onmessage = ({ data }) => {
      const messages: Record<StateStatus, string> = JSON.parse(data)
      toEntries(messages).forEach(([status, text]) => {
        text = text.replaceAll('\n', '<br>')
        const progressBar = text.match(/^\[#*\+*\.*\] > /)?.[0]
        if (progressBar) {
          text = text.replace(progressBar, '')
          const progress: Obj<number> = { '#': 0, '+': 0, '.': 0 }
          for (const char of progressBar) {
            if (char in progress) progress[char] += 1
          }
          request.action.progress = Object.values(progress)
        }
        request.action.messages.push({
          text,
          variant: STATUS_VARIANT[status],
        })
        if (!isOkStatus(status)) request.action[`${status}s`]++
      })
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
