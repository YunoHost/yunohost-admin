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

export type CheckboxItemProps = BaseWritableItemProps & {
  label?: string
  labels?: { true: string; false: string }
  // FIXME unused?
  // choices: string[]
}

export type FileItemProps = BaseWritableItemProps & {
  accept?: string | string[]
  dropPlaceholder?: string
}
export type FileModelValue = {
  file: File | null
  content?: string | null
  current?: boolean
  removed?: boolean
}

export type InputItemProps = BaseWritableItemProps & {
  autocomplete?:
    | 'off'
    | 'on'
    | 'name'
    | 'email'
    | 'username'
    | 'new-password'
    | 'current-password'
    | 'url'
  // pattern?: object
  // choices?: string[] FIXME rm ?
  step?: number
  trim?: boolean
  type?:
    | 'color'
    | 'date'
    // | 'datetime-local'
    | 'email'
    | 'number'
    | 'password'
    | 'range'
    // | 'search'
    | 'text'
    | 'time'
    | 'url'
}
