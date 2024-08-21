<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    sublabel?: string
    description?: string
  }>(),
  {
    sublabel: undefined,
    description: undefined,
  },
)

const slots = defineSlots<{
  default?: any
}>()
</script>

<template>
  <BListGroupItem
    class="d-flex justify-content-between align-items-center pe-0"
  >
    <div>
      <h5>
        <strong class="fw-bold">{{ label }}</strong>
        <small v-if="sublabel" class="ms-1 text-secondary">
          {{ sublabel }}
        </small>
      </h5>
      <p v-if="description || slots.default" class="m-0">
        <slot name="default">
          {{ description }}
        </slot>
      </p>
    </div>

    <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
  </BListGroupItem>
</template>

<style lang="scss" scoped></style>
