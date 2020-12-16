<template>
  <view-base :queries="queries" @queries-response="onQueriesResponse" skeleton="card-form-skeleton">
    <card-form
      :title="$t('users_new')" icon="user-plus"
      :validation="$v" :server-error="serverError"
      @submit.prevent="onSubmit"
    >
      <!-- USER NAME -->
      <form-field v-bind="fields.username" v-model="form.username" :validation="$v.form.username" />

      <!-- USER FULLNAME -->
      <form-field
        v-bind="fields.fullname" :validation="$v.form.fullname"
      >
        <template #default="{ self }">
          <b-input-group>
            <template v-for="fname in ['firstname', 'lastname']">
              <b-input-group-prepend :key="fname + 'prepend'">
                <b-input-group-text :id="fname + '-label'" tag="label">
                  {{ self[fname].label }}
                </b-input-group-text>
              </b-input-group-prepend>

              <input-item
                v-bind="self[fname]" v-model="form.fullname[fname]" :key="fname + 'input'"
                :name="self[fname].id" :aria-labelledby="fname + '-label'"
              />
            </template>
          </b-input-group>
        </template>
      </form-field>
      <hr>

      <!-- USER MAIL DOMAIN -->
      <form-field v-bind="fields.domain" :validation="$v.form.domain">
        <template #default="{ self }">
          <b-input-group>
            <b-input-group-append>
              <b-input-group-text id="local-part" tag="label" class="border-right-0">
                {{ form.username }}@
              </b-input-group-text>
            </b-input-group-append>

            <select-item
              aria-labelledby="local-part" aria-describedby="mail__BV_description_"
              v-model="form.domain" v-bind="self"
            />
          </b-input-group>
        </template>
      </form-field>
      <hr>

      <!-- USER PASSWORD -->
      <form-field v-bind="fields.password" v-model="form.password" :validation="$v.form.password" />

      <!-- USER PASSWORD CONFIRMATION -->
      <form-field v-bind="fields.confirmation" v-model="form.confirmation" :validation="$v.form.confirmation" />
    </card-form>
  </view-base>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'

import { formatFormData } from '@/helpers/yunohostArguments'
import {
  alphalownum_, unique, required, minLength, name, sameAs
} from '@/helpers/validators'

export default {
  name: 'UserCreate',

  data () {
    return {
      queries: [
        { uri: 'users' },
        { uri: 'domains' },
        { uri: 'domains/main', storeKey: 'main_domain' }
      ],

      form: {
        username: '',
        fullname: {
          firstname: '',
          lastname: ''
        },
        domain: '',
        password: '',
        confirmation: ''
      },

      serverError: '',

      fields: {
        username: {
          label: this.$i18n.t('user_username'),
          props: {
            id: 'username',
            placeholder: this.$i18n.t('placeholder.username')
          }
        },

        fullname: {
          label: this.$i18n.t('user_fullname'),
          id: 'fullname',
          props: {
            firstname: {
              id: 'firstname',
              label: this.$i18n.t('common.firstname'),
              placeholder: this.$i18n.t('placeholder.firstname')
            },
            lastname: {
              id: 'lastname',
              label: this.$i18n.t('common.lastname'),
              placeholder: this.$i18n.t('placeholder.lastname')
            }
          }
        },

        domain: {
          id: 'mail',
          label: this.$i18n.t('user_email'),
          description: this.$i18n.t('tip_about_user_email'),
          descriptionVariant: 'info',
          props: { choices: [] }
        },

        password: {
          label: this.$i18n.t('password'),
          description: this.$i18n.t('good_practices_about_user_password'),
          descriptionVariant: 'warning',
          props: {
            id: 'password',
            placeholder: '••••••••',
            type: 'password'
          }
        },

        confirmation: {
          label: this.$i18n.t('password_confirmation'),
          props: {
            id: 'confirmation',
            placeholder: '••••••••',
            type: 'password'
          }
        }
      }
    }
  },

  computed: mapGetters(['userNames', 'domainsAsChoices', 'mainDomain']),

  validations () {
    return {
      form: {
        username: { required, alphalownum_, notInUsers: unique(this.userNames) },
        fullname: {
          firstname: { required, name },
          lastname: { required, name }
        },
        domain: { required },
        password: { required, passwordLenght: minLength(8) },
        confirmation: { required, passwordMatch: sameAs('password') }
      }
    }
  },

  methods: {
    onQueriesResponse () {
      this.fields.domain.props.choices = this.domainsAsChoices
      this.form.domain = this.mainDomain
    },

    onSubmit () {
      const data = formatFormData(this.form, { flatten: true })
      this.$store.dispatch(
        'POST', { uri: 'users', data }
      ).then(() => {
        this.$router.push({ name: 'user-list' })
      }).catch(error => {
        this.serverError = error.message
      })
    }
  },

  mixins: [validationMixin]
}
</script>

<style lang="scss" scoped>
#lastname-label {
  border-left: 0;
}

.custom-select {
  flex-basis: 40%;
}
</style>
