<template>
  <card-form :title="$t('tools_webadmin_settings')" icon="cog" no-footer>
    <template v-for="(field, fname) in fields">
      <form-field v-bind="field" v-model="self[fname]" :key="fname" />
      <hr :key="fname + 'hr'">
    </template>
  </card-form>
</template>

<script>
// FIXME move into helpers ?
// Dynamicly generate computed properties from store with get/set and automatic commit/dispatch
function mapStoreGetSet (props = [], action = 'commit') {
  return props.reduce((obj, prop) => {
    obj[prop] = {
      get () {
        return this.$store.getters[prop]
      },
      set (value) {
        const key = (action === 'commit' ? 'SET_' : 'UPDATE_') + prop.toUpperCase()
        this.$store[action](key, value)
      }
    }
    return obj
  }, {})
}

export default {
  name: 'ToolWebadmin',

  data () {
    return {
      // Hacky way to be able to dynamicly point to a computed property `self['computedProp']`
      self: this,

      fields: {
        locale: {
          label: this.$i18n.t('tools_webadmin.language'),
          component: 'SelectItem',
          props: { id: 'locale', choices: [] }
        },

        fallbackLocale: {
          label: this.$i18n.t('tools_webadmin.fallback_language'),
          description: this.$i18n.t('tools_webadmin.fallback_language_description'),
          component: 'SelectItem',
          props: { id: 'fallback-locale', choices: [] }
        },

        cache: {
          id: 'cache',
          label: this.$i18n.t('tools_webadmin.cache'),
          description: this.$i18n.t('tools_webadmin.cache_description'),
          component: 'CheckboxItem',
          props: { labels: { true: 'enabled', false: 'disabled' } }
        },

        transitions: {
          id: 'transitions',
          label: this.$i18n.t('tools_webadmin.transitions'),
          component: 'CheckboxItem',
          props: { labels: { true: 'enabled', false: 'disabled' } }
        }

        // experimental: added in `created()`
      }
    }
  },

  computed: {
    // Those are set/get computed properties
    ...mapStoreGetSet(['locale', 'fallbackLocale'], 'dispatch'),
    ...mapStoreGetSet(['cache', 'transitions', 'experimental'])
  },

  created () {
    const availableLocales = this.$store.getters.availableLocales
    this.fields.locale.props.choices = availableLocales
    this.fields.fallbackLocale.props.choices = availableLocales
    if (process.env.NODE_ENV === 'development') {
      this.fields.experimental = {
        id: 'experimental',
        label: this.$i18n.t('tools_webadmin.experimental'),
        description: this.$i18n.t('tools_webadmin.experimental_description'),
        component: 'CheckboxItem',
        props: { labels: { true: 'enabled', false: 'disabled' } }
      }
    }
  }
}
</script>
