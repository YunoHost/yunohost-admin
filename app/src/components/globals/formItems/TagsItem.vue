<template>
  <b-form-tags
    :id="id"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    separator=" ,;"
    :limit="limit"
    remove-on-delete
    :state="state"
    @input="$emit('update:modelValue', $event)"
    @blur="$parent.$emit('touch', name)"
  />
</template>

<script>
export default {
  compatConfig: { MODE: 3 },

  name: 'TagsItem',

  props: {
    modelValue: { type: Array, default: null },
    id: { type: String, default: null },
    placeholder: { type: String, default: null },
    limit: { type: Number, default: null },
    required: { type: Boolean, default: false },
    state: { type: Boolean, default: null },
    name: { type: String, default: null }
  },

  emits: ['update:modelValue']
}
</script>

