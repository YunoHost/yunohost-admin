<template>
  <YCard v-bind="$attrs" class="card-form">
    <template #default>
      <slot name="disclaimer" />

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
            :show="errorFeedback !== ''"
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

<script>
export default {
  name: 'CardForm',

  props: {
    id: { type: String, default: 'ynh-form' },
    submitText: { type: String, default: null },
    validation: { type: Object, default: null },
    serverError: { type: String, default: '' },
    inline: { type: Boolean, default: false },
    formClasses: { type: [Array, String, Object], default: null },
    noFooter: { type: Boolean, default: false },
  },

  computed: {
    errorFeedback() {
      if (this.serverError) return this.serverError
      else if (this.validation && this.validation.$errors.length) {
        return this.$t('form_errors.invalid_form')
      } else return ''
    },
  },

  methods: {
    onSubmit(e) {
      const v = this.validation
      if (v) {
        v.$touch()
        if (v.$pending || v.$invalid) return
      }
      this.$emit('submit', e)
    },
  },
}
</script>

<style lang="scss"></style>
