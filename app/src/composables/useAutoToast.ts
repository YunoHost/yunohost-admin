import { createGlobalState } from '@vueuse/core'
import type { OrchestratedToast } from 'bootstrap-vue-next'
import { useToastController } from 'bootstrap-vue-next'
import { ref } from 'vue'

import YToast from '@/components/YToast.vue'

type useToastControllerInstance = ReturnType<typeof useToastController>

export const useAutoToast = createGlobalState(() => {
  const toastController = ref<useToastControllerInstance | null>(null)

  function init(controller: useToastControllerInstance) {
    toastController.value = controller
  }

  function show(props: OrchestratedToast) {
    toastController.value?.show?.({ props, component: YToast })
  }

  return { init, show }
})
