<template>
  <BFormSelect
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :id="id"
    :options="choices"
    :required="required"
    @blur="touch(name)"
  />
</template>

<script>
import { inject } from 'vue'

export default {
  name: 'SelectItem',

  props: {
    modelValue: { type: [String, null], default: null },
    id: { type: String, default: null },
    choices: { type: Array, required: true },
    required: { type: Boolean, default: false },
    name: { type: String, default: null },
  },

  setup() {
    return {
      touch: inject('touch'),
    }
  },
}
</script>
