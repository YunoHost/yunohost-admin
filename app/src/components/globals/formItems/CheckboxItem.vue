<script setup lang="ts">
import type { CheckboxItemProps, BaseItemComputedProps } from '@/types/form'

withDefaults(
  defineProps<CheckboxItemProps & BaseItemComputedProps<boolean>>(),
  {
    id: undefined,
    name: undefined,
    placeholder: undefined,
    touchKey: undefined,
    label: undefined,
    labels: () => ({ true: 'yes', false: 'no' }),

    ariaDescribedby: undefined,
    modelValue: undefined,
    state: undefined,
    validation: undefined,
  },
)

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const model = defineModel<boolean>()
</script>

<template>
  <BFormCheckbox
    :id="id"
    v-model="model"
    :name="name"
    :aria-describedby="ariaDescribedby"
    :state="state"
    switch
  >
    {{ label || $t(labels[modelValue ? 'true' : 'false']) }}
  </BFormCheckbox>
</template>
