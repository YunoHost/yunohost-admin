import type { Skeleton } from '@/types/commons'
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    noAuth?: boolean
    routerParams?: string[]
    args: { trad?: string; param?: string }
    breadcrumb?: string[]
    skeleton?: (Skeleton | string)[] | Skeleton | string
  }
}

declare module 'bootstrap-vue-next' {
  interface BaseColorVariant {
    best: unknown
  }
  interface BaseSize {
    // `xs` size is available only for BButton
    xs: unknown
  }
}
