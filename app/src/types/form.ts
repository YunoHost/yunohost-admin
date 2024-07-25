import type {
  BaseValidation,
  ValidationArgs,
  ValidationRuleCollection,
} from '@vuelidate/core'
import type { ComputedRef } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import { isObjectLiteral } from '@/helpers/commons'
import type { ArrInnerType, Cols, Obj, StateVariant } from '@/types/commons'

type StateValidation = false | null

// DISPLAY

type BaseDisplayItemProps = {
  label: string
  id?: string
}

export type ButtonItemProps = BaseDisplayItemProps & {
  // FIXME compute enabled JSExpression
  enabled?: boolean | ComputedRef<boolean>
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

export type AnyDisplayItemProps =
  | ButtonItemProps
  | DisplayTextItemProps
  | MarkdownItemProps
  | ReadOnlyAlertItemProps
export type AnyWritableItemProps =
  | AdressItemProps
  | CheckboxItemProps
  | FileItemProps
  | InputItemProps
  | SelectItemProps
  | TagsItemProps
  | TagsSelectizeItemProps
  | TextAreaItemProps

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
const ANY_DISPLAY_COMPONENTS = [
  'ButtonItem',
  'DisplayTextItem',
  'MarkdownItem',
  'ReadOnlyAlertItem',
] as const

type AnyItemComponents = AnyDisplayComponents | AnyWritableComponents
export type AnyDisplayComponents = (typeof ANY_DISPLAY_COMPONENTS)[number]
export type AnyWritableComponents = (typeof ANY_WRITABLE_COMPONENTS)[number]

export function isWritableComponent<MV extends any = any>(
  field:
    | FormField<AnyWritableComponents, MV>
    | FormField
    | FormFieldReadonly
    | FormFieldDisplay,
): field is
  | FormField<AnyWritableComponents, MV>
  | FormFieldReadonly<AnyWritableComponents> {
  return ANY_WRITABLE_COMPONENTS.includes(
    field.component as AnyWritableComponents,
  )
}

export function isDisplayComponent(
  field:
    | FormField<AnyWritableComponents>
    | FormField
    | FormFieldReadonly
    | FormFieldDisplay,
): field is FormFieldDisplay {
  return ANY_DISPLAY_COMPONENTS.includes(
    field.component as AnyDisplayComponents,
  )
}

export function isNonWritableComponent(
  field:
    | FormField<AnyWritableComponents>
    | FormField
    | FormFieldReadonly
    | FormFieldDisplay,
): field is FormFieldDisplay | FormFieldReadonly {
  return isDisplayComponent(field) || !!field.readonly
}

type ItemComponentToItemProps = {
  // DISPLAY
  ButtonItem: ButtonItemProps
  DisplayTextItem: DisplayTextItemProps
  MarkdownItem: MarkdownItemProps
  ReadOnlyAlertItem: ReadOnlyAlertItemProps
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
  visible?: boolean | ComputedRef<boolean>
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

export type FormFieldReadonly<
  C extends AnyWritableComponents = AnyWritableComponents,
> = BaseFormField<C> & {
  label: string
  cols?: Cols
  readonly: true
}

export type FormFieldDisplay<
  C extends AnyDisplayComponents = AnyDisplayComponents,
> = {
  component: C
  props: ItemComponentToItemProps[C]
  visible?: boolean | ComputedRef<boolean>
  hr?: boolean
  readonly?: true
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

export type FormFieldDict<T extends Obj = Obj> = {
  [k in keyof T | string]: k extends keyof T
    ?
        | FormField<AnyWritableComponents, T[k]>
        | FormFieldReadonly<AnyWritableComponents>
    :
        | FormField<AnyWritableComponents>
        | FormFieldReadonly<AnyWritableComponents>
        | FormFieldDisplay<AnyDisplayComponents>
}

// Type to check if object satisfies specified Field and Item
export type FieldProps<
  C extends AnyItemComponents = 'InputItem',
  MV extends any = never,
> = C extends AnyWritableComponents
  ? FormField<C, MV> | FormFieldReadonly<C>
  : C extends AnyDisplayComponents
    ? FormFieldDisplay<C>
    : never

export function isFileModelValue(value: any): value is FileModelValue {
  return isObjectLiteral(value) && 'file' in value
}

export function isAdressModelValue(value: any): value is AdressModelValue {
  return isObjectLiteral(value) && 'separator' in value
}
