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
  let value = (arg.value !== undefined) ? arg.value : (arg.current_value !== undefined) ? arg.current_value : null
  const validation = {}
  const error = { message: null }
  arg.ask = formatI18nField(arg.ask)
  const field = {
    component: undefined,
    label: arg.ask,
    props: {}
  }
  const defaultProps = ['id:name', 'placeholder:example']
  const components = [
    {
      types: [undefined, 'string', 'path'],
      name: 'InputItem',
      props: defaultProps.concat(['autocomplete', 'trim', 'choices']),
      callback: function () {
        if (arg.choices) {
            arg.type = 'select'
            this.name = 'SelectItem'
        }
      }
    },
    {
      types: ['email', 'url', 'date', 'time', 'color'],
      name: 'InputItem',
      props: defaultProps.concat(['type', 'trim'])
    },
    {
      types: ['password'],
      name: 'InputItem',
      props: defaultProps.concat(['type', 'autocomplete', 'trim']),
      callback: function () {
        if (!arg.help) {
          arg.help = 'good_practices_about_admin_password'
        }
        arg.example = '••••••••••••'
        validation.passwordLenght = validators.minLength(8)
      }
    },
    {
      types: ['number', 'range'],
      name: 'InputItem',
      props: defaultProps.concat(['type', 'min', 'max', 'step']),
      callback: function () {
        if (!isNaN(parseInt(arg.min))) {
          validation.minValue = validators.minValue(parseInt(arg.min))
        }
        if (!isNaN(parseInt(arg.max))) {
          validation.maxValue = validators.maxValue(parseInt(arg.max))
        }
        validation.numValue = validators.helpers.regex('Please provide an integer', new RegExp('^-?[0-9]+$'))
      }
    },
    {
      types: ['select'],
      name: 'SelectItem',
      props: ['id:name', 'choices']
    },
    {
      types: ['user', 'domain'],
      name: 'SelectItem',
      props: ['id:name', 'choices'],
      callback: function () {
        field.link = { name: arg.type + '-list', text: i18n.t(`manage_${arg.type}s`) }
        field.props.choices = store.getters[arg.type + 'sAsChoices']
        if (value) {
          return
        }
        if (arg.type === 'domain') {
          value = store.getters.mainDomain
        } else {
          value = field.props.choices.length ? field.props.choices[0].value : null
        }
      }
    },
    {
      types: ['file'],
      name: 'FileItem',
      props: defaultProps.concat(['accept']),
      callback: function () {
        if (value) {
          value = new File([''], value)
          value.currentfile = true
        }
      }
    },
    {
      types: ['text'],
      name: 'TextAreaItem',
      props: defaultProps
    },
    {
      types: ['tags'],
      name: 'TagsItem',
      props: defaultProps.concat(['limit', 'placeholder', 'options:choices', 'tagIcon:icon']),
      callback: function () {
        if (arg.choices) {
            this.name = 'TagsSelectizeItem'
            field.props.auto = true
            field.props.itemsName = ''
            field.props.label = arg.placeholder
        }
        if (typeof value === 'string') {
          value = value.split(',')
        } else if (!value) {
          value = []
        }
      }
    },
    {
      types: ['boolean'],
      name: 'CheckboxItem',
      props: ['id:name', 'choices'],
      callback: function () {
        if (value !== null && value !== undefined) {
          value = ['1', 'yes', 'y', 'true'].includes(String(value).toLowerCase())
        } else if (arg.default !== null && arg.default !== undefined) {
          value = ['1', 'yes', 'y', 'true'].includes(String(arg.default).toLowerCase())
        }
      }
    },
    {
      types: ['alert'],
      name: 'ReadOnlyAlertItem',
      props: ['type:style', 'label:ask', 'icon'],
      readonly: true
    },
    {
      types: ['markdown', 'display_text'],
      name: 'MarkdownItem',
      props: ['label:ask'],
      readonly: true
    }
  ]

  // Default type management if no one is filled
  if (arg.type === undefined) {
    arg.type = (arg.choices === undefined) ? 'string' : 'select'
  }
  // Search the component bind to the type
  const component = components.find(element => element.types.includes(arg.type))
  if (component === undefined) throw new TypeError('Unknown type: ' + arg.type)
  // Callback use for specific behaviour
  if (component.callback) component.callback()
  field.component = component.name
  // Affect properties to the field Item
  for (let prop of component.props) {
    prop = prop.split(':')
    const propName = prop[0]
    const argName = prop.slice(-1)[0]
    if (argName in arg) {
      field.props[propName] = arg[argName]
    }
  }
  // We don't want to display a label html item as this kind or field contains
  // already the text to display
  if (component.readonly) delete field.label
  // Required (no need for checkbox its value can't be null)
  else if (field.component !== 'CheckboxItem' && arg.optional !== true) {
    validation.required = validators.required
  }
  if (arg.pattern && arg.type !== 'tags') {
    // validation.pattern = validators.helpers.withMessage(arg.pattern.error,
    validation.pattern = validators.helpers.regex(arg.pattern.error, new RegExp(arg.pattern.regexp))
  }
  validation.remote = validators.helpers.withParams(error, (v) => {
    const result = !error.message
    error.message = null
    return result
  })


  // field.props['title'] = field.pattern.error
  // Default value if still `null`
  if (value === null && arg.current_value) {
    value = arg.current_value
  }
  if (value === null && arg.default) {
    value = arg.default
  }

  // Help message
  if (arg.help) {
    field.description = formatI18nField(arg.help)
  }

  // Help message
  if (arg.helpLink) {
    field.link = { href: arg.helpLink.href, text: i18n.t(arg.helpLink.text) }
  }

  if (arg.visible) {
    field.visible = arg.visible
    // Temporary value to wait visible expression to be evaluated
    field.isVisible = true
  }

  return {
    value,
    field,
    // Return null instead of empty object if there's no validation
    validation: Object.keys(validation).length === 0 ? null : validation,
    error
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
  const form = {}
  const fields = {}
  const validations = {}
  const errors = {}

  // FIXME yunohost should add the label field by default
  if (name) {
    args.unshift({
      ask: i18n.t('label_for_manifestname', { name }),
      default: name,
      name: 'label'
    })
  }

  for (const arg of args) {
    const { value, field, validation, error } = formatYunoHostArgument(arg)
    fields[arg.name] = field
    form[arg.name] = value
    if (validation) validations[arg.name] = validation
    errors[arg.name] = error
  }

  return { form, fields, validations, errors }
}

