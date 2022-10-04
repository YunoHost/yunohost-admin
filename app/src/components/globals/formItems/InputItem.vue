<template>
  <b-input
    :value="value"
    :id="id"
    :placeholder="placeholder"
    :type="type"
    :state="state"
    :required="required"
    :min="min"
    :max="max"
    :step="step"
    :trim="trim"
    :autocomplete="autocomplete_"
    v-on="$listeners"
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
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    step: { type: Number, default: null },
    trim: { type: Boolean, default: true },
    autocomplete: { type: String, default: null },
    pattern: { type: Object, default: null },
    name: { type: String, default: null }
  },

  data () {
    return {
      autocomplete_: (this.autocomplete) ? this.autocomplete : (this.type === 'password') ? 'new-password' : null
    }
  }
}
</script>
