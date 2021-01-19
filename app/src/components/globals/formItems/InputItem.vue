<template>
  <b-input
    :value="value"
    :id="id"
    v-on="$listeners"
    :placeholder="placeholder"
    :type="type"
    :state="state"
    :required="required"
    @blur="$parent.$emit('touch', name)"
  />
</template>

<script>
export default {
  name: 'InputItem',

  props: {
    value: { type: [String, Number], default: null },
    id: { type: String, default: null },
    placeholder: { type: String, default: null },
    type: { type: String, default: 'text' },
    required: { type: Boolean, default: false },
    state: { type: Boolean, default: null },
    name: { type: String, default: null }
  }
}
</script>
