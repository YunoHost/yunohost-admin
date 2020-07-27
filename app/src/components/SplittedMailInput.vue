<template>
  <b-input-group>
    <b-input
      :id="id" :placeholder="$t(placeholder)" :aria-describedby="feedback"
      v-model="mail" @input="updateValue" :state="state"
    />

    <b-input-group-append>
      <b-input-group-text>@</b-input-group-text>
    </b-input-group-append>

    <b-input-group-append>
      <b-select v-model="domain" :options="domains" @change="updateValue" />
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  name: 'SplittedMailInput',
  props: {
    value: { type: String, required: true },
    domains: { type: null, required: true },
    placeholder: { type: String, default: 'placeholder.username' },
    id: { type: String, default: null },
    state: { type: null, default: null },
    feedback: { type: String, default: null }
  },
  data () {
    return {
      mail: this.value.split('@')[0],
      domain: this.value.split('@')[1]
    }
  },
  watch: {
    domains () {
      if (this.domain === undefined) {
        this.domain = this.domains[0]
      }
    }
  },
  methods: {
    updateValue () {
      this.$emit('input', `${this.mail}@${this.domain}`)
    }
  }
}
</script>
