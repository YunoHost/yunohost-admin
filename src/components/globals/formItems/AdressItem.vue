<script setup lang="ts">
import type {
  AdressItemProps,
  AdressModelValue,
  BaseItemComputedProps,
} from '@/types/form'

withDefaults(defineProps<AdressItemProps & BaseItemComputedProps>(), {
  id: undefined,
  name: undefined,
  placeholder: undefined,
  touchKey: undefined,
  disabled: false,
  type: 'email',

  state: undefined,
  validation: undefined,
  ariaDescribedby: undefined,
})

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
      :disabled="disabled"
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
      :disabled="disabled"
      @update:model-value="onInput('domain', $event)"
    />
  </BInputGroup>

  <!--
    i18n: address.domain_description.domain
    i18n: address.domain_description.email
    i18n: address.local_part_description.domain
    i18n: address.local_part_description.email
   -->

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
