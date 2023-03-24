<template>
  <b-input-group v-bind="$attrs">
    <input-item
      :id="id"
      :value="value.localPart"
      :placeholder="placeholder"
      :state="state"
      :aria-describedby="id + 'local-part-desc'"
      @input="onInput('localPart', $event)"
      @blur="$parent.$emit('touch')"
    />

    <b-input-group-append>
      <b-input-group-text>{{ value.separator }}</b-input-group-text>
    </b-input-group-append>

    <b-input-group-append>
      <select-item
        :value="value.domain"
        :choices="choices"
        :aria-describedby="id + 'domain-desc'"
        @input="onInput('domain', $event)"
        @blur="$parent.$emit('touch')"
      />
    </b-input-group-append>

    <span class="sr-only" :id="id + 'local-part-desc'" v-t="'address.local_part_description.' + type" />
    <span class="sr-only" :id="id + 'domain-desc'" v-t="'address.domain_description.' + type" />
  </b-input-group>
</template>

<script>
export default {
  name: 'AdressInputSelect',

  inheritAttrs: false,

  props: {
    // `value` is actually passed thru the `v-model` directive
    value: { type: Object, required: true },
    choices: { type: Array, required: true },
    placeholder: { type: String, default: null },
    id: { type: String, default: null },
    state: { type: null, default: null },
    type: { type: String, default: 'email' }
  },

  methods: {
    onInput (key, value) {
      this.$emit('input', {
        ...this.value,
        [key]: value
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.input-group-append ~ .input-group-append {
  flex-basis: 40%;
}
select {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
