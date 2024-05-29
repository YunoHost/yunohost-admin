<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { VueClass } from '@/types/commons'

const props = withDefaults(
  defineProps<{
    id?: string
    submitText?: string
    validation?: BaseValidation
    serverError?: string
    inline?: boolean
    formClasses?: VueClass
    noFooter?: boolean
  }>(),
  {
    id: 'ynh-form',
    submitText: undefined,
    validation: undefined,
    serverError: '',
    inline: false,
    formClasses: undefined,
    noFooter: false,
  },
)

const emit = defineEmits<{
  submit: [e: SubmitEvent]
}>()

const { t } = useI18n()

const errorFeedback = computed(() => {
  const v = props.validation
  return (
    props.serverError ||
    (v && v.$errors.length ? t('form_errors.invalid_form') : '')
  )
})

function onSubmit(e: Event) {
  const v = props.validation
  if (v) {
    v.$touch()
    if (v.$pending || v.$errors.length) return
  }
  emit('submit', e as SubmitEvent)
}
</script>

<template>
  <!-- FIXME inheritAttrs false? probably remove vbind instead -->
  <YCard v-bind="$attrs" class="card-form">
    <template #default>
      <slot name="disclaimer" />

      {{ serverError }}
      <BForm
        :id="id"
        :inline="inline"
        :class="formClasses"
        @submit.prevent.stop="onSubmit"
        novalidate
      >
        <slot name="default" />

        <slot name="server-error">
          <BAlert
            variant="danger"
            class="my-3"
            icon="ban"
            :modelValue="errorFeedback !== ''"
          >
            <div v-html="errorFeedback" />
          </BAlert>
        </slot>
      </BForm>
    </template>

    <template v-if="!noFooter" #buttons>
      <slot name="buttons">
        <BButton type="submit" variant="success" :form="id">
          {{ submitText ? submitText : $t('save') }}
        </BButton>
      </slot>
    </template>
  </YCard>
</template>
