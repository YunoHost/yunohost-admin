<template>
  <b-checkbox
    v-model="checked"
    v-on="$listeners"
    :id="id"
    :aria-describedby="$parent.id + '__BV_description_'"
    switch
  >
    {{ $t(labels[checked]) }}
  </b-checkbox>
</template>

<script>
export default {
  name: 'CheckboxItem',

  props: {
    value: { type: Boolean, required: true },
    id: { type: String, default: null },
    labels: { type: Object, default: () => ({ true: 'yes', false: 'no' }) }
  },

  data () {
    return {
      checked: this.value
    }
  }
}
</script>
