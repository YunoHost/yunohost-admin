<template>
  <b-list-group :flush="flush" :style="{ '--depth': tree.depth }">
    <template v-for="(node, i) in tree.children">
      <b-list-group-item
        :key="node.id"
        class="list-group-item-action" :class="getClasses(node, i)"
        @click="$router.push(node.data.to)"
      >
        <slot name="default" v-bind="node" />

        <b-button
          v-if="node.children"
          size="xs" variant="outline-secondary"
          :aria-expanded="node.data.opened ? 'true' : 'false'" :aria-controls="'collapse-' + node.id"
          :class="node.data.opened ? 'not-collapsed' : 'collapsed'" class="ml-2"
          @click.stop="node.data.opened = !node.data.opened"
        >
          <span class="sr-only">{{ toggleText }}</span>
          <icon iname="chevron-right" />
        </b-button>
      </b-list-group-item>

      <b-collapse
        v-if="node.children" :key="'collapse-' + node.id"
        v-model="node.data.opened" :id="'collapse-' + node.id"
      >
        <recursive-list-group
          :tree="node"
          :last="last !== undefined ? last : i === tree.children.length - 1" flush
        >
          <!-- PASS THE DEFAULT SLOT WITH SCOPE TO NEXT NESTED COMPONENT -->
          <template slot="default" slot-scope="scope">
            <slot name="default" v-bind="scope" />
          </template>
        </recursive-list-group>
      </b-collapse>
    </template>
  </b-list-group>
</template>

<script>
export default {
  name: 'RecursiveListGroup',

  props: {
    tree: { type: Object, required: true },
    flush: { type: Boolean, default: false },
    last: { type: Boolean, default: undefined },
    toggleText: { type: String, default: null }
  },

  methods: {
    getClasses (node, i) {
      const children = node.height > 0
      const opened = children && node.data.opened
      const last = this.last !== false && (!children || !opened) && i === this.tree.children.length - 1
      return { collapsible: children, uncollapsible: !children, opened, last }
    }
  }
}
</script>

<style lang="scss" scoped>
.list-group {
  .collapse {
    &:not(.show) + .list-group-item {
      border-end-start-radius: $border-radius;
    }
    &.show + .list-group-item {
      border-start-start-radius: $border-radius;
    }

    + .list-group-item {
      border-block-start-width: 1px !important;
    }
  }

  &-item {
    &-action {
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: unset;
    }

    &.collapsible.opened {
      border-end-start-radius: $border-radius;
    }
    &.collapsible:not(.opened, .last) {
      border-block-end-width: 0;
    }

    &.last {
      border-block-end-width: $list-group-border-width;
      border-end-start-radius: $border-radius;
    }
  }

  &-flush .list-group-item {
    margin-inline-start: calc(1rem * var(--depth));
    border-inline-end: $list-group-border-width solid $list-group-border-color;
    border-inline-start: $list-group-border-width solid $list-group-border-color;
    text-decoration: none;
    background-color: $list-group-hover-bg;

    @include hover-focus() {
      background-color: darken($list-group-hover-bg, 3%);
    }
  }
}
</style>
