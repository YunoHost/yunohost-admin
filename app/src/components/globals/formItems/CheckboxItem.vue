<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    id?: string
    label?: string
    labels?: { true: string; false: string }
  }>(),
  {
    id: undefined,
    label: undefined,
    labels: () => ({ true: 'yes', false: 'no' }),
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <BFormCheckbox
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :id="id"
    :aria-describedby="$parent.id + '__BV_description_'"
    switch
  >
    {{ label || $t(labels[modelValue]) }}
  </BFormCheckbox>
</template>
