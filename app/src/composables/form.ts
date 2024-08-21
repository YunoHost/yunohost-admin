// eslint-disable-next-line vue/prefer-import-from-vue
import { isFunction } from '@vue/shared'
import type {
  BaseValidation,
  ServerErrors,
  Validation,
  ValidationArgs,
} from '@vuelidate/core'
import useVuelidate from '@vuelidate/core'
import { watchImmediate } from '@vueuse/core'
import type {
  ComputedRef,
  InjectionKey,
  MaybeRefOrGetter,
  Ref,
  WritableComputedRef,
} from 'vue'
import { computed, inject, provide, reactive, ref, toValue } from 'vue'
import { useRouter } from 'vue-router'

import { APIBadRequestError, type APIError } from '@/api/errors'
import { fromEntries, getKeys } from '@/helpers/commons'
import type { Obj } from '@/types/commons'
import type { FormFieldDict } from '@/types/form'

export const clearServerErrorsSymbol = Symbol() as InjectionKey<
  (key?: string) => void
>
export const ValidationTouchSymbol = Symbol() as InjectionKey<
  (key?: string) => void
>

export function useTouch(
  validation: MaybeRefOrGetter<BaseValidation | undefined>,
) {
  function touch(key?: string) {
    const v = toValue(validation)
    if (v) {
      // For fields that have multiple elements
      if (key && v[key]) {
        v[key].$touch()
        clear?.(v[key].$path)
      } else {
        v.$touch()
        clear?.(v.$path)
      }
    }
  }
  provide(ValidationTouchSymbol, touch)
  const clear = inject(clearServerErrorsSymbol)

  return touch
}

export type FormValidation<MV extends Obj> = Validation<
  { global: { true: () => true }; form: ValidationArgs<MV> },
  { form: Ref<MV> | WritableComputedRef<MV>; global: null }
>

export function useForm<
  MV extends Obj,
  FFD extends FormFieldDict<MV> = FormFieldDict<MV>,
>(form: Ref<MV> | WritableComputedRef<MV>, fields: FFD | (() => FFD)) {
  const serverErrors = reactive<ServerErrors>({})
  const validByDefault = { true: () => true as const }
  // create a fake validation rule for global state to be able to add $externalResult errors to it
  const rules = ref({ global: validByDefault, form: {} }) as Ref<{
    global: { true: () => true }
    form: ValidationArgs<MV>
  }>
  function updateRules(ffd: FFD) {
    const validations = Object.keys(form.value).map((key: keyof MV) => [
      key,
      ffd[key].rules ?? validByDefault,
    ])
    const formRules: ValidationArgs<MV> = Object.fromEntries(validations)
    rules.value = { global: { true: () => true }, form: formRules }
  }
  if (isFunction(fields)) {
    watchImmediate(fields, () => {
      updateRules(toValue(fields))
    })
  } else {
    watchImmediate(
      Object.keys(form.value).map((key: keyof MV) => () => fields[key].rules),
      () => updateRules(fields),
    )
  }

  const v: Ref<FormValidation<MV>> = useVuelidate(
    rules,
    { form, global: null },
    { $externalResults: serverErrors },
  )

  function onErrorFn(err: APIError, errorMessage?: string) {
    if (!(err instanceof APIBadRequestError)) throw err
    if (errorMessage || !err.data.name) {
      serverErrors.global = [errorMessage || err.message]
    } else {
      deepSetErrors(
        serverErrors,
        [err.message],
        'form',
        ...err.data.name.split('.'),
      )
    }
  }

  function onSubmit(
    fn: (onError: typeof onErrorFn, serverErrors: ServerErrors) => void,
  ) {
    // FIXME add option to ask confirmation (with param text confirm)
    return async (e: SubmitEvent) => {
      e.preventDefault()
      if (!(await v.value.form.$validate())) return
      fn(onErrorFn, serverErrors)
    }
  }

  provide(clearServerErrorsSymbol, (key?: string) => {
    const keys = key?.split('.')
    if (keys?.length) {
      deepSetErrors(serverErrors, [], ...keys)
    }
  })

  return {
    v,
    serverErrors,
    onSubmit,
  }
}

export function deepSetErrors(
  serverErrors: ServerErrors,
  value: string[],
  ...keys: string[]
) {
  const [k, ...ks] = keys
  if (ks.length) {
    if (!(k in serverErrors) && !value.length) {
      serverErrors[k] = {}
      deepSetErrors(serverErrors[k] as ServerErrors, value, ...ks)
    } else if (k in serverErrors) {
      deepSetErrors(serverErrors[k] as ServerErrors, value, ...ks)
    }
  } else {
    if (!(k in serverErrors) && !value.length) return
    serverErrors[k] = value
  }
}

export function useArrayRule<V extends any[], T extends ValidationArgs>(
  values: MaybeRefOrGetter<V>,
  rules: T,
): ComputedRef<ValidationArgs<T>> {
  return computed(() => {
    return toValue(values).reduce((total: Obj<T>, v: V[number], index) => {
      total[index] = rules
      return total
    }, {})
  })
}

export function useFormQuery<T extends Obj>(
  props: T,
  onUpdate?: () => T | undefined,
) {
  const router = useRouter()
  const formQuery = fromEntries(
    getKeys(props).map((key) => [
      key,
      computed({
        get: () => props[key],
        set: (n) => {
          const nextProps = onUpdate?.() ?? props
          router.replace({ query: { ...nextProps, [key]: n } })
        },
      }),
    ]) as { [K in keyof T]: [K, WritableComputedRef<T[K]>] }[keyof T][],
  )

  return formQuery
}
