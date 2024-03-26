<template>
  <BFormTextarea
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :id="id"
    :placeholder="placeholder"
    :required="required"
    :state="state"
    rows="4"
    @blur="touch(name)"
  />
</template>

<script>
import { inject } from 'vue'

export default {
  name: 'TextAreaItem',

  props: {
    modelValue: { type: String, default: null },
    id: { type: String, default: null },
    placeholder: { type: String, default: null },
    type: { type: String, default: 'text' },
    required: { type: Boolean, default: false },
    state: { type: Boolean, default: null },
    name: { type: String, default: null },
  },

  setup() {
    return {
      touch: inject('touch'),
    }
  },
}
</script>
