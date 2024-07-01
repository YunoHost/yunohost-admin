<script setup lang="ts">
type CustomEmail = {
  localPart: string | null
  separator: string
  domain: string | null
}

const props = withDefaults(
  defineProps<{
    modelValue: CustomEmail
    choices: string[]
    placeholder?: string
    id?: string
    state?: false | null
    type?: string
  }>(),
  {
    placeholder: undefined,
    id: undefined,
    state: undefined,
    type: 'email',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: CustomEmail]
}>()

function onInput(key: 'localPart' | 'domain', modelValue: string | null) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: modelValue,
  })
}
</script>

<template>
  <BInputGroup v-bind="$attrs">
    <InputItem
      :id="id"
      :modelValue="modelValue.localPart"
      :placeholder="placeholder"
      :state="state"
      :aria-describedby="id + 'local-part-desc'"
      @update:modelValue="onInput('localPart', $event)"
    />

    <BInputGroupText>{{ modelValue.separator }}</BInputGroupText>

    <SelectItem
      :modelValue="modelValue.domain"
      :choices="choices"
      :aria-describedby="id + 'domain-desc'"
      @update:modelValue="onInput('domain', $event)"
    />

    <span
      class="visually-hidden"
      :id="id + 'local-part-desc'"
      v-t="'address.local_part_description.' + type"
    />
    <span
      class="visually-hidden"
      :id="id + 'domain-desc'"
      v-t="'address.domain_description.' + type"
    />
  </BInputGroup>
</template>
