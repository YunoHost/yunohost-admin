/**
 * API errors definitionss.
 * @module api/errors
 */

import i18n from '@/i18n'

class APIError extends Error {
  constructor (method, { url, status, statusText }, message) {
    super(message || i18n.t('error_server_unexpected'))
    this.uri = new URL(url).pathname.replace('/yunohost', '')
    this.method = method
    this.code = status
    this.status = statusText
    this.name = 'APIError'
  }

  print () {
    console.error(`${this.name} (${this.code}): ${this.uri}\n${this.message}`)
  }
}

// 401 — Unauthorized
class APIUnauthorizedError extends APIError {
  constructor (method, response, message) {
    super(method, response, i18n.t('unauthorized'))
    this.name = 'APIUnauthorizedError'
  }
}

// 400 — Bad Request
class APIBadRequestError extends APIError {
  constructor (method, response, message) {
    super(method, response, message)
    this.name = 'APIBadRequestError'
  }
}

// 500 — Server Internal Error
class APIInternalError extends APIError {
  constructor (method, response, data) {
    // not tested (message should be json but in )
    const traceback = typeof data === 'object' ? data.traceback : null
    super(method, response, 'none')
    if (traceback) {
      this.traceback = traceback
    }
    this.name = 'APIInternalError'
  }
}

// 502 — Bad gateway (means API is down)
class APINotRespondingError extends APIError {
  constructor (method, response) {
    super(method, response, i18n.t('api_not_responding'))
    this.name = 'APINotRespondingError'
  }
}

// 0 — (means "the connexion has been closed" apparently)
class APIConnexionError extends APIError {
  constructor (method, response) {
    super(method, response, i18n.t('error_connection_interrupted'))
    this.name = 'APIConnexionError'
  }
}

// Temp factory
const errors = {
  [undefined]: APIError,
  0: APIConnexionError,
  400: APIBadRequestError,
  401: APIUnauthorizedError,
  500: APIInternalError,
  502: APINotRespondingError
}

export {
  errors as default,
  APIError,
  APIUnauthorizedError,
  APIBadRequestError,
  APIInternalError,
  APINotRespondingError,
  APIConnexionError
}
