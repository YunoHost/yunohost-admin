<template>
  <b-input
    v-model="input"
    @input="$emit('input', input)"
    :id="id"
    :placeholder="placeholder"
    :aria-describedby="id + '-feedback'"
    :type="type"
    :state="isValid"
    :required="required"
  />
</template>

<script>
export default {
  name: 'InputItem',

  props: {
    value: { type: [String, Number, null], default: null },
    id: { type: String, required: true },
    placeholder: { type: String, default: null },
    isValid: { type: [Boolean, null], default: null },
    error: { type: String, default: '' },
    type: { type: String, default: 'text' },
    required: { type: Boolean, default: true }
  },

  data () {
    return {
      input: this.value
    }
  }
}
</script>
