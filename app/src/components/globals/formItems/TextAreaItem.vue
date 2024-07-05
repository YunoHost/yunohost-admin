<script setup lang="ts">
import { computed, inject } from 'vue'

import { ValidationTouchSymbol } from '@/composables/form'
import type { BaseItemComputedProps, TextAreaItemProps } from '@/types/form'

const props = withDefaults(
  defineProps<TextAreaItemProps & BaseItemComputedProps<string | null>>(),
  {
    id: undefined,
    name: undefined,
    placeholder: undefined,
    touchKey: undefined,
    // type: 'text',

    ariaDescribedby: undefined,
    modelValue: undefined,
    state: undefined,
    validation: undefined,
  },
)

defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const model = defineModel<string>()

const touch = inject(ValidationTouchSymbol)

const required = computed(() => 'required' in (props?.validation ?? {}))
</script>

<template>
  <BFormTextarea
    :id="id"
    v-model="model"
    :name="name"
    :placeholder="placeholder"
    :aria-describedby="ariaDescribedby"
    :state="state"
    :required="required"
    rows="4"
    @blur="touch?.(touchKey)"
  />
</template>
