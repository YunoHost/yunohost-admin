<template>
  <b-form-textarea
    :id="id"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :state="state"
    rows="4"
    @update="$emit('update:modelValue', $event)"
    @blur="$parent.$emit('touch', name)"
  />
</template>

<script>
export default {
  compatConfig: { MODE: 3 },

  name: 'TextAreaItem',

  props: {
    modelValue: { type: String, default: null },
    id: { type: String, default: null },
    placeholder: { type: String, default: null },
    type: { type: String, default: 'text' },
    required: { type: Boolean, default: false },
    state: { type: Boolean, default: null },
    name: { type: String, default: null }
  },

  emits: ['update:modelValue']
}
</script>
