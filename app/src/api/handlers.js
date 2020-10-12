import store from '@/store'

/**
 * Handler for API responses.
 *
 * @param {Response} response - A fetch `Response` object.
 * @return {DigestedResponse} Parsed response's json, response's text or an error.
 */
async function handleResponse (response) {
  if (!response.ok) return handleError(response)
  // FIXME the api should always return json objects
  const responseText = await response.text()
  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

/**
 * Handler for API errors.
 *
 * @param {Response} response - A fetch `Response` object.
 * @throws Will throw an error with the API response text or custom message.
 */
async function handleError (response) {
  if (response.status === 401) {
    store.dispatch('DISCONNECT')
    throw new Error('Unauthorized')
  } else if (response.status === 400) {
    const message = await response.text()
    throw new Error(message)
  }
}

export {
  handleResponse,
  handleError
}
