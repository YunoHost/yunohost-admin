<template>
  <!-- v-bind="$attrs" allow to pass default attrs not specified in this component slots  -->
  <b-form-group
    v-bind="attrs"
    :id="id || props.id + '_group'"
    :label-for="props.id"
    :state="state"
    :invalid-feedback="errorMessage"
    @touch="touch"
    class="mb-4"
  >
    <!-- Make field props and state available as scoped slot data -->
    <slot v-bind="{ self: { ...props, state }, touch }">
      <!-- if no component was passed as slot, render a component from the props -->
      <component
        :is="component"
        v-bind="props"
        v-on="$listeners"
        :value="value"
        :state="state"
        :required="validation ? 'required' in validation : false"
      />
    </slot>

    <!-- {{ validation }} -->

    <template v-if="description || example || link" v-slot:description>
      <div class="d-flex">
        <span v-if="example">{{ $t('form_input_example', { example }) }}</span>

        <b-link v-if="link" :to="link" class="ml-auto">
          {{ link.text }}
        </b-link>
      </div>

      <span v-if="description" v-html="description" />
    </template>
  </b-form-group>
</template>

<script>
export default {
  name: 'FormField',

  inheritAttrs: false,

  props: {
    // Component props (other <form-group> related attrs are passed thanks to $attrs)
    id: { type: String, default: null },
    description: { type: String, default: null },
    example: { type: String, default: null },
    link: { type: Object, default: null },
    // rendered field component props
    component: { type: String, default: 'InputItem' },
    value: { type: null, default: null },
    props: { type: Object, default: () => ({}) },
    validation: { type: Object, default: null }
  },

  computed: {
    attrs () {
      const attrs = { ...this.$attrs }
      const defaultAttrs = {
        'label-cols-md': 4,
        'label-cols-lg': 2,
        'label-class': 'font-weight-bold'
      }

      for (const attr in defaultAttrs) {
        if (!(attr in attrs)) attrs[attr] = defaultAttrs[attr]
      }

      return attrs
    },

    state () {
      // Need to set state as null if no error, else component turn green
      if (this.validation) {
        return this.validation.$anyError === true ? false : null
      }
      return null
    },

    errorMessage () {
      const validation = this.validation
      if (validation && validation.$anyError) {
        const [type, errData] = this.findError(validation.$params, validation)
        return this.$i18n.t('form_errors.' + type, errData)
      }
      return ''
    }
  },

  methods: {
    touch (name) {
      if (this.validation) {
        // For fields that have multiple elements
        if (name) {
          this.validation[name].$touch()
        } else {
          this.validation.$touch()
        }
      }
    },

    findError (params, obj, parent = obj) {
      for (const key in params) {
        if (!obj[key]) {
          return [key, obj.$params[key]]
        }
        if (obj[key].$anyError) {
          return this.findError(obj[key].$params, obj[key], parent)
        }
      }
    }
  }
}
</script>
