<script setup lang="ts">
import type { CheckboxItemProps, BaseItemComputedProps } from '@/types/form'

withDefaults(defineProps<CheckboxItemProps & BaseItemComputedProps>(), {
  id: undefined,
  name: undefined,
  placeholder: undefined,
  touchKey: undefined,
  label: undefined,
  labels: () => ({ true: 'yes', false: 'no' }),

  ariaDescribedby: undefined,
  state: undefined,
  validation: undefined,
})

const modelValue = defineModel<boolean>()
</script>

<template>
  <BFormCheckbox
    :id="id"
    v-model="modelValue"
    :name="name"
    :aria-describedby="ariaDescribedby"
    :state="state"
    switch
  >
    <span v-html="label || $t(labels[modelValue ? 'true' : 'false'])" />
  </BFormCheckbox>
</template>
