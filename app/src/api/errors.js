/**
 * API errors definitionss.
 * @module api/errors
 */

import i18n from '@/i18n'


class APIError extends Error {
  constructor (method, { url, status, statusText }, errorData) {
    super(errorData.error || i18n.t('error_server_unexpected'))
    const urlObj = new URL(url)
    this.name = 'APIError'
    this.code = status
    this.status = statusText
    this.method = method
    this.path = urlObj.pathname + urlObj.search
    this.logRef = errorData.log_ref || null
  }

  log () {
    console.error(`${this.name} (${this.code}): ${this.uri}\n${this.message}`)
  }
}


// 0 — (means "the connexion has been closed" apparently)
class APIConnexionError extends APIError {
  constructor (method, response) {
    super(method, response, { error: i18n.t('error_connection_interrupted') })
    this.name = 'APIConnexionError'
  }
}


// 400 — Bad Request
class APIBadRequestError extends APIError {
  constructor (method, response, errorData) {
    super(method, response, errorData)
    this.name = 'APIBadRequestError'
  }
}


// 401 — Unauthorized
class APIUnauthorizedError extends APIError {
  constructor (method, response, errorData) {
    super(method, response, { error: i18n.t('unauthorized') })
    this.name = 'APIUnauthorizedError'
  }
}


// 404 — Not Found
class APINotFoundError extends APIError {
  constructor (method, response, errorData) {
    errorData.error = i18n.t('api_not_found')
    super(method, response, errorData)
    this.name = 'APINotFoundError'
  }
}


// 500 — Server Internal Error
class APIInternalError extends APIError {
  constructor (method, response, errorData) {
    super(method, response, errorData)
    this.traceback = errorData.traceback || null
    this.name = 'APIInternalError'
  }
}


// 502 — Bad gateway (means API is down)
class APINotRespondingError extends APIError {
  constructor (method, response) {
    super(method, response, { error: i18n.t('api_not_responding') })
    this.name = 'APINotRespondingError'
  }
}


// Temp factory
const errors = {
  [undefined]: APIError,
  0: APIConnexionError,
  400: APIBadRequestError,
  401: APIUnauthorizedError,
  404: APINotFoundError,
  500: APIInternalError,
  502: APINotRespondingError
}


export {
  errors as default,
  APIError,
  APIBadRequestError,
  APIConnexionError,
  APIInternalError,
  APINotFoundError,
  APINotRespondingError,
  APIUnauthorizedError
}
