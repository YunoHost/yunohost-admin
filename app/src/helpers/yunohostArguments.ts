import {
  flattenObjectLiteral,
  getFileContent,
  isEmptyValue,
  isObjectLiteral,
} from '@/helpers/commons'
import store from '@/store'
import type { Translation } from '@/types/commons'
import type { AdressModelValue } from '@/types/form'

export const DEFAULT_STATUS_ICON = {
  [null]: null,
  danger: 'times',
  error: 'times',
  info: 'info',
  success: 'check',
  warning: 'warning',
}

// FORMAT FROM CORE

/**
 * Tries to find a translation corresponding to the user's locale/fallback locale in a
 * Yunohost argument or simply return the string if it's not an object literal.
 *
 * @param field - A field value containing a translation object or string
 * @return translated field or empty string
 */
export function formatI18nField(field?: Translation): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  const { locale, fallbackLocale } = store.state as {
    locale: string
    fallbackLocale: string
  }
  return field[locale] || field[fallbackLocale] || field.en || ''
}

/**
 * Returns a string size declaration to a M value.
 *
 * @param size - A size declared like '500M' or '56k'
 * @return a number in M
 */
export function sizeToM(size: string) {
  const unit = size.slice(-1)
  const value = parseInt(size.slice(0, -1))
  if (unit === 'M') return value
  if (unit === 'b') return Math.ceil(value / (1024 * 1024))
  if (unit === 'k') return Math.ceil(value / 1024)
  if (unit === 'G') return Math.ceil(value * 1024)
  if (unit === 'T') return Math.ceil(value * 1024 * 1024)
}

/**
 * Returns an address as AdressModelValue to be used by AdressItem component.
 *
 * @param address - A string representing an adress (subdomain or email)
 * @return Parsed address as `AdressModelValue`
 */
export function formatAdress(address: string): AdressModelValue {
  const separator = address.includes('@') ? '@' : '.'
  const [localPart, domain] = address.split(separator)
  return { localPart, separator, domain }
}

// FORMAT TO CORE

/**
 * Parse a front-end value to its API equivalent. This function returns a Promise or an
 * Object `{ key: Promise }` if `key` is supplied. When parsing a form, all those
 * objects must be merged to define the final sent form.
 *
 * Convert Boolean to '1' (true) or '0' (false),
 * Concatenate two parts adresses (subdomain or email for example) into a single string,
 * Convert File to its Base64 representation or set its value to '' to ask for a removal.
 *
 * @param {*} value
 * @return {*}
 */
export function formatFormDataValue(value, key = null) {
  if (Array.isArray(value)) {
    return Promise.all(value.map((value_) => formatFormDataValue(value_))).then(
      (resolvedValues) => ({ [key]: resolvedValues }),
    )
  }

  let result = value
  if (typeof value === 'boolean') result = value ? 1 : 0
  if (isObjectLiteral(value) && 'file' in value) {
    // File has to be deleted
    if (value.removed) result = ''
    // File has not changed (will not be sent)
    else if (value.current || value.file === null) result = null
    else {
      return getFileContent(value.file, { base64: true }).then((content) => {
        return {
          [key]: content.replace(/data:[^;]*;base64,/, ''),
          [key + '[name]']: value.file.name,
        }
      })
    }
  } else if (isObjectLiteral(value) && 'separator' in value) {
    result = Object.values(value).join('')
  }

  // Returns a resolved Promise for non async values
  return Promise.resolve(key ? { [key]: result } : result)
}

/**
 * Convinient helper to properly parse a front-end form to its API equivalent.
 * This parse each values asynchronously, allow to inject keys into the final form and
 * make sure every async values resolves before resolving itself.
 *
 * @param {Object} formData
 * @return {Object}
 */
function formatFormDataValues(formData) {
  const promisedValues = Object.entries(formData).map(([key, value]) => {
    return formatFormDataValue(value, key)
  })

  return Promise.all(promisedValues).then((resolvedValues) => {
    return resolvedValues.reduce((form, obj) => ({ ...form, ...obj }), {})
  })
}

/**
 * Format a form produced by a vue view to be sent to the server.
 *
 * @param {Object} formData - An object literal containing form values.
 * @param {Object} [extraParams] - Optionnal params
 * @param {Array} [extraParams.extract] - An array of keys that should be extracted from the form.
 * @param {Boolean} [extraParams.flatten=false] - Flattens or not the passed formData.
 * @param {Boolean} [extraParams.removeEmpty=true] - Removes "empty" values from the object.
 * @return {Object} the parsed data to be sent to the server, with extracted values if specified.
 */
export async function formatFormData(
  formData,
  {
    extract = null,
    flatten = false,
    removeEmpty = true,
    removeNull = false,
  } = {},
) {
  const output = {
    data: {},
    extracted: {},
  }

  const values = await formatFormDataValues(formData)
  for (const key in values) {
    const type = extract && extract.includes(key) ? 'extracted' : 'data'
    const value = values[key]
    if (removeEmpty && isEmptyValue(value)) {
      continue
    } else if (removeNull && [null, undefined].includes(value)) {
      continue
    } else if (flatten && isObjectLiteral(value)) {
      flattenObjectLiteral(value, output[type])
    } else {
      output[type][key] = value
    }
  }

  const { data, extracted } = output
  return extract ? { data, ...extracted } : data
}
