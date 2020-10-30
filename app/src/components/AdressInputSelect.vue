<template>
  <b-input-group v-bind="$attrs">
    <input-item
      :id="id" :placeholder="placeholder"
      :state="state" :aria-describedby="id + 'local-part-desc'"
      v-model="value.localPart"
      v-on="listeners"
    />

    <b-input-group-append>
      <b-input-group-text>{{ value.separator }}</b-input-group-text>
    </b-input-group-append>

    <b-input-group-append>
      <select-item
        v-model="value.domain"
        :choices="choices"
        :aria-describedby="id + 'domain-desc'"
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

  computed: {
    listeners: function () {
      return Object.assign({},
        // Forwards all parent events listeners
        this.$listeners,
        // Overwrite input behavior so this component can work with v-model
        {
          input: (event) => {
            this.$parent.$emit('touch')
            this.$emit('input', this.value)
          },

          blur: event => {
            this.$parent.$emit('touch')
            this.$emit('blur', this.value)
          }
        }
      )
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
