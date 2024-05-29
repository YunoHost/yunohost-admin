<script setup lang="ts">
import type { BaseValidation } from '@vuelidate/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    id?: string
    submitText?: string
    validation?: BaseValidation
    serverError?: string
    inline?: boolean
    noFooter?: boolean
  }>(),
  {
    id: 'ynh-form',
    submitText: undefined,
    validation: undefined,
    serverError: '',
    inline: false,
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
  <div>
    <BCardBody>
      <slot name="disclaimer" />

      <BForm
        v-bind="$attrs"
        :id="id"
        :inline="inline"
        novalidate
        @submit.prevent.stop="onSubmit"
      >
        <slot name="default" />

        <slot name="server-error" v-bind="{ errorFeedback }">
          <BAlert
            :modelValue="!!errorFeedback"
            variant="danger"
            class="my-3"
            icon="ban"
          >
            <div v-html="errorFeedback" />
          </BAlert>
        </slot>
      </BForm>
    </BCardBody>

    <BCardFooter v-if="!noFooter">
      <slot name="footer">
        <BButton type="submit" variant="success" :form="id">
          {{ submitText || $t('save') }}
        </BButton>
      </slot>
    </BCardFooter>
  </div>
</template>

<style lang="scss" scoped>
.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  & > *:not(:first-child) {
    margin-left: 0.5rem;
  }
}
</style>
