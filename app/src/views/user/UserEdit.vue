<template>
  <view-base :queries="queries" @queries-response="onQueriesResponse" skeleton="card-form-skeleton">
    <card-form
      :title="$t('user_username_edit', { name })" icon="user"
      :validation="$v" :server-error="serverError"
      @submit.prevent="onSubmit"
    >
      <!-- USERNAME (disabled) -->
      <form-field v-bind="fields.username" />

      <!-- USER FULLNAME -->
      <form-field v-bind="fields.fullname" v-model="form.fullname" :validation="$v.form.fullname" />

      <hr>

      <!-- USER EMAIL -->
      <form-field v-bind="fields.mail" :validation="$v.form.mail">
        <template #default="{ self }">
          <adress-input-select v-bind="self" v-model="form.mail" />
        </template>
      </form-field>

      <!-- MAILBOX QUOTA -->
      <form-field v-bind="fields.mailbox_quota" :validation="$v.form.mailbox_quota">
        <template #default="{ self }">
          <b-input-group append="M">
            <input-item v-bind="self" v-model="form.mailbox_quota" />
          </b-input-group>
        </template>
      </form-field>
      <hr>

      <!-- MAIL ALIASES -->
      <form-field :label="$t('user_emailaliases')" id="mail-aliases">
        <div
          v-for="(mail, i) in form.mail_aliases" :key="i"
          class="mail-list"
        >
          <form-field
            v-bind="fields.mail_aliases"
            :id="'mail_aliases' + i"
            :validation="$v.form.mail_aliases.$each[i]"
          >
            <template #default="{ self }">
              <adress-input-select v-bind="self" v-model="form.mail_aliases[i]" />
            </template>
          </form-field>

          <b-button variant="danger" @click="removeEmailField('aliases', i)">
            <icon :title="$t('delete')" iname="trash-o" />
            <span class="sr-only">{{ $t('delete') }}</span>
          </b-button>
        </div>

        <b-button variant="success" @click="addEmailField('aliases')">
          <icon iname="plus" /> {{ $t('user_emailaliases_add') }}
        </b-button>
      </form-field>

      <!-- MAIL FORWARD -->
      <form-field :label="$t('user_emailforward')" id="mail-forward">
        <div
          v-for="(mail, i) in form.mail_forward" :key="i"
          class="mail-list"
        >
          <form-field
            v-bind="fields.mail_forward" v-model="form.mail_forward[i]"
            :id="'mail-forward' + i"
            :validation="$v.form.mail_forward.$each[i]"
          />

          <b-button variant="danger" @click="removeEmailField('forward', i)">
            <icon :title="$t('delete')" iname="trash-o" />
            <span class="sr-only">{{ $t('delete') }}</span>
          </b-button>
        </div>

        <b-button variant="success" @click="addEmailField('forward')">
          <icon iname="plus" /> {{ $t('user_emailforward_add') }}
        </b-button>
      </form-field>
      <hr>

      <!-- USER PASSWORD -->
      <form-field v-bind="fields.change_password" v-model="form.change_password" :validation="$v.form.change_password" />

      <!-- USER PASSWORD CONFIRMATION -->
      <form-field v-bind="fields.confirmation" v-model="form.confirmation" :validation="$v.form.confirmation" />
    </card-form>
  </view-base>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate'

import api from '@/api'
import { arrayDiff } from '@/helpers/commons'
import { sizeToM, adressToFormValue, formatFormData } from '@/helpers/yunohostArguments'
import {
  name, required, minLength, emailLocalPart, sameAs, integer, minValue, emailForward
} from '@/helpers/validators'

import AdressInputSelect from '@/components/AdressInputSelect.vue'


