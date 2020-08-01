<template lang="html">
  <div class="selectize-zone">
    <div id="selected-items" v-if="selected.length > 0">
      <b-button-group size="sm" v-for="item in filteredSelected" :key="item">
        <b-button
          :variant="itemVariant" :to="itemRoute ? {name: itemRoute, params: {name: item}} : null"
          @blur="onItemButtonBlur" class="item-btn"
        >
          <icon :iname="itemIcon" /> {{ item | filter(format) }}
        </b-button>
        <b-button
          class="remove-btn" variant="warning"
          @click="onRemove(item)"
          @blur="onItemDeleteBlur"
        >
          <icon :title="$t('delete')" iname="minus" />
        </b-button>
      </b-button-group>
    </div>

    <base-selectize
      :choices="choices"
      :format="format"
      :aria-label="ariaLabel"
      :search-icon="searchIcon"
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
    searchIcon: { type: String, default: 'search' },
    ariaLabel: { type: String, required: true },
    format: { type: Function, default: null }
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
    },
    onItemButtonBlur ({ target, relatedTarget }) {
      if (target.nextElementSibling === relatedTarget) {
        relatedTarget.classList.add('display')
      }
    },

    onItemDeleteBlur ({ target }) {
      target.classList.remove('display')
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

    &:hover {
      .remove-btn  {
        display: inline-block;
      }

      .item-btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    .item-btn {
      border-top-right-radius: $border-radius;
      border-bottom-right-radius: $border-radius;

      &:focus, &:hover {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;

        & ~ .remove-btn {
          display: inline-block;
        }
      }

      .icon {
        margin-right: .25rem;
      }
    }

    .remove-btn {
      display: none;

      &.display {
        display: inline-block;
      }
    }
  }
}

.fa-minus {
  position: relative;
  top: 1px;
}
</style>
