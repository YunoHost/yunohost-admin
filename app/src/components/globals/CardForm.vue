<script
  setup
  lang="ts"
  generic="
    MV extends Obj,
    FFD extends FormFieldDict<MV>,
    V extends Validation<
      ValidationArgs<unknown>,
      { form: Ref<MV>; global: null }
    >
  "
>
import type { Validation, ValidationArgs } from '@vuelidate/core'
import { computed, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

import { toEntries } from '@/helpers/commons'
import type { Obj, VueClass } from '@/types/commons'
import type {
  AnyDisplayComponents,
  AnyWritableComponents,
  BaseItemComputedProps,
  FormFieldDict,
} from '@/types/form'
import { isDisplayComponent, isWritableComponent } from '@/types/form'

const props = withDefaults(
  defineProps<{
    id?: string
    modelValue?: MV
    fields?: FFD
    validations?: V
    submitText?: string
    inline?: boolean
    formClasses?: VueClass
    noFooter?: boolean
    hr?: boolean
  }>(),
  {
    id: 'ynh-form',
    modelValue: undefined,
    fields: undefined,
    validations: undefined,
    submitText: undefined,
    inline: false,
    formClasses: undefined,
    noFooter: false,
    hr: false,
  },
)

const emit = defineEmits<{
  submit: [e: SubmitEvent]
  'update:modelValue': [modelValue: MV]
}>()

const slots = defineSlots<
  {
    disclaimer?: any
    default?: any
    'server-error'?: any
    buttons: any
  } & {
    [K in Extract<keyof MV, string> as `field:${K}`]?: (_: FFD[K]) => any
  } & {
    [K in Extract<keyof FFD, string> as `component:${K}`]?: (
      _: FFD[K]['component'] extends AnyWritableComponents
        ? FFD[K]['props'] & BaseItemComputedProps<MV[K]>
        : FFD[K]['component'] extends AnyDisplayComponents
          ? FFD[K]['props']
          : never,
    ) => any
  }
>()

const { t } = useI18n()

const globalErrorFeedback = computed(() => {
  const v = props.validations
  if (!v) return ''
  const externalResults = toValue(v.global.$externalResults[0]?.$message)
  return externalResults ?? (v.form.$error ? t('form_errors.invalid_form') : '')
})

const fields = computed(() => (props.fields ? toEntries(props.fields) : []))

function onModelUpdate(key: keyof MV, value: MV[keyof MV]) {
  emit('update:modelValue', {
    ...props.modelValue!,
    [key]: value,
  })
}
</script>

<template>
  <YCard class="card-form">
    <template #default>
      <slot name="disclaimer" />

      <BForm
        :id="id"
        :inline="inline"
        :class="formClasses"
        novalidate
        @submit.prevent.stop="emit('submit', $event as SubmitEvent)"
      >
        <slot name="default">
          <template v-for="[key, fieldProps] in fields" :key="key">
            <template v-if="fieldProps.visible ?? true">
              <slot
                v-if="isWritableComponent<MV[typeof key]>(fieldProps)"
                :name="`field:${key}`"
                v-bind="fieldProps"
              >
                <FormField
                  v-if="!fieldProps.readonly"
                  v-bind="fieldProps"
                  :model-value="props.modelValue![key]"
                  :validation="props.validations?.form[key]"
                  @update:model-value="onModelUpdate(key, $event)"
                >
                  <template
                    v-if="slots[`component:${key}`]"
                    #default="childProps"
                  >
                    <slot :name="`component:${key}`" v-bind="childProps" />
                  </template>
                </FormField>
                <FormFieldReadonly
                  v-else
                  v-bind="fieldProps"
                  :model-value="props.modelValue![key]"
                />
              </slot>
              <slot
                v-else-if="isDisplayComponent(fieldProps)"
                :name="`component:${key}`"
                v-bind="fieldProps.props"
              >
                <Component
                  :is="fieldProps.component"
                  v-bind="fieldProps.props"
                />
              </slot>

              <hr v-if="fieldProps.hr ?? hr" />
            </template>
          </template>
        </slot>

        <slot name="server-error">
          <BAlert
            variant="danger"
            class="my-3"
            icon="ban"
            :model-value="globalErrorFeedback !== ''"
          >
            <div v-html="globalErrorFeedback" />
          </BAlert>
        </slot>
      </BForm>
    </template>

    <template v-if="!noFooter" #buttons>
      <slot name="buttons">
        <BButton type="submit" variant="success" :form="id">
          {{ submitText ?? $t('save') }}
        </BButton>
      </slot>
    </template>
  </YCard>
</template>
