<template lang="html">
  <basic-form :header="$t('group_new')" @submit.prevent="onSubmit">
    <!-- GROUP NAME -->
    <b-form-group
      label-cols="auto"
      :label="$t('group_name')" label-for="input-groupname"
      :description="$t('group_format_name_help')"
    >
      <b-input
        id="input-groupname" :placeholder="$t('placeholder.groupname')"
        aria-describedby="groupname-feedback" required
        v-model="form.groupname" :state="isValid.groupname"
        @input="validateGroupname"
      />
      <b-form-invalid-feedback id="groupname-feedback" :state="isValid.groupname">
        {{ this.error.groupname }}
      </b-form-invalid-feedback>
    </b-form-group>
  </basic-form>
</template>

<script>
import BasicForm from '@/components/BasicForm'

export default {
  name: 'GroupCreate',

  data () {
    return {
      form: {
        groupname: ''
      },
      isValid: {
        groupname: null
      },
      error: {
        groupname: ''
      }
    }
  },

  methods: {
    onSubmit () {
      for (const key in this.isValid) {
        if (this.isValid[key] === false) return
      }
      const data = { groupname: this.form.groupname.replaceAll(' ', '_').toLowerCase() }

      this.$store.dispatch(
        'POST', { uri: 'users/groups', data, storeKey: 'groups' }
      ).then(() => {
        this.$router.push({ name: 'group-list' })
      }).catch(error => {
        this.error.groupname = error.message
        this.isValid.groupname = false
      })
    },

    validateGroupname () {
      const groupname = this.form.groupname
      let error = ''
      if (!groupname.match('^[A-Za-z0-9_ ]+$')) {
        error = this.$i18n.t('form_errors.groupname_syntax')
      }
      this.error.groupname = error
      this.isValid.groupname = error === '' ? null : false
    }
  },

  components: {
    BasicForm
  }
}
</script>

<style lang="scss" scoped>
</style>
