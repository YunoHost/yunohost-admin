<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Cols } from '@/types/commons'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    label: string
    component?: string
    // FIXME modelValue? not a modelValue but idk
    value?: any
    cols?: Cols
  }>(),
  {
    component: 'InputItem',
    value: null,
    cols: () => ({ md: 4, lg: 3 }),
  },
)

const { t } = useI18n()

const cols = computed<Cols>(() => ({
  md: 4,
  xl: 3,
  ...props.cols,
}))

const text = computed(() => {
  return parseValue(props.value)
})

function parseValue(value: any) {
  const item = props.component
  if (item === 'FileItem') value = value.file ? value.file.name : null
  if (item === 'CheckboxItem') value = t(value ? 'yes' : 'no')
  if (item === 'TextAreaItem') value = value.replaceAll('\n', '<br>')
  if (Array.isArray(value)) {
    value = value.length ? value.join(t('words.separator')) : null
  }
  if ([null, undefined, ''].includes(props.value)) value = t('words.none')
  return value
}
</script>

<template>
  <BRow no-gutters class="description-row">
    <BCol v-bind="cols" class="fw-bold">
      {{ label }}
    </BCol>

    <BCol>
      <!-- FIXME not sure about rendering html -->
      <div v-html="text" />
    </BCol>
  </BRow>
</template>

<style lang="scss" scoped>
.description-row {
  @include media-breakpoint-up(md) {
    margin: 1rem 0;
  }
  @include media-breakpoint-down(md) {
    flex-direction: column;
    &:not(:last-of-type) {
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: $border-width solid $card-border-color;
    }
  }
}
</style>
