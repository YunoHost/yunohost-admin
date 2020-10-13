<template>
  <b-form-group
    label-cols-md="4" label-cols-lg="2"
    :label="label" :label-for="'input-' + id"
    :description="description"
  >
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
    <template v-slot:description>
      <slot name="description" />
    </template>
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
    required: { type: Boolean, default: true },
    description: { type: String, default: null }
  },

  data () {
    return {
      content: this.value
    }
  }
}
</script>
