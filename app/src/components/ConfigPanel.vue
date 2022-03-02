<template>
  <abstract-form
    v-bind="{ id: panel.id + '-form', validation, serverError: panel.serverError }"
    @submit.prevent.stop="onApply"
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
import { filterObject } from '@/helpers/commons'


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
    onApply () {
      const panelId = this.panel.id
      const nonActionKeys = this.panel.sections.filter(section => {
        return !section.isActionSection
      }).reduce((keys, { fields }) => {
        return keys.concat(Object.keys(fields))
      }, [])

      this.$emit('submit', {
        id: this.panel.id,
        form: filterObject(this.forms[panelId], ([key]) => nonActionKeys.includes(key))
      })
    },

    onAction (sectionId, actionId, actionArgs) {
      const panelId = this.panel.id

      this.$emit('submit', {
        id: panelId,
        form: filterObject(this.forms[panelId], ([key]) => actionArgs.includes(key)),
        action: [panelId, sectionId, actionId].join('.'),
        name: actionId
      })
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
