<template>
  <b-button-group class="w-100">
    <b-button
      v-if="!required && modelValue.file !== null"
      variant="danger"
      @click="clearFiles"
    >
      <span class="sr-only">{{ $t('delete') }}</span>
      <icon iname="trash" />
    </b-button>

    <b-form-file
      :id="id"
      ref="input-file"
      :value="modelValue.file"
      :required="required"
      :placeholder="placeholder_"
      :accept="accept"
      :drop-placeholder="dropPlaceholder"
      :state="state"
      :browse-text="$t('words.browse')"
      @input="onInput"
      @blur="$parent.$emit('touch', name)"
      @focusout="$parent.$emit('touch', name)"
    />
  </b-button-group>
</template>

<script>
import { getFileContent } from '@/helpers/commons'

export default {
  compatConfig: { MODE: 3, COMPONENT_FUNCTIONAL: true },

  name: 'FileItem',

  props: {
    id: { type: String, default: null },
    modelValue: { type: Object, default: () => ({ file: null }) },
    placeholder: { type: String, default: 'Choose a file or drop it here...' },
    dropPlaceholder: { type: String, default: null },
    accept: { type: String, default: null },
    state: { type: Boolean, default: null },
    required: { type: Boolean, default: false },
    name: { type: String, default: null }
  },

  emits: ['update:modelValue'],

  computed: {
    placeholder_: function () {
      const { file } = this.modelValue
      return file === null ? this.placeholder : file.name
    }
  },

  methods: {
    onInput (file) {
      const value = {
        file,
        content: '',
        current: false,
        removed: file === null
      }
      // Update the value with the new File and an empty content for now
      this.$emit('update:modelValue', value)

      // Asynchronously load the File content and update the value again
      if (file) {
        getFileContent(file).then(content => {
          this.$emit('update:modelValue', { ...value, content })
        })
      }
    },

    clearFiles () {
      this.$refs['input-file'].reset()
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.custom-file-label) {
  color: $input-placeholder-color;

  .btn-danger + .b-form-file & {
    color: $input-color;
  }
}
</style>
