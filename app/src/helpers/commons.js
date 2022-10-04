/**
 * Allow to set a timeout on a `Promise` expected response.
 * The returned Promise will be rejected if the original Promise is not resolved or
 * rejected before the delay.
 *
 * @param {Promise} promise - A promise (like a fetch call).
 * @param {Number} delay - delay after which the promise is rejected
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
 * Check if passed value is an object literal.
 *
 * @param {*} value - Anything.
 * @return {Boolean}
 */
export function isObjectLiteral (value) {
  return value !== null && value !== undefined && Object.is(value.constructor, Object)
}


/**
 * Check if value is "empty" (`null`, `undefined`, `''`, `[]`, '{}').
 * Note: `0` is not considered "empty" in that helper.
 *
 * @param {*} value - Anything.
 * @return {Boolean}
 */
export function isEmptyValue (value) {
  if (typeof value === 'number') return false
  return !value || value.length === 0 || Object.keys(value).length === 0
}


/**
 * Returns an flattened object literal, with all keys at first level and removing nested ones.
 *
 * @param {Object} obj - An object literal to flatten.
 * @param {Object} [flattened={}] - An object literal to add passed obj keys/values.
 * @return {Object}
 */
export function flattenObjectLiteral (obj, flattened = {}) {
  function flatten (objLit) {
    for (const key in objLit) {
      const value = objLit[key]
      if (isObjectLiteral(value)) {
        flatten(value)
      } else {
        flattened[key] = value
      }
    }
  }
  flatten(obj)
  return flattened
}


/**
 * Returns an new Object filtered with passed filter function.
 * Each entry `[key, value]` will be forwarded to the `filter` function.
 *
 * @param {Object} obj - object to filter.
 * @param {Function} filter - the filter function to call for each entry.
 * @return {Object}
 */
export function filterObject (obj, filter) {
  return Object.fromEntries(Object.entries(obj).filter((...args) => filter(...args)))
}


/**
 * Returns an new array containing items that are in first array but not in the other.
 *
 * @param {Array} [arr1=[]]
 * @param {Array} [arr2=[]]
 * @return {Array}
 */
export function arrayDiff (arr1 = [], arr2 = []) {
  return arr1.filter(item => !arr2.includes(item))
}


/**
 * Returns a new string with escaped HTML (`&<>"'` replaced by entities).
 *
 * @param {String} unsafe
 * @return {String}
 */
export function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Returns a random integer between `min` and `max`.
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
export function randint (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}


/**
 * Returns a File content.
 *
 * @param {File} file
 * @param {Object} [extraParams] - Optionnal params
 * @param {Boolean} [extraParams.base64] - returns a base64 representation of the file.
 * @return {Promise<String>}
 */
export function getFileContent (file, { base64 = false } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => resolve(reader.result)

    if (base64) {
      reader.readAsDataURL(file)
    } else {
      reader.readAsText(file)
    }
  })
}
