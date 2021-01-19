<template>
  <!-- v-bind="$attrs" allow to pass default attrs not specified in this component slots -->
  <b-form-group
    v-bind="attrs"
    :id="_id"
    :label-for="$attrs['label-for'] || props.id"
    :state="state"
    @touch="touch"
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

    <template #invalid-feedback>
      <span v-html="errorMessage" />
    </template>

    <template #description>
      <!-- Render description -->
      <template v-if="description || example || link">
        <div class="d-flex">
          <span v-if="example">{{ $t('form_input_example', { example }) }}</span>

          <b-link v-if="link" :to="link" class="ml-auto">
            {{ link.text }}
          </b-link>
        </div>

        <div
          v-if="description" v-html="description"
          :class="{ ['alert p-1 px-2 alert-' + descriptionVariant]: descriptionVariant }"
        />
      </template>
      <!-- Slot available to overwrite the one above -->
      <slot name="description" />
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
    descriptionVariant: { type: String, default: null },
    example: { type: String, default: null },
    link: { type: Object, default: null },
    // Rendered field component props
    component: { type: String, default: 'InputItem' },
    value: { type: null, default: null },
    props: { type: Object, default: () => ({}) },
    validation: { type: Object, default: null }
  },

  computed: {
    _id () {
      if (this.id) return this.id
      const childId = this.props.id || this.$attrs['label-for']
      return childId ? childId + '_group' : null
    },

    attrs () {
      const attrs = { ...this.$attrs }
      if ('label' in attrs) {
        const defaultAttrs = {
          'label-cols-md': 4,
          'label-cols-lg': 2,
          'label-class': 'font-weight-bold'
        }
        if (!('label-cols' in attrs)) {
          for (const attr in defaultAttrs) {
            if (!(attr in attrs)) attrs[attr] = defaultAttrs[attr]
          }
        } else if (!('label-class' in attrs)) {
          attrs['label-class'] = defaultAttrs['label-class']
        }
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

<style lang="scss" scoped>
::v-deep .invalid-feedback code {
  background-color: $gray-200;
}
</style>
