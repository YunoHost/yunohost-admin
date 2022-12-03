<template>
  <div>
    <b-card-body>
      <slot name="disclaimer" />

      <b-form
        :id="id" :inline="inline" :class="formClasses"
        @submit.prevent="onSubmit" novalidate
      >
        <slot name="default" />

        <slot name="server-error" v-bind="{ errorFeedback }">
          <b-alert
            v-if="errorFeedback"
            variant="danger" class="my-3" icon="ban"
          >
            <div v-html="errorFeedback" />
          </b-alert>
        </slot>
      </b-form>
    </b-card-body>

    <b-card-footer v-if="!noFooter">
      <slot name="footer">
        <b-button type="submit" variant="success" :form="id">
          {{ submitText || $t('save') }}
        </b-button>
      </slot>
    </b-card-footer>
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
    noFooter: { type: Boolean, default: false }
  },

  computed: {
    errorFeedback () {
      if (this.serverError) return this.serverError
      else if (this.validation && this.validation.$anyError) {
        return this.$i18n.t('form_errors.invalid_form')
      } else return ''
    }
  },

  methods: {
    onSubmit (e) {
      const v = this.validation
      if (v) {
        v.$touch()
        if (v.$pending || v.$invalid) return
      }
      this.$emit('submit', e)
    }
  }
}
</script>

<style lang="scss" scoped>
.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  & > *:not(:first-child) {
    margin-left: .5rem;
  }
}
</style>
