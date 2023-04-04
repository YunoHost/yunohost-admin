import i18n from '@/i18n'
import store from '@/store'
import evaluate from 'simple-evaluate'
import * as validators from '@/helpers/validators'
import {
  isObjectLiteral,
  isEmptyValue,
  flattenObjectLiteral,
  getFileContent
} from '@/helpers/commons'


const NO_VALUE_FIELDS = [
  'ReadOnlyField',
  'ReadOnlyAlertItem',
  'MarkdownItem',
  'DisplayTextItem',
  'ButtonItem'
]

export const DEFAULT_STATUS_ICON = {
  [null]: null,
  danger: 'times',
  error: 'times',
  info: 'info',
  success: 'check',
  warning: 'warning'
}

/**
 * Tries to find a translation corresponding to the user's locale/fallback locale in a
 * Yunohost argument or simply return the string if it's not an object literal.
 *
 * @param {(Object|String|undefined)} field - A field value containing a translation object or string
 * @return {String}
 */
export function formatI18nField (field) {
  if (typeof field === 'string') return field
  const { locale, fallbackLocale } = store.state
  return field ? field[locale] || field[fallbackLocale] || field.en : ''
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
 * Evaluate config panel string expression that can contain regular expressions.
 * Expression are evaluated with the config panel form as context.
 *
 * @param {String} expression - A String to evaluate.
 * @param {Object} forms - A nested form used in config panels.
 * @return {Boolean} - expression evaluation result.
 */
export function evaluateExpression (expression, forms) {
  if (!expression) return true
  if (expression === '"false"') return false

  const context = Object.values(forms).reduce((ctx, args) => {
    Object.entries(args).forEach(([name, value]) => {
      ctx[name] = isObjectLiteral(value) && 'file' in value ? value.content : value
    })
    return ctx
  }, {})

  // Allow to use match(var,regexp) function
  const matchRe = /match(\s*(\w+)\s*,\s*"([^"]+)"\s*)/g
  for (const matched of expression.matchAll(matchRe)) {
    const [fullMatch, varMatch, regExpMatch] = matched
    const varName = varMatch + '__re' + matched.index
    context[varName] = new RegExp(regExpMatch, 'm').test(context[varMatch])
    expression = expression.replace(fullMatch, varName)
  }

  try {
    return !!evaluate(context, expression)
  } catch {
    return false
  }
}

