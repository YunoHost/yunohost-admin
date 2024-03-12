<template>
  <ViewBase
    :queries="queries"
    @queries-response="onQueriesResponse"
    skeleton="CardFormSkeleton"
  >
    <CardForm
      :title="$t('users_new')"
      icon="user-plus"
      :validation="v$"
      :server-error="serverError"
      @submit.prevent="onSubmit"
    >
      <!-- USER NAME -->
      <FormField
        v-bind="fields.username"
        v-model="form.username"
        :validation="v$.form.username"
      />

      <!-- USER FULLNAME -->
      <FormField
        v-bind="fields.fullname"
        :validation="v$.form.fullname"
        v-model="form.fullname"
      />
      <hr />

      <!-- USER MAIL DOMAIN -->
      <FormField v-bind="fields.domain" :validation="v$.form.domain">
        <template #default="{ self }">
          <BInputGroup>
            <BInputGroupAppend>
              <BInputGroupText
                id="local-part"
                tag="label"
                class="border-right-0"
              >
                {{ form.username }}@
              </BInputGroupText>
            </BInputGroupAppend>

            <SelectItem
              aria-labelledby="local-part"
              aria-describedby="mail__BV_description_"
              v-model="form.domain"
              v-bind="self"
            />
          </BInputGroup>
        </template>
      </FormField>
      <hr />

      <!-- USER PASSWORD -->
      <FormField
        v-bind="fields.password"
        v-model="form.password"
        :validation="v$.form.password"
      />

      <!-- USER PASSWORD CONFIRMATION -->
      <FormField
        v-bind="fields.confirmation"
        v-model="form.confirmation"
        :validation="v$.form.confirmation"
      />
    </CardForm>
  </ViewBase>
</template>

<script>
import api from '@/api'
import { mapGetters } from 'vuex'
import { useVuelidate } from '@vuelidate/core'

import { formatFormData } from '@/helpers/yunohostArguments'
import {
  alphalownumdot_,
  unique,
  required,
  minLength,
  name,
  sameAs,
} from '@/helpers/validators'

export default {
  name: 'UserCreate',

  setup() {
    return {
      v$: useVuelidate(),
    }
  },

  data() {
    return {
      queries: [
        ['GET', { uri: 'users' }],
        ['GET', { uri: 'domains' }],
      ],

      form: {
        username: '',
        fullname: '',
        domain: '',
        password: '',
        confirmation: '',
      },

      serverError: '',

      fields: {
        username: {
          label: this.$i18n.t('user_username'),
          props: {
            id: 'username',
            placeholder: this.$i18n.t('placeholder.username'),
          },
        },

        fullname: {
          label: this.$i18n.t('user_fullname'),
          props: {
            id: 'fullname',
            placeholder: this.$i18n.t('placeholder.fullname'),
          },
        },

        domain: {
          id: 'mail',
          label: this.$i18n.t('user_email'),
          description: this.$i18n.t('tip_about_user_email'),
          descriptionVariant: 'info',
          props: { choices: [] },
        },

        password: {
          label: this.$i18n.t('password'),
          description: this.$i18n.t('good_practices_about_user_password'),
          descriptionVariant: 'warning',
          props: {
            id: 'password',
            placeholder: '••••••••',
            type: 'password',
          },
        },

        confirmation: {
          label: this.$i18n.t('password_confirmation'),
          props: {
            id: 'confirmation',
            placeholder: '••••••••',
            type: 'password',
          },
        },
      },
    }
  },

  computed: mapGetters(['userNames', 'domainsAsChoices', 'mainDomain']),

  validations() {
    return {
      form: {
        username: {
          required,
          alphalownumdot_,
          notInUsers: unique(this.userNames),
        },
        fullname: { required, name },
        domain: { required },
        password: { required, passwordLenght: minLength(8) },
        confirmation: { required, passwordMatch: sameAs(this.form.password) },
      },
    }
  },

  methods: {
    onQueriesResponse() {
      this.fields.domain.props.choices = this.domainsAsChoices
      this.form.domain = this.mainDomain
    },

    async onSubmit() {
      const data = await formatFormData(this.form, { flatten: true })
      api
        .post({ uri: 'users' }, data, {
          key: 'users.create',
          name: this.form.username,
        })
        .then(() => {
          this.$router.push({ name: 'user-list' })
        })
        .catch((err) => {
          if (err.name !== 'APIBadRequestError') throw err
          this.serverError = err.message
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.custom-select {
  flex-basis: 40%;
}
</style>
