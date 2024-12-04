import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

import {
  useRequests,
  type APIRequest,
  type APIRequestAction,
} from './useRequests'

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
  | SSEEventDataHeartbeat

export const useSSE = createGlobalState(() => {
  const sseSource = ref<EventSource | null>(null)
  const { startRequest, endRequest, historyList } = useRequests()

  function init() {
    const sse = new EventSource(`/yunohost/api/sse`, { withCredentials: true })

    sse.onopen = () => {
      sseSource.value = sse
    }

    sse.onmessage = (event) => {
      const data = JSON.parse(atob(event.data))
      onSSEMessage(data)
    }

    sse.onerror = (event) => {
      console.error('SSE error', event)
    }
  }

  function onSSEMessage(data: AnySSEEventData) {
    if (data.type === 'heartbeat') return // FIXME handle heartbeat msg

    let request = historyList.value.findLast(
      (r: APIRequest) => r.id === data.ref_id,
    ) as APIRequestAction | undefined

    if (!request) {
      request = startRequest({
        id: data.ref_id,
        title: 'external_operation',
        date: data.timestamp,
        external: true,
      }) as APIRequestAction
    }

    if (data.type === 'start') {
      request.action.operationId = data.operation_id
    } else if (data.type === 'end' && request.action.external) {
      // End request on this last message if the action was external
      // (else default http response will end it)
      endRequest({ request, success: data.success, showError: !!data.errormsg })
    } 
    }
  }

  return { init }
})
