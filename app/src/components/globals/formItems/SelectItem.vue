<template>
  <BFormSelect
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :id="id"
    :options="choices"
    :required="required"
    @blur="$emit('blur', modelValue)"
  />
</template>

<script>
export default {
  name: 'SelectItem',

  props: {
    modelValue: { type: [String, null], default: null },
    id: { type: String, default: null },
    choices: { type: [Array, Object], required: true },
    required: { type: Boolean, default: false },
    name: { type: String, default: null },
  },
}
</script>
