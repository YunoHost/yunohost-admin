<template>
  <abstract-form
    v-bind="{ id: panel.id + '-form', validation, serverError: panel.serverError }"
    @submit.prevent.stop="$emit('submit', panel.id)"
  >
    <slot name="tab-top" />

    <template v-if="panel.help" #disclaimer>
      <div class="alert alert-info" v-html="help" />
    </template>

    <slot name="tab-before" />

    <template v-for="section in panel.sections">
      <component
        v-if="section.visible" :is="section.name ? 'section' : 'div'"
        :key="section.id" class="mb-5"
      >
        <b-card-title v-if="section.name" title-tag="h3">
          {{ section.name }} <small v-if="section.help">{{ section.help }}</small>
        </b-card-title>

        <template v-for="(field, fname) in section.fields">
          <component
            v-if="field.visible" :is="field.is" v-bind="field.props"
            v-model="forms[panel.id][fname]" :validation="validation[fname]" :key="fname"
            @action.stop="onAction(section.id, fname, field.props.args)"
          />
        </template>
      </component>
    </template>

    <slot name="tab-after" />
  </abstract-form>
</template>

<script>


export default {
  name: 'ConfigPanel',

  props: {
    tabId: { type: String, required: true },
    panels: { type: Array, default: undefined },
    forms: { type: Object, default: undefined },
    v: { type: Object, default: undefined }
  },

  computed: {
    panel () {
      return this.panels.find(panel => panel.id === this.tabId)
    },

    validation () {
      return this.v.forms[this.panel.id]
    }
  },

  methods: {
  }
}
</script>

<style lang="scss" scoped>
.card-title {
  margin-bottom: 1em;
  border-bottom: solid 1px #aaa;
}
</style>
