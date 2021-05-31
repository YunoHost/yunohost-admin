<template>
  <b-form-textarea
    v-model="value"
    :id="id"
    :placeholder="placeholder"
    :required="required"
    :state="state"
    rows="3"
    max-rows="6"
    v-on="$listeners"
    @blur="$parent.$emit('touch', name)"
  />
</template>

<script>
export default {
  name: 'TextAreaItem',

  props: {
    value: { type: String, default: null },
    id: { type: String, default: null },
    placeholder: { type: String, default: null },
    type: { type: String, default: 'text' },
    required: { type: Boolean, default: false },
    state: { type: Boolean, default: null },
    name: { type: String, default: null }
  }
}
</script>
