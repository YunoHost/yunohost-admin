<template>
  <card-form
    :title="$t('group_new')" icon="users"
    :validation="$v" :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <!-- GROUP NAME -->
    <form-field v-bind="groupname" v-model="form.groupname" :validation="$v.form.groupname" />
  </card-form>
</template>

<script>
import { validationMixin } from 'vuelidate'

import { required, alphalownum_ } from '@/helpers/validators'

export default {
  name: 'GroupCreate',

  data () {
    return {
      form: {
        groupname: ''
      },
      serverError: '',
      groupname: {
        label: this.$i18n.t('group_name'),
        description: this.$i18n.t('group_format_name_help'),
        props: {
          id: 'groupname',
          placeholder: this.$i18n.t('placeholder.groupname')
        }
      }
    }
  },

  validations: {
    form: {
      groupname: { required, alphalownum_ }
    }
  },

  methods: {
    onSubmit () {
      this.$store.dispatch(
        'POST', { uri: 'users/groups', data: this.form, storeKey: 'groups' }
      ).then(() => {
        this.$router.push({ name: 'group-list' })
      }).catch(error => {
        this.error.groupname = error.message
        this.isValid.groupname = false
      })
    }
  },

  mixins: [validationMixin]
}
</script>
