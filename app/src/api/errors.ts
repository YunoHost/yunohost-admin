/**
 * API errors definitionss.
 * @module api/errors
 */

import type { APIRequest } from '@/composables/useRequests'
import i18n from '@/i18n'
import type { APIErrorData, RequestMethod } from './api'

class APIError extends Error {
  name = 'APIError'
  code: number
  status: string
  method: RequestMethod
  requestId: string
  path: string

  constructor(
    request: APIRequest,
    { url, status, statusText }: Response,
    { error }: APIErrorData,
  ) {
    super(
      error
        ? error.replaceAll('\n', '<br>')
        : i18n.global.t('error_server_unexpected'),
    )
    const urlObj = new URL(url)
    this.code = status
    this.status = statusText
    this.method = request.method
    this.requestId = request.id
    this.path = urlObj.pathname + urlObj.search
  }

  log() {
    /* eslint-disable-next-line */
    console.error(`${this.name} (${this.code}): ${this.path}\n${this.message}`)
  }
}

// Log (Special error to trigger a redirect to a log page)
class APIErrorLog extends APIError {
  name = 'APIErrorLog'
  logRef: string

  constructor(
    request: APIRequest,
    response: Response,
    errorData: APIErrorData,
  ) {
    super(request, response, errorData)
    this.logRef = errorData.log_ref as string
  }
}

// 0 — (means "the connexion has been closed" apparently)
class APIConnexionError extends APIError {
  name = 'APIConnexionError'
  constructor(
    request: APIRequest,
    response: Response,
    _errorData: APIErrorData,
  ) {
    super(request, response, {
      error: i18n.global.t('error_connection_interrupted'),
    })
  }
}

// 400 — Bad Request
class APIBadRequestError extends APIError {
  name = 'APIBadRequestError'
  key: string
  data: APIErrorData

  constructor(
    request: APIRequest,
    response: Response,
    errorData: APIErrorData,
  ) {
    super(request, response, errorData)
    this.key = errorData.error_key as string
    this.data = errorData
  }
}

// 401 — Unauthorized
class APIUnauthorizedError extends APIError {
  name = 'APIUnauthorizedError'

  constructor(
    request: APIRequest,
    response: Response,
    _errorData: APIErrorData,
  ) {
    super(request, response, { error: i18n.global.t('unauthorized') })
  }
}

// 404 — Not Found
class APINotFoundError extends APIError {
  name = 'APINotFoundError'

  constructor(
    request: APIRequest,
    response: Response,
    errorData: APIErrorData,
  ) {
    errorData.error = i18n.global.t('api_not_found')
    super(request, response, errorData)
  }
}

// 500 — Server Internal Error
class APIInternalError extends APIError {
  name = 'APIInternalError'
  traceback: string | null

  constructor(
    request: APIRequest,
    response: Response,
    errorData: APIErrorData,
  ) {
    super(request, response, errorData)
    this.traceback = errorData.traceback || null
  }
}

// 502 — Bad gateway (means API is down)
class APINotRespondingError extends APIError {
  name = 'APINotRespondingError'

  constructor(
    request: APIRequest,
    response: Response,
    _errorData: APIErrorData,
  ) {
    super(request, response, { error: i18n.global.t('api_not_responding') })
  }
}

// Temp factory
const errors = {
  default: APIError,
  log: APIErrorLog,
  0: APIConnexionError,
  400: APIBadRequestError,
  401: APIUnauthorizedError,
  404: APINotFoundError,
  500: APIInternalError,
  502: APINotRespondingError,
}

export {
  APIBadRequestError,
  APIConnexionError,
  APIError,
  APIErrorLog,
  APIInternalError,
  APINotFoundError,
  APINotRespondingError,
  APIUnauthorizedError,
  errors as default,
}
