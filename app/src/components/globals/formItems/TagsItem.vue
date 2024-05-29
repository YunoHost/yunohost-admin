<script setup lang="ts">
import { inject } from 'vue'

withDefaults(
  defineProps<{
    modelValue?: unknown[] | null
    id?: string
    placeholder?: string
    limit?: number
    required?: boolean
    state?: boolean
    name?: string
    // FIXME no options on BFormTags
    options?: unknown[]
  }>(),
  {
    modelValue: null,
    id: undefined,
    placeholder: undefined,
    limit: undefined,
    required: false,
    state: undefined,
    name: undefined,
    options: undefined,
  },
)

const touch = inject('touch')

// FIXME rework for options/choices
// https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/form-tags.html#using-custom-form-components
</script>

<template>
  <BFormTags
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :id="id"
    :placeholder="placeholder"
    :required="required"
    separator=" ,;"
    :limit="limit"
    remove-on-delete
    :state="state"
    :options="options"
    @blur="touch(name)"
  />
</template>
