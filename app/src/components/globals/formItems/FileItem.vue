<script setup lang="ts">
import type { BFormFile } from 'bootstrap-vue-next'
import { computed, inject, ref } from 'vue'

import { getFileContent } from '@/helpers/commons'

type CustomFile = {
  file: File | null
  content?: string | null
  current?: boolean
  removed?: boolean
}

const props = withDefaults(
  defineProps<{
    id?: string
    modelValue?: CustomFile
    placeholder?: string
    dropPlaceholder?: string
    accept?: string
    state?: string
    required?: boolean
    name?: string
  }>(),
  {
    id: undefined,
    modelValue: () => ({ file: null }),
    placeholder: 'Choose a file or drop it here...',
    dropPlaceholder: undefined,
    accept: '',
    state: undefined,
    required: false,
    name: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: CustomFile]
}>()

const touch = inject('touch')
const inputElem = ref<InstanceType<typeof BFormFile> | null>(null)

const _placeholder = computed(() => {
  return props.modelValue.file === null
    ? props.placeholder
    : props.modelValue.file.name
})

function onInput(file: File | File[] | null) {
  const value = {
    file: file as File | null,
    content: file !== null ? '' : null,
    current: false,
    removed: false,
  }
  // Update the value with the new File and an empty content for now
  emit('update:modelValue', value)

  // Asynchronously load the File content and update the value again
  getFileContent(file as File).then((content) => {
    emit('update:modelValue', { ...value, content })
  })
}

function clearFiles() {
  inputElem.value!.reset()
  emit('update:modelValue', {
    file: null,
    content: '',
    current: false,
    removed: true,
  })
}
</script>

<template>
  <BInputGroup class="w-100">
    <template #append>
      <BButton
        v-if="!required && modelValue.file !== null"
        @click="clearFiles"
        variant="danger"
      >
        <span class="visually-hidden">{{ $t('delete') }}</span>
        <YIcon iname="trash" />
      </BButton>
    </template>

    <BFormFile
      :modelValue="modelValue.file"
      ref="inputElem"
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
  </BInputGroup>
</template>

<style lang="scss" scoped>
// fix https://getbootstrap.com/docs/5.2/migration/#forms
:deep(.custom-file-label) {
  color: $input-placeholder-color;

  .btn-danger + .b-form-file & {
    color: $input-color;
  }
}
</style>
