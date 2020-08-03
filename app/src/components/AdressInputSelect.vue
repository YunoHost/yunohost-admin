<template>
  <b-input-group>
    <b-input
      :id="id" :placeholder="placeholder"
      :state="state" :aria-describedby="feedbackId"
      v-model="reactiveInput" @input="updateValue"
    />

    <b-input-group-append>
      <b-input-group-text>{{ separator }}</b-input-group-text>
    </b-input-group-append>

    <b-input-group-append>
      <b-select v-model="reactiveOption" :options="options" @change="updateValue" />
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  name: 'AdressInputSelect',

  props: {
    // `value` is actually passed as the `v-model` directive
    value: { type: String, required: true },
    options: { type: Array, required: true },
    separator: { type: String, default: '@' },
    placeholder: { type: String, default: null },
    id: { type: String, default: null },
    state: { type: null, default: null },
    feedbackId: { type: String, default: null },
    defaultOption: { type: Number, default: 0 }
  },

  data () {
    // static value that are updated by the computed setters.
    return {
      input: '',
      option: ''
    }
  },

  // Those 'reactive' properties allows two-way value binding. If input and option where
  // only static properties, it would be impossible to detect that `value` has changed
  // from outside this scope.
  computed: {
    reactiveInput: {
      get () {
        return this.value.split(this.separator)[0]
      },
      set (value) {
        // FIXME, ugly hack since the `reactiveOption` v-model isn't set when `value` change
        if (this.reactiveOption !== this.option) {
          this.option = this.reactiveOption
        }
        this.input = value
      }
    },
    reactiveOption: {
      get () {
        return this.value.split(this.separator)[1] || this.options[this.defaultOption]
      },
      set (value) {
        // FIXME, ugly hack since the `reactiveInput` v-model isn't set when `value` change
        if (this.reactiveInput !== this.input) {
          this.input = this.reactiveInput
        }
        this.option = value
      }
    }
  },

  methods: {
    // Emit an input event of the concatened data.
    // Since the consumer of this component will use the `v-model` directive, this event
    // will automaticly update the value of the given variable.
    updateValue () {
      this.$emit('input', this.input + this.separator + this.option)
    }
  }
}
</script>
