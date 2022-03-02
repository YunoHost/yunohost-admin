<template>
  <b-button-group class="w-100">
    <b-button
      v-if="!this.required && this.value.file !== null"
      @click="clearFiles" variant="danger"
    >
      <span class="sr-only">{{ $t('delete') }}</span>
      <icon iname="trash" />
    </b-button>

    <b-form-file
      :value="value.file"
      ref="input-file"
      :id="id"
      :required="required"
      :placeholder="_placeholder"
      :accept="accept"
      :drop-placeholder="dropPlaceholder"
      :state="state"
      :browse-text="$t('words.browse')"
      @input="onInput"
      @blur="$parent.$emit('touch', name)"
      @focusout.native="$parent.$emit('touch', name)"
    />
  </b-button-group>
</template>

<script>
import { getFileContent } from '@/helpers/commons'

export default {
  name: 'FileItem',

  props: {
    id: { type: String, default: null },
    value: { type: Object, default: () => ({ file: null }) },
    placeholder: { type: String, default: 'Choose a file or drop it here...' },
    dropPlaceholder: { type: String, default: null },
    accept: { type: String, default: null },
    state: { type: Boolean, default: null },
    required: { type: Boolean, default: false },
    name: { type: String, default: null }
  },

  computed: {
    _placeholder: function () {
      return this.value.file === null ? this.placeholder : this.value.file.name
    }
  },

  methods: {
    onInput (file) {
      const value = {
        file,
        content: '',
        current: false,
        removed: false
      }
      // Update the value with the new File and an empty content for now
      this.$emit('input', value)

      // Asynchronously load the File content and update the value again
      getFileContent(file).then(content => {
        this.$emit('input', { ...value, content })
      })
    },

    clearFiles () {
      this.$refs['input-file'].reset()
      this.$emit('input', {
        file: null,
        content: '',
        current: false,
        removed: true
      })
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
