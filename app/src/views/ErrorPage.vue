<template>
  <div class="error mt-4 mb-5" v-if="error">
    <h2>{{ $t('api_errors_titles.' + error.name) }} :/</h2>

    <em v-t="'api_error.sorry'" />

    <div class="alert alert-info mt-4">
      <span v-html="$t('api_error.help')" />
      <br>{{ $t('api_error.info') }}
    </div>

    <h5 v-t="'error'" />
    <pre><code>"{{ error.code }}" {{ error.status }}</code></pre>

    <h5 v-t="'action'" />
    <pre><code>"{{ error.method }}" {{ error.uri }}</code></pre>

    <h5>Message</h5>
    <p v-html="error.message" />

    <template v-if="error.traceback">
      <h5 v-t="'traceback'" />
      <pre><code class="text-dark">{{ error.traceback }}</code></pre>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ErrorPage',

  computed: mapGetters(['error'])

  // FIXME add redirect if they're no error (if reload or route entered by hand)
}
</script>
