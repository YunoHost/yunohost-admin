<template>
  <basic-form :header="$t('tools_webadmin_settings')" @submit.prevent="onSubmit" no-footer>
    <!-- LOCALE -->
    <b-form-group label-cols="auto" :label="$t('tools_webadmin.locale')" label-for="locale">
      <b-select
        id="locale"
        :options="availableLocales"
        v-model="currentLocale"
      />
    </b-form-group>
    <hr>

    <!-- FALLBACK LOCALE -->
    <b-form-group label-cols="auto" :label="$t('tools_webadmin.fallback_locale')" label-for="fallback-locale">
      <b-select
        id="fallback-locale"
        :options="availableLocales"
        v-model="currentFallbackLocale"
      />
    </b-form-group>
    <hr>

    <!-- CACHE -->
    <b-form-group label-cols="auto" :label="$t('tools_webadmin.cache')" label-for="cache">
      <template v-slot:description>
        <b-alert variant="info" show v-t="'tools_webadmin.cache_description'" />
      </template>

      <b-checkbox
        v-model="currentCache"
        switch
      >
        {{ $t(currentCache ? 'enabled' : 'disabled') }}
      </b-checkbox>
    </b-form-group>
  </basic-form>
</template>

<script>
import { mapGetters } from 'vuex'
import BasicForm from '@/components/BasicForm'

export default {
  name: 'ToolWebadmin',

  computed: {
    ...mapGetters([
      'locale',
      'fallbackLocale',
      'cache',
      'availableLocales'
    ]),

    currentLocale: {
      get: function () { return this.locale },
      set: function (newValue) {
        this.$store.dispatch('UPDATE_LOCALE', newValue)
      }
    },

    currentFallbackLocale: {
      get: function () { return this.fallbackLocale },
      set: function (newValue) {
        this.$store.dispatch('UPDATE_FALLBACK_LOCALE', newValue)
      }
    },

    currentCache: {
      get: function () { return this.cache },
      set: function (newValue) {
        this.$store.commit('SET_CACHE', newValue)
      }
    }
  },

  components: {
    BasicForm
  }
}
</script>
