import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    noAuth?: boolean
    routerParams?: string[]
    args: { trad?: string; param?: string }
    breadcrumb?: string[]
  }
}

declare module 'bootstrap-vue-next' {
  interface BaseColorVariant {
    best: unknown
  }
}
