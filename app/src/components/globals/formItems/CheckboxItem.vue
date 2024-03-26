<template>
  <!-- FIXME vue3 - `modelValue`+`@update:model` doesn't work here, probably to the prop's name not being `value`. Sticking for now to `checked`+`@input` -->
  <BFormCheckbox
    :checked="modelValue"
    @input="$emit('update:modelValue', $event)"
    :id="id"
    :aria-describedby="$parent.id + '__BV_description_'"
    switch
  >
    {{ label || $t(labels[modelValue]) }}
  </BFormCheckbox>
</template>

<script>
export default {
  compatConfig: { MODE: 3 },
  name: 'CheckboxItem',

  props: {
    modelValue: { type: Boolean, required: true },
    id: { type: String, default: null },
    label: { type: String, default: null },
    labels: { type: Object, default: () => ({ true: 'yes', false: 'no' }) },
  },
}
</script>
