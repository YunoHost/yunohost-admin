import i18n from '@/i18n'
import store from '@/store'

export function formatI18nField (field) {
  if (typeof field === 'string') return field
  const { locale, fallbackLocale } = store.state
  return field[locale] || field[fallbackLocale] || field.en
}

export function formatYunoHostArgument (_arg) {
  const arg = {
    component: undefined,
    label: formatI18nField(_arg.ask),
    props: { id: _arg.name, value: null }
  }

  // Some apps has `string` as type but expect a select since it has `choices`
  if (_arg.choices !== undefined) {
    arg.component = 'SelectItem'
    arg.props.choices = _arg.choices
  // Input
  } else if ([undefined, 'string', 'number', 'password', 'email'].includes(_arg.type)) {
    arg.component = 'InputItem'
    if (![undefined, 'string'].includes(_arg.type)) {
      arg.props.type = _arg.type
      if (_arg.type === 'password') {
        arg.description = i18n.t('good_practices_about_admin_password')
      }
    }
  // Checkbox
  } else if (_arg.type === 'boolean') {
    arg.component = 'CheckboxItem'
    arg.props.value = _arg.default || false
  // Special (store related)
  } else if (['user', 'domain'].includes(_arg.type)) {
    arg.component = 'SelectItem'
    arg.link = { name: _arg.type + '-list', text: i18n.t(`manage_${_arg.type}s`) }
    arg.props = { ...arg.props, ...store.getters[_arg.type + 'sAsOptions'] }
  // Unknown from the specs, try to display it as an input[text]
  // FIXME throw an error instead ?
  } else {
    arg.component = 'InputItem'
  }

  // Required
  if (arg.component === 'InputItem') {
    arg.props.required = _arg.optional !== true
  }
  // Default value
  if (_arg.default) {
    arg.props.value = _arg.default
  }
  // Help message
  if (_arg.help) {
    arg.description = formatI18nField(_arg.help)
  }
  // Example
  if (_arg.example) {
    arg.example = _arg.example
    if (arg.component === 'InputItem') {
      arg.props.placeholder = arg.example
    }
  }

  return arg
}
