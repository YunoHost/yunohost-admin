<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
import { computed, toValue } from 'vue'

import type { ButtonItemProps } from '@/types/form'

const props = withDefaults(defineProps<ButtonItemProps>(), {
  enabled: true,
  icon: undefined,
  type: 'success',
  help: undefined,
})

const emit = defineEmits<{
  action: [value: string]
}>()

const icon = computed(() => {
  const icons = {
    success: 'thumbs-up',
    info: 'info',
    warning: 'exclamation',
    danger: 'times',
  }

  return props.icon || icons[props.type]
})

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{
  ariaDescribedby?: string[]
}>()
</script>

<template>
  <DefineTemplate v-slot="{ ariaDescribedby }">
    <BButton
      :id="id"
      :variant="type"
      :disabled="!toValue(enabled)"
      :aria-describedby="ariaDescribedby"
      :class="{ 'd-block mb-3': !ariaDescribedby }"
      @click="emit('action', id)"
    >
      <YIcon :iname="icon" class="me-2" />
      <span v-html="label" />
    </BButton>
  </DefineTemplate>

  <DescriptionRow v-if="help" type="form">
    <template #term>
      <ReuseTemplate :aria-describedby="`${id}-desc`" />
    </template>
    <VueShowdown
      :id="`${id}-desc`"
      :markdown="help"
      aria-hidden="true"
      :class="['text-' + type]"
    />
  </DescriptionRow>
  <ReuseTemplate v-else />
</template>
