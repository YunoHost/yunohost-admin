<template lang="html">
  <div class="user-create">
    <breadcrumb />

    <b-card :header="$t('users_new')" header-tag="h2">
      <b-form id="user-create" @submit="onSubmit">
        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('user_username')" label-for="input-username" label-class="test"
        >
          <b-input id="input-username" :placeholder="$t('placeholder.username')"
                   v-model="form.username" required
          />
        </b-form-group>

        <b-form-group label-cols-sm="5" label-cols-lg="4" label-cols-xl="3">
          <template v-slot:label aria-hidden="true">
            {{ $t('user_fullname') }}
          </template>

          <div class="input-double" id="group-fullname">
            <b-input-group>
              <b-input-group-prepend
                tag="label" class="ssr-only" is-text
                for="input-firstname"
              >
                {{ $t('common.firstname') }}
              </b-input-group-prepend>

              <b-input
                id="input-firstname" :placeholder="$t('placeholder.firstname')"
                v-model="form.firstname" required
              />
            </b-input-group>

            <b-input-group>
              <b-input-group-prepend
                tag="label" class="ssr-only" is-text
                for="input-lastname"
              >
                {{ $t('common.lastname') }}
              </b-input-group-prepend>

              <b-input
                id="input-firstname" :placeholder="$t('placeholder.lastname')"
                v-model="form.lastname" required
              />
            </b-input-group>
          </div>
        </b-form-group>

        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('user_email')" label-for="input-mail"
        >
          <b-input-group>
            <b-input
              id="input-mail" :placeholder="$t('placeholder.username')"
              v-model="form.email" required
            />

            <b-input-group-append>
              <b-input-group-text>@</b-input-group-text>
            </b-input-group-append>

            <b-input-group-append>
              <b-select v-model="form.domain" :options="domains" required />
            </b-input-group-append>
          </b-input-group>
        </b-form-group>

        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('user_mailbox_quota')" label-for="input-mailbox-quota"
          :description="$t('mailbox_quota_description')"
        >
          <b-input-group append="M">
            <b-input
              id="input-mailbox-quota" :placeholder="$t('mailbox_quota_placeholder')"
              v-model="form.mailbox_quota" type="number" min="0"
            />
          </b-input-group>
        </b-form-group>

        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('password')" label-for="input-password"
        >
          <b-input
            id="input-password" placeholder="••••••••"
            v-model="form.password" type="password" required
          />
        </b-form-group>

        <b-form-group
          label-cols-sm="5" label-cols-lg="4" label-cols-xl="3"
          :label="$t('password_confirmation')" label-for="input-confirmation"
          :description="$t('good_practices_about_user_password')"
        >
          <b-input
            id="input-confirmation" placeholder="••••••••"
            v-model="form.confirmation" type="password" required
          />
        </b-form-group>
      </b-form>

      <template v-slot:footer>
        <div class="d-flex d-flex justify-content-end">
          <b-button type="submit" form="user-create" variant="success">
            {{ $t('save') }}
          </b-button>
        </div>
      </template>
    </b-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        domain: '',
        mailbox_quota: '',
        password: '',
        confirmation: ''
      }
    }
  },
  computed: {
    domains () {
      return this.$store.state.data.domains
    }
  },
  methods: {
    onSubmit (e) {
      console.log('submit', this.form)
      e.preventDefault()
      const data = this.form
      const quota = data.mailbox_quota
      data.mailbox_quota = parseInt(quota) ? quota + 'M' : 0
      data.mail = `${data.email}@${data.domain}`
      // TODO post data
    }
  },
  created () {
    this.$store.dispatch('FETCH', 'domains')
  }
}
</script>

<style lang="scss" scoped>
@include media-breakpoint-down(xs) {
   .form-group + .form-group {
     padding-top: .5rem;
     border-top: $thin-border;
   }
}

@include media-breakpoint-up(md) {
  .input-double {
    display: flex;
    .input-group + .input-group {
      margin-left: .5rem;
    }
  }
}

.input-group {
  select {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
