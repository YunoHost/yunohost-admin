import type { Breakpoint } from 'bootstrap-vue-next'
import type { RouteLocationNamedRaw } from 'vue-router'

export type Obj<T = any> = Record<string, T>

// Vue

export type VueClass =
  | string
  | Record<string, boolean>
  | (string | Record<string, boolean>)[]

// BVN (not exported types for now)

// eslint-disable-next-line prettier/prettier
type ColsNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
export type Cols = Partial<Record<Breakpoint, boolean | ColsNumbers | 'auto'>>

// CUSTOM

export type Skeleton = { is: string } & Obj
export type CustomRoute = {
  to: RouteLocationNamedRaw
  text: string
  icon?: string
}
export type Translation = string | Record<string, string>
export type StateVariant = 'success' | 'info' | 'warning' | 'danger'

// HELPERS

export type ArrInnerType<T> = T extends (infer ElementType)[]
  ? ElementType
  : never
export type KeyOfStr<T extends Obj> = Extract<keyof T, string>
export type MergeUnion<U extends Record<string, unknown>> = {
  [K in U extends unknown ? keyof U : never]: U extends unknown
    ? K extends keyof U
      ? U[K]
      : never
    : never
}
