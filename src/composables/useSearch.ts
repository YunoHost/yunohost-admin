import type {
  ComputedRef,
  MaybeRefOrGetter,
  Ref,
  WritableComputedRef,
} from 'vue'
import { computed, isRef, ref, toValue } from 'vue'

import type { AnyTreeNode, TreeRootNode } from '@/helpers/data/tree'

// Returns `undefined` when there's no items and `null` when there's no match
export function useSearch<
  T extends any[] | TreeRootNode,
  V extends T extends (infer V)[] ? V : AnyTreeNode,
>(
  items: MaybeRefOrGetter<T> | ComputedRef<T>,
  filterFn: (search: string, item: V, index: number, arr: T) => boolean,
  {
    externalSearch,
    filterIfNoSearch = false,
    filterAllFn,
  }: {
    filterAllFn?: (search: string, items: T) => boolean | undefined
    filterIfNoSearch?: boolean
    externalSearch?: Ref<string> | WritableComputedRef<string>
  } = {},
): [search: Ref<string>, filteredItems: ComputedRef<T | undefined | null>] {
  const search = isRef(externalSearch)
    ? externalSearch
    : ref(toValue(externalSearch) ?? '')

  const filteredItems = computed(() => {
    const items_ = toValue(items)
    const s = toValue(search.value).toLowerCase()
    if (!items_.length) return undefined
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
