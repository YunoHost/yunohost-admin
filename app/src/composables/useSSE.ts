import { createGlobalState } from '@vueuse/core'
import { ref } from 'vue'

import { STATUS_VARIANT, isOkStatus } from '@/helpers/yunohostArguments'
import i18n from '@/i18n'
import type { StateStatus } from '@/types/commons'
import {
  useRequests,
  type APIRequest,
  type APIRequestAction,
} from './useRequests'

type SSEEventDataStart = {
  type: 'start'
  timestamp: number
  ref_id: string
  operation_id: string
}

type SSEEventDataEnd = {
  type: 'end'
  timestamp: number
  ref_id: string
  operation_id: string
  success: boolean
  errormsg?: string
}

type SSEEventDataMsg = {
  type: 'msg'
  timestamp: number
  ref_id: string
  operation_id: string
  level: StateStatus
  msg: string
}

type SSEEventDataHistory = {
  type: 'recent_history'
  operation_id: string
  started_at: number
  success: boolean
}

type SSEEventDataHeartbeat = {
  type: 'heartbeat'
  timestamp: number
  current_operation: string | null
}

type AnySSEEventDataAction =
  | SSEEventDataStart
  | SSEEventDataEnd
  | SSEEventDataMsg
type AnySSEEventData =
  | AnySSEEventDataAction
  | SSEEventDataHistory
  | SSEEventDataHeartbeat

function isActionEvent(data: AnySSEEventData): data is AnySSEEventDataAction {
  return ['start', 'msg', 'end'].includes(data.type)
}

function parseOperationId(operationId: string) {
  const [action, ...params] = operationId.substring(16).split('-')
  return i18n.global.t('human_routes.' + action.replace('_', '.'), params)
}

export const useSSE = createGlobalState(() => {
  const sseSource = ref<EventSource | null>(null)
  const reconnectTimeout = ref<number | undefined>()
  const { startRequest, endRequest, historyList } = useRequests()

  function init() {
    const sse = new EventSource(`/yunohost/api/sse`, { withCredentials: true })

    sse.onopen = () => {
      sseSource.value = sse
    }

    sse.onmessage = (event) => {
      const data: AnySSEEventData = JSON.parse(atob(event.data))
      if (isActionEvent(data)) onActionEvent(data)
      if (data.type === 'heartbeat') onHeartbeatEvent(data)
      if (data.type === 'recent_history') onHistoryEvent(data)
    }

    sse.onerror = (event) => {
      console.error('SSE error', event)
      tryToReconnect(5000)
    }
  }

  function tryToReconnect(delay: number) {
    reconnectTimeout.value = window.setTimeout(() => {
      sseSource.value!.close()
      init()
    }, delay)
  }

  function onActionEvent(data: AnySSEEventDataAction) {
    let request = historyList.value.findLast(
      (r: APIRequest) => r.id === data.ref_id,
    ) as APIRequestAction | undefined

    if (!request) {
      request = startRequest({
        id: data.ref_id,
        title: parseOperationId(data.operation_id),
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
    } else if (data.type === 'msg') {
      let text = data.msg.replaceAll('\n', '<br>')
      const progressBar = text.match(/^\[#*\+*\.*\] > /)?.[0]
      if (progressBar) {
        text = text.replace(progressBar, '')
        const progress: Record<string, number> = { '#': 0, '+': 0, '.': 0 }
        for (const char of progressBar) {
          if (char in progress) progress[char] += 1
        }
        request.action.progress = Object.values(progress)
      }

      request.action.messages.push({
        text,
        variant: STATUS_VARIANT[data.level],
      })

      if (!isOkStatus(data.level)) request.action[`${data.level}s`]++
    }
  }

  function onHeartbeatEvent(data: SSEEventDataHeartbeat) {
    clearTimeout(reconnectTimeout.value)

    if (data.current_operation === null) {
      // An action may have failed without properly exiting
      // Ensure that there's no pending external request blocking the view
      // if server says that there's no current action
      const request = historyList.value.findLast(
        (r: APIRequest) =>
          r.action?.external === true && r.status === 'pending',
      ) as APIRequestAction | undefined

      if (request) {
        endRequest({ request, success: false, showError: false })
      }
    }

    // The server sends heartbeats every 10s, try to reconnect if we loose connection
    tryToReconnect(15000)
  }

  function onHistoryEvent(data: SSEEventDataHistory) {
    const request = historyList.value.findLast(
      (r: APIRequest) => r.action?.operationId === data.operation_id,
    ) as APIRequestAction | undefined
    // Do not add the request if already in the history (can happen on sse reconnection)
    if (request) return

    startRequest({
      id: data.operation_id,
      title: parseOperationId(data.operation_id),
      date: data.started_at,
      showModal: false,
      external: true,
      status: data.success ? 'success' : 'error',
    })
  }

  return { init }
})
