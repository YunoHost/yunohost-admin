<template>
  <basic-form :header="$t('tools_webadmin_settings')" @submit.prevent="onSubmit" no-footer>
    <!-- LOCALE -->
    <b-form-group
      label-cols="0" label-cols-lg="2" label-class="font-weight-bold"
      :label="$t('tools_webadmin.locale')" label-for="locale"
    >
      <b-select
        id="locale"
        :options="availableLocales"
        v-model="currentLocale"
      />
    </b-form-group>
    <hr>

    <!-- FALLBACK LOCALE -->
    <b-form-group
      label-cols="0" label-cols-lg="2" label-class="font-weight-bold"
      :label="$t('tools_webadmin.fallback_locale')" label-for="fallback-locale"
    >
      <b-select
        id="fallback-locale"
        :options="availableLocales"
        v-model="currentFallbackLocale"
      />
    </b-form-group>
    <hr>

    <!-- CACHE -->
    <b-form-group
      label-cols="0" label-cols-lg="2"
      :label="$t('tools_webadmin.cache')" label-for="cache" label-class="font-weight-bold"
    >
      <b-checkbox v-model="currentCache" id="cache" switch>
        {{ $t(currentCache ? 'enabled' : 'disabled') }}
      </b-checkbox>

      <template v-slot:description>
        {{ $t('tools_webadmin.cache_description') }}
      </template>
    </b-form-group>

    <hr>

    <!-- EXPERIMENTAL MODE -->
    <b-form-group
      label-cols="0" label-cols-lg="2" label-class="font-weight-bold"
      label-for="experimental"
    >
      <template v-slot:label>
        {{ $t('tools_webadmin.experimental') }}
        <icon iname="flask" />
      </template>

      <b-checkbox v-model="currentExperimental" id="experimental" switch>
        {{ $t(currentExperimental ? 'enabled' : 'disabled') }}
      </b-checkbox>

      <template v-slot:description>
        <span v-html="$t('tools_webadmin.experimental_description')" />
      </template>
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
      'experimental',
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
    },

    currentExperimental: {
      get: function () { return this.experimental },
      set: function (newValue) {
        this.$store.commit('SET_EXPERIMENTAL', newValue)
      }
    }
  },

  components: {
    BasicForm
  }
}
</script>
