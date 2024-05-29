import { computed } from 'vue'
import { useStore } from 'vuex'

export function useStoreGetters() {
  const store = useStore()
  return Object.fromEntries(
    Object.keys(store.getters).map((getter) => [
      getter,
      computed(() => store.getters[getter]),
    ]),
  )
}
