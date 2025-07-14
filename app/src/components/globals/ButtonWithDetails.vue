<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    icon?: string
    details?: string
    onclick?: string
    variant?: string
    disabled?: boolean
  }>(),
  {
    label: undefined,
    icon: undefined,
    details: undefined,
    onclick: undefined,
    variant: 'info',
    disabled: false,
  },
)
</script>

<template>
  <BRow no-gutters class="w-100" align-v="center">
    <BCol>
      <VueShowdown :markdown="details" :class="`text-${variant}`" />
    </BCol>
    <BCol class="text-center" cols="12" md="4" lg="3">
      <BButton
        :variant="variant"
        class="mt-2 mt-md-0"
        :class="disabled ? 'disabled' : ''"
        @:click="onclick"
      >
        <YIcon :iname="icon" class="me-2" />
        <span>{{ label }}</span>
      </BButton>
    </BCol>
  </BRow>
</template>
