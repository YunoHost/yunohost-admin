<template>
  <b-checkbox
    v-model="checked"
    @input="$emit('input', checked)"
    :id="id"
    :aria-describedby="id + '-feedback'"
    switch
  >
    {{ $t(checked ? 'yes' : 'no') }}
  </b-checkbox>
</template>

<script>
export default {
  name: 'CheckboxItem',

  props: {
    value: { type: Boolean, required: true },
    id: { type: String, required: true }
  },

  data () {
    return {
      checked: this.value
    }
  }
}
</script>
