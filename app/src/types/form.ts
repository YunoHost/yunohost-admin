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
export type Choice = string | { text: string; value: string }
type Choices = Choice[]

export type TagUpdateArgs = {
  action: 'add' | 'remove'
  tag: string
  applyFn: (tag: string) => void
}

// DISPLAY

type BaseDisplayItemProps = {
  label: string
  id?: string
}

export type ButtonItemProps = BaseDisplayItemProps & {
  // FIXME compute enabled JSExpression
  id: string
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
  disabled?: boolean
}

export type BaseItemComputedProps = {
  ariaDescribedby?: string | string[]
  state?: StateValidation
  validation?: BaseValidation
}

export type AdressItemProps = BaseWritableItemProps & {
  choices: Choices
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
  // choices: Choices
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
  // choices?: Choices FIXME rm ?
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
  choices: Choices
}

export type TagsItemProps = BaseWritableItemProps & {
  limit?: number
  // FIXME no options on BFormTags?
  // options?: string[]
}

export type TagsSelectizeItemProps = BaseWritableItemProps & {
  itemsName: string
  options: Choices
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

export type ItemComponentToItemProps = {
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

type BaseFormFieldComputedProps = {
  validation?: BaseValidation
}

type BaseFormField<C extends AnyItemComponents> = {
  component?: C
  cProps?: ItemComponentToItemProps[C]
  hr?: boolean
  id?: string
  label?: string
  readonly?: boolean
  visible?: boolean | ComputedRef<boolean>
}

export type FormField<
  C extends AnyWritableComponents = AnyWritableComponents,
  MV extends any = any,
> = BaseFormField<C> & {
  append?: string
  asInputGroup?: boolean
  cProps?: ItemComponentToItemProps[C]
  description?: string
  descriptionVariant?: StateVariant
  labelFor?: string
  link?:
    | { text: string; name: RouteLocationRaw }
    | { text: string; href: string }
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
  rules?: undefined
}

export type FormFieldDisplay<
  C extends AnyDisplayComponents = AnyDisplayComponents,
> = {
  component?: C
  cProps?: ItemComponentToItemProps[C]
  visible?: boolean | ComputedRef<boolean>
  hr?: boolean
  readonly?: true
  rules?: undefined
}

export type FormFieldProps<
  C extends AnyWritableComponents,
  MV extends any,
> = Omit<FormField<C, MV>, 'hr' | 'visible' | 'readonly'> &
  BaseFormFieldComputedProps

export type FormFieldReadonlyProps<C extends AnyWritableComponents> = Omit<
  FormFieldReadonly<C>,
  'hr' | 'visible' | 'readonly' | 'rules'
>

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
  C extends AnyItemComponents = AnyItemComponents,
  MV extends any = never,
> = C extends AnyWritableComponents
  ?
      | (FormField<C, MV> & { component: C })
      | (FormFieldReadonly<C> & { component: C })
  : C extends AnyDisplayComponents
    ? FormFieldDisplay<C> & { component: C }
    : never

export function isFileModelValue(value: any): value is FileModelValue {
  return isObjectLiteral(value) && 'file' in value
}

export function isAdressModelValue(value: any): value is AdressModelValue {
  return isObjectLiteral(value) && 'separator' in value
}
