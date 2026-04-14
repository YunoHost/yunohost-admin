import { createGlobalState } from '@vueuse/core'
import { computed, ref } from 'vue'

import { STATUS_VARIANT, isOkStatus } from '@/helpers/yunohostArguments'
import type { StateStatus } from '@/types/commons'
import { useAutoToast } from './useAutoToast'
import { useInfos } from './useInfos'
import type { APIRequest, APIRequestAction, RequestCaller } from './useRequests'
import { useRequests } from './useRequests'

type SSEEventDataStart = {
  type: 'start'
  timestamp: number
  ref_id: string
  operation_id: string
  started_by: RequestCaller
  title: string
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
  title: string
  started_at: number
  started_by: RequestCaller
  success: boolean
}

type SSEEventDataToast = {
  type: 'toast'
  timestamp: number
  ref_id: string
  operation_id: string
  level: StateStatus
  msg: string
}

type SSEEventDataHeartbeat = {
  type: 'heartbeat'
  timestamp: number
  current_operation: string | null
  cmdline: string | null
  started_by: RequestCaller | null
}

type AnySSEEventDataAction =
  | SSEEventDataStart
  | SSEEventDataEnd
  | SSEEventDataMsg
type AnySSEEventData =
  | AnySSEEventDataAction
  | SSEEventDataHistory
  | SSEEventDataToast
  | SSEEventDataHeartbeat

export type ReconnectionArgs = {
  origin: 'unknown' | 'reboot' | 'shutdown' | 'upgrade_system'
  initialDelay?: number
  delay?: number
}

export const useSSE = createGlobalState(() => {
  const sseSource = ref<EventSource | null>(null)
  const reconnectionArgs = ref<ReconnectionArgs | null>(null)
  const reconnectTimeout = ref<number | undefined>()
  const { startRequest, endRequest, historyList } = useRequests()
  const { debug } = useInfos()
  const nonOperationWithLock = ref<APIRequestAction | null>(null)

  const reconnecting = computed(() =>
    !sseSource.value && reconnectionArgs.value
      ? reconnectionArgs.value.origin
      : null,
  )

  function init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (sseSource.value) resolve()

      const sse = new EventSource(`/yunohost/api/sse`, {
        withCredentials: true,
      })

      sse.onopen = () => {
        sseSource.value = sse
        reconnectionArgs.value = null
        resolve()
      }

      function wrapEvent<T extends AnySSEEventData>(
        name: T['type'],
        fn: (data: T) => void,
      ) {
        sse.addEventListener(name, (e) => {
          const data = JSON.parse(e.data)
          if (debug.value) console.debug(`SSE msg: ${name}`, data)
          // The server sends at least heartbeats every 10s, try to reconnect if we loose connection
          tryToReconnect({ initialDelay: 15000, origin: 'unknown' })
          fn({ type: name, ...data })
        })
      }

      wrapEvent('recent_history', onHistoryEvent)
      wrapEvent('start', onActionEvent)
      wrapEvent('msg', onActionEvent)
      wrapEvent('end', onActionEvent)
      wrapEvent('heartbeat', onHeartbeatEvent)
      wrapEvent('toast', onToastEvent)

      sse.onerror = (event) => {
        console.error('SSE error', event)
        reject()
      }
    })
  }

  /**
   * SSE reconnection helper. Resolve when server is reachable.
   *
   * @param origin - a i18n key to explain why we're trying to reconnect
   * @param delay - Delay between calls to the API in ms
   * @param initialDelay - Delay before calling the API for the first time in ms
   *
   * @returns Promise that resolve when connection is successful
   */
  function tryToReconnect(args: ReconnectionArgs) {
    clearTimeout(reconnectTimeout.value)

    return new Promise((resolve) => {
      function reconnect() {
        if (!reconnectionArgs.value) {
          reconnectionArgs.value = args
        }
        sseSource.value?.close()
        sseSource.value = null
        init()
          .then(resolve)
          .catch(() => {
            reconnectTimeout.value = window.setTimeout(
              reconnect,
              args.delay || 3000,
            )
          })
      }

      if (args.initialDelay) {
        reconnectTimeout.value = window.setTimeout(reconnect, args.initialDelay)
      } else {
        reconnect()
      }
    })
  }

  function onActionEvent(data: AnySSEEventDataAction) {
    let request = historyList.value.find(
      (r: APIRequest) => r.id === data.ref_id,
    ) as APIRequestAction | undefined

    if (
      !request ||
      (data.type === 'start' &&
        request.action.operationId &&
        request.action.operationId !== data.operation_id)
    ) {
      // case 1: no request so it is an external operation
      // or case 2: a second operation is ran by the core, which has the same ref_id than the previous
      // (an app upgrade triggers a backup operation then the actual upgrade operation)
      // so make sure to create a new request
      request = startRequest({
        id: data.ref_id,
        title: data.type === 'start' ? data.title : data.operation_id,
        date: data.timestamp * 1000,
        external: true,
      }) as APIRequestAction
    }

    if (data.type === 'start') {
      request.action.operationId = data.operation_id
      request.title = data.title
      request.action.caller = data.started_by
    } else if (data.type === 'end' && request.action.external) {
      // End request on this last message if the action was external
      // (else default http response will end it)
      endRequest({ request, success: data.success, errorMsg: data.errormsg })
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
    if (data.current_operation === null) {
      // An action may have failed without properly exiting
      // Ensure that there's no pending external request blocking the view
      // if server says that there's no current action
      const request =
        nonOperationWithLock.value ||
        historyList.value.findLast(
          (r: APIRequest) =>
            r.action?.external === true && r.status === 'pending',
        )

      if (request) {
        endRequest({
          request,
          success: !!nonOperationWithLock.value,
          showError: false,
        })
        nonOperationWithLock.value = null
      }
    } else if (data.current_operation.startsWith('lock')) {
      // SPECIAL CASE: an operation like `yunohost tools shell` has the lock
      const timestamp = parseFloat(data.current_operation.split('-')[1])
      if (!nonOperationWithLock.value) {
        nonOperationWithLock.value = startRequest({
          id: data.current_operation,
          title: data.cmdline!,
          date: timestamp * 1000,
          caller: data.started_by,
          external: true,
        }) as APIRequestAction
      }
    }
  }

  function onHistoryEvent(data: SSEEventDataHistory) {
    const request = historyList.value.findLast(
      (r: APIRequest) => r.action?.operationId === data.operation_id,
    ) as APIRequestAction | undefined
    // Do not add the request if already in the history (can happen on sse reconnection)
    if (request) return

    startRequest({
      id: data.operation_id,
      title: data.title,
      date: data.started_at * 1000,
      caller: data.started_by,
      showModal: false,
      external: true,
      status: data.success ? 'success' : 'error',
    })
  }

  function onToastEvent(data: SSEEventDataToast) {
    useAutoToast().show({
      body: data.msg,
      variant: STATUS_VARIANT[data.level],
    })
  }

  return { init, reconnecting, tryToReconnect }
})
