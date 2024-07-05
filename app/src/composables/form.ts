import type { InjectionKey } from 'vue'

export const ValidationTouchSymbol = Symbol() as InjectionKey<
  (key?: string) => void
>