export function pFileReader (file, output, key, base64 = true) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader()
        fr.onerror = reject
        fr.onload = () => {
          output[key] = fr.result
          if (base64) {
            output[key] = fr.result.replace(/data:[^;]*;base64,/, '')
          }
          output[key + '[name]'] = file.name
          resolve()
        }
        if (base64) {
          fr.readAsDataURL(file)
        } else {
          fr.readAsText(file)
        }
    })
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
  { extract = null, flatten = false, removeEmpty = true, removeNull = false, promise = false } = {}
) {
  const output = {
    data: {},
    extracted: {}
  }
  const promises = []
  for (const key in formData) {
    const type = extract && extract.includes(key) ? 'extracted' : 'data'
    const value = Array.isArray(formData[key])
      ? formData[key].map(item => formatFormDataValue(item))
      : formatFormDataValue(formData[key])

    if (removeEmpty && isEmptyValue(value)) {
      continue
    } else if (removeNull && (value === null || value === undefined)) {
      continue
    } else if (value instanceof File) {
      if (value.currentfile) {
          continue
      } else if (value._removed) {
          output[type][key] = ''
          continue
      }
      promises.push(pFileReader(value, output[type], key))
    } else if (flatten && isObjectLiteral(value)) {
      flattenObjectLiteral(value, output[type])
    } else {
      output[type][key] = value
    }
  }
  const { data, extracted } = output
  if (promises.length > 0 || promise) {
    return new Promise((resolve, reject) => {
      Promise.all(promises).then((value) => {
        resolve(data)
      })
    })
  } else {
    return extract ? { data, ...extracted } : data
  }
}
