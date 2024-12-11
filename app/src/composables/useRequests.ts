import { createGlobalState } from '@vueuse/core'
import { computed, reactive, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import type { RequestMethod } from '@/api/api'
import { APIErrorLog, type APIError } from '@/api/errors'
import type { StateVariant } from '@/types/commons'
import { useInfos } from './useInfos'
import i18n from '@/i18n'

export type RequestStatus = 'pending' | 'success' | 'warning' | 'error'

export type APIRequest = {
  id: string
  title: string
  date: number
  method?: RequestMethod
  uri?: string
  status: RequestStatus
  initial: boolean
  err?: APIError
  action?: APIActionProps
  showModal?: boolean
  showModalTimeout?: number
}
type APIActionProps = {
  external: boolean
  operationId?: string
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

export const useRequests = createGlobalState(() => {
  const router = useRouter()

  const requests = shallowRef<APIRequest[]>([])
  const reconnecting = ref<ReconnectingArgs | undefined>()
  const currentRequest = computed(() => {
    return requests.value.find((r) => r.showModal)
  })
  const locked = computed(() => currentRequest.value?.showModal)
  const historyList = computed<(APIRequest | APIRequestAction)[]>(() => {
    return requests.value
      .filter((r) => !!r.action || !!r.err)
      .reverse() as APIRequestAction[]
  })

  function startRequest({
    id,
    date,
    title,
    method,
    uri,
    initial = false,
    isAction = true,
    showModal = true,
    external = false,
    status = 'pending',
  }: {
    id: string
    date: number
    title?: string
    method?: RequestMethod
    uri?: string
    showModal?: boolean
    isAction?: boolean
    initial?: boolean
    external?: boolean
    status?: APIRequest['status']
  }): APIRequest | APIRequestAction {
    const request: APIRequest = reactive({
      id,
      title:
        title || (method && uri)
          ? `[${method}] /${uri!.split('?')[0]}`
          : i18n.global.t('api.unknown_request'),
      date,
      method,
      uri,
      status,
      initial,
      showModal: false,
      err: undefined,
      action: isAction
        ? {
            external,
            // in case of recent history entry
            operationId: external && status !== 'pending' ? id : undefined,
            messages: [],
            warnings: 0,
            errors: 0,
          }
        : undefined,
    })
    requests.value = [...requests.value, request]
    const r = requests.value[requests.value.length - 1]!

    if (showModal) {
      request.showModalTimeout = window.setTimeout(() => {
        // Display the waiting modal only if the request takes some time.
        if (r.status === 'pending') {
          r.showModal = true
        }
      }, 300) as unknown as number
    }

    return r
  }

  function endRequest({
    request,
    success,
    showError = false,
  }: {
    request: APIRequest | APIRequestAction
    success: boolean
    showError?: boolean
  }) {
    let status: RequestStatus = success ? 'success' : 'error'
    let hideModal = success || !showError

    if (success && request.action) {
      const { warnings, errors, messages } = request.action
      const msgCount = messages.length
      if (msgCount && messages[msgCount - 1].variant === 'warning') {
        hideModal = false
      }
      if (errors || warnings) status = 'warning'
    }

    if (request.showModalTimeout) {
      // Clear the timeout to avoid delayed modal to show up
      clearTimeout(request.showModalTimeout)
      delete request.showModalTimeout
    }

    setTimeout(() => {
      request.status = status

      if (request.showModal && hideModal) {
        request.showModal = false
        // We can remove requests that are not actions or has no errors
        requests.value = requests.value.filter(
          (r) => r.showModal || !!r.action || !!r.err,
        )
      } else if (showError) {
        request.showModal = true
      }
    }, 350)
  }

  function handleAPIError(err: APIError) {
    err.log()
    if (err.code === 401) {
      // Unauthorized
      useInfos().onLogout()
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
