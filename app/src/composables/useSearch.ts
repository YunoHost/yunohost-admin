import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, ref, toValue, watch } from 'vue'

import type { AnyTreeNode, TreeRootNode } from '@/helpers/data/tree'

export function useSearch<
  T extends any[] | TreeRootNode,
  V extends T extends (infer V)[] ? V : AnyTreeNode,
>(
  items: MaybeRefOrGetter<T | undefined> | ComputedRef<T | undefined>,
  filterFn: (search: string, item: V, index: number, arr: T) => boolean,
  {
    externalSearch,
    filterIfNoSearch = false,
    filterAllFn,
  }: {
    filterAllFn?: (search: string, items: T) => boolean | undefined
    filterIfNoSearch?: boolean
    externalSearch?: MaybeRefOrGetter<string>
  } = {},
): [search: Ref<string>, filteredItems: ComputedRef<T | undefined | null>] {
  const search = ref(toValue(externalSearch) ?? '')
  watch(
    () => toValue(externalSearch),
    (s) => (search.value = s ?? ''),
  )

  const filteredItems = computed(() => {
    const items_ = toValue(items)
    const s = toValue(search.value).toLowerCase()
    if (!items_) return undefined
    if (filterAllFn) {
      const returnAll = filterAllFn(s, items_)
      if (returnAll !== undefined) {
        return returnAll ? items_ : undefined
      }
    }
    if (!s && !filterIfNoSearch) return items_
    const filteredItems_ = items_.filter((...args) =>
      filterFn(s, ...(args as [V, number, T])),
    ) as T
    return filteredItems_.length ? filteredItems_ : null
  })

  return [search, filteredItems]
}
