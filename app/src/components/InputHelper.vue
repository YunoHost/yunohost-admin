<template>
  <b-form-group label-cols="auto" :label="label" :label-for="'input-' + id">
    <b-input
      v-model="content"
      @update="$emit('input', content)"
      :id="id"
      :placeholder="placeholder"
      :aria-describedby="id + '-feedback'"
      :type="type"
      :state="state"
      :required="required"
    />
    <b-form-invalid-feedback :id="id + '-feedback'" :state="state">
      {{ error }}
    </b-form-invalid-feedback>
  </b-form-group>
</template>

<script>
export default {
  name: 'InputHelper',
  props: {
    // `value` is actually passed thru the `v-model` directive
    value: { type: [String, Number], required: true },
    label: { type: String, required: true },
    id: { type: String, required: true },
    type: { type: String, default: 'text' },
    placeholder: { type: String, default: null },
    state: { type: null, default: null },
    error: { type: String, default: '' },
    required: { type: Boolean, default: true }
  },

  data () {
    return {
      content: this.value
    }
  }
}
</script>
