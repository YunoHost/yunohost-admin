<script setup lang="ts">
import { inject } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    id?: string
    placeholder?: string
    type?: string
    required?: boolean
    state?: false | null
    min?: number
    max?: number
    step?: number
    trim?: boolean
    autocomplete?: string
    // FIXME pattern?
    pattern?: object
    name?: string
  }>(),
  {
    modelValue: null,
    id: undefined,
    placeholder: undefined,
    type: 'text',
    required: false,
    state: undefined,
    min: undefined,
    max: undefined,
    step: undefined,
    trim: true,
    autocomplete: undefined,
    pattern: undefined,
    name: undefined,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const touch = inject('touch')

const autocomplete =
  props.autocomplete || props.type === 'password' ? 'new-password' : null
</script>

<template>
  <BFormInput
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :id="id"
    :placeholder="placeholder"
    :type="type"
    :state="state"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    :trim="trim"
    :autocomplete="autocomplete"
    @blur="touch(name)"
  />
</template>
