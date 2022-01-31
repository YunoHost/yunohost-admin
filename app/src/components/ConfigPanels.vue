<template>
  <b-card no-body>
    <b-tabs fill pills card>
      <slot name="before" />

      <tab-form
        v-for="{ name, id, sections, help, serverError } in panels" :key="id"
        v-bind="{ name, id: id + '-form', validation: $v.forms[id], serverError }"
        @submit.prevent.stop="$emit('submit', id)"
      >
        <template v-if="help" #disclaimer>
          <div class="alert alert-info" v-html="help" />
        </template>

        <slot :name="id + '-tab-before'" />

        <template v-for="section in sections">
          <div v-if="isVisible(section.visible, section)" :key="section.id" class="mb-5">
            <b-card-title v-if="section.name" title-tag="h3">
              {{ section.name }} <small v-if="section.help">{{ section.help }}</small>
            </b-card-title>

            <template v-for="(field, fname) in section.fields">
              <form-field
                v-if="isVisible(field.visible, field)" :key="fname"
                v-model="forms[id][fname]" v-bind="field" :validation="$v.forms[id][fname]"
              />
            </template>
          </div>
        </template>

        <slot :name="id + '-tab-after'" />
      </tab-form>

      <slot name="default" />
    </b-tabs>
  </b-card>
</template>

<script>
import { validationMixin } from 'vuelidate'

import { configPanelsFieldIsVisible } from '@/helpers/yunohostArguments'


export default {
  name: 'ConfigPanels',

  mixins: [validationMixin],

  props: {
    panels: { type: Array, default: undefined },
    forms: { type: Object, default: undefined },
    validations: { type: Object, default: undefined }
  },

  validations () {
    const v = this.validations
    return v ? { forms: v } : null
  },

  methods: {
    isVisible (expression, field) {
      return configPanelsFieldIsVisible(expression, field, this.forms)
    }
  }
}
</script>

<style lang="scss" scoped>
.card-title {
  margin-bottom: 1em;
  border-bottom: solid 1px #aaa;
}
</style>
