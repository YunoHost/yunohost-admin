import { createGlobalState } from '@vueuse/core'
import { v4 as uuid } from 'uuid'
import { computed, reactive, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import type { APIQuery, RequestMethod } from '@/api/api'
import { APIErrorLog, type APIError } from '@/api/errors'
import { isObjectLiteral } from '@/helpers/commons'
import i18n from '@/i18n'
import store from '@/store'
import type { StateVariant } from '@/types/commons'

export type RequestStatus = 'pending' | 'success' | 'warning' | 'error'

export type APIRequest = {
  status: RequestStatus
  method: RequestMethod
  uri: string
  id: string
  humanRoute: string
  initial: boolean
  date: number
  err?: APIError
  action?: APIActionProps
  showModal?: boolean
}
type APIActionProps = {
  messages: RequestMessage[]
  errors: number
  warnings: number
  progress?: number[]
}

export type APIRequestAction = APIRequest & {
  action: APIActionProps
}

export type RequestMessage = {
  text: string
  variant: StateVariant
}

export type ReconnectingArgs = {
  attemps?: number
  origin?: string
  initialDelay?: number
  delay?: number
}

export const STATUS_VARIANT = {
  pending: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  info: 'info',
} as const

export const useRequests = createGlobalState(() => {
  const router = useRouter()

  const requests = shallowRef<APIRequest[]>([])
  const reconnecting = ref<ReconnectingArgs | undefined>()
  const currentRequest = computed(() => {
    return requests.value.find((r) => r.showModal)
  })
  const locked = computed(() => currentRequest.value?.showModal)
  const historyList = computed<APIRequestAction[]>(() => {
    return requests.value
      .filter((r) => !!r.action || !!r.err)
      .reverse() as APIRequestAction[]
  })

  function startRequest({
    uri,
    method,
    humanKey,
    initial,
    websocket,
    showModal,
  }: {
    uri: string
    method: RequestMethod
    humanKey?: APIQuery['humanKey']
    showModal: boolean
    websocket: boolean
    initial: boolean
  }): APIRequest {
    // Try to find a description for an API route to display in history and modals
    const { key, ...args } = isObjectLiteral(humanKey)
      ? humanKey
      : { key: humanKey }
    const humanRoute = key
      ? i18n.global.t(`human_routes.${key}`, args)
      : `[${method}] /${uri.split('?')[0]}`

    const request: APIRequest = reactive({
      method,
      uri,
      status: 'pending',
      humanRoute,
      initial,
      showModal: false,
      id: uuid(),
      date: Date.now(),
      err: undefined,
      action: websocket
        ? {
            messages: [],
            warnings: 0,
            errors: 0,
          }
        : undefined,
    })
    requests.value = [...requests.value, request]
    const r = requests.value[requests.value.length - 1]!

    if (showModal) {
      setTimeout(() => {
        // Display the waiting modal only if the request takes some time.
        if (r.status === 'pending') {
          r.showModal = true
        }
      }, 300)
    }

    return r
  }

  function endRequest({
    request,
    success,
  }: {
    request: APIRequest
    success: boolean
  }) {
    let status: RequestStatus = success ? 'success' : 'error'
    let hideModal = success

    if (success && request.action) {
      const { warnings, errors, messages } = request.action
      const msgCount = messages.length
      if (msgCount && messages[msgCount - 1].variant === 'warning') {
        hideModal = false
      }
      if (errors || warnings) status = 'warning'
    }

    setTimeout(() => {
      request.status = status

      if (request.showModal && hideModal) {
        request.showModal = false
        // We can remove requests that are not actions or has no errors
        requests.value = requests.value.filter(
          (r) => r.showModal || !!r.action || !!r.err,
        )
      }
    }, 350)
  }

  function handleAPIError(err: APIError) {
    err.log()
    if (err.code === 401) {
      // Unauthorized
      store.dispatch('DISCONNECT')
    } else if (err instanceof APIErrorLog) {
      // Errors that have produced logs
      router.push({ name: 'tool-log', params: { name: err.logRef } })
    } else {
      const request = requests.value.find((r) => r.id === err.requestId)!
      request.err = err
    }
  }

  function showModal(requestId: APIRequest['id']) {
    const request = requests.value.find((r) => r.id === requestId)!
    request.showModal = true
  }

  function dismissModal(requestId: APIRequest['id']) {
    const request = requests.value.find((r) => r.id === requestId)!

    if (request.err && request.initial) {
      // In case of an initial request (data that is needed by a view to render itself),
      // try to go back so the user doesn't get stuck at a never ending skeleton view.
      if (history.length > 2) {
        history.back()
      } else {
        // if the url was opened in a new tab, return to home
        router.push({ name: 'home' })
      }
    }
    request.showModal = false
  }

  return {
    requests,
    historyList,
    currentRequest,
    reconnecting,
    locked,
    startRequest,
    endRequest,
    handleAPIError,
    dismissModal,
    showModal,
  }
})
