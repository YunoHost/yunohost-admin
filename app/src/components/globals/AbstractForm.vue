<template>
  <b-tab no-body>
    <template #title>
      <icon :iname="icon" /> {{ name }}
    </template>

    <b-card-body>
      <slot name="disclaimer" />


      <b-form
        :id="id" :inline="inline" :class="formClasses"
        @submit.prevent="onSubmit" novalidate
      >
        <slot name="default" />

        <slot name="server-error">
          <b-alert
            variant="danger" class="my-3" icon="ban"
            :show="errorFeedback !== ''" v-html="errorFeedback"
          />
        </slot>
      </b-form>
    </b-card-body>

    <b-card-footer>
      <b-button type="submit" variant="success" :form="id">
        {{ submitText ? submitText : $t('save') }}
      </b-button>
    </b-card-footer>
  </b-tab>
</template>

<script>

export default {
  name: 'TabForm',

  props: {
    id: { type: String, default: 'ynh-form' },
    submitText: { type: String, default: null },
    validation: { type: Object, default: null },
    serverError: { type: String, default: '' },
    inline: { type: Boolean, default: false },
    formClasses: { type: [Array, String, Object], default: null },
    name: { type: String, required: true },
    icon: { type: String, default: 'wrench' }
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
