<template lang="html">
  <div class="selectize-zone">
    <div id="selected-items" v-if="selected.length > 0">
      <b-button-group size="sm" v-for="item in filteredSelected" :key="item">
        <b-button :variant="itemVariant" :to="itemRoute ? {name: itemRoute, params: {name: item}} : null" class="item-btn">
          <icon :iname="itemIcon" /> {{ item | filter(format) }}
        </b-button>
        <b-button
          v-if="!removable || removable(item)"
          class="remove-btn" variant="warning"
          @click="onRemove(item)"
        >
          <icon :title="$t('delete')" iname="minus" />
        </b-button>
      </b-button-group>
    </div>

    <base-selectize
      v-if="choices.length"
      :choices="choices"
      :format="format"
      :label="label"
      @selected="$emit('change', { ...$event, action: 'add' })"
    />
  </div>
</template>

<script>
import BaseSelectize from '@/components/BaseSelectize'

export default {
  name: 'ZoneSelectize',

  props: {
    itemIcon: { type: String, default: null },
    itemRoute: { type: String, default: null },
    itemVariant: { type: String, default: 'secondary' },
    selected: { type: Array, required: true },
    // needed by SelectizeBase
    choices: { type: Array, required: true },
    label: { type: String, default: null },
    format: { type: Function, default: null },
    removable: { type: Function, default: null }
  },

  data: () => ({
    visible: false,
    search: '',
    focusedIndex: 0
  }),

  computed: {
    filteredSelected () {
      return [...this.selected].sort()
    }
  },

  methods: {
    onRemove (item) {
      this.$emit('change', { item, index: this.selected.indexOf(item), action: 'remove' })
    }
  },

  filters: {
    filter: function (text, func) {
      if (func) return func(text)
      else return text
    }
  },

  components: {
    BaseSelectize
  }
}
</script>

<style lang="scss" scoped>
#selected-items {
  margin-bottom: .75rem;
  display: flex;
  flex-wrap: wrap;

  .btn-group {
    margin-right: .5rem;
    margin-bottom: .5rem;

    .item-btn {
      .icon {
        margin-right: .25rem;
      }
    }
  }
}

.fa-minus {
  position: relative;
  top: 1px;
}
</style>
