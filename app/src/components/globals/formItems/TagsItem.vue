<template>
  <BFormTags
    :value="modelValue"
    @input="$emit('update:modelValue', $event)"
    :id="id"
    :placeholder="placeholder"
    :required="required"
    separator=" ,;"
    :limit="limit"
    remove-on-delete
    :state="state"
    :options="options"
    @blur="$parent.$emit('touch', name)"
  />
</template>

<script>
export default {
  name: 'TagsItem',

  props: {
    modelValue: { type: Array, default: null },
    id: { type: String, default: null },
    placeholder: { type: String, default: null },
    limit: { type: Number, default: null },
    required: { type: Boolean, default: false },
    state: { type: Boolean, default: null },
    name: { type: String, default: null },
    options: { type: Array, default: null },
  },
}
</script>
