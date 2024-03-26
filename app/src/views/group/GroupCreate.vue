<template>
  <CardForm
    :title="$t('group_new')"
    icon="users"
    :validation="v$"
    :server-error="serverError"
    @submit.prevent="onSubmit"
  >
    <!-- GROUP NAME -->
    <FormField
      v-bind="groupname"
      v-model="form.groupname"
      :validation="v$.form.groupname"
    />
  </CardForm>
</template>

<script>
import { useVuelidate } from '@vuelidate/core'

import api from '@/api'
import { required, alphalownumdot_ } from '@/helpers/validators'

export default {
  compatConfig: { MODE: 3 },
  name: 'GroupCreate',

  setup() {
    return {
      v$: useVuelidate(),
    }
  },

  data() {
    return {
      form: {
        groupname: '',
      },
      serverError: '',
      groupname: {
        label: this.$i18n.t('group_name'),
        description: this.$i18n.t('group_format_name_help'),
        props: {
          id: 'groupname',
          placeholder: this.$i18n.t('placeholder.groupname'),
        },
      },
    }
  },

  validations: {
    form: {
      groupname: { required, alphalownumdot_ },
    },
  },

  methods: {
    onSubmit() {
      api
        .post({ uri: 'users/groups', storeKey: 'groups' }, this.form, {
          key: 'groups.create',
          name: this.form.groupname,
        })
        .then(() => {
          this.$router.push({ name: 'group-list' })
        })
        .catch((err) => {
          if (err.name !== 'APIBadRequestError') throw err
          this.serverError = err.message
        })
    },
  },
}
</script>
