<template>
  <view-base v-bind="$attrs" v-on="$listeners" :skeleton="skeleton">
    <slot v-if="hasCustomTopBar" name="top-bar" slot="top-bar" />
    <template v-if="!hasCustomTopBar" #top-bar-group-left>
      <b-input-group class="w-100">
        <b-input-group-prepend is-text>
          <icon iname="search" />
        </b-input-group-prepend>

        <b-form-input
          id="top-bar-search"
          :value="search" @input="$emit('update:search', $event)"
          :placeholder="$t('search.for', { items: $tc('items.' + itemsName, 2) })"
          :disabled="!items"
        />
      </b-input-group>
    </template>
    <slot v-if="!hasCustomTopBar" name="top-bar-buttons" slot="top-bar-group-right" />

    <slot name="top" slot="top" />

    <template #default>
      <b-alert v-if="items === null || filteredItems === null" variant="warning">
        <slot name="alert-message">
          <icon iname="exclamation-triangle" />
          {{ $t(items === null ? 'items_verbose_count' : 'search.not_found', { items: $tc('items.' + itemsName, 0) }) }}
        </slot>
      </b-alert>

      <slot v-else name="default" />
    </template>

    <slot name="bot" slot="bot" />

    <slot name="skeleton" slot="skeleton" />
  </view-base>
</template>

<script>
export default {
  name: 'ViewSearch',

  props: {
    items: { type: null, required: true },
    itemsName: { type: String, required: true },
    filteredItems: { type: null, required: true },
    search: { type: String, default: null },
    skeleton: { type: String, default: 'list-group-skeleton' }
  },

  computed: {
    hasCustomTopBar () {
      return 'top-bar' in this.$slots
    }
  }
}
</script>
