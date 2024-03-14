<template>
  <!-- v-bind="$attrs" allow to pass default attrs not specified in this component slots -->
  <BFormGroup
    v-bind="attrs"
    :id="_id"
    :label-for="$attrs['label-for'] || props.id"
    :state="state"
    @touch="touch"
  >
    <!-- Make field props and state available as scoped slot data -->
    <slot v-bind="{ self: { ...props, state }, touch }">
      <!-- if no component was passed as slot, render a component from the props -->
      <Component
        v-bind="props"
        :is="component"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :state="state"
        :required="validation ? 'required' in validation : false"
      />
    </slot>

    <template #invalid-feedback>
      <span v-html="errorMessage" />
    </template>

    <template #description>
      <!-- Render description -->
      <template v-if="description || link">
        <div class="d-flex">
          <BLink v-if="link" :to="link" :href="link.href" class="ms-auto">
            {{ link.text }}
          </BLink>
        </div>

        <VueShowdown
          v-if="description"
          :markdown="description"
          :class="{
            ['alert p-1 px-2 alert-' + descriptionVariant]: descriptionVariant,
          }"
        />
      </template>
      <!-- Slot available to overwrite the one above -->
      <slot name="description" />
    </template>
  </BFormGroup>
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
    link: { type: Object, default: null },
    // Rendered field component props
    component: { type: String, default: 'InputItem' },
    modelValue: { type: null, default: null },
    props: { type: Object, default: () => ({}) },
    validation: { type: Object, default: null },
    validationIndex: { type: Number, default: null },
  },

  computed: {
    _id() {
      if (this.id) return this.id
      const childId = this.props.id || this.$attrs['label-for']
      return childId ? childId + '_group' : null
    },

    attrs() {
      const attrs = { ...this.$attrs }
      if ('label' in attrs) {
        const defaultAttrs = {
          'label-cols-md': 4,
          'label-cols-lg': 3,
          'label-class': ['font-weight-bold', 'py-0'],
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

    error() {
      if (this.validation) {
        if (this.validationIndex !== null) {
          const errors =
            this.validation.$each.$response.$errors[this.validationIndex]
          const err = Object.values(errors).find((part) => {
            return part.length
          })
          return err?.length ? err[0] : null
        }
        return this.validation.$errors.length
          ? { ...this.validation.$errors[0], $model: this.validation.$model }
          : null
      }
      return null
    },

    state() {
      // Need to set state as null if no error, else component turn green
      return this.error ? false : null
    },

    errorMessage() {
      const err = this.error
      if (err) {
        if (err.$message) return err.$message
        return this.$t('form_errors.' + err.$validator, {
          value: err.$model,
          ...err.$params,
        })
      }
      return ''
    },
  },

  methods: {
    touch(name) {
      if (this.validation) {
        // For fields that have multiple elements
        if (name) {
          this.validation[name].$touch()
        } else {
          this.validation.$touch()
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
:deep(.invalid-feedback code) {
  background-color: $gray-200;
}
</style>
