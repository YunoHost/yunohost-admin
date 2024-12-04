import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'
export const useSSE = createGlobalState(() => {
  const sseSource = ref<EventSource | null>(null)
  function init() {
    const sse = new EventSource(`/yunohost/api/sse`, { withCredentials: true })

    sse.onopen = () => {
      sseSource.value = sse
    }

    sse.onmessage = (event) => {
      const data = JSON.parse(atob(event.data))
    }

    sse.onerror = (event) => {
      console.error('SSE error', event)
    }
  }

  return { init }
})
