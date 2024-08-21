<script setup lang="ts">
import { computed, inject } from 'vue'

import { ValidationTouchSymbol } from '@/composables/form'
import type { BaseItemComputedProps, TagsItemProps } from '@/types/form'

const props = withDefaults(
  defineProps<TagsItemProps & BaseItemComputedProps<string[]>>(),
  {
    id: undefined,
    name: undefined,
    placeholder: undefined,
    touchKey: undefined,
    limit: undefined,
    // options: undefined,

    ariaDescribedby: undefined,
    state: undefined,
    validation: undefined,
  },
)

const touch = inject(ValidationTouchSymbol)

const modelValue = defineModel<string[]>()

const required = computed(() => 'required' in (props?.validation ?? {}))

// FIXME rework for options/choices
// https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/form-tags.html#using-custom-form-components
</script>

<template>
  <BFormTags
    :id="id"
    v-model="modelValue"
    :name="name"
    :placeholder="placeholder"
    :limit="limit"
    :aria-describedby="ariaDescribedby"
    :state="state"
    :required="required"
    remove-on-delete
    separator=" ,;"
    @blur="touch?.(touchKey)"
  />
</template>
