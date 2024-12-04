import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

export type SSEEventDataStart = {
  type: 'start'
  timestamp: number
  ref_id: string
  operation_id: string
}

export type SSEEventDataEnd = {
  type: 'end'
  timestamp: number
  ref_id: string
  operation_id: string
  success: boolean
  errormsg?: string
}

export type SSEEventDataMsg = {
  type: 'msg'
  timestamp: number
  ref_id: string
  operation_id: string
  level: StateStatus
  msg: string
}

export type SSEEventDataHeartbeat = {
  type: 'heartbeat'
  timestamp: number
  operation_id: string | null
}

export type AnySSEEventData =
  | SSEEventDataStart
  | SSEEventDataEnd
  | SSEEventDataMsg

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
