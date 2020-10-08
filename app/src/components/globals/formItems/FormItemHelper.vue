<template>
  <b-form-group
    label-cols="0" label-class="font-weight-bold" class="mb-4"
    :label="label" :label-for="'form-item-' + props.id"
  >
    <slot name="default">
      <component :is="component" v-bind="props" v-model="props.value" />
    </slot>

    <template v-if="description || example || link" v-slot:description>
      <div class="d-flex">
        <span v-if="example">{{ $t('form_input_example', { example }) }}</span>

        <b-link v-if="link" :to="link" class="ml-auto">
          {{ link.text }}
        </b-link>
      </div>

      <span v-if="description" v-html="description" />
    </template>

    <b-form-invalid-feedback v-if="'isValid' in props" :id="props.id + '-feedback'" :state="props.value.isValid">
      {{ props.error }}
    </b-form-invalid-feedback>
  </b-form-group>
</template>

<script>
export default {
  name: 'FormItemHelper',

  props: {
    component: { type: String, default: 'InputItem' },
    props: { type: Object, required: true },
    label: { type: String, required: true },
    description: { type: String, default: null },
    example: { type: String, default: null },
    link: { type: Object, default: null }
  },

  data () {
    return {
      content: this.value
    }
  }
}
</script>
