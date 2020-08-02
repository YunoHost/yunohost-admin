<template lang="html">
  <div class="group-create">
    <b-card :header="$t('group_new')" header-tag="h2">
      <b-form id="group-create" @submit.prevent="onSubmit">
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
      </b-form>

      <template v-slot:footer>
        <div class="d-flex d-flex justify-content-end">
          <b-button type="submit" form="group-create" variant="success">
            {{ $t('save') }}
          </b-button>
        </div>
      </template>
    </b-card>
  </div>
</template>

<script>
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
  }
}
</script>

<style lang="scss" scoped>
</style>
