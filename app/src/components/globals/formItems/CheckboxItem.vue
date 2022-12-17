<template>
  <b-checkbox
    :id="id"
    :checked="modelValue"
    :aria-describedby="$parent.id + '__BV_description_'"
    switch
    @input="$emit('update:modelValue', $event)"
  >
    {{ label || $t(labels[modelValue]) }}
  </b-checkbox>
</template>

<script>
export default {
  compatConfig: { MODE: 3 },

  name: 'CheckboxItem',

  props: {
    modelValue: { type: Boolean, required: true },
    id: { type: String, default: null },
    label: { type: String, default: null },
    labels: { type: Object, default: () => ({ true: 'yes', false: 'no' }) }
  },

  emits: ['update:modelValue']
}
</script>
