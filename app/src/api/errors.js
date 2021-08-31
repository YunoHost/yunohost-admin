/**
 * API errors definitionss.
 * @module api/errors
 */

import i18n from '@/i18n'


class APIError extends Error {
  constructor (request, { url, status, statusText }, { error }) {
    super(error ? error.replace('\n', '<br>') : i18n.t('error_server_unexpected'))
    const urlObj = new URL(url)
    this.name = 'APIError'
    this.code = status
    this.status = statusText
    this.method = request.method
    this.request = request
    this.path = urlObj.pathname + urlObj.search
  }

  log () {
    /* eslint-disable-next-line */
    console.error(`${this.name} (${this.code}): ${this.uri}\n${this.message}`)
  }
}

// Log (Special error to trigger a redirect to a log page)
class APIErrorLog extends APIError {
  constructor (method, response, errorData) {
    super(method, response, errorData)
    this.logRef = errorData.log_ref
    this.name = 'APIErrorLog'
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
    this.key = errorData.error_key
    this.data = errorData
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
  log: APIErrorLog,
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
  APIErrorLog,
  APIBadRequestError,
  APIConnexionError,
  APIInternalError,
  APINotFoundError,
  APINotRespondingError,
  APIUnauthorizedError
}
