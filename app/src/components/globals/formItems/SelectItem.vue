<script setup lang="ts">
import { inject } from 'vue'

withDefaults(
  defineProps<{
    modelValue?: string | null
    id?: string
    choices: string[]
    required?: boolean
    name?: string
  }>(),
  {
    modelValue: null,
    id: undefined,
    required: false,
    name: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const touch = inject('touch')
</script>

<template>
  <BFormSelect
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :id="id"
    :options="choices"
    :required="required"
    @blur="touch(name)"
  />
</template>
