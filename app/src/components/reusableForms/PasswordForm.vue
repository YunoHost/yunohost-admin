<template>
  <card-form
    :title="title" icon="key-modern" :submit-text="submitText"
    :validation="$v" :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <template #disclaimer>
      <p class="alert alert-warning">
        {{ $t('good_practices_about_admin_password') }}
      </p>
      <slot name="disclaimer" />
      <hr>
    </template>

    <slot name="extra" v-bind="{ v: $v, fields, form }">
      <form-field
        v-for="(value, key) in extra.fields" :key="key"
        v-bind="value" v-model="$v.form.$model[key]" :validation="$v.form[key]"
      />
    </slot>

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
