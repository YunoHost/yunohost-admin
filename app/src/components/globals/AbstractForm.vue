<template>
  <div>
    <BCardBody>
      <slot name="disclaimer" />

      <BForm
        :id="id"
        :inline="inline"
        :class="formClasses"
        @submit.prevent="onSubmit"
        novalidate
      >
        <slot name="default" />

        <slot name="server-error" v-bind="{ errorFeedback }">
          <BAlert v-if="errorFeedback" variant="danger" class="my-3" icon="ban">
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

<script>
export default {
  name: 'AbstractForm',

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
        return this.$i18n.t('form_errors.invalid_form')
      } else return ''
    },
  },

  methods: {
    onSubmit(e) {
      const v = this.validation
      if (v) {
        v.$touch()
        if (v.$pending || v.$errors.length) return
      }
      this.$emit('submit', e)
    },
  },
}
</script>

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