export default {
  name: 'UserEdit',

  props: {
    name: { type: String, required: true }
  },

  data () {
    return {
      queries: [
        ['GET', { uri: 'users', param: this.name, storeKey: 'users_details' }],
        ['GET', { uri: 'domains' }]
      ],

      form: {
        fullname: '',
        mail: { localPart: '', separator: '@', domain: '' },
        mailbox_quota: '',
        mail_aliases: [],
        mail_forward: [],
        change_password: '',
        confirmation: ''
      },

      serverError: '',

      fields: {
        username: {
          label: this.$i18n.t('user_username'),
          value: this.name,
          props: { id: 'username', disabled: true }
        },

        fullname: {
          label: this.$i18n.t('user_fullname'),
          props: {
            id: 'fullname',
            placeholder: this.$i18n.t('placeholder.fullname')
          }
        },

        mail: {
          label: this.$i18n.t('user_email'),
          props: { id: 'mail', choices: [] }
        },

        mailbox_quota: {
          label: this.$i18n.t('user_mailbox_quota'),
          description: this.$i18n.t('mailbox_quota_description'),
          example: this.$i18n.t('mailbox_quota_example'),
          props: {
            id: 'mailbox-quota',
            placeholder: this.$i18n.t('mailbox_quota_placeholder')
          }
        },

        mail_aliases: {
          props: {
            placeholder: this.$i18n.t('placeholder.username'),
            choices: []
          }
        },

        mail_forward: {
          props: {
            placeholder: this.$i18n.t('user_new_forward'),
            type: 'email'
          }
        },

        change_password: {
          label: this.$i18n.t('password'),
          description: this.$i18n.t('good_practices_about_user_password'),
          descriptionVariant: 'warning',
          props: { id: 'change_password', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' }
        },

        confirmation: {
          label: this.$i18n.t('password_confirmation'),
          props: { id: 'confirmation', type: 'password', placeholder: '••••••••', autocomplete: 'new-password' }
        }
      }
    }
  },

  computed: mapGetters(['user', 'domainsAsChoices', 'mainDomain']),

  validations: {
    form: {
      fullname: { required, name },
      mail: {
        localPart: { required, email: emailLocalPart }
      },
      mailbox_quota: { integer, minValue: minValue(0) },
      mail_aliases: {
        $each: {
          localPart: { required, email: emailLocalPart }
        }
      },
      mail_forward: {
        $each: { required, emailForward }
      },
      change_password: { passwordLenght: minLength(8) },
      confirmation: { passwordMatch: sameAs('change_password') }
    }
  },

  methods: {
    onQueriesResponse (user) {
      this.fields.mail.props.choices = this.domainsAsChoices
      this.fields.mail_aliases.props.choices = this.domainsAsChoices

      this.form.fullname = user.fullname
      this.form.mail = adressToFormValue(user.mail)
      if (user['mail-aliases']) {
        this.form.mail_aliases = user['mail-aliases'].map(mail => adressToFormValue(mail))
      }
      if (user['mail-forward']) {
        this.form.mail_forward = user['mail-forward'].slice() // Copy value
      }
      // mailbox-quota could be 'No quota' or 'Pas de quota'...
      if (parseInt(user['mailbox-quota'].limit) > 0) {
        this.form.mailbox_quota = sizeToM(user['mailbox-quota'].limit)
      } else {
        this.form.mailbox_quota = ''
      }
    },

    async onSubmit () {
      const formData = await formatFormData(this.form, { flatten: true })
      const user = this.user(this.name)
      const data = {}
      if (!Object.prototype.hasOwnProperty.call(formData, 'mailbox_quota')) {
        formData.mailbox_quota = ''
      }

      for (const key of ['mail_aliases', 'mail_forward']) {
        const dashedKey = key.replace('_', '-')
        const newKey = key.replace('_', '').replace('es', '')
        const addDiff = arrayDiff(formData[key], user[dashedKey])
        const rmDiff = arrayDiff(user[dashedKey], formData[key])
        if (addDiff.length) data['add_' + newKey] = addDiff
        if (rmDiff.length) data['remove_' + newKey] = rmDiff
      }

      for (const key in formData) {
        if (key === 'mailbox_quota') {
          const quota = parseInt(formData[key]) > 0 ? formData[key] + 'M' : 'No quota'
          if (parseInt(quota) !== parseInt(user['mailbox-quota'].limit)) {
            data[key] = quota === 'No quota' ? '0' : quota
          }
        } else if (!key.includes('mail_') && formData[key] !== user[key]) {
          data[key] = formData[key]
        }
      }

      if (Object.keys(data).length === 0) {
        this.serverError = this.$i18n.t('error_modify_something')
        return
      }

      api.put(
        { uri: 'users', param: this.name, storeKey: 'users_details' },
        data,
        { key: 'users.update', name: this.name }
      ).then(() => {
        this.$router.push({ name: 'user-info', param: { name: this.name } })
      }).catch(err => {
        if (err.name !== 'APIBadRequestError') throw err
        this.serverError = err.message
      })
    },

    addEmailField (type) {
      this.form['mail_' + type].push(type === 'aliases'
        ? { localPart: '', separator: '@', domain: this.mainDomain }
        : ''
      )
      // Focus last input after rendering update
      this.$nextTick(() => {
        const inputs = this.$el.querySelectorAll(`#mail-${type} input`)
        inputs[inputs.length - 1].focus()
      })
    },

    removeEmailField (type, index) {
      this.form['mail_' + type].splice(index, 1)
    }
  },

  mixins: [validationMixin],
  components: { AdressInputSelect }
}
</script>

<style lang="scss" scoped>
.mail-list {
  display: flex;
  justify-items: stretch;

  .form-group {
    margin-bottom: .5rem;
    width: 100%;
  }

  .btn-danger {
    align-self: flex-start;
    margin-left: .5rem;
  }
}
</style>
