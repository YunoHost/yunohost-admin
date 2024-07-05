<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'
import { computed, inject } from 'vue'

import { ValidationTouchSymbol } from '@/composables/form'
import type { BaseItemComputedProps, InputItemProps } from '@/types/form'
import { objectGet } from '@/helpers/commons'

const props = withDefaults(
  defineProps<InputItemProps & BaseItemComputedProps<string | number | null>>(),
  {
    id: undefined,
    name: undefined,
    placeholder: undefined,
    touchKey: undefined,
    autocomplete: undefined,
    // pattern: undefined,
    step: undefined,
    trim: true,
    type: 'text',

    ariaDescribedby: undefined,
    modelValue: undefined,
    state: undefined,
    validation: undefined,
  },
)
defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const touch = inject(ValidationTouchSymbol)

const model = defineModel<string | number | null>()

const autocomplete = computed(() => {
  const typeToAutocomplete = {
    password: 'new-password',
    email: 'email',
    url: 'url',
  } as const
  return props.autocomplete || objectGet(typeToAutocomplete, props.type)
})

const fromValidation = computed(() => {
  const validation = props?.validation ?? ({} as BaseValidation)
  return {
    required: 'required' in validation,
    min: 'min' in validation ? validation.min.$params.min : undefined,
    max: 'max' in validation ? validation.max.$params.max : undefined,
  }
})
</script>

<template>
  <BFormInput
    :id="id"
    v-bind="fromValidation"
    v-model="model"
    :name="name"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :step="step"
    :trim="trim"
    :type="type"
    :aria-describedby="ariaDescribedby"
    :state="state"
    @blur="touch?.(touchKey)"
  />
</template>
