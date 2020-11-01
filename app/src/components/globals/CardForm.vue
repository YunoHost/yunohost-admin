<template>
  <b-card class="card-form">
    <template v-slot:header>
      <component :is="titleTag"><icon v-if="icon" :iname="icon" /> {{ title }}</component>
    </template>

    <slot name="disclaimer" />

    <b-form :id="id" @submit.prevent="onSubmit" novalidate>
      <slot name="default" />

      <slot name="server-error">
        <b-alert variant="danger" :show="serverError !== ''" v-html="serverError" />
      </slot>
    </b-form>

    <template v-if="!noFooter" v-slot:footer>
      <slot name="buttons">
        <b-button
          type="submit" variant="success"
          :form="id" :disabled="disabled"
        >
          {{ submitText ? submitText : $t('save') }}
        </b-button>
      </slot>
    </template>
  </b-card>
</template>

<script>

export default {
  name: 'CardForm',

  props: {
    id: { type: String, default: 'ynh-form' },
    title: { type: String, required: true },
    titleTag: { type: String, default: 'h2' },
    icon: { type: String, default: null },
    submitText: { type: String, default: null },
    noFooter: { type: Boolean, default: false },
    validation: { type: Object, default: null },
    serverError: { type: String, default: '' }
  },

  computed: {
    disabled () {
      return this.validation ? this.validation.$invalid : false
    }
  },

  methods: {
    onSubmit (e) {
      const v = this.validation
      if (v) {
        v.$touch()
        if (v.$pending || v.$invalid) return
      }
      this.$emit('submit', e)
    }
  }
}
</script>

<style lang="scss">
.card-form .card-footer {
  display: flex;
  justify-content: flex-end;

  & > *:not(:first-child) {
    margin-left: .5rem;
  }
}
</style>
