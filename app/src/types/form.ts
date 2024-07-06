import type {
  BaseValidation,
  ValidationArgs,
  ValidationRuleCollection,
} from '@vuelidate/core'
import type { RouteLocationRaw } from 'vue-router'

import type { Cols } from '@/types/commons'

type StateValidation = false | null
type StateVariant = 'success' | 'info' | 'warning' | 'danger'

// DISPLAY

type BaseDisplayItemProps = {
  label: string
  id?: string
}

export type ButtonItemProps = BaseDisplayItemProps & {
  // FIXME compute enabled JSExpression
  enabled?: boolean
  icon?: string
  type?: StateVariant
}

export type DisplayTextItemProps = BaseDisplayItemProps

export type MarkdownItemProps = BaseDisplayItemProps

export type ReadOnlyAlertItemProps = BaseDisplayItemProps & {
  icon?: string
  type?: StateVariant
}

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

export type SelectItemProps = BaseWritableItemProps & {
  choices: string[] | { text: string; value: string }[]
}

export type TagsItemProps = BaseWritableItemProps & {
  limit?: number
  // FIXME no options on BFormTags?
  // options?: string[]
}

export type TagsSelectizeItemProps = BaseWritableItemProps & {
  itemsName: string
  options: string[]
  auto?: boolean
  disabledItems?: string[]
  label: string
  limit?: number
  noTags?: boolean
  tagIcon?: string
}

export type TextAreaItemProps = BaseWritableItemProps & {
  // type?: string // FIXME unused?
}

// FIELDS

const ANY_WRITABLE_COMPONENTS = [
  'AdressItem',
  'CheckboxItem',
  'FileItem',
  'InputItem',
  'SelectItem',
  'TagsItem',
  'TagsSelectizeItem',
  'TextAreaItem',
] as const

export type AnyWritableComponents = (typeof ANY_WRITABLE_COMPONENTS)[number]
type ItemComponentToItemProps = {
  // WRITABLE
  AdressItem: AdressItemProps
  CheckboxItem: CheckboxItemProps
  FileItem: FileItemProps
  InputItem: InputItemProps
  SelectItem: SelectItemProps
  TagsItem: TagsItemProps
  TagsSelectizeItem: TagsSelectizeItemProps
  TextAreaItem: TextAreaItemProps
}

type FormFieldRules<MV extends any> = MV extends object
  ? MV extends any[]
    ? ValidationArgs<FormFieldRules<ArrInnerType<MV>>>
    : ValidationArgs<MV | Partial<MV>>
  : ValidationRuleCollection<MV>

type BaseFormFieldComputedProps<MV extends any = any> = {
  modelValue?: MV
  validation?: BaseValidation
}

type BaseFormField<C extends AnyItemComponents> = {
  component: C
  hr?: boolean
  id?: string
  label?: string
  props?: ItemComponentToItemProps[C]
  readonly?: boolean
  // FIXME compute visible JSExpression
  visible?: boolean
}

export type FormField<
  C extends AnyWritableComponents = AnyWritableComponents,
  MV extends any = any,
> = BaseFormField<C> & {
  append?: string
  asInputGroup?: boolean
  description?: string
  descriptionVariant?: StateVariant
  labelFor?: string
  link?:
    | { text: string; name: RouteLocationRaw }
    | { text: string; href: string }
  props: ItemComponentToItemProps[C]
  rules?: FormFieldRules<MV>
  prepend?: string
  readonly?: false
}

type FormFieldReadonly<
  C extends AnyWritableComponents = AnyWritableComponents,
> = BaseFormField<C> & {
  label: string
  cols?: Cols
  readonly: true
}

export type FormFieldProps<
  C extends AnyWritableComponents,
  MV extends any,
> = Omit<FormField<C, MV>, 'hr' | 'visible' | 'readonly'> &
  BaseFormFieldComputedProps<MV>

export type FormFieldReadonlyProps<
  C extends AnyWritableComponents,
  MV extends any,
> = Omit<FormFieldReadonly<C>, 'hr' | 'visible' | 'readonly'> & {
  modelValue?: MV
}
