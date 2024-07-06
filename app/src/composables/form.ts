import type { BaseValidation } from '@vuelidate/core'
import type { InjectionKey, MaybeRefOrGetter } from 'vue'
import { inject, provide, toValue } from 'vue'

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
      if (key) {
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
