<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'
import { computed } from 'vue'

import { filterObject } from '@/helpers/commons'
import type { Obj } from '@/types/commons'

const props = defineProps<{
  tabId: string
  panels: Obj[]
  forms: Obj<Obj>
  v: BaseValidation
}>()

const slots = defineSlots<{
  'tab-top': any
  'tab-before': any
  'tab-after': any
}>()

const emit = defineEmits<{
  apply: [
    value:
      | { id: string; form: Obj }
      | { id: string; form: Obj; action: string; name: string },
  ]
}>()

const panel = computed(() => {
  // FIXME throw error if no panel?
  return props.panels.find((panel) => panel.id === props.tabId)
})

const validation = computed(() => {
  return props.v.forms[panel.value?.id]
})

function onApply() {
  const panelId = panel.value?.id

  emit('apply', {
    id: panelId,
    form: props.forms[panelId],
  })
}

function onAction(sectionId: string, actionId: string, actionFields) {
  const panelId = panel.value?.id
  const actionFieldsKeys = Object.keys(actionFields)

  emit('apply', {
    id: panelId,
    form: filterObject(props.forms[panelId], ([key]) =>
      actionFieldsKeys.includes(key),
    ),
    action: [panelId, sectionId, actionId].join('.'),
    name: actionId,
  })
}
</script>

<template>
  <AbstractForm
    v-if="panel"
    v-bind="{
      id: panel.id + '-form',
      validation,
      serverError: panel.serverError,
    }"
    @submit="onApply"
    :no-footer="!panel.hasApplyButton"
  >
    <slot name="tab-top" />

    <template v-if="panel.help" #disclaimer>
      <div class="alert alert-info" v-html="panel.help" />
    </template>

    <slot name="tab-before" />

    <template v-for="section in panel.sections">
      <Component
        v-if="section.visible"
        :is="section.name ? 'section' : 'div'"
        :key="section.id"
        class="panel-section"
      >
        <BCardTitle v-if="section.name" title-tag="h3">
          {{ section.name }}
          <small v-if="section.help">{{ section.help }}</small>
        </BCardTitle>

        <template v-for="(field, fname) in section.fields">
          <!-- FIXME rework the whole component chain to avoid direct mutation of the `forms` props -->
          <!-- eslint-disable -->
          <Component
            v-if="field.visible"
            :is="field.is"
            v-bind="field.props"
            v-model="forms[panel.id][fname]"
            :validation="validation[fname]"
            :key="fname"
            @action.stop="onAction(section.id, fname, section.fields)"
          />
          <!-- eslint-enable -->
        </template>
      </Component>
    </template>

    <slot name="tab-after" />
  </AbstractForm>
</template>

<style lang="scss" scoped>
.card-title {
  margin-bottom: 1em;
  border-bottom: solid $border-width $gray-500;
}
:deep(.panel-section:not(:last-child)) {
  margin-bottom: 3rem;
}
</style>
