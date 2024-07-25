import { toValue, type MaybeRef } from 'vue'

import {
  getFileContent,
  isEmptyValue,
  isObjectLiteral,
  toEntries,
} from '@/helpers/commons'
import store from '@/store'
import type { ArrInnerType, Obj, Translation } from '@/types/commons'
import type { AdressModelValue, FileModelValue } from '@/types/form'
import { isAdressModelValue, isFileModelValue } from '@/types/form'

export const DEFAULT_STATUS_ICON = {
  [null]: null,
  danger: 'times',
  error: 'times',
  info: 'info',
  success: 'check',
  warning: 'warning',
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
  const { locale, fallbackLocale } = store.state as {
    locale: string
    fallbackLocale: string
  }
  return field[locale] || field[fallbackLocale] || field.en || ''
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
 * This function is async because we may need to read a file content.
 *
 * Convert Boolean to '1' (true) or '0' (false),
 * Concatenate two parts adresses (subdomain or email for example) into a single string,
 * Convert File to its Base64 representation or set its value to '' to ask for a removal.
 *
 * @param value - Any {@link PossibleFormValues}
 * @return Promise that resolves the formated value
 */
export async function formatFormValue<T extends PossibleFormValues>(
  value: T,
): Promise<FormValueReturnType<T>> {
  // TODO: couldn't manage proper type checking for this function
  // Returned type is ok but it is not type safe since we return `any`
  let formated: any = value

  if (typeof value === 'boolean') {
    formated = value ? 1 : 0
  } else if (Array.isArray(value)) {
    formated = await Promise.all(value.map((v) => formatFormValue(v)))
  } else if (isFileModelValue(value)) {
    // File has to be deleted
    if (value.removed) formated = ''
    // File has not changed (will not be sent)
    else if (value.current || value.file === null) formated = null
    else {
      const filename = value.file.name
      formated = await getFileContent(value.file, { base64: true }).then(
        (content) => {
          return {
            content: content.replace(/data:[^;]*;base64,/, ''),
            filename,
          }
        },
      )
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
    ? { content: string; filename: string }
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
 * This function is async because we need to read files content.
 *
 * /!\ FIXME
 * Files type are wrong, they resolves as `{ filename: string; content: string }`
 * but in reality they resolves as 2 keys in the returned form. See implementation.
 * /!\
 *
 * @param form - An `Obj` containing form values
 * @param removeEmpty - Removes "empty" values (`null | undefined | '' | [] | {}`) from the object
 * @param removeNull - Removes `null | undefined` values from the object
 * @return API data ready to be sent to the server.
 */
export function formatForm<
  T extends Obj<PossibleFormValues>,
  R extends { [k in keyof T]: Awaited<FormValueReturnType<T[k]>> },
>(
  form: MaybeRef<T>,
  { removeEmpty = false },
): Promise<
  Partial<{
    // TODO: using `Partial` for now since i'm not sure we can infer empty `'' | [] | {}`
    [k in keyof R as R[k] extends undefined | null ? never : k]: R[k]
  }>
>
export function formatForm<
  T extends Obj<PossibleFormValues>,
  R extends { [k in keyof T]: Awaited<FormValueReturnType<T[k]>> },
>(
  form: MaybeRef<T>,
  { removeNullish = false },
): Promise<{
  [k in keyof R as R[k] extends undefined | null ? never : k]: R[k]
}>
export function formatForm<
  T extends Obj<PossibleFormValues>,
  R extends { [k in keyof T]: Awaited<FormValueReturnType<T[k]>> },
>(form: MaybeRef<T>): Promise<R>
export function formatForm<
  T extends Obj<PossibleFormValues>,
  R extends { [k in keyof T]: Awaited<FormValueReturnType<T[k]>> },
>(
  form: MaybeRef<T>,
  { removeEmpty = false, removeNullish = false } = {},
): Promise<FormatFormReturnType<R>> {
  const [keys, promises] = toEntries(toValue(form)).reduce(
    (acc, [key, v]) => {
      acc[0].push(key)
      acc[1].push(formatFormValue(v))
      return acc
    },
    [[] as (keyof T)[], [] as Promise<FormValueReturnType<T[keyof T]>>[]],
  )

  return Promise.all(promises).then((resolvedValues) => {
    let entries = resolvedValues.map((v, i) => [keys[i], v] as const)
    if (removeEmpty || removeNullish) {
      entries = entries.filter((entry) => {
        return !(
          (removeEmpty && isEmptyValue(entry[1])) ||
          (removeNullish && [null, undefined].includes(entry[1] as any))
        )
      })
    }
    // Special handling of files which are a bit weird, we inject 2 keys
    // in the form, one for the filename and one with its content.
    // TODO: could be improved, with a single key for example as to current
    // type `{ filename: string; content: string }` and remove the next `reduce`
    return entries.reduce(
      (form, [k, v]) => {
        if (isObjectLiteral(v) && 'filename' in v && 'content' in v) {
          // @ts-ignore (mess to type)
          form[k] = v.content
          // @ts-ignore (mess to type)
          form[`${String(k)}[name]`] = v.filename
        }
        form[k] = v
        return form
      },
      {} as { [k in keyof T]: Awaited<FormValueReturnType<T[k]>> },
    )
  }) as Promise<FormatFormReturnType<R>>
}

export type FormatFormReturnType<R> =
  | Partial<{
      [k in keyof R as R[k] extends undefined | null ? never : k]: R[k]
    }>
  | { [k in keyof R as R[k] extends undefined | null ? never : k]: R[k] }
  | R
