<template>
  <b-select
    :id="id"
    :value="modelValue"
    :options="choices"
    :required="required"
    @input="$emit('update:modelValue', $event)"
  />
</template>

<script>
export default {
  compatConfig: { MODE: 3 },

  name: 'SelectItem',

  props: {
    modelValue: { type: [String, null], default: null },
    id: { type: String, default: null },
    choices: { type: [Array, Object], required: true },
    required: { type: Boolean, default: false },
    name: { type: String, default: null }
  },

  emits: ['update:modelValue']
}
</script>
