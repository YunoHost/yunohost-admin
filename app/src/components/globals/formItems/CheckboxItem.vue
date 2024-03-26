<template>
  <BFormCheckbox
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :id="id"
    :aria-describedby="$parent.id + '__BV_description_'"
    switch
  >
    {{ label || $t(labels[modelValue]) }}
  </BFormCheckbox>
</template>

<script>
export default {
  name: 'CheckboxItem',

  props: {
    modelValue: { type: Boolean, required: true },
    id: { type: String, default: null },
    label: { type: String, default: null },
    labels: { type: Object, default: () => ({ true: 'yes', false: 'no' }) },
  },
}
</script>
