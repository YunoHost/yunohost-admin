<template>
  <b-form-tags
    v-model="tags"
    :id="id"
    :placeholder="placeholder"
    :required="required"
    :state="state"
    v-on="$listeners"
    @blur="$parent.$emit('touch', name)"
  />
</template>

<script>
export default {
  name: 'TagsItem',

  data () {
    return {
      tags: null
    }
  },
  props: {
    value: { type: Array, default: null },
    id: { type: String, default: null },
    placeholder: { type: String, default: null },
    required: { type: Boolean, default: false },
    state: { type: Boolean, default: null },
    name: { type: String, default: null }
  }
}
</script>

