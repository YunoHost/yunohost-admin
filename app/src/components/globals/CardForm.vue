<template>
  <card v-bind="$attrs" class="card-form">
    <template #default>
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
    </template>

    <slot v-if="!noFooter" name="buttons" slot="buttons">
      <b-button
        type="submit" variant="success"
        :form="id" :disabled="disabled"
      >
        {{ submitText ? submitText : $t('save') }}
      </b-button>
    </slot>
  </card>
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
    noFooter: { type: Boolean, default: false }
  },

  computed: {
    disabled () {
      return this.validation ? this.validation.$invalid : false
    },
    errorFeedback () {
      if (this.serverError) return this.serverError
      else if (this.validation && this.validation.$invalid) {
        return this.$t('invalid_form')
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

<style lang="scss">
</style>
