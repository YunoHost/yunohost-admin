<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'
import type { BaseColorVariant } from 'bootstrap-vue-next'
import { computed, provide, useAttrs, type Component } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Obj } from '@/types/commons'

defineOptions({
  inheritAttrs: false,
  name: 'FormField',
})

const props = withDefaults(
  defineProps<{
    // Component props (other <form-group> related attrs are passed thanks to $attrs)
    id?: string
    description?: string
    descriptionVariant?: BaseColorVariant
    link?: { href: string; text: string }
    component?: Component | string // FIXME limit to formItems?
    modelValue?: unknown
    props?: Obj
    validation?: BaseValidation
    validationIndex?: number
  }>(),
  {
    id: undefined,
    description: undefined,
    descriptionVariant: undefined,
    link: undefined,
    component: 'InputItem',
    modelValue: undefined,
    props: () => ({}),
    validation: undefined,
    validationIndex: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

function touch(name: string) {
  if (props.validation) {
    // For fields that have multiple elements
    if (name) {
      props.validation[name].$touch()
    } else {
      props.validation.$touch()
    }
  }
}

provide('touch', touch)

const attrs_ = useAttrs()
const attrs = computed(() => {
  const attrs = { ...attrs_ }

  if ('label' in attrs) {
    const defaultAttrs = {
      'label-cols-md': 4,
      'label-cols-lg': 3,
      'label-class': ['fw-bold', 'py-0'],
    }

    if (!('label-cols' in attrs)) {
      let attr: keyof typeof defaultAttrs
      for (attr in defaultAttrs) {
        if (!(attr in attrs)) attrs[attr] = defaultAttrs[attr]
      }
    } else if (!('label-class' in attrs)) {
      attrs['label-class'] = defaultAttrs['label-class']
    }
  }

  return attrs
})

const id = computed(() => {
  if (props.id) return props.id
  const childId = props.props.id || attrs_['label-for']
  return childId ? childId + '_group' : null
})

const error = computed(() => {
  const v = props.validation
  if (v) {
    if (props.validationIndex !== undefined) {
      const errors = v.$each.$response.$errors[props.validationIndex]
      const err = Object.values(errors).find((part) => {
        return part.length
      })
      return err?.length ? err[0] : null
    }
    return v.$errors.length ? { ...v.$errors[0], $model: v.$model } : null
  }
  return null
})

const state = computed(() => {
  // Need to set state as null if no error, else component turn green
  return error.value ? false : null
})

const errorMessage = computed(() => {
  const err = error.value
  if (err) {
    if (err.$message) return err.$message
    return t('form_errors.' + err.$validator, {
      value: err.$model,
      ...err.$params,
    })
  }
  return ''
})
</script>

<template>
  <!-- v-bind="$attrs" allow to pass default attrs not specified in this component slots -->
  <BFormGroup
    v-bind="attrs"
    :id="id"
    :label-for="attrs['label-for'] || props.id"
    :state="state"
    @touch="touch"
  >
    <!-- Make field props and state available as scoped slot data -->
    <slot v-bind="{ self: { ...props, state }, touch }">
      <!-- if no component was passed as slot, render a component from the props -->
      <Component
        v-bind="props.props"
        :is="component"
        :modelValue="modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
        :state="state"
        :required="validation ? 'required' in validation : false"
      />
    </slot>

    <template #invalid-feedback>
      <span v-html="errorMessage" />
    </template>

    <template #description>
      <!-- Render description -->
      <template v-if="description || link">
        <div class="d-flex">
          <BLink v-if="link" :to="link" :href="link.href" class="ms-auto">
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
