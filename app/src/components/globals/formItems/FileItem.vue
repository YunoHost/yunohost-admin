<template>
  <b-button-group class="w-100">
    <b-button @click="clearFiles" variant="danger" v-if="!this.required && this.value !== null && !this.value._removed">
      <icon iname="trash" />
    </b-button>
    <b-form-file
      v-model="file"
      ref="input-file"
      :id="id"
      v-on="$listeners"
      :required="required"
      :placeholder="_placeholder"
      :accept="accept"
      :drop-placeholder="dropPlaceholder"
      :state="state"
      :browse-text="$t('words.browse')"
      @blur="$parent.$emit('touch', name)"
      @focusout.native="$parent.$emit('touch', name)"
    />
  </b-button-group>
</template>

<script>
export default {
  name: 'FileItem',

  data () {
    return {
      file: this.value
    }
  },

  props: {
    id: { type: String, default: null },
    value: { type: [File, null], default: null },
    placeholder: { type: String, default: 'Choose a file or drop it here...' },
    dropPlaceholder: { type: String, default: null },
    accept: { type: String, default: null },
    state: { type: Boolean, default: null },
    required: { type: Boolean, default: false },
    name: { type: String, default: null }
  },

  computed: {
    _placeholder: function () {
        return (this.value === null) ? this.placeholder : this.value.name
    }
  },

  methods: {
    clearFiles () {
      const f = new File([''], this.placeholder)
      f._removed = true
      if (this.value && this.value.currentfile) {
        this.$refs['input-file'].reset()
        this.$emit('input', f)
      } else {
        this.$refs['input-file'].setFiles([f])
        this.file = f
        this.$emit('input', f)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .custom-file-label {
  color: $input-placeholder-color;

  .btn-danger + .b-form-file & {
    color: $input-color;
  }
}
</style>
