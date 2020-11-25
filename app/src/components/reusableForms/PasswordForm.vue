<template>
  <card-form
    :title="title" icon="key-modern" :submit-text="submitText"
    :validation="$v" :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <template #disclaimer>
      <b-alert variant="warning" show>
        {{ $t('good_practices_about_admin_password') }}
      </b-alert>
      <slot name="disclaimer" />
      <hr>
    </template>

    <slot name="extra-fields" v-bind="{ v: $v, fields, form }" />

    <!-- ADMIN PASSWORD -->
    <form-field v-bind="fields.password" v-model="form.password" :validation="$v.form.password" />

    <!-- ADMIN PASSWORD CONFIRMATION -->
    <form-field v-bind="fields.confirmation" v-model="form.confirmation" :validation="$v.form.confirmation" />
  </card-form>
</template>

<script>
import { validationMixin } from 'vuelidate'

import { required, minLength, sameAs } from '@/helpers/validators'


export default {
  name: 'PasswordForm',

  props: {
    title: { type: String, required: true },
    submitText: { type: String, default: null },
    serverError: { type: String, default: '' },
    extra: { type: Object, default: () => ({ form: {}, fields: {}, validations: {} }) }
  },

  data () {
    return {
      form: {
        password: '',
        confirmation: '',
        ...this.extra.form
      },

      fields: {
        password: {
          label: this.$i18n.t('password'),
          props: { id: 'password', type: 'password', placeholder: '••••••••' }
        },

        confirmation: {
          label: this.$i18n.t('password_confirmation'),
          props: { id: 'confirmation', type: 'password', placeholder: '••••••••' }
        },

        ...this.extra.fields
      }
    }
  },

  validations () {
    return {
      form: {
        password: { required, passwordLenght: minLength(8) },
        confirmation: { required, passwordMatch: sameAs('password') },
        ...this.extra.validations
      }
    }
  },

  methods: {
    onSubmit () {
      this.$emit('submit', this.form)
    }
  },

  mixins: [validationMixin]
}
</script>
