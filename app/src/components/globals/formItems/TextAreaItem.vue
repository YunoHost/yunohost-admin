<script setup lang="ts">
import { inject } from 'vue'

withDefaults(
  defineProps<{
    modelValue?: string | null
    id?: string
    placeholder?: string
    type?: string // FIXME unused?
    required?: boolean
    state?: boolean | null
    name?: string
  }>(),
  {
    modelValue: null,
    id: undefined,
    placeholder: undefined,
    type: 'text',
    required: false,
    state: undefined,
    name: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const touch = inject('touch')
</script>

<template>
  <BFormTextarea
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :id="id"
    :placeholder="placeholder"
    :required="required"
    :state="state"
    rows="4"
    @blur="touch(name)"
  />
</template>
