<script setup lang="ts" generic="MV extends Obj, FFD extends FormFieldDict<MV>">
import { createReusableTemplate } from '@vueuse/core'
import { computed, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

import type { FormValidation } from '@/composables/form'
import { toEntries } from '@/helpers/commons'
import type { KeyOfStr, Obj, VueClass } from '@/types/commons'
import type { ConfigSection } from '@/types/configPanels'
import type {
  AnyDisplayComponents,
  AnyWritableComponents,
  BaseItemComputedProps,
  ButtonItemProps,
  FormFieldDict,
} from '@/types/form'
import { isDisplayComponent, isWritableComponent } from '@/types/form'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    id?: string
    fields?: FFD
    validations?: FormValidation<MV>
    submitText?: string
    inline?: boolean
    formClasses?: VueClass
    noFooter?: boolean
    hr?: boolean
    sections?: ConfigSection<MV, FFD>[]
  }>(),
  {
    id: 'ynh-form',
    fields: undefined,
    validations: undefined,
    submitText: undefined,
    inline: false,
    formClasses: undefined,
    noFooter: false,
    hr: false,
    sections: undefined,
  },
)

const emit = defineEmits<{
  submit: [e: SubmitEvent]
  action: [actionId: KeyOfStr<FFD>]
  'update:modelValue': [modelValue: MV]
}>()

const slots = defineSlots<
  {
    top?: any
    disclaimer?: any
    'before-form'?: any
    default?: any
    'server-error'?: any
    'after-form'?: any
    buttons: any
  } & {
    [K in KeyOfStr<FFD> as `field:${K}`]?: (_: FFD[K]) => any
  } & {
    [K in KeyOfStr<FFD> as `component:${K}`]?: (
      _: FFD[K]['component'] extends AnyWritableComponents
        ? FFD[K]['cProps'] & BaseItemComputedProps
        : FFD[K]['component'] extends AnyDisplayComponents
          ? FFD[K]['cProps']
          : never,
    ) => any
  }
>()

const modelValue = defineModel<MV>()
const show = defineModel<boolean>('show')

const { t } = useI18n()

const globalErrorFeedback = computed(() => {
  const v = props.validations
  if (!v) return ''
  const externalResults = toValue(v.global.$externalResults[0]?.$message)
  return externalResults ?? (v.form.$error ? t('form_errors.invalid_form') : '')
})

const fields = computed(() => (props.fields ? toEntries(props.fields) : []))
const sections = computed(() => {
  const { sections, fields } = props
  if (!sections || !fields) return
  return sections.map((section) => ({
    ...section,
    fields: section.fields.map((id) => [id, fields[id]]) as {
      [k in Extract<keyof FFD, string>]: [k, FFD[k]]
    }[Extract<keyof FFD, string>][],
  }))
})

function onModelUpdate(key: keyof MV, value: MV[keyof MV]) {
  emit('update:modelValue', {
    ...modelValue.value!,
    [key]: value,
  })
}

const Fields = createReusableTemplate<{
  fieldsProps: { [k in Extract<keyof FFD, string>]: [k, FFD[k]] }[Extract<
    keyof FFD,
    string
  >][]
}>()

// presence of <!-- @vue-expect-error --> are for `yarn type-check`,
// don't know why custom component slots name doesn't pass
</script>

<template>
  <Fields.define v-slot="{ fieldsProps }">
    <template v-for="[k, field] in fieldsProps" :key="k">
      <template v-if="toValue(field.visible) ?? true">
        <!-- @vue-expect-error -->
        <slot
          v-if="isWritableComponent<MV[typeof k]>(field)"
          :name="`field:${k}`"
          v-bind="field"
        >
          <FormField
            v-if="!field.readonly"
            v-bind="field"
            :model-value="modelValue![k]"
            :validation="props.validations?.form[k]"
            @update:model-value="onModelUpdate(k, $event)"
          >
            <!-- @vue-expect-error -->
            <template v-if="slots[`component:${k}`]" #default="childProps">
              <!-- @vue-expect-error -->
              <slot :name="`component:${k}`" v-bind="childProps" />
            </template>
          </FormField>
          <FormFieldReadonly
            v-else
            v-bind="field"
            :model-value="modelValue![k]"
          />
        </slot>
        <!-- @vue-expect-error -->
        <slot
          v-else-if="isDisplayComponent(field)"
          :name="`component:${k}`"
          v-bind="field.cProps"
        >
          <Component
            :is="field.component"
            v-if="field.component !== 'ButtonItem'"
            v-bind="field.cProps"
          />
          <ButtonItem
            v-else
            v-bind="field.cProps as ButtonItemProps"
            @action="emit('action', $event as KeyOfStr<FFD>)"
          />
        </slot>

        <hr v-if="field.hr ?? hr" />
      </template>
    </template>
  </Fields.define>

  <BModal v-model="show" v-bind="$attrs" centered class="card-form">
    <template #default>
      <slot name="top" />

      <slot name="disclaimer" />

      <slot name="before-form" />

      <BForm
        :id="id"
        :inline="inline"
        :class="formClasses"
        novalidate
        @submit.prevent.stop="emit('submit', $event as SubmitEvent)"
      >
        <slot name="default">
          <template v-if="sections">
            <template v-for="section in sections" :key="section.id">
              <Component
                :is="section.name ? 'section' : 'div'"
                v-if="toValue(section.visible)"
                class="form-section"
              >
                <BCardTitle v-if="section.name" title-tag="h3">
                  {{ section.name }}
                  <small v-if="section.help">{{ section.help }}</small>
                </BCardTitle>
                <!-- @vue-ignore-next-line -->
                <Fields.reuse :fields-props="section.fields" />
              </Component>
            </template>
          </template>
          <template v-else-if="fields">
            <!-- @vue-ignore-next-line -->
            <Fields.reuse :fields-props="fields" />
          </template>
        </slot>

        <slot name="server-error">
          <YAlert
            v-if="globalErrorFeedback !== ''"
            alert
            variant="danger"
            class="my-3"
            icon="ban"
          >
            <div v-html="globalErrorFeedback" />
          </YAlert>
        </slot>
      </BForm>

      <slot name="after-form" />
    </template>

    <template #footer>
      <BButton type="submit" variant="success" :form="id">
        {{ submitText ?? $t('save') }}
      </BButton>
    </template>
  </BModal>
</template>
