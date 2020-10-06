<template>
  <b-select
    v-model="selected"
    :options="choices"
    @input="$emit('input', selected)"
    :required="required"
    :id="id"
    :aria-describedby="id + '-feedback'"
  />
</template>

<script>
export default {
  name: 'SelectItem',

  props: {
    value: { type: [String, null], default: null },
    choices: { type: [Array, Object], required: true },
    required: { type: Boolean, default: true },
    id: { type: String, required: true }
  },

  data () {
    return {
      selected: this.value
    }
  }
}
</script>
