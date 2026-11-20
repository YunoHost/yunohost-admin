import { toValue, type MaybeRef } from 'vue'

import { useSettings } from '@/composables/useSettings'
import { isEmptyValue, toEntries } from '@/helpers/commons'
import type {
  ArrInnerType,
  Obj,
  StateStatus,
  Translation,
} from '@/types/commons'
import type { AdressModelValue, FileModelValue } from '@/types/form'
import { isAdressModelValue, isFileModelValue } from '@/types/form'

export const STATUS_VARIANT = {
  pending: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  info: 'info',
} as const

export const DEFAULT_VARIANT_ICON = {
  primary: null,
  secondary: null,
  success: 'check',
  danger: 'times',
  warning: 'warning',
  info: 'info',
  light: null,
  dark: null,
  best: null,
} as const

export function isOkStatus(status: StateStatus): status is 'info' | 'success' {
  return ['info', 'success'].includes(status)
}

// FORMAT FROM CORE

/**
 * Tries to find a translation corresponding to the user's locale/fallback locale in a
 * Yunohost argument or simply return the string if it's not an object literal.
 *
 * @param field - A field value containing a translation object or string
 * @return translated field or empty string
 */
export function formatI18nField(field?: Translation): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  const { locale, fallbackLocale } = useSettings()
  return field[locale.value] || field[fallbackLocale.value] || field.en || ''
}

/**
 * Returns a string size declaration to a M value.
 *
 * @param size - A size declared like '500M' or '56k'
 * @return a number in M
 */
export function sizeToM(size: string) {
  const unit = size.slice(-1)
  const value = parseInt(size.slice(0, -1))
  if (unit === 'M') return value
  if (unit === 'b') return Math.ceil(value / (1024 * 1024))
  if (unit === 'k') return Math.ceil(value / 1024)
  if (unit === 'G') return Math.ceil(value * 1024)
  if (unit === 'T') return Math.ceil(value * 1024 * 1024)
}

/**
 * Returns an address as AdressModelValue to be used by AdressItem component.
 *
 * @param address - A string representing an adress (subdomain or email)
 * @return Parsed address as `AdressModelValue`
 */
export function formatAdress(address: string): AdressModelValue {
  const separator = address.includes('@') ? '@' : '.'
  const [localPart, domain] = address.split(separator)
  return { localPart, separator, domain }
}

// FORMAT TO CORE

type BasePossibleFormValues =
  | FileModelValue
  | AdressModelValue
  | boolean
  | string
  | number
  | null
  | undefined
type PossibleFormValues = BasePossibleFormValues | BasePossibleFormValues[]

/**
 * Parse a front-end value to its API equivalent.
 *
 * Convert Boolean to '1' (true) or '0' (false),
 * Concatenate two parts addresses (subdomain or email for example) into a single string,
 * Convert File to either:
 * - `null`: keep the same file as currently
 * - `''`: remove the file
 * - an instance of `File`: set new value
 *
 * @param value - Any {@link PossibleFormValues}
 * @return Promise that resolves the formated value
 */
export function formatFormValue<T extends PossibleFormValues>(
  value: T,
): FormValueReturnType<T> {
  // TODO: couldn't manage proper type checking for this function
  // Returned type is ok but it is not type safe since we return `any`
  let formated: any = value

  if (typeof value === 'boolean') {
    formated = value ? 1 : 0
  } else if (Array.isArray(value)) {
    formated = value.map((v) => formatFormValue(v))
  } else if (isFileModelValue(value)) {
    if (value.removed) {
      formated = ''
    } else if (value.current || value.file === null) {
      formated = null
    } else {
      formated = value.file
    }
  } else if (isAdressModelValue(value)) {
    formated = Object.values(value).join('')
  }

  return formated
}

type FileReturnType<T extends FileModelValue> = T extends {
  removed: true
}
  ? ''
  : T extends {
        file: File
      }
    ? File
    : null
export type FormValueReturnType<T extends PossibleFormValues> =
  T extends boolean
    ? 0 | 1
    : T extends FileModelValue
      ? FileReturnType<T>
      : T extends AdressModelValue
        ? string
        : T extends BasePossibleFormValues[]
          ? FormValueReturnType<ArrInnerType<T>>[]
          : T extends string | number | null | undefined
            ? T
            : never

/**
 * Format a frontend form to its API equivalent to be sent to the server.
 *
 * @param form - An `Obj` containing form values
 * @param removeEmpty - Removes "empty" values (`null | undefined | '' | [] | {}`) from the object
 * @param removeNull - Removes `null | undefined` values from the object
 * @return API data ready to be sent to the server.
 */
export function formatForm<
  T extends Obj<PossibleFormValues>,
  R extends { [k in keyof T]: FormValueReturnType<T[k]> },
>(
  form: MaybeRef<T>,
  { removeEmpty }: { removeEmpty: true },
): Partial<{
  // TODO: using `Partial` for now since i'm not sure we can infer empty `'' | [] | {}`
  [k in keyof R as R[k] extends undefined | null ? never : k]: R[k]
}>
export function formatForm<
  T extends Obj<PossibleFormValues>,
  R extends { [k in keyof T]: FormValueReturnType<T[k]> },
>(
  form: MaybeRef<T>,
  { removeNullish }: { removeNullish: true },
): {
  [k in keyof R as R[k] extends undefined | null ? never : k]: R[k]
}
export function formatForm<
  T extends Obj<PossibleFormValues>,
  R extends { [k in keyof T]: FormValueReturnType<T[k]> },
>(form: MaybeRef<T>): R
export function formatForm<
  T extends Obj<PossibleFormValues>,
  R extends { [k in keyof T]: FormValueReturnType<T[k]> },
>(
  form: MaybeRef<T>,
  { removeEmpty = false, removeNullish = false } = {},
): FormatFormReturnType<R> {
  const formattedForm = {} as { [k in keyof T]: FormValueReturnType<T[k]> }

  for (const [key, value] of toEntries(toValue(form))) {
    const formattedValue = formatFormValue(value)
    if (removeEmpty && isEmptyValue(formattedValue)) {
      continue
    }
    if (
      removeNullish &&
      (formattedValue === null || formattedValue === undefined)
    ) {
      continue
    }
    formattedForm[key] = formattedValue
  }

  return formattedForm as FormatFormReturnType<R>
}

export type FormatFormReturnType<R> =
  | Partial<{
      [k in keyof R as R[k] extends undefined | null ? never : k]: R[k]
    }>
  | { [k in keyof R as R[k] extends undefined | null ? never : k]: R[k] }
  | R
