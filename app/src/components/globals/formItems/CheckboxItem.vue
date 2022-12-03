<template>
  <b-checkbox
    :checked="value"
    @input="$emit('input', $event)"
    :id="id"
    :aria-describedby="$parent.id + '__BV_description_'"
    switch
  >
    {{ label || $t(labels[value]) }}
  </b-checkbox>
</template>

<script>
export default {
  name: 'CheckboxItem',

  props: {
    value: { type: Boolean, required: true },
    id: { type: String, default: null },
    label: { type: String, default: null },
    labels: { type: Object, default: () => ({ true: 'yes', false: 'no' }) }
  }
}
</script>
