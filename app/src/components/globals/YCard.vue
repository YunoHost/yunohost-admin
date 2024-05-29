<script setup lang="ts">
import type { Breakpoint } from 'bootstrap-vue-next'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    id?: string
    title?: string
    titleTag?: string
    icon?: string
    collapsable?: boolean
    collapsed?: boolean
    buttonUnbreak?: Breakpoint
  }>(),
  {
    id: 'ynh-form',
    title: undefined,
    titleTag: 'h2',
    icon: undefined,
    collapsable: false,
    collapsed: false,
    buttonUnbreak: 'md',
  },
)

const slots = defineSlots<{
  header: any
  'header-next': any
  'header-buttons': any
  default: any
  buttons: any
}>()

const visible = ref(!props.collapsed)
</script>

<template>
  <BCard :no-body="collapsable ? true : $attrs['no-body']">
    <template #header>
      <div class="w-100 d-flex align-items-center flex-wrap custom-header">
        <slot name="header">
          <Component :is="titleTag" class="custom-header-title">
            <YIcon v-if="icon" :iname="icon" class="me-2" />{{ title }}
          </Component>
          <slot name="header-next" />
        </slot>

        <div
          v-if="slots['header-buttons']"
          class="mt-2 w-100 custom-header-buttons"
          :class="{
            [`ms-${buttonUnbreak}-auto mt-${buttonUnbreak}-0 w-${buttonUnbreak}-auto`]:
              buttonUnbreak,
          }"
        >
          <slot name="header-buttons" />
        </div>
      </div>

      <BButton
        v-if="collapsable"
        @click="visible = !visible"
        size="sm"
        variant="outline-secondary"
        class="align-self-center ms-auto"
        :class="{
          'not-collapsed': visible,
          collapsed: !visible,
          [`ms-${buttonUnbreak}-2`]: buttonUnbreak,
        }"
      >
        <YIcon iname="chevron-right" />
        <span class="visually-hidden">{{ $t('words.collapse') }}</span>
      </BButton>
    </template>

    <BCollapse v-if="collapsable" :visible="visible">
      <slot v-if="'no-body' in $attrs" name="default" />
      <BCardBody v-else>
        <slot name="default" />
      </BCardBody>
    </BCollapse>
    <template v-else>
      <slot name="default" />
    </template>

    <template #footer v-if="slots['buttons']">
      <slot name="buttons" />
    </template>
  </BCard>
</template>

<style lang="scss" scoped>
:deep(.card-header) {
  display: flex;

  .custom-header {
    & > :first-child {
      margin-right: 1rem;
    }

    .btn + .btn {
      margin-left: 0.5rem;
    }
  }
}

:deep(.card-footer) {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  & > *:not(:first-child) {
    margin-left: 0.5rem;
  }
}
:deep(.collapse:not(.show) + .card-footer) {
  display: none;
}
</style>
