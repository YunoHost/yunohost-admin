import i18n from '@/i18n'
import store from '@/store'
import * as validators from '@/helpers/validators'
import { isObjectLiteral, isEmptyValue, flattenObjectLiteral } from '@/helpers/commons'


/**
 * Tries to find a translation corresponding to the user's locale/fallback locale in a
 * Yunohost argument or simply return the string if it's not an object literal.
 *
 * @param {(Object|String)} field - A field value containing a translation object or string
 * @return {String}
 */
export function formatI18nField (field) {
  if (typeof field === 'string') return field
  const { locale, fallbackLocale } = store.state
  return field[locale] || field[fallbackLocale] || field.en
}


/**
 * Returns a string size declaration to a M value.
 *
 * @param {String} sizeStr - A size declared like '500M' or '56k'
 * @return {Number}
 */
export function sizeToM (sizeStr) {
  const unit = sizeStr.slice(-1)
  const value = sizeStr.slice(0, -1)
  if (unit === 'M') return parseInt(value)
  if (unit === 'b') return Math.ceil(value / (1024 * 1024))
  if (unit === 'k') return Math.ceil(value / 1024)
  if (unit === 'G') return Math.ceil(value * 1024)
  if (unit === 'T') return Math.ceil(value * 1024 * 1024)
}


/**
 * Returns a formatted address element to be used by AdressInputSelect component.
 *
 * @param {String} address - A string representing an adress (subdomain or email)
 * @return {Object} - `{ localPart, separator, domain }`.
 */
export function adressToFormValue (address) {
  const separator = address.includes('@') ? '@' : '.'
  const [localPart, domain] = address.split(separator)
  return { localPart, separator, domain }
}


/**
 * Format app install, actions and config panel argument into a data structure that
 * will be automaticly transformed into a component on screen.
 *
 * @param {Object} arg - a yunohost arg options written by a packager.
 * @return {Object} an formated argument containing formItem props, validation and base value.
 */
export function formatYunoHostArgument (arg) {
  let value = null
  const validation = {}
  const field = {
    component: undefined,
    label: formatI18nField(arg.ask),
    props: {}
  }

  if (arg.type === 'boolean') {
    field.id = arg.name
  } else {
    field.props.id = arg.name
  }

  // Some apps has an argument type `string` as type but expect a select since it has `choices`
  if (arg.choices !== undefined) {
    field.component = 'SelectItem'
    field.props.choices = arg.choices
  // Input
  } else if ([undefined, 'string', 'number', 'password', 'email'].includes(arg.type)) {
    field.component = 'InputItem'
    if (![undefined, 'string'].includes(arg.type)) {
      field.props.type = arg.type
      if (arg.type === 'password') {
        field.description = i18n.t('good_practices_about_admin_password')
        field.placeholder = '••••••••'
        validation.passwordLenght = validators.minLength(8)
      }
    }
  // Checkbox
  } else if (arg.type === 'boolean') {
    field.component = 'CheckboxItem'
    if (typeof arg.default === 'number') {
      value = arg.default === 1
    } else {
      value = arg.default || false
    }
  // Special (store related)
  } else if (['user', 'domain'].includes(arg.type)) {
    field.component = 'SelectItem'
    field.link = { name: arg.type + '-list', text: i18n.t(`manage_${arg.type}s`) }
    field.props.choices = store.getters[arg.type + 'sAsChoices']
    if (arg.type === 'domain') {
      value = store.getters.mainDomain
    } else {
      value = field.props.choices.length ? field.props.choices[0].value : null
    }

  // Unknown from the specs, try to display it as an input[text]
  // FIXME throw an error instead ?
  } else {
    field.component = 'InputItem'
  }

  // Required (no need for checkbox its value can't be null)
  if (field.component !== 'CheckboxItem' && arg.optional !== true) {
    validation.required = validators.required
  }
  // Default value if still `null`
  if (value === null && arg.default) {
    value = arg.default
  }
  // Help message
  if (arg.help) {
    field.description = formatI18nField(arg.help)
  }
  // Example
  if (arg.example) {
    field.example = arg.example
    if (field.component === 'InputItem') {
      field.props.placeholder = field.example
    }
  }

  return {
    value,
    field,
    // Return null instead of empty object if there's no validation
    validation: Object.keys(validation).length === 0 ? null : validation
  }
}


/**
 * Format app install, actions and config panel manifest args into a form that can be used
 * as v-model values, fields that can be passed to a FormField component and validations.
 *
 * @param {Array} args - a yunohost arg array written by a packager.
 * @param {String} name - (temp) an app name to build a label field in case of manifest install args
 * @return {Object} an object containing all parsed values to be used in vue views.
 */
export function formatYunoHostArguments (args, name = null) {
  let disclaimer = null
  const form = {}
  const fields = {}
  const validations = {}

  // FIXME yunohost should add the label field by default
  if (name) {
    args.unshift({
      ask: i18n.t('label_for_manifestname', { name }),
      default: name,
      name: 'label'
    })
  }

  for (const arg of args) {
    if (arg.type === 'display_text') {
      disclaimer = formatI18nField(arg.ask)
    } else {
      const { value, field, validation } = formatYunoHostArgument(arg)
      fields[arg.name] = field
      form[arg.name] = value
      if (validation) validations[arg.name] = validation
    }
  }

  return { form, fields, validations, disclaimer }
}


/**
 * Format helper for a form value.
 * Convert Boolean to (1|0) and concatenate adresses.
 *
 * @param {*} value
 * @return {*}
 */
export function formatFormDataValue (value) {
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  } else if (isObjectLiteral(value) && 'separator' in value) {
    return Object.values(value).join('')
  }
  return value
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
export function formatFormData (
  formData,
  { extract = null, flatten = false, removeEmpty = true } = {}
) {
  const output = {
    data: {},
    extracted: {}
  }
  for (const key in formData) {
    const type = extract && extract.includes(key) ? 'extracted' : 'data'
    const value = Array.isArray(formData[key])
      ? formData[key].map(item => formatFormDataValue(item))
      : formatFormDataValue(formData[key])

    if (removeEmpty && isEmptyValue(value)) {
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
