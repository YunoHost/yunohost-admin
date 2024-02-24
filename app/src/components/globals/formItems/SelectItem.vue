<template>
  <BFormSelect
    :value="value"
    :id="id"
    :options="choices"
    :required="required"
    v-on="$listeners"
    @blur.native="$emit('blur', value)"
  />
</template>

<script>
export default {
  name: 'SelectItem',

  props: {
    value: { type: [String, null], default: null },
    id: { type: String, default: null },
    choices: { type: [Array, Object], required: true },
    required: { type: Boolean, default: false },
    name: { type: String, default: null }
  }
}
</script>
