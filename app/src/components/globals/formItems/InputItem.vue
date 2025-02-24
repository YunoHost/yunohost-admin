<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'
import { computed, inject } from 'vue'

import { ValidationTouchSymbol } from '@/composables/form'
import type { BaseItemComputedProps, InputItemProps } from '@/types/form'
import { objectGet } from '@/helpers/commons'

const props = withDefaults(
  defineProps<InputItemProps & BaseItemComputedProps>(),
  {
    id: undefined,
    name: undefined,
    placeholder: undefined,
    touchKey: undefined,
    disabled: false,
    autocomplete: undefined,
    autocapitalize: undefined,
    // pattern: undefined,
    step: undefined,
    trim: true,
    type: 'text',
    spellcheck: undefined,

    ariaDescribedby: undefined,
    state: undefined,
    validation: undefined,
  },
)

const modelValue = defineModel<string | number | null>({
  set(value) {
    if (props.type === 'number' && typeof value === 'string') {
      if (value === '') return ''
      return parseInt(value)
    }
    return value
  },
})

const touch = inject(ValidationTouchSymbol)

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
    v-model="modelValue"
    :name="name"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :autocapitalize="autocapitalize"
    :step="step"
    :trim="trim"
    :type="type"
    :aria-describedby="ariaDescribedby"
    :state="state"
    :spellcheck="spellcheck"
    :disabled="disabled"
    @blur="touch?.(touchKey)"
  />
</template>
