import store from '@/store'

/**
 * Allow to set a timeout on a `Promise` expected response.
 * The returned Promise will be rejected if the original Promise is not resolved or
 * rejected before the delay.
 *
 * @param {Promise} promise - A promise (like a fetch call).
 * @param {number} delay - delay after which the promise is rejected
 * @return {Promise}
 */
export function timeout (promise, delay) {
  return new Promise((resolve, reject) => {
    // FIXME reject(new Error('api_not_responding')) for post-install
    setTimeout(() => reject, delay)
    promise.then(resolve, reject)
  })
}

/**
 * Converts an object literal into an `URLSearchParams` that can be turned into a
 * query string or used as a body in a `fetch` call.
 *
 * @param {Object} object - An object literal to convert.
 * @param {Object} options
 * @param {boolean} [options.addLocale=false] - Option to append the locale to the query string.
 * @return {URLSearchParams}
 */
export function objectToParams (object, { addLocale = false } = {}) {
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(object)) {
    if (Array.isArray(value)) {
      value.forEach(v => urlParams.append(key, v))
    } else {
      urlParams.append(key, value)
    }
  }
  if (addLocale) {
    urlParams.append('locale', store.getters.locale)
  }
  return urlParams
}
