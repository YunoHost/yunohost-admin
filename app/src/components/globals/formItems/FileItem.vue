<template>
  <b-form-file
    :id="id"
    v-model="file"
    v-on="$listeners"
    :placeholder="placeholder"
    :drop-placeholder="dropPlaceholder"
    :state="Boolean(file)"
    :required="required"
    :accept="accept"
    @blur="$parent.$emit('touch', name)"
  />
</template>

<script>
export default {
  name: 'FileItem',
  data () {
    return { file: null }
  },
  props: {
    id: { type: String, default: null },
    placeholder: { type: String, default: null },
    dropPlaceholder: { type: String, default: null },
    required: { type: Boolean, default: false },
    state: { type: Boolean, default: null },
    name: { type: String, default: null },
    accept: { type: String, default: null }
  }
}
</script>
