<script
  setup
  lang="ts"
  generic="C extends AnyWritableComponents, MV extends any"
>
import { createReusableTemplate } from '@vueuse/core'
import { computed, useAttrs } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTouch } from '@/composables/form'
import { omit } from '@/helpers/commons'
import type {
  AnyWritableComponents,
  BaseItemComputedProps,
  FormField,
  FormFieldProps,
  ItemComponentToItemProps,
} from '@/types/form'

defineOptions({
  name: 'FormField',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FormFieldProps<C, MV>>(), {
  append: undefined,
  asInputGroup: false,
  component: undefined,
  cProps: undefined,
  description: undefined,
  descriptionVariant: undefined,
  id: undefined,
  label: undefined,
  labelFor: undefined,
  link: undefined,
  prepend: undefined,
  rules: undefined,

  modelValue: undefined,
  validation: undefined,
})

defineEmits<{
  'update:modelValue': [value: MV]
}>()

const slots = defineSlots<{
  default?: (
    componentProps: FormField<C, MV>['cProps'] & BaseItemComputedProps<MV>,
  ) => any
  description?: any
}>()

const model = defineModel<MV>()

const attrs = useAttrs()
const { t } = useI18n()
useTouch(() => props.validation)

const computedAttrs = computed(() => {
  const attrs_ = { ...omit(attrs, ['hr', 'readonly', 'visible']) }

  if (props.label) {
    const defaultAttrs = {
      'label-cols-md': 4,
      'label-cols-lg': 3,
      'label-class': ['fw-bold', 'py-0'],
    }

    if (!('label-cols' in attrs_)) {
      let attr: keyof typeof defaultAttrs
      for (attr in defaultAttrs) {
        if (!(attr in attrs)) attrs_[attr] = defaultAttrs[attr]
      }
    } else if (!('label-class' in attrs)) {
      attrs_['label-class'] = defaultAttrs['label-class']
    }
  }

  if (props.asInputGroup) {
    attrs_['label-class'] = [
      ...((attrs_['label-class'] as []) || []),
      'visually-hidden',
    ]
  }

  return attrs_
})

const id = computed(() => {
  if (props.id) return props.id
  const childId = props.cProps?.id || props.labelFor
  return childId ? `${childId}-field` : undefined
})

const error = computed(() => {
  const v = props.validation
  if (v && v.$anyDirty) {
    return v.$errors.length ? { errors: v.$errors, $model: v.$model } : null
  }
  return null
})

const state = computed(() => {
  // Need to set state as null if no error, else component turn green
  return error.value ? false : null
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  const { errors, $model } = error.value
  // FIXME maybe handle translation in validators directly
  // https://vuelidate-next.netlify.app/advanced_usage.html#i18n-support

  return errors
    .map((err) => {
      if (err) {
        if (err.$validator === '$externalResults') return err.$message
        return t('form_errors.' + err.$validator, {
          value: $model,
          ...err.$params,
        })
      }
    })
    .join('<br>')
})

const [DefineTemplate, ReuseTemplate] = createReusableTemplate<{
  ariaDescribedby: string[]
}>()
</script>

<template>
  <DefineTemplate v-slot="{ ariaDescribedby }">
    <!-- Make field props and state available as scoped slot data -->
    <slot
      v-bind="{
        ...(props.cProps ?? ({} as ItemComponentToItemProps[C])),
        ariaDescribedby,
        modelValue: props.modelValue,
        state,
        validation: validation,
      }"
    >
      <!-- if no component was passed as slot, render a component from the props -->
      <Component
        v-bind="props.cProps"
        :is="component"
        v-model="model"
        :aria-describedby="ariaDescribedby"
        :state="state"
        :validation="validation"
      />
    </slot>
  </DefineTemplate>

  <!-- FIXME better use `labelSrOnly` prop instead of class but it is currently bugged -->
  <BFormGroup
    v-bind="computedAttrs"
    :id="id"
    :label="label"
    :label-for="labelFor || props.cProps?.id"
    :state="state"
  >
    <template #default="{ ariaDescribedby }">
      <BInputGroup v-if="asInputGroup || append || prepend" :append="append">
        <BInputGroupText
          v-if="asInputGroup || prepend"
          :aria-hidden="asInputGroup"
        >
          {{ asInputGroup ? label : prepend }}
        </BInputGroupText>
        <ReuseTemplate v-bind="{ ariaDescribedby }" />
      </BInputGroup>
      <ReuseTemplate v-else v-bind="{ ariaDescribedby }" />
    </template>

    <template #invalid-feedback>
      <span v-html="errorMessage" />
    </template>

    <template v-if="description || link || 'description' in slots" #description>
      <!-- Render description -->
      <template v-if="description || link">
        <div class="d-flex">
          <BLink
            v-if="link"
            :to="'name' in link ? link.name : undefined"
            :href="'href' in link ? link.href : undefined"
            class="ms-auto"
          >
            {{ link.text }}
          </BLink>
        </div>

        <VueShowdown
          v-if="description"
          :markdown="description"
          :class="{
            ['alert p-1 px-2 alert-' + descriptionVariant]: descriptionVariant,
          }"
        />
      </template>
      <!-- Slot available to overwrite the one above -->
      <slot name="description" />
    </template>
  </BFormGroup>
</template>

<style lang="scss" scoped>
:deep(.invalid-feedback code) {
  background-color: $gray-200;
}
</style>
