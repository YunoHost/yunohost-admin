import 'vue-router'

declare module 'vuex' {
  export * from 'vuex/types/index.d.ts'
  export * from 'vuex/types/helpers.d.ts'
  export * from 'vuex/types/logger.d.ts'
  export * from 'vuex/types/vue.d.ts'
}

declare module 'vue-router' {
  interface RouteMeta {
    noAuth?: boolean
    routerParams?: string[]
    args: { trad?: string; param?: string }
    breadcrumb?: string[]
  }
}
