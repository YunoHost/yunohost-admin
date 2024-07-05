<script setup lang="ts">
import type { BFormFile } from 'bootstrap-vue-next'
import { computed, inject, ref } from 'vue'

import { ValidationTouchSymbol } from '@/composables/form'
import { getFileContent } from '@/helpers/commons'
import type {
  BaseItemComputedProps,
  FileItemProps,
  FileModelValue,
} from '@/types/form'

const props = withDefaults(
  defineProps<FileItemProps & BaseItemComputedProps<FileModelValue>>(),
  {
    id: undefined,
    name: undefined,
    placeholder: 'Choose a file or drop it here...',
    touchKey: undefined,
    accept: '',
    dropPlaceholder: undefined,

    ariaDescribedby: undefined,
    modelValue: () => ({ file: null }),
    state: undefined,
    validation: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: FileModelValue]
}>()

const touch = inject(ValidationTouchSymbol)
const inputElem = ref<InstanceType<typeof BFormFile> | null>(null)

const placeholder = computed(() => {
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

const required = computed(() => 'required' in (props.validation ?? {}))
</script>

<template>
  <BInputGroup class="w-100">
    <template v-if="!required && modelValue.file !== null" #append>
      <BButton variant="danger" @click="clearFiles">
        <span class="visually-hidden">{{ $t('delete') }}</span>
        <YIcon iname="trash" />
      </BButton>
    </template>

    <BFormFile
      :id="id"
      ref="inputElem"
      :name="name"
      :placeholder="placeholder"
      :accept="accept"
      :drop-placeholder="dropPlaceholder"
      :aria-describedby="ariaDescribedby"
      :model-value="modelValue.file"
      :state="state"
      :browse-text="$t('words.browse')"
      :required="required"
      @blur="touch?.(touchKey)"
      @focusout="touch?.(touchKey)"
      @update:model-value="onInput"
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
