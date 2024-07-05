import type { BaseValidation } from '@vuelidate/core'
type StateValidation = false | null

// WRITABLE

type BaseWritableItemProps = {
  id?: string
  name?: string
  placeholder?: string
  touchKey?: string
}

export type BaseItemComputedProps<MV extends any = any> = {
  ariaDescribedby?: string | string[]
  modelValue?: MV
  state?: StateValidation
  validation?: BaseValidation
}

export type AdressItemProps = BaseWritableItemProps & {
  choices: string[]
  type?: 'domain' | 'email'
}
export type AdressModelValue = {
  localPart: string | null
  separator: string
  domain: string | null
}