// Adds a property to an Object that will dynamically returns a expression evaluation result.
function addEvaluationGetter (prop, obj, expr, ctx) {
  Object.defineProperty(obj, prop, {
    get: () => evaluateExpression(expr, ctx)
  })
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
    is: arg.readonly ? 'ReadOnlyField' : 'FormField',
    visible: [undefined, true, '"true"'].includes(arg.visible),
    props: {
      label: arg.ask,
      component: undefined,
      props: {}
    }
  }

  const defaultProps = ['id:name', 'placeholder:example']
  const components = [
    {
      types: ['string', 'path'],
      name: 'InputItem',
      props: defaultProps.concat(['autocomplete', 'trim', 'choices'])
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
          arg.help = i18n.t('good_practices_about_admin_password')
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
        validation.numValue = validators.integer
      }
    },
    {
      types: ['select', 'user', 'domain', 'app', 'group'],
      name: 'SelectItem',
      props: ['id:name', 'choices'],
      callback: function () {
        if (arg.type !== 'select') {
          field.props.link = { name: arg.type + '-list', text: i18n.t(`manage_${arg.type}s`) }
        }
      }
    },
    {
      types: ['file'],
      name: 'FileItem',
      props: defaultProps.concat(['accept']),
      callback: function () {
        value = {
          // in case of already defined file, we receive only the file path (not the actual file)
          file: value ? new File([''], value) : null,
          content: '',
          current: !!value,
          removed: false
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
        if (arg.choices && arg.choices.length) {
          this.name = 'TagsSelectizeItem'
          Object.assign(field.props.props, {
            auto: true,
            itemsName: '',
            label: arg.placeholder
          })
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
      renderSelf: true
    },
    {
      types: ['markdown'],
      name: 'MarkdownItem',
      props: ['label:ask'],
      renderSelf: true
    },
    {
      types: ['display_text'],
      name: 'DisplayTextItem',
      props: ['label:ask'],
      renderSelf: true
    },
    {
      types: ['button'],
      name: 'ButtonItem',
      props: ['type:style', 'label:ask', 'icon', 'enabled'],
      renderSelf: true
    }
  ]

  // Default type management if no one is filled
  if (arg.choices && arg.choices.length) {
    arg.type = 'select'
  }
  if (arg.type === undefined) {
    arg.type = 'string'
  }

  // Search the component bind to the type
  const component = components.find(element => element.types.includes(arg.type))
  if (component === undefined) throw new TypeError('Unknown type: ' + arg.type)

  // Callback use for specific behaviour
  if (component.callback) component.callback()
  field.props.component = component.name
  // Affect properties to the field Item
  for (let prop of component.props) {
    prop = prop.split(':')
    const propName = prop[0]
    const argName = prop.slice(-1)[0]
    if (argName in arg) {
      field.props.props[propName] = arg[argName]
    }
  }

  // Required (no need for checkbox its value can't be null)
  if (!component.renderSelf && arg.type !== 'boolean' && arg.optional !== true) {
    validation.required = validators.required
  }
  if (arg.pattern && arg.type !== 'tags') {
    validation.pattern = validators.helpers.regex(formatI18nField(arg.pattern.error), new RegExp(arg.pattern.regexp))
  }

  if (!component.renderSelf && !arg.readonly) {
    // Bind a validation with what the server may respond
    validation.remote = validators.helpers.withParams(error, (v) => {
      const result = !error.message
      error.message = null
      return result
    })
  }

  // Default value if still `null`
  if (value === null && arg.current_value) {
    value = arg.current_value
  }
  if (value === null && arg.default) {
    value = arg.default
  }

  // Help message
  if (arg.help) {
    field.props.description = formatI18nField(arg.help)
  }

  // Help message
  if (arg.helpLink) {
    field.props.link = { href: arg.helpLink.href, text: i18n.t(arg.helpLink.text) }
  }

  if (component.renderSelf) {
    field.is = field.props.component
    field.props = field.props.props
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
 * @param {Object|null} forms - nested form used as the expression evualuations context.
 * @return {Object} an object containing all parsed values to be used in vue views.
 */
export function formatYunoHostArguments (args, forms) {
  const form = {}
  const fields = {}
  const validations = {}
  const errors = {}

  for (const arg of args) {
    const { value, field, validation, error } = formatYunoHostArgument(arg)
    fields[arg.name] = field
    form[arg.name] = value
    if (validation) validations[arg.name] = validation
    errors[arg.name] = error

    if ('visible' in arg && ![false, '"false"'].includes(arg.visible)) {
      addEvaluationGetter('visible', field, arg.visible, forms)
    }

    if ('enabled' in arg) {
      addEvaluationGetter('enabled', field.props, arg.enabled, forms)
    }
  }

  return { form, fields, validations, errors }
}


export function formatYunoHostConfigPanels (data) {
  const result = {
    panels: [],
    forms: {},
    validations: {},
    errors: {}
  }

  for (const { id: panelId, name, help, sections } of data.panels) {
    const panel = { id: panelId, sections: [], serverError: '', hasApplyButton: false }
    result.forms[panelId] = {}
    result.validations[panelId] = {}
    result.errors[panelId] = {}

    if (name) panel.name = formatI18nField(name)
    if (help) panel.help = formatI18nField(help)

    for (const _section of sections) {
      const section = {
        id: _section.id,
        isActionSection: _section.is_action_section,
        visible: [undefined, true, '"true"'].includes(_section.visible)
      }
      if (_section.help) section.help = formatI18nField(_section.help)
      if (_section.name) section.name = formatI18nField(_section.name)
      if (_section.visible && ![false, '"false"'].includes(_section.visible)) {
        addEvaluationGetter('visible', section, _section.visible, result.forms)
      }

      const {
        form,
        fields,
        validations,
        errors
      } = formatYunoHostArguments(_section.options, result.forms)
      // Merge all sections forms to the panel to get a unique form
      Object.assign(result.forms[panelId], form)
      Object.assign(result.validations[panelId], validations)
      Object.assign(result.errors[panelId], errors)
      section.fields = fields
      panel.sections.push(section)

      if (!section.isActionSection && Object.values(fields).some((field) => !NO_VALUE_FIELDS.includes(field.is))) {
        panel.hasApplyButton = true
      }
    }

    result.panels.push(panel)
  }

  return result
}


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
export function formatFormDataValue (value, key = null) {
  if (Array.isArray(value)) {
    return Promise.all(
      value.map(value_ => formatFormDataValue(value_))
    ).then(resolvedValues => ({ [key]: resolvedValues }))
  }

  let result = value
  if (typeof value === 'boolean') result = value ? 1 : 0
  if (isObjectLiteral(value) && 'file' in value) {
    // File has to be deleted
    if (value.removed) result = ''
    // File has not changed (will not be sent)
    else if (value.current || value.file === null) result = null
    else {
      return getFileContent(value.file, { base64: true }).then(content => {
        return {
          [key]: content.replace(/data:[^;]*;base64,/, ''),
          [key + '[name]']: value.file.name
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
function formatFormDataValues (formData) {
  const promisedValues = Object.entries(formData).map(([key, value]) => {
    return formatFormDataValue(value, key)
  })

  return Promise.all(promisedValues).then(resolvedValues => {
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
export async function formatFormData (
  formData,
  { extract = null, flatten = false, removeEmpty = true, removeNull = false } = {}
) {
  const output = {
    data: {},
    extracted: {}
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
