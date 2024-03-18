<template>
  <BButtonGroup class="w-100">
    <BButton
      v-if="!this.required && this.modelValue.file !== null"
      @click="clearFiles"
      variant="danger"
    >
      <span class="sr-only">{{ $t('delete') }}</span>
      <YIcon iname="trash" />
    </BButton>

    <BFormFile
      :modelValue="modelValue.file"
      ref="input-file"
      :id="id"
      :required="required"
      :placeholder="_placeholder"
      :accept="accept"
      :drop-placeholder="dropPlaceholder"
      :state="state"
      :browse-text="$t('words.browse')"
      @update:modelValue="onInput"
      @blur="touch(name)"
      @focusout="touch(name)"
    />
  </BButtonGroup>
</template>

<script>
import { inject } from 'vue'
import { getFileContent } from '@/helpers/commons'

export default {
  name: 'FileItem',

  props: {
    id: { type: String, default: null },
    modelValue: { type: Object, default: () => ({ file: null }) },
    placeholder: { type: String, default: 'Choose a file or drop it here...' },
    dropPlaceholder: { type: String, default: null },
    accept: { type: String, default: null },
    state: { type: Boolean, default: null },
    required: { type: Boolean, default: false },
    name: { type: String, default: null },
  },

  setup() {
    return {
      touch: inject('touch'),
    }
  },

  computed: {
    _placeholder: function () {
      return this.modelValue.file === null
        ? this.placeholder
        : this.modelValue.file.name
    },
  },

  methods: {
    onInput(file) {
      const value = {
        file,
        content: '',
        current: false,
        removed: false,
      }
      // Update the value with the new File and an empty content for now
      this.$emit('update:modelValue', value)

      // Asynchronously load the File content and update the value again
      getFileContent(file).then((content) => {
        this.$emit('update:modelValue', { ...value, content })
      })
    },

    clearFiles() {
      this.$refs['input-file'].reset()
      this.$emit('update:modelValue', {
        file: null,
        content: '',
        current: false,
        removed: true,
      })
    },
  },
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
