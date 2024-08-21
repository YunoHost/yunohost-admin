<script setup lang="ts">
import type {
  AdressItemProps,
  AdressModelValue,
  BaseItemComputedProps,
} from '@/types/form'

withDefaults(
  defineProps<AdressItemProps & BaseItemComputedProps<AdressModelValue>>(),
  {
    id: undefined,
    name: undefined,
    placeholder: undefined,
    touchKey: undefined,
    type: 'email',

    state: undefined,
    validation: undefined,
    ariaDescribedby: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: AdressModelValue]
}>()

const model = defineModel<AdressModelValue>({ required: true })

function onInput(key: 'localPart' | 'domain', value: string | null) {
  emit('update:modelValue', {
    ...model.value,
    [key]: value,
  })
}
</script>

<template>
  <BInputGroup v-bind="$attrs">
    <InputItem
      :id="`${id}-local-part`"
      :placeholder="placeholder"
      touch-key="localPart"
      :model-value="model.localPart"
      :aria-describedby="`${id}-local-part-desc`"
      :state="validation?.localPart?.$error ? false : null"
      :validation="validation?.localPart"
      @update:model-value="onInput('localPart', $event as string)"
    />

    <BInputGroupText>{{ modelValue.separator }}</BInputGroupText>

    <SelectItem
      :id="`${id}-domain`"
      touch-key="domain"
      :model-value="modelValue.domain"
      :choices="choices"
      :aria-describedby="`${id}-domain-desc`"
      :state="validation?.domain?.$error ? false : null"
      :validation="validation?.domain"
      @update:model-value="onInput('domain', $event)"
    />
  </BInputGroup>

  <span
    :id="`${id}-local-part-desc`"
    v-t="'address.local_part_description.' + type"
    class="visually-hidden"
  />
  <span
    :id="`${id}-domain-desc`"
    v-t="'address.domain_description.' + type"
    class="visually-hidden"
  />
</template>
