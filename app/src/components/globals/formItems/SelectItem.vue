<script setup lang="ts">
import { computed, inject } from 'vue'

import { ValidationTouchSymbol } from '@/composables/form'
import type { BaseItemComputedProps, SelectItemProps } from '@/types/form'

const props = withDefaults(
  defineProps<SelectItemProps & BaseItemComputedProps<string | null>>(),
  {
    id: undefined,
    name: undefined,
    placeholder: undefined,
    touchKey: undefined,

    ariaDescribedby: undefined,
    modelValue: undefined,
    state: undefined,
    validation: undefined,
  },
)

defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const model = defineModel<string | number | null>({
  set: (value) => {
    if (value === 'null') {
      return null
    }
    return value
  },
})

const isOptionalSelectOption = computed(() => {
  // FIXME `None` handling for config panels is a bit weird
  return props.choices?.some(
    (choice) => typeof choice !== 'string' && choice.value === '_none',
  )
})

const touch = inject(ValidationTouchSymbol)

const required = computed(() => 'required' in (props?.validation ?? {}))
</script>

<template>
  <BFormSelect
    :id="id"
    v-model="model"
    :name="name"
    :options="choices"
    :aria-describedby="ariaDescribedby"
    :state="state"
    :required="required"
    @blur="touch?.(touchKey)"
  >
    <template v-if="!isOptionalSelectOption" #first>
      <BFormSelectOption value="null" :disabled="required">
        -- {{ required ? $t('select_an_option') : $t('words.none') }} --
      </BFormSelectOption>
    </template>
  </BFormSelect>
</template>
