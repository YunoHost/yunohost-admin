import { helpers } from 'vuelidate/lib/validators'

const alphalownum_ = helpers.regex('alphalownum_', /^[a-z0-9_]+$/)

const includes = items => item => helpers.withParams(
  { type: 'includes', value: item }, (item) => {
  return items ? items.includes(item) : false
})(item)

const unique = items => item => helpers.withParams(
  { type: 'unique', arg: items, value: item },
  item => items ? !items.includes(item) : true
)(item)

export {
  alphalownum_,
  includes,
  unique
}
